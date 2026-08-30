"""
processing/ledger.py — step ③. See docs/process_data/03-ledger.md.

For every gazetteer place with any signal, one place_status row (as_of = run time) and the
day-by-day place_timeline rows. All arithmetic is in pure functions so tests can pin it:

    expected          = max( #entities whose probable_place_id or last_place_id is here,
                             Σ reports_anon.subject_count (min 1 each) for reports placed here )
    confirmed_reached = latest NDRRMA figures `rescued` + `stationed` scoped place:<id>
                        + Σ subject_count of rescuer/agency reports here with status rescued|reported_safe
    unknown           = max(expected − confirmed_reached, 0)
    reports_count     = number of reports_anon rows placed here (withdrawn ones are never in reports_anon)
    last_contact_at   = max(report event_time, entity last_contact_at, place-scoped figure as_of,
                            article published_at mentioning the place, gauge observed_at)
    telecom_restored / phones  from telecom articles (NTC|Ncell|tower|टावर|सञ्चार) that mention the place:
                        'yes (since <d Mon>)' when restoration wording, 'no' when outage wording, else null
    access            observed: HOT bridge 'Washed out' here → road_partial; helipad kind → helicopter_only;
                        Sitrep #8 road bullets (ACCESS_OBSERVED, dated 29 Aug) override; else 'unknown'
    hazard            places.below_barrier_lakes → 'below_barrier_lakes' else in_channel → 'in_channel' else null
    nearest_gauge     corridor gauge closest by km chainage: 'Galchhi — alive' / 'Rasuwagadhi — dead since 26 Aug 08:40'
    shelter           NDRRMA stationed count at a shelter/hospital in the same district, else sitrep shelter_people
    status_label      no_data | mostly_unknown (unknown > expected/2) | mostly_reached
    note              bridge/helipad facts + first line of the place's `notes`

Timeline dots: confirmed (rescued/stationed figures, rescuer reports), unknown (lost/missing reports),
live (gauge alive, articles), neutral (everything else). NE/HI text comes from templates below;
article headlines stay in their own language.
"""
from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from lib import config, log
from processing import ProcCtx

STEP = "03-ledger"
TELECOM_RE = re.compile(r"\bNTC\b|Ncell|tower|BTS|telecom|mobile network|phone service|टावर|सञ्चार|मोबाइल|दूरसञ्चार|एनसेल|टेलिकम", re.I)
RESTORED_RE = re.compile(r"restor|resum|back (?:up|on)|reconnect|operational|मर्मत|सञ्चालनमा|पुनः|सुचारु|फर्क", re.I)
OUTAGE_RE = re.compile(r"still (?:down|out|cut)|without (?:communication|network|phone)|no (?:network|signal|communication)|cut off|सञ्चारविहीन|सम्पर्कविहीन|बन्द|अवरुद्ध|ठप्प", re.I)
# Sitrep #8 (29 Aug 18:30 NPT) road status bullets + HOT survey — the only observed access facts so far.
ACCESS_OBSERVED = {
    "dhunche": "road_partial", "galchhi": "road", "malekhu": "road", "mugling": "road", "benighat": "road", "gajuri": "road",
    "bidur": "road_partial", "trishuli_bazar": "road_partial", "battar": "road_partial", "betrawati": "road_partial",
    "syabrubesi": "helicopter_only", "timure": "helicopter_only", "mailung": "helicopter_only", "ut1_mailung_camp": "helicopter_only",
    "rasuwagadhi": "helicopter_only", "langtang_village": "foot", "kyanjin_gompa": "foot", "lama_hotel": "foot", "thulo_syabru": "foot",
}
CORRIDOR_GAUGE_IDS = [pid for _, pid, _ in config.CORRIDOR_GAUGES]
GAUGE_KM = {"rasuwagadhi": 0.0, "syabrubesi": 16.0, "betrawati": 46.0, "dhunche": 30.0, "galchhi": 75.0, "malekhu": 90.0,
            "kali_khola": 100.0, "devghat": 125.0, "bhorle": 95.0}


# ─── pure arithmetic ─────────────────────────────────────────────────────────

def expected_count(entities_here: int, report_subjects: int) -> int:
    return max(int(entities_here), int(report_subjects), 0)


def confirmed_count(ndrrma_rescued: int, ndrrma_stationed: int, rescuer_reported: int) -> int:
    return max(int(ndrrma_rescued) + int(ndrrma_stationed) + int(rescuer_reported), 0)


def unknown_count(expected: int, confirmed: int) -> int:
    return max(int(expected) - int(confirmed), 0)


def status_label(expected: int, confirmed: int, unknown: int) -> str:
    if expected == 0 and confirmed == 0:
        return "no_data"
    return "mostly_unknown" if unknown > expected / 2 else "mostly_reached"


def phones_from_articles(arts: list[dict[str, Any]]) -> tuple[bool | None, str | None]:
    """arts = telecom articles mentioning the place, newest first → (telecom_restored, display)."""
    for a in arts:
        t = f"{a.get('title') or ''} {a.get('body') or ''}"
        if RESTORED_RE.search(t):
            d = _dt(a.get("published_at"))
            return True, f"yes (since {d.astimezone(config.KTM).strftime('%-d %b')})" if d else "yes"
        if OUTAGE_RE.search(t):
            return False, "no"
    return None, None


def nearest_gauge_label(place_km: float | None, gauges_latest: dict[str, dict[str, Any]]) -> str | None:
    """gauges_latest: place_id → {alive, observed_at, label}."""
    if place_km is None or not gauges_latest:
        return None
    best = min(gauges_latest.items(), key=lambda kv: abs(GAUGE_KM.get(kv[0], 1e9) - place_km))
    g = best[1]
    if g.get("alive"):
        return f"{g['label']} — alive"
    d = _dt(g.get("observed_at"))
    return f"{g['label']} — dead since {d.astimezone(config.KTM).strftime('%-d %b %H:%M')}" if d else f"{g['label']} — dead"


# ─── templates (EN / NE / HI) ────────────────────────────────────────────────

T = {
    "reports": ("{n} report(s) added on this site", "यस साइटमा {n} विवरण थपियो", "इस साइट पर {n} रिपोर्ट जोड़ी गई"),
    "reports_missing": ("{n} report(s) of people not yet reached", "{n} जना सम्पर्कबाहिर रहेको विवरण", "{n} लोगों से संपर्क न होने की रिपोर्ट"),
    "ndrrma_rescued": ("NDRRMA lists {n} people rescued from here", "NDRRMA सूचीअनुसार यहाँबाट {n} जना उद्धार", "NDRRMA सूची: यहाँ से {n} लोग बचाए गए"),
    "ndrrma_stationed": ("NDRRMA lists {n} rescued people held here", "NDRRMA सूचीअनुसार यहाँ {n} जना राखिएका", "NDRRMA सूची: यहाँ {n} बचाए गए लोग रखे गए"),
    "opmcm_lost": ("{n} people reported missing here on the PM's portal", "प्रधानमन्त्री पोर्टलमा यहाँ {n} जना हराएको विवरण", "पीएम पोर्टल पर यहाँ {n} लोग लापता दर्ज"),
    "gauge_alive": ("River gauge live ({v} m)", "नदी मापन केन्द्र सक्रिय ({v} मि)", "नदी गेज सक्रिय ({v} मी)"),
    "gauge_dead": ("River gauge silent since {t}", "नदी मापन केन्द्र {t} देखि मौन", "नदी गेज {t} से बंद"),
    "bridge": ("{n} bridge(s) surveyed washed out or damaged", "{n} पुल बगेको/क्षतिग्रस्त", "{n} पुल बह गए/क्षतिग्रस्त"),
    "precip": ("Forecast rain {v} mm", "वर्षा पूर्वानुमान {v} मिमि", "वर्षा पूर्वानुमान {v} मिमी"),
    "flying_good": ("Morning flying window: good", "बिहानको उडान अवसर: राम्रो", "सुबह की उड़ान खिड़की: अच्छी"),
    "flying_poor": ("Morning flying window: poor", "बिहानको उडान अवसर: कमजोर", "सुबह की उड़ान खिड़की: खराब"),
}


def tpl(key: str, **kw: Any) -> tuple[str, str, str]:
    en, ne, hi = T[key]
    return en.format(**kw), ne.format(**kw), hi.format(**kw)


def _dt(v: Any) -> datetime | None:
    if not v:
        return None
    if isinstance(v, datetime):
        return v
    try:
        d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=config.KTM)
    except ValueError:
        return None


def _day(v: Any) -> str | None:
    d = _dt(v)
    return d.astimezone(config.KTM).strftime("%Y-%m-%d") if d else None


# ─── the step ────────────────────────────────────────────────────────────────

def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        return _run(ctx)
    except Exception as e:  # noqa: BLE001
        log.error("ledger.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}


def _run(ctx: ProcCtx) -> dict[str, Any]:
    db, gaz = ctx.db, ctx.gaz
    known = {p.id for p in gaz.all()} if gaz.source == "db" else set(r["id"] for r in db.select_all("places", {"select": "id"}))
    since = (ctx.now - timedelta(days=config.ARTICLE_LOOKBACK_DAYS)).isoformat()
    reports = db.select_all("reports_anon", {"select": "id,place_id,subject_count,respondent_type,status,event_time,created_at"})
    entities = db.select_all("entities", {"select": "id,probable_place_id,last_place_id,last_contact_at,status"})
    figs = db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,note,url", "scope": "like.place:*",
                                     "fetched_at": f"gte.{since}", "order": "as_of.desc"})
    arts = db.select_all("articles", {"select": "id,title,body,publisher,published_at,places,url", "places": "neq.{}",
                                      "fetched_at": f"gte.{since}", "order": "published_at.desc"})
    gauges = db.select_all("v_gauges_latest", {"select": "station_id,station_name,level,observed_at,alive"})
    district_shelter = {}
    for f in db.select("figures", {"select": "scope,metric,value,as_of", "publisher": "eq.NDRRMA", "metric": "in.(shelter_people,shelter_sites)",
                                   "order": "as_of.desc", "limit": 40}):
        district_shelter.setdefault((f["scope"], f["metric"]), f["value"])

    # latest figure per (publisher, metric, place)
    latest: dict[tuple[str, str, str], dict[str, Any]] = {}
    per_place_figs: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for f in figs:
        pid = f["scope"].split(":", 1)[1].split("|")[0]
        per_place_figs[pid].append(f)
        latest.setdefault((f["publisher"], f["metric"], pid), f)

    gauges_latest: dict[str, dict[str, Any]] = {}
    for g in gauges:
        for title, pid, label in config.CORRIDOR_GAUGES:
            if (g.get("station_name") or "").strip().lower() == title.lower():
                cur = gauges_latest.get(pid)
                if not cur or (g.get("alive") and not cur.get("alive")):
                    gauges_latest[pid] = {"alive": bool(g.get("alive")), "observed_at": g.get("observed_at"), "label": label, "level": g.get("level")}

    ent_here: dict[str, int] = defaultdict(int)
    ent_last: dict[str, datetime] = {}
    for e in entities:
        pid = e.get("probable_place_id") or e.get("last_place_id")
        if pid:
            ent_here[pid] += 1
            d = _dt(e.get("last_contact_at"))
            if d and (pid not in ent_last or d > ent_last[pid]):
                ent_last[pid] = d
    rep_here: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in reports:
        if r.get("place_id"):
            rep_here[r["place_id"]].append(r)
    arts_here: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for a in arts:
        for pid in a.get("places") or []:
            arts_here[pid].append(a)

    signal_places = set(ent_here) | set(rep_here) | set(per_place_figs) | set(arts_here) | set(gauges_latest)
    signal_places &= known
    status_rows: list[dict[str, Any]] = []
    timeline: dict[tuple[str, str, str], dict[str, Any]] = {}

    def tl(pid: str, day: str | None, key: str, dot: str, url: str | None = None, **kw: Any) -> None:
        if not day:
            return
        en, ne, hi = tpl(key, **kw)
        timeline[(pid, day, en)] = {"place_id": pid, "day": day, "what_en": en, "what_ne": ne, "what_hi": hi, "dot": dot, "source_url": url, "computed_at": ctx.now}

    for pid in sorted(signal_places):
        place = gaz.get(pid)
        reps = rep_here.get(pid, [])
        subjects = sum(max(int(r.get("subject_count") or 1), 1) for r in reps)
        rescuer = sum(max(int(r.get("subject_count") or 1), 1) for r in reps
                      if r.get("respondent_type") in ("rescuer", "agency") and (r.get("status") or "") in ("rescued", "reported_safe"))
        nd_rescued = int((latest.get(("NDRRMA", "rescued", pid)) or {}).get("value") or 0)
        nd_stationed = int((latest.get(("NDRRMA", "stationed", pid)) or {}).get("value") or 0)
        expected = expected_count(ent_here.get(pid, 0), subjects)
        confirmed = confirmed_count(nd_rescued, nd_stationed, rescuer)
        unknown = unknown_count(expected, confirmed)
        # last contact
        cands = [ent_last.get(pid)] + [_dt(r.get("event_time")) for r in reps] + [_dt(f.get("as_of")) for f in per_place_figs.get(pid, [])[:50]
                 if f.get("publisher") not in ("Open-Meteo (ECMWF)",)] + [_dt(a.get("published_at")) for a in arts_here.get(pid, [])[:20]]
        if pid in gauges_latest and gauges_latest[pid]["alive"]:
            cands.append(_dt(gauges_latest[pid]["observed_at"]))
        cands = [c for c in cands if c and c <= ctx.now + timedelta(hours=1)]
        last_contact = max(cands) if cands else None
        # phones
        tel = [a for a in arts_here.get(pid, []) if TELECOM_RE.search(f"{a.get('title') or ''} {a.get('body') or ''}")]
        telecom_restored, phones = phones_from_articles(tel)
        # access / hazard / note
        bridges = [f for f in per_place_figs.get(pid, []) if f["metric"] == "bridge_status" and re.match(r"washed out|damaged", f.get("note") or "", re.I)]
        access = ACCESS_OBSERVED.get(pid) or ("helicopter_only" if place and place.kind == "helipad" else "road_partial" if bridges else "unknown")
        hazard = None
        if place:
            hazard = "below_barrier_lakes" if place.below_barrier_lakes else "in_channel" if place.in_channel else None
        notes = []
        if bridges:
            notes.append(f"{len(bridges)} bridge(s) washed out/damaged (HOT survey)")
        if place and place.notes:
            notes.append(place.notes.split(";")[0].split(".")[0][:120])
        # shelter
        shelter = None
        if place:
            for (pub, metric, spid), f in latest.items():
                sp = gaz.get(spid)
                if pub == "NDRRMA" and metric == "stationed" and sp and sp.kind in ("shelter", "hospital") and sp.district == place.district and f["value"]:
                    shelter = f"{sp.name_en}: {int(f['value'])} people"
                    break
            if not shelter and place.district:
                dk = place.district.lower().replace(" ", "_")
                ppl = district_shelter.get((f"district:{dk}", "shelter_people"))
                sites = district_shelter.get((f"district:{dk}", "shelter_sites"))
                if ppl:
                    shelter = f"{place.district}: {int(ppl)} people in {int(sites) if sites else '?'} sites (NDRRMA)"
        status_rows.append({
            "place_id": pid, "as_of": ctx.now, "expected": expected, "confirmed_reached": confirmed, "unknown": unknown,
            "reports_count": len(reps), "last_contact_at": last_contact, "telecom_restored": telecom_restored, "phones": phones,
            "access": access, "hazard": hazard, "nearest_gauge": nearest_gauge_label(place.km if place else None, gauges_latest),
            "shelter": shelter, "km": place.km if place else None, "status_label": status_label(expected, confirmed, unknown),
            "note": " · ".join(n for n in notes if n) or None,
        })
        # timeline
        by_day: dict[str, int] = defaultdict(int)
        miss_by_day: dict[str, int] = defaultdict(int)
        for r in reps:
            d = _day(r.get("created_at"))
            if d:
                by_day[d] += 1
                if (r.get("status") or "") in ("missing", "unknown"):
                    miss_by_day[d] += 1
        for d, n in by_day.items():
            tl(pid, d, "reports", "neutral", n=n)
        for d, n in miss_by_day.items():
            tl(pid, d, "reports_missing", "unknown", n=n)
        seen_keys: set[tuple[str, str]] = set()
        for f in per_place_figs.get(pid, []):
            d = _day(f.get("as_of"))
            k = (f["publisher"], f["metric"])
            if f["publisher"] == "NDRRMA" and f["metric"] in ("rescued", "stationed") and (k, d) not in seen_keys:
                seen_keys.add((k, d))
                tl(pid, d, f"ndrrma_{f['metric']}", "confirmed", f.get("url"), n=int(f["value"]))
            elif f["publisher"] == "OPMCM portal" and f["metric"] == "lost_reports" and "|" not in f["scope"] and (k, d) not in seen_keys:
                seen_keys.add((k, d))
                tl(pid, d, "opmcm_lost", "unknown", f.get("url"), n=int(f["value"]))
            elif f["publisher"] == "Open-Meteo (ECMWF)" and f["metric"] == "flying_window_quality" and (k, d) not in seen_keys:
                seen_keys.add((k, d))
                tl(pid, d, "flying_good" if f["value"] else "flying_poor", "neutral", f.get("url"))
        if bridges:
            tl(pid, _day(bridges[0].get("as_of")), "bridge", "unknown", bridges[0].get("url"), n=len(bridges))
        if pid in gauges_latest:
            g = gauges_latest[pid]
            d = _day(g["observed_at"])
            if g["alive"]:
                tl(pid, _day(ctx.now), "gauge_alive", "live", None, v=f"{float(g['level'] or 0):.2f}")
            else:
                tl(pid, d, "gauge_dead", "unknown", None, t=_dt(g["observed_at"]).astimezone(config.KTM).strftime("%-d %b %H:%M"))
        for a in arts_here.get(pid, [])[:15]:
            d = _day(a.get("published_at"))
            if d and a.get("title"):
                title = a["title"][:140]
                timeline[(pid, d, title)] = {"place_id": pid, "day": d, "what_en": title, "what_ne": title, "what_hi": title,
                                             "dot": "live", "source_url": a.get("url"), "computed_at": ctx.now}

    if not ctx.dry_run:
        if status_rows:
            db.upsert("place_status", status_rows, on_conflict="place_id,as_of")
        rows = list(timeline.values())
        if rows:
            db.upsert("place_timeline", rows, on_conflict="place_id,day,what_en")
    log.info("ledger.done", places=len(status_rows), timeline=len(timeline))
    return {"places": len(status_rows), "timeline": len(timeline),
            "with_unknown": sum(1 for r in status_rows if r["unknown"] > 0)}
