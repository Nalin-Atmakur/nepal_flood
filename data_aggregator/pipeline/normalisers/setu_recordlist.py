"""
normalisers/setu_recordlist.py — Setu Rapid (NDRRMA) public record list → figures (+ keyed projection).
docs/pull_external_data/05a-sources-wave2-official.md §setu_recordlist.

    recordlist.php (100 cards/page, 18 pages, `var REC = [...]` mirrors the cards with contacts)
        prestore()  ─▶ page projection {page, pages, records:[{status, source, when, time, loc, verified,
                        gender, age_band, person_key}]}  — names / contacts / reporters never reach raw_pulls
        normalise() ─▶ pages 2..N via ctx.fetch (in memory, same projection) ─▶ counts by status
                        publisher 'Setu (NDRRMA)': missing · found_safe · found_injured · found_dead ·
                        rescued · found (all Found-*) · records_total · records_verified   (national)
                        missing scoped source:<reporting DAO slug> and place:<gazetteer id> (card `loc`)
as_of = fetched_at (the list states no validity time). Counts only; no row is ever written.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime
from typing import Any

from lib.text import age_band, nfc, person_key, redact_pii, slugify

from . import Context, NormalisedRows, Part, parts

SOURCE_ID = "setu_recordlist"
PUBLISHER = "Setu (NDRRMA)"
BASE = "https://setu.ndrrma.gov.np/admin/recordlist.php"
MAX_PAGES = 30
KEEP = ("status", "source", "when", "time", "verified", "gender")
STATUS_METRICS = {
    "missing": "missing", "found - safe": "found_safe", "found - injured": "found_injured",
    "found - dead": "found_dead", "rescued": "rescued", "found": "found_unspecified", "safe": "found_safe",
    "dead": "found_dead", "injured": "found_injured",
}
_CARD_RE = re.compile(r'<div class="rl"[\s\S]*?<span class="pill"[^>]*>([^<]*)</span>[\s\S]*?(?:<div class="rl-loc">([^<]*)</div>)?[\s\S]*?'
                      r'<span class="src">([^<]*)</span>[\s\S]*?<span class="when">([^<]*)</span>')


def _records_from_js(html: str) -> list[dict[str, Any]] | None:
    i = html.find("var REC = ")
    if i < 0:
        return None
    try:
        arr, _ = json.JSONDecoder().raw_decode(html, i + len("var REC = "))
    except (json.JSONDecodeError, ValueError):
        return None
    return [r for r in arr if isinstance(r, dict)] if isinstance(arr, list) else None


def _project(r: dict[str, Any]) -> dict[str, Any]:
    out = {k: r.get(k) for k in KEEP}
    loc = nfc(str(r.get("loc") or "")).strip()
    out["loc"] = redact_pii(loc)[:80] or None
    out["age_band"] = age_band(r.get("age"))
    out["person_key"] = person_key(phone=str(r.get("contact") or "") or None, name=r.get("name"), age=r.get("age"))
    return out


def parse_page(html: str) -> dict[str, Any]:
    """HTML page → PII-free projection (pure; used by prestore, normalise and the fixture builder)."""
    cur = re.search(r'<span class="cur">(\d+)</span>', html)
    pages = [int(n) for n in re.findall(r"recordlist\.php\?page=(\d+)", html)]
    recs = _records_from_js(html)
    if recs is None:
        recs = [{"status": s.strip(), "loc": loc.strip(), "source": src.strip(), "when": when.strip()}
                for s, loc, src, when in _CARD_RE.findall(html)]
    return {"page": int(cur.group(1)) if cur else 1, "pages": max(pages) if pages else 1,
            "records": [_project(r) for r in recs]}


def _doc(body: str) -> dict[str, Any] | None:
    s = (body or "").lstrip()
    if s.startswith("{"):
        try:
            d = json.loads(s)
            return d if isinstance(d, dict) and "records" in d else None
        except json.JSONDecodeError:
            return None
    return parse_page(body) if "<" in s else None


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        d = _doc(p.body) if p.ok else None
        if d is None:
            out.append(p)
        else:
            out.append(Part(url=p.url, status=p.status, body=json.dumps(d, ensure_ascii=False),
                            last_modified=p.last_modified, error=p.error))
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    url = source.get("url") if isinstance(source.get("url"), str) else BASE
    p = parts(raw)[0]
    first = _doc(p.body) if p.ok else None
    if first is None:
        out.notes.append(f"recordlist: {p.error or p.status or 'unparseable'}")
        return out
    docs = [first]
    total_pages = min(int(first.get("pages") or 1), MAX_PAGES)
    failed = 0
    for n in range(2, total_pages + 1):
        if ctx is None or ctx.fetch is None:
            break
        f = ctx.fetch(f"{BASE}?page={n}")
        d = _doc(getattr(f, "text", "")) if getattr(f, "ok", False) else None
        if d is None:
            failed += 1
            continue
        docs.append(d)
    records = [r for d in docs for r in d.get("records") or []]
    pages_note = f"pages {len(docs)}/{first.get('pages') or 1}" + (f" ({failed} failed)" if failed else "")
    if len(docs) < (first.get("pages") or 1):
        out.notes.append(f"recordlist: {pages_note} — counts are partial")

    def fig(metric: str, value: int, scope: str = "national", note: str | None = None) -> None:
        out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=fetched_at, url=url,
                   note=f"{pages_note}" + (f" · {note}" if note else ""), source_id=SOURCE_ID, fetched_at=fetched_at)

    by_status = Counter(nfc(str(r.get("status") or "")).strip().lower() for r in records)
    found_total = 0
    for st, n in by_status.items():
        metric = STATUS_METRICS.get(st)
        if metric is None:
            out.notes.append(f"recordlist: unknown status label ({n} records)")
            continue
        fig(metric, n, note=f"status label '{st}'")
        if metric.startswith("found"):
            found_total += n
    if found_total:
        fig("found", found_total, note="all 'Found - *' labels")
    fig("records_total", len(records))
    fig("records_verified", sum(1 for r in records if r.get("verified") is True))

    by_source: Counter[str] = Counter()
    by_place: Counter[str] = Counter()
    for r in records:
        if nfc(str(r.get("status") or "")).strip().lower() != "missing":
            continue
        src = nfc(str(r.get("source") or "")).strip()
        if src:
            by_source[src] += 1
        loc = nfc(str(r.get("loc") or "")).strip()
        if loc:
            pid = ctx.resolve(loc) if ctx else None
            if pid:
                by_place[pid] += 1
                out.hint(loc, pid, 1, kind="setu_loc")
            elif len(loc) <= 40 and not re.search(r"\d", loc):
                out.hint(loc, None, 1, kind="setu_loc")
    for src, n in by_source.most_common():
        fig("missing", n, scope=f"source:{slugify(src)}", note=f"reporting office: {src}")
    for pid, n in by_place.most_common():
        fig("missing", n, scope=f"place:{pid}", note="card location resolved by the gazetteer")
    return out
