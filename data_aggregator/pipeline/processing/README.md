# processing — one module per process_data step

| step | module | doc | reads | writes |
|---|---|---|---|---|
| ⓪ | `anonymise.py` | `docs/process_data/00-anonymise.md` | `reports_archive`, `raw_pulls` (OPMCM), `places` | `reports_anon`, `reports_archive.{anonymised_at,status,summary_public}`, `figures`, `raw_pulls.projected_at` |
| ① | `resolve_places.py` | `01-resolve-places.md` | `articles`, `reports_anon`, `places` | `articles.{places,extracted}`, `reports_anon.place_id` |
| ② | `dedup.py` | `02-dedup.md` | `reports_anon`, `raw_pulls` (OPMCM, NDRRMA) | `entities`, `entity_events`, `dedup_queue`, `reports_archive.status='matched'` |
| ③ | `ledger.py` | `03-ledger.md` | `places`, `reports_anon`, `entities`, `figures`, `articles`, `v_gauges_latest` | `place_status`, `place_timeline` |
| ④ | `figures_latest.py` | `04-figures-latest.md` | `figures` (30 d) | `figures_latest` |
| ⑤ | `stats.py` + `report_counts.py` | `05-stats.md` | `reports_archive` (counts), `v_place_status_latest`, `v_gauges_latest`, `figures`, `v_live_counts`, `reports_anon` | `stats`, `report_counts` |
| ⑥ | `findings.py` | `06-findings.md` | OPMCM/NDRRMA projections, `entities`, `v_sources_status` | `findings` |
| ⑦ | `digest.py` | `07-digest.md` | `figures_latest`, `figures`, `place_status`, `gauges`, `articles` | `digest` (day × en/ne/hi), `event_timeline` (kind=response) |

`process_data.py` runs them in order, then sets `reports_archive.status` `anonymised → processed`.

## Contract

```python
def run(ctx: ProcCtx) -> dict   # small JSON-able summary; never raises for data problems → {"error": "…"}
```

`ProcCtx` (`processing/__init__.py`):

| field | what |
|---|---|
| `db` | `lib.db.Db` |
| `gaz` | `lib.places.Gazetteer` (loaded from the `places` table) |
| `llm` | `lib.llm.LLM` (budget guard, per-run cap shared by all steps) |
| `state` | `lib.state.State` |
| `dry_run` | compute, write nothing (⓪ still calls the model) |
| `now` | one timestamp for the whole run (`as_of` / `computed_at`) |
| `cache` | cross-step memo, e.g. `cache["opmcm_items"]` filled by ⓪, reused by ② and ⑥ |

Pure, unit-tested parts: `dedup.score/decide/blocks/cluster/entity_from_cluster`,
`ledger.expected_count/confirmed_count/unknown_count/status_label/phones_from_articles/nearest_gauge_label/tpl`,
`anonymise.to_anon_row/fallback_extraction/anonymise_one`, `figures_latest.pick_latest`,
`report_counts.counts`, `findings.name_collision`.

## Running

```
.venv/bin/python process_data.py                  # all steps + finaliser
.venv/bin/python process_data.py --step 3 --step 4   # only ③ and ④ (finaliser runs when a step ≥ 6 is included)
.venv/bin/python process_data.py --dry-run --verbose
```

Each step logs `process.step step=N name=… seconds=… result={…}`; the script prints one JSON
summary (per-step results + `llm` spend) and exits 0 unless the database is unreachable (2).

## Maintenance: `purge_irrelevant.py`

Not a numbered step. `process_data.py --purge-irrelevant` deletes stored `articles` rows that fail the
relevance gate (`normalisers/_rss.is_relevant`) plus their `place_timeline` rows, then exits. Idempotent.
