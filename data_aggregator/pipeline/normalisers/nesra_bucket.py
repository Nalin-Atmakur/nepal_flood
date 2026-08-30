"""
normalisers/nesra_bucket.py — NESRA FloodWatch public GCS bucket (gs://npl-flood-front) → figures 'NESRA FloodWatch'.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §nesra_bucket.
  summary.json               reach_km · floodway_km2 · normal_river_km2 · buildings_floodway · buildings_osm_confirmed ·
                             major_road_flooded_km · pasang_lhamu_flooded_km · bridges_intersecting · channel_*_km ·
                             recall_heldout_pct   (national, as_of = imagery_date 00:00 UTC)
  bridges_to_inspect.geojson bridge_to_inspect per line, value 1, scope place:<id>|bridge:<bridge_id> — <id> resolved from
                             the bridge name via the gazetteer (rejected when the named place is > 10 km away), else the
                             nearest gazetteer place within 3 km of the bridge midpoint, else unresolved:<slug(name) | bridge_<id>>;
                             bridges_to_inspect count per place:<id> and national
  buildings_in_extent.geojson buildings_in_extent + buildings_<confirmed_status> counts (national)
"""
from __future__ import annotations

import math
from collections import Counter
from datetime import datetime, timezone
from typing import Any

from lib.text import slugify

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "nesra_bucket"
PUBLISHER = "NESRA FloodWatch"
BUCKET = "https://storage.googleapis.com/npl-flood-front/"
SUMMARY_METRICS = ("reach_km", "floodway_km2", "normal_river_km2", "buildings_floodway", "buildings_footprint_ha",
                   "buildings_osm_confirmed", "major_road_flooded_km", "pasang_lhamu_flooded_km", "bridges_intersecting",
                   "channel_measured_km", "channel_interpolated_km", "channel_no_evidence_km", "recall_heldout_pct")
NAME_MAX_KM = 10.0
NEAREST_MAX_KM = 3.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi, dl = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(a))


def nearest_place(gaz: Any, lat: float | None, lon: float | None, max_km: float = NEAREST_MAX_KM) -> tuple[str, float] | None:
    """(place_id, km) of the closest gazetteer place with coordinates, or None beyond max_km."""
    if gaz is None or lat is None or lon is None:
        return None
    best: tuple[str, float] | None = None
    for p in gaz.all():
        if p.lat is None or p.lon is None:
            continue
        d = haversine_km(lat, lon, p.lat, p.lon)
        if best is None or d < best[1]:
            best = (p.id, d)
    return best if best and best[1] <= max_km else None


def midpoint(geom: dict[str, Any] | None) -> tuple[float | None, float | None]:
    coords = (geom or {}).get("coordinates")
    if not isinstance(coords, list) or not coords:
        return None, None
    if isinstance(coords[0], (int, float)):
        return coords[1], coords[0]
    flat = coords
    while flat and isinstance(flat[0], list) and flat[0] and isinstance(flat[0][0], list):
        flat = flat[0]
    pts = [c for c in flat if isinstance(c, list) and len(c) >= 2]
    if not pts:
        return None, None
    return sum(c[1] for c in pts) / len(pts), sum(c[0] for c in pts) / len(pts)


def resolve_bridge(name: str, lat: float | None, lon: float | None, ctx: Context | None) -> tuple[str | None, str]:
    """→ (place_id | None, note fragment)."""
    gaz = ctx.gazetteer if ctx else None
    if name and gaz is not None:
        pid = gaz.resolve(name)
        if pid:
            p = gaz.get(pid)
            if p and p.lat is not None and lat is not None:
                d = haversine_km(lat, lon, p.lat, p.lon)
                if d <= NAME_MAX_KM:
                    return pid, f"by name · {d:.1f} km from {p.name_en}"
            else:
                return pid, "by name"
    near = nearest_place(gaz, lat, lon)
    if near:
        p = gaz.get(near[0])
        return near[0], f"nearest {p.name_en if p else near[0]} · {near[1]:.1f} km"
    return None, "unresolved"


def _summary(doc: dict[str, Any], url: str, fetched_at: datetime, out: NormalisedRows) -> None:
    as_of = parse_dt(doc.get("imagery_date")) or fetched_at
    note = f"imagery {doc.get('imagery_date')} · event {doc.get('event_date')} · v{doc.get('version')}"
    for m in SUMMARY_METRICS:
        v = doc.get(m)
        if isinstance(v, (int, float)):
            out.figure(publisher=PUBLISHER, metric=m, value=v, as_of=as_of, url=url, note=note, source_id=SOURCE_ID,
                       fetched_at=fetched_at)


def _bridges(doc: dict[str, Any], url: str, as_of: datetime, fetched_at: datetime, ctx: Context | None, out: NormalisedRows) -> None:
    n = 0
    per_place: Counter[str] = Counter()
    for f in doc.get("features") or []:
        pr = f.get("properties") or {}
        name = str(pr.get("name") or "").strip()
        bid = pr.get("bridge_id")
        lat, lon = midpoint(f.get("geometry"))
        pid, how = resolve_bridge(name, lat, lon, ctx)
        place_scope = f"place:{pid}" if pid else f"place:unresolved:{slugify(name) if name else f'bridge_{bid}'}"
        if name:
            out.hint(name, pid, 1, kind="bridge")
        # scope place:<id>|bridge:<bridge_id> — several bridges share a place, and figures are unique on
        # (publisher, metric, scope, as_of, value); the ledger reads the place id before the '|'
        out.figure(publisher=PUBLISHER, metric="bridge_to_inspect", value=1, scope=f"{place_scope}|bridge:{bid}", as_of=as_of, url=url,
                   note=f"{name or f'unnamed bridge #{bid}'} · {pr.get('class') or ''} · {pr.get('note') or ''} · {how}".strip(" ·"),
                   source_id=SOURCE_ID, fetched_at=fetched_at)
        per_place[place_scope] += 1
        n += 1
    for place_scope, cnt in per_place.items():
        out.figure(publisher=PUBLISHER, metric="bridges_to_inspect", value=cnt, scope=place_scope, as_of=as_of, url=url,
                   source_id=SOURCE_ID, fetched_at=fetched_at, note="bridge lines intersecting the flood path here")
    out.figure(publisher=PUBLISHER, metric="bridges_to_inspect", value=n, as_of=as_of, url=url, source_id=SOURCE_ID,
               fetched_at=fetched_at, note="bridge lines intersecting the flood path")


def _buildings(doc: dict[str, Any], url: str, as_of: datetime, fetched_at: datetime, out: NormalisedRows) -> None:
    feats = doc.get("features") or []
    status: Counter[str] = Counter()
    for f in feats:
        pr = f.get("properties") or {}
        status[slugify(str(pr.get("confirmed_status") or "unconfirmed"))] += 1
    out.figure(publisher=PUBLISHER, metric="buildings_in_extent", value=len(feats), as_of=as_of, url=url,
               source_id=SOURCE_ID, fetched_at=fetched_at, note="building polygons inside the NESRA floodway")
    for s, n in status.items():
        out.figure(publisher=PUBLISHER, metric=f"buildings_{s}", value=n, as_of=as_of, url=url, source_id=SOURCE_ID,
                   fetched_at=fetched_at, note=f"confirmed_status={s}")


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    imagery_as_of: datetime | None = None
    ps = parts(raw)
    for p in ps:                                   # summary first: it carries the imagery date the other layers inherit
        doc = p.json()
        if p.ok and isinstance(doc, dict) and "reach_km" in doc:
            _summary(doc, p.url or BUCKET + "summary.json", fetched_at, out)
            imagery_as_of = parse_dt(doc.get("imagery_date"))
    for p in ps:
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        if "reach_km" in doc:
            continue
        as_of = imagery_as_of or parse_dt(p.last_modified) or fetched_at
        feats = doc.get("features") or []
        kinds = {str((f.get("properties") or {}).get("kind")) for f in feats[:5]}
        if "bridge" in kinds or "bridges_to_inspect" in (p.url or ""):
            _bridges(doc, p.url or BUCKET + "bridges_to_inspect.geojson", as_of, fetched_at, ctx, out)
        elif feats and "confirmed_status" in (feats[0].get("properties") or {}) or "buildings_in_extent" in (p.url or ""):
            _buildings(doc, p.url or BUCKET + "buildings_in_extent.geojson", as_of, fetched_at, out)
        else:
            out.notes.append(f"{p.url}: unrecognised layer ({len(feats)} features)")
    return out
