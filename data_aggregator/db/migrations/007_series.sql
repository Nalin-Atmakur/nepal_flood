-- ============================================================================
-- 007_series.sql — DERIVED addition: one value per publisher × metric × scope × NPT day.
--   figure_series : written by process_data ⑨ (processing/trends.py) from `figures`; the last value a
--                   publisher stated on each Kathmandu calendar day. Sparklines / "since yesterday"
--                   on the site read this instead of the RAW `figures` table (which is private).
-- Public (anon select), like stats. docs: pipeline/docs/process_data/10-timeline-and-trends.md
-- ============================================================================

create table if not exists figure_series (
  publisher   text not null,
  metric      text not null,
  scope       text not null default 'national',
  day         date not null,                 -- Asia/Kathmandu calendar day of as_of
  value       numeric not null,              -- the day's last published value
  as_of       timestamptz,                   -- when that value was stated
  url         text,
  computed_at timestamptz not null default now(),
  primary key (publisher, metric, scope, day)
);
create index if not exists figure_series_metric_idx on figure_series (metric, publisher, day);

alter table figure_series enable row level security;
drop policy if exists figure_series_public on figure_series;
create policy figure_series_public on figure_series for select to anon, authenticated using (true);

comment on table figure_series is 'DERIVED, public. Per-day series of every published figure (process_data ⑨).';
