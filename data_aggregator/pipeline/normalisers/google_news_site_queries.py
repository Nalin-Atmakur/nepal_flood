"""
normalisers/google_news_site_queries.py — Google News RSS `site:` queries for outlets without a feed → articles.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §google_news_site_queries.
One envelope part per query (list in sources.yaml). Item title is "<headline> - <outlet>" (suffix stripped), `link`
is a news.google.com redirector: legacy base64 ids decode to the real URL offline; the newer AU_yqL… ids need a
JS/POST round-trip, so the redirector itself is stored (still unique per article, so `articles.url` dedupes).
publisher = the item's <source> element (mapped through _rss.PUBLISHERS when the real URL is known);
lang from the headline script; relevance gate per item; dedupe on url across queries.
"""
from __future__ import annotations

import base64
import re
from datetime import datetime
from typing import Any
from urllib.parse import urlparse

import feedparser

from lib.text import lang_of, nfc

from . import Context, NormalisedRows, parts
from ._rss import PUBLISHERS, entry_datetime, is_relevant, publisher_for

SOURCE_ID = "google_news_site_queries"
_ID_RE = re.compile(r"news\.google\.com/(?:rss/)?articles/([A-Za-z0-9_-]+)")
_URL_IN_BYTES = re.compile(rb"https?://[\x21-\x7e]{8,}")


def decode_redirector(link: str) -> str | None:
    """Legacy Google News ids embed the target URL in base64; the AU_yqL… format does not (→ None)."""
    m = _ID_RE.search(link or "")
    if not m:
        return None
    token = m.group(1)
    try:
        blob = base64.urlsafe_b64decode(token + "=" * (-len(token) % 4))
    except (ValueError, TypeError):
        return None
    if b"AU_yqL" in blob:
        return None
    i = blob.find(b"http")
    if i > 0:                                        # legacy layout: <len byte><url bytes>
        n = blob[i - 1]
        cand = blob[i:i + n]
        if n >= 12 and cand.startswith((b"http://", b"https://")):
            try:
                return cand.decode("utf-8")
            except UnicodeDecodeError:
                pass
    hit = _URL_IN_BYTES.search(blob)
    return hit.group(0).decode("ascii") if hit else None


def split_title(title: str) -> tuple[str, str | None]:
    t = nfc(title).strip()
    if " - " in t:
        head, _, tail = t.rpartition(" - ")
        if 0 < len(tail) <= 60:
            return head.strip(), tail.strip()
    return t, None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    gaz = ctx.gazetteer if ctx else None
    seen: set[str] = set()
    dropped = 0
    for p in parts(raw):
        if not p.ok or not p.body.strip():
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        feed = feedparser.parse(p.body)
        for e in feed.entries:
            link = (e.get("link") or "").strip()
            title, suffix = split_title(e.get("title") or "")
            if not link or not title:
                continue
            real = decode_redirector(link)
            url = real or link
            if url in seen:
                continue
            src = e.get("source") or {}
            src_title = nfc(src.get("title") if isinstance(src, dict) else "").strip() or suffix
            src_href = src.get("href") if isinstance(src, dict) else None
            if real:
                pub = publisher_for(real, src_title)
            else:
                host = urlparse(src_href or "").netloc.lower().removeprefix("www.")
                pub = PUBLISHERS.get(host) or src_title or host or "Google News"
            if not is_relevant(title, "", gaz):
                dropped += 1
                continue
            seen.add(url)
            out.article(url=url, title=title[:500], publisher=pub, lang=lang_of(title), published_at=entry_datetime(e),
                        body=None, source_id=SOURCE_ID, fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"google news: {dropped} off-topic item(s) dropped by the relevance gate")
    return out
