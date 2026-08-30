-- 008_place_now.sql — the per-place "what is happening now" line (process_data step ⑩, processing/place_now.py).
-- One to two sentences per corridor place with any signal in the last 36 h, in three languages, with the
-- publishers named; written onto the latest place_status row so v_place_status_latest carries it.
-- See pipeline/docs/process_data/11-place-now.md and docs/data-model.md.

alter table place_status
  add column if not exists now_en      text,
  add column if not exists now_ne      text,
  add column if not exists now_hi      text,
  add column if not exists now_sources text,          -- 'OPMCM · NESRA · Kathmandu Post'
  add column if not exists now_as_of   timestamptz;

-- ps.* is expanded when the view is created; new columns land in the middle of the column list, so the view
-- has to be dropped and recreated (create or replace only allows appending columns at the end).
drop view if exists v_place_status_latest;
create view v_place_status_latest as
select distinct on (ps.place_id)
  ps.*, p.name_en, p.name_ne, p.name_hi, p.kind, p.district, p.lat, p.lon, p.side
from place_status ps
join places p on p.id = ps.place_id
order by ps.place_id, ps.as_of desc;

grant select on v_place_status_latest to anon, authenticated;
