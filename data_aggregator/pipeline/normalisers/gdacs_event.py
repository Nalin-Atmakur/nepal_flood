"""
normalisers/gdacs_event.py — GDACS FL 1104124 event record → figures 'GDACS' from the Sendai fields.
docs/pull_external_data/05-sources.md §gdacs_event.

metric = sendai_<name> (death, affected, injured, rescued, transport_damaged…) · as_of = dateinsert ·
note = GLIDE + description; plus alert_score (episode alert score) as_of datemodified.
GDACS Sendai rows are media-extracted: all flagged latest=true, inserted in the same second, and some
"Nepal" rows describe the Tibet side ("Fatalities in Gyirong Port"). So: scope national, or
country:china when the description names Gyirong/Tibet/China; then keep the highest value per
(metric, scope) — the counts are cumulative, so the highest is the most recent. GLIDE noted:
FL-2026-000167-NPL.
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from lib import config
from lib.text import slugify, to_number

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "gdacs_event"
PUBLISHER = "GDACS"
TIBET_RE = re.compile(r"gyirong|tibet|china|shigatse|kerung|kyirong", re.I)


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    doc = p.json()
    if not p.ok or not isinstance(doc, dict):
        out.notes.append(f"gdacs: {p.error or p.status}")
        return out
    props = doc.get("properties") or {}
    glide = props.get("glide")
    report = (props.get("url") or {}).get("report") if isinstance(props.get("url"), dict) else None
    modified = parse_dt(props.get("datemodified")) or fetched_at
    score = to_number(props.get("episodealertscore") or props.get("alertscore"))
    if score is not None:
        out.figure(publisher=PUBLISHER, metric="alert_score", value=score, as_of=modified, url=report,
                   note=f"{props.get('alertlevel')} · GLIDE {glide} · {props.get('htmldescription')}",
                   source_id=SOURCE_ID, fetched_at=fetched_at)
    best: dict[tuple[str, str], dict[str, Any]] = {}
    for s in props.get("sendai") or []:
        name = s.get("sendainame")
        val = to_number(s.get("sendaivalue"))
        if not name or val is None or s.get("latest") is False:
            continue
        desc = str(s.get("description") or "")
        country = str(s.get("country") or s.get("region") or "Nepal")
        if TIBET_RE.search(desc + " " + country):
            scope = "country:china"
        elif country.lower() in ("nepal", "npl"):
            scope = "national"
        else:
            scope = f"country:{slugify(country)}"
        at = parse_dt(s.get("dateinsert"), default_tz=config.KTM) or modified
        row = {"metric": f"sendai_{slugify(name)}", "scope": scope, "value": val, "as_of": at,
               "note": f"GLIDE {glide} · Sendai {s.get('sendaitype')} · {desc[:160]}"}
        cur = best.get((row["metric"], scope))
        if cur is None or val > cur["value"]:
            best[(row["metric"], scope)] = row
    for row in best.values():
        out.figure(publisher=PUBLISHER, metric=row["metric"], value=row["value"], scope=row["scope"], as_of=row["as_of"],
                   url=report, note=row["note"], source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
