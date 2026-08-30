"""
normalisers/_stac.py — shared bits for the imagery-catalogue normalisers (vantor_stac, planet_stac): follow
STAC links with a bounded number of sub-fetches, parse item datetimes. Helper module, not a source.
"""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any
from urllib.parse import urljoin

from . import Context
from ._common import parse_dt


def fetch_json(ctx: Context | None, url: str) -> dict[str, Any] | None:
    if ctx is None or ctx.fetch is None:
        return None
    try:
        f = ctx.fetch(url)
        if not getattr(f, "ok", False):
            return None
        d = json.loads(f.text)
        return d if isinstance(d, dict) else None
    except Exception:  # noqa: BLE001 — a failed sub-fetch only loses one node
        return None


def links(doc: dict[str, Any], rel: str, base: str) -> list[str]:
    out = []
    for l in doc.get("links") or []:
        if isinstance(l, dict) and l.get("rel") == rel and l.get("href"):
            out.append(urljoin(base, str(l["href"])))
    return out


def item_datetime(item: dict[str, Any]) -> datetime | None:
    pr = item.get("properties") or {}
    return parse_dt(pr.get("datetime")) or parse_dt(pr.get("start_datetime"))
