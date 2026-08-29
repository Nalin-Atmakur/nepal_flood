# nepalfloodtracker.com — data_aggregator

Live aggregation site and questionnaire for the 26 August 2026 Bhote Koshi / Trishuli flood (Rasuwa → Nuwakot → Dhading → Chitwan). Volunteer-run. **Not an official source**: it collects what public registries, feeds and people already say, reconciles it, and shows it with its source and time; it does not replace reporting to Police 1155 · Tourist Police 1144 · MoFA ECR +977-9744441227 · Red Cross 1130 · NEOC 1149.

## The system on one screen

```
   EXTERNAL SOURCES (51, sources.yaml)                       PEOPLE
   govt APIs · UN/humanitarian · gauges & weather ·          families · survivors · rescuers · agencies
   geospatial · news RSS · seismic                           on WhatsApp, X, LinkedIn, Telegram …
              │                                                          │
              │ pull_external_data.py                                    │ open the shared link
              │ (cron, service key)                                      ▼
              ▼                                            ┌──────────────────────────────────────┐
   ┌────────────────────────┐                              │ WEBSITE  nepalfloodtracker.com       │
   │ fetch on cadence       │                              │ Next.js on Vercel · EN / NE / HI     │
   │ ETag / body hash       │                              │ /        scoreboard · 3D corridor    │
   │ normalisers/<id>.py    │                              │          numbers · places · river    │
   │ strip PII at the door  │                              │          latest · share · OG card    │
   └───────────┬────────────┘                              │ /report  one box, chips, mic         │
               │ writes RAW (+ raw_pulls)                  │ /me      my folder, withdraw         │
               ▼                                           │ /places  /sources  /about  /api/og   │
   ╔═══════════════════════ SUPABASE ═════════════════════╗└────┬──────────────────────────▲──────┘
   ║ ARCHIVE (PII)     RAW (anonymised)   DERIVED (public)║     │ form inserts verbatim    │ reads DERIVED
   ║ reports_archive   figures  gauges    figures_latest  ║◄────┘ into ARCHIVE (anon key)  │ + views (anon key)
   ║ raw_pulls         articles places    place_status    ║                                │ ISR 5 min +
   ║ users             sources  pulls     place_timeline  ║                                │ Realtime counters
   ║ submissions_log   reports_anon       stats           ╠────────────────────────────────┘
   ║                                      report_counts   ║
   ║                                      entities (priv.)║
   ╚═════════╤════════════════════════════════════▲═══════╝
             │ reads ARCHIVE + RAW                 │ writes DERIVED
             ▼                                     │
   ┌───────────────────────────────────────────────┴───────────┐
   │ process_data.py (cron, service key, OpenAI gpt-4o-mini)   │
   │ ⓪ anonymise new rows   ① resolve places   ② dedup         │
   │ ③ per-place ledger     ④ latest figures   ⑤ stats         │
   │ ⑥ findings                                                │
   └───────────────────────────────────────────────────────────┘
```

Every number on the site carries its publisher, `as_of` and a link. Names, phones and photos never leave the ARCHIVE zone.

## The three components

**Database (`db/`).** One Supabase project, used as a database only: Postgres with row-level security, a Realtime publication for the live counters, two private Storage buckets. Tables are partitioned into three zones — ARCHIVE (verbatim, PII, owner + service role), RAW (normalised and anonymised, service role), DERIVED (computed, public) — and RLS is the whole access model: the anon key in the browser can insert its own report, read its own rows, and read DERIVED; the service key exists only on the machine running cron. Migrations are applied with `db/apply.py` through the Management API and recorded in a `_migrations` ledger.

**Pipeline (`pipeline/`).** Two scripts on one cron line. `pull_external_data.py` reads `sources.yaml`, fetches each source on its cadence with ETag/body-hash change detection, stores the verbatim response in `raw_pulls`, and dispatches to one normaliser per source that emits `figures`, `gauges`, `articles` with PII stripped. `process_data.py` anonymises new questionnaire rows into `reports_anon` (structured extraction, redaction, translation), resolves free-text places against the gazetteer, deduplicates people across the form and the official registries into private `entities`, and writes the per-place ledger, the latest figure per publisher, the striking numbers and data-quality findings into DERIVED. A budget guard stops model calls at $20.

**Website (`web/`).** Next.js on Vercel, three languages on route (`/en`, `/ne`, `/hi`), ISR every 5 minutes, reading DERIVED and the public reference tables through `web/lib/queries.ts`. The home page is the viral surface (live scoreboard via Realtime Presence + `submissions_log`, 3D corridor, numbers side by side, places, river & weather, latest, share buttons with a live OG card). `/report` is one text box with chips and a microphone; submissions insert verbatim into `reports_archive` under the visitor's anonymous Supabase identity. `/me` shows what this device contributed, its status trail, and a withdraw button. No server-side secret exists in the app.

## Folder map

```
data_aggregator/
├── README.md              this file — start here
├── CONTRIBUTING.md        numbered how-tos: run · add a source · add a step · add a language · add a block · change schema · commit · PII rule
├── PLAN.md                architecture narrative and diagrams (§0–§12); edit when reality changes
├── sources.yaml           the source registry: 51 pollable sources, the contract for pull_external_data
├── docs/                  cross-cutting: data-model.md · runbook.md · decisions-log.md · sources.md (generated by gen_sources_md.py)
├── db/                    migrations 001–005 · seeds · apply.py (Management API) · tests · docs/01–07
├── pipeline/              pull_external_data.py · process_data.py · run.sh · lib/ · normalisers/ · processing/ · tests/ · docs/
├── web/                   Next.js app: app/[lang]/ · components/{ui,blocks,form,three}/ · lib/ · messages/ · tests/ · docs/01–12
├── gazetteer/             places.csv — the ~70-place corridor gazetteer that seeds `places`; README
└── design/                Claude Design export ("Arcade ledger" system); read-only reference for the web lane
```

Gitignored and never committed: `pipeline/.env`, `web/.env.local`, `pipeline/snapshots/`, `pipeline/_state.json`, `node_modules/`, `.next/`, `.vercel/`.

## How to run everything

1. **Database** — `cp pipeline/.env.example pipeline/.env`, set `SUPABASE_PROJECT_REF`; `supabase login` (or `export SUPABASE_ACCESS_TOKEN=sbp_…`); `pipeline/.venv/bin/python db/apply.py --dry-run` then `pipeline/.venv/bin/python db/apply.py`; enable anonymous sign-ins once (`db/README.md` §1). Verify: `select count(*) from places` > 0.
2. **Pipeline** — fill the rest of `pipeline/.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_BUDGET_USD`); `cd pipeline && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && ./run.sh`. Verify: `select * from v_live_counts` shows `last_pull_at` and `last_processed_at` just now.
3. **Web** — `cp web/.env.example web/.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `cd web && npm install && npm run dev`; open http://localhost:3000/en, `/ne`, `/hi`; submit a test report and see it on `/me`.
4. **Deploy** — `cd web && npm run lint && npm run build && npm test && vercel --prod --yes`; `curl -sI https://nepalfloodtracker.com/en` → 200. Install the cron line from `docs/runbook.md` §1 on the machine that holds `pipeline/.env`.
5. **Check health any time** — the 60-second script in `docs/runbook.md` §6.

## Where to read next

| I want to… | Read |
|---|---|
| understand every table and column | `docs/data-model.md` |
| apply or change the schema | `db/README.md` → `db/docs/07-applying-migrations.md` |
| understand access control | `db/docs/05-rls.md` |
| run or extend the pull script | `pipeline/README.md` → `pipeline/docs/pull_external_data/01-overview.md` … `07-failure-modes.md` |
| understand a processing step | `pipeline/docs/process_data/00-anonymise.md` … `08-failure-modes.md` (numbers match the code) |
| work on the site | `web/README.md` → `web/docs/01-architecture.md` … `12-deploy.md` |
| see which sources exist | `docs/sources.md` (generated from `sources.yaml`) |
| operate it: cron, secrets, backups, outages | `docs/runbook.md` |
| know why something is the way it is | `docs/decisions-log.md`, `PLAN.md` |
| add anything | `CONTRIBUTING.md` |
| the corridor places | `gazetteer/README.md` |
| the research behind the sources | `../aryaa_research_general/11-data-catalogue-2026-08-29.md` |

## Two rules

**PII.** Names, phone numbers, passport numbers, photos and reporter contacts live only in the ARCHIVE zone (`reports_archive`, `raw_pulls`, the private buckets). They never appear in RAW or DERIVED tables, fixtures, logs, docs, the site, or a commit. RAW carries hashes (`person_key`), bands (`age_band`) and counts instead. Details: `CONTRIBUTING.md` §8.

**Official channels first.** Every page shows the official numbers; the site is volunteer-run and not an official source. If you are looking for someone, report to Nepal Police 1155 or Tourist Police 1144 and the MoFA Emergency Contact Room; the site is additive, not a substitute.

Contact: contact@nepalfloodtracker.com.
