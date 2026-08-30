# 10 — ⑧ timeline + ⑨ trends (`processing/timeline.py`, `processing/trends.py`, `processing/_series.py`)

Both steps build the "what happened, day by day" picture from data the earlier steps already store.
Neither calls the model; every sentence is a template in EN / NE / HI with Latin digits.

```
   figures (NDRRMA national, 30 d) ─▶ _series.daily_last()  one point per NPT day = the day's LAST published value
                                              │
             ┌────────────────────────────────┴────────────────────────────────────┐
             ▼                                                                     ▼
   ⑧ timeline.py                                                         ⑨ trends.py
   r<YYYYMMDD>_ndrrma     "NDRRMA situation report: 675 dead (+96),        figure_series (publisher, metric, scope, day,
                           2,498 out of contact (+574), 7,514 rescued      value, as_of, url) — every publisher × metric
                           (+3,063)"                        kind=response  × scope, all NPT days in the last 30 d,
   r<YYYYMMDD>_towers     "145 of 198 damaged telecom towers back on air"  future-dated (forecast) rows excluded.
                           only on days the number moved    kind=response  Upsert on the primary key → idempotent.
   r<YYYYMMDD>_phones_<p> "Syabrubesi: phones working again" — first
                           place_status row with telecom_restored=true;
                           dated from "yes (since 28 Aug)"  kind=response
   g<YYYYMMDD>_<gauge>_silent / _back   corridor gauge's last reading
                           before ≥ 2 h of silence (after the event day —
                           the 26 Aug deaths are seeded) / first reading
                           after a gap ≥ 24 h                kind=gauge
   w<YYYYMMDD>_barrier_lake headline that says a barrier / glacial lake
                           breached · overtopped · burst, dated by
                           published_at (undated articles skipped; one per
                           day; skipped when a row on that day already
                           mentions the lake — the seeded d2_breach) kind=warning
             │
             ▼
   event_timeline  upsert on id (the seeded t0837_collapse … d3_ut1_rescue rows are never touched)
```

## `figure_series` (db/migrations/007_series.sql)

| column | meaning |
|---|---|
| `publisher, metric, scope` | as in `figures` (`scope` defaults to `national`) |
| `day` | Asia/Kathmandu calendar day of `as_of` |
| `value` | the last value the publisher stated that day (a sitrep at 18:30 supersedes one at 09:00) |
| `as_of`, `url` | of that value |

Public (`anon` select, like `stats`). The site reads it for "since yesterday" deltas and sparklines; the
RAW `figures` table stays private. Apply with `pipeline/.venv/bin/python db/apply.py --only migrations`
from `data_aggregator/`.

**Why last-of-day, not first-of-day.** NDRRMA published two sitreps on 27 Aug (165 dead at 09:16, 389 at 10:00);
the number a reader — and the day-over-day delta — wants is the day's final state. The same rule drives
⑤ `rescued_per_day` and ⑧'s deltas, so the three never disagree.

## Inputs → tables → outputs

| step | reads | writes | log |
|---|---|---|---|
| ⑧ | `figures` (NDRRMA national), `place_status` (telecom_restored), `gauges` (corridor stations), `articles` (lake headlines), `event_timeline` (existing rows), `places` | `event_timeline` (upsert on id) | `timeline.done` (rows, new, kinds) |
| ⑨ | `figures` (30 d, as_of ≤ now) | `figure_series` (upsert) | `trends.done` (rows, series, multi_day) |

## Failure behaviour

One try/except each (`timeline.failed`, `trends.failed`); the other step still runs. A `place_id` that is
not in the gazetteer is nulled before the upsert (FK). Re-runs are idempotent: ids are date + subject, and
`figure_series` rows are keyed by day. `--dry-run` computes and writes nothing.
