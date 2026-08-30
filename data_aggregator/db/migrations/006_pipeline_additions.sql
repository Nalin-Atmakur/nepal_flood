-- ============================================================================
-- 006_pipeline_additions.sql — added by the pipeline lane (2026-08-30).
-- The reports_archive guard trigger from 004 only recognised the service role through the
-- legacy GUC `request.jwt.claim.role`. PostgREST ≥ v12 (Supabase today) exposes the JWT as
-- `request.jwt.claims` (json) and runs as role `service_role`, so process_data's PATCH
-- (anonymised_at / status / summary_public) was rejected with "only withdrawal is permitted".
-- Same policy, three ways of detecting the service role. No column changes.
-- ============================================================================
create or replace function reports_archive_guard_update() returns trigger language plpgsql as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role')
  );
  if jwt_role = 'service_role' or current_user in ('postgres', 'service_role') then
    return new;
  end if;
  if new.withdrawn_at is distinct from old.withdrawn_at then
    -- allowed; force everything else to stay as it was
    new := old; new.withdrawn_at := coalesce(new.withdrawn_at, now()); new.status := 'withdrawn';
    return new;
  end if;
  raise exception 'only withdrawal is permitted';
end $$;
