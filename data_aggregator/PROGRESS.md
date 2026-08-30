# PROGRESS — overnight build log (read this first after any context reset)

**Standing orders (from Aryaa, 30 Aug 01:10 BST):** do not stop working until **10:00 BST 30 Aug**. Finish the phases, then loop on the three leverage areas below. Never over-engineer; keep everything modular (one file per source / step / block) and documented (numbered docs per script). Commit + push to `origin/main` after every unit of work (`git pull --rebase --autostash` first). Update THIS file after every cycle.

Plan of record: `/Users/aryaask/.claude/plans/ok-cool-it-s-in-validated-dragonfly.md` · architecture: `PLAN.md` · runbook: `docs/runbook.md`.

## ☀️ Handover (rewritten 10:45 BST 30 Aug — the owner is awake and directing; this stays the single place to resume from)

**Live:** https://www.nepalfloodtracker.com (EN / नेपाली / हिन्दी). Everything is on `origin/main`. Last full validation: 113 web unit · 21 e2e · 338 Python (pipeline + db + gazetteer in one call) · live smoke 30/30 · health OK. Model spend ≈ $0.05 of $20.

**What the site is now (after this morning's direction)**
1. **Home = three things** (`web/docs/17-information-architecture.md`): *Your part* (this device's contributions + the big "Add what you know" + the live counters row) → *Right now* (the three NDRRMA numbers, today's headline) → *The corridor*. Tabs: Home · Numbers · Places · Latest news · More (Sources, About, My folder, Share); phones get a bottom tab bar with ＋ in the centre. *Your part* heads every tab.
2. **The corridor v2** (`web/docs/16-corridor-v2-plan.md` §8 for status, `14-flood-sim.md` §3 for every knob): overview-only camera from above (no chase), re-authored V-gorge landscape opening to the plains, X-ray on by default so the surge shows through the walls, water deep blue at the breach browning downstream, settlements standing on their own ground (no pads), 14 objects with tested piece physics (never below ground; `?debug=1` → `__corridor.debug().belowGround`), chip tap = object in the path with a ring + name pill, story feed under the canvas on phones, "Share this run".
3. **Report form**: attachments (private `report-media` bucket, `report_files`, 10 × 50 MB, camera shortcut), decluttered one-column layout, "How it works" banner.
4. **Data**: 60 sources (55 built), per-place "now" line, digest v3, trends report (`make report`), audits in `docs/audit-2026-08-30.md`.

**Run the pipeline yourself** (nothing is scheduled by the OS): `cd data_aggregator/pipeline && .venv/bin/python scheduler.py` (4 h; `--hours 0.5` for the live phase; Ctrl-C stops). Keep `caffeinate -i` on.

**Still open (in the order I'd take them):** owner's reactions to the corridor's look (each screenshot → a rebuild); wave mass mid-run in the overview; mobile performance on a real phone (SwiftShader can't tell); ⚠️ rotate the OpenAI + Supabase service-role keys (decisions-log 02:30); `make-fallback.mjs` must be updated whenever `lib/corridor-terrain.ts` changes.

## Status by phase

| Phase | State | Evidence |
|---|---|---|
| 0 tree + docs + gazetteer | ✅ | README/CONTRIBUTING/docs, db/docs 01–07, gazetteer 90 places (19 tests) — commits 634db79, 901fe94 |
| 1 db schema live | ✅ | 26 relations, RLS, realtime, buckets; anonymous auth on; 33 live tests — f4a3f9d |
| 2 pull_external_data + 13 normalisers | ✅ | 96 tests; live run 00:20 UTC: 933 figures / 9 publishers, 276 gauges, 283 articles (relevance-gated) |
| 3 process_data ⓪–⑦ | ✅ | place_status 292 rows/73 places, stats 11, digest 3 langs, entities 9,903, findings 3 (DAO Sindhupalchok collision = 71 rows); spend $0.0038 |
| 4–5 web (all pages, form, /me, 3D, OG, realtime) | ✅ deployed | e3606d2, b142b9e; lint/i18n/46 unit/11 e2e green; https://www.nepalfloodtracker.com |
| 6 deploy + domain + schedule | ✅ | apex A → Vercel (216.150.1.1) 308 → www; detached loop scheduler (pid in `pipeline/.scheduler.pid`, 240 min) — launchd blocked by TCC until Full Disk Access |
| W2A official sources (12) | ✅ | a4a58bd, fa0a4e9 — Setu, Police UDB, DAO Nuwakot/Rasuwa, IFRC, China MWR/MFA, US Embassy, NDRRMA news/bulletins, HEOC, volunteer bulletin |
| W2B geospatial + text (14) | ✅ | 95ade57 — NESRA, EMSR927, HOT TM, Google News, ekantipur live, live blogs, China search, Wikipedia, GEOFON, DHM riverwatch, NTC, HDX, HOT S3, OAM |
| P3 processing | ✅ | 95ade57 — press_figures (3.5), timeline (8), figure_series (9, migration 007), stats 22, findings w/ summaries, dedup skip guard, digest v2 |
| Web: publisher spellings | ✅ deployed | bb01050 — all 5 side-by-side columns filled from live publishers |
| **Flood simulation (cornerstone)** | ✅ deployed 04:05 BST | `web/lib/flood-sim.ts` + `corridor-terrain.ts` + scene: auto-play breach, ride camera, honest clock from event_timeline, pop cards, drop house/bridge/bus/camp → swept, sliders (lake volume seeded from China MWR 2.0 Mm³), 13 sim tests + e2e; docs `web/docs/14-flood-sim.md` |
| S3 sources wave 3 (12) | ✅ | a389b67, d70c683 — all 51 sources now have normalisers; 231 pipeline tests |
| P4 processing + pull efficiency | ✅ | 30e0399, ae7865b — 6-thread pull (292 s vs ≈540 s), backoff, place_timeline 59→64 places, towers_restored_pct stat, help/bridge notes in ledger |
| D docs reconcile | ✅ | bf70c4b — README/PLAN/CONTRIBUTING/data-model/runbook/decisions D-025–D-039 |

## Cycle log
- 11:05 BST — V3 first-visit walkthrough landed + deployed (9efd2c5, f189a1e): home names the event in the first viewport, duplicated digest headline suppressed, compact Your part on sub-tabs, jargon removed ("since last update"), tab highlight fixed on /report, unknown-pill caption on place cards, h1s. Corridor: plain explainer under the heading, feed placeholder while loading (dc95dc2). One pipeline tick running on request-free basis to refresh numbers (scheduler.py --once).
- 10:55 BST — Corridor polish: staggered pops, darker mud scar, spray only in fast deep cells (86831ee). Lane V3 (first-time-visitor walkthrough) running.
- 10:35 BST — Corridor v2 polish deployed: portrait fit runs along the corridor; placement cue = big pulsing ring + name pill over the object; far-camera label thinning (top-8 only); fallback PNG re-rendered for the v2 landscape (183151e).
- 10:20 BST — Corridor v2 iteration deployed after the owner's live review: overview-only camera (steeper pitch so the floor is visible), landscape re-authored (V-gorge with a flat river floor opening to plains), plate cropped to the corridor band, no pads/rings (houses stand on their own ground, roofs carry the status colour), water deep blue at the breach browning downstream with foam only at the crest, X-ray on by default with depth-write off so the surge shows through the walls, pieces leaving the band retire, off-plate places skipped. IA2 landed: Your part (with live counters) heads every tab; Latest → Latest news.
- 10:20 BST — **Corridor v2 + new IA deployed.** Scene split into modules with one ground truth (contracts in `scene/types.ts`), pure libs with tests (catalogue 14 kinds, piece physics with a never-below-ground invariant, exact camera fit/pan), the look lane's terrain ramp/sky/lights/river/extent/markers/labels, phone story feed under the canvas, chip tap = immediate in-path placement with marker + pops, X-ray terrain, Frame button, impact cam; e2e asserts `belowGround === 0`. IA lane: three-thing home (Right now · corridor · Your part), Numbers / Places / Latest / More tabs, bottom tab bar on phones (`web/docs/17-information-architecture.md`). 113 web unit + 21 e2e green. Next: tuning pass with screenshots (spray density, ride distance, terrain contrast), plan doc phase table.
- 09:15 BST — Owner's morning requests shipped + deployed: (1) attachments on the report form (private `report-media` bucket, `report_files`, migration 011; photos/video/voice/docs, camera shortcut, progress, /me chips) and a decluttered one-column form with "How it works" as a banner (c2f1e55); (2) "Your part" block first on the home page with the Add button, header now Sources · About · Share (native share on phones), server-rendered language toggle, real favicon + apple icon + manifest (e88b495); (3) `/sources` rows expand to exactly what was extracted (views 012, lane W8, eea32d2). Vercel Analytics was already mounted in the layout. Scheduler replaced by `pipeline/scheduler.py` at the owner's request (9b8ecb3).
- 08:50 BST — Owner (awake) asked to remove the "bash" login item and run the schedule explicitly: launchd agent + detached loop removed (`install_schedule.sh --remove`); new `pipeline/scheduler.py` (serial loop: pull → process → sleep N h; `--hours`, `--once`, `--skip-first`; Ctrl-C clean) + `make schedule`; runbook §1, README, decisions D-049 updated. Nothing runs until the owner starts it. Home places block capped at 12 rows with "Show all" (970df26).
- 08:28 BST — P9 dedup precision (3096559; 285 tests): same-name merges 83 % (OPMCM) / 87 % (NDRRMA) strict, 97–99 % lenient; added an age-gap guard (> 8 years apart → distinct, 4–8 → queue), merged entities 3,678 → 3,586, 200 grey pairs queued, stat caption corrected in EN/NE/HI. Gap noted: OPMCM ↔ NDRRMA records never link yet (name normalisation differs) — a next step for the dedup, not tonight.
- 07:24 BST — Foam spray at the wave front + foam tint thresholds fixed for real browser speeds (d752362, deployed). `npm run smoke:live` added (c61281b): 30 checks over every route × language, OG, sitemap, robots, apex redirect.
- 07:00 BST — P8: the OPMCM jump (10,809 → 15,190 open lost-person reports) is the portal's own intake (+6,466 reports in 24 h; two endpoints agree; parser verbatim) — documented in docs/audit-2026-08-30.md (ff8e31e); the site's cell already says "open lost-person reports". No data changed.
- 06:52 BST — P7 landed (00f37c7; 281 tests): `make report` → `docs/reports/2026-08-30-morning.md` (headline deltas per publisher, where the unknowns are, help-request hotspots, rescue throughput, infrastructure, data quality). Flags: OPMCM open lost-person reports jumped 10,809 → 15,190 between pulls (lane P8 checking parser vs portal); no publisher has issued a new headline number today (24 h deltas ±0); 50 places with 1,553 people reported and no rescue/stationed record at all.
- 06:45 BST — T1 landed + deployed (2a04a73): 41 NE / 34 HI strings made natural and consistent, glossary in web/docs/03-i18n.md. Five report/me strings that promised reports are "passed to the authorities" softened in all languages (8bd3d7c) — no export channel exists yet (owner's decision: none in this build).
- 06:39 BST — Share text (WhatsApp/X/Telegram) now carries the hook and the ask in en/ne/hi (eeebb63, deployed). About page NE checked at 390 px. Launched T1: translation review of all 416 NE/HI strings for naturalness and consistent terms before distribution.
- 06:33 BST — "Share this run" now links to `/{lang}/run?swept=N&bridges=M`, a tiny landing whose OG card reads "I watched N things and M real bridges go — play the breach yourself" (eb2fb13, deployed). W6 landed (bcf6962): About explains the animation, 60 sources, quoted figures and the now-line; `/sources` subtitle. Softened the design's "reports go to Police/MoFA" claim (no export tool exists yet — owner decision D: none in this build).
- 06:28 BST — Chase camera settled (steeper, above the gorge walls; 45de82b) + doc 14 pass-3 notes. robots.txt + sitemap.xml (285 URLs) added (fa953bb). Launched W6: About page section on the simulation + data handling copy for 60 sources.
- 06:22 BST — V2's independent sim review (10 ranked defects) → pass 3 shipped + deployed (8913503): chase camera along the channel with a water-surface floor, opens on the collapse; fixed pop-card column, no cards for empty places; arming pauses the ride; breach defaults "sudden"; bridges need a real flood (default 2 Mm³ still takes 7/10 real bridges, 0.5 Mm³ spares most); real bridges ≥ 3 km apart; mud stain persists on the terrain; camera shake; translucent markers while riding; 40 px tap targets; reset counter bug. 90 web unit tests, 15 e2e.
- 06:20 BST — X1 PII/secrets sweep: no secrets in HEAD or in tonight's 87 commits; no .env/snapshots/xlsx ever tracked; ignore rules + .vercelignore verified; two ReliefWeb fixtures scrubbed of press-office emails/phone (76c4790). Owner action: none beyond the scheduled key rotation.
- 06:15 BST — W5 landed + deployed (30a0770): report flow verified in NE/HI at 390 px (who-cards, chips per type, place picker in the reader's script, understood state, /me trail, withdraw); place-picker ranking fixed (exact name first); 89 web unit tests. All 8 test reports in the archive are withdrawn; public counters 0. Launched V2 (independent QA of the flood sim) and X1 (PII/secrets sweep before the morning).
- 06:05 BST — OG share card now carries "▶ Watch the flood run the corridor — drop a house in its path" (en/ne/hi) under the three numbers (00465d1, deployed). Digest v3 confirmed live (help requests, NRCS context, gauges, watch, news). Lane W5 (report flow QA in NE/HI) running.
- 06:05 BST — Scheduled tick 05:47 ran the new code end-to-end: pull 26 due sources ok (105 s), process all steps 567 s, 23 model calls ($0.047 total so far). Questionnaire path verified on the LIVE site with two marked test reports: submit → "We understood" → /me Received → anonymised by the run (summary "12 people · airlifted from Syabrubesi to Dhunche · 29 Aug · road to Timure cut", place syabrubesi_helipad, status rescued) → /me trail Received/Anonymised/Processed/Not yet matched. Test rows withdrawn, reports_anon rows deleted, submissions_log rows 3–4 deleted → counters 0.
- 05:40 BST — P6 landed (1c6ca31, 0045c8c, f6d6f23; 274 tests): place_timeline PK (place, day, kind) via migration 010 — 311 duplicate rows gone; digest v3 adds help-request and "as quoted by NRCS" context bullets, districts excluded from gaps; `*_quoted` metrics guarded in stats/digest and by a web config test; figures_latest now 36 publishers.
- 05:22 BST — V1 visual QA landed + deployed (36a564b): no overflow anywhere; swipe hints on wide tables, delta labels wrap, ↗ links no longer orphan, /me empty CTA. Corridor: solid caption chip, thinner stems while riding (4491400). Launched P6: collapse duplicate place_timeline rows per place×day×kind, digest check after the 05:41 run, guard that `*_quoted` metrics never headline.
- 05:20 BST — S4 landed (cc8101a; 261 tests): ~40 candidates probed, 9 registered (sources.yaml 51 → 60), 4 built and live: NRCS situation updates (PDF text), BIPAD incident API (event not yet entered by NEOC), 7 more feeds (ICIMOD, INSEC, Radio Nepal, Khabarhub, Setopati NE, Himalkhabar, Deshsanchar), ReliefWeb report pages with full bodies. `*_quoted` metrics are labelled and never headline-mapped. docs/sources.md regenerated (60).
- 05:05 BST — W4 landed + deployed (53f5886): place pages "What is happening now" card, table notes from the now-line, NDRRMA sparklines "+N since yesterday", OPMCM cell labelled as open reports, derived sources on /sources, single-title Latest, towers_restored_pct card. 84 web unit tests, 15 e2e. S4 (source discovery) running.
- 04:52 BST — U3 (web UX/trends) never produced output → stood down. Lane W4 launched with its concrete list (place-page now-line, sparklines, Q1 web follow-ups, towers card). Lane S4 launched: source discovery beyond the catalogue from the research deep-dives + build the best 5.
- 04:45 BST — P5 landed (0aa770e; 246 tests): step ⑩ place_now → `place_status.now_en/ne/hi` for 79/79 places ($0.015/run), police_udb district pages pooled (main thread 136 s → 0). Corridor place card now shows the "now" line (aef2080, deployed). U3 (web UX/trends) silent for 70 min — pinged; if no reply by 05:00 the main session takes its items: place page now-line, sparklines, Q1 web follow-ups, towers_restored_pct card.
- 04:35 BST — Q1 audit landed (cb3055b, 86bb60f; `docs/audit-2026-08-30.md`; 234 tests): Latest ordering fixed (migration 009), 43 KP articles dated from URLs, missing-divergence stat compares people not report queues, ledger reconcile guard. Web follow-ups queued behind U3: OPMCM "missing" cell = `lost_open` report queue (label), `/sources` derived `ntc_restoration_articles` shows never-fetched, Latest duplicates each title in markup, add `towers_restored_pct` to STAT_CARDS. Next deploy flips the ISR-cached Latest.
- 04:18 BST — Flood sim pass 2 deployed (2b2a685): 10 real washed-out/damaged bridges from the HOT OSM survey pre-placed on the path and swept as the wave passes ("real bridges lost 7/10"), crest highlight, "Share this run" (navigator.share → WhatsApp fallback). Scoreboard hydration warning fixed (6476552). Launched lane P5: per-place "now" summary (budget-guarded) + police_udb sub-fetch pooling. U3 still running.
- 04:08 BST — Flood sim shipped + deployed (see table). Lanes S3, P4, D done and pushed; U3 (web UX/trends, no corridor files) still running. Known: React #418 hydration text mismatch on /en is PRE-EXISTING (seen on live before the sim) — find the server/client time string and add suppressHydrationWarning. Next: STAT_CARDS add `towers_restored_pct` once U3 lands (config.ts), Makefile/pipeline README wording (D lane report), `make health`, then sim polish (whitecaps, share card) if time remains.
- 03:31 BST — resumed after the usage-limit reset; relaunched S3/P4/D/U3; built the flood sim in the main session.
- 02:15 BST — ⏸ SESSION USAGE LIMIT hit; all four cycle-4 lanes (S3/U3/P4/D) died at launch with 429 before producing files (nothing to salvage; worktree clean). Owner: "wait 2 hours then go again" → 2-h timer set, resume ≈ 04:15 BST. Owner also set the NEW TOP PRIORITY: the 3D corridor becomes an animated, interactive flood simulation ("Turbo Dismount"-style: drop houses/bridges/buses in the path, watch them get swept, replay, sliders for lake volume/breach) — spec in `web/docs/14-flood-sim.md`. On resume: (1) build the flood sim myself in web/ (cornerstone), (2) relaunch lanes S3, P4, D, U3 with the same briefs (see "In flight").
- 02:10 BST — context compacted (auto-compact now ON per owner). W2B + P3 tested (192 pass) and pushed 95ade57; web columns fixed + deployed bb01050. Owner asleep. Launching cycle 4: S3 sources (12 unbuilt ids), U3 web (mobile pass, trends, place timeline), P4 processing + pull efficiency, D docs reconcile.
- 03:05 BST — launchd job never ran (EX_CONFIG: TCC blocks bash under ~/Desktop); replaced by a detached loop (pid in pipeline/.scheduler.pid, 240 min) + launchd kept for when the owner grants /bin/bash Full Disk Access. Runbook §1 updated.
- 02:55 BST — stat cards ranked with thresholds (19f9f44); test rows purged from public counters; flying windows 3 days; gauge tiles fixed. Lanes W2A/W2B/P3 still running.
- 02:35 BST — ⚠️ see decisions-log 02:30: rotate OpenAI + Supabase service-role keys in the morning (accidental Vercel upload of pipeline/, deleted). Fixed: gate ignores Kathmandu/district-only headlines; 3 flying-window days; gauge tiles match DHM names (667f9c3). Stats now 22 rows (P3 in progress).
- 02:00 BST — live review: digest card + first-hours block live; fixed district rows swamping places table (web split, 14188e8); log redactor no longer masks dates; asked ledger lane for true last_contact_at semantics; asked P3 for press_figures (fill Police/DoT columns) + stricter digest news pick.

## Cycle 4/5/6 lanes — S3 ✅ P4 ✅ D ✅ Q1 ✅ P5 ✅ W4 ✅ S4 ✅ V1 ✅ P6 ✅ W5 ✅ · X1 ✅ V2 ✅ · U3 ✗ (no output)
- S3 sources lane: opmcm_help_requests, opmcm_government_efforts, bipad_river_series, nesra_bridges, dor_rimes_bridges, microsoft_unosat_extent, outlet_tag_pages, gdelt_monitor, vantor_stac, planet_stac, cdse_catalogue, hf_fair_footprints.
- U3 web lane: 390/1280 screenshots of every page, fix layout issues; figure_series trends on the site; place "Status, day by day" coverage; digest render check; deploy from web/ only.
- P4 processing lane: pull efficiency (thread pool + per-source backoff), place_timeline coverage, divergence/dedup stats, help-request ledger fields once S3 lands.
- D docs lane: README/runbook/PLAN/data-model/decisions-log reconciled with shipped reality (steps 3.5/8/9, loop scheduler, 007 tables).

## Previously in flight (01:25 BST)
- pipeline lane (agent, resumed): scripts + processing + tests + docs + first live run; asked to add article relevance gate and digest step ⑦.
- web agent: home blocks "The first hours" (event_timeline, 17 rows seeded via 006 + seed) and "What changed today" (digest), OG "updated N min ago".
- db: 006_story_and_digest.sql + 006_pipeline_additions.sql (trigger role fix) applied — commits 1c54104 + next.

## Immediate next steps (in order)
1. When the pipeline lane reports: run `make health`; check figures_latest/gauges/articles/stats/place_status; fix anything broken; `pytest pipeline/tests`.
2. `scripts/install_schedule.sh` (240 min) → confirm `run.log` + `launchctl print`.
3. Commit + push pipeline. Reconcile docs (README run steps, runbook) with what actually shipped.
4. Then the improvement loop below, one cycle at a time, each cycle = code + test + docs + push + update this file.

## Improvement loop (Aryaa's three leverage areas)

### i) More data sources (wave 2) — the catalogue has ~40 more: `aryaa_research_general/11-data-catalogue-2026-08-29.md`, `sources.yaml`
Priority order (value ÷ effort), each = sources.yaml entry (if missing) + `normalisers/<id>.py` + fixture + test + `docs/pull_external_data/05-sources.md` row:
- [ ] `setu_recordlist` — NDRRMA family-intake counts by status (HTML cards)
- [ ] `police_udb` — per-district body counts (HTML, `curl -k`)
- [ ] `nesra_bucket` — summary.json (buildings 3,216, bridges 62, reach km) → figures + bridge status
- [ ] `emsr927_dashboard` — AOI stats (buildings affected, roads, bridges, population) → figures scope place:*
- [ ] `hot_tasking_manager` — mapping/validation % per project → figures
- [ ] `volunteer_bulletin_repo` — CSV counts (heli rescues, foreign rescued, hospital) → figures
- [ ] `ntc_restoration_articles` — parse tower-restoration articles → place phones (feeds ledger)
- [ ] `google_news_site_queries` — Google News RSS for outlets without RSS (KP tags, THT, Republica, ekantipur…) → articles
- [ ] `ekantipur_live` — live page sub-headlines → articles with places
- [ ] `live_blogs` — BBC/CNN/NBC/Guardian/ABC live pages → articles (timestamped posts)
- [ ] `china_search_apis` — People's Daily + The Paper → Tibet-side articles/figures
- [ ] `wikipedia_revisions` — infobox numbers + citations as crawl seeds
- [ ] `dhm_riverwatch_post` — direct DHM POST (redundant with BIPAD mirror; only if BIPAD lags)
- [ ] `hdx_search`, `hot_s3_listing`, `vantor_stac`, `planet_stac`, `oam_bbox`, `cdse_catalogue`, `hf_fair_footprints` → `datasets` awareness (articles-like rows: "new imagery/dataset available") — low priority for rescuers, good for /sources freshness
- [ ] `geofon_fdsn`, `ifrc_go`, `china_mwr`, `china_mfa_pressers`, `us_embassy_alerts`, `mofa` (done), `heoc_sitreps` (image → skip OCR), `dao_*` (PDF/XLSX counts), `openmeteo` (done)

### ii) UX + pull efficiency
- [ ] **Headline relevance**: only flood-related articles reach `articles` (keyword filter in the RSS normalisers; shared list in lib/config) — the KP "robotic strides" story must not appear
- [ ] Home: a "Today / what changed" block (from `digest` table, see iii) between scoreboard and corridor on mobile? Keep design order; add as block 07b "What changed"
- [ ] Place pages: fill `place_timeline` from articles+figures so "Status, day by day" is never empty for corridor places
- [ ] Pull efficiency: ETag/hash skip already; add per-source backoff on repeated failures; parallel fetch (thread pool 6) in pull_external_data
- [ ] OG card: show "updated N min ago"; share text per language reviewed
- [ ] Mobile: check 390px screenshots of every page after each cycle (`npx playwright screenshot`)

### iii) Processing — "what happened and what is happening now"
- [ ] `stats` live facts from data: rescued/day (NDRRMA series), bodies by district trend, towers restored count, places reached vs not, gauges alive/dead, days since event, divergence of missing counts (max/min), submissions today
- [ ] `digest` table (new derived, public): per day, per language, 5–8 bullet "what changed" from figures deltas + top articles; LLM-written EN → NE/HI; budget-guarded; shown on home + OG? (home only)
- [ ] `place_timeline` from dated figures/articles (alias-resolved) — the rescuers' per-place picture
- [ ] `findings` real checks (OPMCM DAO Sindhupalchok collision; NDRRMA vs Police vs MoFA reconciliation) → shown on /sources? No: keep private, export later
- [ ] dedup ②: form ⋈ OPMCM anonymised rows with person_key (phone) — measure duplicate rate, surface count in stats ("N duplicate reports merged")
- [ ] Event timeline (`event_timeline` derived table + home block "The first 10 hours") from the DHM technical report + NDRRMA sitreps — the "what happened" story for carriers

## Decisions made overnight (also in docs/decisions-log.md)
- 2026-08-30 01:05 — /report collapsed to one page (selector + box + send); family preselected.
- 2026-08-30 00:50 — launchd + caffeinate instead of cron on the Mac (survives logout; user runs own `caffeinate -i`).

## Test data in the live DB
- reports_archive: RLS probe row (withdrawn) from db/tests; web e2e "TEST REPORT — please ignore" (withdrawn); pipeline lane will add one synthetic row (withdrawn after).
