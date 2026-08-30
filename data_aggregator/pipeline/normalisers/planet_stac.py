"""
normalisers/planet_stac.py — Planet crisis-response STAC catalog on source.coop → scene counts.
docs/pull_external_data/05c-sources-wave3.md §planet_stac.
catalog.json → child catalogs `pre-event/`, `post-event/` → child collections (one per platform × date) →
`item` links. Sub-fetches are bounded (NODE_MAX). Figures for publisher 'Planet': `imagery_scenes_total`,
`imagery_scenes_post_event`, `imagery_collections`; as_of = newest temporal extent end among post-event
collections; the note lists the post-event collection ids.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._common import parse_dt
from ._stac import fetch_json, links

SOURCE_ID = "planet_stac"
PUBLISHER = "Planet"
NODE_MAX = 16


def _extent_end(coll: dict[str, Any]) -> datetime | None:
    try:
        iv = coll["extent"]["temporal"]["interval"][0]
        return parse_dt(iv[1]) or parse_dt(iv[0])
    except (KeyError, IndexError, TypeError):
        return None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"planet: {p.error or p.status}")
        return out
    base = p.url or str(source.get("url") or "")
    total = post = ncoll = 0
    newest: datetime | None = None
    post_ids: list[str] = []
    budget = NODE_MAX
    for child in links(doc, "child", base):
        if budget <= 0:
            break
        cat = fetch_json(ctx, child)
        budget -= 1
        if not cat:
            continue
        is_post = "post" in str(cat.get("id") or child).lower()
        for coll_href in links(cat, "child", child):
            if budget <= 0:
                break
            coll = fetch_json(ctx, coll_href)
            budget -= 1
            if not coll:
                continue
            ncoll += 1
            n = len(links(coll, "item", coll_href))
            total += n
            if is_post:
                post += n
                post_ids.append(f"{coll.get('id')} ({n})")
                end = _extent_end(coll)
                if end and (newest is None or end > newest):
                    newest = end
    kw = dict(publisher=PUBLISHER, as_of=newest or fetched_at, url="https://source.coop/planet/disasterdata", source_id=SOURCE_ID, fetched_at=fetched_at)
    if ncoll == 0:
        out.notes.append("planet: no collections reachable")
        return out
    out.figure(metric="imagery_collections", value=ncoll, note=str(doc.get("license") or "CC-BY-NC-4.0"), **kw)
    out.figure(metric="imagery_scenes_total", value=total, **kw)
    out.figure(metric="imagery_scenes_post_event", value=post, note=", ".join(post_ids) or None, **kw)
    return out
