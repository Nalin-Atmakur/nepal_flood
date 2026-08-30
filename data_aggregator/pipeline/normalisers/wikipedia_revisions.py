"""
normalisers/wikipedia_revisions.py — MediaWiki API for '2026 Nepal floods' → figures 'Wikipedia (unattributed)' + articles.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §wikipedia_revisions.
Two parts (sources.yaml url list): (a) prop=revisions|extlinks (ids, timestamps, sizes; every external link),
(b) the latest revision's wikitext. Figures (note 'do not cite · rev <id>', as_of = revision timestamp):
  revision_id · revisions_last_24h · dead / injured / missing from the infobox (`| deaths = 682+{{efn|675+ in Nepal, 7+ in China}}`
  → national = the Nepal share when the footnote gives one, else the headline number; country:china from the footnote).
Articles: every {{cite …|url=|title=|work=|date=}} in the wikitext whose url is also an extlink (archive copies skipped),
publisher = work/newspaper/website/publisher, else the domain; relevance gate per row.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any
from urllib.parse import urlparse

from lib.text import lang_of, nfc, to_int

from . import Context, NormalisedRows, parts
from ._common import parse_dt
from ._rss import is_relevant

SOURCE_ID = "wikipedia_revisions"
PUBLISHER = "Wikipedia (unattributed)"
PAGE_URL = "https://en.wikipedia.org/wiki/2026_Nepal_floods"
NOTE = "do not cite"
_INFOBOX_FIELDS = {"deaths": "dead", "fatalities": "dead", "injuries": "injured", "injured": "injured", "missing": "missing"}
_FIELD_RE = re.compile(r"^\|\s*(deaths|fatalities|injuries|injured|missing)\s*=\s*(.*)$", re.M)
_COUNTRY_RE = re.compile(r"([\d,]+)\+?\s*(?:{{small\|)?\(?\s*(?:in\s+)?(Nepal|China|Tibet)", re.I)
_CITE_RE = re.compile(r"{{\s*[Cc]ite\s+(?:web|news|press release|report|journal|magazine)\s*\|(.*?)}}", re.S)


def infobox_numbers(wikitext: str) -> dict[str, dict[str, int]]:
    """{'dead': {'national': 675, 'country:china': 7}, …} from the infobox lines."""
    out: dict[str, dict[str, int]] = {}
    for m in _FIELD_RE.finditer(wikitext):
        metric = _INFOBOX_FIELDS[m.group(1).lower()]
        raw = re.sub(r"<!--.*?-->", "", m.group(2))
        raw = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>", "", raw, flags=re.S)
        head = to_int(re.match(r"\s*([\d,]+)", raw).group(1)) if re.match(r"\s*([\d,]+)", raw) else None
        scopes: dict[str, int] = {}
        for n, country in _COUNTRY_RE.findall(raw):
            v = to_int(n)
            if v is None:
                continue
            scopes.setdefault("national" if country.lower() == "nepal" else "country:china", v)
        if "national" not in scopes and head is not None:
            scopes["national"] = head
        if scopes:
            out[metric] = scopes
    return out


def _cite_fields(inner: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    depth = 0
    cur = ""
    pieces: list[str] = []
    for ch in inner:
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        if ch == "|" and depth == 0:
            pieces.append(cur); cur = ""
        else:
            cur += ch
    pieces.append(cur)
    for piece in pieces:
        if "=" in piece:
            k, v = piece.split("=", 1)
            fields[k.strip().lower()] = re.sub(r"\[\[([^|\]]*\|)?([^\]]+)\]\]", r"\2", v).strip()
    return fields


def citations(wikitext: str) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for m in _CITE_RE.finditer(wikitext):
        f = _cite_fields(m.group(1))
        url, title = f.get("url", ""), nfc(f.get("title", "")).strip()
        if not url.startswith("http") or not title or url in seen or "web.archive.org" in url:
            continue
        seen.add(url)
        pub = f.get("work") or f.get("newspaper") or f.get("website") or f.get("publisher") or f.get("agency") or ""
        pub = re.sub(r"''+", "", pub).strip() or urlparse(url).netloc.removeprefix("www.")
        out.append({"url": url, "title": title, "publisher": pub, "date": f.get("date", "")})
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    gaz = ctx.gazetteer if ctx else None
    revs: list[dict[str, Any]] = []
    extlinks: set[str] = set()
    wikitext = ""
    content_rev: dict[str, Any] = {}
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        for page in ((doc.get("query") or {}).get("pages") or {}).values():
            for r in page.get("revisions") or []:
                slots = r.get("slots") or {}
                text = (slots.get("main") or {}).get("*") if isinstance(slots.get("main"), dict) else r.get("*")
                if text:
                    wikitext, content_rev = text, r
                else:
                    revs.append(r)
            for l in page.get("extlinks") or []:
                u = l.get("*") or l.get("url")
                if u:
                    extlinks.add(u)
    latest = content_rev or (revs[0] if revs else {})
    rev_id, rev_at = latest.get("revid"), parse_dt(latest.get("timestamp")) or fetched_at
    if rev_id:
        out.figure(publisher=PUBLISHER, metric="revision_id", value=rev_id, as_of=rev_at, url=PAGE_URL,
                   note=f"{NOTE} · latest revision · {latest.get('size') or len(wikitext)} bytes", source_id=SOURCE_ID, fetched_at=fetched_at)
    if revs:
        day_ago = fetched_at - timedelta(hours=24)
        n24 = sum(1 for r in revs if (parse_dt(r.get("timestamp")) or fetched_at) >= day_ago)
        out.figure(publisher=PUBLISHER, metric="revisions_last_24h", value=n24, as_of=fetched_at, url=PAGE_URL,
                   note=f"{NOTE} · of the {len(revs)} newest revisions listed", source_id=SOURCE_ID, fetched_at=fetched_at)
    for metric, scopes in infobox_numbers(wikitext).items():
        for scope, val in scopes.items():
            out.figure(publisher=PUBLISHER, metric=metric, value=val, scope=scope, as_of=rev_at, url=PAGE_URL,
                       note=f"{NOTE} · infobox · rev {rev_id}", source_id=SOURCE_ID, fetched_at=fetched_at)
    dropped = 0
    for c in citations(wikitext):
        if extlinks and c["url"] not in extlinks:
            continue
        if not is_relevant(c["title"], "", gaz):
            dropped += 1
            continue
        out.article(url=c["url"], title=c["title"][:500], publisher=c["publisher"][:120], lang=lang_of(c["title"]),
                    published_at=parse_dt(c["date"]), body=None, source_id=SOURCE_ID, fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"wikipedia: {dropped} citation(s) dropped by the relevance gate")
    return out
