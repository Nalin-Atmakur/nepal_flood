# 05 — ⑤ stats + report_counts (`processing/stats.py`, `processing/report_counts.py`)

```
   STATIC (5, seeded from the design's Home v3 renderVals)     live (recomputed every run)
   ─────────────────────────────────────────────────────────    ────────────────────────────────────────────
   wave_time_to_port          "7 minutes"        NDRRMA        reports_total        reports_archive not withdrawn, status ≠ spam
   wave_speed                 "~193 km/h"        ICIMOD        reports_last_hour    same, created_at ≥ now − 1 h
   galchhi_rise               "9 m in 30 min"    DHM/BIPAD     places_with_unknown  v_place_status_latest where unknown > 0
   bodies_downstream_km       "240 km"           Nepal Police  gauges_alive         corridor gauges (11) alive in v_gauges_latest
   missing_counts_divergence  "5 numbers"        /about        next_flying_window   first flying_window_quality = 1 with as_of ≥ today
                                                               last_pull            minutes since v_live_counts.last_pull_at
        └──────────────────────────────┬────────────────────────────────┘
                                       ▼
                     stats (id, value, numeric, caption_en/ne/hi, source_url, as_of, computed_at)   ← upsert on id

   reports_anon (created_at, respondent_type, place_id)
        ▼
   report_counts (bucket = hour UTC, respondent_type, place_id | 'unresolved', n)                 ← upsert on the key
```

The design's sixth card ("412 people have added what they know on this site") is
`reports_total`; its value renders as `"N people"` (`"1 person"`). `next_flying_window` renders as
`"30 Aug 06–11 NPT · Dhunche"` or `"none in the next 3 days"`; `gauges_alive` as `"4 of 11"`.
Captions exist in EN / NE / HI (`LIVE_CAPTIONS`, `STATIC[*].caption_*`); numbers stay Latin.

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| `reports_archive` (counts only), `v_place_status_latest`, `v_gauges_latest`, `figures` (flying windows), `v_live_counts`, `reports_anon` | `stats` (upsert), `report_counts` (upsert) | `stats.done` (one key per live stat), `report_counts.done` |

`report_counts` has exactly the columns `bucket, respondent_type, place_id, n, computed_at` —
it is public and must never grow another column.

## Failure behaviour

`stats.failed` / `report_counts.failed` are logged separately; the other half still runs. A
withdrawn report leaves `reports_total` on the next run (the count reads `withdrawn_at is null`
live) and never enters `report_counts` (which reads `reports_anon`, where withdrawn rows are not
projected).
