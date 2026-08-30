# Runbook

How the system is kept running: the schedule, secrets, moving off the laptop, backups, what to do when something breaks, and a 60-second health check (`make health`). The site is volunteer-run and not an official source; when in doubt, keep the official-channels bar visible and the stale banner honest rather than hide a problem.

## 1. Schedule

The two scripts run on a plain **serial loop that you start yourself** on whichever machine holds `pipeline/.env`:
`pipeline/scheduler.py` runs one tick (pull, then process), sleeps N hours, and repeats until Ctrl-C. Nothing is
installed (no launchd, no cron, no background process) — the owner's choice on 30 Aug (D-049).

```
   terminal (or tmux)        pipeline/scheduler.py                              one tick
   ────────────────────►     while True:                                        ───────────────────────────────────
   .venv/bin/python            tick()  ──►  .venv/bin/python pull_external_data.py   (external → RAW)
                               scheduler.py                              .venv/bin/python process_data.py         (public-source RAW → DERIVED)
                               sleep(N h − tick duration)      ← measured from the tick's start
                               (Ctrl-C stops after the current step)
```

Run / change / stop — numbered:

1. `cd data_aggregator/pipeline && .venv/bin/python scheduler.py` — every 4 hours, first tick immediately. Keep the
   terminal open (or run it inside `tmux`/`screen`) and keep the machine awake (`caffeinate -i` in another terminal;
   a closed lid on battery still sleeps).
2. `.venv/bin/python scheduler.py --hours 0.5` — every 30 minutes (a tick ≈ 11 min with 60 sources; ≈ $0.05 in model
   calls; 15 min is possible but tight). `--once` runs a single tick and exits (same as `make pipeline`);
   `--skip-first` waits one interval before the first tick; trailing arguments go to `pull_external_data.py`
   (e.g. `scheduler.py --hours 1 --force`).
3. Stop: Ctrl-C (the current step finishes, then the loop exits). Output streams to the terminal and is appended to
   `pipeline/run.log`; `tail -n 40 pipeline/run.log` shows `== … start pull_external_data.py` … `== … tick ok`.
4. Check: `make health` summarises the live state (last pull / last processed, sources failing, row counts).

On a Linux VM the same script works unchanged (`nohup .venv/bin/python scheduler.py --hours 0.5 &` or a systemd
unit); a crontab line calling `pipeline/run.sh` is the alternative there.

`scripts/install_schedule.sh` (detached loop + launchd agent) still exists for reference but is **not used**; it was
removed on 30 Aug 08:50 BST at the owner's request. `run.sh` remains the single-tick entry point (`make pipeline`)
and keeps its 3-hour lock against overlapping ticks.

Switching cadence — three coupled edits, one commit, one deploy:

1. Restart the loop with the new `--hours`.
2. `pipeline/lib/config.py` — `PULL_INTERVAL_MINUTES` (240 tonight; e.g. 30 for the live phase). The puller uses it as
   the floor for every source's cadence and for the "unchanged" skip window.
3. `web/lib/config.ts` — `PULL_INTERVAL_MINUTES` — drives the scoreboard line "AUTO-REFRESH EVERY N MIN" and the
   stale-banner threshold (1.5 × the interval), so the site never promises a cadence the loop does not keep;
   then `cd web && vercel --prod --yes` (the constant is baked at build time).

The two constants must always be equal, and match the loop's `--hours`.

**If a tick never lands.** The wait is measured on the wall clock, so the next tick is an absolute time, not "four
hours of CPU" — but a sleeping machine still runs nothing at all. `make schedule` wraps the loop in `caffeinate -i`
so an idle Mac stays awake; a closed lid or a manual sleep still stops everything until it wakes, and the loop then
logs `wait overran by N min (the machine was probably asleep) — ticking now` and catches up with a single tick.

## 2. Secrets

| Variable | File | Used by | Public? |
|---|---|---|---|
| `SUPABASE_PROJECT_REF` | `pipeline/.env` | `db/mgmt.py` (Management API path), pipeline | no (but not secret) |
| `SUPABASE_URL` | `pipeline/.env` | both scripts (`lib/db.py`) | no |
| `SUPABASE_SERVICE_ROLE_KEY` | `pipeline/.env` — the cron machine only | both scripts; `db/tests` | **never** — bypasses RLS |
| `OPENAI_API_KEY` | `pipeline/.env` | `process_data` via `lib/llm.py` | never |
| `OPENAI_BUDGET_USD` | `pipeline/.env` (default 20) | `lib/llm.py` budget guard; spend is tracked in `pipeline/_state.json` | — |
| `FAMILY_REPORT_PROCESSING_ENABLED` | `pipeline/.env`, must remain `false` | fail-closed questionnaire boundary in every processing stage | — |
| `SUPABASE_ACCESS_TOKEN` | shell env only (optional; else the Supabase CLI keychain on the laptop) | `db/apply.py`, `db/tests` | never |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `web/.env.local` and Vercel project env | the website | yes — by design; RLS is the boundary |
| Vercel login | `vercel` CLI credentials | deploy | never |

Rules: `.env*` is gitignored repo-wide; never paste a key into a doc, a commit, a log line or a fixture. The website has no server-side secret at all.

`FAMILY_REPORT_PROCESSING_ENABLED` is missing/invalid-safe: only `1`, `true`, `yes` or `on`
enables the dormant legacy path. Do not enable it during incident debugging. Re-enablement requires
the coordinated privacy/consent/UI/security programme documented in `pipeline/docs/process_data/00-anonymise.md`.

Rotation:

0. **Morning of 30 Aug 2026 — rotate both keys first** (`decisions-log.md` 02:30 entry): a `vercel --prod` run from the wrong cwd uploaded the `pipeline/` folder to a throw-away Vercel project for ~10 minutes before it was deleted. `.env` is gitignored and the CLI honours `.gitignore`, so the keys should not have left the machine, but that cannot be proven after deletion. Rotate the OpenAI key (step 1) and the Supabase service-role key (step 2), paste both into `pipeline/.env`, run `./run.sh` once by hand. The anon key needs no change unless the rotation regenerated it. Guard since then: `.vercelignore` with `*` in `data_aggregator/`, `db/`, `pipeline/`.
1. **OpenAI key.** platform.openai.com → API keys → revoke → create → paste into `pipeline/.env`. Delete the `openai_spend` entry in `pipeline/_state.json` only if the new key has a fresh budget; otherwise leave it so the $20 guard keeps counting.
2. **Service-role key** (if it ever leaves the cron machine): Supabase dashboard → Project Settings → API → rotate. Depending on the project's key type this may regenerate the anon key too; if it does, update `web/.env.local` and the Vercel env, then redeploy.
3. **Management API token**: dashboard → Account → Access tokens → revoke; `supabase login` again on the laptop or set a new `SUPABASE_ACCESS_TOKEN` on the VM.

## 3. Laptop → VM handoff

Any Linux box with Python 3.11+ and outbound HTTPS runs the pipeline; the interface is the database, so nothing else changes.

1. Provision (e.g. a $5 Ubuntu VM), `sudo apt install python3-venv poppler-utils git` (poppler for `pdftotext`).
2. `git clone <repo> && cd nepal_flood/data_aggregator/pipeline && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`.
3. `scp` the laptop's `pipeline/.env` **and** `pipeline/_state.json` to the same paths (the state file carries per-source last-fetched times, ETags and the OpenAI spend counter — without it the budget guard restarts from zero).
4. `./run.sh` once by hand; confirm exit 0 and new rows (section 6).
5. `crontab -e` on the VM with the live-phase line (paths adjusted). Cron on Linux uses UTC; the scripts write UTC timestamps, so nothing else changes.
6. On the laptop, Ctrl-C the scheduler. Two writers would not corrupt anything (upserts), but they would double the OpenAI spend.
7. For `db/apply.py` on the VM export `SUPABASE_ACCESS_TOKEN` (the keychain path is macOS-only).
8. Record the handoff in `docs/decisions-log.md` with the VM's name and who holds its SSH key.

## 4. Backups

The free tier has no automatic backups. Take one before any reset, before rotating keys, and nightly during the live phase.

| Method | Command | Notes |
|---|---|---|
| `pg_dump` via the pooler | `pg_dump "$DATABASE_URL" --no-owner --no-privileges --schema=public -Fc -f backup_$(date +%F).dump` | `DATABASE_URL` = Dashboard → Connect → Session pooler URI (needs the DB password; store it in the password manager, not in `.env`). Add `--exclude-table-data=public.raw_pulls` for a small dump. Restore with `pg_restore --no-owner -d "$DATABASE_URL"`. |
| dashboard | Database → Backups | Pro plan only; if the project is upgraded during the event, this becomes the daily path |
| table export via the Management API | `pipeline/.venv/bin/python -c "import sys,json; sys.path.insert(0,'db'); import mgmt; print(json.dumps(mgmt.query('select * from figures_latest')))" > figures_latest.json` | fine for the DERIVED tables and reference data; not for `raw_pulls` bodies |

The dump contains ARCHIVE data (names, phones). Keep it encrypted, off the repo, and delete it when the event's data handling ends.

## 5. When X breaks

| Symptom | Where you see it | What is happening | Do |
|---|---|---|---|
| a source is down / changed shape | `/sources` shows a red last-fetched; `pulls.ok = false` with `error`; `run.log` | `pull_external_data` fails soft per source; the page keeps last-good rows with their `as_of` | nothing urgent. If the shape changed, fix `pipeline/normalisers/<id>.py` against a new fixture (`pipeline/docs/pull_external_data/07-failure-modes.md`) |
| OpenAI budget hit | `run.log`: `llm: budget exhausted` | public article extraction/translation/polish falls back or skips; family intake is unaffected | raise the budget only if public-source model assistance is operationally useful; never enable family processing |
| family mode is not archive-only | process JSON/log says `family_reports.mode=processing` or `family_report_processing=true` | unsafe legacy flag was explicitly enabled | stop the scheduler, set `FAMILY_REPORT_PROCESSING_ENABLED=false`, restart, and record the incident; do not process the backlog |
| Realtime connection cap hit (200) | scoreboard's "people here now" disappears; browser console shows channel error | Presence is dropped first by design; contribution counters fall back to polling `v_live_counts` | nothing; or upgrade the plan. Do not add Realtime to more tables |
| Vercel build fails | `vercel --prod` output; the previous deployment keeps serving | usually a type error or a message-key parity failure | `cd web && npm run lint && npm run build && npm test` locally; fix; redeploy. The DB is unaffected |
| migrations conflict | `apply.py`: `! 00N_x.sql changed since it was applied` | an applied file was edited | `git checkout` the file; put the change in a new `006_…sql` (`db/docs/07-applying-migrations.md`) |
| schedule silent | `run.log` not growing; scoreboard "minutes since last pull" climbing; stale banner | laptop asleep (lid closed on battery), loop process gone (`pipeline/.scheduler.pid` stale), launchd blocked by TCC (`EX_CONFIG`) | `scripts/install_schedule.sh --status`; re-run `scripts/install_schedule.sh [minutes]`; `./run.sh` by hand to confirm |
| tick skipped: "another tick is running" | `run.log` line `skipped: another tick is running` on every tick | `pipeline/.run.lock` left by a crashed tick; `run.sh` ignores it only after 3 h | `rm -r pipeline/.run.lock` once the previous tick is really gone (`pgrep -f process_data`) |
| irrelevant headline on the site | Latest block / digest shows an off-topic story (robots, exchange rates, "what's on in Kathmandu") | the relevance gate `pipeline/normalisers/_rss.is_relevant` let it through: a corridor place alias or keyword matched | add the word/place to the gate's exclusions (`GENERIC_PLACE_IDS`, district rule) with a test in `pipeline/tests`; run `process_data.py --purge-irrelevant` to drop stored rows; the digest picks it up on the next tick |
| gauge tile shows "no data yet" | River & weather §06 | the station name pattern in `web/lib/config.ts` `GAUGE_STATIONS` no longer matches the DHM/BIPAD spelling, or the station really stopped reporting (`v_gauges_latest.alive = false` is shown as dead, not empty) | `select station_name, observed_at from v_gauges_latest`; fix the regex; redeploy |
| "What changed today" is stale or empty | digest card under the scoreboard shows yesterday's date or nothing | `process_data` ⑦ did not run (crash logged in `run.log`), or the OpenAI budget is exhausted (the digest falls back to figure/gauge bullets without prose) | `tail run.log`; `process_data.py --step 7` by hand; check `digest` has today's NPT day for all three langs |
| budget guard tripped | `run.log`: `llm … budget exhausted`; `_state.json` spend ≥ `OPENAI_BUDGET_USD` | public article place fallback and digest/place prose pause; deterministic/public data continues | raise the budget if needed, or leave it; family intake never depends on it |
| side-by-side column shows "—" although the figure exists | home §03 | the publisher spelling in `figures_latest` is not listed in `web/lib/config.ts` `AGENCIES[].publishers` (e.g. a new `… (via press)` publisher) | add the spelling to the column's list; `npm test`; redeploy |
| form submissions fail | browser: `new row violates row-level security policy` or `401` | anonymous sign-ins disabled, or the insert violates `reports_own_insert` | `python -c "import mgmt; mgmt.set_anonymous_signins(True)"` from `db/`; check the insert sets `status='received'` and no `anonymised_at` |
| numbers look stale but the schedule ran | `v_live_counts.last_processed_at` old, `last_pull_at` fresh | `process_data` failed after `pull_external_data` succeeded | `tail run.log`; run `python process_data.py` by hand and read the traceback |
| Supabase paused | dashboard banner; site shows empty states | free projects pause after 7 days without activity — impossible while the schedule runs | restore from the dashboard; check the schedule |
| disk filling on the cron machine | `df -h` | `pipeline/snapshots/` (gitignored local copies of pulls) | delete old snapshots; the truth is in `raw_pulls` |

## 6. Is it healthy? — 60 seconds

`make health` runs `scripts/health.py` (archive-only flag/projection tripwire, live counters, public figures, gauges, sources and row counts). It exits 1 when public data is stale, family processing is enabled, `reports_anon` is nonempty or `report_counts` is nonempty. The manual equivalent, through the Management API (`db/mgmt.py`):

```
pipeline/.venv/bin/python - <<'EOF'
import sys; sys.path.insert(0, 'db'); import mgmt
q = mgmt.query
print(q("select * from v_live_counts"))
print(q("select publisher, metric, value, as_of from figures_latest where scope='national' order by publisher, metric"))
print(q("select station_id, station_name, level, observed_at, alive from v_gauges_latest order by alive desc, station_name"))
print(q("select status, count(*) from reports_archive group by status"))
print(q("select id, last_fetched_at, last_ok, left(last_error, 60) from v_sources_status where last_ok is distinct from true"))
EOF
```

What good looks like:

| Query | Healthy |
|---|---|
| `v_live_counts` | `last_pull_at` and `last_processed_at` within one cadence (+ a few minutes) of now; `submissions_total` not decreasing |
| `figures_latest` | rows for `NDRRMA`, `Nepal Police (via press)`, `MoFA`, `OPMCM portal`, `Setu (NDRRMA)` at least (17 publishers on 30 Aug); `as_of` today or yesterday |
| `v_gauges_latest` | Galchhi (5705) `alive = true`; Rasuwagadhi (4913) `alive = false` is expected (destroyed); no station with `observed_at` older than the DHM feed's last update |
| `reports_archive` by status | active reports remain `received` indefinitely; withdrawn reports are `withdrawn`; `anonymised`/`processed`/`matched` should remain zero before an authorised future programme |
| `reports_anon`, `report_counts` | exactly zero; any row is an archive-boundary incident before distribution |
| `v_sources_status` failures | a handful of `html`/`browser_ua` sources failing is normal; a `json_api` government source failing for > 2 h is worth a look |

Then:

```
curl -sI https://nepalfloodtracker.com/en | head -1        # HTTP/2 200
curl -s -o /dev/null -w '%{content_type}\n' https://nepalfloodtracker.com/api/og?lang=ne   # image/png
scripts/install_schedule.sh --status      # loop pid · launchd state · last three run headers (or: crontab -l | grep run.sh on a VM)
tail -n 5 pipeline/run.log
```

## 7. Deploying the site

### 7.0 Domain

`nepalfloodtracker.com` is registered at Squarespace and attached to the Vercel project (apex A → Vercel `216.150.1.1`, `www` CNAME → `cdcfa0c2711adf6d.vercel-dns-016.com`). Both were set on 30 Aug 2026; a resolver that still shows Squarespace IPs (198.49.23.x / 198.185.159.x) for the apex is serving a stale cache — check with `dig @8.8.8.8 nepalfloodtracker.com A` and `vercel domains inspect nepalfloodtracker.com`.



### 7.1 Deploy

Only when code changes (data changes need no deploy — ISR re-renders every 5 min and the scoreboard is live). **Run `vercel` only with the shell in `web/`** — the CLI creates a new project named after whatever folder it is run from (the 30 Aug incident); `.vercelignore` files with `*` in `data_aggregator/`, `db/` and `pipeline/` now make such a run upload nothing, but the guard is the cwd.

1. `cd web && npm run lint && npm run i18n:check && npm test && npm run build && npm run e2e`.
2. `vercel --prod --yes` (project `aryaasks-projects/nepalfloodtracker`; `make deploy` from `data_aggregator/` runs the same command in `web/`).
3. `curl -sI https://nepalfloodtracker.com/en` → 200; open `/en`, `/ne`, `/hi` once; paste the URL into an OG debugger to confirm the share card.
4. Commit and push (`CONTRIBUTING.md`, "Commit and push").
