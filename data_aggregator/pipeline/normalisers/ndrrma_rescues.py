"""
normalisers/ndrrma_rescues.py — NDRRMA `/api/v1/rescues/*` → figures (+ keyed projection).
docs/pull_external_data/05-sources.md §ndrrma_rescues.

Parts (one per endpoint): rescued-persons (paged 500), status-counts, rescued-statistics,
rescued-locations, stationed-locations. `prestore()` replaces `name`/`name_ne` with a
`person_key` (sha256 of name + age band + nationality) and redacts `remarks`, so raw_pulls
holds no names. `normalise()` emits for publisher 'NDRRMA':
  rescued_portal (portal headline, rescued-statistics) national  — the sitrep total stays `rescued`
  rescued_named / rescued_named_nepali / _foreign      national (status-counts)
  rescued_named  scope status:<s> | nationality:<c> | gender:<g>
  rescued        scope place:<gazetteer id or slug>    note='NDRRMA: <location title>'
  stationed      scope place:<…>                       from stationed_location
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime
from typing import Any

from lib.text import age_band, person_key, redact_pii, slugify

from . import Context, NormalisedRows, Part, parts

SOURCE_ID = "ndrrma_rescues"
PUBLISHER = "NDRRMA"
SRC_URL = "https://ndrrma.gov.np/np/rescue"


def _endpoint(url: str) -> str:
    m = re.search(r"/rescues/([a-z\-]+)/?", url or "")
    return m.group(1) if m else "unknown"


def project_person(p: dict[str, Any]) -> dict[str, Any]:
    nat = p.get("country") or p.get("nationality")
    key = person_key(name=p.get("name") or p.get("name_ne"), age=p.get("age"), nationality=str(nat or ""))
    row = {k: v for k, v in p.items() if k not in ("name", "name_ne", "remarks", "phone", "contact")}
    row["person_key"] = key
    row["age_band"] = age_band(p.get("age"))
    rem = str(p.get("remarks") or "")
    rem = re.sub(r"address\s*[:：].*$", "", rem, flags=re.I).strip(" ,;")
    row["remarks_place"] = redact_pii(rem)[:80] or None
    return row


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        if _endpoint(p.url) != "rescued-persons":
            out.append(p)
            continue
        doc = p.json()
        if isinstance(doc, dict) and isinstance(doc.get("results"), list):
            doc["results"] = [project_person(x) for x in doc["results"] if isinstance(x, dict)]
            out.append(Part(url=p.url, status=p.status, body=json.dumps(doc, ensure_ascii=False),
                            last_modified=p.last_modified, error=p.error))
        else:
            out.append(p)
    return out


def _loc_title(v: Any, table: dict[int, dict[str, Any]]) -> str | None:
    if v is None:
        return None
    if isinstance(v, dict):
        return v.get("title") or v.get("title_ne")
    if isinstance(v, int) or (isinstance(v, str) and v.isdigit()):
        row = table.get(int(v))
        return (row.get("title") or row.get("title_ne")) if row else str(v)
    return str(v)


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    persons: list[dict[str, Any]] = []
    rescued_locs: dict[int, dict[str, Any]] = {}
    stationed_locs: dict[int, dict[str, Any]] = {}
    status_counts: dict[str, Any] | None = None
    stats: dict[str, Any] | None = None
    for p in parts(raw):
        ep = _endpoint(p.url)
        doc = p.json()
        if not p.ok or doc is None:
            out.notes.append(f"{ep}: {p.error or p.status}")
            continue
        if ep == "rescued-persons" and isinstance(doc, dict):
            persons.extend(x for x in (doc.get("results") or []) if isinstance(x, dict))
        elif ep == "rescued-locations" and isinstance(doc, dict):
            rescued_locs = {int(r["id"]): r for r in doc.get("results") or [] if r.get("id") is not None}
        elif ep == "stationed-locations" and isinstance(doc, dict):
            stationed_locs = {int(r["id"]): r for r in doc.get("results") or [] if r.get("id") is not None}
        elif ep == "status-counts" and isinstance(doc, dict):
            status_counts = doc
        elif ep == "rescued-statistics" and isinstance(doc, dict):
            stats = doc

    def fig(metric: str, value: Any, scope: str = "national", note: str | None = None) -> None:
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=fetched_at, url=SRC_URL,
                       note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    if stats:
        fig("rescued_portal", stats.get("rescued_count"), note="rescue portal headline (rescued-statistics); the sitrep's कुल उद्धार is metric `rescued`")
    if status_counts:
        fig("rescued_named", status_counts.get("total_count"), note="verified named list")
        fig("rescued_named_nepali", status_counts.get("nepali_count"))
        fig("rescued_named_foreign", status_counts.get("foreign_count"))
        for s in status_counts.get("status_counts") or []:
            if s.get("title"):
                fig("rescued_named", s.get("count"), scope=f"status:{slugify(s['title'])}", note=s["title"])

    # gazetteer hints for every named location (the gazetteer lane seeds from these too)
    def place_for(title: str | None) -> str | None:
        if not title:
            return None
        pid = ctx.resolve(title) if ctx else None
        return pid or f"{slugify(title)}"

    for table, kind in ((rescued_locs, "rescued_location"), (stationed_locs, "stationed_location")):
        for r in table.values():
            title = r.get("title") or r.get("title_ne")
            out.hint(str(title), ctx.resolve(title) if ctx else None, 0, kind=kind)

    if persons:
        fig("rescued_named_listed", len(persons), note="rows retrieved this run")
        by_nat = Counter((str(x.get("country") or x.get("nationality") or "unknown")).strip().lower() for x in persons)
        for nat, n in by_nat.items():
            fig("rescued_named", n, scope=f"nationality:{slugify(nat)}")
        by_gender = Counter(str(x.get("gender") or "unknown").lower() for x in persons)
        for g, n in by_gender.items():
            fig("rescued_named", n, scope=f"gender:{slugify(g)}")
        by_status = Counter(str((x.get("status") or {}).get("title") if isinstance(x.get("status"), dict) else x.get("status") or "unknown") for x in persons)
        for s, n in by_status.items():
            fig("rescued_named", n, scope=f"status:{slugify(s)}")
        for field, metric, table in (("rescued_location", "rescued", rescued_locs), ("stationed_location", "stationed", stationed_locs)):
            by_loc: Counter[str] = Counter()
            for x in persons:
                t = _loc_title(x.get(field), table)
                if t:
                    by_loc[t] += 1
            for title, n in by_loc.items():
                fig(metric, n, scope=f"place:{place_for(title)}", note=f"NDRRMA: {title}")
    return out
