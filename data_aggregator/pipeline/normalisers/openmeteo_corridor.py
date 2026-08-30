"""
normalisers/openmeteo_corridor.py — Open-Meteo hourly precip/low cloud → figures + flying windows.
docs/pull_external_data/05-sources.md §openmeteo_corridor.

The puller fetches one URL per site in config.OPENMETEO_SITES (Dhunche, Langtang village).
  precip_mm / low_cloud_pct     scope place:<site>, as_of = each hour (UTC), next 72 h
  flying_window_quality         scope place:<site>, one per day, value 1 (good) / 0 (poor),
                                as_of = 06:00 NPT that day; good = mean low cloud ≤ 40 % and
                                total precip ≤ 3 mm over 06–11 NPT
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from lib import config

from . import Context, NormalisedRows, parts

SOURCE_ID = "openmeteo_corridor"
PUBLISHER = "Open-Meteo (ECMWF)"


def site_for(url: str, doc: dict[str, Any]) -> str:
    m = re.search(r"latitude=([\d.]+)&longitude=([\d.]+)", url or "")
    lat, lon = (float(m.group(1)), float(m.group(2))) if m else (doc.get("latitude"), doc.get("longitude"))
    best, best_d = "dhunche", 1e9
    for sid, (slat, slon) in config.OPENMETEO_SITES.items():
        if lat is None or lon is None:
            break
        d = (lat - slat) ** 2 + (lon - slon) ** 2
        if d < best_d:
            best, best_d = sid, d
    return best


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    horizon = fetched_at + timedelta(hours=config.OPENMETEO_HOURS)
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict) or "hourly" not in doc:
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        site = site_for(p.url, doc)
        off = int(doc.get("utc_offset_seconds") or 0)
        tz = timezone(timedelta(seconds=off))
        hourly = doc["hourly"]
        times = hourly.get("time") or []
        precip = hourly.get("precipitation") or []
        cloud = hourly.get("cloud_cover_low") or []
        by_day: dict[str, list[tuple[int, float | None, float | None]]] = {}
        url = f"https://open-meteo.com/en/docs#latitude={config.OPENMETEO_SITES[site][0]}&longitude={config.OPENMETEO_SITES[site][1]}"
        for i, t in enumerate(times):
            try:
                local = datetime.fromisoformat(t).replace(tzinfo=tz)
            except ValueError:
                continue
            at = local.astimezone(timezone.utc)
            if at < fetched_at - timedelta(hours=1) or at > horizon:
                continue
            pr = precip[i] if i < len(precip) else None
            cl = cloud[i] if i < len(cloud) else None
            if isinstance(pr, (int, float)):
                out.figure(publisher=PUBLISHER, metric="precip_mm", value=pr, scope=f"place:{site}", as_of=at, url=url,
                           source_id=SOURCE_ID, fetched_at=fetched_at)
            if isinstance(cl, (int, float)):
                out.figure(publisher=PUBLISHER, metric="low_cloud_pct", value=cl, scope=f"place:{site}", as_of=at, url=url,
                           source_id=SOURCE_ID, fetched_at=fetched_at)
            by_day.setdefault(local.strftime("%Y-%m-%d"), []).append((local.hour, pr if isinstance(pr, (int, float)) else None,
                                                                       cl if isinstance(cl, (int, float)) else None))
        h0, h1 = config.FLYING_WINDOW_HOURS_LOCAL
        for day, rows in sorted(by_day.items()):
            win = [r for r in rows if h0 <= r[0] < h1]
            if len(win) < (h1 - h0) - 1:
                continue
            clouds = [c for _, _, c in win if c is not None]
            rains = [r for _, r, _ in win if r is not None]
            mean_cloud = sum(clouds) / len(clouds) if clouds else 100.0
            total_rain = sum(rains)
            good = mean_cloud <= config.FLYING_GOOD_MAX_LOW_CLOUD_PCT and total_rain <= config.FLYING_GOOD_MAX_PRECIP_MM
            as_of = datetime.fromisoformat(f"{day}T{h0:02d}:00").replace(tzinfo=tz).astimezone(timezone.utc)
            out.figure(publisher=PUBLISHER, metric="flying_window_quality", value=1 if good else 0, scope=f"place:{site}",
                       as_of=as_of, url=url, source_id=SOURCE_ID, fetched_at=fetched_at,
                       note=f"{'good' if good else 'poor'} · {h0:02d}–{h1:02d} NPT · low cloud {mean_cloud:.0f}% · rain {total_rain:.1f} mm")
    return out
