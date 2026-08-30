"""
normalisers/ntc_restoration_articles.py — derived: stored `articles` (last 3 days) scanned for tower-restoration language
→ figures publisher 'NTC/Ncell via press'. docs/pull_external_data/05b-sources-wave2-geospatial-text.md §ntc_restoration_articles.

This source has no URL: the puller skips it (`pull.skip_no_url`). It runs in two other ways:
  * process_data ③ (processing/ledger.py) calls `scan_articles()` on the place-resolved articles it already loads, upserts
    the figures and reads them back for place_status.telecom_restored / phones;
  * `python -m normalisers.ntc_restoration_articles` does the same standalone against the database (last 3 days).
`normalise()` keeps the contract for tests: `raw` is a JSON list of article rows (or {"articles": [...]}).

Rules (pure, tests/test_normalisers_w2b.py): an article whose title+body matches TELECOM_RE and RESTORED_RE emits
telecom_restored value 1 for every settlement-level gazetteer place it mentions (exact alias matches in the text, else article.places from ①;
districts and the generic cities are skipped); OUTAGE_RE without RESTORED_RE emits telecom_outage value 1.
as_of = article published_at · url = article url · note = headline (≤ 140). "N of M sites restored" → telecom_sites_restored /
telecom_sites_affected (national).
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable

from lib import config
from lib.text import nfc, to_int

from . import Context, NormalisedRows, parts
from .ekantipur_live import exact_places

SOURCE_ID = "ntc_restoration_articles"
PUBLISHER = "NTC/Ncell via press"
LOOKBACK_DAYS = 3
# Nepali: bare सञ्चार / मोबाइल are too loose (सञ्चारमाध्यम = media, सञ्चारमन्त्री = minister) — only the network senses count.
TELECOM_RE = re.compile(r"\bNTC\b|Ncell|Nepal Telecom|tower|\bBTS\b|telecom|mobile network|phone service|cell(?:ular)? service|"
                        r"टावर|दूरसञ्चार|सञ्चार ?सेवा|सञ्चार ?सञ्जाल|सञ्चार ?सम्पर्क|सञ्चारविहीन|मोबाइल ?(?:नेटवर्क|सेवा|सञ्जाल)|एनसेल|टेलिकम", re.I)
RESTORED_RE = re.compile(r"restor|resum|back (?:up|on|online)|reconnect|operational|re-?establish|मर्मत|सञ्चालनमा|पुनः|पुनर्स्थापना|सुचारु|फर्क", re.I)
OUTAGE_RE = re.compile(r"still (?:down|out|cut)|without (?:communication|network|phone)|no (?:network|signal|communication)|cut off|"
                       r"सञ्चारविहीन|सम्पर्कविहीन|बन्द|अवरुद्ध|ठप्प", re.I)
_SITES_RE = re.compile(r"(\d{1,4})\s+of\s+(?:the\s+)?(\d{1,4})\s+(?:affected\s+|damaged\s+)?(?:sites|towers|BTS|base stations)", re.I)
SKIP_PLACE_IDS = {"kathmandu", "bharatpur", "pokhara_pahs", "tuth_kathmandu", "trauma_center_kathmandu", "bharatpur_body_centre"}


def _dt(v: Any) -> datetime | None:
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
    if not v:
        return None
    try:
        d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def classify(text: str) -> str | None:
    """'restored' | 'outage' | None for one article's title+body."""
    t = nfc(text)
    if not TELECOM_RE.search(t):
        return None
    if RESTORED_RE.search(t):
        return "restored"
    if OUTAGE_RE.search(t):
        return "outage"
    return None


def scan_articles(articles: Iterable[dict[str, Any]], gaz: Any, fetched_at: datetime, since: datetime | None = None) -> NormalisedRows:
    out = NormalisedRows()
    since = since or (fetched_at - timedelta(days=LOOKBACK_DAYS))
    seen: set[tuple[str, str, str]] = set()
    for a in articles:
        title, body = nfc(a.get("title") or ""), nfc(a.get("body") or "")
        kind = classify(f"{title} {body}")
        if kind is None:
            continue
        at = _dt(a.get("published_at")) or _dt(a.get("fetched_at")) or fetched_at
        if at < since:
            continue
        url, note = a.get("url"), title[:140]
        # exact alias matches from the text first (①'s places include skeleton hits such as शनिबार → Shanti Bazar);
        # ①'s places are the fallback when the text itself yields nothing
        pids = exact_places(gaz, f"{title} {body[:1500]}") or list(a.get("places") or [])
        for pid in pids:
            place = gaz.get(pid) if gaz is not None else None
            if pid in SKIP_PLACE_IDS or (place is not None and place.kind == "district"):
                continue
            metric = "telecom_restored" if kind == "restored" else "telecom_outage"
            key = (metric, pid, str(url))
            if key in seen:
                continue
            seen.add(key)
            out.figure(publisher=PUBLISHER, metric=metric, value=1, scope=f"place:{pid}", as_of=at, url=url, note=note,
                       source_id=SOURCE_ID, fetched_at=fetched_at)
        if kind == "restored":
            m = _SITES_RE.search(f"{title} {body}")
            if m:
                out.figure(publisher=PUBLISHER, metric="telecom_sites_restored", value=to_int(m.group(1)), as_of=at, url=url, note=note,
                           source_id=SOURCE_ID, fetched_at=fetched_at)
                out.figure(publisher=PUBLISHER, metric="telecom_sites_affected", value=to_int(m.group(2)), as_of=at, url=url, note=note,
                           source_id=SOURCE_ID, fetched_at=fetched_at)
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    gaz = ctx.gazetteer if ctx else None
    for p in parts(raw):
        doc = p.json()
        rows = doc.get("articles") if isinstance(doc, dict) else doc
        if not p.ok or not isinstance(rows, list):
            out.notes.append(f"{p.url or 'ntc'}: {p.error or p.status or 'not a list of articles'}")
            continue
        out.extend(scan_articles([r for r in rows if isinstance(r, dict)], gaz, fetched_at))
    return out


def main() -> int:
    """Standalone run against the database: articles of the last LOOKBACK_DAYS → figures."""
    from lib import log
    from lib.db import Db
    from lib.places import Gazetteer
    config.load_env()
    log.configure("info", file=config.RUN_LOG)
    db = Db.from_env()
    if db is None:
        print("SUPABASE_URL unset — nothing to scan", file=sys.stderr)
        return 2
    now = datetime.now(timezone.utc)
    since = (now - timedelta(days=LOOKBACK_DAYS)).isoformat()
    arts = db.select_all("articles", {"select": "url,title,body,places,published_at,fetched_at", "fetched_at": f"gte.{since}"})
    rows = scan_articles(arts, Gazetteer.load(db), now)
    n = db.upsert_figures(rows.figures) if rows.figures else 0
    print(json.dumps({"articles_scanned": len(arts), "figures": n}, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
