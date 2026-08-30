"""
normalisers/live_blogs.py — BBC / CNN / NBC / Guardian / ABC live pages → one article per timestamped post.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §live_blogs.
Every page embeds schema.org LiveBlogPosting.liveBlogUpdate[] (lib.htmlx.live_blog_posts). title = the post headline
when the outlet gives one, else the first sentence of the post (≤ 140 chars); url = the post's own url (the Guardian's
block id → ?page=with:block-<id>#block-<id>), else <page>#post-<hash>; publisher from the JSON-LD publisher (domain fallback); published_at = datePublished; only posts passing the
relevance gate. Authors are never read.
"""
from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Any
from urllib.parse import urlparse

from lib.htmlx import first_sentence, live_blog_posts

from . import Context, NormalisedRows, parts
from ._rss import is_relevant

SOURCE_ID = "live_blogs"
DOMAIN_PUBLISHER = {"bbc.com": "BBC News", "bbc.co.uk": "BBC News", "cnn.com": "CNN", "nbcnews.com": "NBC News",
                    "theguardian.com": "The Guardian", "abc.net.au": "ABC News (Australia)"}


def publisher_for(page_url: str, given: str | None) -> str:
    host = urlparse(page_url or "").netloc.lower().removeprefix("www.")
    for dom, name in DOMAIN_PUBLISHER.items():
        if host.endswith(dom):
            return name
    return given or host or "live blog"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    gaz = ctx.gazetteer if ctx else None
    dropped = 0
    for p in parts(raw):
        if not p.ok or not p.body.strip():
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        posts = live_blog_posts(p.body)
        if not posts:
            out.notes.append(f"{p.url}: no LiveBlogPosting updates found")
            continue
        seen: set[str] = set()
        for i, post in enumerate(posts):
            body = post["body"] or ""
            title = post["headline"] or first_sentence(body, 140)
            if not title:
                continue
            url = post["url"]
            if not url and post.get("id") and "theguardian.com" in (p.url or ""):
                url = f"{p.url}?page=with:block-{post['id']}#block-{post['id']}"       # the Guardian's block permalink
            if not url or url.rstrip("/") == (p.url or "").rstrip("/") or not any(ch in url for ch in "?#"):
                # page-level url only (NBC) → a stable per-post anchor from time + title
                digest = hashlib.sha1(f"{post['published_at']}|{title}".encode("utf-8")).hexdigest()[:10]
                url = f"{p.url}#post-{digest}"
            if url in seen:
                continue
            if not is_relevant(title, body[:600], gaz):
                dropped += 1
                continue
            seen.add(url)
            out.article(url=url, title=title[:500], publisher=publisher_for(p.url, post["publisher"]), lang="en",
                        published_at=post["published_at"] or post["modified_at"], body=(body[:2000] or None),
                        source_id=SOURCE_ID, fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"live blogs: {dropped} post(s) dropped by the relevance gate")
    return out
