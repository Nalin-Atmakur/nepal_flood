# 02 — scheduling: cadence, `_state.json`, cron

```
   cron (every PULL_INTERVAL_MINUTES)          sources.yaml            _state.json
        │                                      cadence: "30m"          sources.<id>.last_fetch_at
        ▼                                          │                        │
   run.sh ─▶ pull_external_data.py ─▶ is_due(state, src, now) ◀────────────┘
                                          │
                                          ├─ cadence_minutes("30m")=30 · "2h"=120 · "10m"=10 · "daily"=1440
                                          │  "2/day (08:00, 18:00 NPT)"=720 · "static (fetch once)"=10⁹ · other=60
                                          ├─ static: due only while last_ok_at is empty
                                          └─ else: due when now − last_fetch_at ≥ cadence
```

## Cadence strings → minutes (`lib/config.cadence_minutes`)

| `sources.yaml` cadence | minutes | rule |
|---|---|---|
| `10m`, `30m`, `60m` | 10, 30, 60 | `(\d+)\s*m` |
| `2h`, `6h` | 120, 360 | `(\d+)\s*h` |
| `daily` | 1440 | starts with `daily` |
| `2/day (08:00, 18:00 NPT)` | 720 | `(\d+)/day` → 1440 / n |
| `static (fetch once)` | `STATIC_MINUTES = 10⁹` | starts with `static`; due only when never fetched OK |
| anything else / missing | `DEFAULT_CADENCE_MINUTES = 60` | |

`is_due` compares against `last_fetch_at` (any attempt, so a failing source is not retried more
often than its cadence), except static sources which look at `last_ok_at`. `--force` or `--only`
bypass the check.

## `_state.json` (`lib/state.py`)

```json
{
  "sources": {
    "opmcm_stats": {"last_fetch_at": "…Z", "last_ok_at": "…Z", "etag": null, "last_modified": null,
                    "body_hash": "sha256…"},
    "ndrrma_publications": {"…": "…", "publications": ["370", "371", "…"]}
  },
  "llm":  {"calls": 0, "prompt_tokens": 0, "completion_tokens": 0, "usd": 0.0, "history": []},
  "runs": {"pull": {"last_at": "…Z", "ok": 48, "failed": ["heoc_sitreps"]}, "process": {"last_at": "…Z", "llm_usd": 0.0}}
}
```

Written atomically (temp file + rename) after every source. Deleting the file is safe: the next
run re-fetches everything (static sources included) and re-downloads NDRRMA PDFs (idempotent
because Storage uploads use `x-upsert`).

## Cron and `PULL_INTERVAL_MINUTES`

```
0 */4 * * *   cd /path/to/data_aggregator/pipeline && ./run.sh >> run.log 2>&1     # tonight
*/15 * * * *  cd /path/to/data_aggregator/pipeline && ./run.sh >> run.log 2>&1     # live phase
```

`PULL_INTERVAL_MINUTES` (env, default 240) is read by `lib/config.py`; the website reads the
same value for "AUTO-REFRESH EVERY N MIN" and `STALE_AFTER_MINUTES = PULL_INTERVAL_MINUTES + 45`
for the stale banner. Keep the cron line and the variable in step. Per-source cadences shorter
than the cron interval simply mean "every wake-up"; longer ones are honoured across wake-ups
via `last_fetch_at`.

## Failure behaviour

A source that failed is recorded with `last_error_at` and stays on its cadence (no hot retry —
the HTTP layer already retried twice). `_state.json` unreadable → treated as empty, logged
nothing, everything fetched once.
