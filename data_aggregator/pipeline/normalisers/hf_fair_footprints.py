"""
normalisers/hf_fair_footprints.py — HOT fAIr building footprints on Hugging Face (`api/datasets/hotosm/nepal_flood_2026`)
→ dataset freshness figures. docs/pull_external_data/05c-sources-wave3.md §hf_fair_footprints.
The dataset API answers `{id, lastModified, downloads, likes, siblings[{rfilename}], cardData{pretty_name, …}}`.
Figures for publisher 'HOT fAIr (Hugging Face)': `dataset_files`, `dataset_downloads`; as_of = lastModified.
The parquet/geojson themselves (13,663 footprints) are not pulled — this row tells the /sources page the
dataset exists and when it last changed.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "hf_fair_footprints"
PUBLISHER = "HOT fAIr (Hugging Face)"
PAGE = "https://huggingface.co/datasets/hotosm/nepal_flood_2026"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict) or not doc.get("id"):
        out.notes.append(f"hf: {p.error or p.status}")
        return out
    files = [s.get("rfilename") for s in (doc.get("siblings") or []) if isinstance(s, dict)]
    data_files = [f for f in files if str(f).endswith((".parquet", ".geojson"))]
    card = doc.get("cardData") or {}
    kw = dict(publisher=PUBLISHER, as_of=parse_dt(doc.get("lastModified")) or fetched_at, url=PAGE, source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(metric="dataset_files", value=len(data_files), note=f"{card.get('pretty_name') or doc['id']} · {len(files)} files · {card.get('license') or ''}".strip(" ·"), **kw)
    if isinstance(doc.get("downloads"), (int, float)):
        out.figure(metric="dataset_downloads", value=int(doc["downloads"]), **kw)
    return out
