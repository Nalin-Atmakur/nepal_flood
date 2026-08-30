"""
normalisers/ekantipur_live.py — Kantipur's live page (timestamped sub-headlines) + homepage dated links → articles (ne).
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §ekantipur_live.
Live page: <div class="live-news" data-story="<slug>"> … <p class="inter" data-date="YYYY-MM-DD HH:MM:SS"> (NPT) …
<h3>headline</h3> … <div class="live-news-collapse …">body</div>. One article per post: url = live page + '#' + slug,
published_at = data-date (NPT → UTC), body ≤ 2000 chars with the reporter byline (<strong>- name</strong>) removed,
places = gazetteer ids matched exactly in headline + body. Homepage: every https://ekantipur.com/<section>/2026/MM/DD/…html link with
anchor text, dated ≥ event start (published_at = that date 00:00 NPT). Relevance gate on every row.
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any
from urllib.parse import urlparse

from lib import config
from lib.htmlx import links, strip_tags
from lib.text import nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt
from ._rss import is_relevant

SOURCE_ID = "ekantipur_live"
PUBLISHER = "Kantipur"
LIVE_URL = "https://ekantipur.com/news/2026/08/26/17877170054081721.html"
_POST_SPLIT = re.compile(r'<div class="live-news"\s+data-story="([^"]+)"', re.S)
_DATE_RE = re.compile(r'data-date="(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)"')
_H3_RE = re.compile(r"<h3[^>]*>(.*?)</h3>", re.S)
_BODY_RE = re.compile(r'<div class="live-news-collapse[^"]*"[^>]*>(.*?)(?:<div class="live-news-item-content-image"|</div>\s*</div>\s*</div>\s*$)', re.S)
_BYLINE_RE = re.compile(r"<strong>\s*[-–—]\s*.*?</strong>", re.S)
_HOME_LINK_RE = re.compile(r"^https://ekantipur\.com/[a-z-]+/(\d{4})/(\d\d)/(\d\d)/[^/]+\.html$")


_POSTPOSITION_RE = re.compile(r"(?<=[\u0900-\u097F])(मा|को|का|की|बाट|ले|लाई|सम्म|देखि|तिर|सँग|सहित)(?=[\s,।.;:!?)]|$)")


def exact_places(gaz: Any, text: str) -> list[str]:
    """
    Gazetteer ids matched by a full alias key only (skeleton/fuzzy hits such as शनिबार→Shanti Bazar are left to ①).
    Nepali case postpositions are cut first so 'टिमुरेमा' / 'रसुवाका' / 'तनहुँबाट' still match exactly.
    """
    if gaz is None or not text:
        return []
    out: list[str] = []
    for m in gaz.resolve_all(_POSTPOSITION_RE.sub(" ", nfc(text))):
        if m.exact and m.place_id not in out:
            out.append(m.place_id)
    return out


def parse_live(html: str, page_url: str, fetched_at: datetime, ctx: Context | None) -> NormalisedRows:
    out = NormalisedRows()
    chunks = _POST_SPLIT.split(html)
    gaz = ctx.gazetteer if ctx else None
    dropped = 0
    for i in range(1, len(chunks) - 1, 2):
        slug, block = chunks[i], chunks[i + 1]
        m = _DATE_RE.search(block)
        h = _H3_RE.search(block)
        if not h:
            continue
        title = strip_tags(h.group(1)).strip()
        published = parse_dt(m.group(1), default_tz=config.KTM) if m else None
        b = _BODY_RE.search(block)
        body = strip_tags(_BYLINE_RE.sub("", b.group(1))) if b else ""
        body = re.sub(r"\n+", "\n", body).strip()[:2000]
        if not title:
            continue
        if not is_relevant(title, body, gaz):
            dropped += 1
            continue
        places = exact_places(gaz, f"{title} {body}")
        out.article(url=f"{page_url}#{slug}", title=title[:500], publisher=PUBLISHER, lang="ne", published_at=published,
                    body=body or None, places=places, source_id=SOURCE_ID, fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"ekantipur live: {dropped} post(s) dropped by the relevance gate")
    return out


def parse_home(html: str, fetched_at: datetime, ctx: Context | None) -> NormalisedRows:
    out = NormalisedRows()
    gaz = ctx.gazetteer if ctx else None
    seen: set[str] = set()
    dropped = 0
    for href, text in links(html):
        m = _HOME_LINK_RE.match(href.strip())
        title = nfc(text).strip()
        if not m or not title or href in seen:
            continue
        y, mo, d = (int(x) for x in m.groups())
        published = datetime(y, mo, d, tzinfo=config.KTM)
        if published < config.EVENT_START_UTC.astimezone(config.KTM).replace(hour=0, minute=0):
            continue
        if not is_relevant(title, "", gaz):
            dropped += 1
            continue
        seen.add(href)
        out.article(url=href, title=title[:500], publisher=PUBLISHER, lang="ne", published_at=published, body=None,
                    places=exact_places(gaz, title), source_id=SOURCE_ID, fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"ekantipur home: {dropped} link(s) dropped by the relevance gate")
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        if not p.ok or not p.body.strip():
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        path = urlparse(p.url or "").path
        if 'class="live-news"' in p.body:
            out.extend(parse_live(p.body, p.url or LIVE_URL, fetched_at, ctx))
        elif path in ("", "/") or "live-news" not in p.body:
            out.extend(parse_home(p.body, fetched_at, ctx))
    return out
