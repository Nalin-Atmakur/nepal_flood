"""
normalisers/geofon_fdsn.py — GFZ GEOFON FDSN event query (format=text) → figures 'GFZ GEOFON' metric seismic_event.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §geofon_fdsn.
Pipe-delimited: #EventID|Time|Latitude|Longitude|Depth/km|Author|Catalog|Contributor|ContributorID|MagType|Magnitude|MagAuthor|EventLocationName|EventType
value = magnitude · as_of = origin time · note = "<id> · <type> · depth <z> km · <place> · <MagType>" · url = event page.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from lib.text import to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "geofon_fdsn"
PUBLISHER = "GFZ GEOFON"
EVENT_URL = "https://geofon.gfz.de/eqinfo/event.php?id={id}"


def parse_text(body: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    header: list[str] | None = None
    for line in body.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("#"):
            header = [h.strip().lstrip("#").strip() for h in line.split("|")]
            continue
        cells = [c.strip() for c in line.split("|")]
        if header and len(cells) >= 11:
            rows.append(dict(zip(header, cells)))
    return rows


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"geofon: {p.error or p.status}")
        return out
    events = parse_text(p.body)
    for ev in events:
        mag = to_number(ev.get("Magnitude"))
        at = parse_dt(ev.get("Time"))
        eid = ev.get("EventID") or ""
        if mag is None or at is None or not eid:
            continue
        note = f"{eid} · {ev.get('EventType') or 'unknown'} · depth {ev.get('Depth/km')} km · {ev.get('EventLocationName')} · {ev.get('MagType')}"
        out.figure(publisher=PUBLISHER, metric="seismic_event", value=mag, as_of=at, url=EVENT_URL.format(id=eid), note=note,
                   source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(publisher=PUBLISHER, metric="seismic_events_since_25aug", value=len(events), as_of=fetched_at, url=p.url or None,
               note="M≥3 within 1° of 28.3N 85.5E", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
