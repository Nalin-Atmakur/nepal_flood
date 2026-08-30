"""
normalisers/opmcm_stats.py — OPMCM Rasuwa Flood Rescue Portal `/api/stats` → figures.
docs/pull_external_data/05-sources.md §opmcm_stats.

Every counter in `data.persons`, `data.requests`, `data.offers` becomes a figure for publisher
'OPMCM portal' (as_of = fetched_at: the portal states no validity time). Breakdown arrays become
scoped figures (district:<slug>, gender:<key>, day:<date>). No PII in this endpoint.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from lib.text import slugify

from . import Context, NormalisedRows, parts

SOURCE_ID = "opmcm_stats"
PUBLISHER = "OPMCM portal"

PERSON_METRICS = {
    "total": "total", "lost": "lost", "found": "found", "rescued": "rescued", "lostOpen": "lost_open",
    "foundOpen": "found_open", "open": "open", "resolved": "resolved", "pinned": "pinned", "last24h": "last24h",
    "childrenMissing": "children_missing", "elderlyMissing": "elderly_missing", "openOver48h": "open_over_48h",
    "withoutContact": "without_contact", "withoutPhoto": "without_photo", "resolutionRate": "resolution_rate_pct",
    "avgResolveHours": "avg_resolve_hours",
}
REQUEST_METRICS = {"total": "help_requests", "open": "help_requests_open", "critical": "help_requests_critical",
                   "inProgress": "help_requests_in_progress", "resolved": "help_requests_resolved"}
OFFER_METRICS = {"total": "help_offers", "available": "help_offers_available"}


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    url = source.get("url") if isinstance(source.get("url"), str) else None
    p = parts(raw)[0]
    doc = p.json()
    data = (doc or {}).get("data") if isinstance(doc, dict) else None
    if not isinstance(data, dict):
        out.notes.append("opmcm_stats: no data object")
        return out

    def fig(metric: str, value: Any, scope: str = "national", note: str | None = None) -> None:
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=fetched_at, url=url,
                       note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    persons = data.get("persons") or {}
    for k, m in PERSON_METRICS.items():
        fig(m, persons.get(k))
    top = persons.get("topLocation") or {}
    if isinstance(top, dict) and isinstance(top.get("count"), (int, float)):
        fig("top_location_count", top["count"], note=f"topLocation={top.get('name')}")
    for k, m in REQUEST_METRICS.items():
        fig(m, (data.get("requests") or {}).get(k))
    for k, m in OFFER_METRICS.items():
        fig(m, (data.get("offers") or {}).get(k))

    br = data.get("breakdown") or {}
    for row in br.get("requestsByDistrict") or []:
        if row.get("key"):
            fig("help_requests", row.get("count"), scope=f"district:{slugify(row['key'])}", note=str(row["key"]))
    for row in br.get("requestsByProblemType") or []:
        if row.get("key"):
            fig("help_requests", row.get("count"), scope=f"problem:{slugify(row['key'])}")
    for row in br.get("personsByGender") or []:
        if row.get("key"):
            sc = f"gender:{slugify(row['key'])}"
            fig("lost", row.get("lost"), scope=sc)
            fig("found", row.get("found"), scope=sc)
    for row in (br.get("personsByDay") or [])[-14:]:
        if row.get("day"):
            sc = f"day:{row['day']}"
            fig("lost", row.get("lost"), scope=sc)
            fig("found", row.get("found"), scope=sc)
    return out
