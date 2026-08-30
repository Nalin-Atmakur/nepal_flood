"""
normalisers/mofa_flashflood.py — MoFA flash-flood category page → figures 'MoFA' + articles.
docs/pull_external_data/05-sources.md §mofa_flashflood.

    category HTML ─▶ links "Latest Updates on Flash Floods…" / "Press Briefing … Flood"
                  ─▶ ctx.fetch (newest 3) ─▶ per page:
        "So far, N bodies have been recovered"                     → dead
        "out of N people from K countries, F found and M missing"  → foreigners_total/found/missing
        "about N people are still unaccounted for"                 → missing (note approx)
        "Over N people have been rescued"                          → rescued
        nationality table (COUNTRY · NO. OF PERSON · FOUND · STILL MISSING) → nationality:<slug>
    as_of from "(As of 15:30 hrs NST on 28 August 2026)" / "2:00 PM, 29 August 2026" / title date.
When a day's update is an image (29 Aug), only the article row is produced — no OCR.
"""
from __future__ import annotations

import html as _html
import re
from datetime import datetime
from typing import Any

from lib import config
from lib.text import lang_of, nfc, slugify, to_int

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "mofa_flashflood"
PUBLISHER = "MoFA"
BASE = "https://mofa.gov.np"
LINK_RE = re.compile(r'href="((?:https?://mofa\.gov\.np)?/content/(\d+)/[^"]*)"[^>]*>\s*([^<]{3,200}?)\s*<', re.I)
TITLE_KEEP = re.compile(r"flash\s*flood|bhote\s*koshi|flood", re.I)
ASOF_RES = [
    re.compile(r"as\s+of\s+(\d{1,2}[:.]\d{2})\s*(?:hrs?|hours)?\s*(?:NST|NPT)?\s*(?:on\s+)?(\d{1,2}\s+\w+\s+\d{4})", re.I),
    re.compile(r"(\d{1,2}[:.]\d{2}\s*(?:AM|PM))\s*,?\s*(\d{1,2}\s+\w+\s+\d{4})", re.I),
]
DATE_RE = re.compile(r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})", re.I)


def find_update_links(category_html: str) -> list[tuple[str, str, int]]:
    links: dict[int, tuple[str, str, int]] = {}
    for m in LINK_RE.finditer(category_html):
        href, cid, title = m.group(1), int(m.group(2)), _html.unescape(m.group(3)).strip()
        if not TITLE_KEEP.search(title) or "procedure" in title.lower():
            continue
        url = href if href.startswith("http") else BASE + href
        links[cid] = (url, title, cid)
    return sorted(links.values(), key=lambda t: -t[2])


def parse_as_of(text: str, title: str) -> datetime | None:
    for rx in ASOF_RES:
        m = rx.search(text)
        if m:
            dt = parse_dt(f"{m.group(2)} {m.group(1).replace('.', ':')}", default_tz=config.KTM)
            if dt:
                return dt
    m = DATE_RE.search(title) or DATE_RE.search(text[:3000])
    return parse_dt(m.group(1) + " 17:00", default_tz=config.KTM) if m else None


def parse_update_page(html_text: str, *, url: str, fetched_at: datetime) -> NormalisedRows:
    out = NormalisedRows()
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html_text, re.S)
    title = strip_tags(h1.group(1)) if h1 else "MoFA flash flood update"
    body = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html_text, flags=re.S | re.I)
    text = strip_tags(body)
    text_1l = re.sub(r"\s+", " ", text)
    as_of = parse_as_of(text_1l, title) or fetched_at
    out.article(url=url, title=title[:500], publisher=PUBLISHER, lang=lang_of(title), published_at=as_of,
                body=None, source_id=SOURCE_ID, fetched_at=fetched_at)

    def fig(metric: str, value: int | None, scope: str = "national", note: str | None = None) -> None:
        if value is not None:
            out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=as_of, url=url,
                       note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    m = re.search(r"(?:so far,?\s*)?([\d,]+)\s+(?:dead\s+)?bodies\s+have\s+been\s+recovered", text_1l, re.I)
    if m:
        fig("dead", to_int(m.group(1)), note="bodies recovered")
    m = re.search(r"out\s+of\s+([\d,]+)\s+people\s+from\s+([\d,]+)\s+countries,?\s+([\d,]+)\s+have\s+been\s+found\s+and\s+([\d,]+)\s+are\s+still\s+missing", text_1l, re.I)
    if m:
        fig("foreigners_total", to_int(m.group(1)), note=f"{m.group(2)} countries")
        fig("foreigners_found", to_int(m.group(3)))
        fig("foreigners_missing", to_int(m.group(4)))
    m = re.search(r"(?:about|around|approximately)?\s*([\d,]+)\s+people\s+are\s+still\s+unaccounted\s+for", text_1l, re.I)
    if m:
        fig("missing", to_int(m.group(1)), note="unaccounted for (approx.)")
    m = re.search(r"(?:over|more than)?\s*([\d,]+)\s+people\s+have\s+been\s+rescued", text_1l, re.I)
    if m:
        fig("rescued", to_int(m.group(1)))
    # nationality table
    for table in re.findall(r"<table.*?</table>", body, re.S | re.I):
        rows = [[strip_tags(c) for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.S | re.I)]
                for r in re.findall(r"<tr.*?</tr>", table, re.S | re.I)]
        if not rows:
            continue
        header = [c.upper() for c in rows[0]]
        if not any("COUNTRY" in c for c in header):
            # the 3-row summary table: FOREIGNER/MISSING/FOUND
            for r in rows:
                if len(r) >= 2:
                    k, v = r[0].strip().upper(), to_int(r[1])
                    if k.startswith("FOREIGNER"):
                        fig("foreigners_total", v, note="summary table")
                    elif k.startswith("MISSING"):
                        fig("foreigners_missing", v, note="summary table")
                    elif k.startswith("FOUND"):
                        fig("foreigners_found", v, note="summary table")
            continue
        ci = next(i for i, c in enumerate(header) if "COUNTRY" in c)
        idx = {"foreigners_total": None, "foreigners_found": None, "foreigners_missing": None}
        for i, c in enumerate(header):
            if "PERSON" in c or "TOTAL" in c:
                idx["foreigners_total"] = i
            elif "FOUND" in c:
                idx["foreigners_found"] = i
            elif "MISSING" in c:
                idx["foreigners_missing"] = i
        for r in rows[1:]:
            if len(r) <= ci:
                continue
            country = nfc(r[ci]).strip()
            if not country or country.upper() == "TOTAL":
                continue
            scope = f"nationality:{slugify(country)}"
            for metric, i in idx.items():
                if i is not None and i < len(r):
                    fig(metric, to_int(r[i]), scope=scope, note=country)
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    cat = parts(raw)[0]
    if not cat.ok:
        out.notes.append(f"category page: {cat.error or cat.status}")
        return out
    links = find_update_links(cat.body)
    if not links:
        out.notes.append("no flash-flood update links found on the category page")
        return out
    for url, title, cid in links[:3]:
        if ctx is None or ctx.fetch is None:
            out.article(url=url, title=title, publisher=PUBLISHER, lang="en", published_at=None,
                        source_id=SOURCE_ID, fetched_at=fetched_at)
            continue
        f = ctx.fetch(url)
        if not getattr(f, "ok", False):
            out.notes.append(f"{url}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            continue
        out.extend(parse_update_page(f.text, url=url, fetched_at=fetched_at))
    return out
