# db/ — Supabase (database only)

Supabase is used as a **database only**: Postgres + row-level security + Storage + Realtime. No edge functions, no triggers, no Supabase cron. All logic lives in `../pipeline/` and `../web/`.

Project: `nepalfloodtracker` · ref `wnftsjvdkstfidpuqgim` · region Tokyo.

## Zones

| Zone | Tables | Who writes | Who reads |
|---|---|---|---|
| **ARCHIVE** (PII, verbatim) | `users`, `reports_archive`, `raw_pulls` | website (own rows), `pull_external_data` | `process_data`; users (own rows) |
| **RAW** (normalised, anonymised) | `sources`, `places`, `pulls`, `figures`, `gauges`, `articles`, `reports_anon` | `pull_external_data`, `process_data` ⓪ | `process_data`; site reads only `places`, `sources`, `gauges` + views |
| **DERIVED** (computed) | `figures_latest`, `place_status`, `stats`, `report_counts` (public) · `entities`, `entity_events`, `dedup_queue`, `findings` (private) | `process_data` | the website (public ones) |
| Live | `submissions_log`, `v_live_counts` | website | website (Realtime) |

Full column list: `../docs/data-model.md`. Access model: `migrations/004_rls.sql` — it is short; read it.

## Applying migrations

In order, in the Supabase dashboard → SQL editor (or `supabase db push` once the project is linked with its DB password):

```
001_archive.sql
002_raw.sql
003_derived.sql
004_rls.sql
005_realtime_storage.sql
```
Then seed: `seed/sources.sql` (generated from `../sources.yaml`) and `seed/places.sql` (generated from `../gazetteer/places.csv`).

Manual step the CLI cannot do: **Authentication → Sign In / Providers → Anonymous sign-ins → ON.**

## Rules

- Never add a policy that lets `anon`/`authenticated` select from `reports_archive` (other than own rows), `raw_pulls`, `figures`, `articles` (table), `reports_anon`, `entities`, `dedup_queue`, `findings`.
- Public reads of RAW go through views that project only safe columns (`v_articles_recent`, `v_gauges_latest`, `v_place_status_latest`, `v_live_counts`).
- Schema changes are new numbered migration files; never edit an applied one.
