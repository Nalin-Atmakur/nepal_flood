-- ============================================================================
-- 005_realtime_storage.sql — live counters + Storage buckets
-- ============================================================================

-- Realtime: the site subscribes to INSERTs on submissions_log for the live counter.
alter publication supabase_realtime add table submissions_log;

-- Storage buckets (private). Created via SQL so the migration is complete.
insert into storage.buckets (id, name, public)
values ('raw', 'raw', false), ('report-photos', 'report-photos', false)
on conflict (id) do nothing;

-- report-photos: a signed-in user may upload into their own folder; nobody but service role reads.
create policy report_photos_own_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- raw: service role only (no policies).
