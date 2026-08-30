"""
normalisers/microsoft_unosat_extent.py — UNOSAT impacted-area polygon (Microsoft AI for Good mirror) → one figure.
docs/pull_external_data/05c-sources-wave3.md §microsoft_unosat_extent.
`unosat_damage_area.geojson` = one FeatureCollection with `Shape_Area` in m² per feature and a bbox. We emit
`flood_extent_km2` (sum of Shape_Area / 1e6) for publisher 'UNOSAT (via Microsoft AI for Good)'. The file
carries no acquisition date, so as_of is the fetch time and the note names the bbox.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts

SOURCE_ID = "microsoft_unosat_extent"
PUBLISHER = "UNOSAT (via Microsoft AI for Good)"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"unosat: {p.error or p.status}")
        return out
    feats = [f for f in (doc.get("features") or []) if isinstance(f, dict)]
    area_m2 = sum(float((f.get("properties") or {}).get("Shape_Area") or 0) for f in feats)
    if area_m2 <= 0:
        out.notes.append("unosat: no Shape_Area in features")
        return out
    bbox = doc.get("bbox")
    note = f"{len(feats)} polygon(s)" + (f" · bbox {', '.join(f'{v:.3f}' for v in bbox)}" if isinstance(bbox, list) and len(bbox) == 4 else "")
    out.figure(publisher=PUBLISHER, metric="flood_extent_km2", value=round(area_m2 / 1e6, 1), as_of=fetched_at,
               url=str(source.get("url") or p.url), note=note, source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
