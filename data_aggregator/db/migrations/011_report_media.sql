-- ============================================================================
-- 011_report_media.sql — attachments for reports (ARCHIVE zone)
-- ============================================================================
-- People are encouraged to attach whatever helps: photos, videos, voice notes, documents. Files go to the
-- private bucket `report-media` under <user_id>/<report_id>/<n>-<name>; one row per file in report_files.
-- Only the uploading device (own folder) and the service role can read them; nothing is public.
-- The pipeline never puts file contents into RAW/DERIVED (PII rule) — only counts (see docs/data-model.md).

create table if not exists report_files (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references reports_archive (id) on delete cascade,
  user_id     uuid not null references users (id) on delete cascade,
  path        text not null unique,                      -- report-media/<user_id>/<report_id>/<n>-<name>
  kind        text not null check (kind in ('image','video','audio','document')),
  mime        text,
  bytes       integer check (bytes is null or bytes >= 0),
  created_at  timestamptz not null default now()
);
create index if not exists report_files_report_idx on report_files (report_id);
create index if not exists report_files_user_idx on report_files (user_id);

alter table report_files enable row level security;
grant select, insert on report_files to authenticated;

-- own rows only; the report must belong to the same user
drop policy if exists report_files_own_insert on report_files;
create policy report_files_own_insert on report_files
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from reports_archive r where r.id = report_id and r.user_id = auth.uid())
  );
drop policy if exists report_files_own_select on report_files;
create policy report_files_own_select on report_files
  for select to authenticated
  using (user_id = auth.uid());

-- the bucket: private, 50 MB per file, media + documents only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-media', 'report-media', false, 52428800,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif',
        'video/mp4','video/quicktime','video/webm','video/3gpp',
        'audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/webm','audio/wav','audio/x-m4a','audio/m4a',
        'application/pdf','text/plain',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- a signed-in (anonymous) user may write into and read from their own folder; nobody else but service role
drop policy if exists report_media_own_insert on storage.objects;
create policy report_media_own_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'report-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists report_media_own_select on storage.objects;
create policy report_media_own_select on storage.objects
  for select to authenticated
  using (bucket_id = 'report-media' and (storage.foldername(name))[1] = auth.uid()::text);

comment on table report_files is 'ARCHIVE: one row per attached file (report-media bucket); own-folder access only.';
