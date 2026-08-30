"""
normalisers/dhm_weather.py — DHM `mfd/api/*` → articles (bulletins) + weather_warning_level figure.
docs/pull_external_data/05-sources.md §dhm_weather.

Parts: three-days-forecast-latest (list of bulletins: id, title, issue_date, images),
country-forecast (analysis_en/np, en_text_1/2 = today/tomorrow, issue_date), weather (19
synoptic stations with per-day rain_probability), mountain/all-info (metadata only).
  articles  one per bulletin + one per country forecast (url = endpoint#id, unique per issue)
  figures   'DHM' weather_warning_level national (0 none · 1 moderate · 2 heavy · 3 very heavy)
            rain_probability_pct scope station:<slug> for day 1 of each synoptic station
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from lib.text import lang_of, nfc, slugify

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "dhm_weather"
PUBLISHER = "DHM"
LEVELS = [(3, re.compile(r"very\s+heavy", re.I)), (2, re.compile(r"\bheavy\b", re.I)), (1, re.compile(r"\bmoderate\b", re.I))]


def warning_level(text: str) -> int:
    for lvl, rx in LEVELS:
        if rx.search(text or ""):
            return lvl
    return 0


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        doc = p.json()
        if not p.ok or doc is None:
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        url = p.url or "https://dhm.gov.np/mfd/api/"
        if "three-days" in url and isinstance(doc, list):
            for b in doc[:6]:
                if not isinstance(b, dict) or not b.get("id"):
                    continue
                title = nfc(b.get("title") or "DHM three-day forecast")
                issued = parse_dt(b.get("issue_date"))
                out.article(url=f"{url}#{b['id']}", title=title[:500], publisher=PUBLISHER, lang=lang_of(title),
                            published_at=issued, body=nfc(b.get("description") or "") or None,
                            source_id=SOURCE_ID, fetched_at=fetched_at)
        elif "country-forecast" in url and isinstance(doc, dict):
            issued = parse_dt(doc.get("issue_date"))
            en = " ".join(nfc(doc.get(k) or "") for k in ("analysis_en", "en_text_1", "en_text_2")).strip()
            np_ = " ".join(nfc(doc.get(k) or "") for k in ("analysis_np", "np_text_1", "np_text_2")).strip()
            title = "DHM country forecast" + (f" · {issued.strftime('%d %b %H:%M UTC')}" if issued else "")
            out.article(url=f"{url}#{doc.get('id')}", title=title, publisher=PUBLISHER, lang="en", published_at=issued,
                        body=(en + ("\n\n" + np_ if np_ else ""))[:4000] or None, source_id=SOURCE_ID, fetched_at=fetched_at)
            lvl = warning_level(en)
            first = re.split(r"(?<=[.।])\s+", nfc(doc.get("en_text_1") or en))[0][:200]
            out.figure(publisher=PUBLISHER, metric="weather_warning_level", value=lvl, as_of=issued or fetched_at,
                       url="https://dhm.gov.np/mfd/", note=first or None, source_id=SOURCE_ID, fetched_at=fetched_at)
        elif url.rstrip("/").endswith("/weather") and isinstance(doc, dict):
            issued = parse_dt(doc.get("datetime")) or fetched_at
            for st in doc.get("stations") or []:
                name = st.get("name")
                mf = st.get("manual_forecast") or []
                day1 = next((d for d in mf if d.get("day") in (1, "1")), mf[0] if mf else None)
                if name and isinstance(day1, dict) and isinstance(day1.get("rain_probability"), (int, float)):
                    w = (day1.get("weather") or {}).get("name") if isinstance(day1.get("weather"), dict) else None
                    out.figure(publisher=PUBLISHER, metric="rain_probability_pct", value=day1["rain_probability"],
                               scope=f"station:{slugify(name)}", as_of=issued, url="https://dhm.gov.np/mfd/",
                               note=f"{name}" + (f" · {w}" if w else ""), source_id=SOURCE_ID, fetched_at=fetched_at)
        # mountain/all-info: reference lists only — nothing to keep
    return out
