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
    last_contact_at   = the last OBSERVED contact from the place: max(reports_anon.event_time placed here,
                            NDRRMA rescued/stationed figure as_of here (only when as_of is not the fetch time), telecom_restored figure as_of here,
                            event_timeline gauge/wave/impact events here) — never a fetch/compute time; NULL when none
    telecom_restored / phones  "phones hook": the newest telecom signal for the place wins —
                        figures 'NTC/Ncell via press' telecom_restored / telecom_outage (normalisers/ntc_restoration_articles,
                        computed here from the last 3 days of place-resolved articles and upserted) and, as a fallback,
                        telecom articles (TELECOM_RE) with RESTORED_RE / OUTAGE_RE wording:
                        'yes (since <d Mon>)' · 'no' · null
    access            observed: HOT bridge 'Washed out' here → road_partial; helipad kind → helicopter_only;
                        bridge inventories (NESRA / DoR via `bridges_washed_out` > 0 → road_partial, `bridges_damaged` > 0
                        with all others intact → road) fill in when no sitrep bullet exists;
                        Sitrep #8 road bullets (ACCESS_OBSERVED, dated 29 Aug) override; else 'unknown'
    hazard            places.below_barrier_lakes → 'below_barrier_lakes' else in_channel → 'in_channel' else null
    nearest_gauge     corridor gauge closest by km chainage: 'Galchhi — alive' / 'Rasuwagadhi — dead since 26 Aug 08:40'
    shelter           NDRRMA stationed count at a shelter/hospital in the same district, else sitrep shelter_people
    status_label      district (places.kind = 'district', plus the DISTRICT_LIKE ids the OPMCM projection swamps) |
                        no_data | mostly_unknown (unknown > expected/2) | mostly_reached
    note              open help requests here (OPMCM `help_requests_open` / `help_requests_critical` / `people_affected_reported`,
                        scope place:<id>) + bridge facts (HOT survey, NESRA/DoR inventories) + first line of the place's `notes`

Timeline dots: confirmed (rescued/stationed figures, rescuer reports), unknown (lost/missing reports),
live (gauge alive, articles), neutral (everything else). Every place-scoped figure family the pipeline emits has a
timeline template (PLACE_FIGURE_LINES) so a corridor place with any dated figure never shows an empty "day by day". NE/HI text comes from templates below;
article headlines stay in their own language.
"""
from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from lib import config, log
from normalisers.ntc_restoration_articles import LOOKBACK_DAYS as TELECOM_LOOKBACK_DAYS
from normalisers.ntc_restoration_articles import OUTAGE_RE, RESTORED_RE, TELECOM_RE
from normalisers.ntc_restoration_articles import PUBLISHER as TELECOM_PUBLISHER
from normalisers.ntc_restoration_articles import scan_articles
from processing import ProcCtx

STEP = "03-ledger"
# TELECOM_RE / RESTORED_RE / OUTAGE_RE live in normalisers/ntc_restoration_articles (one definition for both lanes).
DISTRICT_LIKE = {"kathmandu", "bhotekoshi_rm_sindhupalchok"}     # settlement-kind ids that behave like districts on the site
CONTACT_TIMELINE_KINDS = {"gauge", "wave", "impact"}
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


def reconcile_counts(expected: int, confirmed: int) -> tuple[int, int]:
    """(expected, unknown) with expected raised to confirmed when more people are confirmed there than were expected
    (hospital admission lists, NDRRMA rescued figures) — the ledger never shows confirmed > expected."""
    exp = max(int(expected), int(confirmed), 0)
    return exp, unknown_count(exp, confirmed)


def status_label(expected: int, confirmed: int, unknown: int, kind: str | None = None, place_id: str | None = None) -> str:
    if kind == "district" or (place_id and place_id in DISTRICT_LIKE):
        return "district"
    if expected == 0 and confirmed == 0:
        return "no_data"
    return "mostly_unknown" if unknown > expected / 2 else "mostly_reached"


def is_district_like(place: Any, place_id: str | None = None) -> bool:
    return bool(place is not None and getattr(place, "kind", "") == "district") or (place_id or "") in DISTRICT_LIKE


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


def phones_status(telecom_figs: list[dict[str, Any]], arts: list[dict[str, Any]]) -> tuple[bool | None, str | None, datetime | None]:
    """
    The phones hook. telecom_figs = figures 'NTC/Ncell via press' scoped to the place (telecom_restored / telecom_outage,
    any order); arts = telecom articles mentioning the place. The newest dated signal wins; a figure beats an article on the
    same instant. → (telecom_restored, display, restored_at).
    """
    events: list[tuple[datetime, int, bool]] = []          # (at, priority, restored?)
    for f in telecom_figs:
        d = _dt(f.get("as_of"))
        if d and f.get("metric") in ("telecom_restored", "telecom_outage"):
            events.append((d, 1, f["metric"] == "telecom_restored"))
    for a in arts:
        t = f"{a.get('title') or ''} {a.get('body') or ''}"
        d = _dt(a.get("published_at"))
        if not d or not TELECOM_RE.search(t):
            continue
        if RESTORED_RE.search(t):
            events.append((d, 0, True))
        elif OUTAGE_RE.search(t):
            events.append((d, 0, False))
    if not events:
        restored, display = phones_from_articles(arts)     # undated articles still count
        return restored, display, None
    at, _, restored = max(events, key=lambda e: (e[0], e[1]))
    if restored:
        return True, f"yes (since {at.astimezone(config.KTM).strftime('%-d %b')})", at
    return False, "no", None


def is_observed(as_of: Any, fetched_at: Any) -> bool:
    """A figure whose as_of is just its fetch time (the register gives no validity time) is not an observation."""
    a, f = _dt(as_of), _dt(fetched_at)
    if a is None:
        return False
    return f is None or abs((a - f).total_seconds()) > 120


def last_contact(report_times: list[Any], figure_times: list[Any], telecom_times: list[Any], timeline_times: list[Any],
                 now: datetime) -> datetime | None:
    """Last observed contact from the place: max of the dated observations, futures (> now + 1 h) dropped, else None."""
    cands = [_dt(v) for v in list(report_times) + list(figure_times) + list(telecom_times) + list(timeline_times)]
    cands = [c for c in cands if c and c <= now + timedelta(hours=1)]
    return max(cands) if cands else None


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
    "telecom_restored": ("Mobile network reported restored (NTC/Ncell via press)", "मोबाइल नेटवर्क पुनः सञ्चालनमा (प्रेसमार्फत NTC/Ncell)", "मोबाइल नेटवर्क बहाल होने की खबर (प्रेस के ज़रिये NTC/Ncell)"),
    "telecom_outage": ("Mobile network reported down (press)", "मोबाइल नेटवर्क बन्द रहेको खबर (प्रेस)", "मोबाइल नेटवर्क बंद होने की खबर (प्रेस)"),
    "setu_missing": ("{n} people registered missing here with NDRRMA (Setu)", "NDRRMA (सेतु) मा यहाँ {n} जना हराएको दर्ता", "NDRRMA (सेतु) में यहाँ {n} लोग लापता दर्ज"),
    "dao_rescued": ("District administration lists {n} people rescued from here", "जिल्ला प्रशासन सूचीअनुसार यहाँबाट {n} जना उद्धार", "जिला प्रशासन सूची: यहाँ से {n} लोग बचाए गए"),
    "volunteer_rescued": ("Volunteer rescue bulletin lists {n} rescued from here", "स्वयंसेवी उद्धार बुलेटिनमा यहाँबाट {n} जना उद्धार", "स्वयंसेवी बचाव बुलेटिन: यहाँ से {n} बचाए गए"),
    "bridges_to_inspect": ("{n} bridge(s) here flagged for inspection (NESRA FloodWatch)", "यहाँका {n} पुल निरीक्षण गर्नुपर्ने (NESRA FloodWatch)", "यहाँ {n} पुल निरीक्षण के लिए चिह्नित (NESRA FloodWatch)"),
    "bridges_damaged": ("{n} bridge(s) here damaged, {w} washed out (inventory)", "यहाँका {n} पुल क्षतिग्रस्त, {w} बगेका (सूची)", "यहाँ {n} पुल क्षतिग्रस्त, {w} बह गए (सूची)"),
    "ems_buildings": ("Copernicus EMS: {n} of {total} buildings affected", "Copernicus EMS: {total} मध्ये {n} भवन प्रभावित", "Copernicus EMS: {total} में से {n} इमारतें प्रभावित"),
    "help_requests": ("{n} open help request(s) here on the PM's portal ({c} critical)", "प्रधानमन्त्री पोर्टलमा यहाँका {n} सहयोग अनुरोध खुला ({c} गम्भीर)", "पीएम पोर्टल पर यहाँ {n} सहायता अनुरोध खुले ({c} गंभीर)"),
    "people_affected": ("{n} people reported affected here (PM's portal help requests)", "प्रधानमन्त्री पोर्टलका अनुरोधअनुसार यहाँ {n} जना प्रभावित", "पीएम पोर्टल के अनुरोधों के अनुसार यहाँ {n} लोग प्रभावित"),
}
# (publisher, metric) → (template, dot); the pure `figure_lines()` turns a place's figures into day-by-day rows with these.
PLACE_FIGURE_LINES: dict[tuple[str, str], tuple[str, str]] = {
    ("Setu (NDRRMA)", "missing"): ("setu_missing", "unknown"),
    ("DAO Nuwakot", "rescued"): ("dao_rescued", "confirmed"),
    ("DAO Rasuwa", "rescued"): ("dao_rescued", "confirmed"),
    ("Volunteer bulletin (nirajbhusal)", "rescued"): ("volunteer_rescued", "confirmed"),
    ("NESRA FloodWatch", "bridges_to_inspect"): ("bridges_to_inspect", "neutral"),
}
HELP_METRICS = ("help_requests_open", "help_requests_critical", "people_affected_reported")
BRIDGE_METRICS = ("bridges_damaged", "bridges_washed_out", "bridges_intact")


def figure_lines(figs: list[dict[str, Any]]) -> list[tuple[str | None, str, str, str | None, dict[str, Any]]]:
    """
    A place's figures (any publisher, newest first) → [(day, template key, dot, url, kwargs)] for the families not handled
    by name in the step body: Setu / DAO / volunteer counts, NESRA bridges to inspect, bridge inventories (bridges_damaged +
    bridges_washed_out on the same day), Copernicus EMS buildings, OPMCM help requests. One line per (family, day).
    """
    out: list[tuple[str | None, str, str, str | None, dict[str, Any]]] = []
    seen: set[tuple[str, str | None]] = set()
    by_day: dict[tuple[str, str | None], dict[str, dict[str, Any]]] = defaultdict(dict)   # (publisher, day) → metric → figure
    for f in figs:
        d = _day(f.get("as_of"))
        key = (str(f.get("publisher")), str(f.get("metric")))
        by_day[(key[0], d)].setdefault(key[1], f)
        if key in PLACE_FIGURE_LINES and (key[1], d) not in seen and int(f.get("value") or 0) > 0:
            seen.add((key[1], d))
            tk, dot = PLACE_FIGURE_LINES[key]
            out.append((d, tk, dot, f.get("url"), {"n": int(f["value"])}))
    for (pub, d), metrics in by_day.items():
        if "bridges_damaged" in metrics and ("bridges", d) not in seen:
            dmg, wo = int(metrics["bridges_damaged"].get("value") or 0), int((metrics.get("bridges_washed_out") or {}).get("value") or 0)
            if dmg + wo > 0:
                seen.add(("bridges", d))
                out.append((d, "bridges_damaged", "unknown", metrics["bridges_damaged"].get("url"), {"n": dmg, "w": wo}))
        if "buildings_affected" in metrics and ("ems", d) not in seen:
            aff, tot = int(metrics["buildings_affected"].get("value") or 0), int((metrics.get("buildings_total") or {}).get("value") or 0)
            if aff > 0:
                seen.add(("ems", d))
                out.append((d, "ems_buildings", "unknown", metrics["buildings_affected"].get("url"), {"n": aff, "total": tot or "?"}))
        if "help_requests_open" in metrics and ("help", d) not in seen:
            n, c = int(metrics["help_requests_open"].get("value") or 0), int((metrics.get("help_requests_critical") or {}).get("value") or 0)
            if n > 0:
                seen.add(("help", d))
                out.append((d, "help_requests", "unknown", metrics["help_requests_open"].get("url"), {"n": n, "c": c}))
        if "people_affected_reported" in metrics and ("affected", d) not in seen:
            n = int(metrics["people_affected_reported"].get("value") or 0)
            if n > 0:
                seen.add(("affected", d))
                out.append((d, "people_affected", "unknown", metrics["people_affected_reported"].get("url"), {"n": n}))
    return out


def latest_metric(figs: list[dict[str, Any]], metric: str, publishers: tuple[str, ...] | None = None) -> dict[str, Any] | None:
    """Newest figure with this metric (figs newest first), optionally restricted to publishers."""
    for f in figs:
        if f.get("metric") == metric and (publishers is None or f.get("publisher") in publishers):
            return f
    return None


def access_from_bridges(figs: list[dict[str, Any]], fallback: str) -> str:
    """Bridge inventory figures (bridges_washed_out / bridges_damaged / bridges_intact) → access, else `fallback`."""
    wo = latest_metric(figs, "bridges_washed_out")
    dmg = latest_metric(figs, "bridges_damaged")
    if wo and int(wo.get("value") or 0) > 0:
        return "road_partial"
    if dmg and int(dmg.get("value") or 0) > 0:
        return "road_partial"
    intact = latest_metric(figs, "bridges_intact")
    if intact and int(intact.get("value") or 0) > 0 and fallback == "unknown":
        return "road"
    return fallback


def help_note(figs: list[dict[str, Any]]) -> str | None:
    """'12 open help requests (3 critical), 40 people reported affected (PM portal)' from the newest OPMCM help figures."""
    n = latest_metric(figs, "help_requests_open")
    if not n or int(n.get("value") or 0) <= 0:
        return None
    c = latest_metric(figs, "help_requests_critical")
    a = latest_metric(figs, "people_affected_reported")
    parts = [f"{int(n['value'])} open help request(s)" + (f" ({int(c['value'])} critical)" if c and int(c.get("value") or 0) > 0 else "")]
    if a and int(a.get("value") or 0) > 0:
        parts.append(f"{int(a['value'])} people reported affected")
    return ", ".join(parts) + " (PM portal)"


def bridge_note(figs: list[dict[str, Any]]) -> str | None:
    dmg = latest_metric(figs, "bridges_damaged")
    wo = latest_metric(figs, "bridges_washed_out")
    d, w = int((dmg or {}).get("value") or 0), int((wo or {}).get("value") or 0)
    if d + w <= 0:
        return None
    src = (dmg or wo or {}).get("publisher") or "inventory"
    return f"{d} bridge(s) damaged, {w} washed out ({src})"


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


def _jsonable_dt(v: Any) -> str | None:
    d = _dt(v)
    return d.isoformat() if d else None


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
    figs = db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,fetched_at,note,url", "scope": "like.place:*",
                                     "fetched_at": f"gte.{since}", "order": "as_of.desc"})
    arts = db.select_all("articles", {"select": "id,title,body,publisher,published_at,places,url", "places": "neq.{}",
                                      "fetched_at": f"gte.{since}", "order": "published_at.desc"})
    gauges = db.select_all("v_gauges_latest", {"select": "station_id,station_name,level,observed_at,alive"})
    try:
        timeline_events = db.select_all("event_timeline", {"select": "place_id,at,kind"})
    except Exception as e:  # noqa: BLE001 — the seeded table is optional
        log.warn("ledger.event_timeline_unavailable", error=type(e).__name__)
        timeline_events = []
    # phones hook: telecom figures derived from the last TELECOM_LOOKBACK_DAYS of place-resolved articles
    # (normalisers/ntc_restoration_articles.scan_articles), upserted so the site's /numbers shows them too.
    telecom_rows = scan_articles(arts, gaz, ctx.now, since=ctx.now - timedelta(days=TELECOM_LOOKBACK_DAYS))
    if telecom_rows.figures and not ctx.dry_run:
        try:
            db.upsert_figures(telecom_rows.figures)
        except Exception as e:  # noqa: BLE001 — the ledger still uses them in memory
            log.error("ledger.telecom_figures_failed", error=f"{type(e).__name__}: {str(e)[:120]}")
    telecom_here: dict[str, list[dict[str, Any]]] = defaultdict(list)
    seen_tel: set[tuple[str, str, str]] = set()
    for f in [f for f in figs if f.get("publisher") == TELECOM_PUBLISHER] + telecom_rows.figures:
        pid = str(f["scope"]).split(":", 1)[1].split("|")[0] if ":" in str(f.get("scope")) else None
        key = (pid or "", str(f.get("metric")), str(_jsonable_dt(f.get("as_of"))))
        if pid and key not in seen_tel:
            seen_tel.add(key)
            telecom_here[pid].append(f)
    tl_times: dict[str, list[Any]] = defaultdict(list)
    for ev in timeline_events:
        if ev.get("place_id") and (ev.get("kind") or "") in CONTACT_TIMELINE_KINDS:
            tl_times[ev["place_id"]].append(ev.get("at"))
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
    for e in entities:
        pid = e.get("probable_place_id") or e.get("last_place_id")
        if pid:
            ent_here[pid] += 1
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
        confirmed = confirmed_count(nd_rescued, nd_stationed, rescuer)
        expected, unknown = reconcile_counts(expected_count(ent_here.get(pid, 0), subjects), confirmed)
        # phones (hook): NTC/Ncell figures for the place, then telecom articles — newest dated signal wins
        tel_figs = telecom_here.get(pid, [])
        tel = [a for a in arts_here.get(pid, []) if TELECOM_RE.search(f"{a.get('title') or ''} {a.get('body') or ''}")]
        telecom_restored, phones, restored_at = phones_status(tel_figs, tel)
        # last OBSERVED contact from the place — reports, NDRRMA rescued/stationed, phones back, event timeline; else NULL
        nd_times = [f.get("as_of") for f in per_place_figs.get(pid, []) if f.get("publisher") == "NDRRMA" and f.get("metric") in ("rescued", "stationed")
                    and is_observed(f.get("as_of"), f.get("fetched_at"))]
        last_contact_at = last_contact([r.get("event_time") for r in reps], nd_times, [restored_at] if restored_at else [],
                                       tl_times.get(pid, []), ctx.now)
        # access / hazard / note
        pfigs = per_place_figs.get(pid, [])
        bridges = [f for f in pfigs if f["metric"] == "bridge_status" and re.match(r"washed out|damaged", f.get("note") or "", re.I)]
        access = ACCESS_OBSERVED.get(pid) or ("helicopter_only" if place and place.kind == "helipad" else "road_partial" if bridges else "unknown")
        if pid not in ACCESS_OBSERVED:
            access = access_from_bridges(pfigs, access)
        hazard = None
        if place:
            hazard = "below_barrier_lakes" if place.below_barrier_lakes else "in_channel" if place.in_channel else None
        notes = [help_note(pfigs)]
        if bridges:
            notes.append(f"{len(bridges)} bridge(s) washed out/damaged (HOT survey)")
        notes.append(bridge_note(pfigs))
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
            "reports_count": len(reps), "last_contact_at": last_contact_at, "telecom_restored": telecom_restored, "phones": phones,
            "access": access, "hazard": hazard, "nearest_gauge": nearest_gauge_label(place.km if place else None, gauges_latest),
            "shelter": shelter, "km": place.km if place else None,
            "status_label": status_label(expected, confirmed, unknown, place.kind if place else None, pid),
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
            elif f["publisher"] == "Open-Meteo (ECMWF)" and f["metric"].startswith("flying_window_quality") and (k, d) not in seen_keys:
                seen_keys.add((k, d))
                tl(pid, d, "flying_good" if f["value"] else "flying_poor", "neutral", f.get("url"))
        if bridges:
            tl(pid, _day(bridges[0].get("as_of")), "bridge", "unknown", bridges[0].get("url"), n=len(bridges))
        for d, key, dot, url, kw in figure_lines(pfigs):
            tl(pid, d, key, dot, url, **kw)
        for f in sorted(tel_figs, key=lambda f: str(f.get("as_of")), reverse=True)[:6]:
            if f.get("metric") in ("telecom_restored", "telecom_outage"):
                tl(pid, _day(f.get("as_of")), f["metric"], "live" if f["metric"] == "telecom_restored" else "unknown", f.get("url"))
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
