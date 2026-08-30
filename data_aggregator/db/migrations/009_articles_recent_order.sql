-- 009: v_articles_recent — undated articles (tag pages, feeds without pubDate) used to sort by fetched_at and so
-- floated to the top of "Latest" with a "—" time. Dated articles first, newest first; undated after them by fetch time.
-- Also exposes fetched_at so a reader can show "seen <time>" when published_at is unknown.
create or replace view v_articles_recent as
select id, source_id, url, title, publisher, lang, published_at, places, fetched_at
from articles
order by published_at desc nulls last, fetched_at desc
limit 100;
grant select on v_articles_recent to anon, authenticated;
