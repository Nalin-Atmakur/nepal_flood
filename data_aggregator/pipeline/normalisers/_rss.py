"""Shared RSS → articles logic for reliefweb_rss and outlet_rss_set (not registered as a source)."""
from __future__ import annotations

from datetime import datetime, timezone
from urllib.parse import urlparse

import feedparser

from lib import config
from lib.text import lang_of, nfc

from . import NormalisedRows, Part
from ._common import strip_tags

_default_gaz = None


def _gazetteer(gaz=None):
    """The gazetteer used for the place half of the gate (DB-loaded one when the caller has it)."""
    global _default_gaz
    if gaz is not None:
        return gaz
    if _default_gaz is None:
        from lib.places import Gazetteer
        _default_gaz = Gazetteer.builtin()
    return _default_gaz


GENERIC_PLACE_IDS = {"kathmandu", "bharatpur", "pokhara_pahs", "tuth_kathmandu", "trauma_center_kathmandu", "bharatpur_body_centre"}


def is_relevant(title: str | None, summary: str | None = None, gaz=None) -> bool:
    """
    The relevance gate for every `articles` row (docs/pull_external_data/04-normalising.md §relevance):
    keep when title+summary matches config.ARTICLE_RELEVANCE_KEYWORDS (EN/NE/HI/ZH event vocabulary)
    OR resolves to a gazetteer place. General-feed items ("China's record robotic strides…") are dropped.
    """
    text = f"{nfc(title)} {nfc(summary)}".strip()
    if not text:
        return False
    if config.ARTICLE_RELEVANCE_KEYWORDS.search(text):
        return True
    # A place mention alone counts only for corridor-specific places: district names and the big
    # destination cities (Kathmandu, Bharatpur, Pokhara) appear in general news every day.
    for m in _gazetteer(gaz).resolve_all(text):
        if m.kind != "district" and m.place_id not in GENERIC_PLACE_IDS:
            return True
    return False

PUBLISHERS = {
    "onlinekhabar.com": "Onlinekhabar", "english.onlinekhabar.com": "Onlinekhabar English",
    "kathmandupost.com": "Kathmandu Post", "english.khabarhub.com": "Khabarhub", "khabarhub.com": "Khabarhub",
    "risingnepaldaily.com": "The Rising Nepal", "english.nepalnews.com": "Nepalnews", "nepalnews.com": "Nepalnews",
    "radionepalonline.com": "Radio Nepal", "english.ratopati.com": "Ratopati English", "ratopati.com": "Ratopati",
    "annapurnapost.com": "Annapurna Post", "gorkhapatraonline.com": "Gorkhapatra", "newsofnepal.com": "News of Nepal",
    "bbc.com": "BBC Nepali", "bbc.co.uk": "BBC Nepali", "nepalitimes.com": "Nepali Times",
    "reliefweb.int": "ReliefWeb", "thehimalayantimes.com": "The Himalayan Times", "setopati.com": "Setopati",
    "ekantipur.com": "Kantipur", "myrepublica.nagariknetwork.com": "Republica",
}
HINDI_DOMAINS = {"jagran.com", "bhaskar.com", "amarujala.com", "navbharattimes.indiatimes.com"}


def publisher_for(link: str, feed_title: str | None) -> str:
    host = urlparse(link or "").netloc.lower()
    host = host[4:] if host.startswith("www.") else host
    if host in PUBLISHERS:
        return PUBLISHERS[host]
    parts = host.split(".")
    for i in range(len(parts) - 1):
        cand = ".".join(parts[i:])
        if cand in PUBLISHERS:
            return PUBLISHERS[cand]
    return nfc(feed_title).strip() or host or "unknown"


def entry_datetime(e) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        st = e.get(key)
        if st:
            try:
                return datetime(*st[:6], tzinfo=timezone.utc)
            except (TypeError, ValueError):
                continue
    return None


def feed_to_articles(part: Part, *, source_id: str, fetched_at: datetime, max_items: int = 200,
                     include_summary: bool = True, gaz=None) -> NormalisedRows:
    out = NormalisedRows()
    dropped = 0
    if not part.ok or not part.body.strip():
        out.notes.append(f"{part.url}: {part.error or part.status}")
        return out
    feed = feedparser.parse(part.body)
    feed_title = (feed.feed.get("title") or "") if getattr(feed, "feed", None) else ""
    host = urlparse(part.url or "").netloc.lower()
    hint = "hi" if any(h in host for h in HINDI_DOMAINS) else None
    for e in feed.entries[:max_items]:
        link = (e.get("link") or "").strip()
        title = nfc(e.get("title") or "").strip()
        if not link or not title:
            continue
        summary = strip_tags(e.get("summary") or e.get("description") or "") if include_summary else ""
        # ReliefWeb summaries are boilerplate tags + a paragraph: keep only the paragraph
        if "reliefweb.int" in host:
            summary = "\n".join(l for l in summary.splitlines() if not l.strip().lower().startswith(("country:", "source:", "format:", "please refer")))
        if not is_relevant(title, summary, gaz):
            dropped += 1
            continue
        pub = publisher_for(link, feed_title)
        if "reliefweb.int" in host and e.get("author"):
            pub = f"{nfc(e.get('author')).strip()} (via ReliefWeb)"
        out.article(url=link, title=title[:500], publisher=pub, lang=lang_of(title + " " + summary[:200], hint=hint),
                    published_at=entry_datetime(e), body=(summary[:2000] or None), source_id=source_id,
                    fetched_at=fetched_at)
    if dropped:
        out.notes.append(f"{host}: {dropped} off-topic item(s) dropped by the relevance gate")
    return out
