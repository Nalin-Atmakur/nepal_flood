"""
processing/timeline.py — step ⑧. See docs/process_data/10-timeline-and-trends.md.

Appends dated, deterministic milestones to `event_timeline` (the seeded "first hours" rows stay untouched;
every id here is a slug built from the date + subject, so re-runs upsert the same rows):

    r<YYYYMMDD>_ndrrma        kind=response  the day's last NDRRMA sitrep totals: dead / out of contact / rescued,
                                             each with the change since the previous day's sitrep
    r<YYYYMMDD>_towers        kind=response  NDRRMA telecom towers restored / damaged, on days the number moved
    r<YYYYMMDD>_phones_<place> kind=response first day a place's phones are recorded working again (place_status)
    g<YYYYMMDD>_<station>_silent / _back  kind=gauge  a corridor gauge's last reading before it fell silent
                                             (after the event day — the 26 Aug deaths are seeded) / first reading
                                             after a gap of ≥ GAP_HOURS
    w<YYYYMMDD>_barrier_lake  kind=warning   an article headline that says a barrier / glacial lake breached or
                                             overtopped, dated by published_at (skipped when a row on that day
                                             already tells the story, e.g. the seeded d2_breach)

Text is templated in EN / NE / HI (no LLM). Numbers stay in Latin digits.
"""
from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from lib import config, log
from lib.text import slugify
from processing import ProcCtx
from processing._series import daily_last, fmt_delta, fmt_int, npt_day, parse_ts

STEP = "08-timeline"
GAP_HOURS = 24
BREACH_LAKE_RE = re.compile(r"barrier lake|glacial lake|dammed lake|landslide lake|हिमताल|ताल", re.I)
BREACH_ACT_RE = re.compile(r"\b(?:breach(?:es|ed)?|overtop(?:s|ped)?|bursts?|gave way|gives way|collapsed?)\b|फुट्यो|फुटेको|फुटिसक|टुट्यो|टुटेको|भत्कियो|भत्केको", re.I)
BREACH_NEG_RE = re.compile(r"\b(?:could|may|might|unlikely|risk of|fears?|no sign|not|low|stable|if)\b|जोखिम कम|जोखिम छैन|सम्भावना कम|सक्ने|सक्छ|खतरा छैन", re.I)
MONTHS = {m: i for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}
SINCE_RE = re.compile(r"since (\d{1,2}) ([A-Z][a-z]{2})")


def label(at: datetime) -> str:
    return at.astimezone(config.KTM).strftime("%-d %b %H:%M")


def _row(rid: str, at: datetime, en: str, ne: str, hi: str, kind: str, source: str | None, url: str | None,
         now: datetime, place_id: str | None = None, at_label: str | None = None) -> dict[str, Any]:
    return {"id": rid, "at": at, "at_label": at_label or label(at), "place_id": place_id, "km": None,
            "what_en": en, "what_ne": ne, "what_hi": hi, "kind": kind, "source": source, "source_url": url, "computed_at": now}


# ─── builders (pure) ─────────────────────────────────────────────────────────

def ndrrma_rows(figures: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    """NDRRMA national dead / missing / rescued figures → one response row per NPT day (the day's last sitrep)."""
    series = daily_last([f for f in figures if f.get("publisher") == "NDRRMA" and (f.get("scope") or "national") == "national"])
    dead = series.get(("NDRRMA", "dead", "national")) or []
    if not dead:
        return []
    by_day = {m: {p["day"]: p for p in series.get(("NDRRMA", m, "national"), [])} for m in ("dead", "missing", "rescued")}
    rows = []
    prev: dict[str, float | None] = {"dead": None, "missing": None, "rescued": None}
    for p in dead:
        day = p["day"]
        vals = {m: (by_day[m].get(day) or {}).get("value") for m in ("dead", "missing", "rescued")}
        parts_en, parts_ne, parts_hi = [], [], []
        for m, en, ne, hi in (("dead", "dead", "मृत", "मृत"), ("missing", "out of contact", "सम्पर्कविहीन", "संपर्क से बाहर"),
                              ("rescued", "rescued", "उद्धार", "बचाए गए")):
            v = vals[m]
            if v is None:
                continue
            d = fmt_delta(v - prev[m]) if prev[m] is not None else ""
            suffix = f" ({d})" if d else ""
            parts_en.append(f"{fmt_int(v)} {en}{suffix}")
            parts_ne.append(f"{fmt_int(v)} {ne}{suffix}")
            parts_hi.append(f"{fmt_int(v)} {hi}{suffix}")
            prev[m] = v
        rows.append(_row(f"r{day.strftime('%Y%m%d')}_ndrrma", p["as_of"],
                         "NDRRMA situation report: " + ", ".join(parts_en),
                         "NDRRMA स्थिति प्रतिवेदन: " + ", ".join(parts_ne),
                         "NDRRMA स्थिति रिपोर्ट: " + ", ".join(parts_hi),
                         "response", "NDRRMA", p.get("url"), now))
    return rows


def towers_rows(figures: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    series = daily_last([f for f in figures if f.get("publisher") == "NDRRMA" and (f.get("scope") or "national") == "national"
                         and f.get("metric") in ("telecom_towers_restored", "telecom_towers_damaged")])
    restored = series.get(("NDRRMA", "telecom_towers_restored", "national")) or []
    damaged = {p["day"]: p["value"] for p in series.get(("NDRRMA", "telecom_towers_damaged", "national")) or []}
    rows = []
    last = None
    for p in restored:
        if last is not None and p["value"] == last:
            continue
        last = p["value"]
        dmg = damaged.get(p["day"])
        of_en = f" of {fmt_int(dmg)} damaged" if dmg else ""
        of_ne = f" (क्षतिग्रस्त {fmt_int(dmg)} मध्ये)" if dmg else ""
        of_hi = f" (क्षतिग्रस्त {fmt_int(dmg)} में से)" if dmg else ""
        rows.append(_row(f"r{p['day'].strftime('%Y%m%d')}_towers", p["as_of"],
                         f"{fmt_int(p['value'])}{of_en} telecom towers back on air (NDRRMA)",
                         f"{fmt_int(p['value'])} टेलिकम टावर{of_ne} पुनः सञ्चालनमा (NDRRMA)",
                         f"{fmt_int(p['value'])} टेलीकॉम टावर{of_hi} फिर चालू (NDRRMA)",
                         "response", "NDRRMA", p.get("url"), now))
    return rows


def phones_rows(place_status: list[dict[str, Any]], names: dict[str, tuple[str, str, str]], now: datetime,
                eligible: set[str] | None = None) -> list[dict[str, Any]]:
    """place_status history (any order) → first day each place's telecom_restored is true (corridor places only when `eligible` given)."""
    first: dict[str, dict[str, Any]] = {}
    for r in place_status:
        if not r.get("telecom_restored") or (eligible is not None and r["place_id"] not in eligible):
            continue
        cur = first.get(r["place_id"])
        if cur is None or str(r.get("as_of")) < str(cur.get("as_of")):
            first[r["place_id"]] = r
    rows = []
    for pid, r in sorted(first.items()):
        at = parse_ts(r.get("as_of")) or now
        m = SINCE_RE.search(r.get("phones") or "")
        at_label = None
        if m and m.group(2) in MONTHS:
            try:
                at = datetime(at.astimezone(config.KTM).year, MONTHS[m.group(2)], int(m.group(1)), 12, 0, tzinfo=config.KTM)
                at_label = at.strftime("%-d %b")
            except ValueError:
                pass
        en, ne, hi = names.get(pid, (pid, pid, pid))
        rows.append(_row(f"r{at.astimezone(config.KTM).strftime('%Y%m%d')}_phones_{slugify(pid)}", at,
                         f"{en}: phones working again", f"{ne}: फोन फेरि चल्न थाल्यो", f"{hi}: फोन फिर चालू",
                         "response", "telecom articles", f"/places/{pid}", now, place_id=pid, at_label=at_label))
    rows.sort(key=lambda r: r["at"])
    return rows


def gauge_rows(observations: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    """
    observations: gauges rows (station_name, observed_at, level, alive) for corridor stations, any order.
    A station whose last reading is older than GAUGE_ALIVE_HOURS and after the event day → `_silent` at that reading;
    a reading that follows a gap ≥ GAP_HOURS (after the event) → `_back` at that reading.
    """
    corridor = {t.lower(): lab for t, _, lab in config.CORRIDOR_GAUGES}
    by_station: dict[str, list[tuple[datetime, Any]]] = defaultdict(list)
    for g in observations:
        lab = corridor.get((g.get("station_name") or "").strip().lower())
        at = parse_ts(g.get("observed_at"))
        if lab and at:
            by_station[lab].append((at, g.get("level")))
    event_day_end = (config.EVENT_START_UTC.astimezone(config.KTM).replace(hour=23, minute=59, second=59))
    rows = []
    for lab, obs in sorted(by_station.items()):
        obs.sort()
        slug = slugify(lab)
        for i in range(1, len(obs)):
            gap = obs[i][0] - obs[i - 1][0]
            if gap >= timedelta(hours=GAP_HOURS) and obs[i][0] > config.EVENT_START_UTC:
                at = obs[i][0]
                lvl = f" ({obs[i][1]:.2f} m)" if isinstance(obs[i][1], (int, float)) else ""
                rows.append(_row(f"g{at.astimezone(config.KTM).strftime('%Y%m%d')}_{slug}_back", at,
                                 f"{lab} river gauge back online{lvl} after {int(gap.total_seconds() // 3600)} h of silence",
                                 f"{lab} नदी मापन केन्द्र {int(gap.total_seconds() // 3600)} घण्टापछि फेरि चालु{lvl}",
                                 f"{lab} नदी गेज {int(gap.total_seconds() // 3600)} घंटे बाद फिर चालू{lvl}",
                                 "gauge", "DHM via BIPAD", "https://bipadportal.gov.np/", now))
        last_at, last_lvl = obs[-1]
        if now - last_at > timedelta(hours=config.GAUGE_ALIVE_HOURS) and last_at > event_day_end:
            lvl = f" ({last_lvl:.2f} m)" if isinstance(last_lvl, (int, float)) else ""
            rows.append(_row(f"g{last_at.astimezone(config.KTM).strftime('%Y%m%d')}_{slug}_silent", last_at,
                             f"{lab} river gauge falls silent — last reading{lvl}",
                             f"{lab} नदी मापन केन्द्र बन्द — अन्तिम रिडिङ{lvl}",
                             f"{lab} नदी गेज बंद — आखिरी रीडिंग{lvl}",
                             "gauge", "DHM via BIPAD", "https://bipadportal.gov.np/", now))
    return rows


def breach_rows(articles: list[dict[str, Any]], existing: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    """Articles whose title says a barrier lake breached/overtopped → one warning row per NPT day (dated by published_at)."""
    told = {npt_day(e.get("at")) for e in existing if BREACH_LAKE_RE.search(e.get("what_en") or "")}
    seen: set = set()
    rows = []
    for a in sorted(articles, key=lambda a: a.get("published_at") or ""):
        t = a.get("title") or ""
        at = parse_ts(a.get("published_at"))
        if not at or not (BREACH_LAKE_RE.search(t) and BREACH_ACT_RE.search(t)) or BREACH_NEG_RE.search(t):
            continue
        day = at.astimezone(config.KTM).date()
        if day in told or day in seen:
            continue
        seen.add(day)
        rows.append(_row(f"w{day.strftime('%Y%m%d')}_barrier_lake", at,
                         f"Barrier lake breach reported — {a.get('publisher') or 'press'}: {t[:120]}",
                         f"हिमताल फुटेको खबर — {a.get('publisher') or 'सञ्चारमाध्यम'}: {t[:120]}",
                         f"बैरियर झील टूटने की खबर — {a.get('publisher') or 'प्रेस'}: {t[:120]}",
                         "warning", a.get("publisher"), a.get("url"), now, place_id="barrier_lake_site"))
    return rows


# ─── the step ────────────────────────────────────────────────────────────────

def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        db = ctx.db
        since = (ctx.now - timedelta(days=30)).isoformat()
        figs = db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,url,note", "publisher": "eq.NDRRMA",
                                         "scope": "eq.national", "as_of": f"gte.{since}", "order": "as_of.asc"})
        rows = ndrrma_rows(figs, ctx.now) + towers_rows(figs, ctx.now)
        ps = db.select_all("place_status", {"select": "place_id,as_of,telecom_restored,phones", "telecom_restored": "eq.true", "order": "as_of.asc"})
        names = {p.id: (p.name_en, p.name_ne or p.name_en, p.name_hi or p.name_en) for p in ctx.gaz.all()}
        corridor_places = {p.id for p in ctx.gaz.all() if p.km is not None or p.district in ("Rasuwa", "Nuwakot")}
        rows += phones_rows(ps, names, ctx.now, corridor_places)   # a telecom article that names Kathmandu is not a restoration there
        titles = [t for t, _, _ in config.CORRIDOR_GAUGES]
        obs = db.select_all("gauges", {"select": "station_name,observed_at,level,alive", "station_name": f"in.({','.join(chr(34) + t + chr(34) for t in titles)})",
                                       "order": "observed_at.asc"})
        rows += gauge_rows(obs, ctx.now)
        existing = db.select_all("event_timeline", {"select": "id,at,what_en,kind"})
        arts = db.select_all("articles", {"select": "title,publisher,url,published_at", "published_at": f"gte.{since}",
                                          "or": "(title.ilike.*lake*,title.ilike.*हिमताल*,title.ilike.*ताल*)"})
        rows += breach_rows(arts, existing, ctx.now)
        placed = {p.id for p in ctx.gaz.all()}
        for r in rows:
            if r.get("place_id") and r["place_id"] not in placed:
                r["place_id"] = None
        if rows and not ctx.dry_run:
            db.upsert("event_timeline", rows, on_conflict="id")
        have = {e["id"] for e in existing}
        new = [r["id"] for r in rows if r["id"] not in have]
        kinds = defaultdict(int)
        for r in rows:
            kinds[r["kind"]] += 1
        log.info("timeline.done", rows=len(rows), new=len(new), kinds=dict(kinds))
        return {"rows": len(rows), "new": new[:20], "kinds": dict(kinds)}
    except Exception as e:  # noqa: BLE001
        log.error("timeline.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
