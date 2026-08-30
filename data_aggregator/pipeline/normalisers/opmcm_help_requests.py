"""
normalisers/opmcm_help_requests.py — OPMCM `/api/help-requests` (geocoded help requests) → per-place counts.
docs/pull_external_data/05c-sources-wave3.md §opmcm_help_requests.

The puller pages `?page={n}&limit=200`. `prestore()` runs BEFORE anything is stored: reporterName, phone,
thumbnail (base64 photo), title and description (free text that carries names and phone numbers) are dropped;
the gazetteer ids found in title/description/placeName are kept as `place_ids` so the location survives
without the words. `normalise()` then counts open / critical requests and affected people per place, district,
problem type and help type for publisher 'OPMCM portal'. National open/critical/resolved totals already come
from opmcm_stats, so here the only national figure is `people_affected_reported`.

Place resolution per request, first hit wins: place_ids from the text → nearest gazetteer place within
8 km of the Point (districts and the generic cities excluded) → the district text.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime
from typing import Any

from lib.text import slugify, to_int

from . import Context, NormalisedRows, Part, parts
from ._geo import nearest_place
from ._rss import GENERIC_PLACE_IDS

SOURCE_ID = "opmcm_help_requests"
PUBLISHER = "OPMCM portal"
SRC_URL = "https://rescue.opmcm.gov.np/help-requests"
KEEP = ("_id", "referenceId", "reportingFor", "problemType", "helpTypes", "affectedCount", "urgency", "status",
        "province", "district", "municipality", "ward", "placeName", "location", "source", "createdAt", "updatedAt")
OPEN_STATUSES = ("OPEN", "IN_PROGRESS")
NEAREST_KM = 8.0


def project_item(it: dict[str, Any], ctx: Context | None = None) -> dict[str, Any]:
    """Keyed projection of one help request: identifiers and free text gone, gazetteer ids kept."""
    text = " ".join(str(it.get(k) or "") for k in ("title", "description", "placeName", "municipality", "district"))
    row = {k: it.get(k) for k in KEEP if k in it}
    if isinstance(row.get("placeName"), str):
        row["placeName"] = row["placeName"][:120]
    row["place_ids"] = ctx.gazetteer.resolve_ids(text) if (ctx is not None and ctx.gazetteer is not None) else []
    return row


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        doc = p.json()
        data = doc.get("data") if isinstance(doc, dict) else None
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            data["items"] = [project_item(it, ctx) for it in data["items"] if isinstance(it, dict)]
            out.append(Part(url=p.url, status=p.status, body=json.dumps(doc, ensure_ascii=False),
                            last_modified=p.last_modified, error=p.error))
        else:
            out.append(p)
    return out


def _latlon(it: dict[str, Any]) -> tuple[float | None, float | None]:
    loc = it.get("location") or {}
    c = loc.get("coordinates") if isinstance(loc, dict) else None
    if isinstance(c, list) and len(c) >= 2 and all(isinstance(v, (int, float)) for v in c[:2]):
        return float(c[1]), float(c[0])
    return None, None


def resolve_item(it: dict[str, Any], ctx: Context | None) -> tuple[str | None, str | None]:
    """(place_id, district_id) for one projected request."""
    gaz = ctx.gazetteer if ctx is not None else None
    place = district = None
    for pid in it.get("place_ids") or []:
        pl = gaz.get(pid) if gaz is not None else None
        kind = pl.kind if pl is not None else "settlement"
        if kind == "district":
            district = district or pid
        elif place is None and pid not in GENERIC_PLACE_IDS:
            place = pid
    if place is None:
        lat, lon = _latlon(it)
        hit = nearest_place(gaz, lat, lon, max_km=NEAREST_KM, exclude_ids=GENERIC_PLACE_IDS)
        if hit:
            place = hit[0]
    if district is None and gaz is not None and it.get("district"):
        for pid in gaz.resolve_ids(str(it["district"])):
            pl = gaz.get(pid)
            if pl is not None and pl.kind == "district":
                district = pid
                break
    return place, district


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    items: list[dict[str, Any]] = []
    total: int | None = None
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        data = doc.get("data") or {}
        if isinstance(data.get("total"), (int, float)):
            total = int(data["total"])
        items.extend(i for i in (data.get("items") or []) if isinstance(i, dict))
    if not items:
        return out

    def fig(metric: str, value: int, scope: str = "national", note: str | None = None) -> None:
        out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=fetched_at, url=SRC_URL,
                   note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    per_scope: dict[str, Counter[str]] = defaultdict(Counter)
    affected_total = 0
    unresolved = 0
    for it in items:
        status = str(it.get("status") or "").upper()
        if status not in OPEN_STATUSES:
            continue
        critical = str(it.get("urgency") or "").upper() == "CRITICAL"
        affected = max(0, to_int(it.get("affectedCount")) or 0)
        affected_total += affected
        place, district = resolve_item(it, ctx)
        scopes = [f"problem:{slugify(str(it.get('problemType') or 'other'))}"]
        scopes += [f"help:{slugify(str(h))}" for h in (it.get("helpTypes") or []) if h]
        if place:
            scopes.append(f"place:{place}")
        else:
            unresolved += 1
        if district:
            scopes.append(f"district:{district}")
        for s in scopes:
            c = per_scope[s]
            c["help_requests_open"] += 1
            c["help_requests_critical"] += int(critical)
            c["people_affected_reported"] += affected
    fig("people_affected_reported", affected_total, note=f"sum of affectedCount over open requests · {len(items)} listed"
        + (f" of {total}" if total is not None else ""))
    if unresolved:
        fig("help_requests_open", unresolved, scope="place:unresolved", note="no gazetteer place within 8 km and no place in the text")
    for scope, c in sorted(per_scope.items()):
        for metric, n in c.items():
            if n or metric == "help_requests_open":
                fig(metric, n, scope=scope)
    return out
