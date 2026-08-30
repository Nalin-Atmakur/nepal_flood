"""
normalisers/china_mfa_pressers.py — China MFA spokesperson regular press conferences (EN) → articles.
docs/pull_external_data/05a-sources-wave2-official.md §china_mfa_pressers.

    /eng/xw/fyrbt/lxjzh/  links ./202608/t20260828_12012299.html (date in the file name)
        pressers dated ≥ 2026-08-25 ─▶ ctx.fetch the newest MAX_DETAIL not yet seen (state key 'pages')
        ─▶ only the <p> paragraphs mentioning Nepal / Gyirong / Tibet / mudslide / barrier lake become the body
        ─▶ article (en) with published_at = <meta name="PubDate"> (CST); pressers without such a paragraph
            are recorded as seen and produce no row
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from lib.html import absolutize, meta_content
from lib.text import nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "china_mfa_pressers"
PUBLISHER = "China MFA"
BASE = "https://www.mfa.gov.cn/eng/xw/fyrbt/lxjzh/"
CST = timezone(timedelta(hours=8))
MAX_DETAIL = 5
MIN_DATE = "20260826"
TOPIC = re.compile(r"Nepal|Gyirong|Kyirong|Kerung|Tibet|Xizang|mudslide|flash flood|barrier lake|Rasuwa|glacier", re.I)
LINK_RE = re.compile(r'<a[^>]*href="([^"]*t(\d{8})_\d+\.html)"[^>]*>([^<]+)</a>', re.I)


def parse_listing(html: str) -> list[dict[str, str]]:
    items: dict[str, dict[str, str]] = {}
    for href, ymd, title in LINK_RE.findall(html or ""):
        url = absolutize(BASE, href)
        items.setdefault(url, {"url": url, "ymd": ymd, "title": nfc(title).strip()})
    return sorted(items.values(), key=lambda x: (x["ymd"], x["url"]), reverse=True)


def topic_paragraphs(html: str) -> list[str]:
    paras = [strip_tags(x) for x in re.findall(r"<p[^>]*>([\s\S]*?)</p>", html or "", re.I)]
    return [t for t in paras if t and TOPIC.search(t)]


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"listing: {p.error or p.status}")
        return out
    items = [it for it in parse_listing(p.body) if it["ymd"] >= MIN_DATE]
    if not items:
        out.notes.append("listing: no pressers since the event")
        return out
    if ctx is None or ctx.fetch is None:
        out.notes.append("no fetcher: pressers need their body to pass the relevance gate")
        return out
    seen = ctx.state.seen(SOURCE_ID, "pages") if ctx.state is not None else set()
    done: list[str] = []
    for it in [x for x in items if x["url"] not in seen][:MAX_DETAIL]:
        f = ctx.fetch(it["url"])
        if not getattr(f, "ok", False):
            out.notes.append(f"{it['url']}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            continue
        html = getattr(f, "text", "")
        paras = topic_paragraphs(html)
        done.append(it["url"])
        if not paras:
            out.notes.append(f"{it['ymd']}: no Nepal / Gyirong remarks")
            continue
        published = parse_dt(meta_content(html, "PubDate"), default_tz=CST) or parse_dt(it["ymd"], default_tz=CST)
        out.article(url=it["url"], title=it["title"][:500], publisher=PUBLISHER, lang="en", published_at=published,
                    body="\n".join(paras)[:2000], source_id=SOURCE_ID, fetched_at=fetched_at)
    if done and ctx.state is not None and not ctx.dry_run:
        ctx.state.add_seen(SOURCE_ID, done, key="pages")
    return out
