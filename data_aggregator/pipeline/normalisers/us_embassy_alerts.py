"""
normalisers/us_embassy_alerts.py — U.S. Embassy Kathmandu "Alerts" archive → articles.
docs/pull_external_data/05a-sources-wave2-official.md §us_embassy_alerts.

WordPress archive; each `.archiveblock` has <h2 class="entry-date">August 29, 2026</h2> and
<h2 class="entry-title"><a href=…>title</a></h2>. Needs the browser UA (lib.http sends one).
Alerts dated from the day before the event are fetched once (state key 'pages') for their body — the
text after the `meta-info-top` marker up to "Assistance:" (so the contact block with phone numbers stays
out), PII-redacted, ≤ 2000 chars — because titles such as "Natural Disaster Alert: U.S. Embassy Kathmandu
Nepal, August 26, 2026" carry no event keyword and would otherwise fail the relevance gate.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any

from lib import config
from lib.text import nfc, redact_pii

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "us_embassy_alerts"
PUBLISHER = "US Embassy Kathmandu"
ENTRY_RE = re.compile(r'<h2 class="entry-date">\s*([^<]+?)\s*</h2>\s*<h2 class="entry-title">\s*<a href="([^"]+)">([^<]+)</a>', re.I)
MIN_PUBLISHED = config.EVENT_START_UTC - timedelta(days=1)
MAX_DETAIL = 8


def parse_entries(html: str) -> list[dict[str, Any]]:
    out = []
    for date, url, title in ENTRY_RE.findall(html or ""):
        t = re.sub(r"[\s  ]+", " ", nfc(title)).strip()
        out.append({"date": date.strip(), "url": url.strip(), "title": t})
    return out


def alert_body(html: str) -> str | None:
    i = (html or "").find("meta-info-top")
    if i < 0:
        return None
    text = strip_tags(html[i:i + 60000])
    j = text.find("Assistance:")
    text = text[:j] if j > 0 else text
    text = re.sub(r"\s+", " ", redact_pii(text)).strip()
    return text[:2000] or None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    if not p.ok:
        out.notes.append(f"alerts archive: {p.error or p.status}")
        return out
    entries = parse_entries(p.body)
    if not entries:
        out.notes.append("alerts archive: no entries parsed (placeholder page?)")
    seen = ctx.state.seen(SOURCE_ID, "pages") if (ctx and ctx.state is not None) else set()
    done: list[str] = []
    fetched = 0
    for e in entries:
        published = parse_dt(e["date"] + " 12:00", default_tz=config.KTM)
        body = None
        if (ctx is not None and ctx.fetch is not None and published is not None and published >= MIN_PUBLISHED
                and e["url"] not in seen and fetched < MAX_DETAIL):
            fetched += 1
            f = ctx.fetch(e["url"])
            if getattr(f, "ok", False):
                body = alert_body(getattr(f, "text", ""))
                done.append(e["url"])
            else:
                out.notes.append(f"{e['url']}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
        out.article(url=e["url"], title=e["title"][:500], publisher=PUBLISHER, lang="en", published_at=published,
                    body=body, source_id=SOURCE_ID, fetched_at=fetched_at)
    if done and ctx and ctx.state is not None and not ctx.dry_run:
        ctx.state.add_seen(SOURCE_ID, done, key="pages")
    return out
