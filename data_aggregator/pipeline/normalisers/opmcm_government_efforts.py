"""
normalisers/opmcm_government_efforts.py — OPMCM `/api/government-efforts` (nepal.gov.np notices mirrored on the
rescue portal) → articles (ne) + one figure. docs/pull_external_data/05c-sources-wave3.md §opmcm_government_efforts.
Each item {title, agency, link, description, priority, source, nepalRef, createdAt}. `link` is usually the bare
portal domain, so the article url is the portal's own anchor `…/government-efforts#<nepalRef>` unless the link
has a path. Titles pass the relevance gate; places come from the gazetteer over title + description.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any
from urllib.parse import urlparse

from lib.htmlx import first_sentence
from lib.text import lang_of, nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt
from ._rss import is_relevant

SOURCE_ID = "opmcm_government_efforts"
PUBLISHER = "Nepal Govt portal (via OPMCM)"
PAGE = "https://rescue.opmcm.gov.np/government-efforts"


def item_url(it: dict[str, Any]) -> str:
    link = str(it.get("link") or "").strip()
    if link.startswith("http") and urlparse(link).path.strip("/"):
        return link
    ref = it.get("nepalRef") or it.get("_id") or ""
    return f"{PAGE}#{ref}" if ref else PAGE


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    total: int | None = None
    n_kept = 0
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        data = doc.get("data") or {}
        if isinstance(data.get("total"), (int, float)):
            total = int(data["total"])
        for it in data.get("items") or []:
            if not isinstance(it, dict):
                continue
            title = nfc(str(it.get("title") or "")).strip()
            desc = nfc(str(it.get("description") or "")).strip()
            if not title or not is_relevant(title, desc, gaz=ctx.gazetteer if ctx else None):
                continue
            places = ctx.gazetteer.resolve_ids(f"{title} {desc}") if (ctx and ctx.gazetteer is not None) else []
            out.article(url=item_url(it), title=title[:300], publisher=PUBLISHER, lang=lang_of(title),
                        published_at=parse_dt(it.get("createdAt")) or fetched_at, body=first_sentence(desc, 240) or None,
                        places=places, source_id=SOURCE_ID, fetched_at=fetched_at)
            n_kept += 1
    if total is not None:
        out.figure(publisher="OPMCM portal", metric="government_notices_total", value=total, as_of=fetched_at, url=PAGE,
                   note=f"{n_kept} passed the relevance gate", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
