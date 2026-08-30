"""
normalisers/dao_rasuwa_hub.py — DAO Rasuwa "भोटेकोशी बाढी (भाद्र २०८३)" hub page → articles for its notices.
docs/pull_external_data/05a-sources-wave2-official.md §dao_rasuwa_hub.

Shape: Livewire page; the content area holds `.pro_contents` cards (link + <strong>title</strong> + <small>BS date</small>)
and a footer "पछिल्लो अपडेट गरिएको : 2083-05-13 15:12:59". Emits one article for the hub (published_at = that
update time) and one per card (published_at = the card's BS date, noon NPT; body = hub title so the relevance
gate sees the flood context). Linked PDFs are scanned images (some with PII) and are never fetched.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any

from lib.html import absolutize
from lib.text import lang_of, nfc, nepali_digits

from . import Context, NormalisedRows, parts
from ._common import parse_bs_datetime, strip_tags

SOURCE_ID = "dao_rasuwa_hub"
PUBLISHER = "DAO Rasuwa"
CARD_RE = re.compile(r'<div class="pro_contents">\s*<a\s+href="([^"]+)"\s*>\s*<strong[^>]*>([\s\S]*?)</strong>[\s\S]*?</a>\s*(?:<small>([^<]*)</small>)?', re.I)
UPDATED_RE = re.compile(r"पछिल्लो अपडेट गरिएको\s*:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})")


def parse_cards(html: str, base: str) -> list[dict[str, Any]]:
    return [{"url": absolutize(base, u), "title": strip_tags(t), "date": (d or "").strip()} for u, t, d in CARD_RE.findall(html or "")]


def bs_date(s: str | None, hour: int = 12) -> datetime | None:
    dt = parse_bs_datetime(nepali_digits(s or ""))
    return dt + timedelta(hours=hour) if dt else None     # parse_bs_datetime yields 00:00 NPT for a bare date


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    hub_url = source.get("url") if isinstance(source.get("url"), str) else "https://daorasuwa.moha.gov.np"
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"hub page: {p.error or p.status}")
        return out
    tm = re.search(r"<title>(.*?)</title>", p.body, re.S | re.I)
    hub_title = nfc(strip_tags(tm.group(1)) if tm else "भोटेकोशी बाढी — DAO Rasuwa")
    um = UPDATED_RE.search(nfc(p.body))
    updated = bs_date(um.group(1), 0) if um else None
    if updated and um:
        updated = updated + timedelta(hours=int(um.group(2)), minutes=int(um.group(3)))
    out.article(url=hub_url, title=hub_title[:500], publisher=PUBLISHER, lang=lang_of(hub_title), published_at=updated,
                body=None, source_id=SOURCE_ID, fetched_at=fetched_at)
    cards = parse_cards(p.body, hub_url)
    if not cards:
        out.notes.append("hub: no notice cards found")
    for c in cards:
        if not c["title"] or c["url"] == hub_url:
            continue
        out.article(url=c["url"], title=c["title"][:500], publisher=PUBLISHER, lang=lang_of(c["title"]),
                    published_at=bs_date(c["date"]), body=f"{hub_title} · जिल्ला प्रशासन कार्यालय, रसुवा (धुन्चे)",
                    source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
