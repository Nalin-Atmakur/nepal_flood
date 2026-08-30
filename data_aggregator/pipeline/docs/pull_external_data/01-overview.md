# 01 — pull_external_data.py: overview

**Purpose.** Bring every pollable external source into the database, verbatim (ARCHIVE) and
normalised (RAW), on a cadence, without ever writing a name, phone, passport number or photo
outside `raw_pulls`. It is the only writer of `raw_pulls`, `pulls`, `figures`, `gauges`,
`articles` (except step ⓪'s OPMCM projection into `figures`).

```
            sources.yaml                      _state.json
            (51 entries)                      sources.<id>: last_fetch_at, last_ok_at,
                 │                                          etag, last_modified, body_hash, seen
                 ▼                                          │
   ┌── for each source ──────────────────────────────────────┼────────────────────────────┐
   │  02  due?   cadence(minutes) vs last_fetch_at           │   --force / --only override │
   │  03  expand url(s): list · {a|b|c} · {n} pages · site table (Open-Meteo)              │
   │      fetch: UA, 20 s, 2 retries, If-None-Match / If-Modified-Since on single-url src  │
   │      prestore() if the normaliser defines it (strip photos, hash names)               │
   │      raw = body (1 part) | envelope {"__parts__":[…]} (n parts) · sha256              │
   │      raw_pulls ← {source_id, fetched_at, http_status, bytes, unchanged, body_hash,    │
   │                   body | storage_path}     pulls ← {ok, unchanged, raw_pull_id, error}│
   │  04  if changed (or --force) and a normaliser exists:                                 │
   │      normalise(raw, fetched_at, source, ctx) → NormalisedRows                         │
   │      upsert figures (publisher,metric,scope,as_of,value) · gauges (station_id,        │
   │      observed_at) · articles (url, ignore duplicates) · unresolved place_hints → jsonl │
   │      state.record_fetch(...); state.save()                                            │
   └───────────────────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
   stdout: JSON summary {mode, ran, ok, failed, sources:[{source, ok, unchanged, rows, error, seconds}]}
   run.log: one structured line per event
```

## Inputs → tables → outputs

| inputs | tables written | other outputs |
|---|---|---|
| `../sources.yaml` (`sources:` list; ids, `url` string or list, `family`, `cadence`, `auth`) | `raw_pulls` (ARCHIVE), `pulls` (RAW log) | `_state.json` per-source memory |
| `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | `figures`, `gauges`, `articles` (RAW) | `snapshots/place_hints.jsonl` (unresolved location strings) |
| `places` table (gazetteer for scope resolution; CSV / built-in fallback) | Storage bucket `raw` for bodies > 2 MB and NDRRMA PDFs | `run.log`, stdout JSON |

## Flags

| flag | effect |
|---|---|
| `--only <id>` (repeatable) | run only these sources, regardless of cadence |
| `--force` | ignore cadence and body hashes: fetch, store and normalise everything |
| `--dry-run` | fetch and normalise, write nothing (no DB, no `_state.json`, no snapshots) |
| `--local` | local-only mode even when `SUPABASE_URL` is set |
| `--verbose` | debug log level (`pull.not_due` lines appear) |

## Modes

- **db** — `SUPABASE_URL` set and `db.ping()` succeeds: everything goes to the database.
- **local** — `SUPABASE_URL` unset, `--local`, or the ping fails: raw bodies go to
  `snapshots/<id>/<ts>.<ext>`, normalised rows to `snapshots/<id>/<ts>.normalised.json`;
  `_state.json` is still updated.
- **dry-run** — nothing is written anywhere.

## Failure behaviour

Every source runs inside its own try/except (`Runner.run_source`): a crash logs
`pull.source_crashed`, writes a `pulls` row with `ok=false, error=…`, records the failed fetch
in `_state.json` and moves on. Wave-2 sources without a normaliser still get `raw_pulls` and
`pulls` rows (`normaliser=none` in the summary). The script exits 0 unless it crashes before
the loop (bad YAML, unreadable `.env`).
