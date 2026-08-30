# 04 — ④ figures_latest (`processing/figures_latest.py`)

```
   figures where fetched_at ≥ now − LOOKBACK_DAYS (30), order by as_of desc
        │
        ▼
   pick_latest(): for each (publisher, metric, scope) keep the row with the newest as_of,
                  ties broken by newest fetched_at
        │
        ▼
   figures_latest (primary key publisher, metric, scope):
        value, as_of, url, note, computed_at = now          ← merge upsert
```

The home page's side-by-side table reads this table for publishers `NDRRMA`, `Nepal Police`,
`MoFA`, `Dept of Tourism`, `OPMCM portal` × metrics `dead`, `missing`, `rescued` (and the
foreigner/tourist variants such as `foreigners_missing`, `foreigners_found`), each with its
`as_of` for the "as of 29 Aug 18:30" caption. Wave 1 fills NDRRMA (sitreps), MoFA, OPMCM portal
plus DHM via BIPAD, DHM, Open-Meteo (ECMWF), USGS, GDACS, HOT OSM; Nepal Police and Dept of
Tourism appear once their wave-2 sources have normalisers.

`v_live_counts.last_processed_at` = `max(computed_at)` of this table — the site's stale banner
watches it, so ④ running is what makes a run "count".

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| `figures` (30-day window) | `figures_latest` (upsert) | `figures_latest.done` (rows, publishers) |

## `*_quoted` metrics are context, never headlines

Wave-4 sources (NRCS situation updates, ReliefWeb reports) emit numbers *as written in third-party reports* with the
metric suffix `_quoted` (`dead_quoted`, `missing_quoted` …). They flow into `figures` / `figures_latest` like any
figure, but: `stats.is_headline_metric()` filters them out of every candidate list (`tests/test_quoted_guard.py`), the
digest shows them only as one labelled "As quoted by …" bullet (`kind: context`), and the web's column candidates and
stat cards may not name them (`web/tests/quoted-guard.test.ts`).

## Failure behaviour

One try/except (`figures_latest.failed`); the previous rows stay. Rows for a
(publisher, metric, scope) that stops being published are not deleted — their `as_of` simply
ages, which the site shows.
