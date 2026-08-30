# lib — shared library for both scripts

| module | one line | cites |
|---|---|---|
| `config.py` | every constant (cadence table, HTTP limits, corridor gauges, Open-Meteo sites, flying-window rule, NDRRMA PII ids, LLM model/prices/caps, dedup thresholds) + `load_env()` | `docs/pull_external_data/02-scheduling.md`, `docs/process_data/08-llm-budget.md` |
| `net.py` | `force_ipv4()` — wraps `socket.getaddrinfo` to drop AAAA results | `docs/pull_external_data/03-fetching.md`, `07-failure-modes.md` |
| `http.py` | `get()`/`post()` → `Fetched` dataclass: browser UA, 20 s, 2 retries, ETag/If-Modified-Since, sha256, never raises | `docs/pull_external_data/03-fetching.md` |
| `db.py` | `Db` — PostgREST/Storage/Auth-admin over `requests`; `select/select_all/count/insert/upsert/update/delete`, `upsert_figures/gauges/articles`, `storage_upload/download`, `auth_admin_create_user` | `docs/pull_external_data/04-normalising.md`, `docs/process_data/09-failure-modes.md` |
| `state.py` | `State` — `_state.json` (per-source etag/hash/last fetch/seen ids, LLM ledger, runs), atomic save | `docs/pull_external_data/02-scheduling.md`, `docs/process_data/08-llm-budget.md` |
| `log.py` | structured `ts LEVEL event k=v` lines to stderr + `run.log`; every value passes `redact()` (phones, e-mails, passport-like ids, API keys) | `docs/pull_external_data/07-failure-modes.md`, `docs/process_data/09-failure-modes.md` |
| `text.py` | NFC, diacritics, Nepali digits, script/lang detection, Devanagari↔Latin, `match_key`, `slugify`, `normalise_phone`, `age_band`, `person_key`, `group_key`, `jaro_winkler`, `redact_pii` | `docs/pull_external_data/04-normalising.md`, `docs/process_data/01-resolve-places.md` |
| `places.py` | `Gazetteer` — load DB → CSV → built-in, alias index (full key + consonant skeleton + CJK substring), `resolve()`, `resolve_all()`, `resolve_ids()` | `docs/process_data/01-resolve-places.md` |
| `llm.py` | `LLM` — gpt-4o-mini structured outputs, cost ledger in `_state.json`, budget + per-run guard, `FakeClient` for tests | `docs/process_data/08-llm-budget.md` |

## Why `db.py` is a `requests` wrapper and not supabase-py

supabase-py is installed, but every call goes through httpx and hung on this laptop: `*.supabase.co`
resolves to DNS64 IPv6 addresses (`64:ff9b::…`) that never connect, and Python tries IPv6 first
(curl falls back quickly). `net.force_ipv4()` fixes the resolver for the whole process, and a
200-line PostgREST wrapper over `requests` gives explicit control of `on_conflict`,
`resolution=merge-duplicates | ignore-duplicates`, batching (500 rows) and `Prefer:
return=minimal`. The service-role key is read from the environment and never logged.

## Dedupe keys the writers rely on (`db/migrations/002_raw.sql`)

| writer | key | resolution |
|---|---|---|
| `upsert_figures` | `publisher, metric, scope, as_of, value` (`as_of` defaults to `fetched_at`; never null) | ignore duplicates |
| `upsert_gauges` | `station_id, observed_at` | merge |
| `upsert_articles` | `url` | ignore duplicates (① owns `places` / `extracted`) |
| `upsert(table, rows, on_conflict=…)` | caller-supplied | merge unless `ignore_duplicates=True`; all rows in a batch are padded to the same key set |

`Db.from_env()` returns `None` when `SUPABASE_URL` is unset — the puller's local-only mode.
