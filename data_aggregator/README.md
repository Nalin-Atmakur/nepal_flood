# nepalfloodtracker.com — data_aggregator

Live aggregation site and questionnaire for the 26 August 2026 Bhote Koshi / Trishuli flood (Rasuwa → Nuwakot → Dhading → Chitwan). Volunteer-run. **Not an official source**: it collects what public registries, feeds and people already say, reconciles it, and shows it with its source and time; it does not replace reporting to Police 1155 · Tourist Police 1144 · MoFA ECR +977-9744441227 · Red Cross 1130 · NEOC 1149.

Live: https://www.nepalfloodtracker.com (apex redirects to `www`). Tonight's build log and queue: `PROGRESS.md`.

## The system on one screen

```
   EXTERNAL SOURCES (51 in sources.yaml; 39 have a normaliser)        PEOPLE
   govt registries · UN/humanitarian · gauges & weather ·             families · survivors · rescuers · agencies
   geospatial · news RSS / live blogs · seismic · Chinese side        on WhatsApp, X, LinkedIn, Telegram …
              │                                                                    │
              │ pull_external_data.py                                              │ open the shared link
              │ (scheduler, service key)                                           ▼
              ▼                                                      ┌──────────────────────────────────────┐
   ┌────────────────────────┐                                        │ WEBSITE  nepalfloodtracker.com       │
   │ due by cadence         │                                        │ Next.js on Vercel · EN / NE / HI     │
   │ ETag / body hash       │                                        │ /        scoreboard · what changed   │
   │ normalisers/<id>.py    │                                        │          first hours · 3D corridor   │
   │ relevance gate (news)  │                                        │          numbers · places · river    │
   │ prestore(): PII out    │                                        │          latest · share · OG card    │
   └───────────┬────────────┘                                        │ /report  one page: who + the box     │
               │ writes RAW (+ raw_pulls)                            │ /me      my folder, withdraw         │
               ▼                                                     │ /places  /places/{id} /sources       │
   ╔═══════════════════════ SUPABASE ═════════════════════════════╗  │ /about   /api/og                     │
   ║ ARCHIVE (PII)     RAW (anonymised)   DERIVED (public)        ║  └────┬──────────────────────────▲──────┘
   ║ reports_archive   figures  gauges    figures_latest  stats   ║◄──────┘ form inserts verbatim    │ reads DERIVED
   ║ raw_pulls         articles places    place_status    digest  ║         into ARCHIVE (anon key)  │ + views (anon key)
   ║ users             sources  pulls     place_timeline          ║                                  │ ISR 5 min +
   ║ submissions_log   reports_anon       event_timeline          ╠══════════════════════════════════╝ Realtime counters
   ║ _migrations                          figure_series           ║
   ║                                      report_counts           ║
   ║                                      private: entities ·     ║
   ║                                      entity_events ·         ║
   ║                                      dedup_queue · findings  ║
   ╚═════════╤════════════════════════════════════════════▲═══════╝
             │ reads ARCHIVE + RAW                         │ writes DERIVED
             ▼                                             │
   ┌───────────────────────────────────────────────────────┴───────────────────────┐
   │ process_data.py (scheduler, service key, OpenAI gpt-4o-mini, $20 guard)       │
   │ ⓪ anonymise   ① resolve places   ② dedup   ③ ledger   ③b press figures (3.5)  │
   │ ④ figures_latest   ⑤ stats   ⑥ findings   ⑦ digest   ⑧ timeline   ⑨ trends    │
   └───────────────────────────────────────────────────────────────────────────────┘
```

Every number on the site carries its publisher, `as_of` and a link. Names, phones and photos never leave the ARCHIVE zone.

## The three components

**Database (`db/`).** One Supabase project, used as a database only: Postgres with row-level security, a Realtime publication for the live counters, two private Storage buckets. Tables are partitioned into three zones — ARCHIVE (verbatim, PII, owner + service role), RAW (normalised and anonymised, service role), DERIVED (computed, public) — and RLS is the whole access model: the anon key in the browser can insert its own report, read its own rows, and read DERIVED; the service key exists only on the machine running the scheduler. Migrations `001`–`007` are applied with `db/apply.py` through the Management API and recorded in a `_migrations` ledger.

**Pipeline (`pipeline/`).** Two scripts, one tick (`run.sh`, with a lock so ticks never overlap). `pull_external_data.py` reads `sources.yaml`, fetches each due source with ETag/body-hash change detection, stores the verbatim response in `raw_pulls`, and dispatches to one normaliser per source that emits `figures`, `gauges`, `articles` with PII stripped at the door and a flood-relevance gate on news. `process_data.py` runs eleven numbered steps: anonymise new questionnaire rows into `reports_anon`, resolve free-text places against the 90-place gazetteer, deduplicate people across the form and the official registries into private `entities`, write the per-place ledger, lift Police/Tourism counts quoted in the press into `figures`, compute the latest figure per publisher, the striking numbers, data-quality findings, the daily "what changed" digest (EN/NE/HI), appended event-timeline milestones, and per-day figure series. A budget guard stops model calls at $20.

**Website (`web/`).** Next.js on Vercel, three languages on route (`/en`, `/ne`, `/hi`), ISR every 5 minutes, reading DERIVED and the public reference tables through `web/lib/queries.ts`. The home page is the viral surface (live scoreboard via Realtime Presence + `submissions_log`, "what changed today", the first hours, 3D corridor, numbers side by side, places, river & weather, latest, share buttons with a live OG card). `/report` is one page: who-are-you cards and one text box with chips and a microphone; submissions insert verbatim into `reports_archive` under the visitor's anonymous Supabase identity. `/me` shows what this device contributed, its status trail, and a withdraw button. No server-side secret exists in the app.

## Folder map

```
data_aggregator/
├── README.md              this file — start here
├── PROGRESS.md            overnight build log: status by phase, cycle log, queue (read after any reset)
├── CONTRIBUTING.md        numbered how-tos: run · add a source · add a step · add a language · add a block · change schema · commit · PII rule
├── PLAN.md                architecture narrative and diagrams (§0–§12); edit when reality changes
├── Makefile               make help · db · db-seed · db-test · pull · process · pipeline · pipeline-test · web-* · deploy · health · test · all
├── sources.yaml           the source registry: 51 sources, the contract for pull_external_data
├── .vercelignore          `*` — guards against running `vercel` from this folder (also in db/ and pipeline/)
├── docs/                  cross-cutting: data-model.md · runbook.md · decisions-log.md · sources.md (generated by gen_sources_md.py)
├── scripts/               health.py (60-s health check) · install_schedule.sh (loop + launchd scheduler; --status, --remove)
├── db/                    migrations 001–007 · seed/ (sources.sql, places.sql, event_timeline.sql) · apply.py · mgmt.py · tests/ · docs/01–07
├── pipeline/              pull_external_data.py · process_data.py · run.sh · lib/ · normalisers/ (39) · processing/ (one module per step) · tests/ · docs/
├── web/                   Next.js app: app/[lang]/ · app/api/og · proxy.ts · components/{ui,blocks,form,me,three}/ · lib/ · messages/ · tests/ · docs/01–14
├── gazetteer/             places.csv (90 places, 393 aliases, km chainage) · build_gazetteer.py · to_sql.py · tests/ · README
└── design/                Claude Design export ("Arcade ledger" system); read-only reference for the web lane
```

Gitignored and never committed: `pipeline/.env`, `web/.env.local`, `pipeline/snapshots/`, `pipeline/_state.json`, `pipeline/.scheduler.pid`, `pipeline/run.log`, `node_modules/`, `.next/`, `.vercel/`, and — as a personal-data firewall — `*.csv` (except the gazetteer), `*.xlsx`, `*.parquet`, `data/**/*.json`.

## How to run everything

Python is always the pipeline venv: `pipeline/.venv/bin/python` (PEP 668 blocks system pip). `make help` lists every target below.

1. **Database** — `cp pipeline/.env.example pipeline/.env`, set `SUPABASE_PROJECT_REF`; `supabase login` (or `export SUPABASE_ACCESS_TOKEN=sbp_…`); `pipeline/.venv/bin/python db/apply.py --dry-run` to preview, then `make db` (migrations, then seeds); enable anonymous sign-ins once (`db/README.md` §1). Verify: `make db-test` (RLS + view tests against the live project).
2. **Pipeline** — fill the rest of `pipeline/.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_BUDGET_USD`); `make setup` once (venv + deps); `make pipeline` (= `pipeline/run.sh`: pull, then process). Flags: `pull_external_data.py --only <id> --force --dry-run`; `process_data.py --step N` (3.5 = press figures). Verify: `make pipeline-test` (offline, fixture-backed) and `make health`.
3. **Schedule** — `scripts/install_schedule.sh` (default 240 min tonight; `15` for the live phase). It starts a detached loop (`pipeline/.scheduler.pid`) that works immediately and installs a launchd agent that takes over once `/bin/bash` has Full Disk Access (`docs/runbook.md` §1). `scripts/install_schedule.sh --status` to check.
4. **Web** — `cp web/.env.example web/.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `make web-dev`; open http://localhost:3000/en, `/ne`, `/hi`; submit a test report and see it on `/me` (then withdraw it). Gates: `cd web && npm run lint && npm run i18n:check && npm test && npm run build && npm run e2e`.
5. **Deploy** — **only from `web/`**: `cd web && vercel --prod --yes` (`make deploy` is the same command). `curl -sI https://www.nepalfloodtracker.com/en` → 200. Data changes never need a deploy.
6. **Check health any time** — `make health` (`scripts/health.py`: live counters, headline figures, gauges, failing sources, row counts; exit 1 if the last pull is older than 2 × `PULL_INTERVAL_MINUTES`).

## Where to read next

| I want to… | Read |
|---|---|
| know what was built tonight and what is queued | `PROGRESS.md` |
| understand every table and column | `docs/data-model.md` |
| apply or change the schema | `db/README.md` → `db/docs/07-applying-migrations.md` |
| understand access control | `db/docs/05-rls.md` |
| run or extend the pull script | `pipeline/README.md` → `pipeline/docs/pull_external_data/01-overview.md` … `07-failure-modes.md`; per-source notes in `05-sources.md` (wave 1), `05a-…` (wave 2 official), `05b-…` (wave 2 geospatial + text) |
| understand a processing step | `pipeline/docs/process_data/00-anonymise.md` … `07-digest.md`, `03b-press-figures.md`, `10-timeline-and-trends.md`; then `08-llm-budget.md`, `09-failure-modes.md` (numbers match `process_data.py`) |
| work on the site | `web/README.md` → `web/docs/01-architecture.md` … `13-story-and-digest.md`; the flood-simulation spec for the corridor is `14-flood-sim.md` |
| see which sources exist | `docs/sources.md` (generated from `sources.yaml`) |
| operate it: schedule, secrets, backups, outages | `docs/runbook.md` |
| know why something is the way it is | `docs/decisions-log.md`, `PLAN.md` |
| add anything | `CONTRIBUTING.md` |
| the corridor places | `gazetteer/README.md` |
| the research behind the sources | `../aryaa_research_general/11-data-catalogue-2026-08-29.md` |

## Two rules

**PII.** Names, phone numbers, passport numbers, photos and reporter contacts live only in the ARCHIVE zone (`reports_archive`, `raw_pulls`, the private buckets). They never appear in RAW or DERIVED tables, fixtures, logs, docs, the site, or a commit. RAW carries hashes (`person_key`), bands (`age_band`) and counts instead. Details: `CONTRIBUTING.md` §8.

**Official channels first.** Every page shows the official numbers; the site is volunteer-run and not an official source. If you are looking for someone, report to Nepal Police 1155 or Tourist Police 1144 and the MoFA Emergency Contact Room; the site is additive, not a substitute.

Contact: contact@nepalfloodtracker.com.
