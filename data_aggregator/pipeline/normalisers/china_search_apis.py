"""
normalisers/china_search_apis.py — People's Daily + The Paper search APIs (POST, query 吉隆口岸) → articles (zh) + figures.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §china_search_apis.
People's Daily  data.records[{title (<em> highlights), content, displayTime (ms), url, originName, domain, editor}]
The Paper       data.list[{contId, name (<font> highlights), summary, publishTime "YYYY-MM-DD HH:MM:SS" (CST), pubTimeLong}]
Articles only when published_at ≥ 26 Aug 2026 00:00 CST. When a People's Daily headline states a count
(死亡/遇难 N人 · 失联/失踪 N人 · 受伤 N人, either word order) a figure is emitted: publisher 'Xinhua/People’s Daily',
metric dead | missing | injured, scope country:china, as_of = article time, url = article. `editor`/`author` are never read.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from lib.text import nfc, to_int

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "china_search_apis"
PUB_PEOPLE = "People's Daily"
PUB_PAPER = "The Paper"
PUB_FIGURES = "Xinhua/People’s Daily"
CST = timezone(timedelta(hours=8))
SINCE = datetime(2026, 8, 26, tzinfo=CST)
_WORDS = {"死亡": "dead", "遇难": "dead", "失联": "missing", "失踪": "missing", "受伤": "injured"}
_N_FIRST = re.compile(r"(\d[\d,]*)\s*(?:名|人)\s*(死亡|遇难|失联|失踪|受伤)")
_WORD_FIRST = re.compile(r"(死亡|遇难|失联|失踪|受伤)\s*(?:人数\s*)?(?:达|至|为|升至|增至|上升至)?\s*(\d[\d,]*)\s*(?:名|人)")


def counts_in(title: str) -> list[tuple[str, int]]:
    t = nfc(title)
    got: dict[str, int] = {}
    for m in _N_FIRST.finditer(t):
        got.setdefault(_WORDS[m.group(2)], to_int(m.group(1)) or 0)
    for m in _WORD_FIRST.finditer(t):
        got.setdefault(_WORDS[m.group(1)], to_int(m.group(2)) or 0)
    return [(k, v) for k, v in got.items() if v > 0]


def _ms(v: Any) -> datetime | None:
    try:
        n = int(str(v))
    except (TypeError, ValueError):
        return None
    if n <= 0:
        return None
    return datetime.fromtimestamp(n / 1000.0, tz=timezone.utc)


def _people(doc: dict[str, Any], fetched_at: datetime, out: NormalisedRows) -> int:
    recs = ((doc.get("data") or {}).get("records") or []) if isinstance(doc.get("data"), dict) else []
    kept = 0
    for r in recs:
        title = strip_tags(r.get("title") or "")
        url = (r.get("url") or "").strip()
        at = _ms(r.get("displayTime")) or _ms(r.get("inputTime"))
        if not title or not url or at is None or at < SINCE:
            continue
        origin = nfc(r.get("originName") or "").strip()
        pub = f"{origin} via {PUB_PEOPLE}" if origin and origin not in ("人民网", PUB_PEOPLE) else PUB_PEOPLE
        body = strip_tags(r.get("content") or "")[:1500] or None
        out.article(url=url, title=title[:500], publisher=pub, lang="zh", published_at=at, body=body, source_id=SOURCE_ID, fetched_at=fetched_at)
        kept += 1
        for metric, val in counts_in(title):
            out.figure(publisher=PUB_FIGURES, metric=metric, value=val, scope="country:china", as_of=at, url=url, note=title[:140],
                       source_id=SOURCE_ID, fetched_at=fetched_at)
    return kept


def _paper(doc: dict[str, Any], fetched_at: datetime, out: NormalisedRows) -> int:
    lst = ((doc.get("data") or {}).get("list") or []) if isinstance(doc.get("data"), dict) else []
    kept = 0
    for r in lst:
        title = strip_tags(r.get("name") or "")
        cid = str(r.get("contId") or "").strip()
        if not title or not cid:
            continue
        at = parse_dt(r.get("publishTime"), default_tz=CST) or _ms(r.get("pubTimeLong"))
        if at is None or at < SINCE:
            continue
        url = f"https://www.thepaper.cn/newsDetail_forward_{cid}"
        body = strip_tags(r.get("summary") or "")[:1500] or None
        out.article(url=url, title=title[:500], publisher=PUB_PAPER, lang="zh", published_at=at, body=body, source_id=SOURCE_ID, fetched_at=fetched_at)
        kept += 1
    return kept


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        data = doc.get("data")
        if isinstance(data, dict) and "records" in data:
            n = _people(doc, fetched_at, out)
        elif isinstance(data, dict) and "list" in data:
            n = _paper(doc, fetched_at, out)
        else:
            out.notes.append(f"{p.url}: unrecognised payload")
            continue
        if n == 0:
            out.notes.append(f"{p.url}: no items dated on/after 26 Aug")
    return out
