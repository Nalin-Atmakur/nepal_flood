-- ============================================================================
-- 003_derived.sql — DERIVED zone (computed by process_data; the site reads these)
-- Public: figures_latest, place_status, stats, report_counts
-- Private: entities, entity_events, dedup_queue, findings
-- ============================================================================

-- One row per publisher × metric × scope: the latest value (process_data ④).
create table if not exists figures_latest (
  publisher   text not null,
  metric      text not null,
  scope       text not null default 'national',
  value       numeric not null,
  as_of       timestamptz,
  url         text,
  note        text,
  computed_at timestamptz not null default now(),
  primary key (publisher, metric, scope)
);

-- Per-place ledger (process_data ③). One row per place per run; site reads latest.
create table if not exists place_status (
  place_id           text not null references places (id),
  as_of              timestamptz not null default now(),
  expected           int not null default 0,
  confirmed_reached  int not null default 0,
  unknown            int not null default 0,
  reports_count      int not null default 0,
  last_contact_at    timestamptz,
  telecom_restored   boolean,
  phones             text,           -- display: 'yes (since 28 Aug)' | 'no' | 'partial' | null
  access             text,           -- road | road_partial | foot | helicopter_only | unknown
  hazard             text,           -- observed only: in_channel | below_barrier_lakes | null
  nearest_gauge      text,           -- 'Galchhi — alive' etc.
  shelter            text,
  km                 double precision,
  status_label       text,           -- mostly_unknown | mostly_reached | no_data
  note               text,
  primary key (place_id, as_of)
);

-- "Status, day by day" on the place page (process_data ③). Public.
create table if not exists place_timeline (
  place_id   text not null references places (id),
  day        date not null,
  what_en    text not null,
  what_ne    text,
  what_hi    text,
  dot        text not null default 'neutral',   -- live | unknown | confirmed | neutral
  source_url text,
  computed_at timestamptz not null default now(),
  primary key (place_id, day, what_en)
);
create index if not exists place_status_latest_idx on place_status (place_id, as_of desc);

-- The striking numbers (process_data ⑤). Keyed so the site can pick by id.
create table if not exists stats (
  id          text primary key,      -- wave_time_to_port | wave_speed | galchhi_rise | bodies_downstream_km | missing_counts_divergence | reports_total | reports_last_hour | places_with_unknown | gauges_alive | next_flying_window …
  value       text not null,         -- display string, e.g. "7 min", "~193 km/h"
  numeric     numeric,
  caption_en  text, caption_ne text, caption_hi text,
  source_url  text,
  as_of       timestamptz,
  computed_at timestamptz not null default now()
);

-- Counts of contributions by type × place × hour (process_data). No other columns — ever.
create table if not exists report_counts (
  bucket           timestamptz not null,       -- hour
  respondent_type  text not null,
  place_id         text not null default 'unresolved',   -- 'unresolved' when no place could be resolved
  n                int not null,
  computed_at      timestamptz not null default now(),
  primary key (bucket, respondent_type, place_id)
);

-- Resolved people (process_data ②). PRIVATE. Names live only in ARCHIVE; here keys + provenance.
create table if not exists entities (
  id                  uuid primary key default gen_random_uuid(),
  person_key          text,
  group_key           text,
  nationality         text,
  age_band            text,
  sex                 text,
  status              text,                   -- missing | reported_safe | rescued | stationed | deceased | unknown
  status_as_of        timestamptz,
  status_source       text,
  probable_place_id   text references places (id),
  probable_confidence real,
  last_place_id       text references places (id),
  last_contact_at     timestamptz,
  merged_from         jsonb not null default '[]',   -- [{source, external_id, score}]
  updated_at          timestamptz not null default now()
);
create index if not exists entities_person_idx on entities (person_key);
create index if not exists entities_place_idx on entities (probable_place_id);

create table if not exists entity_events (
  id         bigserial primary key,
  entity_id  uuid not null references entities (id) on delete cascade,
  at         timestamptz,
  status     text,
  place_id   text references places (id),
  source     text,
  note       text
);

-- Ambiguous merges (score 0.6–0.9) awaiting a human.
create table if not exists dedup_queue (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  a_ref       jsonb not null,     -- {source, external_id}
  b_ref       jsonb not null,
  score       real not null,
  reason      text,
  model_view  text,               -- optional LLM adjudication + reason
  decision    text check (decision in ('merge','distinct') or decision is null),
  decided_by  text,
  decided_at  timestamptz
);

-- Data-quality findings for list-holders (process_data ⑦).
create table if not exists findings (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  kind        text not null,      -- duplicate_across_lists | name_collision | stale_list | absent_from_setu | …
  detail      jsonb not null,
  handed_to   text,
  handed_at   timestamptz
);

-- Live counters view (public): submissions last 10 min / today, last pull.
create or replace view v_live_counts as
select
  (select count(*) from submissions_log where created_at > now() - interval '10 minutes') as submissions_10m,
  (select count(*) from submissions_log where created_at > date_trunc('day', now() at time zone 'Asia/Kathmandu') at time zone 'Asia/Kathmandu') as submissions_today,
  (select count(*) from submissions_log) as submissions_total,
  (select max(fetched_at) from pulls where ok) as last_pull_at,
  (select max(computed_at) from figures_latest) as last_processed_at;

-- Public projections of RAW tables that must not expose everything.
create or replace view v_articles_recent as
select id, source_id, url, title, publisher, lang, published_at, places
from articles
order by coalesce(published_at, fetched_at) desc
limit 100;

create or replace view v_place_status_latest as
select distinct on (ps.place_id)
  ps.*, p.name_en, p.name_ne, p.name_hi, p.kind, p.district, p.lat, p.lon, p.side
from place_status ps
join places p on p.id = ps.place_id
order by ps.place_id, ps.as_of desc;

create or replace view v_sources_status as
select s.id, s.name, s.grp, s.family, s.url, s.reliability, s.holds, s.pii, s.cadence,
       p.fetched_at as last_fetched_at, p.ok as last_ok, p.unchanged as last_unchanged, p.error as last_error
from sources s
left join lateral (
  select fetched_at, ok, unchanged, error from pulls where pulls.source_id = s.id order by fetched_at desc limit 1
) p on true;

create or replace view v_gauges_latest as
select distinct on (station_id) *
from gauges
order by station_id, observed_at desc;

comment on table figures_latest is 'DERIVED, public. Side-by-side official numbers.';
comment on table place_status   is 'DERIVED, public. Per-place ledger history.';
comment on table stats          is 'DERIVED, public. Striking numbers for the home page.';
comment on table report_counts  is 'DERIVED, public. Counts only.';
comment on table entities       is 'DERIVED, PRIVATE. Resolved people (keys + provenance, no names).';
comment on view  v_live_counts  is 'Public live counters.';
comment on table place_timeline is 'DERIVED, public. Day-by-day status per place.';
comment on view  v_sources_status is 'Public. Source registry joined to the latest pull.';
