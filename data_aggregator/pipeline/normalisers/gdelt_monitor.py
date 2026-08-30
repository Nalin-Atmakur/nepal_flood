"""
normalisers/gdelt_monitor.py — GDELT DOC 2.0 `artlist` (json) → articles + a volume figure.
docs/pull_external_data/05c-sources-wave3.md §gdelt_monitor.
`{"articles": [{url, url_mobile, title, seendate "YYYYMMDDThhmmssZ", socialimage, domain, language,
sourcecountry}]}`, capped at maxrecords. Slow (often 60 s+) and flaky: the puller's timeout/backoff handles that;
a failed part only costs this run. Every title passes the relevance gate; `gdelt_articles_24h` for publisher
'GDELT' records how many matched in the window (note: cap).
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from lib.text import lang_of, nfc

from . import Context, NormalisedRows, parts
from ._rss import is_relevant, publisher_for

SOURCE_ID = "gdelt_monitor"
PUBLISHER = "GDELT"
LANGS = {"english": "en", "nepali": "ne", "hindi": "hi", "chinese": "zh"}


def seendate(s: str | None) -> datetime | None:
    try:
        return datetime.strptime(str(s), "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"gdelt: {p.error or p.status}")
        return out
    gaz = ctx.gazetteer if ctx is not None else None
    arts = [a for a in (doc.get("articles") or []) if isinstance(a, dict) and a.get("url")]
    kept = 0
    seen: set[str] = set()
    for a in arts:
        url = str(a["url"]).strip()
        title = nfc(str(a.get("title") or "")).strip()
        if url in seen or not title or not is_relevant(title, None, gaz=gaz):
            continue
        seen.add(url)
        lang = LANGS.get(str(a.get("language") or "").lower()) or lang_of(title)
        out.article(url=url, title=title[:300], publisher=publisher_for(url, str(a.get("domain") or "")), lang=lang,
                    published_at=seendate(a.get("seendate")), places=gaz.resolve_ids(title) if gaz is not None else [],
                    source_id=SOURCE_ID, fetched_at=fetched_at)
        kept += 1
    out.figure(publisher=PUBLISHER, metric="gdelt_articles_24h", value=len(arts), as_of=fetched_at, url=p.url or str(source.get("url") or ""),
               note=f"{kept} relevant · capped by maxrecords", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
