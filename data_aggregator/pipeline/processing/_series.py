"""
processing/_series.py — pure helpers for day series over `figures`. Shared by ⑤ stats (day-over-day deltas),
⑧ timeline (per-day sitrep rows) and ⑨ trends (the `figure_series` table). No DB access here.

    parse_ts(v)                 ISO string / datetime → aware datetime (naive → NPT)
    npt_day(v)                  → date in Asia/Kathmandu
    daily_last(rows)            figures rows → {(publisher, metric, scope): [point, …]}   one point per NPT day,
                                the LAST value published that day (a sitrep at 18:30 supersedes one at 09:00),
                                sorted by day; point = {day, value, as_of, url, note}
    latest_and_previous(points) → (latest point, last point on an earlier day) — the day-over-day pair
    with_deltas(points)         → points with `delta` vs the previous day's point (None for the first)
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from typing import Any

from lib import config


def parse_ts(v: Any) -> datetime | None:
    if not v:
        return None
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=config.KTM)
    try:
        d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=config.KTM)


def npt_day(v: Any) -> date | None:
    d = parse_ts(v)
    return d.astimezone(config.KTM).date() if d else None


def daily_last(rows: list[dict[str, Any]]) -> dict[tuple[str, str, str], list[dict[str, Any]]]:
    best: dict[tuple[str, str, str], dict[date, dict[str, Any]]] = defaultdict(dict)
    for r in rows:
        at = parse_ts(r.get("as_of"))
        if at is None or r.get("value") is None:
            continue
        key = (r["publisher"], r["metric"], r.get("scope") or "national")
        day = at.astimezone(config.KTM).date()
        cur = best[key].get(day)
        if cur is None or at > cur["_at"]:
            best[key][day] = {"day": day, "value": float(r["value"]), "as_of": at, "url": r.get("url"), "note": r.get("note"), "_at": at}
    out: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for key, by_day in best.items():
        pts = [dict((k, v) for k, v in p.items() if k != "_at") for _, p in sorted(by_day.items())]
        out[key] = pts
    return out


def latest_and_previous(points: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    if not points:
        return None, None
    latest = points[-1]
    prev = points[-2] if len(points) > 1 else None
    return latest, prev


def with_deltas(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out = []
    prev: dict[str, Any] | None = None
    for p in points:
        q = dict(p)
        q["delta"] = (p["value"] - prev["value"]) if prev else None
        out.append(q)
        prev = p
    return out


def fmt_int(n: float | int | None) -> str:
    if n is None:
        return "—"
    return f"{int(round(n)):,}" if float(n).is_integer() or abs(n) >= 100 else f"{n:g}"


def fmt_delta(n: float | None) -> str:
    if n is None or n == 0:
        return ""
    return f"{'+' if n > 0 else '−'}{fmt_int(abs(n))}"
