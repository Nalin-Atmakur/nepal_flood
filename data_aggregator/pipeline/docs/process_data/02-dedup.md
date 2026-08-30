# 02 — ② dedup / entity resolution (`processing/dedup.py`)

```
   form_records      reports_anon                     {source:'form',   external_id:id,  person_key, key_strength:'phone'|None,
                                                        group_key, nationality, age_band, sex, place_id, status, at}
   opmcm_records     latest OPMCM keyed projection    {source:'opmcm',  external_id:_id, person_key, key_strength:'passport'|'name',
                     (ctx.cache or raw_pulls)           nationality, age_band, sex, place_id ← resolve(locationText), status: lost|found|rescued, at}
   ndrrma_records    latest NDRRMA persons projection {source:'ndrrma', external_id:id,  person_key, key_strength:'name',
                     (raw_pulls, rescued-persons parts) nationality, age_band, sex, place_id ← resolve(rescued_location|remarks_place), status:'rescued', at}
        │
        ▼
   blocks()   person_key ▸ group_key ▸ (nationality, age_band)        (blocks > 400 records are skipped)
        │
        ▼
   score(a, b) for every pair inside a block ─▶ decide(): merge ≥ 0.9 · queue 0.6–0.9 · distinct < 0.6
        │
        ▼
   cluster()  union-find over merges ─▶ clusters + grey-zone pairs
        │
        ├─▶ entities      one per keyed cluster (upsert on id; existing rows found by person_key)
        ├─▶ entity_events one per source record (deleted and re-created for the touched entities)
        ├─▶ dedup_queue   grey pairs {a_ref, b_ref, score, reason}, deduplicated against open rows, ≤ 500/run
        └─▶ reports_archive.status = 'matched' for form rows in a multi-source cluster
```

## Scoring matrix (`score()`, pure, `tests/test_dedup.py`)

| evidence | score |
|---|---|
| same `person_key`, strength phone or passport | **1.0** |
| same `person_key` built from name + age band + nationality (hash equal) | **0.9** |
| `name_key` Jaro-Winkler ≥ 0.85 **and** same age band **and** same nationality (only when raw name keys are in memory — never from the DB) | `0.6 + 0.3 · (jw − 0.85) / 0.15` → 0.6 … 0.9 |
| same `group_key` and same `place_id` | +0.1 |
| conflicting `sex` | −0.5 |
| age bands ≥ 2 apart (`0-17` vs `40-64` …) | −0.5 |
| no key overlap | 0.0 |

Result clamped to [0, 1]. Thresholds: `DEDUP_MERGE_THRESHOLD = 0.9`, `DEDUP_QUEUE_THRESHOLD =
0.6`. Why 0.9 for a name-hash match: name + age band + nationality all equal is the strongest
evidence available once names are hashed; conflicting sex still pulls it to 0.4 (distinct).

## Entity from a cluster (`entity_from_cluster`)

- `status` = the record with the highest `STATUS_RANK` (rescued/stationed 6 · deceased 5 ·
  reported_safe/found 4 · seen 3 · missing/lost/open 2 · unknown 0), latest `at` breaking ties;
  `lost`/`open` → `missing`, `found` → `reported_safe`.
- `status_as_of`, `status_source` from that record; `probable_place_id` = its place, else the
  last known place; `last_place_id` / `last_contact_at` from the records in time order;
  `probable_confidence` 0.9 for multi-record clusters, 0.6 for singletons;
  `merged_from` = `[{source, external_id, status}]`.
- Only clusters with a `person_key` become entities (nothing to key on otherwise; those reports
  still count in ③ through `reports_anon`).

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| `reports_anon`, `raw_pulls` (OPMCM + NDRRMA projections), `places` | `entities` (upsert), `entity_events` (replace per entity), `dedup_queue` (insert new), `reports_archive.status='matched'` | `dedup.clustered` (records, clusters, merged, queued) |

## Skip guard (the scheduler runs ② every 4 h; ~13k records take a few minutes)

`input_hash(records)` — sha256 over every input record's `source | external_id | status | place_id | person_key`,
order-insensitive — is stored in `_state.json["dedup"]` after a written run. On the next run, when the hash is
identical **and** `entities` is non-empty, ② logs `dedup.unchanged` and returns `{"skipped": …, "stats": …}` without
the pairwise pass or any write (③ reads the previous entities, which are by definition still right). A new report, a
new OPMCM/NDRRMA pull, a status or place change all change the hash. `DEDUP_FORCE=1` in the environment forces a
full pass; `--dry-run` never records a hash.

## Measurement (`merge_stats`)

After writing, ② measures itself and memoises the result in `ctx.cache["dedup_stats"]` (⑤ `duplicates_merged`
and ⑥ `duplicate_rate` read it; the step result carries it as `stats`):

| field | meaning |
|---|---|
| `entities` | rows in `entities` |
| `merged` | entities whose `merged_from` holds > 1 record (the same person on several lists or several reports) |
| `merge_rate` | `merged / entities` |
| `cross_source` | merged entities whose records come from ≥ 2 different sources (form / opmcm / ndrrma) |
| `by_source_pair` | `{"ndrrma+opmcm": n, "form+opmcm": n, "opmcm": n, …}` |
| `queue_open` | `dedup_queue` rows with no decision yet |

**Why re-runs never double-count.** `merged_from` is rebuilt from the cluster on every run (never appended);
`entity_events` for a touched entity are deleted and re-created; grey pairs are only queued while no open
identical pair exists; entities are found by `(person_key, sex, age_band)` before insert. `merge_stats_from`
is pure and `tests/test_dedup.py::test_merge_stats_and_idempotent_rebuild` pins the rebuild.

## Failure behaviour

The whole step is one try/except (`dedup.failed`), returning `{"error"}` — ③ then runs on the
previous run's entities. `--dry-run` clusters and reports counts without writing. A missing
OPMCM/NDRRMA pull just means fewer records.
