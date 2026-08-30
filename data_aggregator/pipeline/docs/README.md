# pipeline/docs — index

One numbered file per stage; the number matches the code (`processing/anonymise.py` ↔
`process_data/00-anonymise.md`). Each file has the stage diagram, inputs → tables → outputs,
and what happens when it fails.

## pull_external_data.py

| # | file | stage |
|---|---|---|
| 01 | [pull_external_data/01-overview.md](pull_external_data/01-overview.md) | purpose, flow, inputs → outputs |
| 02 | [pull_external_data/02-scheduling.md](pull_external_data/02-scheduling.md) | cadence per source, `_state.json`, cron, `PULL_INTERVAL_MINUTES` |
| 03 | [pull_external_data/03-fetching.md](pull_external_data/03-fetching.md) | `lib/http.py`, url expansion, pagination, `raw_pulls` + `pulls` |
| 04 | [pull_external_data/04-normalising.md](pull_external_data/04-normalising.md) | normaliser contract, dispatch, upsert keys, PII stripping |
| 05 | [pull_external_data/05-sources.md](pull_external_data/05-sources.md) | the 13 wave-1 normalisers, one section each |
| 05a | [pull_external_data/05a-sources-wave2-official.md](pull_external_data/05a-sources-wave2-official.md) | wave 2 — 12 official/government sources |
| 05b | [pull_external_data/05b-sources-wave2-geospatial-text.md](pull_external_data/05b-sources-wave2-geospatial-text.md) | wave 2 — 14 geospatial + text sources |
| 05c | [pull_external_data/05c-sources-wave3.md](pull_external_data/05c-sources-wave3.md) | wave 3 — the last 12 ids (help requests, hydrograph, bridges, extents, listings, catalogues) |
| 05d | [pull_external_data/05d-sources-wave4.md](pull_external_data/05d-sources-wave4.md) | wave 4 — beyond the catalogue: NRCS situation-update PDFs, BIPAD incident/loss records, 7 more feeds (ICIMOD, INSEC, Radio Nepal…), ReliefWeb full reports; the probed-and-rejected list |
| 06 | [pull_external_data/06-adding-a-source.md](pull_external_data/06-adding-a-source.md) | numbered steps |
| 07 | [pull_external_data/07-failure-modes.md](pull_external_data/07-failure-modes.md) | what breaks, what happens, where to see it |

## process_data.py

| # | file | step | module |
|---|---|---|---|
| 00 | [process_data/00-anonymise.md](process_data/00-anonymise.md) | ⓪ | `processing/anonymise.py` |
| 01 | [process_data/01-resolve-places.md](process_data/01-resolve-places.md) | ① | `processing/resolve_places.py` |
| 02 | [process_data/02-dedup.md](process_data/02-dedup.md) | ② | `processing/dedup.py` |
| 03 | [process_data/03-ledger.md](process_data/03-ledger.md) | ③ | `processing/ledger.py` |
| 04 | [process_data/04-figures-latest.md](process_data/04-figures-latest.md) | ④ | `processing/figures_latest.py` |
| 05 | [process_data/05-stats.md](process_data/05-stats.md) | ⑤ | `processing/stats.py` + `report_counts.py` |
| 06 | [process_data/06-findings.md](process_data/06-findings.md) | ⑥ | `processing/findings.py` |
| 07 | [process_data/07-digest.md](process_data/07-digest.md) | ⑦ | `processing/digest.py` |
| 08 | [process_data/08-llm-budget.md](process_data/08-llm-budget.md) | — | `lib/llm.py` |
| 09 | [process_data/09-failure-modes.md](process_data/09-failure-modes.md) | — | all steps, test data |
| 11 | [process_data/11-place-now.md](process_data/11-place-now.md) | ⑩ | `processing/place_now.py` |

Also: [../lib/README.md](../lib/README.md) · [../normalisers/README.md](../normalisers/README.md) ·
[../processing/README.md](../processing/README.md) · the schema in `../../db/migrations/00{1..5}_*.sql`.

## How the two scripts hand off through the database

There is no queue, no file and no RPC between the scripts: the database *is* the interface.

```
  ZONE      table / view            written by                      read by
  ───────── ─────────────────────── ─────────────────────────────── ───────────────────────────────
  ARCHIVE   reports_archive         website form (insert), ⓪ (anonymised_at, status, summary_public),
                                    ② (status='matched'), finaliser (status='processed'),
                                    owner (withdrawn_at)            ⓪, ⑤ (counts only), owner (own rows)
  ARCHIVE   raw_pulls               pull (body / storage_path)       ⓪ (OPMCM projection → projected_at),
                                                                    ② ⑥ (latest OPMCM / NDRRMA projections)
  ARCHIVE   users, submissions_log  website                          v_live_counts
  RAW       pulls                   pull (one row per attempt)       v_sources_status, ⑥ (stale_source)
  RAW       figures                 pull (normalisers), ⓪ (OPMCM)   ③ ④ ⑤
  RAW       gauges                  pull (bipad_river_stations)      ③ ⑤ via v_gauges_latest, site
  RAW       articles                pull (rss, dhm, mofa, ndrrma)    ① (places, extracted), ③
  RAW       reports_anon            ⓪ (insert), ① (place_id)        ② ③ ⑤ (report_counts)
  RAW       places, sources         seeds (other lanes)              everything (gazetteer, FK)
  DERIVED   entities, entity_events, dedup_queue   ②                 ③ ⑥            (private)
  DERIVED   place_status, place_timeline           ③                 ⑤, site        (public)
  DERIVED   figures_latest                          ④                 site           (public)
  DERIVED   stats, report_counts                    ⑤                 site           (public)
  DERIVED   findings                                ⑥                 list-holders   (private)
  views     v_live_counts · v_articles_recent · v_place_status_latest · v_sources_status · v_gauges_latest
```

Zones (from `db/migrations`): **ARCHIVE** = verbatim, may hold PII, service role + owner only;
**RAW** = normalised and anonymised, service role only except the reference tables `places`,
`sources`, `gauges`; **DERIVED** = computed by `process_data`, public except `entities`,
`entity_events`, `dedup_queue`, `findings`. Only `pull_external_data.py` writes RAW facts; only
`process_data.py` writes DERIVED. Nothing under RAW or DERIVED ever carries a name, phone,
passport number or photo.

Bookkeeping columns that make re-runs idempotent: `reports_archive.anonymised_at`,
`raw_pulls.projected_at`, `raw_pulls.unchanged` + `body_hash`, `articles.extracted`
(set even when no place matched), the primary/unique keys of every DERIVED table
(`figures_latest (publisher, metric, scope)`, `place_status (place_id, as_of)`,
`place_timeline (place_id, day, what_en)`, `stats (id)`, `report_counts (bucket, respondent_type, place_id)`).
