"""
normalisers/dao_nuwakot_rescued.py — DAO Nuwakot rescued-persons post → XLSX in Storage + count figures.
docs/pull_external_data/05a-sources-wave2-official.md §dao_nuwakot_rescued.

    post page (HTML, no PII) ─▶ .xlsx link ─▶ ctx.fetch ─▶ Storage raw/dao_nuwakot/<sha16>.xlsx (ARCHIVE)
        ─▶ openpyxl, per sheet: data rows + the "उद्दार गरेको स्थान" column distribution
        publisher 'DAO Nuwakot':  rescued (national · place:<gazetteer id | slug>)   — Nepali sheet
                                  rescued_foreign (national · nationality:<slug>)    — विदेशी sheet
    + one `articles` row for the post itself.
as_of from the post title ("मिति २०८३ भाद्र १२ गते सम्म" → 2026-08-28 NPT). Names, ages, addresses and
phones are read in memory only and never written anywhere.
"""
from __future__ import annotations

import hashlib
import io
import re
import warnings
from collections import Counter
from datetime import datetime
from typing import Any
from urllib.parse import unquote

from lib import log
from lib.text import nfc, slugify, to_int

from . import Context, NormalisedRows, parts
from ._common import parse_bs_datetime, strip_tags

SOURCE_ID = "dao_nuwakot_rescued"
PUBLISHER = "DAO Nuwakot"
STORAGE_PREFIX = "dao_nuwakot"
XLSX_RE = re.compile(r'href="([^"]+\.xlsx)"', re.I)
LOCATION_HEADER = re.compile(r"स्थान")
COUNTRY_HEADER = re.compile(r"^ठेगाना$|देश|country", re.I)
FOREIGN_SHEET = re.compile(r"विदेशी|foreign", re.I)


def find_xlsx_links(html: str) -> list[str]:
    links: list[str] = []
    for href in XLSX_RE.findall(html or ""):
        href = href if href.startswith("http") else "https://daonuwakot.moha.gov.np" + href
        if href not in links:
            links.append(href)
    links.sort(key=lambda u: 0 if "/upload/" in u else 1)         # the direct file first, the viewer wrapper last
    return links


def sheet_stats(xlsx: bytes) -> list[dict[str, Any]]:
    """Pure: workbook bytes → per-sheet counts. Row-level data stays in this frame."""
    import openpyxl
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        wb = openpyxl.load_workbook(io.BytesIO(xlsx), read_only=True, data_only=True)
    stats: list[dict[str, Any]] = []
    for ws in wb.worksheets:
        rows = [[nfc(str(c)).strip() if c is not None else "" for c in r] for r in ws.iter_rows(values_only=True)]
        header_i = next((i for i, r in enumerate(rows) if sum(1 for c in r if c) >= 4 and any("नाम" in c or "मिति" in c for c in r)), None)
        if header_i is None:
            stats.append({"sheet": ws.title, "rows": 0, "columns": [], "location_counts": {}, "country_counts": {}})
            continue
        header = rows[header_i]
        data = [r for r in rows[header_i + 1:] if r and to_int(r[0]) is not None and any(c for c in r[1:])]
        loc_i = next((i for i, h in enumerate(header) if LOCATION_HEADER.search(h)), None)
        foreign = bool(FOREIGN_SHEET.search(ws.title)) or any("देश" in (r[3] if len(r) > 3 else "") for r in data[:5])
        cty_i = next((i for i, h in enumerate(header) if COUNTRY_HEADER.search(h)), None) if foreign else None
        locs: Counter[str] = Counter(r[loc_i] for r in data if loc_i is not None and loc_i < len(r) and r[loc_i])
        ctys: Counter[str] = Counter(re.sub(r"\s*देश$", "", r[cty_i]) for r in data if cty_i is not None and cty_i < len(r) and r[cty_i])
        stats.append({"sheet": ws.title, "rows": len(data), "columns": header, "foreign": foreign,
                      "location_counts": dict(locs.most_common(60)), "country_counts": dict(ctys.most_common(60))})
    return stats


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    page_url = source.get("url") if isinstance(source.get("url"), str) else ""
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"post page: {p.error or p.status}")
        return out
    tm = re.search(r"<title>(.*?)</title>", p.body, re.S | re.I)
    title = strip_tags(tm.group(1)) if tm else "DAO Nuwakot rescued persons list"
    as_of = parse_bs_datetime(title) or fetched_at
    out.article(url=page_url or "https://daonuwakot.moha.gov.np", title=title[:500], publisher=PUBLISHER, lang="ne",
                published_at=as_of, body="जिल्ला प्रशासन कार्यालय, नुवाकोट — भोटेकोशी/त्रिशूली बाढीबाट उद्धार गरिएका व्यक्तिहरूको सूची (XLSX/PDF); counts only are extracted",
                source_id=SOURCE_ID, fetched_at=fetched_at)
    links = find_xlsx_links(p.body)
    if not links:
        out.notes.append("no .xlsx link on the post page")
        return out
    if ctx is None or ctx.fetch is None:
        return out
    xlsx_url = links[0]
    f = ctx.fetch(xlsx_url)
    body = getattr(f, "body", b"")
    if not getattr(f, "ok", False) or not body:
        out.notes.append(f"xlsx download failed ({getattr(f, 'error', None) or getattr(f, 'status', '?')})")
        return out
    digest = hashlib.sha256(body).hexdigest()[:16]
    if ctx.upload is not None and not ctx.dry_run:
        try:
            ctx.upload(f"{STORAGE_PREFIX}/{digest}.xlsx", body, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        except Exception as e:  # noqa: BLE001
            out.notes.append(f"storage upload failed ({type(e).__name__})")
    try:
        stats = sheet_stats(body)
    except Exception as e:  # noqa: BLE001 — corrupt / not-an-xlsx
        log.warn("dao_nuwakot_rescued.xlsx_failed", error=type(e).__name__)
        out.notes.append(f"xlsx unreadable ({type(e).__name__})")
        return out
    note_base = f"{unquote(xlsx_url.rsplit('/', 1)[-1])[:60]} · sha {digest}"

    def fig(metric: str, value: int, scope: str = "national", note: str | None = None) -> None:
        out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=as_of, url=page_url or xlsx_url,
                   note=f"{note_base}" + (f" · {note}" if note else ""), source_id=SOURCE_ID, fetched_at=fetched_at)

    for s in stats:
        if not s["rows"]:
            out.notes.append(f"sheet '{s['sheet']}': no data rows recognised")
            continue
        if s.get("foreign"):
            fig("rescued_foreign", s["rows"], note=f"sheet '{s['sheet']}'")
            for cty, n in s["country_counts"].items():
                fig("rescued_foreign", n, scope=f"nationality:{slugify(cty)}", note=cty)
        else:
            fig("rescued", s["rows"], note=f"sheet '{s['sheet']}'")
            for loc, n in s["location_counts"].items():
                pid = ctx.resolve(loc)
                out.hint(loc, pid, n, kind="dao_rescue_location")
                fig("rescued", n, scope=f"place:{pid or slugify(loc)}", note=f"DAO Nuwakot: {loc}")
    return out
