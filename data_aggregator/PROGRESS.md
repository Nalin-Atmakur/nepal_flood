# PROGRESS — overnight build log (read this first after any context reset)

**Standing orders (from Aryaa, 30 Aug 01:10 BST):** do not stop working until **10:00 BST 30 Aug**. Finish the phases, then loop on the three leverage areas below. Never over-engineer; keep everything modular (one file per source / step / block) and documented (numbered docs per script). Commit + push to `origin/main` after every unit of work (`git pull --rebase --autostash` first). Update THIS file after every cycle.

Plan of record: `/Users/aryaask/.claude/plans/ok-cool-it-s-in-validated-dragonfly.md` · architecture: `PLAN.md` · runbook: `docs/runbook.md`.

## ☀️ Morning handover (read this first — last updated 04:25 BST, keeps being updated until 10:00)

**Live:** https://www.nepalfloodtracker.com (EN/NE/HI). Everything below is pushed to `origin/main`.

**What changed overnight, in order of what you asked for**
1. **The corridor is now the flood simulation** (your 02:15 brief) — auto-plays the breach on load, camera rides the wave, clock follows the recorded front (08:37 collapse → 13:00 Devghat), place cards pop as the front reaches them with live ledger numbers, drop houses/bridges/buses/camps and watch them tumble and sink, lake-volume/breach sliders (seeded with China MWR's 2.0 Mm³), the 10 bridges HOT OSM surveyed as washed-out/damaged are placed where they stood and go with the wave, "Share this run". Illustrative, labelled as such. Tuning knobs + how it works: `web/docs/14-flood-sim.md`.
2. **All 51 catalogued sources have normalisers** (waves 2A/2B/3): 25+ publishers in `figures_latest`, hydrographs, help requests per place, bridges, imagery catalogues. `docs/sources.md`.
3. **Processing**: press-quoted figures (Police/DoT columns filled), `figure_series` trends, timeline, digest v2, place_timeline 64/74 corridor places, 23 stats, 6-thread pull with backoff (≈2× faster). Per-place "now" line and a data-quality audit are in flight (lanes P5/Q1, see cycle log).
4. **Docs reconciled** with what shipped (README, PLAN, runbook, data-model, decisions D-025+).

**Do in the morning (5 minutes)**
- ⚠️ Rotate the OpenAI key and the Supabase service-role key (decisions-log 02:30: `pipeline/` was briefly uploaded to a Vercel project that I deleted). Put them in `pipeline/.env`; nothing else holds them.
- Grant `/bin/bash` Full Disk Access (System Settings → Privacy) so the launchd agent takes over from the detached loop (`scripts/install_schedule.sh --status`).
- When distribution starts: `scripts/install_schedule.sh 15`, set `PULL_INTERVAL_MINUTES = 15` in `pipeline/lib/config.py` and `web/lib/config.ts`, `cd web && vercel --prod --yes`.
- Skim `docs/audit-2026-08-30.md` (data-quality findings, once lane Q1 lands).

**Spend:** OpenAI ≈ $0.03 of the $20 cap. Supabase free tier. Vercel hobby.

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

## Cycle 4 lanes (relaunched 03:32 BST) — S3 ✅ P4 ✅ D ✅ U3 running
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
