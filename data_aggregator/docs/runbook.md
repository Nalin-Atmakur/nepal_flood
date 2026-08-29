# Runbook

How the system is kept running: the schedule, secrets, moving off the laptop, backups, what to do when something breaks, and a 60-second health check. The site is volunteer-run and not an official source; when in doubt, keep the official-channels bar visible and the stale banner honest rather than hide a problem.

## 1. Schedule

The two scripts run on a timer on whichever machine holds `pipeline/.env`. On the Mac that is a **launchd agent** (survives logout, runs a missed job on wake, and the installer also pins the machine awake); on a Linux VM it is a crontab line. Both call the same `pipeline/run.sh`.

```
   launchd agent (Mac)  ─┐                        pipeline/run.sh
   com.nepalfloodtracker  │   every N minutes      ─────────────────────────────────────────────
   .pipeline              ├──────────────────────► .venv/bin/python pull_external_data.py   (external → RAW)
   crontab line (VM)     ─┘                        .venv/bin/python process_data.py         (RAW + ARCHIVE → DERIVED)
                                                   exit code = first crash (per-source failures are logged, not fatal)
```

Install / change / remove on the Mac — numbered:

1. `scripts/install_schedule.sh` — installs the agent at **240 min** (tonight's cadence), writes `~/Library/LaunchAgents/com.nepalfloodtracker.pipeline.plist`, runs once immediately, and starts a detached `caffeinate -s -i` so the laptop does not sleep on mains power.
2. `scripts/install_schedule.sh 15` — switch to the live-phase cadence (re-installs the agent).
3. `scripts/install_schedule.sh --remove` — uninstall and stop caffeinate.
4. Check: `launchctl print gui/$(id -u)/com.nepalfloodtracker.pipeline | grep -E 'state|interval'` and `tail -n 40 pipeline/run.log` shows two consecutive runs with exit 0. `make health` summarises the live state.

On a Linux VM instead: `crontab -e` and add `*/15 * * * * cd /path/to/data_aggregator/pipeline && ./run.sh >> run.log 2>&1` (cron uses UTC; the scripts write UTC timestamps, so nothing else changes).

Switching cadence — four coupled edits, one commit, one deploy:

1. The schedule: `scripts/install_schedule.sh 15` (Mac) or the crontab field (VM).
2. `pipeline/lib/config.py` — `PULL_INTERVAL_MINUTES = 15` (was 240). The scheduler uses it as the floor for every source's cadence and for the "unchanged" skip window.
3. `web/lib/config.ts` — `PULL_INTERVAL_MINUTES = 15`. Drives the scoreboard line "AUTO-REFRESH EVERY N MIN" and the stale-banner threshold (1.5 × the interval), so the site never promises a cadence the schedule does not keep.
4. `cd web && vercel --prod --yes` — the constant is baked at build time.

The two constants must always be equal.

macOS specifics: launchd agents only fire while the machine is awake — the installer's `caffeinate -s -i` prevents idle sleep on AC power, but a closed lid on battery still sleeps (System Settings → Battery → Options → "Prevent automatic sleeping on power adapter", and keep it plugged in). If `run.log` shows `Operation not permitted`, grant Full Disk Access to `/bin/bash` (System Settings → Privacy & Security → Full Disk Access) because the repo lives under `~/Desktop`.

## 2. Secrets

| Variable | File | Used by | Public? |
|---|---|---|---|
| `SUPABASE_PROJECT_REF` | `pipeline/.env` | `db/mgmt.py` (Management API path), pipeline | no (but not secret) |
| `SUPABASE_URL` | `pipeline/.env` | both scripts (`lib/db.py`) | no |
| `SUPABASE_SERVICE_ROLE_KEY` | `pipeline/.env` — the cron machine only | both scripts; `db/tests` | **never** — bypasses RLS |
| `OPENAI_API_KEY` | `pipeline/.env` | `process_data` via `lib/llm.py` | never |
| `OPENAI_BUDGET_USD` | `pipeline/.env` (default 20) | `lib/llm.py` budget guard; spend is tracked in `pipeline/_state.json` | — |
| `SUPABASE_ACCESS_TOKEN` | shell env only (optional; else the Supabase CLI keychain on the laptop) | `db/apply.py`, `db/tests` | never |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `web/.env.local` and Vercel project env | the website | yes — by design; RLS is the boundary |
| Vercel login | `vercel` CLI credentials | deploy | never |

Rules: `.env*` is gitignored repo-wide; never paste a key into a doc, a commit, a log line or a fixture. The website has no server-side secret at all.

Rotation:

1. **OpenAI key — rotate after the event.** platform.openai.com → API keys → revoke → create → paste into `pipeline/.env`. Delete the `openai_spend` entry in `pipeline/_state.json` only if the new key has a fresh budget; otherwise leave it so the $20 guard keeps counting.
2. **Service-role key** (if it ever leaves the cron machine): Supabase dashboard → Project Settings → API → rotate. Depending on the project's key type this may regenerate the anon key too; if it does, update `web/.env.local` and the Vercel env, then redeploy.
3. **Management API token**: dashboard → Account → Access tokens → revoke; `supabase login` again on the laptop or set a new `SUPABASE_ACCESS_TOKEN` on the VM.

## 3. Laptop → VM handoff

Any Linux box with Python 3.11+ and outbound HTTPS runs the pipeline; the interface is the database, so nothing else changes.

1. Provision (e.g. a $5 Ubuntu VM), `sudo apt install python3-venv poppler-utils git` (poppler for `pdftotext`).
2. `git clone <repo> && cd nepal_flood/data_aggregator/pipeline && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`.
3. `scp` the laptop's `pipeline/.env` **and** `pipeline/_state.json` to the same paths (the state file carries per-source last-fetched times, ETags and the OpenAI spend counter — without it the budget guard restarts from zero).
4. `./run.sh` once by hand; confirm exit 0 and new rows (section 6).
5. `crontab -e` on the VM with the live-phase line (paths adjusted). Cron on Linux uses UTC; the scripts write UTC timestamps, so nothing else changes.
6. On the laptop, `scripts/install_schedule.sh --remove`. Two writers would not corrupt anything (upserts), but they would double the OpenAI spend.
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
| OpenAI budget hit | `run.log`: `llm: budget exhausted ($20.00 of $20)`; `reports_archive` rows stay `received` | `lib/llm.py` stops calling the model; submissions are archived and wait | raise `OPENAI_BUDGET_USD` in `pipeline/.env` (and top up the account) or leave it; nothing is lost. `/me` keeps showing "Received" |
| Realtime connection cap hit (200) | scoreboard's "people here now" disappears; browser console shows channel error | Presence is dropped first by design; contribution counters fall back to polling `v_live_counts` | nothing; or upgrade the plan. Do not add Realtime to more tables |
| Vercel build fails | `vercel --prod` output; the previous deployment keeps serving | usually a type error or a message-key parity failure | `cd web && npm run lint && npm run build && npm test` locally; fix; redeploy. The DB is unaffected |
| migrations conflict | `apply.py`: `! 00N_x.sql changed since it was applied` | an applied file was edited | `git checkout` the file; put the change in a new `006_…sql` (`db/docs/07-applying-migrations.md`) |
| schedule silent | `run.log` not growing; scoreboard "minutes since last pull" climbing; stale banner | laptop asleep (lid closed on battery), agent not loaded, or bash lacks Full Disk Access | section 1: `launchctl print …`, re-run `scripts/install_schedule.sh`; `./run.sh` by hand to confirm |
| form submissions fail | browser: `new row violates row-level security policy` or `401` | anonymous sign-ins disabled, or the insert violates `reports_own_insert` | `python -c "import mgmt; mgmt.set_anonymous_signins(True)"` from `db/`; check the insert sets `status='received'` and no `anonymised_at` |
| numbers look stale but the schedule ran | `v_live_counts.last_processed_at` old, `last_pull_at` fresh | `process_data` failed after `pull_external_data` succeeded | `tail run.log`; run `python process_data.py` by hand and read the traceback |
| Supabase paused | dashboard banner; site shows empty states | free projects pause after 7 days without activity — impossible while the schedule runs | restore from the dashboard; check the schedule |
| disk filling on the cron machine | `df -h` | `pipeline/snapshots/` (gitignored local copies of pulls) | delete old snapshots; the truth is in `raw_pulls` |

## 6. Is it healthy? — 60 seconds

Run from `data_aggregator/` (uses the Management API through `db/mgmt.py`):

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
| `figures_latest` | rows for NDRRMA, Nepal Police, MoFA, OPMCM at least; `as_of` today or yesterday |
| `v_gauges_latest` | Galchhi (5705) `alive = true`; Rasuwagadhi (4913) `alive = false` is expected (destroyed); no station with `observed_at` older than the DHM feed's last update |
| `reports_archive` by status | no `received` rows older than one cadence unless the OpenAI budget is exhausted |
| `v_sources_status` failures | a handful of `html`/`browser_ua` sources failing is normal; a `json_api` government source failing for > 2 h is worth a look |

Then:

```
curl -sI https://nepalfloodtracker.com/en | head -1        # HTTP/2 200
curl -s -o /dev/null -w '%{content_type}\n' https://nepalfloodtracker.com/api/og?lang=ne   # image/png
launchctl print gui/$(id -u)/com.nepalfloodtracker.pipeline | grep -E "state|interval"   # or: crontab -l | grep run.sh
tail -n 5 pipeline/run.log
```

## 7. Deploying the site

Only when code changes (data changes need no deploy — ISR re-renders every 5 min and the scoreboard is live).

1. `cd web && npm run lint && npm run build && npm test`.
2. `vercel --prod --yes`.
3. `curl -sI https://nepalfloodtracker.com/en` → 200; open `/en`, `/ne`, `/hi` once; paste the URL into an OG debugger to confirm the share card.
4. Commit and push (`CONTRIBUTING.md`, "Commit and push").
