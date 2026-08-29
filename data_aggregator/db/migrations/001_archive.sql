-- ============================================================================
-- 001_archive.sql — ARCHIVE zone (PII; verbatim; service role + owner-only)
-- Written by: the website (users' own rows), pull_external_data (raw_pulls)
-- Read by:    process_data (service role); users (their own reports only)
-- ============================================================================

create extension if not exists pgcrypto;

-- Applied-migration ledger used by db/apply.py (idempotent re-runs).
create table if not exists _migrations (
  filename    text primary key,
  applied_at  timestamptz not null default now(),
  checksum    text
);

-- One row per anonymous (or upgraded) Supabase auth user.
create table if not exists users (
  id            uuid primary key references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  lang          text not null default 'en' check (lang in ('en','ne','hi')),
  fingerprint   text,                        -- sha256(UA+screen+tz+lang): recovery/dedup hint, not auth
  contact       text                         -- optional, user-added, to recover the folder elsewhere
);

-- The questionnaire, verbatim. One row per submission. Corrections = new row + supersedes.
create table if not exists reports_archive (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  lang             text not null default 'en',
  respondent_type  text not null check (respondent_type in ('family','survivor','rescuer','agency')),
  text             text not null check (length(text) between 1 and 20000),   -- THE box
  place_id         text,                      -- optional gazetteer pick (fk added in 002)
  contact          text,                      -- optional reporter phone/WhatsApp/email
  photo_path       text,                      -- Storage: report-photos/<user_id>/<id>.jpg
  supersedes       uuid references reports_archive (id),
  fingerprint      text,
  withdrawn_at     timestamptz,               -- soft withdraw: excluded from processing/counts; row retained
  summary_public   text,                      -- PII-free one-line summary written by process_data ⓪ ("We understood: …")
  -- pipeline bookkeeping
  anonymised_at    timestamptz,               -- null = not yet projected into reports_anon
  status           text not null default 'received'
                   check (status in ('received','anonymised','processed','matched','withdrawn','spam'))
);
create index if not exists reports_archive_user_idx on reports_archive (user_id, created_at desc);
create index if not exists reports_archive_pending_idx on reports_archive (created_at) where anonymised_at is null;

-- Verbatim external pulls (bodies may contain PII from official registries).
create table if not exists raw_pulls (
  id            bigserial primary key,
  source_id     text not null,
  fetched_at    timestamptz not null default now(),
  http_status   int,
  bytes         int,
  unchanged     boolean not null default false,   -- same body hash as the previous pull
  body_hash     text,
  body          text,                             -- raw response (json/xml/html/text); PDFs go to Storage
  storage_path  text,                             -- Storage: raw/<source_id>/<date>/<time>.<ext> for binaries
  error         text,
  projected_at  timestamptz                       -- null = process_data has not yet projected PII rows to RAW
);
create index if not exists raw_pulls_source_idx on raw_pulls (source_id, fetched_at desc);

-- Public, PII-free event log written alongside every submission → live counters.
create table if not exists submissions_log (
  id               bigserial primary key,
  created_at       timestamptz not null default now(),
  respondent_type  text not null,
  lang             text not null
);
create index if not exists submissions_log_created_idx on submissions_log (created_at desc);

comment on table users            is 'ARCHIVE zone. One row per auth user (anonymous sign-in).';
comment on table reports_archive  is 'ARCHIVE zone. Verbatim questionnaire submissions (PII). Users read own rows only.';
comment on table raw_pulls        is 'ARCHIVE zone. Verbatim external responses; may contain PII. Service role only.';
comment on table submissions_log  is 'Public, PII-free: one row per submission for live counters.';
