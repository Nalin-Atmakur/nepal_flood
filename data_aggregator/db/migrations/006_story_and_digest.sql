-- ============================================================================
-- 006_story_and_digest.sql — DERIVED additions for the "what happened / what is happening" picture
--   event_timeline : the reconstructed first hours of 26 Aug (seeded from DHM/NDRRMA/USGS reporting;
--                    process_data may append later dated events) — home block "The first hours"
--   digest         : per-day, per-language "what changed" bullets written by process_data ⑦
-- Both public (anon select). docs/04-derived.md.
-- ============================================================================

create table if not exists event_timeline (
  id          text primary key,                -- slug, e.g. t0837_collapse
  at          timestamptz not null,            -- UTC
  at_label    text not null,                   -- display in NPT, e.g. "08:37"
  place_id    text references places (id),
  km          double precision,                -- corridor chainage (for the strip)
  what_en     text not null,
  what_ne     text,
  what_hi     text,
  kind        text not null default 'event',   -- trigger | wave | gauge | warning | impact | response
  source      text,                            -- publisher
  source_url  text,
  computed_at timestamptz not null default now()
);
create index if not exists event_timeline_at_idx on event_timeline (at);

create table if not exists digest (
  day         date not null,                   -- NPT calendar day
  lang        text not null check (lang in ('en','ne','hi')),
  bullets     jsonb not null,                  -- [{text, kind: figure|place|gauge|news, source_url}]
  headline    text,                            -- one line
  computed_at timestamptz not null default now(),
  model       text,
  primary key (day, lang)
);

alter table event_timeline enable row level security;
alter table digest         enable row level security;
create policy event_timeline_public on event_timeline for select to anon, authenticated using (true);
create policy digest_public         on digest         for select to anon, authenticated using (true);

comment on table event_timeline is 'DERIVED, public. The reconstructed event timeline (seeded + appended).';
comment on table digest         is 'DERIVED, public. Daily "what changed" bullets per language (process_data ⑦).';
