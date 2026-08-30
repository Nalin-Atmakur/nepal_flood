"""
normalisers/hdx_search.py — HDX CKAN package_search (q=nepal, newest first) → 'dataset availability' articles, publisher HDX.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §hdx_search.
One article per dataset modified since the event whose name/title/notes match EVENT_RE (nepal AND flood|rasuwa|…):
url = https://data.humdata.org/dataset/<name>, title = dataset title, published_at = metadata_modified (UTC),
body = "<org> · N resources · <first notes>". Figure datasets_updated_since_event (national).
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from lib import config
from lib.text import nfc

from . import Context, NormalisedRows, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "hdx_search"
PUBLISHER = "HDX"
EVENT_RE = re.compile(r"flood|rasuwa|nuwakot|bhote ?koshi|trishuli|trisuli|emsr927|glide|mudflow|rockflow|landslide|unosat|fl20260826", re.I)


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict) or not isinstance(doc.get("result"), dict):
        out.notes.append(f"hdx: {p.error or p.status}")
        return out
    n = 0
    for d in doc["result"].get("results") or []:
        name, title = str(d.get("name") or ""), nfc(d.get("title") or "").strip()
        modified = parse_dt(d.get("metadata_modified"))
        if not name or not title or modified is None or modified < config.EVENT_START_UTC:
            continue
        notes = strip_tags(d.get("notes") or "")
        if not EVENT_RE.search(f"{name} {title} {notes[:400]}"):
            continue
        org = ((d.get("organization") or {}).get("title") if isinstance(d.get("organization"), dict) else None) or d.get("dataset_source") or "HDX"
        res = [r.get("name") for r in (d.get("resources") or []) if isinstance(r, dict) and r.get("name")]
        body = f"{org} · {len(res)} resource(s)" + (f": {', '.join(str(r) for r in res[:6])}" if res else "") + (f" · {notes[:400]}" if notes else "")
        out.article(url=f"https://data.humdata.org/dataset/{name}", title=title[:500], publisher=PUBLISHER, lang="en",
                    published_at=modified, body=body[:2000], source_id=SOURCE_ID, fetched_at=fetched_at)
        n += 1
    out.figure(publisher=PUBLISHER, metric="datasets_updated_since_event", value=n, as_of=fetched_at, url=p.url or None,
               note="package_search q=nepal, event keywords", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
