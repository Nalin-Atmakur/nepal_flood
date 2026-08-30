# 06 — ⑥ findings (`processing/findings.py`)

Data-quality findings for the people who hold the lists. The `findings` table is private (never
read by the site); each row is `{kind, detail jsonb, created_at, handed_to, handed_at}`. Findings
of a kind are deleted and re-inserted every run unless `handed_at` is set. Every `detail` carries
**`summary`** (one plain-English sentence to read out) and **`evidence`** (the query or figures behind it),
then the kind's own fields. Details never contain names — ids, counts, location strings only.

```
   latest OPMCM projection ──▶ name_collision        DAO Sindhupalchok rows whose location resolves to
   (ctx.cache / raw_pulls)                            bhotekoshi_rm_sindhupalchok or says Bhotekoshi/भोटेकोशी
                                                      + dao_sindhupalchok_rows, bhotekoshi_rm_rows, share_of_all_listed, sample_locations
   figures_latest (national) ▶ publisher_divergence  for dead · missing · rescued · foreigners_missing: values per publisher,
                                                      spread = max − min, low/high publisher, spread_pct_of_min (worst first)
   v_place_status_latest ────▶ unreached_by_record   places with expected > 0 and confirmed_reached = 0
                                                      + places, people, list[{place_id, name, expected, reports_count, last_contact_at, access, phones, hazard}] (≤ 100)
   dedup.merge_stats ────────▶ duplicate_rate        entities, merged, merge_rate, cross_source, by_source_pair, queue_open
   entities ────────────────▶ duplicate_across_lists entities whose merged_from spans ≥ 2 sources: by_source_pair, entity_ids (≤ 200)
   OPMCM ⋈ NDRRMA ──────────▶ lost_but_rescued       OPMCM 'lost' rows whose person_key is on the NDRRMA rescued list: count, opmcm_ids (≤ 300)
   raw_pulls setu_recordlist ▶ absent_from_setu      only when a Setu pull exists (wave 2): placeholder
   v_sources_status ────────▶ stale_source           last fetch older than 2 × max(cadence, PULL_INTERVAL_MINUTES) or last_ok = false
                                                      + sources[{source, cadence, minutes_since_fetch, limit_minutes, last_ok, error}]
```

## How a list-holder uses each

| kind | who | what to do with it |
|---|---|---|
| `name_collision` | DAO Sindhupalchok / OPMCM desk | Ask whether the Bhotekoshi-RM rows are Kerung-route workers. Until answered, ③ counts them at `bhotekoshi_rm_sindhupalchok`, **not** in the corridor — so they do not inflate Rasuwa's "unknown". |
| `publisher_divergence` | NDRRMA / MoFA / Police liaison | The `summary` names the metric with the biggest gap and the two publishers at each end. Quote it when asking agencies to reconcile; the site shows every value side by side, this tells you which pair to chase first. |
| `unreached_by_record` | sortie planners, ward chairs | The morning list: places where people are reported missing and **no official rescue or stationed count exists**. Sorted by people expected; `access` and `phones` say how to get there and whether silence is evidence. Cross-check with the research note "silence is not evidence of death". |
| `stale_source` | pipeline owner | Which feeds the site's numbers are silently older than they look; `error` says why the last pull failed. Fix or expect the stale banner. |
| `duplicate_rate` | whoever owns the master list | How much of the "missing" total is the same person counted on several lists (`cross_source`), and how many ambiguous pairs (`queue_open`) need a human decision in `dedup_queue`. |
| `duplicate_across_lists` | OPMCM ↔ NDRRMA ↔ site form | The entity ids to reconcile: each one is a person present on ≥ 2 lists under one `person_key`. |
| `lost_but_rescued` | OPMCM desk | OPMCM report ids to close: the person is on NDRRMA's verified rescued list. |
| `absent_from_setu` | wave-2 | Placeholder until the Setu normaliser lands. |

The `name_collision` check is the one the catalogue flagged: a 100-row OPMCM sample was 62 %
"DAO Sindhupalchok" with addresses in *Bhotekoshi Rural Municipality* wards 2–5 — either a
collision with the *Bhote Koshi river* (Rasuwa) or genuinely displaced Kerung-route workers.

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| OPMCM + NDRRMA projections (`raw_pulls`), `figures_latest`, `v_place_status_latest`, `entities` (②'s cache), `dedup_queue` (count), `v_sources_status`, `raw_pulls` (Setu) | `findings` | `findings.done` (kinds); the step result carries every `summary` |

## Failure behaviour

One try/except (`findings.failed`). Pure builders (`publisher_divergence`, `unreached_by_record`,
`stale_sources`, `duplicate_rate`, `name_collision`) are unit-tested in `tests/test_findings.py`.
