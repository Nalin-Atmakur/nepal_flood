"""
normalisers/china_mwr.py — China Ministry of Water Resources 水利要闻 listing → articles (zh) + barrier-lake figures.
docs/pull_external_data/05a-sources-wave2-official.md §china_mwr.

    /xw/slyw/  <li><span>2026-08-27</span><a href="./202608/t20260827_2140605.html">…</a></li>
        keep items whose title mentions 吉隆 / 堰塞湖 / 尼泊尔 / 西藏 / 错坚 / 普热普强 / 樟木
        ─▶ ctx.fetch the newest MAX_DETAIL not yet seen (state key 'pages'): <meta name="PubDate"> (CST),
            article text from the `xlcontainer` block ─▶ article body (≤ 2000 chars)
        ─▶ figures 'China MWR' when a volume is stated ("蓄水量约200万立方米"): barrier_lake_volume_m3, or
            barrier_lake_inflow_m3 for inflow/outflow phrases (入湖/来水/下泄), scope place:barrier_lake_site, as_of = PubDate
Items already seen (or when nothing can be fetched) still get an article row from the listing (date only).
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from lib.html import absolutize, meta_content
from lib.text import nfc, to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "china_mwr"
PUBLISHER = "China MWR"
BASE = "http://www.mwr.gov.cn/xw/slyw/"
CST = timezone(timedelta(hours=8))
MAX_DETAIL = 6
TOPIC = re.compile(r"吉隆|堰塞湖|尼泊尔|西藏|错坚|普热普强|樟木|东林藏布")
ITEM_RE = re.compile(r"<li>\s*<span>(\d{4}-\d{2}-\d{2})</span>\s*<a[^>]*href=\"([^\"]+)\"[^>]*>([^<]+)</a>", re.I)
VOLUME_RE = re.compile(r"(?:堰塞湖|库容|蓄水量|水量|总量)[^。；;]{0,30}?(?:约|近|超过|超|达|逾)?\s*([0-9][0-9.,]*)\s*(万|亿)?\s*(?:立方米|方)")
VOLUME_RE_2 = re.compile(r"([0-9][0-9.,]*)\s*(万|亿)?\s*立方米[^。；;]{0,20}?(?:堰塞湖|蓄水|库容)")
UNIT = {"万": 10_000, "亿": 100_000_000, None: 1, "": 1}


def parse_listing(html: str) -> list[dict[str, str]]:
    return [{"date": d, "url": absolutize(BASE, u), "title": nfc(t).strip()} for d, u, t in ITEM_RE.findall(html or "")]


def article_text(html: str) -> str:
    i = (html or "").find("xlcontainer")
    seg = html[i:] if i >= 0 else html or ""
    for stop in ("作者：", "扫一扫", "责编", "访问量统计"):
        j = seg.find(stop)
        if j > 0:
            seg = seg[:j]
    return strip_tags(seg)


INFLOW = re.compile(r"入湖|来水|下泄|溃泄|泄流")


def volumes(text: str) -> list[tuple[float, str, str]]:
    """(m³, matched phrase, metric): a stored-water phrase → barrier_lake_volume_m3; an inflow / outflow phrase
    ("未来3天入湖水量约300万立方米") → barrier_lake_inflow_m3 so the two are never confused."""
    found: list[tuple[float, str, str]] = []
    seen: set[str] = set()
    for rx in (VOLUME_RE, VOLUME_RE_2):
        for m in rx.finditer(text):
            n = to_number(m.group(1))
            if n is None or m.group(0) in seen:
                continue
            seen.add(m.group(0))
            metric = "barrier_lake_inflow_m3" if INFLOW.search(m.group(0)) else "barrier_lake_volume_m3"
            found.append((n * UNIT.get(m.group(2)), m.group(0)[:60], metric))
    return found


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"listing: {p.error or p.status}")
        return out
    items = [it for it in parse_listing(p.body) if TOPIC.search(it["title"])]
    if not items:
        out.notes.append("listing: no Gyirong / barrier-lake items")
        return out
    seen = ctx.state.seen(SOURCE_ID, "pages") if (ctx and ctx.state is not None) else set()
    done: list[str] = []
    fetched = 0
    for it in sorted(items, key=lambda x: x["url"], reverse=True):
        published = parse_dt(it["date"], default_tz=CST)
        body = None
        if ctx is not None and ctx.fetch is not None and it["url"] not in seen and fetched < MAX_DETAIL:
            fetched += 1
            f = ctx.fetch(it["url"])
            if getattr(f, "ok", False):
                html = getattr(f, "text", "")
                published = parse_dt(meta_content(html, "PubDate"), default_tz=CST) or published
                text = article_text(html)
                body = text[:2000] or None
                for value, snippet, metric in volumes(text):
                    out.figure(publisher=PUBLISHER, metric=metric, value=value, scope="place:barrier_lake_site",
                               as_of=published, url=it["url"], note=snippet, source_id=SOURCE_ID, fetched_at=fetched_at)
                done.append(it["url"])
            else:
                out.notes.append(f"{it['url']}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
        out.article(url=it["url"], title=it["title"][:500], publisher=PUBLISHER, lang="zh", published_at=published,
                    body=body, source_id=SOURCE_ID, fetched_at=fetched_at)
    if done and ctx and ctx.state is not None and not ctx.dry_run:
        ctx.state.add_seen(SOURCE_ID, done, key="pages")
    return out
