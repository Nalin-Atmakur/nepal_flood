"""
normalisers/reliefweb_reports.py — ReliefWeb report pages (OCHA flash updates, UN RC/HCT sitreps, WFP/IOM/NRCS
updates) → full-text articles + quoted headline figures.
docs/pull_external_data/05d-sources-wave4.md §reliefweb_reports.

    updates/rss.xml?search=rasuwa ─▶ newest MAX_REPORTS /report/ links ─▶ ctx.fetch (HTML)
        ─▶ parse_report(): JSON-LD headline/datePublished/abstract, source organisation, <article> text
        ─▶ article (body ≤ 8,000 chars) + figures *_quoted (publisher "<org> (via ReliefWeb)")

reliefweb_rss keeps the feed summaries; this id adds the bodies (the per-district and per-site numbers live
there), which the place resolver, the digest and the per-place "now" line can use. The ReliefWeb API itself is
closed to unregistered apps (v1 410, v2 403), so the public HTML is the only route.
"""
from __future__ import annotations

import html as htmlmod
import json
import re
from datetime import datetime
from typing import Any

import feedparser

from lib.text import nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "reliefweb_reports"
MAX_REPORTS = 8
MAX_BODY = 8000
JSONLD_RE = re.compile(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', re.S | re.I)
ORG_RE = re.compile(r'<a[^>]+href="/organization/[^"]+"[^>]*>([^<]{2,120})</a>', re.I)
ARTICLE_RE = re.compile(r"<article\b.*?</article>", re.S | re.I)
FIGURE_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"(\d[\d,]*)\s+(?:people\s+|persons\s+)?(?:dead|deaths|killed|fatalities|bodies)", re.I), "dead_quoted"),
    (re.compile(r"(\d[\d,]*)\s+(?:people\s+|persons\s+)?(?:missing|unaccounted)", re.I), "missing_quoted"),
    (re.compile(r"(\d[\d,]*)\s+(?:people\s+|persons\s+)?rescued", re.I), "rescued_quoted"),
    (re.compile(r"(\d[\d,]*)\s+(?:people\s+|persons\s+)?injured", re.I), "injured_quoted"),
    (re.compile(r"(\d[\d,]*)\s+(?:people\s+|persons\s+)?displaced", re.I), "displaced_quoted"),
]


def report_links(rss_text: str, limit: int = MAX_REPORTS) -> list[str]:
    feed = feedparser.parse(rss_text or "")
    links: list[str] = []
    for e in feed.entries:
        link = (e.get("link") or "").strip()
        if "/report/" in link and link not in links:
            links.append(link)
    return links[:limit]


def _jsonld(html: str) -> dict[str, Any]:
    for m in JSONLD_RE.finditer(html or ""):
        try:
            doc = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        docs = doc if isinstance(doc, list) else [doc]
        for d in docs:
            if isinstance(d, dict) and (d.get("headline") or d.get("datePublished")):
                return d
    return {}


def _int(s: str) -> int | None:
    try:
        return int(s.replace(",", ""))
    except ValueError:
        return None


def parse_report(html: str, url: str) -> dict[str, Any]:
    """Pure: report page → {"title", "published_at", "org", "body", "figures": [(metric, value)]}."""
    ld = _jsonld(html)
    title = nfc(htmlmod.unescape(str(ld.get("headline") or ""))).strip()
    if not title:
        m = re.search(r"<title>(.*?)</title>", html or "", re.S | re.I)
        title = strip_tags(m.group(1)).replace(" - Nepal | ReliefWeb", "").strip() if m else url
    published = parse_dt(str(ld.get("datePublished"))) if ld.get("datePublished") else None
    org_m = ORG_RE.search(html or "")
    org = strip_tags(org_m.group(1)).strip() if org_m else None
    art = ARTICLE_RE.search(html or "")
    body = strip_tags(art.group(0) if art else (html or ""))
    body = re.sub(r"[ \t]+", " ", body)
    body = re.sub(r"\s*\n\s*", "\n", body).strip()
    abstract = nfc(htmlmod.unescape(str(ld.get("abstract") or ""))).strip()
    if abstract and abstract[:80] not in body[:2000]:
        body = abstract + "\n\n" + body
    body = body[:MAX_BODY]
    figures: list[tuple[str, int]] = []
    seen: set[str] = set()
    for pat, metric in FIGURE_PATTERNS:
        m = pat.search(body)
        if not m or metric in seen:
            continue
        v = _int(m.group(1))
        if v is None:
            continue
        seen.add(metric)
        figures.append((metric, v))
    return {"title": title[:500], "published_at": published, "org": org, "body": body, "figures": figures}


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    links: list[str] = []
    for p in parts(raw):
        if not p.ok:
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        links += report_links(p.body)
    links = list(dict.fromkeys(links))[:MAX_REPORTS]
    if not links:
        out.notes.append("no report links in the feed")
        return out
    if ctx is None or ctx.fetch is None:
        out.notes.append(f"{len(links)} report link(s); no fetch context")
        return out
    for url in links:
        f = ctx.fetch(url)
        body = getattr(f, "body", b"") or b""
        if getattr(f, "error", None) or not (200 <= int(getattr(f, "status", 0) or 0) < 300) or not body:
            out.notes.append(f"{url}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            continue
        rep = parse_report(body.decode("utf-8", errors="replace"), url)
        publisher = f"{rep['org']} (via ReliefWeb)" if rep["org"] else "ReliefWeb"
        published = rep["published_at"] or fetched_at
        out.article(url=url, title=rep["title"], publisher=publisher, lang="en", published_at=published,
                    body=rep["body"] or None, source_id=SOURCE_ID, fetched_at=fetched_at)
        for metric, value in rep["figures"]:
            out.figure(publisher=publisher, metric=metric, value=value, scope="national", as_of=published, url=url,
                       note=f"as written in “{rep['title'][:80]}”", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
