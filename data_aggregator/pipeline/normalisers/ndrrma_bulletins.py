"""
normalisers/ndrrma_bulletins.py — NDRRMA Daily Disaster Bulletins (national incident table) → articles + one figure.
docs/pull_external_data/05a-sources-wave2-official.md §ndrrma_bulletins.

    /api/v1/bulletin/bulletins/?ordering=-id&limit=5  {count, results:[{id, title "Daily Disaster Bulletin (27 August 2026)",
    title_ne, date (publication day), summary (EN prose), summary_ne, pdffile, image, bulletin_type{…}}]}
articles: url = pdffile, title, published_at = the day in the title (10:00 NPT; else `date`), body = summary.
figures 'NDRRMA': disaster_incidents_24h from "Over the past 24 hours, N disaster-related incidents" (as_of = that day).
The PDFs are not fetched (the national incident table is not corridor-specific).
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from lib import config
from lib.text import nfc, to_int

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "ndrrma_bulletins"
PUBLISHER = "NDRRMA"
DAY_RE = re.compile(r"\((\d{1,2}\s+\w+\s+\d{4})\)")
INCIDENTS_RE = re.compile(r"past\s+24\s+hours,?\s*([\d,]+)\s+disaster[- ]related\s+incidents", re.I)


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    rows: list[dict[str, Any]] = []
    for p in parts(raw):
        doc = p.json()
        if p.ok and isinstance(doc, dict):
            rows.extend(r for r in (doc.get("results") or []) if isinstance(r, dict))
        elif not p.ok:
            out.notes.append(f"{p.url}: {p.error or p.status}")
    if not rows:
        out.notes.append("bulletins: no results")
        return out
    for r in rows:
        title = nfc(r.get("title") or r.get("title_ne") or "").strip()
        url = r.get("pdffile") or r.get("image")
        if not title or not url:
            continue
        dm = DAY_RE.search(title)
        day = parse_dt(dm.group(1) + " 10:00", default_tz=config.KTM) if dm else None
        published = day or parse_dt(str(r.get("date") or "") + " 10:00", default_tz=config.KTM)
        summary = nfc(r.get("summary") or r.get("summary_ne") or "").strip()
        out.article(url=url, title=title[:500], publisher=PUBLISHER, lang="en" if r.get("title") else "ne",
                    published_at=published, body=summary[:2000] or None, source_id=SOURCE_ID, fetched_at=fetched_at)
        im = INCIDENTS_RE.search(summary)
        if im and published:
            out.figure(publisher=PUBLISHER, metric="disaster_incidents_24h", value=to_int(im.group(1)), scope="national",
                       as_of=published, url=url, note=f"bulletin {r.get('id')}: {title}", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
