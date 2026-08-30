"""
normalisers/emsr927_dashboard.py — Copernicus EMS dashboard API (public-activations?code=EMSR927) → figures 'Copernicus EMS'.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §emsr927_dashboard.
  per AOI × delivered product (scope place:<aoi resolved: Syapru Besi→syabrubesi, Timure→timure, Bidur→bidur,
  Bharatpur→bharatpur>, as_of = version.deliveryTime):
    buildings_affected / buildings_total   Σ "Built-up"
    roads_affected_km / roads_total_km     Σ "Transportation" rows in km
    bridges_affected / bridges_total       "Bridges and elevated highways"
    population_affected / population_total "Estimated population"
    flow_area_ha                           "Landslide" affected ha
    aoi_delivered                          1 when statusCode F, else 0 (as_of = deliveryTime or fetched_at) — the AOI04 watch
  national (as_of = newest delivery): identified_buildings · roads_km · population · builtup_ha · max_extent_ha
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from lib.text import slugify, to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "emsr927_dashboard"
PUBLISHER = "Copernicus EMS"
DASHBOARD = "https://mapping.emergency.copernicus.eu/activations/EMSR927/"
AOI_PLACES = {"syapru besi": "syabrubesi", "syabru besi": "syabrubesi", "timure": "timure", "bidur": "bidur", "bharatpur": "bharatpur"}
NATIONAL = {"Identified buildings [No.]": "identified_buildings", "Roads [km]": "roads_km", "Population [No.]": "population",
            "Built-up area [ha]": "builtup_ha", "max_extent": "max_extent_ha"}


def aoi_place(name: str, ctx: Context | None) -> str:
    key = (name or "").strip().lower()
    if key in AOI_PLACES:
        return AOI_PLACES[key]
    pid = ctx.resolve(name) if ctx else None
    return pid or slugify(name)


def _num(v: Any) -> float | None:
    return to_number(str(v)) if v not in (None, "NA", "") else None


def aoi_stats(stats: dict[str, Any]) -> dict[str, float]:
    got: dict[str, float] = {}

    def add(metric: str, v: float | None) -> None:
        if v is not None:
            got[metric] = got.get(metric, 0.0) + v

    for cat, rows in (stats or {}).items():
        if not isinstance(rows, dict):
            continue
        for label, cell in rows.items():
            if not isinstance(cell, dict):
                continue
            tot, aff, unit = _num(cell.get("total")), _num(cell.get("affected")), str(cell.get("unit") or "")
            if cat == "Built-up":
                add("buildings_total", tot); add("buildings_affected", aff)
            elif cat == "Transportation" and label.lower().startswith("bridge"):
                add("bridges_total", tot); add("bridges_affected", aff)
            elif cat == "Transportation" and unit == "km":
                add("roads_total_km", tot); add("roads_affected_km", aff)
            elif cat == "Estimated population":
                add("population_total", tot); add("population_affected", aff)
            elif cat == "Landslide":
                add("flow_area_ha", aff)
    return {k: round(v, 2) for k, v in got.items()}


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"emsr927: {p.error or p.status}")
        return out
    for act in doc.get("results") or []:
        code = act.get("code") or "EMSR927"
        newest: datetime | None = None
        for aoi in act.get("aois") or []:
            name = str(aoi.get("name") or "").strip()
            n = aoi.get("number")
            pid = aoi_place(name, ctx)
            out.hint(name, pid if pid in AOI_PLACES.values() else None, 1, kind="aoi")
            for prod in aoi.get("products") or []:
                ver = prod.get("version") or {}
                status = str(ver.get("statusCode") or "")
                delivered = parse_dt(ver.get("deliveryTime"))
                url = prod.get("downloadPath") or DASHBOARD
                note = f"{code} AOI{int(n):02d} {name} · {prod.get('type')} v{ver.get('number')} · status {status}"
                out.figure(publisher=PUBLISHER, metric="aoi_delivered", value=1 if status == "F" else 0, scope=f"place:{pid}",
                           as_of=delivered or fetched_at, url=url, note=note + (f" · expected {prod.get('expectedDelivery')}" if not delivered else ""),
                           source_id=SOURCE_ID, fetched_at=fetched_at)
                if not prod.get("stats") or delivered is None:
                    continue
                newest = delivered if newest is None or delivered > newest else newest
                for metric, val in aoi_stats(prod["stats"]).items():
                    out.figure(publisher=PUBLISHER, metric=metric, value=val, scope=f"place:{pid}", as_of=delivered, url=url,
                               note=note, source_id=SOURCE_ID, fetched_at=fetched_at)
        for label, metric in NATIONAL.items():
            v = _num((act.get("stats") or {}).get(label))
            if v is not None:
                out.figure(publisher=PUBLISHER, metric=metric, value=v, as_of=newest or fetched_at, url=act.get("reportLink") or DASHBOARD,
                           note=f"{code} activation totals (delivered AOIs only)", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
