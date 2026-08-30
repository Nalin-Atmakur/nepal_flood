# nepalfloodtracker.com — architecture and plan

*Current architecture, updated 30 Aug 2026. The original implementation narrative is retained where useful, but the archive-only family boundary below supersedes every earlier proposal to anonymise, match, count or publish questionnaire data.*

## 0. Principles

1. **The database is the single source of truth.** Scraped, contributed and computed data all live in Supabase. The website is a portal into it; the scripts are readers and writers. Nothing exists only on a laptop or only on the site.
2. **Two scripts, run on the configured cadence:** `pull_external_data` (external sites/APIs → raw) and `process_data` (public-source raw → metrics, trends, dedup → derived).
3. **Users contribute raw; the pipeline does not read it.** Submissions and attachments remain verbatim in the private **archive** zone. They are never projected, classified, summarised, matched, counted into derived metrics or sent to a model. Every user has a UUID and can manage what *they* contributed.
4. **The website is functional and beautiful.** Functional: submit, see your own information. Beautiful: 3D, striking statistics, design people want to show someone. Virality = word of mouth on WhatsApp, X, LinkedIn.
5. **Three languages, one toggle:** English · नेपाली · हिन्दी at the top of every page.

---

## 1. System overview

```
                        EXTERNAL WORLD
   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
   │ govt APIs     │  │ HDX / HOT /   │  │ news RSS,     │  │ people:       │
   │ OPMCM NDRRMA  │  │ Copernicus,   │  │ live blogs,   │  │ families,     │
   │ BIPAD DHM MoFA│  │ NESRA, STAC   │  │ Wikipedia     │  │ survivors,    │
   │ Police UDB    │  │               │  │               │  │ rescuers, cos │
   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
           │                  │                  │                  │
           └──────────────────┴────────┬─────────┘                  │
                                       ▼                            ▼
                     ┌─────────────────────────────┐   ┌─────────────────────────┐
                     │ pull_external_data.py       │   │ website  /report        │
                     │ every 15 min · laptop cron  │   │ (plain insert, own uid) │
                     │ new-since-last-pull only    │   │ verbatim → archive      │
                     └──────────────┬──────────────┘   └───────────┬─────────────┘
                                    │ writes RAW                   │ writes ARCHIVE (verbatim)
                                    ▼                              ▼
              ╔═══════════════════════════════════════════════════════════════════╗
              ║                 SUPABASE  — single source of truth                ║
              ║                                                                   ║
              ║   ARCHIVE (PII)      RAW (anonymised)          DERIVED (public)   ║
              ║   reports_archive    raw_pulls  figures         figures_latest    ║
              ║   report_photos      gauges     articles        place_status      ║
              ║   users              places     reports_anon    stats             ║
              ║                                                 report_counts     ║
              ║                                                 entities (private)║
              ║                                                 findings          ║
              ╚═════════════╤═════════════════════════════════════════╤═══════════╝
                            │ reads public-source RAW/ARCHIVE only    │ reads DERIVED
                            ▼                                         ▼
              ┌─────────────────────────────┐          ┌─────────────────────────────┐
              │ process_data.py             │          │ website (Next.js on Vercel) │
              │ every 15 min · laptop now,  │          │ ISR every 5 min             │
              │ cloud later                 │          │ deploy only on code change  │
              │ public resolve → dedup →    │          │ /  /report  /me  /places    │
              │ dedup → ledger → stats      │          │ EN · NE · HI · live counts  │
              └──────────────┬──────────────┘          └──────────────┬──────────────┘
                             │ writes DERIVED                          │
                             └────────────────────────────────────────►│
                                                                       ▼
                                                        people share it → more submissions
```

---

## 2. Data zones and access

```
 ┌────────────────────────────────────────────────────────────────────────────┐
 │ ZONE        │ WHO WRITES                │ WHO READS                        │
 ├─────────────┼───────────────────────────┼──────────────────────────────────┤
 │ ARCHIVE     │ website (user's own rows) │ the user (own rows, via auth.uid)│
 │ (PII)       │                           │ authorised manual access only    │
 ├─────────────┼───────────────────────────┼──────────────────────────────────┤
 │ RAW         │ pull_external_data        │ process_data                     │
 │ (normalised)│ pull + public processing  │ (never the public site)          │
 ├─────────────┼───────────────────────────┼──────────────────────────────────┤
 │ DERIVED     │ process_data              │ the website (public, anon key)   │
 │ (public)    │                           │ except entities (service only)   │
 └─────────────┴───────────────────────────┴──────────────────────────────────┘
```

Enforced entirely by Postgres RLS. Keys: the **anon key** ships in the website (can insert own reports, select own archive rows, select DERIVED and the two live-count tables); the **service-role key** exists only on the machine running the two scripts. The website has no privileged code path at all.

Supabase is **database only**: Postgres + RLS + Storage for PDFs/photos. No edge functions, triggers or Supabase cron.

---

## 3. Users and identity

- On first visit: `supabase.auth.signInAnonymously()` → a real Supabase user with a stable `auth.uid()`, persisted by the client library in localStorage. This **is** the user's UUID.
- `users` row: `id`, `created_at`, `lang`, `fingerprint_hash` (UA + screen + timezone + language — a recovery/dedup hint, not auth), `contact` (optional, added later if the user wants to recover their folder on another device — Supabase can upgrade an anonymous user to email/phone without changing the id).
- **My info (`/me`)**: reads minimum metadata from `reports_archive where user_id = auth.uid()` under RLS. Shows `Received` or `Received → Withdrawn`, files, and correction/add-more actions. It never renders raw report text or claims automated processing.

---

## 4. Submission path

```
   user fills form (EN/NE/HI)
            │
            ▼
   browser → supabase.from('reports_archive').insert(...)      anon key, RLS: user_id = auth.uid()
            │
            ├──► reports_archive ◄── full submission, verbatim (names, phones, passport,
            │                        photo path, free text), anonymised_at = null
            │
            └──► submissions_log ◄── (created_at, respondent_type, lang) — no PII; public;
                                     feeds the live counters (§8)

   process_data.py
            │
            └──► does not select reports_archive; no projection or derived write
```

- `FAMILY_REPORT_PROCESSING_ENABLED` defaults to false and is resolved at runtime. Archive-only mode returns before the first family-table query in every processing stage.
- Reports stay `received` with `anonymised_at` and `summary_public` null. Corrections remain new archive rows with `supersedes`; no automated code interprets the chain.
- Withdraw marks the row `withdrawn`. Text and files remain private, and withdrawn rows are barred from any future review or handoff.
- `reports_anon`, family keys and `report_counts` remain reserved schema/code only. Enabling them is a new reviewed programme, not an operational toggle.

---

## 5. `pull_external_data.py`

```
   sources.yaml (60 sources)
        │  for each source whose cadence is due
        ▼
   fetch (browser UA, 20 s, 2 retries; ETag / If-Modified-Since where supported)
        │
        ├── unchanged since last pull?  → skip (record a `pulls` row with unchanged=true)
        │
        └── changed →  raw_pulls (source_id, fetched_at, http_status, body)   ← jsonb/text
                            │
                            ▼
                  normalise/<source_id>.py   →  figures | gauges | articles | places
                            (dedupe keys: figures = publisher+metric+scope+as_of;
                             gauges = station+observed_at; articles = url)
```

- **Wave 1 (day one):** `opmcm_stats`, `opmcm_person_reports` (counts + anonymised place/status only; images stripped at fetch), `ndrrma_rescues` (locations, counts), `ndrrma_publications` (sitrep PDFs → text → district/category tables), `bipad_river_stations`, `mofa_flashflood`, `dhm_weather`, `openmeteo_corridor`, `usgs_fdsn`, `gdacs_event`, `hot_bridge_damage`, `reliefweb_rss`, `outlet_rss_set`.
- **Wave 2 (built 30 Aug):** A — official registries: `setu_recordlist`, `police_udb`, `volunteer_bulletin_repo`, `heoc_sitreps`, `dao_nuwakot_rescued`, `dao_rasuwa_hub`, `ifrc_go`, `china_mwr`, `china_mfa_pressers`, `us_embassy_alerts`, `ndrrma_newsinfo`, `ndrrma_bulletins` (`pipeline/docs/pull_external_data/05a`); B — geospatial + text: `nesra_bucket`, `emsr927_dashboard`, `hot_tasking_manager`, `google_news_site_queries`, `ekantipur_live`, `live_blogs`, `china_search_apis`, `wikipedia_revisions`, `geofon_fdsn`, `dhm_riverwatch_post`, `ntc_restoration_articles`, `hdx_search`, `hot_s3_listing`, `oam_bbox` (`05b`). 39 of 51 sources have a normaliser; the remaining 12 (OPMCM help requests / government efforts, BIPAD series, NESRA + DoR bridges, UNOSAT extent, STAC catalogues, tag pages, GDELT) are wave 3.
- **News relevance gate:** every RSS / search / live-blog item passes `normalisers/_rss.is_relevant` (flood keywords + a corridor-place alias; district names and generic places such as Kathmandu do not count alone) before it becomes an `articles` row.
- External rows that carry PII (OPMCM person-reports, NDRRMA rescued-persons, DAO lists) are treated like form submissions: verbatim body in `raw_pulls` (ARCHIVE-grade, service-only), anonymised projection (place, status, nationality, age band, person_key from phone/name) into RAW tables.
- Fails soft per source; idempotent; a `pulls` log row every run.

---

## 6. `process_data.py`

```
   RAW (figures, gauges, articles, places) + public-source ARCHIVE (raw_pulls)
        │
        ▼
   ⓪ ARCHIVE BOUNDARY   family reports: no read, no write, no model call
        │                public OPMCM raw_pulls → minimised public-source figures
        │                (idempotent: marks each source row when done; re-runs are no-ops)
        ▼
   ① PLACE RESOLUTION    free text → gazetteer id
        │   • alias match (case/diacritic-insensitive, NE/HI/EN/ZH aliases)
        │   • OpenAI, constrained to the gazetteer list, for public article prose only
        │   • unresolved → null + logged for gazetteer growth
        ▼
   ② DEDUP / ENTITY RESOLUTION   (the serious part)
        │   blocking:   person_key  ▸ group_key  ▸ (nationality, age band)  ▸ place
        │   scoring:    exact phone 1.0 · passport 1.0 · name+age+nat (transliteration-aware,
        │               Devanagari↔Latin, Jaro-Winkler on normalised) 0.6–0.9 · same group +
        │               same last place +0.1 · conflicting sex/age −0.5
        │   thresholds: ≥0.9 auto-merge · 0.6–0.9 → dedup_queue (human) · <0.6 distinct
        │   inputs:     public OPMCM · NDRRMA rescued · Setu · DAO/public lists
        │   output:     entities (canonical, status timeline, probable place, merged_from
        │               provenance) — PRIVATE; counts flow onward
        ▼
   ③ PER-PLACE LEDGER    per gazetteer place:
        │   expected         = entities whose last-known / probable place is here
        │   confirmed_reached= public NDRRMA rescued-locations + stationed figures
        │   unknown          = expected − confirmed
        │   last_contact_at, telecom_restored, access, hazard(below lakes / in channel)
        │   phones / telecom_restored from NTC/Ncell restoration articles; last_contact_at is
        │   the last *observed* contact (null when nothing dated exists); status_label
        │   no_data | mostly_unknown | mostly_reached | district
        ▼
   ③b PRESS FIGURES      Police / Tourism / NTB counts quoted in articles → figures
        │                 (publishers "Nepal Police (via press)", "NTB (via press)" …; --step 3.5)
        ▼
   ④ FIGURES_LATEST      one row per publisher × metric × scope, latest as_of
        │                 (the side-by-side: NDRRMA · Police · MoFA · DoT · OPMCM; each column
        │                  accepts several publisher spellings, web/lib/config.ts AGENCIES)
        ▼
   ⑤ STATS               public-source striking + live numbers, recomputed each run
        │                 family report totals/buckets remain dormant
        ▼
   ⑥ FINDINGS            name collisions (Bhotekoshi RM ≠ Bhote Koshi river), entries absent
        │                 from Setu, duplicate rate, publisher divergence, unreached-by-record
        │                 → private handoff table for list-holders
        ▼
   ⑦ DIGEST              per NPT day × EN/NE/HI: 5–8 "what changed" bullets from figure deltas,
        │                 gauges, place changes and gated headlines (LLM prose, budget-guarded)
        ▼
   ⑧ TIMELINE            dated milestones from figures/articles appended to event_timeline
        │                 (seeded with the reconstructed first hours of 26 Aug)
        ▼
   ⑨ TRENDS              figure_series: last value per publisher × metric × scope × NPT day
                          (sparklines / "since yesterday" on the site)
```

Everything writes to DERIVED; one module per step under `pipeline/processing/` (`process_data.py --step N`, 3.5 = ③b). Each step catches its own errors, logs and returns; the next step still runs. Moving ①–② to a cloud/agentic setup later changes nothing else because the interface is the database.

---

## 7. The website

### Routes

```
 /{lang}                home — the viral surface
 /{lang}/report         questionnaire (types A family · B survivor · C rescuer · D agency)
 /{lang}/me             my folder — everything I contributed, status, add/correct
 /{lang}/places         all places, sortable         /{lang}/places/{id}  one place
 /{lang}/sources        every source, reliability, last fetched
 /{lang}/about          what this is / isn't · data handling · who runs it · contact
 /api/og                live OG image (the share card)
```

`lang ∈ {en, ne, hi}`. Route-based so a forwarded link carries its language. Default from browser; toggle overrides; saved to `users.lang`.

### Home page — order and purpose

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ [EN] [नेपाली] [हिन्दी]                                    Add what you know ▸ │
 ├──────────────────────────────────────────────────────────────────────────┤
 │ Police 1155 · Tourist Police 1144 · MoFA ECR +977-9744441227 ·           │
 │ Red Cross 1130 · Disaster hotline 1234 (NEOC) — not a substitute for official reporting     │
 ├──────────────────────────────────────────────────────────────────────────┤
 │ ▓▓▓ 3D CORRIDOR ▓▓▓  Gyirong → Bharatpur terrain, flood path draped,     │
 │      places as markers coloured by status, the two barrier lakes         │
 │      (react-three-fiber, lazy-loaded; numbers below paint first)         │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  7 min          ~193 km/h        9 m in 30 min      240 km               │
 │  to the port    first 22 km      at Galchhi         bodies downstream    │
 │  ── striking statistics from `stats`, one per screen on mobile ──        │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  THE NUMBERS, SIDE BY SIDE            NDRRMA  Police  MoFA  DoT  OPMCM   │
 │  dead / missing / rescued, each with as_of — and why they differ         │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  PLACES   place · reported · confirmed reached · unknown · last contact  │
 │           · telecom · access · hazard   (sorted by unknown, links)        │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  "412 people have added what they know · 38 in the last hour"            │
 │  [ Add what you know ]                                                   │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  RIVER & WEATHER   gauges alive/dead · Galchhi level · next 3 mornings   │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  LATEST   20 headlines with source                                       │
 ├──────────────────────────────────────────────────────────────────────────┤
 │  [WhatsApp] [X] [LinkedIn] [Telegram] [copy]  · last updated · sources   │
 └──────────────────────────────────────────────────────────────────────────┘
```

- Numbers and tables are server-rendered (ISR, 5 min) from DERIVED; the 3D scene is a client island loaded after first paint. Works on a weak connection in Nuwakot, looks striking on a laptop in London.
- **OG image** (`/api/og`): today's side-by-side numbers + reports count + language of the page — every WhatsApp/X/LinkedIn preview carries the live picture. This is the mechanical half of word of mouth.
- Share buttons carry prewritten text per language and a **UTM per channel**; Vercel Analytics + a `submissions_by_utm` view tell you which channel converts.
- Every number links to its source. No hazard ratings for named settlements beyond the ledger's `hazard` flag.

### Questionnaire — one box, intentionally minimal

**Principle:** the effort a person sees is one text box. The structure lives in the LLM extraction (§6 ⓪), not in the form. Prompts *suggest* what's useful; they never become fields.

```
 ┌──────────────────────────────────────────────────────────────┐
 │  Who are you?   [Looking for someone] [I was there]           │  ← one tap; sets the prompts
 │                 [Rescuer / official] [Company / group]        │
 ├──────────────────────────────────────────────────────────────┤
 │  Tell us what you know.                          🎤 speak     │
 │  ┌──────────────────────────────────────────────────────────┐ │
 │  │ Any language. As much or as little as you like.          │ │  ← THE ONLY REQUIRED FIELD
 │  │                                                          │ │
 │  └──────────────────────────────────────────────────────────┘ │
 │  Useful to include (tap to add a line):                       │
 │  [who] [where they were] [when you last heard] [what they     │  ← chips insert a prompt line
 │  said] [who they were with] [their phone number] [their plans]│     e.g. "Last heard from: "
 ├──────────────────────────────────────────────────────────────┤
 │  Where?  [ pick a place ▾ ]  (optional)                       │  ← 2 small optional fields
 │  Your phone / WhatsApp / email  [            ]  (optional,     │
 │                                  so we can follow up)         │
 ├──────────────────────────────────────────────────────────────┤
 │                       [ Send ]                                │
 └──────────────────────────────────────────────────────────────┘
```

- **Required:** the text box. Nothing else. A one-line submission ("my brother was at Timure customs at 8am Tuesday, phone 98…") is a valid, valuable row.
- **Chips, not fields.** Tapping "when you last heard" inserts "Last heard from: " into the box at the cursor. The chip set changes with the respondent type (survivor: *where you were · who was with you · who else you saw · where they went · who is still there*; rescuer: *place reached · when · how many evacuated · how many remaining · not reached*; company: *group name · how many · itinerary · last contact · accounted / unaccounted*).
- **Voice input** (Web Speech API, falls back silently) — speaking Nepali or Hindi into a phone is far easier than typing Devanagari.
- **Two optional fields only:** place picker (nudged, because it's the join key) and contact (nudged: "so we can follow up").
- **No extraction occurs.** Form fields and attachments are stored exactly in the private archive; no model or derived table receives them.
- **Success screen is a storage receipt:** it says the report is private, unprocessed, unpublished and not automatically shared. Correction/add-more actions remain.
- **"Add more" is always another box**, never a form. Corrections are new archive rows with `supersedes`.
- Official-channels line at the top. Honeypot + rate limit. Dates: whatever the person writes; the extractor normalises (hint shown once: "26 Aug = 10 Bhadra 2083").

### Where OpenAI is used (public material only)

| Moment | Call |
|---|---|
| `process_data` ① | place resolution for article prose, constrained to the gazetteer list |
| `process_data` ③b | extract public-agency figures from public news articles when deterministic parsing misses them |
| `process_data` ⑦/⑩ | translate/polish public-source digests and place summaries |

---

## 8. The virality loop

```
   someone shares the link ──► preview card shows today's numbers ──► they open it
          ▲                                                               │
          │                                                               ▼
   share buttons + "N people added"  ◄──  they see their place / add what they know
          ▲                                                               │
          │                                                               ▼
   private receipt shown ◄── report stays in ARCHIVE; public page remains source-driven
```

### Realtime counters (the "it's alive" signal)

```
   ┌──────────────────────────────────────────────────────────────────────┐
   │  ● 1,284 people here now   ·  37 contributions in the last 10 min    │
   │  ·  2,911 today   ·  last data pull 4 min ago                        │
   └──────────────────────────────────────────────────────────────────────┘
```

| Counter | Mechanism | Latency |
|---|---|---|
| **People here now** | Supabase Realtime **Presence**: every open tab joins channel `site`; the presence state size is the viewer count. Client-only, no writes, no server. | live |
| **Contributions last 10 min / today** | `submissions_log` (public, no PII; one row per submission written by the form alongside the archive row). Client subscribes to `INSERT` via Supabase Realtime and keeps a rolling count; initial value from a `v_live_counts` view. | live |
| **Last data pull** | `pulls` latest `fetched_at`, via `v_live_counts`; polled every 60 s | ~1 min |
| **Report contents folded in** | never; `report_counts` is dormant | — |

Supabase Realtime is a database feature (Postgres changes + Presence), so this stays within "Supabase as database only". Vercel Analytics is the historical/UTM view; Presence is the live one.

Seed channels (from the crowd sweep): Telegram poshuknepal (4.3k Ukrainian families), MASFIH (Malaysia — asked for a single channel), Himalayan Glacier family WhatsApp, Indian state control rooms + Hindi press, r/Nepal · r/india, NRNA UK, Isha Foundation + Kailash operators (type D), IPPAN/Doosan/Andritz (type D), Nepal Hackathon 30 Aug 09:00 NPT, NAXA/HOT, NRCS desk in Rasuwa.

---

## 9. Operations

```
   Mac (now)                                                     later: $5 VM, a crontab line
   ┌──────────────────────────────────────────────────────────────┐
   │ scripts/install_schedule.sh [minutes]   (240 tonight, 15 live)│
   │   1. detached loop  ── every N min ──► pipeline/run.sh        │  run.sh = lock ─► pull_external_data ─► process_data
   │      (pipeline/.scheduler.pid; works without Full Disk Access)│           (a tick that finds a lock < 3 h old exits 0)
   │   2. launchd agent com.nepalfloodtracker.pipeline             │
   │      (takes over once /bin/bash has Full Disk Access)         │
   │ pipeline/.env: SUPABASE_URL · SERVICE_ROLE · OPENAI · FAMILY_REPORT_PROCESSING_ENABLED=false
   └──────────────────────────────────────────────────────────────┘
   cd web && vercel --prod --yes   ← only when site code changes; only from web/
```

- **Cadence:** `PULL_INTERVAL_MINUTES` (240 tonight) lives in `pipeline/lib/config.py` and `web/lib/config.ts` and must match the installed schedule; the site's "auto-refresh every N" line and stale threshold derive from it (`docs/runbook.md` §1).
- **Secrets:** service-role + OpenAI only in `pipeline/.env` on the scheduler machine; Vercel holds only the anon key (the site has no server-side secret). Never in the repo (`.env*` gitignored repo-wide).
- **Backups:** Supabase daily backups (Pro) or a nightly `pg_dump` from the laptop to a bucket.
- **Failure modes:** a source goes down → pull skips it and the page shows last-good with timestamp · OpenAI down → public-source model-assisted steps fall back/skip; family intake is unaffected because it never calls the model · laptop closed → public data stops updating, site stays up with a stale timestamp · Vercel down → nothing is lost, DB is truth.
- **Handoff:** from day one, a named Nepal-side co-owner (NAXA / YIL / hackathon lead) with access to DERIVED and `findings`; the scripts run anywhere with the two keys.

---

## 10. Repository structure and documentation

The rule: **a new contributor should understand the whole pipeline from the folder tree and one README per folder, without reading code.** Every folder has a README that says what lives there, what writes it, what reads it, and how to run it.

```
data_aggregator/
├── README.md               ← start here: what this is, the one-screen diagram, links to everything below
├── PLAN.md                 ← this document (architecture + decisions); never stale — edit when reality changes
├── CONTRIBUTING.md         ← how to run locally, add a source, add a normaliser, add a language, add a home block, open a PR
├── PROGRESS.md             ← overnight build log: status by phase, cycle log, queue
├── Makefile · scripts/     ← make help; health.py; install_schedule.sh
├── docs/
│   ├── data-model.md       ← every table: zone, columns, who writes, who reads, RLS policy
│   ├── sources.md          ← generated from sources.yaml: one row per source with status
│   ├── decisions-log.md    ← dated, append-only
│   └── runbook.md          ← schedule, secrets, laptop → VM, backups, what to do when X breaks
│
├── sources.yaml            ← the source registry (the contract for pull_external_data)
├── gazetteer/
│   ├── places.csv          ← the corridor gazetteer (seeds the `places` table)
│   └── README.md
│
├── db/                     ← Supabase, database only
│   ├── migrations/         ← 001_archive 002_raw 003_derived 004_rls 005_realtime_storage 006_pipeline_additions 006_story_and_digest 007_series
│   ├── seed/               ← sources.sql (gen_sources.py) · places.sql (gazetteer/to_sql.py) · event_timeline.sql
│   ├── apply.py · mgmt.py  ← Management API: migrations + seeds with a _migrations ledger; query(); anonymous sign-ins
│   ├── tests/ · docs/01–07
│   └── README.md           ← how to apply, in order; how to reset
│
├── pipeline/               ← the two scripts and nothing else runs from here
│   ├── pull_external_data.py
│   ├── process_data.py
│   ├── run.sh              ← the scheduler target: lock, pull, process
│   ├── normalisers/        ← one file per source_id; def normalise(raw, fetched_at, source) -> rows
│   │   └── README.md       ← the normaliser contract + a template
│   ├── processing/         ← anonymise resolve_places dedup ledger press_figures figures_latest stats report_counts findings digest timeline trends (_series) purge_irrelevant
│   │   └── README.md       ← one paragraph per step, inputs → outputs
│   ├── docs/               ← pull_external_data/01–07 (+05a, 05b) · process_data/00–10 (+03b), numbers match the code
│   ├── lib/                ← db.py (PostgREST client) · http.py · net.py (IPv4 forcing) · text.py · llm.py (budget guard) · places.py · state.py · log.py (PII redactor) · html.py/htmlx.py
│   ├── tests/              ← a fixture per normaliser (a real saved response) + tests for dedup scoring
│   ├── requirements.txt · .env.example · README.md
│   └── snapshots/          ← gitignored local copies of raw pulls
│
└── web/                    ← Next.js app (Vercel)
    ├── app/[lang]/         ← page.tsx report/ me/ places/ places/[id]/ sources/ about/ not-found
    ├── app/api/og/         ← live OG card (node runtime)
    ├── proxy.ts            ← locale redirect (Next 16 name for middleware)
    ├── components/         ← ui/ · blocks/ (one file per home block) · form/ · me/ · three/ (3D corridor)
    ├── lib/                ← supabase.ts · i18n.ts · queries.ts (every DB read in one file) · config.ts (PULL_INTERVAL_MINUTES, AGENCIES, STAT_CARDS, GAUGE_STATIONS) · …
    ├── messages/           ← en.json ne.json hi.json — identical key sets (npm run i18n:check)
    ├── public/             ← corridor-fallback.png (no DEM: the terrain is procedural)
    ├── docs/01–14          ← architecture … deploy · 13 story & digest · 14 flood-sim spec
    ├── .env.example · README.md (dev · build · vercel link · vercel --prod · domain)
```

Conventions:
- **Names match the plan.** Tables, scripts, folders and doc sections use the same words (`archive` / `raw` / `derived`; `pull_external_data` / `process_data`).
- **One file per source, one file per processing step, one file per home block** — so a contributor changes one thing in one place.
- **Every DB read in the web app goes through `lib/queries.ts`**, so the contract with DERIVED is visible in one file.
- **Docs are generated where possible**: `docs/sources.md` from `sources.yaml`; `docs/data-model.md` checked against the migrations.
- **No PII in the repo, ever**: fixtures are anonymised; `snapshots/` and `.env*` gitignored; a pre-commit grep for phone-number patterns.

## 11. Historical build order

The sequence below records the original build. Step 5's questionnaire anonymisation is superseded by the archive-only decision in §§0–6.

```
 0  folder skeleton + READMEs + CONTRIBUTING (§10) so everyone builds in the same shape  ~30 min
 1  Supabase project · migrations (three zones) · RLS · anonymous auth · realtime    ~1 h
 2  pull_external_data.py · wave-1 sources · first rows in RAW                        ~2 h
 3  web: layout + toggle + live counters + home numbers/places/river blocks + OG       ~2 h   → deploy
 4  questionnaire type A (EN · NE · HI) + /me                                          ~2 h   → deploy → distribution starts
 5  process_data.py v1: public-source projection · figures_latest · stats · ledger      ~1.5 h
 6  3D corridor · striking-stats treatment · share/UTM                                  day 2
 7  dedup ② proper · types B/C/D · wave-2 sources · trends ⑥                            day 2–3
```

## 12. Decisions still open

1. Raw pulls as a Postgres `jsonb` table (recommended) vs Supabase Storage — affects nothing else.
2. Legacy family age-band projection remains dormant; any future use requires a new privacy design.
3. Human dedup queue: who reviews it, and from which tool (a `/admin` route behind a password, or just a Supabase table view)?
4. Hosting the 3D terrain tiles: pre-bake a low-poly mesh from Copernicus DEM into the repo (~2 MB) vs fetch tiles live — pre-bake recommended.
5. Domain email for contact/about (e.g. hello@nepalfloodtracker.com).
