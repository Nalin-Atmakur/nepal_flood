-- ============================================================================
-- 012_source_extracts.sql — "exactly what we extracted from this source" (public views)
-- ============================================================================
-- /sources opens a per-source panel: counts, the newest figures, the newest article titles. RAW tables stay
-- revoked for anon; these views (owner postgres, security definer semantics of a plain view) expose only the
-- anonymised columns already public elsewhere. gauges has no source_id, so gauge counts are not per source.

create or replace view v_source_counts as
select s.id as source_id,
       coalesce(f.n, 0)::int as figures_total,
       coalesce(a.n, 0)::int as articles_total,
       greatest(f.last_at, a.last_at) as last_row_at
from sources s
left join (select source_id, count(*) as n, max(fetched_at) as last_at from figures group by source_id) f on f.source_id = s.id
left join (select source_id, count(*) as n, max(fetched_at) as last_at from articles group by source_id) a on a.source_id = s.id;

create or replace view v_source_figures_recent as
select source_id, publisher, metric, scope, value, as_of, fetched_at, url, note
from (
  select source_id, publisher, metric, scope, value, as_of, fetched_at, url, note,
         row_number() over (partition by source_id order by as_of desc nulls last, fetched_at desc) as rn
  from figures
  where source_id is not null
) x
where rn <= 40;

create or replace view v_source_articles_recent as
select source_id, title, url, publisher, published_at, fetched_at
from (
  select source_id, title, url, publisher, published_at, fetched_at,
         row_number() over (partition by source_id order by published_at desc nulls last, fetched_at desc) as rn
  from articles
  where source_id is not null
) x
where rn <= 8;

grant select on v_source_counts, v_source_figures_recent, v_source_articles_recent to anon, authenticated;

comment on view v_source_counts is 'Public. Per source: how many figures/articles rows it produced and when the last landed.';
comment on view v_source_figures_recent is 'Public. Newest ≤ 40 figures per source (anonymised columns only).';
comment on view v_source_articles_recent is 'Public. Newest ≤ 8 article titles per source.';
