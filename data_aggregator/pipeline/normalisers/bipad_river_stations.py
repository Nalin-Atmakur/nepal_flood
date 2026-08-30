"""
normalisers/bipad_river_stations.py — BIPAD `/api/v1/river-stations/` (live DHM mirror) → gauges.
docs/pull_external_data/05-sources.md §bipad_river_stations.

The puller follows `next` (the `count` field is a bogus int64-max) and envelopes the pages.
Every station becomes a gauges row keyed (station_id='bipad-<id>', observed_at=waterLevelOn);
`alive` = observed within GAUGE_ALIVE_HOURS of fetch. Corridor stations (matched on `title`,
because BIPAD ids differ from DHM ids) additionally get a figure 'water_level_m' scoped
place:<id> so the ledger can name the nearest gauge and its liveness.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from lib import config
from lib.text import match_key, to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "bipad_river_stations"
PUBLISHER = "DHM via BIPAD"
_CORRIDOR = {match_key(t, skeleton=False): (pid, label) for t, pid, label in config.CORRIDOR_GAUGES}


def corridor_match(title: str) -> tuple[str, str] | None:
    return _CORRIDOR.get(match_key(title, skeleton=False))


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    stations: list[dict[str, Any]] = []
    for p in parts(raw):
        doc = p.json()
        if p.ok and isinstance(doc, dict):
            stations.extend(s for s in (doc.get("results") or []) if isinstance(s, dict))
        elif not p.ok:
            out.notes.append(f"{p.url}: {p.error or p.status}")
    alive_after = fetched_at - timedelta(hours=config.GAUGE_ALIVE_HOURS)
    seen: set[str] = set()
    alive_n = dead_n = 0
    for s in stations:
        sid = f"bipad-{s.get('id')}"
        if sid in seen:
            continue
        seen.add(sid)
        observed = parse_dt(s.get("waterLevelOn"), default_tz=config.KTM)
        if observed is None:
            continue
        point = s.get("point") or {}
        coords = point.get("coordinates") if isinstance(point, dict) else None
        lon, lat = (coords[0], coords[1]) if isinstance(coords, list) and len(coords) >= 2 else (None, None)
        alive = observed >= alive_after
        title = str(s.get("title") or "").strip()
        out.gauge(station_id=sid, station_name=title, river=s.get("basin"), lat=lat, lon=lon,
                  level=to_number(s.get("waterLevel")), warning=to_number(s.get("warningLevel")),
                  danger=to_number(s.get("dangerLevel")), observed_at=observed, fetched_at=fetched_at, alive=alive)
        cm = corridor_match(title)
        if cm:
            pid, label = cm
            alive_n += alive
            dead_n += (not alive)
            lvl = to_number(s.get("waterLevel"))
            if lvl is not None:
                out.figure(publisher=PUBLISHER, metric="water_level_m", value=lvl, scope=f"place:{pid}", as_of=observed,
                           url="https://bipadportal.gov.np/", source_id=SOURCE_ID, fetched_at=fetched_at,
                           note=f"{label} · {title} · {'alive' if alive else 'dead'} · status={s.get('status')}")
    if stations:
        out.figure(publisher=PUBLISHER, metric="gauges_alive_corridor", value=alive_n, as_of=fetched_at,
                   source_id=SOURCE_ID, fetched_at=fetched_at, note=f"{dead_n} dead", url="https://bipadportal.gov.np/")
    return out
