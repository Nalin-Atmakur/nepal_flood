# PROGRESS — overnight build log (read this first after any context reset)

**Standing orders (from Aryaa, 30 Aug 01:10 BST):** do not stop working until **10:00 BST 30 Aug**. Finish the phases, then loop on the three leverage areas below. Never over-engineer; keep everything modular (one file per source / step / block) and documented (numbered docs per script). Commit + push to `origin/main` after every unit of work (`git pull --rebase --autostash` first). Update THIS file after every cycle.

Plan of record: `/Users/aryaask/.claude/plans/ok-cool-it-s-in-validated-dragonfly.md` · architecture: `PLAN.md` · runbook: `docs/runbook.md`.

## Status by phase

| Phase | State | Evidence |
|---|---|---|
| 0 tree + docs + gazetteer | ✅ | README/CONTRIBUTING/docs, db/docs 01–07, gazetteer 90 places (19 tests) — commits 634db79, 901fe94 |
| 1 db schema live | ✅ | 26 relations, RLS, realtime, buckets; anonymous auth on; 33 live tests — f4a3f9d |
| 2 pull_external_data + 13 normalisers | 🔄 pipeline lane running (resumed after machine sleep) | lib/ + normalisers/ + fixtures on disk; scripts/tests/docs pending |
| 3 process_data ⓪–⑥ | 🔄 same lane | — |
| 4–5 web (all pages, form, /me, 3D, OG, realtime) | ✅ deployed | e3606d2, b142b9e; lint/i18n/46 unit/11 e2e green; https://www.nepalfloodtracker.com |
| 6 deploy + domain + schedule | ✅ deploy/domain · ⏳ schedule (needs pipeline/run.sh) | apex A → Vercel (216.150.1.1), www CNAME; `scripts/install_schedule.sh` ready (launchd, 240 min) |

## In flight (01:25 BST)
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
