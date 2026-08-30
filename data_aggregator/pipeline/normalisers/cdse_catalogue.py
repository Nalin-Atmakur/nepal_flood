"""
normalisers/cdse_catalogue.py — Copernicus Data Space OData search (Sentinel-2 over the corridor since the
event) → product counts. docs/pull_external_data/05c-sources-wave3.md §cdse_catalogue.
`{"value": [{Id, Name "S2C_MSIL2A_20260829T044701_…", ContentDate{Start,End}, Online, PublicationDate, …}]}`.
Figures for publisher 'Copernicus Data Space': `s2_products_since_event`, `s2_acquisition_dates` (distinct
days), as_of = latest ContentDate.Start; note = latest product name and the distinct dates.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "cdse_catalogue"
PUBLISHER = "Copernicus Data Space"
BROWSER = "https://browser.dataspace.copernicus.eu/"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"cdse: {p.error or p.status}")
        return out
    prods = [v for v in (doc.get("value") or []) if isinstance(v, dict)]
    dated: list[tuple[datetime, str]] = []
    for v in prods:
        cd = v.get("ContentDate") or {}
        dt = parse_dt(cd.get("Start")) if isinstance(cd, dict) else None
        if dt:
            dated.append((dt, str(v.get("Name") or "")))
    dated.sort()
    days = sorted({dt.date().isoformat() for dt, _ in dated})
    latest = dated[-1] if dated else None
    kw = dict(publisher=PUBLISHER, as_of=latest[0] if latest else fetched_at, url=BROWSER, source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(metric="s2_products_since_event", value=len(prods), note=(f"latest {latest[1][:32]} · online {sum(1 for v in prods if v.get('Online'))}" if latest else None), **kw)
    if days:
        out.figure(metric="s2_acquisition_dates", value=len(days), note=", ".join(days), **kw)
    return out
