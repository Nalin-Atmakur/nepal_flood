"""
normalisers/bipad_river_series.py — BIPAD `/api/v1/river/?station=<id>&…` 10-minute hydrograph → gauges.
docs/pull_external_data/05c-sources-wave3.md §bipad_river_series.

One URL per corridor station (sources.yaml lists the 11 BIPAD station ids that match config.CORRIDOR_GAUGES),
`ordering=-water_level_on&limit=60` → the newest ~10 hours of readings each. Rows share the key space of
bipad_river_stations (`station_id = bipad-<station>`, `observed_at = waterLevelOn`), so the gauges table
fills in the series behind the live snapshot without duplicates. No figures — the latest level per station
is already emitted by bipad_river_stations.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from lib import config
from lib.text import to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "bipad_river_series"
PUBLISHER = "DHM via BIPAD"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    alive_after = fetched_at - timedelta(hours=config.GAUGE_ALIVE_HOURS)
    seen: set[tuple[str, datetime]] = set()
    stations: set[str] = set()
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        for r in doc.get("results") or []:
            if not isinstance(r, dict) or r.get("station") is None:
                continue
            observed = parse_dt(r.get("waterLevelOn"), default_tz=config.KTM)
            if observed is None:
                continue
            sid = f"bipad-{r['station']}"
            if (sid, observed) in seen:
                continue
            seen.add((sid, observed))
            stations.add(sid)
            point = r.get("point") or {}
            coords = point.get("coordinates") if isinstance(point, dict) else None
            lon, lat = (coords[0], coords[1]) if isinstance(coords, list) and len(coords) >= 2 else (None, None)
            out.gauge(station_id=sid, station_name=str(r.get("title") or "").strip(), river=r.get("basin"), lat=lat, lon=lon,
                      level=to_number(r.get("waterLevel")), warning=to_number(r.get("warningLevel")),
                      danger=to_number(r.get("dangerLevel")), observed_at=observed, fetched_at=fetched_at,
                      alive=observed >= alive_after)
    if seen:
        out.notes.append(f"{len(seen)} readings for {len(stations)} corridor stations")
    return out
