-- ============================================================================
-- 002_raw.sql — RAW zone (normalised, anonymised; service role only)
-- Written by: pull_external_data (figures, gauges, articles, pulls), process_data ⓪ (reports_anon)
-- Read by:    process_data.  Never the public site — except `places` and `sources` (reference data).
-- ============================================================================

-- Reference: the source registry (seeded from sources.yaml).
create table if not exists sources (
  id           text primary key,
  name         text,                    -- display name for /sources
  grp          text,                    -- government | humanitarian | geospatial | news | community | signals
  family       text not null,
  url          text,
  reliability  char(1),
  pii          boolean not null default false,
  cadence      text,
  holds        text,
  catalogue    text
);

-- Reference: the corridor gazetteer (seeded from gazetteer/places.csv).
create table if not exists places (
  id                   text primary key,          -- slug: timure, syabrubesi, ut1_mailung_camp …
  name_en              text not null,
  name_ne              text,
  name_hi              text,
  name_zh              text,
  aliases              text[] not null default '{}',
  kind                 text not null,             -- settlement | camp | tunnel_portal | checkpost | helipad | lodge_cluster | hospital | shelter | border | district
  district             text,
  municipality         text,
  ward                 int,
  lat                  double precision,
  lon                  double precision,
  elev_m               int,
  km                   double precision,          -- corridor chainage: Gyirong ≈ -3, Timure 4, Syabrubesi 16 … Bharatpur ~110; null = off-corridor
  side                 text not null default 'NP' check (side in ('NP','CN')),
  in_channel           boolean not null default false,
  below_barrier_lakes  boolean not null default false,
  notes                text
);
alter table reports_archive
  add constraint reports_archive_place_fk foreign key (place_id) references places (id);

-- Pull log (one row per attempt, including unchanged/skipped).
create table if not exists pulls (
  id           bigserial primary key,
  source_id    text not null references sources (id),
  fetched_at   timestamptz not null default now(),
  ok           boolean not null,
  unchanged    boolean not null default false,
  http_status  int,
  bytes        int,
  raw_pull_id  bigint references raw_pulls (id),
  error        text
);
create index if not exists pulls_source_idx on pulls (source_id, fetched_at desc);

-- Every official/public number, with its label. Never a bare figure.
create table if not exists figures (
  id          bigserial primary key,
  source_id   text references sources (id),
  publisher   text not null,          -- NDRRMA | Nepal Police | MoFA | DoT | OPMCM | NEOC | NTB | Xinhua | …
  metric      text not null,          -- dead | missing | out_of_contact | rescued | injured | tourists_out_of_contact | foreigners_missing | foreigners_found | lost_open | found | stationed | shelter_people | precip_mm | low_cloud_pct | seismic_event | bridge_status | …
  scope       text not null default 'national',   -- national | district:<name> | nationality:<iso> | place:<place_id> | project:<name>
  value       numeric not null,
  as_of       timestamptz,            -- validity time stated by the publisher
  fetched_at  timestamptz not null default now(),
  url         text,
  note        text,
  unique (publisher, metric, scope, as_of, value)
);
create index if not exists figures_lookup_idx on figures (publisher, metric, scope, as_of desc);

create table if not exists gauges (
  station_id    text not null,
  station_name  text,
  river         text,
  lat           double precision,
  lon           double precision,
  level         numeric,
  warning       numeric,
  danger        numeric,
  observed_at   timestamptz not null,
  fetched_at    timestamptz not null default now(),
  alive         boolean,              -- observed_at within 2h of fetch
  primary key (station_id, observed_at)
);

create table if not exists articles (
  id            bigserial primary key,
  source_id     text references sources (id),
  url           text not null unique,
  title         text,
  publisher     text,
  lang          text,
  published_at  timestamptz,
  fetched_at    timestamptz not null default now(),
  body          text,
  places        text[] not null default '{}',   -- resolved place ids (process_data ①)
  extracted     jsonb                           -- [{place_id, count, status, subject, time}] from prose
);
create index if not exists articles_published_idx on articles (published_at desc);

-- Anonymised projection of reports_archive (process_data ⓪). No names, phones, passports, photos, contact.
create table if not exists reports_anon (
  id               uuid primary key,             -- = reports_archive.id
  archive_id       uuid not null unique,
  created_at       timestamptz not null,
  lang             text,
  respondent_type  text not null,
  supersedes       uuid,
  -- keys for dedup (hashes, never raw)
  person_key       text,                         -- sha256(normalised phone) or sha256(name+age+nationality)
  group_key        text,                         -- normalised operator/project/pilgrim group
  -- extracted structure (model output; all optional)
  place_id         text references places (id),
  place_text       text,                         -- redacted free-text place
  event_time       timestamptz,                  -- last-communication / was-there time
  status           text,                         -- missing | reported_safe | rescued | seen | unknown …
  subject_count    int,                          -- how many people this row is about
  nationality      text,
  age_band         text check (age_band in ('0-17','18-39','40-64','65+') or age_band is null),
  sex              text,
  purpose          text,
  travel_mode      text,
  operator         text,
  employer_project text,
  reported_to      text[] not null default '{}',
  extracted        jsonb,                        -- full structured extraction (redacted)
  text_redacted    text,                         -- free text with PII removed
  text_en          text,                         -- translation to EN
  model            text,                         -- which model/prompt version produced this
  anonymised_at    timestamptz not null default now()
);
create index if not exists reports_anon_place_idx on reports_anon (place_id);
create index if not exists reports_anon_person_idx on reports_anon (person_key);

comment on table sources      is 'RAW reference. Source registry from sources.yaml. Public select.';
comment on table places       is 'RAW reference. Corridor gazetteer. Public select (form picker, place pages).';
comment on table figures      is 'RAW. Every official number with publisher/as_of. Service role only.';
comment on table gauges       is 'RAW. DHM/BIPAD gauge observations. Public select.';
comment on table articles     is 'RAW. Headlines/bodies; body is service-only via view.';
comment on table reports_anon is 'RAW. Anonymised projection of reports_archive. Service role only.';
