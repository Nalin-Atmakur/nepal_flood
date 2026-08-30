"""
normalisers/ifrc_go.py — IFRC GO event 8073 (goadmin API v2) → figures 'IFRC' + articles.
docs/pull_external_data/05a-sources-wave2-official.md §ifrc_go.

    /api/v2/event/8073/  {name, glide, disaster_start_date, num_affected, updated_at, appeals[], field_reports[], summary}
        figures  appeal_amount_requested_chf · appeal_amount_funded_chf · appeal_beneficiaries   (note = appeal code)
                 affected (event num_affected) · dead/missing/injured/affected/displaced from field reports
        articles the GO event page · each field report · appeal documents via /api/v2/appeal_document/?appeal=<id>
as_of = event `updated_at` (field-report figures: their `report_date`). `prestore()` removes every `contacts`
block (NRCS/IFRC staff names, emails, phones) and the contact email before the payload reaches raw_pulls.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows, Part, parts
from ._common import parse_dt, strip_tags

SOURCE_ID = "ifrc_go"
PUBLISHER = "IFRC"
GO = "https://go.ifrc.org"
API = "https://goadmin.ifrc.org/api/v2"
FR_METRICS = {"num_dead": "dead", "num_missing": "missing", "num_injured": "injured", "num_affected": "affected",
              "num_displaced": "displaced", "gov_num_dead": "dead", "gov_num_missing": "missing"}


def strip_contacts(o: Any) -> Any:
    if isinstance(o, dict):
        return {k: (None if k == "emergency_response_contact_email" else strip_contacts(v)) for k, v in o.items() if k != "contacts"}
    if isinstance(o, list):
        return [strip_contacts(x) for x in o]
    return o


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    import json
    out: list[Part] = []
    for p in ps:
        doc = p.json()
        if p.ok and isinstance(doc, dict):
            out.append(Part(url=p.url, status=p.status, body=json.dumps(strip_contacts(doc), ensure_ascii=False),
                            last_modified=p.last_modified, error=p.error))
        else:
            out.append(p)
    return out


def _num(v: Any) -> float | int | None:
    return v if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    p = parts(raw)[0]
    ev = p.json()
    if not p.ok or not isinstance(ev, dict) or "id" not in ev:
        out.notes.append(f"event: {p.error or p.status or 'no json'}")
        return out
    eid = ev.get("id")
    event_url = f"{GO}/emergencies/{eid}"
    as_of = parse_dt(ev.get("updated_at")) or fetched_at
    glide = ev.get("glide") or ""

    def fig(metric: str, value: Any, note: str | None = None, when: datetime | None = None, url: str = event_url) -> None:
        v = _num(value)
        if v is not None:
            out.figure(publisher=PUBLISHER, metric=metric, value=v, scope="national", as_of=when or as_of, url=url,
                       note=f"{glide} · {note}" if note else glide or None, source_id=SOURCE_ID, fetched_at=fetched_at)

    fig("affected", ev.get("num_affected"), note="event num_affected")
    out.article(url=event_url, title=str(ev.get("name") or "")[:500], publisher=PUBLISHER, lang="en",
                published_at=parse_dt(ev.get("created_at")) or parse_dt(ev.get("disaster_start_date")),
                body=strip_tags(ev.get("summary") or "")[:2000] or None, source_id=SOURCE_ID, fetched_at=fetched_at)
    for ap in ev.get("appeals") or []:
        if not isinstance(ap, dict):
            continue
        code = ap.get("code") or "appeal"
        tag = f"{code} {ap.get('atype_display') or ''} ({ap.get('status_display') or '?'})".strip()
        fig("appeal_amount_requested_chf", ap.get("amount_requested"), note=tag)
        fig("appeal_amount_funded_chf", ap.get("amount_funded"), note=tag)
        fig("appeal_beneficiaries", ap.get("num_beneficiaries"), note=tag)
        if ctx is not None and ctx.fetch is not None and ap.get("id") is not None:
            f = ctx.fetch(f"{API}/appeal_document/?appeal={ap['id']}")
            docs = None
            if getattr(f, "ok", False):
                try:
                    import json
                    docs = json.loads(getattr(f, "text", "") or "{}").get("results")
                except (ValueError, AttributeError):
                    docs = None
            if docs is None:
                out.notes.append(f"appeal_document for {code}: {getattr(f, 'error', None) or getattr(f, 'status', '?')}")
            for d in docs or []:
                url = d.get("document_url") or d.get("document")
                if url:
                    out.article(url=url, title=str(d.get("name") or f"{code} document")[:500], publisher=PUBLISHER, lang="en",
                                published_at=parse_dt(d.get("created_at")), body=f"{d.get('type') or 'document'} — {code} — {ev.get('name')}",
                                source_id=SOURCE_ID, fetched_at=fetched_at)
    for fr in ev.get("field_reports") or []:
        if not isinstance(fr, dict) or fr.get("id") is None:
            continue
        when = parse_dt(fr.get("report_date")) or parse_dt(fr.get("created_at"))
        for k, metric in FR_METRICS.items():
            fig(metric, fr.get(k), note=f"field report {fr['id']} {k}", when=when, url=f"{GO}/reports/{fr['id']}")
        out.article(url=f"{GO}/reports/{fr['id']}", title=str(fr.get("summary") or f"Field report {fr['id']}").strip()[:500],
                    publisher=PUBLISHER, lang="en", published_at=when, body=f"IFRC GO field report {fr['id']} — {ev.get('name')}",
                    source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
