"""
normalisers/oam_bbox.py — OpenAerialMap /meta over the corridor bbox → 'dataset availability' articles, publisher OpenAerialMap.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §oam_bbox.
results[{_id, uuid (the image URL), title, provider, platform, gsd, acquisition_start, uploaded_at, contact, user, …}].
One article per upload since the event: url = the image URL, title, published_at = uploaded_at, body = provider · platform ·
GSD · acquisition date · bbox note. `contact` and `user` (a person's name and e-mail) are never read.
Figures: uploads_since_event, post_event_uav_uploads (the "first post-event drone orthomosaic" watch).
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from lib import config
from lib.text import nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "oam_bbox"
PUBLISHER = "OpenAerialMap"
META_URL = "https://api.openaerialmap.org/meta/"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict) or not isinstance(doc.get("results"), list):
        out.notes.append(f"oam: {p.error or p.status}")
        return out
    n = uav_post = 0
    for r in doc["results"]:
        uploaded = parse_dt(r.get("uploaded_at"))
        title = nfc(r.get("title") or "").strip()
        url = (r.get("uuid") or "").strip() or (META_URL + str(r.get("_id") or ""))
        if uploaded is None or uploaded < config.EVENT_START_UTC or not title or not url.startswith("http"):
            continue
        acq = parse_dt(r.get("acquisition_start"))
        platform = str(r.get("platform") or "").lower()
        gsd = r.get("gsd")
        body = (f"{r.get('provider') or 'unknown provider'} · {platform or 'unknown platform'}"
                + (f" · GSD {float(gsd):.2f} m" if isinstance(gsd, (int, float)) else "")
                + (f" · acquired {acq.strftime('%d %b %Y')}" if acq else "")
                + f" · uploaded {uploaded.strftime('%d %b %H:%M UTC')} · OpenAerialMap, Trishuli / Bhote Koshi corridor bbox (Rasuwa–Chitwan)")
        out.article(url=url, title=title[:500], publisher=PUBLISHER, lang="en", published_at=uploaded, body=body[:2000],
                    source_id=SOURCE_ID, fetched_at=fetched_at)
        n += 1
        if platform in ("uav", "drone") and acq and acq >= config.EVENT_START_UTC:
            uav_post += 1
    out.figure(publisher=PUBLISHER, metric="uploads_since_event", value=n, as_of=fetched_at, url=p.url or None,
               note="bbox 84.3,27.5,85.9,28.6", source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(publisher=PUBLISHER, metric="post_event_uav_uploads", value=uav_post, as_of=fetched_at, url=p.url or None,
               note="drone orthomosaics acquired on/after 26 Aug", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
