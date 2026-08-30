"""
normalisers/police_udb.py — Nepal Police Unidentified Bodies DB → figures (counts only).
docs/pull_external_data/05a-sources-wave2-official.md §police_udb.

    /{dead-bodies-lists|missing|found}?date_from=2026-08-26  (self-signed TLS: sources.yaml auth says
    "self-signed" so the puller fetches with verify=False; sub-fetches here do the same)
        prestore()  ─▶ per section a projection {section, url, count, pages, rows} — the photo / description
                        HTML never reaches raw_pulls
        normalise() ─▶ publisher 'Nepal Police (UDB)':
                        bodies_recorded · missing_recorded · found_recorded   national
                        bodies_recorded scope district:<slug>  for the affected districts — one list page per
                        district. sources.yaml lists those pages (district ids below) so the puller's thread pool
                        fetches them; when a raw envelope carries no district pages (old snapshots, tests) the
                        normaliser falls back to discovering ids via GET /get-district/{province} and ctx.fetch.
`count=` appears in the pagination links only when there is more than one page; single-page lists are
counted from their <tbody> rows; the "no records" row (a single colspan cell) counts as 0.
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from typing import Any

from lib.html import tbody_rows

from . import Context, NormalisedRows, Part, parts

SOURCE_ID = "police_udb"
PUBLISHER = "Nepal Police (UDB)"
BASE = "https://udb.nepalpolice.gov.np"
DATE_FROM = "2026-08-26"
PROVINCES = (3, 4, 5)                       # Bagmati, Gandaki, Lumbini — every corridor / downstream district
DISTRICTS = {                               # UDB english_name → the district slug used by the other publishers
    "Rasuwa": "rasuwa", "Nuwakot": "nuwakot", "Dhading": "dhading", "Gorkha": "gorkha", "Tanahu": "tanahun",
    "Chitawan": "chitwan", "East Nawalparasi": "nawalparasi_east", "West Nawalparasi": "nawalparasi_west",
    "Makwanpur": "makwanpur", "Kaski": "kaski", "Kathmandu": "kathmandu", "Lamjung": "lamjung",
    "Sindhupalchok": "sindhupalchok",
}
SECTION_METRICS = {"dead-bodies-lists": "bodies_recorded", "missing": "missing_recorded", "found": "found_recorded"}
DISTRICT_IDS = {                            # UDB district_id → slug (from GET /get-district/{3,4,5}, 29 Aug 2026)
    23: "sindhupalchok", 27: "kathmandu", 28: "nuwakot", 29: "rasuwa", 30: "dhading", 31: "makwanpur", 35: "chitwan",
    36: "gorkha", 37: "lamjung", 38: "tanahun", 40: "kaski", 77: "nawalparasi_east", 48: "nawalparasi_west",
}


def district_of(url: str) -> str | None:
    m = re.search(r"[?&]district_id=(\d+)", url or "")
    return DISTRICT_IDS.get(int(m.group(1))) if m else None


def section_of(url: str) -> str:
    m = re.search(r"udb\.nepalpolice\.gov\.np/([a-z\-]+)", url or "")
    return m.group(1) if m else "unknown"


def parse_list_page(html: str) -> dict[str, Any]:
    counts = [int(c) for c in re.findall(r"(?:[?&]|&amp;)count=(\d+)", html or "")]
    pm = re.search(r"Showing\s+\d+\s+out\s+of\s+(\d+)\s+Pages", html or "", re.I)
    rows = [r for r in tbody_rows(html) if not re.search(r"<td[^>]*colspan", r, re.I)]
    pages = int(pm.group(1)) if pm else (1 if rows else 0)
    count = max(counts) if counts else (len(rows) if pages <= 1 else None)
    return {"count": count, "pages": pages, "rows": len(rows)}


def project(url: str, html: str) -> dict[str, Any]:
    d = {"section": section_of(url), "url": url, "date_from": DATE_FROM, **parse_list_page(html)}
    slug = district_of(url)
    if slug:
        d["district"] = slug
    return d


def _doc(p: Part) -> dict[str, Any] | None:
    s = (p.body or "").lstrip()
    if s.startswith("{"):
        try:
            d = json.loads(s)
            return d if isinstance(d, dict) and "section" in d else None
        except json.JSONDecodeError:
            return None
    return project(p.url, p.body) if "<" in s else None


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        d = _doc(p) if p.ok else None
        out.append(p if d is None else Part(url=p.url, status=p.status, body=json.dumps(d, ensure_ascii=False),
                                             last_modified=p.last_modified, error=p.error))
    return out


def _fetch(ctx: Context, url: str) -> Any:
    try:
        return ctx.fetch(url, verify=False)  # type: ignore[call-arg]
    except TypeError:
        return ctx.fetch(url)  # type: ignore[misc]


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()

    def fig(metric: str, value: Any, scope: str = "national", note: str | None = None, url: str | None = None) -> None:
        if isinstance(value, int):
            out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=fetched_at,
                       url=url or f"{BASE}/dead-bodies-lists", note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    total = 0
    got = 0
    for p in parts(raw):
        d = _doc(p) if p.ok else None
        if d is None:
            out.notes.append(f"{section_of(p.url)}: {p.error or p.status or 'unparseable'}")
            continue
        metric = SECTION_METRICS.get(d.get("section") or "")
        if metric is None:
            continue
        slug = d.get("district") or district_of(p.url)
        if slug:   # a district page fetched by the pool
            if d.get("count") is None:
                out.notes.append(f"district {slug}: count not on the page")
                continue
            fig("bodies_recorded", d["count"], scope=f"district:{slug}", note=f"records dated from {DATE_FROM}", url=p.url)
            total += d["count"]
            got += 1
            continue
        note = f"records dated from {DATE_FROM}; {d.get('pages')} page(s)"
        if d.get("count") is None:
            out.notes.append(f"{d['section']}: count not on the page ({d.get('pages')} pages)")
        fig(metric, d.get("count"), note=note, url=p.url or None)
    if got:
        fig("bodies_recorded_sum_of_districts", total, note=f"sum over {got} fetched districts (not the national total)")
        return out

    # Fallback: no district pages in the envelope → discover ids and fetch on the spot (slow; main thread).
    if ctx is None or ctx.fetch is None:
        return out
    ids: dict[str, tuple[int, int]] = {}
    for prov in PROVINCES:
        f = _fetch(ctx, f"{BASE}/get-district/{prov}")
        if not getattr(f, "ok", False):
            out.notes.append(f"get-district/{prov}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            continue
        try:
            rows = json.loads(getattr(f, "text", "") or "[]")
        except json.JSONDecodeError:
            rows = []
        for r in rows if isinstance(rows, list) else []:
            name = str(r.get("english_name") or "").strip()
            if name in DISTRICTS and r.get("id") is not None:
                ids[DISTRICTS[name]] = (int(r["id"]), prov)
    for slug, (did, prov) in sorted(ids.items()):
        url = f"{BASE}/dead-bodies-lists?province_id={prov}&district_id={did}&date_from={DATE_FROM}"
        f = _fetch(ctx, url)
        if not getattr(f, "ok", False):
            out.notes.append(f"district {slug}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            continue
        d = parse_list_page(getattr(f, "text", ""))
        if d["count"] is None:
            out.notes.append(f"district {slug}: count not on the page")
            continue
        fig("bodies_recorded", d["count"], scope=f"district:{slug}", note=f"records dated from {DATE_FROM}", url=url)
        total += d["count"]
        got += 1
    if got:
        fig("bodies_recorded_sum_of_districts", total, note=f"sum over {got} fetched districts (not the national total)")
    return out
