# 05 — ⑤ stats + report_counts (`processing/stats.py`, `processing/report_counts.py`)

The striking numbers on the home page. Every row renders as **one big value (≤ 14 characters) + a caption**,
in EN / NE / HI, with `as_of` and `source_url`. Four rows are static (seeded from the design's Home v3
renderVals, each with its source); everything else is recomputed from the database every run. A row that
cannot be computed this run keeps its previous value (upsert on `id`; each block is guarded on its own).

```
   STATIC (4)                                   LIVE — computed every run (id → example value · caption, EN)
   ──────────────────────────────────────────   ──────────────────────────────────────────────────────────────────────────────
   wave_time_to_port     "7 minutes"  NDRRMA    days_since_event          "Day 4"        since the glacier collapse at 08:37 NPT on 26 Aug
   wave_speed            "~193 km/h"  ICIMOD    rescued_total_ndrrma      "7,514"        people rescued so far, per NDRRMA's latest sitrep
   galchhi_rise          "9 m in 30 min" DHM    rescued_per_day           "+3,063"       more rescued than the previous day's report (28 Aug → 29 Aug)
   bodies_downstream_km  "240 km"     Police    bodies_by_district_top    "246"          of 675 bodies (36%) were recovered in Chitwan … only 13 in Rasuwa itself
                                                missing_counts_divergence "3 numbers"    different “missing” figures from 3 agencies — from 2,400 (MoFA) to 10,823 (OPMCM portal)
                                                missing_hydropower        "933"          of the 2,498 out of contact are hydropower-project workers
                                                towers_restored           "145 of 198"   damaged telecom towers back on air (else "N places" from the ledger)
                                                heli_flights              "261"          helicopter sorties flown since 26 Aug
                                                personnel_deployed        "15,224"       army, police and APF personnel deployed
                                                places_reached            "1 of 64"      tracked places where everyone reported is accounted for; 63 still have people missing
                                                places_with_unknown       "63"           places where people are still unaccounted for
                                                gauges_alive              "4 of 11"      corridor river gauges still reporting
                                                next_flying_window        "30 Aug 06–11" next good morning flying window (forecast) at Dhunche  ·  "none in 3 days"
                                                reports_total             "412 people"   have added what they know on this site
                                                reports_last_hour         "3"            reports added in the last hour
                                                submissions_today         "12"           contributions submitted today (Nepal time)
                                                duplicates_merged         "2,338"        people appear on more than one list — merged into a single record here
                                                last_pull                 "11"           minutes since the last data pull
        └──────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┘
                                                       ▼
                        stats (id, value, numeric, caption_en/ne/hi, source_url, as_of, computed_at)   ← upsert on id

   reports_anon (created_at, respondent_type, place_id)
        ▼
   report_counts (bucket = hour UTC, respondent_type, place_id | 'unresolved', n)                       ← upsert on the key
```

## Where each live number comes from

| id | computed from | as_of / source_url |
|---|---|---|
| `days_since_event` | NPT date − 26 Aug 2026 (`config.EVENT_START_UTC`) | run time · `/about` |
| `rescued_total_ndrrma`, `rescued_per_day` | `figures` NDRRMA national `rescued`, one point per NPT day (`_series.daily_last`, the day's last sitrep); delta = latest day − previous day | sitrep `as_of` · sitrep url |
| `bodies_by_district_top` | NDRRMA `dead` scoped `district:*` on the newest district day; share = ÷ national `dead`; Rasuwa's own count appended when present | sitrep |
| `missing_counts_divergence` | `figures_latest` national: one missing-type figure per agency (`MISSING_CANDIDATES`: NDRRMA `missing`, Nepal Police `missing`, MoFA `missing`/`foreigners_missing`, Dept of Tourism / NTB `tourists_missing`, OPMCM `lost_open`; "(via press)" rows stand in for the agency). Static "5 numbers" row when < 2 agencies | newest `as_of` among them · `/about` |
| `missing_hydropower` | NDRRMA `missing` scoped `category:hydropower_projects`, same day as the national figure | sitrep |
| `towers_restored` | NDRRMA `telecom_towers_restored` (of `telecom_towers_damaged`); fallback: count of `v_place_status_latest.telecom_restored` | sitrep · `/places` |
| `heli_flights`, `personnel_deployed` | NDRRMA `heli_flights_total`, `personnel` | sitrep |
| `places_reached`, `places_with_unknown` | `v_place_status_latest`: tracked = expected > 0 or confirmed > 0 or reports > 0; reached = unknown = 0 | run time · `/places` |
| `gauges_alive` | `v_gauges_latest` ∩ `config.CORRIDOR_GAUGES` with alive | run time · BIPAD |
| `next_flying_window` | first `flying_window_quality*` figure = 1 with as_of ≥ today (site in the caption) | run time |
| `reports_total`, `reports_last_hour` | `reports_archive` counts (not withdrawn, not spam) | run time · `/report` |
| `submissions_today`, `last_pull` | `v_live_counts` | run time / last pull |
| `duplicates_merged` | `dedup.merge_stats` — entities with `merged_from` > 1 | run time · `/about` |

Captions are templates (`{n}` placeholders) in `CAPTIONS`; numbers stay in Latin digits in all three
languages (design rule). `fit()` trims any value over 14 characters and logs `stats.value_too_long`.

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| `reports_archive` (counts only), `figures`, `figures_latest`, `v_place_status_latest`, `v_gauges_latest`, `v_live_counts`, `entities` (via ②'s cache), `reports_anon` | `stats` (upsert), `report_counts` (upsert) | `stats.done` (one key per live stat), `stats.part_failed` (one block), `report_counts.done` |

`report_counts` has exactly the columns `bucket, respondent_type, place_id, n, computed_at` —
it is public and must never grow another column.

## Failure behaviour

Each live block (`site_counts`, `ndrrma`, `divergence`, `places`, `gauges`, `flying`, `duplicates`) is wrapped
on its own: a failure logs `stats.part_failed` and the other rows are still written. `stats.failed` /
`report_counts.failed` are logged separately; the other half still runs. A withdrawn report leaves
`reports_total` on the next run and never enters `report_counts`.
