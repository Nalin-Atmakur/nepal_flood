"""
normalisers/hot_s3_listing.py — HOT raw-data-api S3 listing (prefix ISO3/NPL/) → 'dataset availability' articles, publisher HOT.
docs/pull_external_data/05b-sources-wave2-geospatial-text.md §hot_s3_listing.
ListBucketResult <Contents><Key/><LastModified/><Size/>. Keys modified since the event, minus the `_layers/` cache and bucket
metadata, are grouped per layer (the `_gpkg|_shp|_kml|_geojson.zip` format variants collapse into one row): url = the geojson
variant (else the newest), title = the layer file name, published_at = newest LastModified, body lists formats and sizes.
Figure objects_updated_since_event (national).
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from lib import config

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "hot_s3_listing"
PUBLISHER = "HOT"
BASE = "https://production-raw-data-api.s3.amazonaws.com/"
_CONTENTS_RE = re.compile(r"<Contents>(.*?)</Contents>", re.S)
_KEY_RE = re.compile(r"<Key>(.*?)</Key>")
_LM_RE = re.compile(r"<LastModified>(.*?)</LastModified>")
_SIZE_RE = re.compile(r"<Size>(\d+)</Size>")
_FMT_RE = re.compile(r"_(gpkg|shp|kml|geojson)\.zip$")
SKIP_RE = re.compile(r"/_layers/|/meta\.json$|/dbdump\.zip$")


def objects(xml: str) -> list[dict[str, Any]]:
    out = []
    for block in _CONTENTS_RE.findall(xml):
        k, lm, sz = _KEY_RE.search(block), _LM_RE.search(block), _SIZE_RE.search(block)
        if k and lm:
            out.append({"key": k.group(1), "modified": parse_dt(lm.group(1)), "size": int(sz.group(1)) if sz else None})
    return out


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    if not p.ok or "<ListBucketResult" not in p.body:
        out.notes.append(f"hot s3: {p.error or p.status}")
        return out
    groups: dict[str, list[dict[str, Any]]] = {}
    for o in objects(p.body):
        if o["modified"] is None or o["modified"] < config.EVENT_START_UTC or SKIP_RE.search("/" + o["key"]):
            continue
        base = _FMT_RE.sub("", o["key"])
        groups.setdefault(base, []).append(o)
    for base, objs in groups.items():
        objs.sort(key=lambda o: o["modified"], reverse=True)
        pick = next((o for o in objs if o["key"].endswith(("_geojson.zip", ".geojson"))), objs[0])
        fmts = ", ".join(f"{(_FMT_RE.search(o['key']) or [None, o['key'].rsplit('.', 1)[-1]])[1]} {o['size'] or 0:,} B" for o in objs)
        name = base.rsplit("/", 1)[-1]
        folder = base.split("/")[2] if base.count("/") >= 2 else ""
        body = (f"HOT raw-data-api Nepal Flood 2026 export · {folder} · {fmts} · modified {objs[0]['modified'].strftime('%d %b %H:%M UTC')} · "
                f"prefix ISO3/NPL/ (Bhote Koshi–Trishuli flood AOI)")
        out.article(url=BASE + pick["key"], title=name[:500], publisher=PUBLISHER, lang="en", published_at=objs[0]["modified"],
                    body=body[:2000], source_id=SOURCE_ID, fetched_at=fetched_at)
    out.figure(publisher=PUBLISHER, metric="objects_updated_since_event", value=sum(len(v) for v in groups.values()), as_of=fetched_at,
               url=p.url or BASE + "?list-type=2&prefix=ISO3/NPL/", note=f"{len(groups)} layer(s)", source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
