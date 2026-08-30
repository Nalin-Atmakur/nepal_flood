"""
normalisers/usgs_fdsn.py — USGS FDSN event query (GeoJSON) → figures 'USGS' metric seismic_event.
docs/pull_external_data/05-sources.md §usgs_fdsn.
value = magnitude · as_of = origin time · note = "<id> · <type> · depth <z> km · <place>".
A new event near the collapse site is the earliest machine-readable sign of a new mass movement.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from . import Context, NormalisedRows, parts

SOURCE_ID = "usgs_fdsn"
PUBLISHER = "USGS"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"usgs: {p.error or p.status}")
        return out
    feats = doc.get("features") or []
    for f in feats:
        props = f.get("properties") or {}
        geom = (f.get("geometry") or {}).get("coordinates") or []
        mag = props.get("mag")
        t = props.get("time")
        if not isinstance(mag, (int, float)) or not isinstance(t, (int, float)):
            continue
        at = datetime.fromtimestamp(t / 1000.0, tz=timezone.utc)
        depth = geom[2] if len(geom) > 2 else None
        note = f"{f.get('id')} · {props.get('type')} · depth {depth} km · {props.get('place')} · {props.get('magType')}"
        out.figure(publisher=PUBLISHER, metric="seismic_event", value=mag, as_of=at, url=props.get("url"), note=note,
                   source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(publisher=PUBLISHER, metric="seismic_events_since_25aug", value=len(feats), as_of=fetched_at,
               url=(doc.get("metadata") or {}).get("url"), source_id=SOURCE_ID, fetched_at=fetched_at,
               note="M≥2.5 within 100 km of 28.3N 85.5E")
    return out
