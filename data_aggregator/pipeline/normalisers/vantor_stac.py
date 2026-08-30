"""
normalisers/vantor_stac.py — Vantor (Maxar) open-data STAC collection for the event → scene counts.
docs/pull_external_data/05c-sources-wave3.md §vantor_stac.
The collection lists `item` links (≈13 VHR scenes, pre and post event). Up to ITEM_MAX items are sub-fetched for
their `datetime`, `vehicle_name` and gsd. Figures for publisher 'Vantor Open Data': `imagery_scenes_total`,
`imagery_scenes_post_event` (datetime ≥ odp:event_date); as_of = newest ingestion/acquisition; the note names
the latest post-event scene. No articles: the /sources page shows freshness from figures, and "Latest"
headlines stay for news.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._common import parse_dt
from ._stac import fetch_json, item_datetime, links

SOURCE_ID = "vantor_stac"
PUBLISHER = "Vantor Open Data"
ITEM_MAX = 24


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"vantor: {p.error or p.status}")
        return out
    base = p.url or str(source.get("url") or "")
    event = parse_dt(doc.get("odp:event_date"))
    hrefs = links(doc, "item", base)
    post, newest, latest_note = 0, None, None
    fetched = 0
    for href in hrefs[:ITEM_MAX]:
        it = fetch_json(ctx, href)
        if not it:
            continue
        fetched += 1
        dt = item_datetime(it)
        pr = it.get("properties") or {}
        if dt and (event is None or dt >= event):
            post += 1
            if newest is None or dt > newest:
                newest = dt
                latest_note = f"latest post-event scene {dt:%Y-%m-%d %H:%M}Z · {pr.get('vehicle_name') or pr.get('platform') or ''} · {pr.get('pan_gsd') or pr.get('gsd') or ''} m"
    kw = dict(publisher=PUBLISHER, as_of=newest or fetched_at, url="https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json",
              source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(metric="imagery_scenes_total", value=len(hrefs), note=f"{fetched} items read · {doc.get('license') or ''}".strip(" ·"), **kw)
    if fetched:
        out.figure(metric="imagery_scenes_post_event", value=post, note=latest_note, **kw)
    return out
