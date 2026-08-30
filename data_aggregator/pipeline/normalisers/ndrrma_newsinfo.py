"""
normalisers/ndrrma_newsinfo.py — NDRRMA press-note "newsinfo" cards → articles.
docs/pull_external_data/05a-sources-wave2-official.md §ndrrma_newsinfo.

    /api/v1/pressnotenews/newsinfo/?ordering=-id&limit=40  {count, results:[{id, title, title_ne, description(_ne) HTML,
    summary(_ne), date, image}]}
Each card since two days before the event becomes an article: url = the card image (the only stable per-card URL;
falls back to the API detail URL), title_ne | title, lang by script, published_at = `date` (noon NPT),
body = description text (≤ 2000 chars) with "Contact: <name> - <phone>" / सम्पर्क lines dropped and phones redacted.
Publisher 'NDRRMA'. No figures — the amounts live in prose.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any

from lib import config
from lib.text import lang_of, nfc, redact_pii

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

CONTACT_LINE = re.compile(r"contact\s*:|सम्पर्क|फोन|phone|mobile|[\d०-९][\d०-९\-\s]{6,}[\d०-९]|X{6,}", re.I)   # any line naming a person to call


def clean_body(html_text: str | None) -> str:
    lines = [l.strip() for l in strip_tags(html_text or "").splitlines()]
    return redact_pii("\n".join(l for l in lines if l and not CONTACT_LINE.search(l)))

SOURCE_ID = "ndrrma_newsinfo"
PUBLISHER = "NDRRMA"
API = "https://ndrrma.gov.np/api/v1/pressnotenews/newsinfo/"
MIN_DATE = (config.EVENT_START_UTC - timedelta(days=2)).date().isoformat()


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    rows: list[dict[str, Any]] = []
    for p in parts(raw):
        doc = p.json()
        if p.ok and isinstance(doc, dict):
            rows.extend(r for r in (doc.get("results") or []) if isinstance(r, dict))
        elif not p.ok:
            out.notes.append(f"{p.url}: {p.error or p.status}")
    if not rows:
        out.notes.append("newsinfo: no results")
        return out
    old = 0
    for r in rows:
        date = str(r.get("date") or "")
        if date and date < MIN_DATE:
            old += 1
            continue
        title = nfc(r.get("title_ne") or r.get("title") or "").strip()
        if not title:
            continue
        url = r.get("image") or f"{API}{r.get('id')}/"
        desc = clean_body(r.get("description_ne") or r.get("description") or r.get("summary_ne") or r.get("summary") or "")
        desc = desc if desc and desc.lower() != "none" else ""
        out.article(url=url, title=title[:500], publisher=PUBLISHER, lang=lang_of(title),
                    published_at=parse_dt(date + " 12:00", default_tz=config.KTM) if date else None,
                    body=desc[:2000] or None, source_id=SOURCE_ID, fetched_at=fetched_at)
    if old:
        out.notes.append(f"{old} card(s) older than {MIN_DATE} skipped")
    return out
