#!/usr/bin/env python3
"""
Morning trends report — docs/reports/<YYYY-MM-DD>-morning.md from the live DERIVED tables.

Run after the first pipeline tick of the day (docs/reports/README.md):
    pipeline/.venv/bin/python scripts/morning_report.py          # writes today's file
    pipeline/.venv/bin/python scripts/morning_report.py --stdout # print instead
    make report

Sections (numbered in the file):
  1. Headline numbers per publisher with 24 h / 48 h change (figures_latest ⋈ figure_series)
  2. Where the unknowns are (v_place_status_latest, change vs the previous day's place_status, now-lines)
  3. Help requests on the PM's portal by place (figures_latest, place-scoped)
  4. Rescue throughput by day (figure_series)
  5. Infrastructure: bridges, telecom towers, gauges, flying windows
  6. Data quality: sources, duplicates merged, findings, articles per day
  7. What changed since the previous report (diff of the machine-readable block at the end of that file)

Reads with the service key (pipeline/.env) through pipeline/lib/db.py; no PII is read or written — counts,
publisher names and headline titles only. The output is derived content and is committed to the repo.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "pipeline"))

NPT = ZoneInfo("Asia/Kathmandu")
REPORTS_DIR = ROOT / "docs" / "reports"
DATA_MARK = "<!-- report-data "

# publisher → (dead metrics, missing metrics, rescued metrics, one-line meaning)
HEADLINE_PUBLISHERS: list[tuple[str, list[str], list[str], list[str], str]] = [
    ("NDRRMA", ["dead"], ["missing", "out_of_contact"], ["rescued"], "the national authority's sitrep: everyone reported out of contact by district offices"),
    ("Nepal Police (via press)", ["dead"], ["missing", "out_of_contact"], ["rescued"], "numbers the Police gave the press: bodies recovered and confirmed missing-person reports"),
    ("MoFA", ["dead", "foreigners_dead"], ["foreigners_missing", "missing"], ["foreigners_found", "rescued", "found"], "foreigners reported to embassies (a subset of everyone)"),
    ("Setu (NDRRMA)", ["found_dead"], ["missing"], ["rescued", "found_safe"], "families' intake forms on NDRRMA's Setu — one record per person a family registered"),
    ("OPMCM portal", ["dead"], ["lost_open"], ["found", "rescued"], "the PM's portal: open lost-person *reports*, including duplicates — not people"),
]
RESCUE_SERIES = [
    ("NDRRMA", "rescued", "NDRRMA rescued (cumulative)"),
    ("DAO Nuwakot", "rescued", "DAO Nuwakot rescued"),
    ("Volunteer bulletin (nirajbhusal)", "rescued_named_listed", "volunteer bulletin, named rescued"),
    ("NDRRMA", "heli_flights_total", "NDRRMA heli flights"),
    ("NDRRMA", "injured_under_treatment", "NDRRMA injured under treatment"),
    ("NDRRMA", "injured_discharged", "NDRRMA injured discharged"),
]


# ---------------------------------------------------------------------------
# pure helpers (tested in pipeline/tests/test_morning_report.py)

def fmt_int(v: Any) -> str:
    """1234.0 → '1,234'; None → '—'. Latin digits only."""
    if v is None:
        return "—"
    try:
        f = float(v)
    except (TypeError, ValueError):
        return str(v)
    if f.is_integer():
        return f"{int(f):,}"
    return f"{f:,.1f}"


def delta_str(now: float | None, prev: float | None) -> str:
    """'+12' / '−3' / '±0' / '—' when either side is unknown."""
    if now is None or prev is None:
        return "—"
    d = float(now) - float(prev)
    if d == 0:
        return "±0"
    sign = "+" if d > 0 else "−"
    return f"{sign}{fmt_int(abs(d))}"


def bar(value: float | None, maximum: float | None, width: int = 20) -> str:
    """ASCII bar proportional to value/maximum, e.g. '████████░░░░'."""
    if not value or not maximum or maximum <= 0:
        return "░" * width
    n = max(0, min(width, round(width * float(value) / float(maximum))))
    return "█" * n + "░" * (width - n)


def npt_day(iso: str | None) -> date | None:
    """Kathmandu calendar day of an ISO timestamp."""
    if not iso:
        return None
    t = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    if t.tzinfo is None:
        t = t.replace(tzinfo=timezone.utc)
    return t.astimezone(NPT).date()


def short_time(iso: str | None) -> str:
    """'29 Aug 18:30' in NPT."""
    if not iso:
        return "—"
    t = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    if t.tzinfo is None:
        t = t.replace(tzinfo=timezone.utc)
    return t.astimezone(NPT).strftime("%-d %b %H:%M")


def series_value(series: dict[tuple[str, str], dict[date, float]], publisher: str, metric: str, day: date) -> float | None:
    """The value a publisher stated on `day` (or the last value before it)."""
    days = series.get((publisher, metric)) or {}
    best: date | None = None
    for d in days:
        if d <= day and (best is None or d > best):
            best = d
    return days[best] if best is not None else None


def first_metric(latest: dict[tuple[str, str], dict[str, Any]], publisher: str, metrics: list[str]) -> dict[str, Any] | None:
    for m in metrics:
        row = latest.get((publisher, m))
        if row is not None:
            return row
    return None


def parse_report_data(text: str) -> dict[str, Any]:
    """The machine-readable block a previous report ends with, or {}."""
    i = text.rfind(DATA_MARK)
    if i < 0:
        return {}
    j = text.find("-->", i)
    if j < 0:
        return {}
    try:
        return json.loads(text[i + len(DATA_MARK):j].strip())
    except json.JSONDecodeError:
        return {}


def diff_data(prev: dict[str, Any], now: dict[str, Any]) -> list[str]:
    """Human lines for every headline key whose value changed."""
    out: list[str] = []
    for key, val in now.items():
        old = prev.get(key)
        if old is None:
            continue
        try:
            a, b = float(old), float(val)
        except (TypeError, ValueError):
            if old != val:
                out.append(f"{key}: {old} → {val}")
            continue
        if a != b:
            out.append(f"{key}: {fmt_int(a)} → {fmt_int(b)} ({delta_str(b, a)})")
    return out


def sanitize(text: Any, limit: int = 140) -> str:
    """One line, no phone-like digit runs, truncated."""
    s = " ".join(str(text if text is not None else "").split())
    s = re.sub(r"\+?\d[\d \-]{8,}\d", "[number]", s)
    return s if len(s) <= limit else s[: limit - 1] + "…"


# ---------------------------------------------------------------------------
# gathering (network)

def gather(db: Any, today: date) -> dict[str, Any]:
    latest_rows = db.select_all("figures_latest", {"select": "publisher,metric,scope,value,as_of,url,note"})
    latest: dict[tuple[str, str], dict[str, Any]] = {}
    place_figs: list[dict[str, Any]] = []
    flying: list[dict[str, Any]] = []
    for r in latest_rows:
        if r["scope"] == "national":
            latest[(r["publisher"], r["metric"])] = r
        elif str(r["scope"]).startswith("place:"):
            place_figs.append(r)
        if str(r["metric"]).startswith("flying_window_quality:"):
            flying.append(r)

    series_rows = db.select_all("figure_series", {"select": "publisher,metric,day,value", "scope": "eq.national"})
    series: dict[tuple[str, str], dict[date, float]] = defaultdict(dict)
    for r in series_rows:
        series[(r["publisher"], r["metric"])][date.fromisoformat(r["day"])] = float(r["value"])

    places = db.select_all("v_place_status_latest", {"select": "place_id,name_en,district,kind,expected,confirmed_reached,unknown,status_label,now_en,now_as_of,as_of"})
    # previous day's snapshot per place (last row whose as_of is before today NPT)
    hist = db.select_all("place_status", {"select": "place_id,as_of,unknown", "order": "as_of.desc"})
    # previous day's snapshot per place; when the ledger has no earlier day yet, fall back to its first run
    prev_unknown: dict[str, float] = {}
    prev_label = "yesterday"
    for r in hist:
        d = npt_day(r["as_of"])
        if d is not None and d < today and r["place_id"] not in prev_unknown:
            prev_unknown[r["place_id"]] = float(r["unknown"] or 0)
    if not prev_unknown and hist:
        first_as_of = min(r["as_of"] for r in hist)
        for r in reversed(hist):  # oldest first
            if r["place_id"] not in prev_unknown:
                prev_unknown[r["place_id"]] = float(r["unknown"] or 0)
        prev_label = f"first ledger ({short_time(first_as_of)})"

    sources = db.select_all("v_sources_status", {"select": "id,grp,url,last_fetched_at,last_ok,last_error"})
    findings = db.select_all("findings", {"select": "kind,detail,created_at", "order": "created_at.desc"})
    entities_total = db.count("entities")
    # a merge = an entity built from more than one source record
    merged = sum(1 for e in db.select_all("entities", {"select": "merged_from"}) if isinstance(e.get("merged_from"), list) and len(e["merged_from"]) > 1)
    articles = db.select_all("articles", {"select": "published_at,fetched_at"})
    gauges = db.select_all("v_gauges_latest", {"select": "station_name,alive,observed_at"})
    live = db.select("v_live_counts")

    return {
        "today": today.isoformat(),
        "latest": latest,
        "place_figs": place_figs,
        "flying": flying,
        "series": series,
        "places": places,
        "prev_unknown": prev_unknown,
        "prev_label": prev_label,
        "sources": sources,
        "findings": findings,
        "entities_total": entities_total,
        "merged": merged,
        "articles": articles,
        "gauges": gauges,
        "live": live[0] if live else {},
    }


# ---------------------------------------------------------------------------
# rendering (pure)

def render_report(d: dict[str, Any], prev_data: dict[str, Any] | None = None) -> str:
    today = date.fromisoformat(d["today"])
    yesterday = today - timedelta(days=1)
    two_days = today - timedelta(days=2)
    latest: dict[tuple[str, str], dict[str, Any]] = d["latest"]
    series = d["series"]
    out: list[str] = []
    data: dict[str, Any] = {}
    now_utc = datetime.now(timezone.utc)
    L = out.append

    L(f"# Morning report — {today.strftime('%-d %B %Y')} (NPT)")
    L("")
    L(f"Generated {now_utc.astimezone(NPT).strftime('%-d %b %H:%M')} NPT from the live DERIVED tables by `scripts/morning_report.py`. "
      "Every number carries its publisher and the time it was stated. Third-party quotations (`*_quoted`) are excluded. "
      "Counts only — no names, no contacts.")
    live = d.get("live") or {}
    L("")
    L(f"Pipeline: last pull {short_time(live.get('last_pull_at'))} · last processed {short_time(live.get('last_processed_at'))} · "
      f"public submissions total {fmt_int(live.get('submissions_total'))}.")
    L("")

    # 1. headline numbers -----------------------------------------------------------------------------
    L("## 1. Headline numbers — where each publisher stands and how they moved")
    L("")
    L("| Publisher | Metric | Now | as of | 24 h | 48 h |")
    L("|---|---|---:|---|---:|---:|")
    for pub, dead_m, miss_m, resc_m, meaning in HEADLINE_PUBLISHERS:
        for label, metrics in (("dead", dead_m), ("missing / out of contact", miss_m), ("rescued / found", resc_m)):
            row = first_metric(latest, pub, metrics)
            if row is None:
                continue
            metric = row["metric"]
            now_v = float(row["value"])
            v1 = series_value(series, pub, metric, yesterday)
            v2 = series_value(series, pub, metric, two_days)
            L(f"| {pub} | {label} (`{metric}`) | {fmt_int(now_v)} | {short_time(row['as_of'])} | {delta_str(now_v, v1)} | {delta_str(now_v, v2)} |")
            data[f"{pub} · {metric}"] = now_v
        L(f"| | _{meaning}_ | | | | |")
    L("")
    L("24 h / 48 h = change against the value the same publisher stated on the previous Kathmandu day(s) (`figure_series`); "
      "'—' means the publisher had no earlier value. The publishers count different things, so do not subtract one from another.")
    L("")

    # 2. unknowns ------------------------------------------------------------------------------------
    L("## 2. Where the unknowns are")
    L("")
    places = [p for p in d["places"] if (p.get("status_label") != "district") and (p.get("kind") != "district")]
    by_unknown = sorted(places, key=lambda p: -(float(p.get("unknown") or 0)))[:12]
    top = float(by_unknown[0]["unknown"]) if by_unknown else 0
    prev_unknown: dict[str, float] = d["prev_unknown"]
    prev_label = d.get("prev_label", "yesterday")
    L("Top 12 places by people still unaccounted for (ledger: reported there − confirmed reached):")
    L("")
    L("```")
    for p in by_unknown:
        u = float(p.get("unknown") or 0)
        pv = prev_unknown.get(p["place_id"])
        L(f"{(p.get('name_en') or p['place_id'])[:26]:<26} {bar(u, top)} {fmt_int(u):>6}  ({fmt_int(p.get('expected'))} reported · {fmt_int(p.get('confirmed_reached'))} reached)  vs {prev_label} {delta_str(u, pv)}")
        data[f"unknown · {p['place_id']}"] = u
    L("```")
    L("")
    movers = sorted(
        [(p, float(p.get("unknown") or 0) - prev_unknown[p["place_id"]]) for p in places if p["place_id"] in prev_unknown],
        key=lambda t: -abs(t[1]),
    )[:8]
    if movers:
        L(f"Biggest moves vs {prev_label}:")
        L("")
        for p, dv in movers:
            if dv == 0:
                continue
            L(f"- {p.get('name_en') or p['place_id']}: {delta_str(dv, 0)} unknown (now {fmt_int(p.get('unknown'))})")
        L("")
    L("What is happening now at the top 5 (process_data step ⑩):")
    L("")
    for p in by_unknown[:5]:
        line = sanitize(p.get("now_en"), 400) or "no line yet"
        L(f"- **{p.get('name_en') or p['place_id']}** — {line} _(as of {short_time(p.get('now_as_of'))})_")
    L("")

    # 3. help requests -------------------------------------------------------------------------------
    L("## 3. Help requests on the PM's portal, by place (rescuers' hotspot list)")
    L("")
    names = {p["place_id"]: (p.get("name_en") or p["place_id"]) for p in d["places"]}
    help_by: dict[str, dict[str, float]] = defaultdict(dict)
    help_as_of = None
    for r in d["place_figs"]:
        if r["publisher"] != "OPMCM portal" or r["metric"] not in ("help_requests_open", "help_requests_critical", "people_affected_reported"):
            continue
        pid = str(r["scope"])[len("place:"):].split("|")[0]
        help_by[pid][r["metric"]] = float(r["value"])
        help_as_of = help_as_of or r["as_of"]
    rows = sorted(help_by.items(), key=lambda kv: -(kv[1].get("help_requests_open", 0)))
    if rows:
        L(f"As of {short_time(help_as_of)} (OPMCM portal `help_requests_*`; 'unresolved' = requests the portal could not place):")
        L("")
        L("| Place | Open | Critical | People affected |")
        L("|---|---:|---:|---:|")
        for pid, m in rows[:15]:
            L(f"| {names.get(pid, pid)} | {fmt_int(m.get('help_requests_open'))} | {fmt_int(m.get('help_requests_critical'))} | {fmt_int(m.get('people_affected_reported'))} |")
        tot_open = sum(m.get("help_requests_open", 0) for _, m in rows)
        tot_crit = sum(m.get("help_requests_critical", 0) for _, m in rows)
        L(f"| **Total (placed)** | **{fmt_int(tot_open)}** | **{fmt_int(tot_crit)}** | |")
        data["help · open"] = tot_open
        data["help · critical"] = tot_crit
    else:
        L("No place-scoped help-request figures yet (source `opmcm_help_requests`).")
    L("")

    # 4. rescue throughput ---------------------------------------------------------------------------
    L("## 4. Rescue throughput, day by day")
    L("")
    days = [today - timedelta(days=i) for i in range(5, -1, -1)]
    L("| Series | " + " | ".join(dd.strftime("%-d %b") for dd in days) + " |")
    L("|---|" + "---:|" * len(days))
    for pub, metric, label in RESCUE_SERIES:
        vals = [series_value(series, pub, metric, dd) for dd in days]
        if all(v is None for v in vals):
            continue
        cells = []
        prev = None
        for v in vals:
            if v is None:
                cells.append("—")
            else:
                cells.append(fmt_int(v) + (f" ({delta_str(v, prev)})" if prev is not None and v != prev else ""))
            prev = v if v is not None else prev
        L(f"| {label} | " + " | ".join(cells) + " |")
        if vals[-1] is not None:
            data[f"{pub} · {metric}"] = vals[-1]
    L("")
    L("Cumulative figures; the bracketed change is the day's increment. A day shows the last value stated that day.")
    L("")

    # 5. infrastructure ------------------------------------------------------------------------------
    L("## 5. Infrastructure")
    L("")
    hot = {m: latest.get(("HOT OSM", m)) for m in ("bridges_surveyed", "bridges_washed_out", "bridges_damaged", "bridges_intact")}
    if hot["bridges_surveyed"]:
        L(f"- Bridges (HOT OSM damage survey, as of {short_time(hot['bridges_surveyed']['as_of'])}): "
          f"{fmt_int(hot['bridges_surveyed']['value'])} surveyed · {fmt_int(hot['bridges_washed_out']['value'] if hot['bridges_washed_out'] else None)} washed out · "
          f"{fmt_int(hot['bridges_damaged']['value'] if hot['bridges_damaged'] else None)} damaged · {fmt_int(hot['bridges_intact']['value'] if hot['bridges_intact'] else None)} intact")
        data["HOT OSM · bridges_washed_out"] = float(hot["bridges_washed_out"]["value"]) if hot["bridges_washed_out"] else None
    nesra = latest.get(("NESRA FloodWatch", "bridges_to_inspect")) or latest.get(("NESRA FloodWatch", "bridges_intersecting"))
    if nesra:
        L(f"- Bridges to inspect (NESRA FloodWatch, as of {short_time(nesra['as_of'])}): {fmt_int(nesra['value'])}")
    td = latest.get(("NDRRMA", "telecom_towers_damaged"))
    tr = latest.get(("NDRRMA", "telecom_towers_restored"))
    if td and tr and float(td["value"]) > 0:
        pct = 100 * float(tr["value"]) / float(td["value"])
        L(f"- Telecom towers (NDRRMA, as of {short_time(tr['as_of'])}): {fmt_int(tr['value'])} of {fmt_int(td['value'])} restored — {pct:.0f}%  {bar(float(tr['value']), float(td['value']))}")
        data["NDRRMA · towers_restored_pct"] = round(pct)
    gauges = d.get("gauges") or []
    alive = [g for g in gauges if g.get("alive")]
    corridor = [g for g in gauges if re.search(r"rasuwagad|syaphru|shyaprubesi|syabru|betrawati|dhunche|galch|kali khola|devghat|malekhu|kalikhola", str(g.get("station_name")), re.I)]
    corridor_alive = [g for g in corridor if g.get("alive")]
    if gauges:
        L(f"- River gauges: {len(alive)} of {len(gauges)} stations reporting; on the corridor {len(corridor_alive)} of {len(corridor)} "
          f"({', '.join(sorted({str(g['station_name']).split(' at ')[-1] for g in corridor_alive})) or 'none'}). Dead since 26 Aug: "
          f"{', '.join(sorted({str(g['station_name']).split(' at ')[-1] for g in corridor if not g.get('alive')})) or 'none'}.")
        data["gauges · corridor_alive"] = len(corridor_alive)
    fly = sorted(d.get("flying") or [], key=lambda r: (r["metric"], r["scope"]))
    if fly:
        L("- Flying windows (Open-Meteo/ECMWF forecast, illustrative):")
        for r in fly[:6]:
            day_s = str(r["metric"]).split(":")[-1]
            L(f"    - {day_s} · {str(r['scope'])[len('place:'):]}: {sanitize(r.get('note'), 90)}")
    L("")

    # 6. data quality --------------------------------------------------------------------------------
    L("## 6. Data quality")
    L("")
    sources = d.get("sources") or []
    failing = [s for s in sources if s.get("last_ok") is False]
    never = [s for s in sources if not s.get("last_fetched_at")]
    stale = []
    for s in sources:
        lf = s.get("last_fetched_at")
        if lf and (now_utc - datetime.fromisoformat(lf.replace("Z", "+00:00"))).total_seconds() > 8 * 3600:
            stale.append(s)
    L(f"- Sources: {len(sources)} registered · {len(failing)} failing on the last pull · {len(stale)} not fetched in 8 h · {len(never)} never fetched (unverified candidates and derived rows).")
    for s in failing[:8]:
        L(f"    - ! `{s['id']}`: {sanitize(s.get('last_error'), 100)}")
    L(f"- People records: {fmt_int(d.get('entities_total'))} entities across the registries; {fmt_int(d.get('merged'))} are merges of duplicate records (dedup step ②).")
    data["entities · merged"] = d.get("merged")
    finds = d.get("findings") or []
    kinds = Counter(f.get("kind") for f in finds)
    L(f"- Findings (private table): {len(finds)} — " + ", ".join(f"{k} ×{n}" for k, n in kinds.most_common()) + ".")
    for f in finds[:5]:
        det = f.get("detail")
        if isinstance(det, dict):
            det = det.get("summary") or det.get("message") or json.dumps(det, ensure_ascii=False)
        L(f"    - {f.get('kind')}: {sanitize(det, 160)}")
    arts = d.get("articles") or []
    per_day: Counter[str] = Counter()
    for a in arts:
        dd = npt_day(a.get("published_at") or a.get("fetched_at"))
        if dd:
            per_day[dd.isoformat()] += 1
    recent = [(today - timedelta(days=i)).isoformat() for i in range(4, -1, -1)]
    L("- Articles per day (published or, if undated, fetched): " + " · ".join(f"{dd[5:]}: {per_day.get(dd, 0)}" for dd in recent) + f" (total {len(arts):,}).")
    L("")

    # 7. what changed --------------------------------------------------------------------------------
    L("## 7. What changed since the previous report")
    L("")
    if prev_data:
        changes = diff_data(prev_data, data)
        if changes:
            for c in changes:
                L(f"- {c}")
        else:
            L("- Nothing in the tracked numbers changed.")
        new_keys = [k for k in data if k not in prev_data]
        if new_keys:
            L(f"- New in this report: {', '.join(new_keys[:12])}{'…' if len(new_keys) > 12 else ''}")
    else:
        L("- First report — nothing to compare against yet.")
    L("")
    L("---")
    L("Read next: the live site https://www.nepalfloodtracker.com · `docs/audit-2026-08-30.md` (data-quality audit) · `make health`.")
    L("")
    L(DATA_MARK + json.dumps(data, ensure_ascii=False, sort_keys=True) + " -->")
    L("")
    return "\n".join(out)


# ---------------------------------------------------------------------------

def previous_report(dir_: Path, today: date) -> dict[str, Any]:
    files = sorted(p for p in dir_.glob("*-morning.md") if not p.name.startswith(today.isoformat()))
    if not files:
        return {}
    return parse_report_data(files[-1].read_text(encoding="utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--stdout", action="store_true", help="print instead of writing the file")
    ap.add_argument("--date", help="YYYY-MM-DD (default: today in Kathmandu)")
    args = ap.parse_args()
    today = date.fromisoformat(args.date) if args.date else datetime.now(NPT).date()

    from lib import net  # noqa: F401  (forces IPv4 for the Supabase host)
    from lib.db import Db

    db = Db.from_env()
    if db is None:
        print("pipeline/.env not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)", file=sys.stderr)
        return 2
    data = gather(db, today)
    text = render_report(data, previous_report(REPORTS_DIR, today))
    if args.stdout:
        print(text)
        return 0
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / f"{today.isoformat()}-morning.md"
    out.write_text(text, encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({len(text.splitlines())} lines)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
