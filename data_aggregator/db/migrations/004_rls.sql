-- ============================================================================
-- 004_rls.sql — the entire access model.
--   anon / authenticated (the website): insert own reports; read own archive rows;
--                                        read public DERIVED + reference + live counters.
--   service_role (the two scripts):      everything (bypasses RLS by default).
-- ============================================================================

-- Enable RLS everywhere (service_role bypasses).
alter table users             enable row level security;
alter table reports_archive   enable row level security;
alter table raw_pulls         enable row level security;
alter table submissions_log   enable row level security;
alter table sources           enable row level security;
alter table places            enable row level security;
alter table pulls             enable row level security;
alter table figures           enable row level security;
alter table gauges            enable row level security;
alter table articles          enable row level security;
alter table reports_anon      enable row level security;
alter table figures_latest    enable row level security;
alter table place_status      enable row level security;
alter table stats             enable row level security;
alter table report_counts     enable row level security;
alter table entities          enable row level security;
alter table entity_events     enable row level security;
alter table dedup_queue       enable row level security;
alter table findings          enable row level security;
alter table place_timeline    enable row level security;
alter table _migrations       enable row level security;

-- ---------- ARCHIVE: users own their rows ----------
create policy users_self_insert on users
  for insert to authenticated with check (id = auth.uid());
create policy users_self_select on users
  for select to authenticated using (id = auth.uid());
create policy users_self_update on users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy reports_own_insert on reports_archive
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'received' and anonymised_at is null);
create policy reports_own_select on reports_archive
  for select to authenticated using (user_id = auth.uid());
-- Owner may withdraw (soft): only withdrawn_at/status may change, enforced by the trigger below.
create policy reports_own_withdraw on reports_archive
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- no delete for users: corrections are new rows (supersedes)

-- submissions_log: anyone signed in may append; everyone may count.
create policy submissions_log_insert on submissions_log
  for insert to authenticated with check (true);
create policy submissions_log_select on submissions_log
  for select to anon, authenticated using (true);

-- raw_pulls: service role only (no policies for anon/authenticated).

-- ---------- RAW reference + public raw ----------
create policy sources_public_select on sources for select to anon, authenticated using (true);
create policy places_public_select  on places  for select to anon, authenticated using (true);
create policy gauges_public_select  on gauges  for select to anon, authenticated using (true);
-- figures, articles (table), reports_anon, pulls: service role only. Public access is via views.

-- ---------- DERIVED public ----------
create policy figures_latest_public on figures_latest for select to anon, authenticated using (true);
create policy place_status_public   on place_status   for select to anon, authenticated using (true);
create policy stats_public          on stats          for select to anon, authenticated using (true);
create policy report_counts_public  on report_counts  for select to anon, authenticated using (true);
create policy place_timeline_public on place_timeline for select to anon, authenticated using (true);
-- entities, entity_events, dedup_queue, findings: service role only.

-- ---------- Views ----------
-- Views run with the owner's privileges (postgres), so granting select exposes only the view's columns.
grant select on v_live_counts, v_articles_recent, v_place_status_latest, v_gauges_latest, v_sources_status to anon, authenticated;

-- Trigger: a non-service update on reports_archive may only set withdrawn_at (and the matching status).
create or replace function reports_archive_guard_update() returns trigger language plpgsql as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role' or current_user = 'postgres' then
    return new;
  end if;
  if new.withdrawn_at is distinct from old.withdrawn_at then
    -- allowed; force everything else to stay as it was
    new := old; new.withdrawn_at := coalesce(new.withdrawn_at, now()); new.status := 'withdrawn';
    return new;
  end if;
  raise exception 'only withdrawal is permitted';
end $$;
drop trigger if exists reports_archive_guard on reports_archive;
create trigger reports_archive_guard before update on reports_archive
  for each row execute function reports_archive_guard_update();

-- Belt and braces: make sure the website roles hold no table privileges we did not intend.
revoke all on raw_pulls, figures, articles, reports_anon, pulls, entities, entity_events, dedup_queue, findings, _migrations
  from anon, authenticated;
