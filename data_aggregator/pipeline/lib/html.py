"""
lib/html.py — tiny HTML helpers shared by the wave-2 HTML normalisers (no parser dependency).
See docs/pull_external_data/05a-sources-wave2-official.md.

    absolutize(base, href)          './202608/x.html' + listing url → absolute url
    meta_content(html, name)        <meta name="PubDate" content="…"> → '…' | None
    php_uniqid_datetime(token)      PHP uniqid() hex ('6a92d3a8c004d') → UTC datetime of the upload | None
    tbody_rows(html)                the <tr>…</tr> blocks of the first <tbody> that hold a <td>
    text_nodes_masked(fragment)     debugging aid: every text node ≥ 2 chars → 'TXT<n>' (never PII)
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from urllib.parse import urljoin

_META_RE_CACHE: dict[str, re.Pattern[str]] = {}


def absolutize(base: str, href: str | None) -> str:
    return urljoin(base, (href or "").strip())


def meta_content(html: str, name: str) -> str | None:
    rx = _META_RE_CACHE.get(name)
    if rx is None:
        rx = re.compile(r'<meta\s+name="' + re.escape(name) + r'"\s+content="([^"]*)"', re.I)
        _META_RE_CACHE[name] = rx
    m = rx.search(html or "")
    return m.group(1).strip() if m else None


def php_uniqid_datetime(token: str | None, *, lo: int = 1_700_000_000, hi: int = 1_900_000_000) -> datetime | None:
    """
    PHP `uniqid()` is 8 hex chars of unix seconds + 5 hex chars of microseconds. Upload file names built
    from it (HEOC: `uploads/newsEvent/image/6a92d3a8c004d.webp`) therefore carry the upload time.
    Returns None unless the decoded time is plausible (2023–2030).
    """
    m = re.search(r"([0-9a-f]{13})", token or "", re.I)
    if not m:
        return None
    try:
        secs = int(m.group(1)[:8], 16)
    except ValueError:
        return None
    if not (lo <= secs <= hi):
        return None
    return datetime.fromtimestamp(secs, tz=timezone.utc)


def tbody_rows(html: str) -> list[str]:
    m = re.search(r"<tbody[^>]*>([\s\S]*?)</tbody>", html or "", re.I)
    if not m:
        return []
    return [r for r in re.findall(r"<tr[^>]*>[\s\S]*?</tr>", m.group(1), re.I) if re.search(r"<td", r, re.I)]


def text_nodes_masked(fragment: str) -> str:
    return re.sub(r">([^<]{2,})<", lambda mm: ">TXT" + str(len(mm.group(1))) + "<", fragment or "")
