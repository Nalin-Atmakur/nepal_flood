"""
processing/findings.py — step ⑥. See docs/process_data/06-findings.md.

Data-quality findings for the people who hold the lists (never shown on the site; `findings` is private).
Every finding is {kind, detail} where detail always carries `summary` (one plain-English sentence a list-holder
can act on) and `evidence` (the query or figures behind it):

    name_collision          OPMCM rows imported by "DAO Sindhupalchok" whose location is Bhotekoshi RM (Sindhupalchok) —
                            a name collision with the Bhote Koshi river (Rasuwa) or displaced Kerung-route workers
    publisher_divergence    for dead / missing / rescued / foreigners_missing: the latest national value per publisher,
                            the spread (max − min) and which publishers sit at each end
    unreached_by_record     places with people reported missing there (entities / reports) but no official rescue count
    stale_source            sources whose last successful pull is older than 2 × max(cadence, PULL_INTERVAL) or failed
    duplicate_rate          entities merged from > 1 record / all entities, by source pair, plus the open review queue
    duplicate_across_lists  entities merged from ≥ 2 different sources (form / OPMCM / NDRRMA) — ids for reconciliation
    lost_but_rescued        OPMCM 'lost' rows whose person_key equals an NDRRMA rescued person (list not reconciled)
    absent_from_setu        only when a setu_recordlist pull exists (wave 2): placeholder until its normaliser lands
Findings of a kind are replaced each run unless already handed over (handed_at set). No names, ever.
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any

from lib import config, log
from processing import ProcCtx
from processing._series import fmt_int
from processing.dedup import merge_stats, ndrrma_records, opmcm_records

STEP = "06-findings"
KINDS = ("name_collision", "publisher_divergence", "unreached_by_record", "duplicate_rate", "duplicate_across_lists",
         "lost_but_rescued", "absent_from_setu", "stale_source")
DIVERGENCE_METRICS = ("dead", "missing", "rescued", "foreigners_missing")
STALE_FACTOR = 2


def name_collision(items: list[dict[str, Any]], gaz: Any) -> dict[str, Any] | None:
    dao = [i for i in items if "sindhupalchok" in str(i.get("daoOffice") or "").lower()]
    coll = [i for i in dao if gaz.resolve(str(i.get("locationText") or "")) == "bhotekoshi_rm_sindhupalchok"
            or "भोटेकोशी" in str(i.get("locationText") or "") or "bhotekoshi" in str(i.get("locationText") or "").lower()]
    if not dao:
        return None
    samples = Counter(str(i.get("locationText") or "")[:80] for i in coll).most_common(8)
    return {"summary": f"{len(coll)} of the {len(dao)} OPMCM rows filed by DAO Sindhupalchok give a Bhotekoshi Rural Municipality "
                       f"address — confirm whether these are Kerung-route workers before counting them in the Rasuwa corridor.",
            "dao_sindhupalchok_rows": len(dao), "bhotekoshi_rm_rows": len(coll),
            "share_of_all_listed": round(len(dao) / max(len(items), 1), 3),
            "sample_locations": [s for s, _ in samples],
            "evidence": "latest opmcm_person_reports pull: daoOffice ilike '%sindhupalchok%' and locationText resolves to bhotekoshi_rm_sindhupalchok",
            "note": "Bhotekoshi Rural Municipality (Sindhupalchok) is not the Bhote Koshi river (Rasuwa); "
                    "confirm whether these are Kerung-route workers before counting them in the corridor."}


def publisher_divergence(latest: list[dict[str, Any]]) -> dict[str, Any] | None:
    """figures_latest national rows → per metric: values by publisher, spread, who is high / low."""
    by_metric: dict[str, dict[str, dict[str, Any]]] = {}
    for f in latest:
        if (f.get("scope") or "national") != "national" or f.get("metric") not in DIVERGENCE_METRICS:
            continue
        pub = f["publisher"]
        if pub == "OPMCM portal" and f["metric"] in ("dead", "missing", "rescued"):
            continue   # report counters, not casualty figures
        by_metric.setdefault(f["metric"], {})[pub] = {"value": float(f["value"]), "as_of": f.get("as_of"), "url": f.get("url")}
    metrics = []
    for metric, pubs in by_metric.items():
        if len(pubs) < 2:
            continue
        lo = min(pubs.items(), key=lambda kv: kv[1]["value"])
        hi = max(pubs.items(), key=lambda kv: kv[1]["value"])
        spread = hi[1]["value"] - lo[1]["value"]
        metrics.append({"metric": metric, "publishers": len(pubs), "spread": spread,
                        "spread_pct_of_min": round(100 * spread / lo[1]["value"]) if lo[1]["value"] else None,
                        "low": {"publisher": lo[0], **lo[1]}, "high": {"publisher": hi[0], **hi[1]},
                        "values": {p: v["value"] for p, v in sorted(pubs.items())}})
    if not metrics:
        return None
    metrics.sort(key=lambda m: -m["spread"])
    worst = metrics[0]
    return {"summary": f"Publishers disagree most on '{worst['metric']}': {worst['low']['publisher']} says {fmt_int(worst['low']['value'])}, "
                       f"{worst['high']['publisher']} says {fmt_int(worst['high']['value'])} (spread {fmt_int(worst['spread'])}). "
                       f"{len(metrics)} metric(s) have more than one publisher.",
            "metrics": metrics,
            "evidence": "figures_latest where scope='national' and metric in " + str(list(DIVERGENCE_METRICS))}


def unreached_by_record(place_status: list[dict[str, Any]], names: dict[str, str]) -> dict[str, Any] | None:
    """v_place_status_latest rows → places with expected > 0 (people reported there) and confirmed_reached = 0."""
    rows = []
    for p in place_status:
        exp, conf = int(p.get("expected") or 0), int(p.get("confirmed_reached") or 0)
        if exp > 0 and conf == 0:
            rows.append({"place_id": p["place_id"], "name": names.get(p["place_id"], p["place_id"]), "expected": exp,
                         "reports_count": int(p.get("reports_count") or 0), "last_contact_at": p.get("last_contact_at"),
                         "access": p.get("access"), "phones": p.get("phones"), "hazard": p.get("hazard")})
    if not rows:
        return None
    rows.sort(key=lambda r: -r["expected"])
    people = sum(r["expected"] for r in rows)
    top = ", ".join(f"{r['name']} ({r['expected']})" for r in rows[:5])
    return {"summary": f"{len(rows)} places have {fmt_int(people)} people reported missing there and no official rescue or "
                       f"stationed count at all — nobody in the record has reached them. Largest: {top}.",
            "places": len(rows), "people": people, "list": rows[:100],
            "evidence": "v_place_status_latest where expected > 0 and confirmed_reached = 0 "
                        "(expected = entities placed there or report subjects; confirmed = NDRRMA rescued/stationed place figures + rescuer reports)"}


def stale_sources(status_rows: list[dict[str, Any]], now: datetime) -> dict[str, Any] | None:
    stale = []
    for s in status_rows:
        mins = config.cadence_minutes(s.get("cadence"))
        if mins >= config.STATIC_MINUTES:
            continue
        lf = s.get("last_fetched_at")
        if not lf:
            continue
        age = (now - datetime.fromisoformat(lf.replace("Z", "+00:00"))).total_seconds() / 60
        limit = STALE_FACTOR * max(mins, config.PULL_INTERVAL_MINUTES)
        if age > limit or s.get("last_ok") is False:
            stale.append({"source": s["id"], "cadence": s.get("cadence"), "minutes_since_fetch": int(age), "limit_minutes": limit,
                          "last_ok": s.get("last_ok"), "error": (s.get("last_error") or "")[:120] or None})
    if not stale:
        return None
    stale.sort(key=lambda r: (r["last_ok"] is not False, -r["minutes_since_fetch"]))
    failing = [r["source"] for r in stale if r["last_ok"] is False]
    return {"summary": f"{len(stale)} sources are stale or failing ({len(failing)} failed on their last pull"
                       f"{': ' + ', '.join(failing[:6]) if failing else ''}); their figures on the site are older than they look.",
            "sources": stale,
            "evidence": f"v_sources_status: last_ok = false or now − last_fetched_at > {STALE_FACTOR} × max(cadence, PULL_INTERVAL_MINUTES={config.PULL_INTERVAL_MINUTES})"}


def duplicate_rate(ms: dict[str, Any]) -> dict[str, Any] | None:
    if not ms.get("entities"):
        return None
    return {"summary": f"{fmt_int(ms['merged'])} of {fmt_int(ms['entities'])} resolved people ({round(100 * ms['merge_rate'])}%) were built from "
                       f"more than one record; {fmt_int(ms['cross_source'])} span different lists. {fmt_int(ms['queue_open'])} ambiguous pairs await a human.",
            **ms, "evidence": "entities where jsonb_array_length(merged_from) > 1; dedup_queue where decision is null"}


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
        latest = db.select_all("figures_latest", {"select": "publisher,metric,scope,value,as_of,url", "scope": "eq.national"})
        pd = publisher_divergence(latest)
        if pd:
            findings.append({"kind": "publisher_divergence", "detail": pd})
        ps = db.select_all("v_place_status_latest", {"select": "place_id,expected,confirmed_reached,unknown,reports_count,last_contact_at,access,phones,hazard"})
        names = {p.id: p.name_en for p in ctx.gaz.all()}
        ur = unreached_by_record(ps, names)
        if ur:
            findings.append({"kind": "unreached_by_record", "detail": ur})
        ms = merge_stats(ctx)
        dr = duplicate_rate(ms)
        if dr:
            findings.append({"kind": "duplicate_rate", "detail": dr})
        ents = ctx.cache.get("entities_merged_from") or db.select_all("entities", {"select": "id,merged_from"})
        multi = [e for e in ents if len({m.get("source") for m in (e.get("merged_from") or [])}) >= 2]
        if multi:
            pairs = Counter("+".join(sorted({m.get("source") for m in e["merged_from"]})) for e in multi)
            findings.append({"kind": "duplicate_across_lists", "detail": {
                "summary": f"{len(multi)} people appear on more than one list ({', '.join(f'{k}: {v}' for k, v in pairs.most_common())}); "
                           f"reconcile these before quoting a missing total.",
                "entities": len(multi), "by_source_pair": dict(pairs), "entity_ids": [e["id"] for e in multi[:200]],
                "evidence": "entities where merged_from has ≥ 2 distinct sources"}})
        nd = {r["person_key"] for r in ndrrma_records(ctx)}
        op = opmcm_records(ctx)
        lost_rescued = [r for r in op if r["status"] == "lost" and r["person_key"] in nd]
        if lost_rescued:
            findings.append({"kind": "lost_but_rescued", "detail": {
                "summary": f"{len(lost_rescued)} people listed 'lost' on rescue.opmcm.gov.np are on the NDRRMA verified rescued list — "
                           f"close these OPMCM reports.",
                "count": len(lost_rescued), "opmcm_ids": [str(r["external_id"]) for r in lost_rescued[:300]],
                "evidence": "opmcm person_key (name+age band+nationality) ∩ ndrrma rescued-persons person_key",
                "note": "listed 'lost' on rescue.opmcm.gov.np but present on the NDRRMA verified rescued list (name+age band+nationality match)"}})
        setu = db.select("raw_pulls", {"select": "id", "source_id": "eq.setu_recordlist", "limit": 1})
        if setu:
            findings.append({"kind": "absent_from_setu", "detail": {
                "summary": "A Setu record-list pull exists but its cards are not yet compared with the other lists (wave-2 normaliser pending).",
                "note": "Setu pull present; card-level comparison needs the wave-2 setu normaliser", "count": None,
                "evidence": "raw_pulls where source_id = 'setu_recordlist'"}})
        st = stale_sources(db.select_all("v_sources_status", {"select": "id,cadence,last_fetched_at,last_ok,last_error"}), ctx.now)
        if st:
            findings.append({"kind": "stale_source", "detail": st})
        if not ctx.dry_run:
            db.delete("findings", {"kind": f"in.({','.join(KINDS)})", "handed_at": "is.null"})   # a kind that no longer applies disappears
            if findings:
                db.insert("findings", [{"kind": f["kind"], "detail": f["detail"], "created_at": ctx.now} for f in findings])
        log.info("findings.done", kinds=[f["kind"] for f in findings])
        return {"kinds": [f["kind"] for f in findings], "name_collision": (nc or {}).get("bhotekoshi_rm_rows"),
                "unreached_places": (ur or {}).get("places"), "lost_but_rescued": len(lost_rescued),
                "stale": len((st or {}).get("sources", [])), "summaries": {f["kind"]: f["detail"].get("summary") for f in findings}}
    except Exception as e:  # noqa: BLE001
        log.error("findings.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
