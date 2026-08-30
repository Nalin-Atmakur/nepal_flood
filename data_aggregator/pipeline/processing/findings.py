"""
processing/findings.py — step ⑥. See docs/process_data/06-findings.md.

Data-quality findings for the people who hold the lists (never shown on the site; `findings` is private):
    name_collision        OPMCM rows imported by "DAO Sindhupalchok" whose location is Bhotekoshi RM
                          (Sindhupalchok) — a name collision with the Bhote Koshi river (Rasuwa) or displaced
                          Kerung-route workers; counted, sample location TEXTS only (never names)
    duplicate_across_lists  entities merged from ≥ 2 sources (form / OPMCM / NDRRMA) — counts + entity ids
    lost_but_rescued      OPMCM 'lost' rows whose person_key equals an NDRRMA rescued person (list not reconciled)
    absent_from_setu      only when a setu_recordlist pull exists (wave 2): rows of private lists with no Setu card
    stale_source          sources whose last successful pull is older than 3 × cadence
Findings of a kind are replaced each run unless already handed over (handed_at set).
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

from lib import config, log
from processing import ProcCtx
from processing.dedup import ndrrma_records, opmcm_records

STEP = "06-findings"


def name_collision(items: list[dict[str, Any]], gaz: Any) -> dict[str, Any] | None:
    dao = [i for i in items if "sindhupalchok" in str(i.get("daoOffice") or "").lower()]
    coll = [i for i in dao if gaz.resolve(str(i.get("locationText") or "")) == "bhotekoshi_rm_sindhupalchok"
            or "भोटेकोशी" in str(i.get("locationText") or "") or "bhotekoshi" in str(i.get("locationText") or "").lower()]
    if not dao:
        return None
    samples = Counter(str(i.get("locationText") or "")[:80] for i in coll).most_common(8)
    return {"dao_sindhupalchok_rows": len(dao), "bhotekoshi_rm_rows": len(coll),
            "share_of_all_listed": round(len(dao) / max(len(items), 1), 3),
            "sample_locations": [s for s, _ in samples],
            "note": "Bhotekoshi Rural Municipality (Sindhupalchok) is not the Bhote Koshi river (Rasuwa); "
                    "confirm whether these are Kerung-route workers before counting them in the corridor."}


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        db = ctx.db
        findings: list[dict[str, Any]] = []
        items = ctx.cache.get("opmcm_items")
        if items is None:
            from processing.dedup import _latest_pull
            items = _latest_pull(ctx, "opmcm_person_reports")
            ctx.cache["opmcm_items"] = items
        nc = name_collision(items, ctx.gaz) if items else None
        if nc:
            findings.append({"kind": "name_collision", "detail": nc})
        ents = db.select_all("entities", {"select": "id,merged_from,status"})
        multi = [e for e in ents if len({m.get("source") for m in (e.get("merged_from") or [])}) >= 2]
        if multi:
            pairs = Counter("+".join(sorted({m.get("source") for m in e["merged_from"]})) for e in multi)
            findings.append({"kind": "duplicate_across_lists", "detail": {"entities": len(multi), "by_source_pair": dict(pairs),
                                                                          "entity_ids": [e["id"] for e in multi[:200]]}})
        nd = {r["person_key"] for r in ndrrma_records(ctx)}
        op = opmcm_records(ctx)
        lost_rescued = [r for r in op if r["status"] == "lost" and r["person_key"] in nd]
        if lost_rescued:
            findings.append({"kind": "lost_but_rescued", "detail": {"count": len(lost_rescued),
                                                                    "opmcm_ids": [str(r["external_id"]) for r in lost_rescued[:300]],
                                                                    "note": "listed 'lost' on rescue.opmcm.gov.np but present on the NDRRMA verified rescued list (name+age band+nationality match)"}})
        setu = db.select("raw_pulls", {"select": "id", "source_id": "eq.setu_recordlist", "limit": 1})
        if setu:
            findings.append({"kind": "absent_from_setu", "detail": {"note": "Setu pull present; card-level comparison needs the wave-2 setu normaliser", "count": None}})
        stale = []
        for s in db.select_all("v_sources_status", {"select": "id,cadence,last_fetched_at,last_ok"}):
            mins = config.cadence_minutes(s.get("cadence"))
            if mins >= config.STATIC_MINUTES:
                continue
            lf = s.get("last_fetched_at")
            if not lf:
                continue
            age = (ctx.now - datetime.fromisoformat(lf.replace("Z", "+00:00"))).total_seconds() / 60
            if age > 3 * max(mins, config.PULL_INTERVAL_MINUTES) or s.get("last_ok") is False:
                stale.append({"source": s["id"], "minutes_since_fetch": int(age), "last_ok": s.get("last_ok")})
        if stale:
            findings.append({"kind": "stale_source", "detail": {"sources": stale}})
        if not ctx.dry_run:
            for f in findings:
                db.delete("findings", {"kind": f"eq.{f['kind']}", "handed_at": "is.null"})
                db.insert("findings", [{"kind": f["kind"], "detail": f["detail"], "created_at": ctx.now}])
        log.info("findings.done", kinds=[f["kind"] for f in findings])
        return {"kinds": [f["kind"] for f in findings], "name_collision": (nc or {}).get("bhotekoshi_rm_rows"),
                "lost_but_rescued": len(lost_rescued), "stale": len(stale)}
    except Exception as e:  # noqa: BLE001
        log.error("findings.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
