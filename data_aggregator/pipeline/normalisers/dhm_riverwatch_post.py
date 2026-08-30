"""
normalisers/dhm_riverwatch_post.py — DHM `POST /site/riverWatchTableViewData` (no body) → gauges + figures 'DHM'.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §dhm_riverwatch_post.
Shape: {status, data[{id, name, basin, district, stationIndex, waterLevel: {datetime, value} | " ", warning_level,
danger_level, steady, status, maxvalue, minvalue}]} — 332 stations, no coordinates. Stations without a `waterLevel.datetime`
(the dead corridor gauges among them) are counted but produce no gauges row (observed_at is the primary key).
  gauges   station_id 'dhm:<id>' (the DHM id, not the BIPAD id), station_name, river = basin, level/warning/danger,
           observed_at = waterLevel.datetime (UTC), alive = observed within GAUGE_ALIVE_HOURS
  figures  water_level_m scope place:<corridor id> (same title match as bipad_river_stations), gauges_alive_corridor,
           stations_reporting, stations_silent
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from lib import config
from lib.text import to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt
from .bipad_river_stations import corridor_match

SOURCE_ID = "dhm_riverwatch_post"
PUBLISHER = "DHM"
URL = "https://dhm.gov.np/hydrology/river-watch"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict) or not isinstance(doc.get("data"), list):
        out.notes.append(f"dhm riverwatch: {p.error or p.status}")
        return out
    alive_after = fetched_at - timedelta(hours=config.GAUGE_ALIVE_HOURS)
    seen: set[str] = set()
    reporting = silent = alive_n = dead_n = 0
    for s in doc["data"]:
        if not isinstance(s, dict) or s.get("id") is None:
            continue
        sid = f"dhm:{s['id']}"
        if sid in seen:
            continue
        seen.add(sid)
        title = str(s.get("name") or "").strip()
        wl = s.get("waterLevel")
        observed = parse_dt(wl.get("datetime")) if isinstance(wl, dict) else None
        cm = corridor_match(title)
        if observed is None:
            silent += 1
            if cm:
                dead_n += 1
            continue
        reporting += 1
        alive = observed >= alive_after
        level = to_number(str(wl.get("value"))) if isinstance(wl, dict) else None
        out.gauge(station_id=sid, station_name=title, river=(s.get("basin") or None), lat=None, lon=None, level=level,
                  warning=to_number(s.get("warning_level")), danger=to_number(s.get("danger_level")), observed_at=observed,
                  fetched_at=fetched_at, alive=alive)
        if cm:
            pid, label = cm
            alive_n += alive
            dead_n += (not alive)
            if level is not None:
                out.figure(publisher=PUBLISHER, metric="water_level_m", value=level, scope=f"place:{pid}", as_of=observed, url=URL,
                           source_id=SOURCE_ID, fetched_at=fetched_at,
                           note=f"{label} · {title} · {'alive' if alive else 'dead'} · status={s.get('status')} · {s.get('steady')}")
    out.figure(publisher=PUBLISHER, metric="gauges_alive_corridor", value=alive_n, as_of=fetched_at, url=URL, source_id=SOURCE_ID,
               fetched_at=fetched_at, note=f"{dead_n} dead or silent")
    out.figure(publisher=PUBLISHER, metric="stations_reporting", value=reporting, as_of=fetched_at, url=URL, source_id=SOURCE_ID,
               fetched_at=fetched_at, note=f"{silent} stations without a reading")
    return out
