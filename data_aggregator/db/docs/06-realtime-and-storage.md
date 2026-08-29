# 06 · Realtime and Storage — `005_realtime_storage.sql`

Two Supabase features beyond plain Postgres are used, and both stay inside "database only": a Realtime publication on one table, and two private Storage buckets created in SQL.

## Realtime: the live scoreboard

```
   browser tab                                  Supabase Realtime                       Postgres
   ─────────────────                            ─────────────────                       ────────
   channel('site').track({})  ──presence──►     presence state, size = viewers          (no table)
                                                                                         
   channel('log')                                                                        
     .on('postgres_changes',  ──subscribe──►    WAL for submissions_log  ◄──publication── submissions_log
         {event:'INSERT', table:'submissions_log'})                                      (INSERT by /report)
     → rolling 10-min + today counters                                                   
                                                                                         
   fetch v_live_counts every 60 s  ─────────────────────────────────────────────────►    v_live_counts
     → last_pull_at, initial counter values                                              (pulls, figures_latest)
```

| Counter | Mechanism | Latency | Degrades to |
|---|---|---|---|
| people here now | Presence on channel `site`; client-only, no writes | live | hides itself if the connection cap is hit |
| contributions last 10 min / today | `INSERT` events on `submissions_log` + initial values from `v_live_counts` | live | the polled `v_live_counts` values |
| last data pull | `v_live_counts.last_pull_at`, polled | ≤ 60 s | the value at page render |

`alter publication supabase_realtime add table submissions_log` is the only publication change. Realtime applies RLS to `postgres_changes`, so the browser sees inserts because `submissions_log_select` grants `anon` select. No other table is published; nothing with PII can reach a browser through Realtime.

Free-tier limits that matter: 200 concurrent Realtime connections and 2 million messages/month. The scoreboard is built to lose Presence first (the counter component unmounts on a channel error) and keep the contribution counters from polling. See `docs/runbook.md`, "When X breaks".

## Storage: two private buckets

```
   insert into storage.buckets (id, name, public)
   values ('raw', 'raw', false), ('report-photos', 'report-photos', false)
   on conflict (id) do nothing;
```

| Bucket | Path convention | Writes | Reads | Policy |
|---|---|---|---|---|
| `raw` | `raw/<source_id>/<date>/<time>.<ext>` — PDFs, images, spreadsheets from pulls; referenced by `raw_pulls.storage_path` | `pull_external_data` (service key) | `process_data` (service key) | none → service role only |
| `report-photos` | `report-photos/<auth.uid()>/<report id>.jpg` — referenced by `reports_archive.photo_path` | the signed-in visitor, own folder only | `process_data` (service key) | `report_photos_own_insert`: `authenticated`, `bucket_id = 'report-photos'` and first folder segment = `auth.uid()::text` |

There is deliberately no select policy on `report-photos`, not even for the uploader: photos are personal data, are kept for the pipeline and official channels, and are never displayed on the site. A user who wants to see their photo again keeps their own copy.

Both buckets are created by the migration so a fresh project is complete after `db/apply.py`; nothing has to be clicked in the dashboard except enabling anonymous sign-ins (`07-applying-migrations.md`, step 6).

## What is not used

No edge functions, no database webhooks, no `pg_cron`, no Supabase Auth beyond anonymous sign-in (optionally upgraded to email/phone from `/me` without changing the UUID). Keeping the surface this small is what makes the runbook short.

Next: `07-applying-migrations.md`.
