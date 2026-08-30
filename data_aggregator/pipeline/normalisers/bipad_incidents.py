"""
normalisers/bipad_incidents.py — BIPAD portal incident records (NEOC/MoHA loss data) → figures per place.
docs/pull_external_data/05d-sources-wave4.md §bipad_incidents.

    /api/v1/incident/?incident_on__gt=2026-08-25…&expand=loss ─▶ prestore(): whitelist of count fields only
        ─▶ normalise(): flood-family incidents since 26 Aug ─▶ figures scope place:<id> (gazetteer) | incident:<id>
                                                             ─▶ national sums bipad_flood_{incidents,dead,missing,injured}

As of 30 Aug 2026 the Bhote Koshi event itself is NOT yet entered in BIPAD (only unrelated daily incidents);
this source exists so the official ward-level loss records land the moment NEOC enters them. `loss` may carry
free-text `description`/`estimatedLoss`; prestore drops everything except numeric counts and the incident's
title/time/geometry, so no personal detail can reach RAW.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any

from . import Context, NormalisedRows, Part, parts
from ._common import parse_dt

SOURCE_ID = "bipad_incidents"
PUBLISHER = "BIPAD (NEOC)"
EVENT_START = datetime(2026, 8, 26, 0, 0, tzinfo=timezone.utc)
INCIDENT_KEYS = ("id", "title", "titleNe", "incidentOn", "reportedOn", "modifiedOn", "hazard", "wards", "point",
                 "streetAddress", "dataSource", "source", "verified")
FLOOD_HAZARDS = {"flood", "flash flood", "landslide", "heavy rainfall", "glacial lake outburst flood", "glof", "avalanche"}
TITLE_RE = re.compile(r"^\s*(.+?)\s+at\s+(.+?)\s*$", re.S)
LOSS_METRICS = {
    "peopleDeathCount": "incident_dead", "peopleMissingCount": "incident_missing",
    "peopleInjuredCount": "incident_injured", "peopleAffectedCount": "incident_people_affected",
    "familyAffectedCount": "incident_families_affected", "familyEvacuatedCount": "incident_families_evacuated",
    "infrastructureDestroyedHouseCount": "incident_houses_destroyed",
    "infrastructureDestroyedBridgeCount": "incident_bridges_destroyed",
    "infrastructureDestroyedRoadCount": "incident_roads_destroyed",
}


def project(inc: dict[str, Any]) -> dict[str, Any]:
    """Pure: one incident → the fields RAW may hold (identifiers, time, geometry, numeric loss counts)."""
    out = {k: inc.get(k) for k in INCIDENT_KEYS if k in inc}
    loss = inc.get("loss") or {}
    if isinstance(loss, dict):
        out["loss"] = {k: v for k, v in loss.items() if k.endswith("Count") and isinstance(v, (int, float))}
    return out


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        doc = p.json()
        if not isinstance(doc, dict) or not isinstance(doc.get("results"), list):
            out.append(p)
            continue
        slim = {"count": len(doc["results"]), "results": [project(i) for i in doc["results"] if isinstance(i, dict)]}
        out.append(Part(url=p.url, status=p.status, body=json.dumps(slim, ensure_ascii=False),
                        last_modified=p.last_modified, error=p.error))
    return out


def split_title(title: str | None) -> tuple[str, str]:
    """"Flood at Molung Rural Municipality-1" → ("flood", "Molung Rural Municipality-1")."""
    m = TITLE_RE.match(title or "")
    if not m:
        return ((title or "").strip().lower(), "")
    return (m.group(1).strip().lower(), m.group(2).strip())


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    totals = {"incidents": 0, "dead": 0, "missing": 0, "injured": 0}
    latest: datetime | None = None
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        for inc in doc.get("results") or []:
            when = parse_dt(inc.get("incidentOn"))
            if when is None or when < EVENT_START:
                continue
            hazard, where = split_title(inc.get("title"))
            if hazard not in FLOOD_HAZARDS:
                continue
            loss = inc.get("loss") or {}
            modified = parse_dt(inc.get("modifiedOn")) or when
            latest = modified if latest is None or modified > latest else latest
            place = ctx.resolve(where) if (ctx and where) else None
            if where:
                out.hint(where, place, 1, kind="incident")
            scope = f"place:{place}" if place else f"incident:{inc.get('id')}"
            note = f"{hazard} · {where}".strip(" ·")
            url = f"https://bipadportal.gov.np/incidents/{inc.get('id')}"
            totals["incidents"] += 1
            for key, metric in LOSS_METRICS.items():
                v = loss.get(key) if isinstance(loss, dict) else None
                if isinstance(v, (int, float)) and v > 0:
                    out.figure(publisher=PUBLISHER, metric=metric, value=int(v), scope=scope, as_of=modified, url=url,
                               note=note, source_id=SOURCE_ID, fetched_at=fetched_at)
            if isinstance(loss, dict):
                totals["dead"] += int(loss.get("peopleDeathCount") or 0)
                totals["missing"] += int(loss.get("peopleMissingCount") or 0)
                totals["injured"] += int(loss.get("peopleInjuredCount") or 0)
    as_of = latest or fetched_at
    url = source.get("url") if isinstance(source.get("url"), str) else "https://bipadportal.gov.np/"
    for k, v in totals.items():
        out.figure(publisher=PUBLISHER, metric=f"bipad_flood_{k}", value=v, scope="national", as_of=as_of, url=url,
                   note="flood/landslide-family incidents entered since 26 Aug 2026 (event itself not yet entered as of 30 Aug)",
                   source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
