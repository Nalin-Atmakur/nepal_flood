# db/ — Supabase, database only

Postgres + row-level security + one Realtime publication + two Storage buckets. No edge functions, no Supabase cron. All logic lives in `../pipeline/` and `../web/`; this folder is the schema and the tool that applies it.

Project: `nepalfloodtracker` · ref `wnftsjvdkstfidpuqgim` · region Tokyo · free tier.

## The three zones

```
    website (anon key)                 pull_external_data (service key)
    insert own rows, verbatim          every source on its cadence
              │                                   │
              ▼                                   ▼
   ┌─────── ARCHIVE ────────┐          ┌───────── RAW ──────────┐
   │ PII; owner + service   │          │ anonymised; service    │
   │ users                  │          │ sources* places* pulls │
   │ reports_archive        │          │ figures gauges*        │
   │ raw_pulls              │          │ articles reports_anon  │
   │ submissions_log*       │          │                        │
   │ _migrations            │          │                        │
   └───────────┬────────────┘          └───────────┬────────────┘
               │      process_data ⓪ anonymise     │
               └────────────►──────────────────────┤
                                                   │ ①②③④⑤⑥
                                                   ▼
                      ┌────────────── DERIVED ──────────────┐
                      │ public:  figures_latest place_status │
                      │          place_timeline stats        │
                      │          report_counts               │
                      │ private: entities entity_events      │
                      │          dedup_queue findings        │
                      └──────────────────┬───────────────────┘
                                         │ + views v_live_counts v_articles_recent
                                         │   v_place_status_latest v_sources_status v_gauges_latest
                                         ▼
                              website (Next.js, anon key)
     * = public select
```

| Zone | Tables | Who writes | Who reads |
|---|---|---|---|
| ARCHIVE (PII, verbatim) | `users`, `reports_archive`, `raw_pulls`, `submissions_log`, `_migrations` | website (own rows), `pull_external_data`, `apply.py` | owner (own rows), `process_data` |
| RAW (normalised, anonymised) | `sources`, `places`, `pulls`, `figures`, `gauges`, `articles`, `reports_anon` | `pull_external_data`, `process_data` ⓪①, seeds | `process_data`; site reads `sources`, `places`, `gauges` + views |
| DERIVED (computed) | public `figures_latest`, `place_status`, `place_timeline`, `stats`, `report_counts` · private `entities`, `entity_events`, `dedup_queue`, `findings` | `process_data` | website (public), `process_data` (private) |

Every column: `../docs/data-model.md`. One topic per file in `docs/`:

| File | Topic |
|---|---|
| `docs/01-zones.md` | the map above, keys and roles, the four rules |
| `docs/02-archive.md` | `001_archive.sql` — submission path, status trail, withdraw, `raw_pulls`, the ledger |
| `docs/03-raw.md` | `002_raw.sql` — pull path, upsert keys, reference tables, what the anonymiser keeps |
| `docs/04-derived.md` | `003_derived.sql` — which step writes which table, the views, the site contract |
| `docs/05-rls.md` | `004_rls.sql` — policy matrix, the trigger, views-as-owner caution, tests |
| `docs/06-realtime-and-storage.md` | `005_realtime_storage.sql` — scoreboard mechanics, buckets |
| `docs/07-applying-migrations.md` | `apply.py` step by step, token resolution, checksum rule |

## What lives here

```
db/
├── README.md            this file
├── apply.py             runs migrations + seeds via the Management API; records them in _migrations
├── mgmt.py              Management API helper: token from env or the Supabase CLI keychain; query(); set_anonymous_signins()
├── migrations/          001_archive · 002_raw · 003_derived · 004_rls · 005_realtime_storage  (applied in name order; never edited after applying)
├── seed/                gen_sources.py → sources.sql (from ../sources.yaml) · gen_places.py → places.sql (from ../gazetteer/places.csv) · stats_static.sql
├── tests/               test_rls.py (anon vs service, positive + negative) · test_views.py
└── docs/                01–07 above
```

## 1. Apply migrations

1. `cp ../pipeline/.env.example ../pipeline/.env` and set `SUPABASE_PROJECT_REF` (other keys are for the pipeline).
2. Have a Management API token: `supabase login` on this Mac (kept in the keychain), or `export SUPABASE_ACCESS_TOKEN=sbp_…`.
3. `../pipeline/.venv/bin/python apply.py --dry-run` — lists what would run.
4. `../pipeline/.venv/bin/python apply.py` — runs `migrations/*.sql` then `seed/*.sql` in filename order, skipping files already in `_migrations` with the same checksum.
5. Enable anonymous sign-ins once: `../pipeline/.venv/bin/python -c "import mgmt; print(mgmt.set_anonymous_signins(True))"` (run from `db/`).

Flags: `--only migrations` · `--only seed` · `--dry-run` · `--force` (re-run a changed migration — read `docs/07` first).

## 2. Seed

1. Edit `../sources.yaml` or `../gazetteer/places.csv`.
2. `../pipeline/.venv/bin/python seed/gen_sources.py` and/or `../pipeline/.venv/bin/python seed/gen_places.py`.
3. `../pipeline/.venv/bin/python apply.py --only seed` — changed seed files re-run automatically; they are upserts.
4. `../pipeline/.venv/bin/python ../docs/gen_sources_md.py` so `../docs/sources.md` matches.

## 3. Reset

1. Take a backup (`../docs/runbook.md`, "Backups").
2. Drop the objects you need to recreate through `mgmt.query(...)` (there is no `--reset` flag on purpose).
3. `delete from _migrations where filename = '…'` for each file to re-run — or all rows for a full rebuild.
4. `apply.py` again. For a brand-new project, skip 2–3: point `SUPABASE_PROJECT_REF` at it and apply.

## 4. Run tests

1. `pipeline/.env` (service key) and `web/.env.local` (anon key) present.
2. `../pipeline/.venv/bin/python -m pytest tests -q` from `db/`.
3. `test_rls.py` must show the anon key reading `figures_latest` and being refused on `reports_anon`, `raw_pulls`, `entities`; `test_views.py` checks each `v_*` view returns rows with only the documented columns.

## 5. Add a migration

1. New file `migrations/006_<topic>.sql`; idempotent statements (`if not exists`, `create or replace`, `drop policy if exists` before `create policy`).
2. Enable RLS on new tables; add policies (or revoke) in the same file.
3. `apply.py --dry-run`, then `apply.py`.
4. Update `../docs/data-model.md` + the matching `docs/0N-*.md`; add a test; update the writer (`../pipeline/processing/`) and reader (`../web/lib/queries.ts`).
5. Commit the migration, docs and test together. Never edit `001`–`005` again.

## Rules

- Never add a policy that lets `anon`/`authenticated` select from `reports_archive` (other than own rows), `raw_pulls`, `figures`, `articles` (table), `reports_anon`, `pulls`, `entities`, `entity_events`, `dedup_queue`, `findings`, `_migrations`.
- Public reads of RAW go through views that project only safe columns.
- Schema changes are new numbered migration files; never edit an applied one (`apply.py` refuses).
- No names, phones, passport numbers or photos outside ARCHIVE — in tables, seeds, fixtures or tests.
