"""
normalisers/opmcm_person_reports.py — OPMCM `/api/person-reports` → anonymised counts.
docs/pull_external_data/05-sources.md §opmcm_person_reports; docs/process_data/00-anonymise.md.

The puller fetches type=lost (paged, 200/page, ≤60 pages), type=found (portal returns only a
`total`) and type=rescued (portal answers 400). `prestore()` runs BEFORE anything is stored:
  * images[], imageUrl, thumbnail (base64 photo) are dropped
  * fullName + description (which can carry passport numbers) are replaced by `person_key`
    (sha256 of passport if present in the description, else of name+age band+nationality)
  * a parsed `nationality` (from "Nationality - X" in the description) is kept
so raw_pulls only ever holds the keyed projection. `normalise()` then counts by type/status/
daoOffice/locationText (resolved through the gazetteer) → figures for 'OPMCM portal' with
scopes place:<id>, district:<dao>, status:<s>, gender:<g>, source:<dao|public>. Names never
reach figures, hints or notes.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime
from typing import Any

from lib.text import age_band, person_key, slugify

from . import Context, NormalisedRows, Part, parts

SOURCE_ID = "opmcm_person_reports"
PUBLISHER = "OPMCM portal"
DROP_FIELDS = ("images", "imageUrl", "thumbnail", "fullName", "description", "phone", "contact", "reporterName",
               "reporterPhone", "email")
_NAT_RE = re.compile(r"nationality\s*[-:–]\s*([A-Za-z .]+)", re.I)
_PASSPORT_RE = re.compile(r"passport\s*(?:no\.?|number|#)?\s*[-:–]?\s*([A-Z0-9]{6,12})", re.I)
_DAO_RE = re.compile(r"^\s*DAO\s+(.+?)\s*$", re.I)


def project_item(it: dict[str, Any]) -> dict[str, Any]:
    """Keyed projection of one person report (no identifiers survive)."""
    desc = str(it.get("description") or "")
    nat = None
    m = _NAT_RE.search(desc)
    if m:
        nat = m.group(1).strip().lower()[:40]
    pp = None
    m = _PASSPORT_RE.search(desc)
    if m:
        pp = m.group(1)
    key = person_key(passport=pp, name=it.get("fullName"), age=it.get("approximateAge"), nationality=nat)
    row = {k: v for k, v in it.items() if k not in DROP_FIELDS}
    row["person_key"] = key
    row["key_strength"] = "passport" if pp else ("name" if key else None)
    row["nationality"] = nat
    row["has_photo"] = bool(it.get("images") or it.get("imageUrl"))
    row["age_band"] = age_band(it.get("approximateAge"))
    return row


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        doc = p.json()
        if not isinstance(doc, dict):
            out.append(p)
            continue
        data = doc.get("data")
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            data["items"] = [project_item(it) for it in data["items"] if isinstance(it, dict)]
        elif isinstance(data, list):
            doc["data"] = [project_item(it) for it in data if isinstance(it, dict)]
        out.append(Part(url=p.url, status=p.status, body=json.dumps(doc, ensure_ascii=False),
                        last_modified=p.last_modified, error=p.error))
    return out


def _type_of(url: str, doc: dict[str, Any]) -> str | None:
    m = re.search(r"[?&]type=(lost|found|rescued)", url or "")
    if m:
        return m.group(1)
    d = doc.get("data") if isinstance(doc, dict) else None
    if isinstance(d, dict) and d.get("restricted"):
        return str(d["restricted"])
    return None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    src_url = "https://rescue.opmcm.gov.np/person-lost-found"
    totals: dict[str, int] = {}
    items_by_type: dict[str, list[dict[str, Any]]] = {}
    failed: list[str] = []
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            failed.append(f"{p.url}: {p.error or p.status}")
            continue
        t = _type_of(p.url, doc) or "unknown"
        data = doc.get("data")
        if isinstance(data, dict):
            if isinstance(data.get("total"), (int, float)):
                totals[t] = int(data["total"])
            items = data.get("items") or []
        elif isinstance(data, list):
            items = data
        else:
            items = []
        items_by_type.setdefault(t, []).extend(i for i in items if isinstance(i, dict))
    if failed:
        out.notes.extend(failed)

    def fig(metric: str, value: int, scope: str = "national", note: str | None = None) -> None:
        out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=fetched_at, url=src_url,
                   note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    for t, n in totals.items():
        fig(f"{t}_reports_total", n)
    for t, items in items_by_type.items():
        if not items:
            continue
        fig(f"{t}_reports_listed", len(items), note="rows retrievable via the API this run")
        by_status = Counter(str(i.get("status") or "unknown").lower() for i in items)
        for s, n in by_status.items():
            fig(f"{t}_reports", n, scope=f"status:{slugify(s)}")
        by_dao = Counter(str(i.get("daoOffice") or "").strip() for i in items)
        for dao, n in by_dao.items():
            if not dao:
                continue
            m = _DAO_RE.match(dao)
            district = slugify(m.group(1)) if m else slugify(dao)
            fig(f"{t}_reports", n, scope=f"district:{district}", note=f"daoOffice={dao}")
        by_src = Counter(("dao" if str(i.get("source") or "").lower() == "dao" else "public") for i in items)
        for s, n in by_src.items():
            fig(f"{t}_reports", n, scope=f"source:{s}")
        by_gender = Counter(str(i.get("gender") or "unknown").lower() for i in items)
        for g, n in by_gender.items():
            fig(f"{t}_reports", n, scope=f"gender:{slugify(g)}")
        by_nat = Counter(str(i.get("nationality") or "").strip().lower() for i in items)
        for nat, n in by_nat.items():
            if nat:
                fig(f"{t}_reports", n, scope=f"nationality:{slugify(nat)}")
        by_loc: Counter[str] = Counter()
        for i in items:
            loc = str(i.get("locationText") or "").strip()
            if loc:
                by_loc[loc] += 1
        resolved: Counter[str] = Counter()
        unresolved = 0
        for loc, n in by_loc.items():
            pid = ctx.resolve(loc) if ctx else None
            out.hint(loc[:120], pid, n, kind=t)
            if pid:
                resolved[pid] += n
            else:
                unresolved += n
        for pid, n in resolved.items():
            fig(f"{t}_reports", n, scope=f"place:{pid}", note="locationText resolved via gazetteer")
        if unresolved:
            fig(f"{t}_reports", unresolved, scope="place:unresolved")
    return out
