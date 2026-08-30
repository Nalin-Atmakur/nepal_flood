"""
normalisers/dor_rimes_bridges.py — DoR bridge inventory (RIMES `getAllBridges`, 2,135 road bridges) → corridor
inventory counts. docs/pull_external_data/05c-sources-wave3.md §dor_rimes_bridges.
A static national list {bridge_id_code, bridge_name, road_name, district_name, river, chainage_in_km, length_in_m,
latitude, longitude}. We keep the bridges inside the corridor bbox (Gyirong border → Devghat) and count them per
nearest gazetteer place (≤ 8 km) as `road_bridges_inventory`, plus the national corridor total, so a claim such
as "40 bridges destroyed" can be set against how many road bridges the corridor has. Bridge names are
infrastructure, not people, and go into the note.
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any

from lib.text import to_number

from . import Context, NormalisedRows, parts
from ._geo import in_bbox, nearest_place

SOURCE_ID = "dor_rimes_bridges"
PUBLISHER = "DoR (RIMES bridge inventory)"
SRC_URL = "https://navigate-dor-api.rimes.int/Bridge_api/getAllBridges"
CORRIDOR_BBOX = (84.35, 27.55, 85.75, 28.45)   # min_lon, min_lat, max_lon, max_lat
CORRIDOR_RIVERS = ("trishuli", "trisuli", "bhote", "narayani", "langtang", "tadi", "phalankhu", "phalakhu", "mailung")


def corridor_bridges(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out = []
    for b in rows:
        lat, lon = to_number(b.get("latitude")), to_number(b.get("longitude"))
        river = str(b.get("river") or "").lower()
        if in_bbox(lat, lon, CORRIDOR_BBOX) and (any(k in river for k in CORRIDOR_RIVERS) or str(b.get("district_name")) in ("Rasuwa", "Nuwakot")):
            out.append({**b, "_lat": lat, "_lon": lon})
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, list):
        out.notes.append(f"dor_rimes: {p.error or p.status}")
        return out
    rows = [b for b in doc if isinstance(b, dict)]
    corr = corridor_bridges(rows)
    gaz = ctx.gazetteer if ctx is not None else None
    per_place: Counter[str] = Counter()
    names: dict[str, list[str]] = {}
    unresolved = 0
    for b in corr:
        hit = nearest_place(gaz, b["_lat"], b["_lon"], max_km=8.0)
        if hit is None:
            unresolved += 1
            continue
        per_place[hit[0]] += 1
        names.setdefault(hit[0], []).append(str(b.get("bridge_name") or b.get("bridge_id_code") or "").strip())
    kw = dict(publisher=PUBLISHER, as_of=fetched_at, url=SRC_URL, source_id=SOURCE_ID, fetched_at=fetched_at)
    for pid, n in sorted(per_place.items()):
        out.figure(metric="road_bridges_inventory", value=n, scope=f"place:{pid}",
                   note="DoR road bridges within 8 km: " + ", ".join(sorted(set(names[pid]))[:6]), **kw)
    out.figure(metric="road_bridges_inventory", value=len(corr), scope="national",
               note=f"road bridges in the corridor bbox on corridor rivers · {unresolved} not near a gazetteer place · {len(rows)} nationally", **kw)
    return out
