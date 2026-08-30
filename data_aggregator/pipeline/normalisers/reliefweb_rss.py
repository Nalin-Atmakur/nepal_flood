"""
normalisers/reliefweb_rss.py — ReliefWeb updates RSS (search=rasuwa) → articles.
docs/pull_external_data/05-sources.md §reliefweb_rss. Publisher = "<author> (via ReliefWeb)".
Bodies are not fetched (the feed summary paragraph is kept as `body`).
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._rss import feed_to_articles

SOURCE_ID = "reliefweb_rss"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        out.extend(feed_to_articles(p, source_id=SOURCE_ID, fetched_at=fetched_at, gaz=ctx.gazetteer if ctx else None))
    return out
