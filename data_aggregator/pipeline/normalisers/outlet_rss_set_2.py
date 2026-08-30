"""
normalisers/outlet_rss_set_2.py — wave-4 feeds (ICIMOD, INSEC Online EN, Radio Nepal NE, Khabarhub NE, Setopati NE,
Himalkhabar, Deshsanchar) → articles. docs/pull_external_data/05d-sources-wave4.md §outlet_rss_set_2.
Same envelope-of-feeds shape and the same parsing as outlet_rss_set (one implementation of feed → article,
relevance gate included); this id only stamps its own source_id so the second set runs on its own cadence.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._rss import feed_to_articles

SOURCE_ID = "outlet_rss_set_2"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        out.extend(feed_to_articles(p, source_id=SOURCE_ID, fetched_at=fetched_at, gaz=ctx.gazetteer if ctx else None))
    return out
