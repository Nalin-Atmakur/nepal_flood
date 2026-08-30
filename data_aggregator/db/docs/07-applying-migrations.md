# 07 · Applying migrations — `db/apply.py`

`apply.py` runs every `.sql` file under `db/migrations/` and then `db/seed/` against the project through the Supabase Management API's query endpoint. No database password, no `supabase link`, no dashboard. It is idempotent and records what it ran in the `_migrations` table.

```
   python db/apply.py [--only migrations|seed] [--dry-run] [--force]
        │
        ▼
   mgmt.project_ref()      SUPABASE_PROJECT_REF  ← env, else pipeline/.env
   mgmt.access_token()     SUPABASE_ACCESS_TOKEN ← env, else macOS keychain "Supabase CLI"
        │
        ▼
   applied()   = select filename, checksum from _migrations        (empty dict on first run)
        │
        ▼
   for each file in sorted(migrations/*.sql) then sorted(seed/*.sql):
        │
        ├── checksum equal to ledger          →  "= already applied"           skip
        ├── in ledger but differs, migration  →  "! changed since applied"     exit 1  (unless --force)
        ├── in ledger but differs, seed       →  run again                     (seeds are upserts)
        └── not in ledger                     →  run
                  │
                  ▼
             POST /v1/projects/{ref}/database/query  {"query": <whole file>}
                  │ ok
                  ▼
             insert into _migrations (filename, checksum) … on conflict do update
```

## Step by step

1. **Prerequisites.** Python 3.11+ (the pipeline venv is fine: `pipeline/.venv/bin/python`). `pipeline/.env` exists with `SUPABASE_PROJECT_REF=<ref>` (copy `pipeline/.env.example`). No extra packages: `mgmt.py` uses `urllib` only.

2. **Token resolution** (`mgmt.access_token()`), in order:
   1. `SUPABASE_ACCESS_TOKEN` in the environment — a personal access token (`sbp_…`) from https://supabase.com/dashboard/account/tokens. Use this on a VM or in CI.
   2. Otherwise the Supabase CLI's keychain entry on macOS: `security find-generic-password -s "Supabase CLI" -a supabase -w`. The CLI stores it as `go-keyring-base64:<base64>`; `mgmt.py` strips the prefix, pads and base64-decodes to the `sbp_…` token. This is why `supabase login` on the laptop is enough — nothing is copied into a file.
   3. Neither → exit with "run `supabase login`".

   The token is sent as `Authorization: Bearer` to `https://api.supabase.com/v1` with a browser-like `User-Agent` (Cloudflare answers `error code: 1010` to the default Python UA); requests time out after 120 s. A transient `SSL: UNEXPECTED_EOF_WHILE_READING` from the API is just that — re-run. The project ref comes from `SUPABASE_PROJECT_REF` in the environment, else from `pipeline/.env` (loaded with `setdefault`, so an exported variable wins).

3. **Dry run first.**
   ```
   pipeline/.venv/bin/python db/apply.py --dry-run
   ```
   Prints each file that would run, with its size, and does not touch the database or the ledger.

4. **Regenerate seeds** when their inputs changed:
   ```
   pipeline/.venv/bin/python db/seed/gen_sources.py      # sources.yaml   → db/seed/sources.sql
   pipeline/.venv/bin/python gazetteer/to_sql.py         # gazetteer/places.csv → db/seed/places.sql
   ```
   Seed files are `insert … on conflict (id) do update`, so they are safe to run any number of times. `event_timeline.sql` is hand-written (the reconstructed first hours of 26 Aug; `process_data` ⑧ appends later rows and never overwrites seeded ids). The striking numbers are not seeded: `process_data` ⑤ computes `stats` every run.

5. **Apply.**
   ```
   pipeline/.venv/bin/python db/apply.py
   ```
   Output looks like:
   ```
   → migrations/001_archive.sql (3,912 bytes)
   → migrations/002_raw.sql (6,240 bytes)
   → migrations/003_derived.sql (7,101 bytes)
   → migrations/004_rls.sql (4,588 bytes)
   → migrations/005_realtime_storage.sql (802 bytes)
   → migrations/006_pipeline_additions.sql (…)
   → migrations/006_story_and_digest.sql (…)
   → migrations/007_series.sql (…)
   → seed/event_timeline.sql (…)
   → seed/places.sql (…)
   → seed/sources.sql (…)
   done
   ```
   A second run prints `= 001_archive.sql already applied` for every unchanged file and exits 0.

   Each file is sent as one query. Postgres runs a multi-statement string as a single implicit transaction (unless the file contains its own `begin`/`commit`), so a failure part-way leaves nothing applied and nothing recorded; fix the file and re-run.

6. **Enable anonymous sign-ins** (once per project; the website cannot sign visitors in without it):
   ```
   pipeline/.venv/bin/python -c "import sys; sys.path.insert(0,'db'); import mgmt; print(mgmt.set_anonymous_signins(True))"
   ```
   Equivalent to Dashboard → Authentication → Sign In / Providers → Anonymous sign-ins → ON.

7. **Verify.**
   ```
   pipeline/.venv/bin/python -c "import sys; sys.path.insert(0,'db'); import mgmt; print(mgmt.query(\"select filename, applied_at from _migrations order by filename\"))"
   pipeline/.venv/bin/python -c "import sys; sys.path.insert(0,'db'); import mgmt; print(mgmt.query('select count(*) from places'))"
   pipeline/.venv/bin/python -m pytest db/tests -q
   ```

## The checksum rule

The checksum is `sha256(file bytes)[:16]`. The ledger stores it with the filename after a successful run.

| Situation | What `apply.py` does | What you should do |
|---|---|---|
| file unchanged | skips it | nothing |
| new file `008_x.sql` | runs it, records it | normal path for any schema change (`001`–`007` are applied; two files share the `006` prefix, which is fine — order is by full filename) |
| applied migration edited (even whitespace) | refuses, exit 1 | revert the edit; put the change in a new numbered file |
| applied migration edited and `--force` | re-runs the edited file, updates the checksum | almost never right: `create policy` and `alter publication add table` are not idempotent and will fail on a second run; use it only after making the file re-runnable (`drop … if exists` first) and knowing why |
| seed file regenerated | re-runs it (no `--force` needed) | expected after editing `sources.yaml` or `places.csv` |
| `--only seed` | skips migrations entirely | quick re-seed |
| `--only migrations` | skips seeds | schema-only change |

Why refuse edits: the ledger is the only record of what the live database looks like. If `003_derived.sql` on disk differs from what was run, nobody can tell which version a fresh project would get. New file, every time.

## Adding a migration

1. Create `db/migrations/008_<topic>.sql` (next free number). Use `create table if not exists`, `create or replace view`, `alter table … add column if not exists`, and `drop policy if exists … ; create policy …` so the file is re-runnable. Precedents: `006_pipeline_additions.sql` (replace a function), `006_story_and_digest.sql` (two new public tables), `007_series.sql` (one table + policy).
2. Enable RLS on every new table (`alter table … enable row level security`) and add its policies in the same file; revoke from `anon`/`authenticated` if it is private.
3. If the table or view is public, add the `grant select` for views or the `_public` policy for tables.
4. `python db/apply.py --dry-run`, then `python db/apply.py`.
5. Update `docs/data-model.md` and the relevant `db/docs/0N-*.md` in the same commit; add a test to `db/tests/`.
6. If a script or the site reads the new object, update `pipeline/processing/*` or `web/lib/queries.ts`.

## Resetting a project

There is no `apply.py --reset`; a reset is a deliberate act. To rebuild from scratch on a **fresh** project: create it in the dashboard, set `SUPABASE_PROJECT_REF`, run steps 3–7. To wipe an existing project, run the drops through `mgmt.query` yourself, then `delete from _migrations`, then re-apply. Never do this on the live project during the event without a backup (`docs/runbook.md`, "Backups").

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `SUPABASE_PROJECT_REF not set (pipeline/.env)` | no ref in env or `.env` | copy `pipeline/.env.example`, fill it |
| `No SUPABASE_ACCESS_TOKEN and no Supabase CLI keychain token` | not on the laptop that ran `supabase login`, or on Linux | export `SUPABASE_ACCESS_TOKEN=sbp_…` |
| `query failed (401)` | token expired or revoked | new token; `supabase login` again |
| `query failed (400): … already exists` | re-running a non-idempotent statement (policy, publication) | put the change in a new migration with `drop … if exists` first |
| `! 004_rls.sql changed since it was applied` | an applied file was edited | `git checkout` the file; write `008_…sql` |
| `query failed (404)` | wrong project ref | check `pipeline/.env` against the dashboard URL |

Back to `db/README.md`.
