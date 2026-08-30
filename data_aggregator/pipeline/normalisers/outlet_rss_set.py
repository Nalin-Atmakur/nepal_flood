"""
normalisers/outlet_rss_set.py — 13 Nepali/English outlet feeds → articles.
docs/pull_external_data/05-sources.md §outlet_rss_set. One envelope part per feed; publisher from
the link domain (normalisers/_rss.PUBLISHERS) else the feed title; lang from script detection
(Devanagari → ne, Hindi markers → hi, Latin → en). Body fetch is OFF (FETCH_BODIES=False): the
feed summary is stored instead. Articles with no title or link are skipped; nothing else filters
here — process_data ① decides which articles mention corridor places.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._rss import feed_to_articles

SOURCE_ID = "outlet_rss_set"
FETCH_BODIES = False


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        out.extend(feed_to_articles(p, source_id=SOURCE_ID, fetched_at=fetched_at, gaz=ctx.gazetteer if ctx else None))
    return out
