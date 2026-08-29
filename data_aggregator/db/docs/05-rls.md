# 05 · Row-level security — `004_rls.sql`

The entire access model is one short SQL file. Read it once; this page is the matrix version plus the reasoning.

```
   ┌─────────────────────┐         ┌────────────────────────────┐        ┌──────────────────────┐
   │ anon key (browser)  │         │ service-role key (cron)    │        │ Management API token │
   │ role: anon, then    │         │ role: service_role         │        │ role: postgres       │
   │ authenticated after │         │ RLS bypassed               │        │ RLS bypassed         │
   │ anonymous sign-in   │         │                            │        │                      │
   └──────────┬──────────┘         └─────────────┬──────────────┘        └──────────┬───────────┘
              │ policies decide row by row       │ everything                       │ everything
              ▼                                  ▼                                  ▼
        ┌───────────────────────────── Postgres, RLS enabled on every table ───────────────────────────┐
```

RLS is enabled on all 21 tables, including `_migrations`. Tables with no policy for a role are invisible to that role. As belt and braces the file also `revoke`s all privileges on the sensitive tables from `anon` and `authenticated`, so even a future accidental policy would not grant access without a matching `grant`.

## Policy matrix

| Table | anon | authenticated | Policy names |
|---|---|---|---|
| `users` | — | insert / select / update own row (`id = auth.uid()`) | `users_self_insert`, `users_self_select`, `users_self_update` |
| `reports_archive` | — | insert own (`user_id = auth.uid()` and `status = 'received'` and `anonymised_at is null`); select own; update own — reduced to withdrawal by the trigger | `reports_own_insert`, `reports_own_select`, `reports_own_withdraw` |
| `submissions_log` | select | insert (any), select | `submissions_log_insert`, `submissions_log_select` |
| `raw_pulls` | — | — (revoked) | none |
| `_migrations` | — | — (revoked) | none |
| `sources` | select | select | `sources_public_select` |
| `places` | select | select | `places_public_select` |
| `gauges` | select | select | `gauges_public_select` |
| `pulls`, `figures`, `articles`, `reports_anon` | — | — (revoked) | none |
| `figures_latest` | select | select | `figures_latest_public` |
| `place_status` | select | select | `place_status_public` |
| `place_timeline` | select | select | `place_timeline_public` |
| `stats` | select | select | `stats_public` |
| `report_counts` | select | select | `report_counts_public` |
| `entities`, `entity_events`, `dedup_queue`, `findings` | — | — (revoked) | none |
| views `v_live_counts`, `v_articles_recent`, `v_place_status_latest`, `v_sources_status`, `v_gauges_latest` | select (grant) | select (grant) | — |

Delete is granted to nobody but the service role. Users correct by inserting a new row with `supersedes`.

## The insert policy, read carefully

`reports_own_insert` has three conditions. `user_id = auth.uid()` stops one visitor writing into another's folder. `status = 'received'` and `anonymised_at is null` stop a client from pre-marking a row as processed or skipping anonymisation. The other bookkeeping columns (`summary_public`, `withdrawn_at`) can be sent on insert but are meaningless until `process_data` overwrites them; the model output always wins.

## The withdraw trigger

Postgres RLS cannot say "may update only column X". The `for update` policy therefore allows the owner to update the row, and a `before update` trigger narrows it:

```
   reports_archive_guard_update()
     if request.jwt.claim.role = 'service_role' or current_user = 'postgres'   → return new  (unchanged)
     elif new.withdrawn_at is distinct from old.withdrawn_at                    → new := old
                                                                                  new.withdrawn_at := coalesce(new.withdrawn_at, now())
                                                                                  new.status       := 'withdrawn'
                                                                                  return new
     else                                                                       → raise 'only withdrawal is permitted'
```

Effects: the owner can set `withdrawn_at`; every other column reverts to its stored value in the same statement; `status` is forced to `withdrawn`; nulling `withdrawn_at` re-stamps `now()`, so withdrawal is one-way for the user. The service role and `apply.py` are exempt so `process_data` can keep writing `anonymised_at`, `status`, `summary_public`.

## Views run as their owner

The five `v_*` views are ordinary views (no `security_invoker`), so they execute with the privileges of `postgres`, the owner. Granting `select` on a view therefore lets `anon` read whatever the view projects from otherwise service-only tables. This is intentional and it is the only way the public sees `articles` (without `body`) or `pulls` (only the latest row per source). It also means:

1. A new view is a new public surface. Project only columns you would print on the site.
2. Never `select *` from an ARCHIVE table in a view.
3. Test the view with the anon key before granting it (`db/tests/test_views.py`).

## Testing the model

`db/tests/test_rls.py` runs positive and negative checks against the live project with both keys:

```
   anon key   select figures_latest      → rows           (positive)
   anon key   select reports_anon        → denied / empty (negative)
   anon key   select raw_pulls           → denied         (negative)
   anon key   insert reports_archive with a foreign user_id → denied
   anon key   update reports_archive set text = …           → 'only withdrawal is permitted'
   anon key   update reports_archive set withdrawn_at = now() → ok, status = 'withdrawn'
   service    select reports_anon        → rows           (positive)
```

Run: `pipeline/.venv/bin/python -m pytest db/tests -q` (needs `pipeline/.env` for the service key and `web/.env.local` for the anon key).

## Rules when changing policies

1. Never add a policy that lets `anon`/`authenticated` select from `reports_archive` (beyond own rows), `raw_pulls`, `figures`, `articles`, `reports_anon`, `pulls`, `entities`, `entity_events`, `dedup_queue`, `findings`, `_migrations`.
2. Public reads of RAW go through views that project safe columns.
3. Policies go in a new migration file (`006_…sql`), never edited into `004_rls.sql` after it has been applied (`07-applying-migrations.md`). `create policy` is not idempotent — write `drop policy if exists … ; create policy …` in the new file.
4. Add the corresponding positive and negative test to `db/tests/test_rls.py` in the same commit.

Next: `06-realtime-and-storage.md`.
