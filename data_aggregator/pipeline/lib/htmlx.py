"""
lib/htmlx.py — HTML helpers for the wave-2 geospatial/text scrapers (lib/html.py belongs to the official-sources lane).
See docs/pull_external_data/05b-sources-wave2-geospatial-text.md. No external parser: the pages are large and the markup
we need is shallow, so regexes over the raw body are enough.

    json_ld(html)              every JSON-LD object on the page (lists and @graph flattened)
    live_blog_posts(html)      LiveBlogPosting.liveBlogUpdate[] → [{headline, body, published_at, modified_at, url, id,
                               publisher}] — BBC, CNN, NBC, Guardian and ABC all emit it; authors are never read
    strip_tags(html)           text without tags, entities decoded, whitespace collapsed
    first_sentence(text, n)    first sentence, cut to n chars on a word boundary
    links(html)                [(href, anchor text)] for every <a>
    iso_dt(s)                  ISO-8601 (Z / ±hh:mm / ±hhmm / long fractions) → aware UTC datetime
"""
from __future__ import annotations

import html as _html
import json
import re
from datetime import datetime, timezone
from typing import Any

_LD_RE = re.compile(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.S | re.I)
_A_RE = re.compile(r'<a\s[^>]*?href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.S | re.I)
_SENT_END = re.compile(r"(?<=[.!?।。！？])\s+")


def iso_dt(s: str | None) -> datetime | None:
    if not s or not isinstance(s, str):
        return None
    t = s.strip().replace("Z", "+00:00")
    t = re.sub(r"(\.\d{6})\d+", r"\1", t)
    t = re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", t)
    try:
        d = datetime.fromisoformat(t)
    except ValueError:
        return None
    return d.replace(tzinfo=timezone.utc) if d.tzinfo is None else d.astimezone(timezone.utc)


def strip_tags(s: str | None) -> str:
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s or "", flags=re.S | re.I)
    t = re.sub(r"<br\s*/?>|</p>|</div>|</li>|</h\d>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = _html.unescape(t)
    t = re.sub(r"[ \t\r\f\v ]+", " ", t)
    t = re.sub(r"\s*\n\s*", "\n", t)
    return t.strip()


def first_sentence(text: str | None, limit: int = 140) -> str:
    t = re.sub(r"\s+", " ", strip_tags(text)).strip(" •-–—")
    if not t:
        return ""
    first = _SENT_END.split(t, maxsplit=1)[0].strip()
    if len(first) <= limit:
        return first
    cut = first[:limit].rsplit(" ", 1)[0].rstrip(" ,;:")
    return (cut or first[:limit]) + "…"


def links(html: str | None) -> list[tuple[str, str]]:
    return [(_html.unescape(h), strip_tags(t)) for h, t in _A_RE.findall(html or "")]


def _flatten(obj: Any, out: list[dict[str, Any]]) -> None:
    if isinstance(obj, list):
        for o in obj:
            _flatten(o, out)
    elif isinstance(obj, dict):
        if isinstance(obj.get("@graph"), list):
            _flatten(obj["@graph"], out)
        out.append(obj)


def json_ld(html: str | None) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for block in _LD_RE.findall(html or ""):
        try:
            _flatten(json.loads(_html.unescape(block) if "&quot;" in block[:200] else block), out)
        except json.JSONDecodeError:
            continue
    return out


def _name(v: Any) -> str | None:
    if isinstance(v, dict):
        return v.get("name") or None
    if isinstance(v, list) and v:
        return _name(v[0])
    return str(v) if isinstance(v, str) and v else None


def live_blog_posts(html: str | None) -> list[dict[str, Any]]:
    """Every BlogPosting under a LiveBlogPosting, in page order (authors are never read)."""
    posts: list[dict[str, Any]] = []
    for obj in json_ld(html):
        if obj.get("@type") != "LiveBlogPosting":
            continue
        publisher = _name(obj.get("publisher"))
        page_urls = {str(v).rstrip("/") for v in (obj.get("url"), obj.get("@id"), obj.get("mainEntityOfPage")) if isinstance(v, str)}
        page_headline = strip_tags(obj.get("headline") or "")
        for u in obj.get("liveBlogUpdate") or []:
            if not isinstance(u, dict):
                continue
            cands = [u.get("@id"), u.get("url"), u.get("mainEntityOfPage")]      # @id is the per-post permalink on BBC/ABC
            cands = [c.get("url") or c.get("@id") if isinstance(c, dict) else c for c in cands]
            # a candidate equal to the page itself (the Guardian's mainEntityOfPage, NBC's url) is not a post permalink
            url = next((c for c in cands if isinstance(c, str) and c.startswith("http") and c.rstrip("/") not in page_urls), None)
            raw_id = u.get("@id") if isinstance(u.get("@id"), str) else None
            headline = strip_tags(u.get("headline") or "")
            if headline and headline == page_headline:                          # the Guardian repeats the page headline per post
                headline = ""
            posts.append({
                "headline": headline or None,
                "body": strip_tags(u.get("articleBody") or u.get("description") or ""),
                "published_at": iso_dt(u.get("datePublished")),
                "modified_at": iso_dt(u.get("dateModified")),
                "url": url,
                "id": raw_id,                                   # e.g. the Guardian's bare block id
                "publisher": _name(u.get("publisher")) or publisher,
            })
    return posts
