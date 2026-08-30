"""
normalisers/nrcs_situation_updates.py — Nepal Red Cross Society situation updates (PDF) → figures + articles.
docs/pull_external_data/05d-sources-wave4.md §nrcs_situation_updates.

    nrcs.org (HTML) ─▶ links …/media/highlights/files/Rasuwa*Situation_Update_N.pdf, Press_release_*.pdf
                     ─▶ ctx.fetch (bytes) ─▶ pypdf text ─▶ parse_update(): dated figures + an article per PDF

The PDFs are text-layer PDFs (no OCR needed). Numbers the Red Cross quotes from NDRRMA carry the `_quoted`
suffix and a note, so they never compete with the primary publisher in figures_latest. No PII in these
documents (aggregate counts, hospital bed allocations, warehouse locations); nothing is uploaded to Storage.
"""
from __future__ import annotations

import io
import re
from datetime import datetime, timezone
from typing import Any

from . import Context, NormalisedRows, parts

SOURCE_ID = "nrcs_situation_updates"
PUBLISHER = "Nepal Red Cross"
MAX_PDFS = 6
PDF_RE = re.compile(r'https?://website-api\.nrcs\.org/media/highlights/files/[^"\'\s<>]+\.pdf', re.I)
UPDATE_RE = re.compile(r"Situation_Update_?(\d+)", re.I)
DATE_RE = re.compile(r"(\d{1,2})\s+(August|September)\s+2026", re.I)
MONTHS = {"august": 8, "september": 9}

# (pattern, metric, note) — first match wins; values are integers with thousands separators
FIGURE_PATTERNS: list[tuple[re.Pattern[str], str, str | None]] = [
    (re.compile(r"(\d[\d,]*)\s+dead\s+bodies", re.I), "dead_quoted", "quoting the NDRRMA situation report"),
    (re.compile(r"(\d[\d,]*)\s+are\s+still\s+missing", re.I), "missing_quoted", "quoting the NDRRMA situation report"),
    (re.compile(r"(\d[\d,]*)\s+people\s+have\s+been\s+rescued", re.I), "rescued_quoted", "quoting the NDRRMA situation report"),
    (re.compile(r"(\d[\d,]*)\s+personnel\s+from\s+the\s+Nepal\s+Army", re.I), "personnel_army_quoted", "quoting the NDRRMA situation report"),
    (re.compile(r"(\d[\d,]*)\s+from\s+the\s+Nepal\s+P\s*olice", re.I), "personnel_police_quoted", "quoting the NDRRMA situation report"),
    (re.compile(r"(\d[\d,]*)\s+from\s+the\s+Armed\s+Police", re.I), "personnel_apf_quoted", "quoting the NDRRMA situation report"),
    (re.compile(r"(\d[\d,]*)\s+volunteers", re.I), "nrcs_volunteers", None),
    (re.compile(r"(\d[\d,]*)\s+ambulances", re.I), "ambulances_deployed", None),
    (re.compile(r"(\d[\d,]*)\s+(?:families|households)", re.I), "families_reached", None),
    (re.compile(r"(\d[\d,]*)\s*\n?\s*people\s+in\s+Nuwakot", re.I), "people_sheltering_nuwakot", None),
]


def pdf_text(body: bytes) -> str:
    """Text layer of a PDF (pypdf); empty string when the file has none."""
    from pypdf import PdfReader  # imported lazily: only this normaliser needs it

    try:
        reader = PdfReader(io.BytesIO(body))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:  # noqa: BLE001 — a broken PDF is a note, not a crash
        return ""


def _int(s: str) -> int | None:
    try:
        return int(s.replace(",", ""))
    except ValueError:
        return None


def parse_update(text: str) -> dict[str, Any]:
    """Pure: PDF text → {"as_of", "figures": [(metric, value, note)], "excerpt"}."""
    flat = re.sub(r"[ \t]+", " ", text or "")
    dates = [(int(d), MONTHS[m.lower()]) for d, m in DATE_RE.findall(flat)]
    as_of = None
    if dates:
        day, month = max(dates, key=lambda t: (t[1], t[0]))
        as_of = datetime(2026, month, day, 6, 15, tzinfo=timezone.utc)  # noon NPT
    figures: list[tuple[str, int, str | None]] = []
    seen: set[str] = set()
    for pat, metric, note in FIGURE_PATTERNS:
        m = pat.search(flat)
        if not m or metric in seen:
            continue
        v = _int(m.group(1))
        if v is None:
            continue
        seen.add(metric)
        figures.append((metric, v, note))
    excerpt = re.sub(r"\s*\n\s*", "\n", flat).strip()[:3000]
    return {"as_of": as_of, "figures": figures, "excerpt": excerpt}


def pdf_links(html: str) -> list[str]:
    """Situation-update and press-release PDFs on the page, newest update first, at most MAX_PDFS."""
    links = sorted(set(PDF_RE.findall(html or "")))
    keep = [u for u in links if "situation_update" in u.lower() or "press_release" in u.lower()]

    def key(u: str) -> tuple[int, int]:
        m = UPDATE_RE.search(u)
        return (1, int(m.group(1))) if m else (0, 0)

    return sorted(keep, key=key, reverse=True)[:MAX_PDFS]


def _title(url: str) -> str:
    m = UPDATE_RE.search(url)
    if m:
        return f"NRCS Rasuwa flood situation update #{m.group(1)}"
    return "NRCS press release: " + url.rsplit("/", 1)[-1].replace("_", " ").rsplit(".", 1)[0]


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    links: list[str] = []
    for p in parts(raw):
        if not p.ok:
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        links += pdf_links(p.body)
    links = list(dict.fromkeys(links))[:MAX_PDFS]
    if not links:
        out.notes.append("no situation-update PDFs linked from the page")
        return out
    if ctx is None or ctx.fetch is None:
        out.notes.append(f"{len(links)} PDF link(s) found; no fetch context, nothing parsed")
        return out
    for url in links:
        f = ctx.fetch(url)
        body = getattr(f, "body", b"") or b""
        if getattr(f, "error", None) or not (200 <= int(getattr(f, "status", 0) or 0) < 300) or not body:
            out.notes.append(f"{url}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            continue
        text = pdf_text(body)
        if not text.strip():
            out.notes.append(f"{url}: no text layer")
            continue
        parsed = parse_update(text)
        as_of = parsed["as_of"] or fetched_at
        is_update = bool(UPDATE_RE.search(url))
        if is_update:
            for metric, value, note in parsed["figures"]:
                out.figure(publisher=PUBLISHER, metric=metric, value=value, scope="national", as_of=as_of, url=url,
                           note=note, source_id=SOURCE_ID, fetched_at=fetched_at)
        out.article(url=url, title=_title(url), publisher=PUBLISHER, lang="en", published_at=as_of,
                    body=parsed["excerpt"] or None, source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
