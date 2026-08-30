"""
normalisers/hot_bridge_damage.py — HOT bridge-damage GeoJSON (59 points) → figures 'HOT OSM'.
docs/pull_external_data/05-sources.md §hot_bridge_damage.
  bridge_status   scope place:<gazetteer id of `location` / name, else slug of name>, value 1,
                  note = "<status> · <name> · <adm3>"; as_of = S3 Last-Modified (else fetched_at)
  bridges_damaged / bridges_washed_out / bridges_intact   national counts
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any

from lib.text import slugify

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "hot_bridge_damage"
PUBLISHER = "HOT OSM"
SRC_URL = "https://production-raw-data-api.s3.amazonaws.com/ISO3/NPL/combined/hot_flood_npl_bridge_damage.geojson"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"hot: {p.error or p.status}")
        return out
    as_of = parse_dt(p.last_modified) or fetched_at
    statuses: Counter[str] = Counter()
    for f in doc.get("features") or []:
        pr = f.get("properties") or {}
        name = str(pr.get("name") or "").strip()
        status = str(pr.get("status") or pr.get("status_original") or "unknown").strip()
        statuses[status.lower()] += 1
        loc = str(pr.get("location") or "").strip()
        pid = None
        if ctx:
            pid = ctx.resolve(loc) or ctx.resolve(name) or ctx.resolve(str(pr.get("adm3_name") or ""))
        scope = f"place:{pid or slugify(name or loc or 'unknown')}"
        out.hint(loc or name, pid, 1, kind="bridge")
        out.figure(publisher=PUBLISHER, metric="bridge_status", value=1, scope=scope, as_of=as_of, url=SRC_URL,
                   note=f"{status} · {name or 'unnamed bridge'} · {pr.get('adm3_name') or ''}".strip(" ·"),
                   source_id=SOURCE_ID, fetched_at=fetched_at)
    washed = statuses.get("washed out", 0)
    damaged = statuses.get("damaged", 0)
    intact = statuses.get("intact", 0)
    for metric, val in (("bridges_washed_out", washed), ("bridges_damaged", washed + damaged), ("bridges_intact", intact),
                        ("bridges_surveyed", sum(statuses.values()))):
        out.figure(publisher=PUBLISHER, metric=metric, value=val, as_of=as_of, url=SRC_URL, source_id=SOURCE_ID,
                   fetched_at=fetched_at, note="HOT flood bridge survey")
    return out
