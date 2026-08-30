"""
processing/dedup.py — step ②. See docs/process_data/02-dedup.md.

Records (all PII-free, keys are sha256 hashes):
    form     reports_anon rows            {source:'form',  external_id:id, person_key, group_key, nationality, age_band, sex, place_id, status, at}
    opmcm    latest OPMCM projection      {source:'opmcm', external_id:_id, person_key, age_band, sex, nationality, place_id, status('lost'|…), at}
    ndrrma   latest NDRRMA persons proj.  {source:'ndrrma',external_id:id,  person_key, age_band, sex, nationality, place_id(rescued_location), status:'rescued', at}

Blocking (candidate pairs only inside a block): person_key → group_key → (nationality, age_band).
Scoring `score(a, b)` (pure, unit-tested):
    same person_key, strength phone/passport                          1.0
    same person_key from name + age band + nationality (hash equal)   0.9
    name_key Jaro-Winkler ≥ 0.85 (only when raw name keys are in memory, i.e. inside ⓪'s batch) +
        same age band + same nationality                              0.6 … 0.9  (0.6 + 0.3·(jw−0.85)/0.15)
    same group_key and same place                                    +0.1
    conflicting sex, or age bands ≥ 2 apart                           −0.5
Thresholds: ≥ 0.9 merge · 0.6–0.9 → dedup_queue · < 0.6 distinct.
Output: entities (one per cluster, status = most recent/strongest event: rescued > deceased > reported_safe >
seen > missing > unknown), entity_events (one per source record), dedup_queue rows for the grey zone.
Idempotent: entities are keyed by person_key (upsert), events are re-created per run for that entity.
"""
from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime
from typing import Any

from lib import config, log
from lib.text import jaro_winkler, person_key
from processing import ProcCtx
from processing.anonymise import load_pull_body, opmcm_items

STEP = "02-dedup"
STATUS_RANK = {"rescued": 6, "stationed": 6, "deceased": 5, "reported_safe": 4, "seen": 3, "missing": 2, "lost": 2, "unknown": 0, "open": 2, "found": 4}
_BAND_INDEX = {"0-17": 0, "18-39": 1, "40-64": 2, "65+": 3}


def score(a: dict[str, Any], b: dict[str, Any]) -> tuple[float, list[str]]:
    reasons: list[str] = []
    s = 0.0
    if a.get("person_key") and a.get("person_key") == b.get("person_key"):
        strong = {a.get("key_strength"), b.get("key_strength")} & {"phone", "passport"}
        if strong:
            s, r = 1.0, f"same {'/'.join(sorted(strong))} key"
        else:
            s, r = 0.9, "same name+age band+nationality key"
        reasons.append(r)
    elif a.get("name_key") and b.get("name_key"):
        jw = jaro_winkler(a["name_key"], b["name_key"])
        if jw >= 0.85 and a.get("age_band") == b.get("age_band") and (a.get("nationality") or "").lower() == (b.get("nationality") or "").lower():
            s = 0.6 + 0.3 * (jw - 0.85) / 0.15
            reasons.append(f"name JW {jw:.2f} + same age band + nationality")
    if s == 0.0:
        return 0.0, ["no key overlap"]
    if a.get("group_key") and a.get("group_key") == b.get("group_key") and a.get("place_id") and a.get("place_id") == b.get("place_id"):
        s += 0.1
        reasons.append("same group and place")
    sa, sb = (a.get("sex") or "").lower(), (b.get("sex") or "").lower()
    if sa and sb and sa != sb:
        s -= 0.5
        reasons.append("conflicting sex")
    ba, bb = _BAND_INDEX.get(a.get("age_band") or ""), _BAND_INDEX.get(b.get("age_band") or "")
    if ba is not None and bb is not None and abs(ba - bb) >= 2:
        s -= 0.5
        reasons.append("age bands far apart")
    return max(0.0, min(1.0, round(s, 3))), reasons


def decide(s: float) -> str:
    if s >= config.DEDUP_MERGE_THRESHOLD:
        return "merge"
    if s >= config.DEDUP_QUEUE_THRESHOLD:
        return "queue"
    return "distinct"


def blocks(records: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    by: dict[tuple, list[dict[str, Any]]] = defaultdict(list)
    for r in records:
        if r.get("person_key"):
            by[("pk", r["person_key"])].append(r)
        elif r.get("group_key"):
            by[("gk", r["group_key"])].append(r)
        elif r.get("nationality") and r.get("age_band"):
            by[("na", (r["nationality"] or "").lower(), r["age_band"])].append(r)
    return [v for v in by.values() if len(v) > 1]


def cluster(records: list[dict[str, Any]]) -> tuple[list[list[dict[str, Any]]], list[tuple[dict[str, Any], dict[str, Any], float, list[str]]]]:
    """Union-find over merge decisions inside blocks; returns clusters and the grey-zone pairs."""
    parent = {id(r): id(r) for r in records}
    by_id = {id(r): r for r in records}

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    queue: list[tuple[dict[str, Any], dict[str, Any], float, list[str]]] = []
    for blk in blocks(records):
        if len(blk) > 400:   # pathological block (e.g. nationality+age band with thousands): skip pairwise
            continue
        for i in range(len(blk)):
            for j in range(i + 1, len(blk)):
                a, b = blk[i], blk[j]
                if a.get("source") == b.get("source") and a.get("source") == "form":
                    pass
                s, reasons = score(a, b)
                d = decide(s)
                if d == "merge":
                    parent[find(id(a))] = find(id(b))
                elif d == "queue":
                    queue.append((a, b, s, reasons))
    groups: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for r in records:
        groups[find(id(r))].append(r)
    return list(groups.values()), queue


def _at(v: Any) -> datetime | None:
    if not v:
        return None
    try:
        d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=config.KTM)
    except ValueError:
        return None


def entity_from_cluster(cl: list[dict[str, Any]]) -> dict[str, Any]:
    best = max(cl, key=lambda r: (STATUS_RANK.get((r.get("status") or "unknown").lower(), 0), _at(r.get("at")) or datetime.min.replace(tzinfo=config.KTM)))
    last_place = None
    last_at = None
    for r in sorted(cl, key=lambda r: _at(r.get("at")) or datetime.min.replace(tzinfo=config.KTM)):
        if r.get("place_id"):
            last_place = r["place_id"]
        if _at(r.get("at")):
            last_at = _at(r.get("at"))
    pk = next((r["person_key"] for r in cl if r.get("person_key")), None)
    gk = next((r["group_key"] for r in cl if r.get("group_key")), None)
    return {
        "person_key": pk, "group_key": gk,
        "nationality": next((r["nationality"] for r in cl if r.get("nationality")), None),
        "age_band": next((r["age_band"] for r in cl if r.get("age_band")), None),
        "sex": next((r["sex"] for r in cl if r.get("sex")), None),
        "status": (best.get("status") or "unknown").lower().replace("lost", "missing").replace("open", "missing").replace("found", "reported_safe"),
        "status_as_of": _at(best.get("at")), "status_source": best.get("source"),
        "probable_place_id": best.get("place_id") or last_place, "probable_confidence": 0.9 if len(cl) > 1 else 0.6,
        "last_place_id": last_place, "last_contact_at": last_at,
        "merged_from": [{"source": r.get("source"), "external_id": str(r.get("external_id")), "status": r.get("status")} for r in cl],
    }


# ---- record loaders --------------------------------------------------------------

def form_records(ctx: ProcCtx) -> list[dict[str, Any]]:
    rows = ctx.db.select_all("reports_anon", {"select": "id,person_key,group_key,nationality,age_band,sex,place_id,status,event_time,created_at,respondent_type"})
    out = []
    for r in rows:
        out.append({"source": "form", "external_id": r["id"], "person_key": r.get("person_key"), "key_strength": "phone" if r.get("person_key") else None,
                    "group_key": r.get("group_key"), "nationality": r.get("nationality"), "age_band": r.get("age_band"), "sex": r.get("sex"),
                    "place_id": r.get("place_id"), "status": r.get("status") or "unknown", "at": r.get("event_time") or r.get("created_at")})
    return out


def _latest_pull(ctx: ProcCtx, source_id: str) -> list[dict[str, Any]]:
    pulls = ctx.db.select("raw_pulls", {"select": "id,fetched_at,body,storage_path", "source_id": f"eq.{source_id}",
                                        "unchanged": "eq.false", "order": "fetched_at.desc", "limit": 1})
    if not pulls:
        return []
    raw = load_pull_body(ctx.db, pulls[0])
    return opmcm_items(raw) if raw else []


def opmcm_records(ctx: ProcCtx) -> list[dict[str, Any]]:
    items = ctx.cache.get("opmcm_items") or _latest_pull(ctx, "opmcm_person_reports")
    out = []
    for it in items:
        if not it.get("person_key"):
            continue
        loc = str(it.get("locationText") or "")
        out.append({"source": "opmcm", "external_id": it.get("_id"), "person_key": it["person_key"], "key_strength": it.get("key_strength"),
                    "group_key": None, "nationality": it.get("nationality"), "age_band": it.get("age_band"),
                    "sex": (it.get("gender") or "").lower() or None, "place_id": ctx.gaz.resolve(loc) if loc else None,
                    "status": "rescued" if it.get("type") == "rescued" else "found" if it.get("type") == "found" else "lost",
                    "at": it.get("eventAt") or it.get("createdAt")})
    return out


def ndrrma_records(ctx: ProcCtx) -> list[dict[str, Any]]:
    pulls = ctx.db.select("raw_pulls", {"select": "id,fetched_at,body,storage_path", "source_id": "eq.ndrrma_rescues",
                                        "unchanged": "eq.false", "order": "fetched_at.desc", "limit": 1})
    if not pulls:
        return []
    raw = load_pull_body(ctx.db, pulls[0])
    if not raw:
        return []
    from normalisers import parts as _parts
    out = []
    for p in _parts(raw):
        if "rescued-persons" not in p.url:
            continue
        doc = p.json()
        for r in (doc.get("results") if isinstance(doc, dict) else []) or []:
            if not r.get("person_key"):
                continue
            loc = r.get("rescued_location")
            loc_t = loc.get("title") if isinstance(loc, dict) else (r.get("remarks_place") or "")
            out.append({"source": "ndrrma", "external_id": r.get("id"), "person_key": r["person_key"], "key_strength": "name",
                        "group_key": None, "nationality": (r.get("country") or r.get("nationality") or None),
                        "age_band": r.get("age_band"), "sex": (r.get("gender") or "").lower() or None,
                        "place_id": ctx.gaz.resolve(str(loc_t)) if loc_t else None, "status": "rescued",
                        "at": r.get("rescued_date")})
    return out


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        records = form_records(ctx) + opmcm_records(ctx) + ndrrma_records(ctx)
        clusters, queue = cluster(records)
        multi = [c for c in clusters if len(c) > 1]
        keyed = [c for c in clusters if any(r.get("person_key") for r in c)]
        log.info("dedup.clustered", records=len(records), clusters=len(clusters), merged=len(multi), queued=len(queue))
        if ctx.dry_run:
            return {"records": len(records), "clusters": len(clusters), "merged": len(multi), "queued": len(queue)}
        db = ctx.db
        # existing entities keyed by (person_key, sex, age_band): two clusters can share a person_key when
        # a conflict (sex / age) kept them apart, so a bare person_key is not unique in `entities`
        existing: dict[tuple, list[str]] = defaultdict(list)
        for e in db.select_all("entities", {"select": "id,person_key,sex,age_band", "person_key": "not.is.null"}):
            existing[(e["person_key"], e.get("sex"), e.get("age_band"))].append(e["id"])
        rows = []
        used: set[str] = set()
        for c in keyed:
            e = entity_from_cluster(c)
            e["updated_at"] = ctx.now
            for eid in existing.get((e["person_key"], e.get("sex"), e.get("age_band")), []) + existing.get((e["person_key"], None, None), []):
                if eid not in used:
                    e["id"] = eid
                    used.add(eid)
                    break
            rows.append(e)
        with_id = [r for r in rows if r.get("id")]
        without = [r for r in rows if not r.get("id")]
        written = (db.upsert("entities", with_id, on_conflict="id", returning=True) if with_id else []) + \
                  (db.insert("entities", without, returning=True) if without else [])
        by_key: dict[tuple, str] = {}
        for w in written:
            if w.get("person_key"):
                by_key.setdefault((w["person_key"], w.get("sex"), w.get("age_band")), w["id"])
        # events: re-create per entity for this run
        ev = []
        for c in keyed:
            e = entity_from_cluster(c)
            eid = by_key.get((e["person_key"], e.get("sex"), e.get("age_band")))
            if not eid:
                continue
            for r in c:
                ev.append({"entity_id": eid, "at": _at(r.get("at")), "status": r.get("status"), "place_id": r.get("place_id"),
                           "source": r.get("source"), "note": f"external_id={r.get('external_id')}"})
        eids = list(by_key.values())
        for i in range(0, len(eids), 60):          # keep each DELETE URI small (PostgREST 414 above ~8 KB)
            db.delete("entity_events", {"entity_id": f"in.({','.join(eids[i:i + 60])})"})
        if ev:
            db.insert("entity_events", ev)
        q = []
        for a, b, s, reasons in queue[:500]:
            q.append({"a_ref": {"source": a["source"], "external_id": str(a["external_id"])},
                      "b_ref": {"source": b["source"], "external_id": str(b["external_id"])},
                      "score": s, "reason": "; ".join(reasons)})
        if q:
            open_q = db.select_all("dedup_queue", {"select": "a_ref,b_ref", "decision": "is.null"})
            have = {(json.dumps(x["a_ref"], sort_keys=True), json.dumps(x["b_ref"], sort_keys=True)) for x in open_q}
            q = [x for x in q if (json.dumps(x["a_ref"], sort_keys=True), json.dumps(x["b_ref"], sort_keys=True)) not in have]
            if q:
                db.insert("dedup_queue", q)
        # archive rows that are part of a multi-source cluster → status 'matched'
        matched_ids = [r["external_id"] for c in multi for r in c if r["source"] == "form" and len({x["source"] for x in c}) > 1]
        for rid in matched_ids:
            db.update("reports_archive", {"id": f"eq.{rid}", "status": "in.(anonymised,processed)"}, {"status": "matched"})
        return {"records": len(records), "clusters": len(clusters), "entities": len(rows), "events": len(ev), "queued": len(q), "matched_reports": len(matched_ids)}
    except Exception as e:  # noqa: BLE001
        log.error("dedup.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
