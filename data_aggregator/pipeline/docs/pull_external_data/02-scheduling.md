# 02 — scheduling: cadence, backoff, `_state.json`, the scheduler loop

```
   scheduler (every PULL_INTERVAL_MINUTES)     sources.yaml            _state.json
        │                                      cadence: "30m"          sources.<id>.last_fetch_at · failures
        ▼                                          │                        │
   run.sh ─▶ pull_external_data.py ─▶ select_due() ─▶ is_due(state, src, now) ◀─┘
                                          │              │
                                          │              ├─ cadence_minutes("30m")=30 · "2h"=120 · "daily"=1440
                                          │              │  "2/day (08:00, 18:00 NPT)"=720 · "static (fetch once)"=10⁹ · other=60
                                          │              ├─ static + last_ok_at set → never again
                                          │              └─ else: due when now − last_fetch_at ≥ backoff_minutes(cadence, failures)
                                          │                        = cadence × 2^failures, capped at BACKOFF_CAP_MINUTES (24 h)
                                          ▼
                              ThreadPoolExecutor(PULL_WORKERS = 6)  ── prefetch(src) ×N  (network only)
                                          │  as_completed
                                          ▼
                              Runner.run_source(src, prefetched)   (main thread: prestore · hash · raw_pulls · normalise · upsert · state)
```

## Steps of one run

1. `select_due()` picks the sources: `--only a,b` wins outright; `--force` takes every source with a URL; otherwise
   `is_due()` per source. Sources without an `http(s)` URL are skipped (`pull.skip_no_url`).
2. The due list goes to a pool of `--workers` threads (default `PULL_WORKERS=6`, env-overridable). A worker only does
   network I/O (`fetch_source`) and reads the ETag / Last-Modified remembered in `_state.json`; it never writes.
3. As each fetch completes, the **main thread** does everything else for that source in completion order: `prestore()`,
   hash, `raw_pulls` + `pulls`, normalise, relevance gate, upserts, `_state.json` (saved after every source).
   So DB writes and state writes are still single-threaded — no locking anywhere.
4. `--workers 1` (or a single due source) runs the old sequential path — handy when debugging one source.

Measured on the laptop with `--force` over all 50 sources (every body fetched and normalised), 30 Aug 2026 02:35 UTC:

| | seconds |
|---|---|
| Σ fetch time of all sources (the part the pool parallelises) | 250 |
| Σ main-thread time (prestore, hash, normalise, upserts — serial) | 289 |
| sequential-equivalent (the two sums; what `--workers 1` would take on this run) | ≈ 540 |
| **wall-clock with 6 workers** | **292** |

(The 01:15 UTC sequential run of the same 50 ids took 208 s, before the wave-2B/3 normalisers that fetch
sub-pages existed.) The main thread is now the floor: `police_udb` alone spends 136 s fetching ~77 district
pages one by one *inside its normaliser* (`ctx.fetch`), `ekantipur_live` 23 s, `opmcm_person_reports` 23 s
(parsing 60 pages). Next lever, if needed: move those sub-page fetches into the source's URL list so the
pool does them (see 06-adding-a-source.md — prefer `url:` lists / `{n}` pagination over `ctx.fetch` loops).

## Cadence strings → minutes (`lib/config.cadence_minutes`)

| `sources.yaml` cadence | minutes | rule |
|---|---|---|
| `10m`, `30m`, `60m` | 10, 30, 60 | `(\d+)\s*m` |
| `2h`, `6h` | 120, 360 | `(\d+)\s*h` |
| `daily` | 1440 | starts with `daily` |
| `2/day (08:00, 18:00 NPT)` | 720 | `(\d+)/day` → 1440 / n |
| `static (fetch once)` | `STATIC_MINUTES = 10⁹` | starts with `static`; due only when never fetched OK |
| anything else / missing | `DEFAULT_CADENCE_MINUTES = 60` | |

`is_due` compares against `last_fetch_at` (any attempt), except static sources which are done
for good once `last_ok_at` is set. `--force` or `--only` bypass the check.

## Backoff (`backoff_minutes`, `_state.json` → `failures`)

| consecutive failures | wait after the last attempt | example, cadence 30m |
|---|---|---|
| 0 | cadence | 30 min |
| 1 | cadence × 2 | 60 min |
| 2 | cadence × 4 | 2 h |
| 3 | cadence × 8 | 4 h |
| ≥ 6 (30m) | `BACKOFF_CAP_MINUTES` = 24 h | 24 h |

`failures` is incremented by `State.record_fetch(ok=False)` (all parts failed, or the source crashed) and reset
to 0 by any successful fetch (a 304 counts as success). A static source that failed is retried like an hourly one
(60 min × 2^failures). `--force` ignores the backoff; `--only` too. The HTTP layer's own two retries (03-fetching)
happen inside a single attempt — backoff is about not hammering a host that is down for hours.

## `_state.json` (`lib/state.py`)

```json
{
  "sources": {
    "opmcm_stats": {"last_fetch_at": "…Z", "last_ok_at": "…Z", "etag": null, "last_modified": null,
                    "body_hash": "sha256…", "failures": 0},
    "ndrrma_publications": {"…": "…", "publications": ["370", "371", "…"]}
  },
  "llm":  {"calls": 0, "prompt_tokens": 0, "completion_tokens": 0, "usd": 0.0, "history": []},
  "runs": {"pull": {"last_at": "…Z", "ok": 48, "failed": ["heoc_sitreps"]}, "process": {"last_at": "…Z", "llm_usd": 0.0}}
}
```

Written atomically (temp file + rename) after every source. Deleting the file is safe: the next
run re-fetches everything (static sources included) and re-downloads NDRRMA PDFs (idempotent
because Storage uploads use `x-upsert`).

## The scheduler and `PULL_INTERVAL_MINUTES`

`scripts/install_schedule.sh [minutes]` (see `docs/runbook.md` §1) starts the detached loop that runs `run.sh`
every `PULL_INTERVAL_MINUTES` (240 tonight, 15 for the live phase); a plain cron line works the same on a VM:

```
0 */4 * * *   cd /path/to/data_aggregator/pipeline && ./run.sh >> run.log 2>&1     # tonight
*/15 * * * *  cd /path/to/data_aggregator/pipeline && ./run.sh >> run.log 2>&1     # live phase
```

`PULL_INTERVAL_MINUTES` (env, default 240) is read by `lib/config.py`; the website reads the
same value for "AUTO-REFRESH EVERY N MIN" and `STALE_AFTER_MINUTES = PULL_INTERVAL_MINUTES + 45`
for the stale banner. Keep the schedule and the variable in step. Per-source cadences shorter
than the interval simply mean "every wake-up"; longer ones are honoured across wake-ups
via `last_fetch_at`. `run.sh` holds a lock directory so two runs never overlap.

## Failure behaviour

A source that failed is recorded with `last_error_at`, its `failures` counter goes up and the next attempt
waits cadence × 2^failures (table above). `_state.json` unreadable → treated as empty, logged
nothing, everything fetched once. A worker thread that raises hands the exception to the main thread, where
`run_source` logs `pull.source_crashed` and records the failure like any other.
