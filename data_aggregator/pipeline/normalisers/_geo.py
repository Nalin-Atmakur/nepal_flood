"""
normalisers/_geo.py — small geo helpers shared by the wave-3 normalisers (help requests, bridge inventories):
haversine distance, geometry centroid, nearest gazetteer place. Helper module (leading underscore): not a source.
docs/pull_external_data/05c-sources-wave3.md §shared helpers.
"""
from __future__ import annotations

import math
from typing import Any, Iterable

EARTH_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_KM * math.asin(math.sqrt(a))


def _coords(obj: Any, out: list[tuple[float, float]]) -> None:
    if isinstance(obj, (list, tuple)):
        if len(obj) >= 2 and all(isinstance(v, (int, float)) for v in obj[:2]):
            out.append((float(obj[1]), float(obj[0])))   # GeoJSON is [lon, lat]
        else:
            for o in obj:
                _coords(o, out)


def centroid(geometry: dict[str, Any] | None) -> tuple[float, float] | None:
    """(lat, lon) mean of every vertex of a GeoJSON geometry; None when there are no coordinates."""
    if not isinstance(geometry, dict):
        return None
    pts: list[tuple[float, float]] = []
    _coords(geometry.get("coordinates"), pts)
    if not pts:
        return None
    return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)


def nearest_place(gaz: Any, lat: float | None, lon: float | None, *, max_km: float = 8.0,
                  exclude_kinds: Iterable[str] = ("district",), exclude_ids: Iterable[str] = ()) -> tuple[str, float] | None:
    """(place_id, km) of the closest gazetteer place within max_km, skipping districts and excluded ids."""
    if gaz is None or lat is None or lon is None:
        return None
    ex_kinds, ex_ids = set(exclude_kinds), set(exclude_ids)
    best: tuple[str, float] | None = None
    for pl in gaz.all():
        if pl.lat is None or pl.lon is None or pl.kind in ex_kinds or pl.id in ex_ids:
            continue
        d = haversine_km(lat, lon, pl.lat, pl.lon)
        if d <= max_km and (best is None or d < best[1]):
            best = (pl.id, d)
    return best


def in_bbox(lat: float | None, lon: float | None, bbox: tuple[float, float, float, float]) -> bool:
    """bbox = (min_lon, min_lat, max_lon, max_lat)."""
    if lat is None or lon is None:
        return False
    return bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]
