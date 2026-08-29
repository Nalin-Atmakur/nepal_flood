# nepalfloodtracker.com — architecture and plan

*Definitive version, 29 Aug 2026 ~22:30 UK. Supersedes the earlier draft. Planning document — nothing here is built yet.*

## 0. Principles

1. **The database is the single source of truth.** Scraped, contributed and computed data all live in Supabase. The website is a portal into it; the scripts are readers and writers. Nothing exists only on a laptop or only on the site.
2. **Two scripts, run every 15 minutes:** `pull_external_data` (external sites/APIs → raw) and `process_data` (raw + contributed → metrics, trends, dedup → derived).
3. **Users contribute raw; the pipeline anonymises.** Submissions are stored verbatim in an **archive** zone. `process_data` anonymises only the rows it hasn't seen yet into the raw zone, then processes. Every user has a UUID and can see what *they* contributed.
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
                            │ reads RAW + ARCHIVE                     │ reads DERIVED
                            ▼                                         ▼
              ┌─────────────────────────────┐          ┌─────────────────────────────┐
              │ process_data.py             │          │ website (Next.js on Vercel) │
              │ every 15 min · laptop now,  │          │ ISR every 5 min             │
              │ cloud later                 │          │ deploy only on code change  │
              │ anonymise new → resolve →   │          │ /  /report  /me  /places    │
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
 │ (PII)       │                           │ process_data (service role)      │
 ├─────────────┼───────────────────────────┼──────────────────────────────────┤
 │ RAW         │ pull_external_data        │ process_data                     │
 │ (anonymised)│ process_data (anonymiser) │ (never the public site)          │
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
- **My folder (`/me`)**: `select * from reports_archive where user_id = auth.uid()` — server-enforced. Shows every submission with its status (received → anonymised → processed → matched to place X), and lets the user add more or correct (a correction is a new row with `supersedes = <old id>`; process_data takes the latest).

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

   …then, on the next process_data run (≤15 min):

   reports_archive where anonymised_at is null
            │
            ▼
   anonymise (step ⓪ of §6):
       • drop: names, phones, passport, photo, reporter contact
       • keep: respondent_type, places, times, counts, statuses, purpose, mode,
               operator/project, nationality, age band, sex
       • derive: person_key = sha256(normalised phone) if phone
                             else sha256(normalised name + age + nationality)
                 group_key  = normalised operator/project/pilgrim group
       • free text → OpenAI: redact PII, extract {place, count, status, time},
                 resolve place text → gazetteer id, detect language, translate to EN
            │
            ├──► reports_anon (RAW) ◄── anonymised row + extracted fields + archive_id
            └──► reports_archive.anonymised_at = now()
```

- The website does nothing privileged: no server action, no OpenAI key in the app. Simpler, and a submission is never lost because a model call failed — it just waits for the next run.
- `person_key` is what lets dedup and cross-list matching work **without names in RAW**. Same phone on two submissions → same key. Name-based keys are weaker (spelling) — see §6.
- Where a match genuinely needs the name (e.g. against OPMCM's free-text rows), `process_data` does it with the service role in the ARCHIVE zone and emits only entity ids and counts.
- Corrections: a new archive row with `supersedes = <old id>`; the anonymiser copies the flag; the ledger takes the latest.
- Photos: Storage `report-photos` (private); path in archive only.

---

## 5. `pull_external_data.py`

```
   sources.yaml (51 sources)
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
- **Wave 2:** tag pages, live blogs, ekantipur live page, Chinese search APIs, Wikipedia revisions, GDELT, geospatial catalogues (HDX/EMSR927/NESRA/STAC/OAM), Setu, Police UDB counts, DAO lists (counts only).
- External rows that carry PII (OPMCM person-reports, NDRRMA rescued-persons, DAO lists) are treated like form submissions: verbatim body in `raw_pulls` (ARCHIVE-grade, service-only), anonymised projection (place, status, nationality, age band, person_key from phone/name) into RAW tables.
- Fails soft per source; idempotent; a `pulls` log row every run.

---

## 6. `process_data.py`

```
   RAW (figures, gauges, articles, reports_anon, places)  +  ARCHIVE (reports_archive, raw_pulls)
        │
        ▼
   ⓪ ANONYMISE NEW      reports_archive where anonymised_at is null → reports_anon (§4)
        │                raw_pulls of PII sources not yet projected   → anonymised RAW rows
        │                (idempotent: marks each source row when done; re-runs are no-ops)
        ▼
   ① PLACE RESOLUTION    free text → gazetteer id
        │   • alias match (case/diacritic-insensitive, NE/HI/EN/ZH aliases)
        │   • OpenAI, constrained to the gazetteer list, for prose (articles, form free text)
        │   • unresolved → null + logged for gazetteer growth
        ▼
   ② DEDUP / ENTITY RESOLUTION   (the serious part)
        │   blocking:   person_key  ▸ group_key  ▸ (nationality, age band)  ▸ place
        │   scoring:    exact phone 1.0 · passport 1.0 · name+age+nat (transliteration-aware,
        │               Devanagari↔Latin, Jaro-Winkler on normalised) 0.6–0.9 · same group +
        │               same last place +0.1 · conflicting sex/age −0.5
        │   thresholds: ≥0.9 auto-merge · 0.6–0.9 → dedup_queue (human) · <0.6 distinct
        │   inputs:     reports_anon (+archive for name checks) · OPMCM · NDRRMA rescued ·
        │               Setu · DAO lists · operator manifests (type D)
        │   output:     entities (canonical, status timeline, probable place, merged_from
        │               provenance) — PRIVATE; counts flow onward
        ▼
   ③ PER-PLACE LEDGER    per gazetteer place:
        │   expected         = entities whose last-known / probable place is here
        │   confirmed_reached= NDRRMA rescued-locations + stationed + rescuer reports (type C)
        │   unknown          = expected − confirmed
        │   last_contact_at, telecom_restored, access, hazard(below lakes / in channel)
        ▼
   ④ FIGURES_LATEST      one row per publisher × metric × scope, latest as_of
        │                 (the side-by-side: NDRRMA · Police · MoFA · DoT · OPMCM · NEOC)
        ▼
   ⑤ STATS               the striking numbers, recomputed each run:
        │                 wave speed & time-to-port, rise at Galchhi, bodies-downstream km,
        │                 personnel, helicopters, N reports last hour/day, places with
        │                 unknown>0, gauges alive/dead, next flying window
        ▼
   ⑥ TRENDS (later)      OpenAI/agentic pass over the day's articles + reports_anon:
        │                 what changed, where reports cluster, which places went quiet
        ▼
   ⑦ FINDINGS            duplicates across official lists, name collisions
                          (Bhotekoshi RM ≠ Bhote Koshi river), private-list entries absent
                          from Setu, stale lists → handoff table for list-holders
```

Everything writes to DERIVED. v1 runs as pandas on the laptop; moving ①–② to a cloud/agentic setup later changes nothing else because the interface is the database.

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
 │ Red Cross 1130 · NEOC 1149 — not a substitute for official reporting     │
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
- **Extraction does the rest** (§6 ⓪): the full schema — name, phones, passport, last-communication place/time/channel, what was said, plans, group, operator, employer/project, already-reported-to, news since; or survivor/rescuer/agency equivalents — is populated from the text by the model into `reports_anon` (anonymised) and, for names/phones, kept only in `reports_archive`.
- **Success screen closes the loop:** "We understood: 1 person · last at Timure · 26 Aug ~08:00 · in a group of 12 with an agency · phone given. Correct anything?" — one tap to fix, one tap to add more (opens the same box again, pre-typed with "Also: "). Then share buttons.
- **"Add more" is always another box**, never a form. Corrections are new archive rows with `supersedes`.
- Official-channels line at the top. Honeypot + rate limit. Dates: whatever the person writes; the extractor normalises (hint shown once: "26 Aug = 10 Bhadra 2083").

### Where OpenAI is used (only inside `process_data`; the website never calls it)

| Moment | Call |
|---|---|
| `process_data` ⓪ | on each new archive row: redact PII from free text · extract {place, count, status, time} · resolve place text → gazetteer id · detect language · translate free text to EN |
| `process_data` ① | place resolution for article prose, constrained to the gazetteer list |
| `process_data` ② | adjudicate ambiguous dedup pairs (0.6–0.9) with a structured yes/no + reason → still queued for a human if low confidence |
| `process_data` ⑥ | daily trend narrative over articles + reports_anon |

---

## 8. The virality loop

```
   someone shares the link ──► preview card shows today's numbers ──► they open it
          ▲                                                               │
          │                                                               ▼
   share buttons + "N people added"  ◄──  they see their place / add what they know
          ▲                                                               │
          │                                                               ▼
   the page gets better  ◄── process_data folds it in within 15 min ◄── reports_archive/anon
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
| **Contributions folded in** | `report_counts` (DERIVED), refreshed by `process_data` | ≤15 min |

Supabase Realtime is a database feature (Postgres changes + Presence), so this stays within "Supabase as database only". Vercel Analytics is the historical/UTM view; Presence is the live one.

Seed channels (from the crowd sweep): Telegram poshuknepal (4.3k Ukrainian families), MASFIH (Malaysia — asked for a single channel), Himalayan Glacier family WhatsApp, Indian state control rooms + Hindi press, r/Nepal · r/india, NRNA UK, Isha Foundation + Kailash operators (type D), IPPAN/Doosan/Andritz (type D), Nepal Hackathon 30 Aug 09:00 NPT, NAXA/HOT, NRCS desk in Rasuwa.

---

## 9. Operations

```
   laptop (now)                              later: $5 VM, same crontab
   ┌────────────────────────────────┐
   │ */15 * * * *  pull_external_data.py && process_data.py  >> run.log │
   │ .env: SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY OPENAI_API_KEY        │
   └────────────────────────────────┘
   vercel --prod   ← only when site code changes (design, new block, new field)
```

- **Secrets:** service-role + OpenAI on the laptop and in Vercel server env; anon key in the browser. Never in the repo (`.env*` gitignored repo-wide).
- **Backups:** Supabase daily backups (Pro) or a nightly `pg_dump` from the laptop to a bucket.
- **Failure modes:** a source goes down → pull skips it, page shows last-good with timestamp · OpenAI down → submission still archived; anonymisation retried by process_data · laptop closed → data stops updating, site stays up with stale timestamp (visible) · Vercel down → nothing lost, DB is truth.
- **Handoff:** from day one, a named Nepal-side co-owner (NAXA / YIL / hackathon lead) with access to DERIVED and `findings`; the scripts run anywhere with the two keys.

---

## 10. Repository structure and documentation

The rule: **a new contributor should understand the whole pipeline from the folder tree and one README per folder, without reading code.** Every folder has a README that says what lives there, what writes it, what reads it, and how to run it.

```
data_aggregator/
├── README.md               ← start here: what this is, the one-screen diagram, links to everything below
├── PLAN.md                 ← this document (architecture + decisions); never stale — edit when reality changes
├── CONTRIBUTING.md         ← how to run locally, add a source, add a normaliser, add a language, add a home block, open a PR
├── docs/
│   ├── architecture.md     ← the diagrams from §1–§8, kept in sync
│   ├── data-model.md       ← every table: zone, columns, who writes, who reads, RLS policy
│   ├── sources.md          ← generated from sources.yaml: one row per source with status
│   └── runbook.md          ← cron, secrets, laptop → VM, backups, what to do when X breaks
│
├── sources.yaml            ← the source registry (the contract for pull_external_data)
├── gazetteer/
│   ├── places.csv          ← the corridor gazetteer (seeds the `places` table)
│   └── README.md
│
├── db/                     ← Supabase, database only
│   ├── migrations/         ← 001_zones.sql 002_archive.sql 003_raw.sql 004_derived.sql 005_rls.sql 006_realtime.sql
│   ├── seed/               ← sources + places seeds
│   └── README.md           ← how to apply, in order; how to reset
│
├── pipeline/               ← the two scripts and nothing else runs from here
│   ├── pull_external_data.py
│   ├── process_data.py
│   ├── run.sh              ← the cron target: pull && process
│   ├── normalisers/        ← one file per source_id; def normalise(raw, fetched_at, source) -> rows
│   │   └── README.md       ← the normaliser contract + a template
│   ├── processing/         ← anonymise.py resolve_places.py dedup.py ledger.py stats.py findings.py
│   │   └── README.md       ← one paragraph per step, inputs → outputs
│   ├── lib/                ← db.py (supabase client), http.py (fetch with UA/retries), text.py (normalise/transliterate), llm.py (OpenAI wrapper)
│   ├── tests/              ← a fixture per normaliser (a real saved response) + tests for dedup scoring
│   ├── requirements.txt · .env.example · README.md
│   └── snapshots/          ← gitignored local copies of raw pulls
│
└── web/                    ← Next.js app (Vercel)
    ├── app/[lang]/         ← page.tsx report/ me/ places/ sources/ about/
    ├── app/api/og/
    ├── components/         ← blocks/ (one file per home block) · form/ · three/ (3D) · Share.tsx · LangToggle.tsx · LiveCounters.tsx
    ├── lib/                ← supabase.ts · i18n.ts · queries.ts (every DB read in one file)
    ├── messages/           ← en.json ne.json hi.json — identical key sets, CI-checked
    ├── public/terrain/     ← pre-baked corridor mesh
    ├── .env.example · README.md (dev · build · vercel link · vercel --prod · domain)
```

Conventions:
- **Names match the plan.** Tables, scripts, folders and doc sections use the same words (`archive` / `raw` / `derived`; `pull_external_data` / `process_data`).
- **One file per source, one file per processing step, one file per home block** — so a contributor changes one thing in one place.
- **Every DB read in the web app goes through `lib/queries.ts`**, so the contract with DERIVED is visible in one file.
- **Docs are generated where possible**: `docs/sources.md` from `sources.yaml`; `docs/data-model.md` checked against the migrations.
- **No PII in the repo, ever**: fixtures are anonymised; `snapshots/` and `.env*` gitignored; a pre-commit grep for phone-number patterns.

## 11. Build order (when you say go)

```
 0  folder skeleton + READMEs + CONTRIBUTING (§10) so everyone builds in the same shape  ~30 min
 1  Supabase project · migrations (three zones) · RLS · anonymous auth · realtime    ~1 h
 2  pull_external_data.py · wave-1 sources · first rows in RAW                        ~2 h
 3  web: layout + toggle + live counters + home numbers/places/river blocks + OG       ~2 h   → deploy
 4  questionnaire type A (EN · NE · HI) + /me                                          ~2 h   → deploy → distribution starts
 5  process_data.py v1: anonymise ⓪ · figures_latest · stats · ledger from counts      ~1.5 h
 6  3D corridor · striking-stats treatment · share/UTM                                  day 2
 7  dedup ② proper · types B/C/D · wave-2 sources · trends ⑥                            day 2–3
```

## 12. Decisions still open

1. Raw pulls as a Postgres `jsonb` table (recommended) vs Supabase Storage — affects nothing else.
2. Age stored as a **band** (0–17 / 18–39 / 40–64 / 65+) in RAW, exact in ARCHIVE — recommended for anonymisation.
3. Human dedup queue: who reviews it, and from which tool (a `/admin` route behind a password, or just a Supabase table view)?
4. Hosting the 3D terrain tiles: pre-bake a low-poly mesh from Copernicus DEM into the repo (~2 MB) vs fetch tiles live — pre-bake recommended.
5. Domain email for contact/about (e.g. hello@nepalfloodtracker.com).
