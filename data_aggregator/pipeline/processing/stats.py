"""
processing/stats.py — step ⑤. See docs/process_data/05-stats.md.

The striking numbers on the home page: every row is a big value (≤ 14 characters) + a caption in EN / NE / HI,
with `as_of` and `source_url`. Four are static (seeded from the design's Home v3 renderVals, each with a source);
the rest are recomputed from the database every run — a stat that cannot be computed this run keeps its last row.

    static      wave_time_to_port · wave_speed · galchhi_rise · bodies_downstream_km
    event       days_since_event
    NDRRMA      rescued_total_ndrrma · rescued_per_day (day-over-day from `figures`) · bodies_by_district_top ·
                missing_hydropower · towers_restored · towers_restored_pct · heli_flights · personnel_deployed
    publishers  missing_counts_divergence (live: how many agencies, min → max; static fallback when < 2)
    ledger      places_reached · places_with_unknown · gauges_alive · next_flying_window
    this site   reports_total · reports_last_hour · submissions_today · duplicates_merged · last_pull

Captions are templates (`{n}` placeholders) written here in all three languages; numbers stay in Latin digits.
Each block is guarded on its own so one missing table never empties the others. Also runs report_counts.py.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from lib import config, log
from processing import ProcCtx, report_counts
from processing._series import daily_last, fmt_int, latest_and_previous, npt_day, parse_ts

STEP = "05-stats"
MAX_VALUE_CHARS = 14
NDRRMA_SITREP7 = "https://ndrrma.gov.np/mediafiles/publications/Rasuwa_Flood_Situation_Report_7.pdf"
STATIC = [
    {"id": "wave_time_to_port", "value": "7 minutes", "numeric": 7,
     "caption_en": "From the glacier collapse to the border town being destroyed.",
     "caption_ne": "हिमनदी भत्किएदेखि सीमावर्ती बजार ध्वस्त हुँदासम्मको समय।",
     "caption_hi": "ग्लेशियर ढहने से सीमावर्ती कस्बे के तबाह होने तक का समय।",
     "source_url": NDRRMA_SITREP7, "as_of": "2026-08-27T13:00:00+05:45", "src": "NDRRMA event timeline · 27 Aug"},
    {"id": "wave_speed", "value": "~193 km/h", "numeric": 193,
     "caption_en": "Average speed of the wave over the first 22 km.",
     "caption_ne": "पहिलो २२ किमिमा बाढीको छालको औसत गति।",
     "caption_hi": "पहले 22 किमी में लहर की औसत गति।",
     "source_url": "https://www.icimod.org/", "as_of": "2026-08-28T12:00:00+05:45", "src": "ICIMOD preliminary estimate · 28 Aug"},
    {"id": "galchhi_rise", "value": "9 m in 30 min", "numeric": 9,
     "caption_en": "River rise at Galchhi, 60 km downstream.",
     "caption_ne": "६० किमि तल गल्छीमा नदीको सतह बढेको मात्रा।",
     "caption_hi": "60 किमी नीचे गलछी में नदी का उछाल।",
     "source_url": "https://bipadportal.gov.np/", "as_of": "2026-08-26T10:30:00+05:45", "src": "DHM gauge record · 26 Aug"},
    {"id": "bodies_downstream_km", "value": "240 km", "numeric": 240,
     "caption_en": "How far downstream bodies have been recovered.",
     "caption_ne": "कति टाढासम्म तल शवहरू फेला परेका छन्।",
     "caption_hi": "कितनी दूर नीचे तक शव बरामद हुए हैं।",
     "source_url": "https://udb.nepalpolice.gov.np/", "as_of": "2026-08-29T14:00:00+05:45", "src": "Nepal Police · 29 Aug"},
]
# fallback when fewer than two publishers have a missing-type figure
STATIC_DIVERGENCE = {
    "id": "missing_counts_divergence", "value": "5 numbers", "numeric": 5,
    "caption_en": "Five different “missing” figures on the same day, from five agencies.",
    "caption_ne": "एकै दिन पाँच निकायका पाँच फरक “हराएका” सङ्ख्या।",
    "caption_hi": "एक ही दिन पाँच एजेंसियों के पाँच अलग “लापता” आँकड़े।",
    "source_url": "/about", "as_of": "2026-08-29T18:30:00+05:45"}

# one figure per agency: the first (publisher, metric) that exists wins; "(via press)" variants stand in for the agency
def is_headline_metric(metric: str) -> bool:
    """Third-party numbers lifted from reports (`*_quoted`, e.g. NRCS/ReliefWeb) are context, never headline figures."""
    return not str(metric).endswith("_quoted")


MISSING_CANDIDATES = [
    ("NDRRMA", "missing"), ("Nepal Police", "missing"), ("Nepal Police (UDB)", "missing"), ("Nepal Police (via press)", "missing"),
    ("MoFA", "missing"), ("MoFA", "foreigners_missing"),
    ("Dept of Tourism", "tourists_missing"), ("Dept of Tourism (via press)", "tourists_missing"), ("NTB (via press)", "tourists_missing"),
    ("Setu (NDRRMA)", "missing"),
    # not OPMCM `lost_open`: that is a queue of lost-person *reports* (duplicates, resolved-but-open), not a count of people
]

CAPTIONS: dict[str, tuple[str, str, str]] = {
    "days_since_event": ("since the glacier collapse at 08:37 NPT on 26 Aug.",
                         "26 अगस्ट बिहान 08:37 को हिमनदी विस्फोटदेखि।",
                         "26 अगस्त सुबह 08:37 के ग्लेशियर ढहने के बाद से।"),
    "rescued_total_ndrrma": ("people rescued so far, per NDRRMA's latest situation report.",
                             "जना अहिलेसम्म उद्धार, NDRRMA को पछिल्लो स्थिति प्रतिवेदनअनुसार।",
                             "लोग अब तक बचाए गए, NDRRMA की ताज़ा स्थिति रिपोर्ट के अनुसार।"),
    "rescued_per_day": ("more people rescued than in the previous day's NDRRMA report ({prev_day} → {day}).",
                        "जना अघिल्लो दिनको NDRRMA प्रतिवेदनभन्दा बढी उद्धार ({prev_day} → {day})।",
                        "लोग पिछले दिन की NDRRMA रिपोर्ट से अधिक बचाए गए ({prev_day} → {day})।"),
    "bodies_by_district_top": ("of {total} bodies ({share}%) were recovered in {district}, far downstream{rasuwa}.",
                               "मध्ये {total} शवमध्ये ({share}%) धेरै तल {district} मा फेला परे{rasuwa_ne}।",
                               "शव कुल {total} में से ({share}%) बहुत नीचे {district} में मिले{rasuwa_hi}।"),
    "missing_counts_divergence": ("different “missing” figures from {n} agencies — from {min} ({min_pub}) to {max} ({max_pub}).",
                                  "निकायका {n} फरक “हराएका” सङ्ख्या — {min} ({min_pub}) देखि {max} ({max_pub}) सम्म।",
                                  "एजेंसियों के {n} अलग “लापता” आँकड़े — {min} ({min_pub}) से {max} ({max_pub}) तक।"),
    "missing_hydropower": ("of the {total} out of contact are hydropower-project workers (NDRRMA).",
                           "जना {total} सम्पर्कविहीनमध्ये जलविद्युत आयोजनाका कामदार हुन् (NDRRMA)।",
                           "लोग {total} संपर्क-से-बाहर में से जलविद्युत परियोजना के कर्मी हैं (NDRRMA)।"),
    "towers_restored": ("damaged telecom towers back on air, per NDRRMA.",
                        "क्षतिग्रस्त टेलिकम टावर फेरि सञ्चालनमा, NDRRMA अनुसार।",
                        "क्षतिग्रस्त टेलीकॉम टावर फिर चालू, NDRRMA के अनुसार।"),
    "towers_restored_pct": ("of the {damaged} damaged telecom towers are back on air ({restored}), per NDRRMA.",
                            "क्षतिग्रस्त {damaged} टेलिकम टावरमध्ये फेरि सञ्चालनमा ({restored}), NDRRMA अनुसार।",
                            "क्षतिग्रस्त {damaged} टेलीकॉम टावरों में से फिर चालू ({restored}), NDRRMA के अनुसार।"),
    "towers_restored_places": ("places where phones are recorded working again.",
                               "ठाउँमा फोन फेरि चलेको अभिलेख छ।",
                               "जगहों पर फोन फिर चालू दर्ज है।"),
    "heli_flights": ("helicopter sorties flown since 26 Aug (NDRRMA).",
                     "हेलिकप्टर उडान 26 अगस्टदेखि (NDRRMA)।",
                     "हेलीकॉप्टर उड़ानें 26 अगस्त से (NDRRMA)।"),
    "personnel_deployed": ("army, police and APF personnel deployed (NDRRMA).",
                           "सेना, प्रहरी र सशस्त्र प्रहरी परिचालित (NDRRMA)।",
                           "सेना, पुलिस और APF कर्मी तैनात (NDRRMA)।"),
    "places_reached": ("tracked places where everyone reported there is accounted for; {unknown} still have people missing.",
                       "ट्र्याक गरिएका ठाउँमा सबैको खबर छ; {unknown} ठाउँमा अझै मानिस हराइरहेका छन्।",
                       "ट्रैक की गई जगहों में सबका पता है; {unknown} जगहों पर अब भी लोग लापता हैं।"),
    "places_with_unknown": ("places where people are still unaccounted for.", "ठाउँमा मानिसहरू अझै सम्पर्कबाहिर छन्।", "जगहों पर लोग अब भी लापता हैं।"),
    "gauges_alive": ("of 11 corridor river gauges still reporting.", "मध्ये ११ नदी मापन केन्द्र अझै चलिरहेका छन्।", "में से 11 नदी गेज अब भी रिपोर्ट कर रहे हैं।"),
    "next_flying_window": ("next good morning flying window (forecast) at {site}.",
                           "अर्को राम्रो बिहानको उडान अवसर (पूर्वानुमान) {site} मा।",
                           "अगली अच्छी सुबह की उड़ान खिड़की (पूर्वानुमान) {site} में।"),
    "next_flying_window_none": ("no good morning flying window in the 3-day forecast.",
                                "3 दिनको पूर्वानुमानमा राम्रो बिहानको उडान अवसर छैन।",
                                "3 दिन के पूर्वानुमान में अच्छी सुबह की उड़ान खिड़की नहीं।"),
    "reports_total": ("have added what they know on this site.", "जनाले यस साइटमा आफूलाई थाहा भएको कुरा थपेका छन्।", "लोगों ने इस साइट पर अपनी जानकारी जोड़ी है।"),
    "reports_last_hour": ("reports added in the last hour.", "विवरण पछिल्लो एक घण्टामा थपिए।", "रिपोर्ट पिछले एक घंटे में जोड़ी गईं।"),
    "submissions_today": ("contributions submitted today (Nepal time).", "योगदान आज (नेपाली समय) पेश भए।", "योगदान आज (नेपाल समय) जमा हुए।"),
    "duplicates_merged": ("people listed more than once on the registers — the same name, age and nationality — merged into a single record here (matches with ages far apart are kept separate).",
                          "दर्तामा एकभन्दा बढी पटक सूचीबद्ध व्यक्ति — उही नाम, उमेर र राष्ट्रियता — यहाँ एउटै अभिलेखमा जोडिएका (उमेर धेरै फरक भएका मिलान अलग राखिन्छन्)।",
                          "रजिस्टरों में एक से अधिक बार दर्ज लोग — वही नाम, उम्र और राष्ट्रीयता — यहाँ एक ही रिकॉर्ड में जोड़े गए (जिनकी उम्र बहुत अलग है उन्हें अलग रखा गया है)।"),
    "last_pull": ("minutes since the last data pull.", "मिनेट अघि पछिल्लो डेटा तानिएको।", "मिनट पहले आखिरी डेटा खींचा गया।"),
}
LIVE_CAPTIONS = CAPTIONS   # name kept for callers of the previous version


def fit(value: str) -> str:
    """Values render as one big number: never longer than MAX_VALUE_CHARS."""
    v = str(value).strip()
    if len(v) <= MAX_VALUE_CHARS:
        return v
    log.warn("stats.value_too_long", value=v)
    return v[:MAX_VALUE_CHARS - 1].rstrip() + "…"


def live_row(sid: str, value: str, numeric: float | None, source_url: str | None, as_of: Any,
             caption_key: str | None = None, **fmt: Any) -> dict[str, Any]:
    en, ne, hi = CAPTIONS[caption_key or sid]
    return {"id": sid, "value": fit(value), "numeric": numeric, "caption_en": en.format(**fmt), "caption_ne": ne.format(**fmt),
            "caption_hi": hi.format(**fmt), "source_url": source_url, "as_of": as_of}


def _day(d: datetime) -> str:
    return d.astimezone(config.KTM).strftime("%-d %b")


# ─── pure builders (unit-tested) ─────────────────────────────────────────────

def days_since_event(now: datetime) -> dict[str, Any]:
    n = (now.astimezone(config.KTM).date() - config.EVENT_START_UTC.astimezone(config.KTM).date()).days
    return live_row("days_since_event", f"Day {n}", n, "/about", now)


def ndrrma_rows(figures: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    """NDRRMA rows from `figures` history (national + district + category scopes)."""
    rows: list[dict[str, Any]] = []
    series = daily_last([f for f in figures if f.get("publisher") == "NDRRMA"])
    latest, prev = latest_and_previous(series.get(("NDRRMA", "rescued", "national")) or [])
    if latest:
        rows.append(live_row("rescued_total_ndrrma", fmt_int(latest["value"]), latest["value"], latest.get("url"), latest["as_of"]))
        if prev and latest["value"] >= prev["value"]:
            d = latest["value"] - prev["value"]
            rows.append(live_row("rescued_per_day", f"+{fmt_int(d)}", d, latest.get("url"), latest["as_of"],
                                 prev_day=_day(prev["as_of"]), day=_day(latest["as_of"])))
    dead_nat, _ = latest_and_previous(series.get(("NDRRMA", "dead", "national")) or [])
    districts = {k[2]: pts[-1] for k, pts in series.items() if k[1] == "dead" and k[2].startswith("district:")}
    if districts and dead_nat and dead_nat["value"] > 0:
        newest_day = max(p["day"] for p in districts.values())
        today = {s: p for s, p in districts.items() if p["day"] == newest_day}
        top_scope, top = max(today.items(), key=lambda kv: kv[1]["value"])
        share = round(100 * top["value"] / dead_nat["value"])
        rasuwa = today.get("district:rasuwa")
        rows.append(live_row("bodies_by_district_top", fmt_int(top["value"]), top["value"], top.get("url"), top["as_of"],
                             total=fmt_int(dead_nat["value"]), share=share, district=_district_name(top_scope),
                             rasuwa=f" — only {fmt_int(rasuwa['value'])} in Rasuwa itself" if rasuwa else "",
                             rasuwa_ne=f" — रसुवामा मात्र {fmt_int(rasuwa['value'])}" if rasuwa else "",
                             rasuwa_hi=f" — रसुवा में केवल {fmt_int(rasuwa['value'])}" if rasuwa else ""))
    miss_nat, _ = latest_and_previous(series.get(("NDRRMA", "missing", "national")) or [])
    hydro, _ = latest_and_previous(series.get(("NDRRMA", "missing", "category:hydropower_projects")) or [])
    if hydro and miss_nat and hydro["day"] == miss_nat["day"] and miss_nat["value"] > 0:
        rows.append(live_row("missing_hydropower", fmt_int(hydro["value"]), hydro["value"], hydro.get("url"), hydro["as_of"],
                             total=fmt_int(miss_nat["value"])))
    tw, _ = latest_and_previous(series.get(("NDRRMA", "telecom_towers_restored", "national")) or [])
    dmg, _ = latest_and_previous(series.get(("NDRRMA", "telecom_towers_damaged", "national")) or [])
    if tw:
        val = f"{fmt_int(tw['value'])} of {fmt_int(dmg['value'])}" if dmg and dmg["value"] >= tw["value"] else fmt_int(tw["value"])
        rows.append(live_row("towers_restored", val, tw["value"], tw.get("url"), tw["as_of"]))
        if dmg and dmg["value"] > 0 and dmg["value"] >= tw["value"]:
            pct = round(100 * tw["value"] / dmg["value"])
            rows.append(live_row("towers_restored_pct", f"{pct}%", pct, tw.get("url"), tw["as_of"],
                                 damaged=fmt_int(dmg["value"]), restored=fmt_int(tw["value"])))
    heli, _ = latest_and_previous(series.get(("NDRRMA", "heli_flights_total", "national")) or [])
    if heli:
        rows.append(live_row("heli_flights", fmt_int(heli["value"]), heli["value"], heli.get("url"), heli["as_of"]))
    pers, _ = latest_and_previous(series.get(("NDRRMA", "personnel", "national")) or [])
    if pers:
        rows.append(live_row("personnel_deployed", fmt_int(pers["value"]), pers["value"], pers.get("url"), pers["as_of"]))
    return rows


def _district_name(scope: str) -> str:
    return scope.split(":", 1)[-1].replace("_", " ").title()


def divergence_row(latest: list[dict[str, Any]], now: datetime) -> dict[str, Any]:
    """figures_latest national rows → how many agencies publish a missing-type figure, and the spread."""
    by = {(f["publisher"], f["metric"]): f for f in latest if (f.get("scope") or "national") == "national"}
    picked: dict[str, dict[str, Any]] = {}
    for pub, metric in MISSING_CANDIDATES:
        if not is_headline_metric(metric):
            continue
        agency = pub.replace(" (via press)", "").replace(" (UDB)", "")
        if agency in picked or (pub, metric) not in by:
            continue
        picked[agency] = by[(pub, metric)]
    if len(picked) < 2:
        r = dict(STATIC_DIVERGENCE)
        return r
    lo = min(picked.items(), key=lambda kv: kv[1]["value"])
    hi = max(picked.items(), key=lambda kv: kv[1]["value"])
    as_of = max((parse_ts(f.get("as_of")) for f in picked.values() if f.get("as_of")), default=now)
    return live_row("missing_counts_divergence", f"{len(picked)} numbers", len(picked), "/about", as_of, n=len(picked),
                    min=fmt_int(lo[1]["value"]), min_pub=lo[0], max=fmt_int(hi[1]["value"]), max_pub=hi[0])


def places_rows(place_status: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    tracked = [p for p in place_status if (p.get("expected") or 0) > 0 or (p.get("confirmed_reached") or 0) > 0 or (p.get("reports_count") or 0) > 0]
    n_unknown = sum(1 for p in tracked if (p.get("unknown") or 0) > 0)
    reached = sum(1 for p in tracked if (p.get("unknown") or 0) == 0)
    rows = [live_row("places_with_unknown", str(n_unknown), n_unknown, "/places", now)]
    if tracked:
        rows.append(live_row("places_reached", f"{reached} of {len(tracked)}", reached, "/places", now, unknown=n_unknown))
    return rows


def gauges_row(gauges_latest: list[dict[str, Any]], now: datetime) -> dict[str, Any]:
    corridor = {t.lower(): lab for t, _, lab in config.CORRIDOR_GAUGES}
    alive_labels = {corridor[(g.get("station_name") or "").strip().lower()] for g in gauges_latest
                    if (g.get("station_name") or "").strip().lower() in corridor and g.get("alive")}   # two ids can share one title
    alive = len(alive_labels)
    return live_row("gauges_alive", f"{alive} of {len(config.CORRIDOR_GAUGES)}", alive, "https://bipadportal.gov.np/", now)


def flying_window_row(fw: list[dict[str, Any]], gaz: Any, now: datetime) -> dict[str, Any]:
    """fw = flying_window_quality figures (value 1 = good) from today on, oldest first."""
    if not fw:
        return live_row("next_flying_window", "none in 3 days", None, None, now, caption_key="next_flying_window_none")
    d = parse_ts(fw[0]["as_of"]).astimezone(config.KTM)
    site = (fw[0].get("scope") or "").split(":", 1)[-1]
    p = gaz.get(site) if gaz else None
    lo, hi = config.FLYING_WINDOW_HOURS_LOCAL
    return live_row("next_flying_window", f"{d.strftime('%-d %b')} {lo:02d}–{hi:02d}", d.timestamp(), None, now,
                    site=p.name_en if p else site)


# ─── the step ────────────────────────────────────────────────────────────────

def _guard(name: str, fn, *a: Any) -> list[dict[str, Any]]:
    try:
        r = fn(*a)
        return r if isinstance(r, list) else [r]
    except Exception as e:  # noqa: BLE001
        log.error("stats.part_failed", part=name, error=f"{type(e).__name__}: {str(e)[:160]}")
        return []


def compute_live(ctx: ProcCtx) -> list[dict[str, Any]]:
    db = ctx.db
    rows: list[dict[str, Any]] = [days_since_event(ctx.now)]

    def site_counts() -> list[dict[str, Any]]:
        total = db.count("reports_archive", {"withdrawn_at": "is.null", "status": "neq.spam"})
        hour_ago = (ctx.now - timedelta(hours=1)).isoformat()
        last_hour = db.count("reports_archive", {"withdrawn_at": "is.null", "status": "neq.spam", "created_at": f"gte.{hour_ago}"})
        out = [live_row("reports_total", f"{total:,} {'person' if total == 1 else 'people'}", total, "/report", ctx.now),
               live_row("reports_last_hour", str(last_hour), last_hour, "/report", ctx.now)]
        lc = db.select("v_live_counts", {"select": "last_pull_at,submissions_today"})
        if lc:
            st = lc[0].get("submissions_today")
            if st is not None:
                out.append(live_row("submissions_today", f"{int(st):,}", int(st), "/report", ctx.now))
            if lc[0].get("last_pull_at"):
                lp = parse_ts(lc[0]["last_pull_at"])
                mins = max(int((ctx.now - lp).total_seconds() // 60), 0)
                out.append(live_row("last_pull", str(mins), mins, None, lp))
        return out

    def ndrrma() -> list[dict[str, Any]]:
        since = (ctx.now - timedelta(days=30)).isoformat()
        figs = db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,url", "publisher": "eq.NDRRMA",
                                         "as_of": f"gte.{since}",
                                         "metric": "in.(rescued,dead,missing,telecom_towers_restored,telecom_towers_damaged,heli_flights_total,personnel)"})
        return ndrrma_rows(figs, ctx.now)

    def divergence() -> dict[str, Any]:
        latest = db.select_all("figures_latest", {"select": "publisher,metric,scope,value,as_of,url", "scope": "eq.national"})
        return divergence_row(latest, ctx.now)

    def places() -> list[dict[str, Any]]:
        ps = db.select_all("v_place_status_latest", {"select": "place_id,unknown,expected,confirmed_reached,reports_count,telecom_restored"})
        out = places_rows(ps, ctx.now)
        if not any(r["id"] == "towers_restored" for r in rows):
            n = sum(1 for p in ps if p.get("telecom_restored"))
            if n:
                out.append(live_row("towers_restored", f"{n} places", n, "/places", ctx.now, caption_key="towers_restored_places"))
        return out

    def gauges() -> dict[str, Any]:
        return gauges_row(db.select_all("v_gauges_latest", {"select": "station_name,alive,observed_at"}), ctx.now)

    def flying() -> dict[str, Any]:
        today = ctx.now.astimezone(config.KTM).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        fw = db.select("figures", {"select": "scope,value,as_of,note", "metric": "like.flying_window_quality*", "value": "eq.1",
                                   "as_of": f"gte.{today}", "order": "as_of.asc", "limit": 5})
        return flying_window_row(fw, ctx.gaz, ctx.now)

    def duplicates() -> dict[str, Any]:
        from processing.dedup import merge_stats
        ms = merge_stats(ctx)
        return live_row("duplicates_merged", f"{ms['merged']:,}", ms["merged"], "/about", ctx.now)

    rows += _guard("site_counts", site_counts)
    rows += _guard("ndrrma", ndrrma)
    rows += _guard("divergence", divergence)
    rows += _guard("places", places)
    rows += _guard("gauges", gauges)
    rows += _guard("flying", flying)
    rows += _guard("duplicates", duplicates)
    return rows


def run(ctx: ProcCtx) -> dict[str, Any]:
    out: dict[str, Any] = {}
    try:
        rows = []
        for s in STATIC:
            r = {k: v for k, v in s.items() if k != "src"}
            r["computed_at"] = ctx.now
            rows.append(r)
        live = compute_live(ctx)
        for r in live:
            r["computed_at"] = ctx.now
        rows += live
        if not ctx.dry_run:
            ctx.db.upsert("stats", rows, on_conflict="id")
        out["stats"] = {"rows": len(rows), "live": {r["id"]: r["value"] for r in live}}
        log.info("stats.done", rows=len(rows), **{r["id"]: r["value"] for r in live})
    except Exception as e:  # noqa: BLE001
        log.error("stats.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        out["stats"] = {"error": f"{type(e).__name__}: {str(e)[:120]}"}
    try:
        out["report_counts"] = report_counts.run(ctx)
    except Exception as e:  # noqa: BLE001
        log.error("report_counts.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        out["report_counts"] = {"error": type(e).__name__}
    return out
