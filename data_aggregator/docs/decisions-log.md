# Decisions log

Dated, append-only. One line per decision: what was decided, the alternative considered, where it shows up. Newer entries at the bottom of each day. When a decision is reversed, add a new line that says so; do not edit the old one.

Template — copy, fill, append:

```
- **D-NNN · <short title>.** Decided: … Alternative considered: … Where: `path/or/table`. Who: <name>.
```

Sources for the seed entries: `PLAN.md` (§0 principles, §2 zones, §12 open items), the approved build plan's "Decisions confirmed with the user", and what the migrations `db/migrations/001–005` actually encode.

## 2026-08-29

- **D-001 · The database is the single source of truth.** Decided: scraped, contributed and computed data all live in Supabase; the website is a portal, the scripts are readers and writers; nothing exists only on a laptop or only on the site. Alternative: files on disk + static site rebuilds. Where: `PLAN.md` §0. Who: Aryaa.
- **D-002 · Two scripts, one cron line.** Decided: `pull_external_data` (external → RAW) and `process_data` (RAW + ARCHIVE → DERIVED), run back-to-back by `pipeline/run.sh`. Alternative: one monolithic script; per-source cron entries. Where: `pipeline/`. Who: Aryaa.
- **D-003 · Three zones enforced by RLS, not application code.** Decided: ARCHIVE (PII, owner + service) / RAW (anonymised, service) / DERIVED (public, computed); the anon key ships in the browser and can only do what `004_rls.sql` allows; the website has no privileged code path. Alternative: server actions with a secret key. Where: `db/migrations/004_rls.sql`, `db/docs/05-rls.md`. Who: Aryaa.
- **D-004 · Supabase as database only.** Decided: Postgres + RLS + one Realtime publication + two Storage buckets; no edge functions, no Supabase cron, one guard trigger. Alternative: edge functions for anonymisation. Where: `db/docs/06-realtime-and-storage.md`. Who: Aryaa.
- **D-005 · Users contribute raw; the pipeline anonymises.** Decided: submissions stored verbatim in `reports_archive`; `process_data` ⓪ projects new rows into `reports_anon`; the website never calls OpenAI. Alternative: anonymise in the browser or on submit. Where: `db/docs/02-archive.md`. Who: Aryaa.
- **D-006 · Anonymous Supabase auth is the user identity.** Decided: `signInAnonymously()` on first visit gives a stable `auth.uid()`; `/me` is `select … where user_id = auth.uid()`; optional upgrade to email/phone later without changing the id. Alternative: cookie-only ids; accounts. Where: `users`, `web/docs/04-auth-and-identity.md`. Who: Aryaa.
- **D-007 · One text box, chips not fields.** Decided: the box is the only required field; chips insert prompt lines; extraction populates the schema. Alternative: a structured multi-field form (Google Form / Kobo). Where: `PLAN.md` §7, `/report`. Who: Aryaa.
- **D-008 · Three languages, route-based.** Decided: `/{en|ne|hi}` routes so a forwarded link carries its language; NE and HI written by the builder, complete at launch, reviewed by the team afterwards. Alternative: cookie-based locale; Chinese at launch. Where: `web/messages/`, `web/middleware.ts`. Who: Aryaa.
- **D-009 · Raw pulls in Postgres, binaries in Storage.** Decided (closes `PLAN.md` §12.1): text bodies in `raw_pulls.body`, PDFs/images in the private `raw` bucket with `storage_path`. Alternative: everything in Storage. Where: `001_archive.sql`, `005_realtime_storage.sql`. Who: Aryaa.
- **D-010 · Age as a band in RAW, exact only in ARCHIVE.** Decided (closes §12.2): `reports_anon.age_band` ∈ {0-17, 18-39, 40-64, 65+}. Alternative: exact age with k-anonymity checks. Where: `002_raw.sql`. Who: Aryaa.
- **D-011 · Human dedup queue as a table; review tool open.** Decided: ambiguous merges (0.6–0.9) land in `dedup_queue` with `decision/decided_by/decided_at`; reviewed from the Supabase table editor for now. Alternative: an `/admin` route behind a password. Where: `003_derived.sql`. Status: tool choice still open (§12.3). Who: Aryaa.
- **D-012 · 3D corridor is procedural, not a DEM.** Decided (supersedes §12.4's pre-baked mesh): `corridor-3d.js` from the design ported verbatim into a React island, live markers from `v_place_status_latest`, PNG fallback on WebGL failure or slow connections. Alternative: Copernicus DEM tiles pre-baked into the repo. Where: `web/components/three/`. Who: Aryaa (confirmed).
- **D-013 · Contact address.** Decided (closes §12.5): `contact@nepalfloodtracker.com` on `/about`. Alternative: `hello@`. Where: `web/app/[lang]/about`. Who: Aryaa.
- **D-014 · Free tier; Presence degrades first.** Decided: stay on the Supabase free tier; if the Realtime connection cap is hit, "people here now" hides itself and the contribution counters remain (polling `v_live_counts`). Alternative: Pro plan from day one. Where: `web/docs/09-live-scoreboard.md`, `docs/runbook.md` §5. Who: Aryaa (confirmed).
- **D-015 · Withdraw is soft and one-way for the user.** Decided: owner sets `withdrawn_at`; trigger forces `status='withdrawn'` and reverts any other change; row retained; excluded from processing/counts within one cadence; no authorities-export command in this build. Alternative: hard delete; full edit rights. Where: `004_rls.sql` trigger, `db/docs/05-rls.md`. Who: Aryaa (confirmed).
- **D-016 · OpenAI `gpt-4o-mini` with structured outputs, $20 guard.** Decided: extraction/anonymisation/place resolution use `gpt-4o-mini`; `lib/llm.py` tracks spend in `_state.json` and stops at `OPENAI_BUDGET_USD`. Alternative: a larger model with a smaller row cap. Where: `pipeline/docs/process_data/07-llm-budget.md`. Who: Aryaa (confirmed).
- **D-017 · Cadence: every 4 h tonight, every 15 min from distribution.** Decided: `0 */4 * * *` tonight; `*/15 * * * *` once distribution starts; `PULL_INTERVAL_MINUTES` in `pipeline/lib/config.py` and `web/lib/config.ts` drives the copy and the stale threshold and must change with the crontab. Alternative: 15 min from the start. Where: `docs/runbook.md` §1. Who: Aryaa (confirmed).
- **D-018 · Migrations via the Management API query endpoint.** Decided: `db/apply.py` posts each file to `POST /v1/projects/{ref}/database/query` using `SUPABASE_ACCESS_TOKEN` or the Supabase CLI's keychain token; applied files recorded with a checksum in `_migrations`; an edited applied migration is refused. Alternative: `supabase db push` (needs the DB password and a linked project); the dashboard SQL editor (no ledger). Where: `db/apply.py`, `db/docs/07-applying-migrations.md`. Who: Aryaa.
- **D-019 · Public reads of RAW only through owner-privilege views.** Decided: `v_articles_recent`, `v_gauges_latest`, `v_place_status_latest`, `v_sources_status`, `v_live_counts` are granted to `anon`; `figures`, `articles`, `pulls` tables stay service-only. Alternative: `security_invoker` views + per-table policies. Where: `003_derived.sql`, `004_rls.sql`. Who: Aryaa.
- **D-020 · Every number carries publisher, `as_of` and `url`.** Decided: `figures` has no path for a bare figure; the site shows five publishers side by side and explains why they differ rather than picking one. Alternative: a single "best" number. Where: `figures`, `figures_latest`, home §03. Who: Aryaa.
- **D-021 · Deploy only on code change; ISR 5 min.** Decided: `vercel --prod` when the app changes; data reaches the page through ISR (`revalidate = 300`) and Realtime, never a rebuild. Alternative: rebuild on every pipeline run. Where: `web/docs/12-deploy.md`. Who: Aryaa.
- **D-022 · Autonomy rule.** Decided: during the build the builder never stops to ask; ambiguities are resolved by the simplest choice consistent with the design and plan and logged here with the alternative. Where: this file. Who: Aryaa (confirmed).
- **D-023 · `docs/sources.md` is generated.** Decided: `docs/gen_sources_md.py` renders `sources.yaml` grouped by family, reusing `db/seed/gen_sources.py`'s group/reliability rules so the page and the `sources` table agree. Alternative: hand-maintained table. Where: `docs/gen_sources_md.py`. Who: docs lane.
- **D-024 · Registry `pii` seeds as boolean.** Decided: `sources.pii` is true only for registry values `true`/`mixed`; free-text notes ("some headlines name individuals") seed as false and remain visible in `docs/sources.md`; such sources still extract place/count/status only. Alternative: a three-state column. Where: `db/seed/gen_sources.py`. Who: docs lane (documented, not changed).

## Open

- §12.3 review tool for `dedup_queue` (D-011).
- Named Nepal-side co-owner with access to DERIVED and `findings` (`PLAN.md` §9 handoff) — record the name here when agreed.
- Wave-2 sources (tag pages, live blogs, Chinese search APIs, Wikipedia revisions, GDELT, geospatial catalogues, Setu, Police UDB, DAO lists) — each becomes a normaliser and a line here when it lands.

- **2026-08-30 01:30** — Deployed the full site to production (Vercel). Domain nepalfloodtracker.com (apex + www) attached to Vercel by the owner at Squarespace; a stale local resolver briefly made the apex look unconfigured (see runbook §7.0).

- **2026-08-30 02:30** — Incident: `vercel --prod` was run with the shell cwd still in `pipeline/`, which auto-created a Vercel project "pipeline" and uploaded that folder for ~10 minutes before it was deleted via the API (HTTP 204). Vercel CLI honours `.gitignore`, so `pipeline/.env` should not have been uploaded, but this cannot be proven after deletion. **Action for the owner in the morning: rotate the OpenAI key (platform.openai.com) and the Supabase service-role key (dashboard → Settings → API), then update `pipeline/.env`.** Guard added: `.vercelignore` with `*` in `data_aggregator/`, `db/`, `pipeline/`.

