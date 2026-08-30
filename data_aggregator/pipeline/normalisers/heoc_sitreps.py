"""
normalisers/heoc_sitreps.py — HEOC / MoHP "news & updates" → articles for the health-sector sitreps.
docs/pull_external_data/05a-sources-wave2-official.md §heoc_sitreps.

    /news (listing: one featured card with title, date, "read more" link)
        ─▶ ctx.fetch(featured detail) ─▶ "other news" rows (title + link + thumbnail) = the older sitreps
Every sitrep body is a base64-embedded JPEG: no text, no OCR here — the article carries title/url/date only.
Dates: the featured card prints one; the others are recovered from the thumbnail's PHP uniqid file name
(upload second, lib.html.php_uniqid_datetime) and noted as such.
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from lib import config
from lib.html import absolutize, php_uniqid_datetime
from lib.text import lang_of, nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "heoc_sitreps"
PUBLISHER = "HEOC/MoHP"
BASE = "https://heoc.mohp.gov.np/news"
FEATURED_RE = re.compile(r'<div class="news-date">\s*<p>([^<]*)</p>[\s\S]*?<h4 class="news-heading">([\s\S]*?)</h4>[\s\S]*?'
                         r'<a href="([^"]+)"\s+class="welcome-button">', re.I)
ROW_RE = re.compile(r'<div class="news-row">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[\s\S]*?'
                    r'<h5 class="news-detail-text">([\s\S]*?)</h5>', re.I)


def parse_listing(html: str) -> dict[str, Any] | None:
    m = FEATURED_RE.search(html or "")
    if not m:
        return None
    return {"date": m.group(1).strip(), "title": strip_tags(m.group(2)), "url": absolutize(BASE, m.group(3))}


def parse_other_news(html: str) -> list[dict[str, Any]]:
    return [{"url": absolutize(BASE, u), "image": img, "title": strip_tags(t)} for u, img, t in ROW_RE.findall(html or "")]


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"news listing: {p.error or p.status}")
        return out
    feat = parse_listing(p.body)
    if feat is None:
        out.notes.append("news listing: no featured item found")
        return out
    out.article(url=feat["url"], title=nfc(feat["title"])[:500], publisher=PUBLISHER, lang=lang_of(feat["title"]),
                published_at=parse_dt(feat["date"] + " 12:00", default_tz=config.KTM), body=None,
                source_id=SOURCE_ID, fetched_at=fetched_at)
    if ctx is None or ctx.fetch is None:
        return out
    f = ctx.fetch(feat["url"])
    if not getattr(f, "ok", False):
        out.notes.append(f"{feat['url']}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
        return out
    html = getattr(f, "text", "")
    out.notes.append(f"sitrep body is {len(re.findall(r'data:image', html))} embedded image(s); not OCR'd")
    seen = {feat["url"]}
    for row in parse_other_news(html):
        if row["url"] in seen or not row["title"]:
            continue
        seen.add(row["url"])
        when = php_uniqid_datetime(row["image"].rsplit("/", 1)[-1])
        out.article(url=row["url"], title=nfc(row["title"])[:500], publisher=PUBLISHER, lang=lang_of(row["title"]),
                    published_at=when, body=None, source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
