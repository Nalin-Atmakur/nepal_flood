"""
normalisers/outlet_tag_pages.py — outlet tag / category / search listing pages (HTML) → articles.
docs/pull_external_data/05c-sources-wave3.md §outlet_tag_pages.

For outlets without a usable feed (or whose feed misses the back-catalogue) the puller fetches the listing
page(s) for the flood tag (`{n}` → up to HTML_MAX_PAGES). Every same-host anchor whose path looks like an
article for that outlet becomes a candidate; the longest anchor text per url is the title (listing pages
repeat a link for image + headline). Titles pass the relevance gate. A date in the path (Kathmandu Post
`/section/YYYY/MM/DD/slug`) becomes published_at, otherwise it stays unknown rather than invented.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin, urlparse

from lib.text import lang_of, nfc

from . import Context, NormalisedRows, parts
from ._common import strip_tags
from ._rss import is_relevant, published_from_path, publisher_for

SOURCE_ID = "outlet_tag_pages"
_A = re.compile(r"<a\s[^>]*?href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", re.S | re.I)
# host → article path pattern; unknown hosts fall back to "two path segments, slug ≥ 10 chars"
ARTICLE_PATHS: dict[str, re.Pattern[str]] = {
    "kathmandupost.com": re.compile(r"^/[a-z-]+/20\d{2}/\d{2}/\d{2}/[a-z0-9-]{8,}$"),
    "thehimalayantimes.com": re.compile(r"^/[a-z-]+/[a-z0-9-]{10,}$"),
    "english.onlinekhabar.com": re.compile(r"^/[a-z0-9-]{8,}\.html$"),
    "onlinekhabar.com": re.compile(r"^/content/\d+"),
    "gorkhapatraonline.com": re.compile(r"^/news/\d+"),
    "inseconline.org": re.compile(r"^/(main_news|uncategorized-en|[a-z_-]+)/\d+/?$"),
}
_FALLBACK = re.compile(r"^/[a-z0-9-]+/[a-z0-9-]{10,}/?$")
MIN_TITLE = 12


def _host(url: str) -> str:
    h = urlparse(url).netloc.lower()
    return h[4:] if h.startswith("www.") else h


def candidates(html: str, page_url: str) -> dict[str, str]:
    """url → best title for every article-looking same-host link on a listing page."""
    host = _host(page_url)
    pat = ARTICLE_PATHS.get(host, _FALLBACK)
    found: dict[str, str] = {}
    for href, inner in _A.findall(html or ""):
        url = urljoin(page_url, href.strip()).split("#")[0]
        if _host(url) != host or not pat.search(urlparse(url).path):
            continue
        title = nfc(strip_tags(inner)).strip()
        title = re.sub(r"\s+", " ", title)
        if len(title) < MIN_TITLE:
            continue
        if len(title) > len(found.get(url, "")):
            found[url] = title
    return found




def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    gaz = ctx.gazetteer if ctx is not None else None
    seen: set[str] = set()
    dropped = 0
    for p in parts(raw):
        if not p.ok or not p.body.strip():
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        for url, title in candidates(p.body, p.url).items():
            if url in seen:
                continue
            seen.add(url)
            if not is_relevant(title, None, gaz=gaz):
                dropped += 1
                continue
            out.article(url=url, title=title[:300], publisher=publisher_for(url, None), lang=lang_of(title),
                        published_at=published_from_path(url), places=gaz.resolve_ids(title) if gaz is not None else [],
                        source_id=SOURCE_ID, fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"{dropped} listing links failed the relevance gate")
    return out
