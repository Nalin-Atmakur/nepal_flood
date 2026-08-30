"""
processing/stats.py — step ⑤. See docs/process_data/05-stats.md.

Six static striking stats (seeded from the design's Home v3 renderVals, each with a source url)
plus the live ones, recomputed every run:
    reports_total        reports_archive not withdrawn/spam        (design card "412 people have added…")
    reports_last_hour    same, created in the last 60 min
    places_with_unknown  v_place_status_latest where unknown > 0
    gauges_alive         corridor gauges alive (of the 11 in config.CORRIDOR_GAUGES)
    next_flying_window   first 'good' flying_window_quality figure from today (site + day)
Captions are written in EN / NE / HI here. Also runs processing/report_counts.py.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from lib import config, log
from processing import ProcCtx, report_counts

STEP = "05-stats"
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
    {"id": "missing_counts_divergence", "value": "5 numbers", "numeric": 5,
     "caption_en": "Five different “missing” figures on the same day, from five agencies.",
     "caption_ne": "एकै दिन पाँच निकायका पाँच फरक “हराएका” सङ्ख्या।",
     "caption_hi": "एक ही दिन पाँच एजेंसियों के पाँच अलग “लापता” आँकड़े।",
     "source_url": "/about", "as_of": "2026-08-29T18:30:00+05:45", "src": "See the table below"},
]
LIVE_CAPTIONS = {
    "reports_total": ("have added what they know on this site.", "जनाले यस साइटमा आफूलाई थाहा भएको कुरा थपेका छन्।", "लोगों ने इस साइट पर अपनी जानकारी जोड़ी है।"),
    "reports_last_hour": ("reports added in the last hour.", "विवरण पछिल्लो एक घण्टामा थपिए।", "रिपोर्ट पिछले एक घंटे में जोड़ी गईं।"),
    "places_with_unknown": ("places where people are still unaccounted for.", "ठाउँमा मानिसहरू अझै सम्पर्कबाहिर छन्।", "जगहों पर लोग अब भी लापता हैं।"),
    "gauges_alive": ("of 11 corridor river gauges still reporting.", "मध्ये ११ नदी मापन केन्द्र अझै चलिरहेका छन्।", "में से 11 नदी गेज अब भी रिपोर्ट कर रहे हैं।"),
    "next_flying_window": ("next good morning flying window (forecast).", "अर्को राम्रो बिहानको उडान अवसर (पूर्वानुमान)।", "अगली अच्छी सुबह की उड़ान खिड़की (पूर्वानुमान)।"),
    "last_pull": ("minutes since the last data pull.", "मिनेट अघि पछिल्लो डेटा तानिएको।", "मिनट पहले आखिरी डेटा खींचा गया।"),
}


def live_row(sid: str, value: str, numeric: float | None, source_url: str | None, as_of: datetime) -> dict[str, Any]:
    en, ne, hi = LIVE_CAPTIONS[sid]
    return {"id": sid, "value": value, "numeric": numeric, "caption_en": en, "caption_ne": ne, "caption_hi": hi,
            "source_url": source_url, "as_of": as_of}


def compute_live(ctx: ProcCtx) -> list[dict[str, Any]]:
    db = ctx.db
    rows: list[dict[str, Any]] = []
    total = db.count("reports_archive", {"withdrawn_at": "is.null", "status": "neq.spam"})
    hour_ago = (ctx.now - timedelta(hours=1)).isoformat()
    last_hour = db.count("reports_archive", {"withdrawn_at": "is.null", "status": "neq.spam", "created_at": f"gte.{hour_ago}"})
    rows.append(live_row("reports_total", f"{total:,} {'person' if total == 1 else 'people'}", total, "/report", ctx.now))
    rows.append(live_row("reports_last_hour", str(last_hour), last_hour, "/report", ctx.now))
    ps = db.select_all("v_place_status_latest", {"select": "place_id,unknown"})
    n_unknown = sum(1 for p in ps if (p.get("unknown") or 0) > 0)
    rows.append(live_row("places_with_unknown", str(n_unknown), n_unknown, "/places", ctx.now))
    gauges = db.select_all("v_gauges_latest", {"select": "station_name,alive,observed_at"})
    corridor = {t.lower() for t, _, _ in config.CORRIDOR_GAUGES}
    alive = sum(1 for g in gauges if (g.get("station_name") or "").strip().lower() in corridor and g.get("alive"))
    rows.append(live_row("gauges_alive", f"{alive} of {len(config.CORRIDOR_GAUGES)}", alive, "https://bipadportal.gov.np/", ctx.now))
    today = ctx.now.astimezone(config.KTM).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    fw = db.select("figures", {"select": "scope,value,as_of,note", "metric": "eq.flying_window_quality", "value": "eq.1",
                               "as_of": f"gte.{today}", "order": "as_of.asc", "limit": 5})
    if fw:
        d = datetime.fromisoformat(fw[0]["as_of"].replace("Z", "+00:00")).astimezone(config.KTM)
        site = fw[0]["scope"].split(":", 1)[-1]
        name = ctx.gaz.get(site).name_en if ctx.gaz.get(site) else site
        rows.append(live_row("next_flying_window", f"{d.strftime('%-d %b')} 06–11 NPT · {name}", d.timestamp(), None, ctx.now))
    else:
        rows.append(live_row("next_flying_window", "none in the next 3 days", None, None, ctx.now))
    lc = db.select("v_live_counts", {"select": "last_pull_at"})
    if lc and lc[0].get("last_pull_at"):
        lp = datetime.fromisoformat(lc[0]["last_pull_at"].replace("Z", "+00:00"))
        mins = int((ctx.now - lp).total_seconds() // 60)
        rows.append(live_row("last_pull", str(max(mins, 0)), mins, None, lp))
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
