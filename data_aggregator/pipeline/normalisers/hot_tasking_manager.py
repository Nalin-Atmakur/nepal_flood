"""
normalisers/hot_tasking_manager.py — HOT Tasking Manager campaign "2026 Nepal Floods" → figures 'HOT'.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §hot_tasking_manager.
  per project (scope project:<id>, as_of = lastUpdated, note = project name, url = tasks.hotosm.org/projects/<id>):
    mapped_pct · validated_pct · contributors; with a sub-fetch of /projects/<id>/statistics/: mappers · tasks_total
  national: projects_active
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "hot_tasking_manager"
PUBLISHER = "HOT"
API = "https://tasking-manager-production-api.hotosm.org/api/v2/projects/"
STATS_MAX = 8


def _stats(pid: int, ctx: Context | None) -> dict[str, Any] | None:
    if ctx is None or ctx.fetch is None:
        return None
    try:
        f = ctx.fetch(f"{API}{pid}/statistics/")
    except Exception:  # noqa: BLE001 — a failed sub-fetch only loses two metrics
        return None
    if not getattr(f, "ok", False):
        return None
    try:
        import json
        d = json.loads(f.text)
        return d if isinstance(d, dict) else None
    except (ValueError, AttributeError):
        return None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"hot_tm: {p.error or p.status}")
        return out
    projects = [r for r in (doc.get("results") or []) if isinstance(r, dict) and r.get("projectId")]
    for i, r in enumerate(projects):
        pid = int(r["projectId"])
        name = str(r.get("name") or f"project {pid}")
        as_of = parse_dt(r.get("lastUpdated")) or fetched_at
        url = f"https://tasks.hotosm.org/projects/{pid}"
        kw = dict(publisher=PUBLISHER, scope=f"project:{pid}", as_of=as_of, url=url, note=name, source_id=SOURCE_ID, fetched_at=fetched_at)
        out.figure(metric="mapped_pct", value=r.get("percentMapped"), **kw)
        out.figure(metric="validated_pct", value=r.get("percentValidated"), **kw)
        out.figure(metric="contributors", value=r.get("totalContributors"), **kw)
        st = _stats(pid, ctx) if i < STATS_MAX else None
        if st:
            out.figure(metric="mappers", value=st.get("totalMappers"), **kw)
            out.figure(metric="tasks_total", value=st.get("totalTasks"), **kw)
    out.figure(publisher=PUBLISHER, metric="projects_active", value=len(projects), as_of=fetched_at, url=p.url or API,
               note="campaign 2026 Nepal Floods", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
