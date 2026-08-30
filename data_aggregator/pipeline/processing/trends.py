"""
processing/trends.py — step ⑨. See docs/process_data/10-timeline-and-trends.md.

figures (as_of within the last LOOKBACK_DAYS and not in the future) ─▶ _series.daily_last() ─▶ one row per
publisher × metric × scope × NPT day with that day's LAST published value ─▶ upsert figure_series.
Forecast rows (Open-Meteo hours ahead of now) are left out: a series is history, not a forecast.
Idempotent: the primary key is the day, so re-runs overwrite the same rows.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from lib import log
from processing import ProcCtx
from processing._series import daily_last

STEP = "09-trends"
LOOKBACK_DAYS = 30


def series_rows(figures: list[dict[str, Any]], now) -> list[dict[str, Any]]:
    """Pure: figures rows → figure_series rows (future-dated figures dropped)."""
    hist = [f for f in figures if f.get("as_of") and str(f["as_of"]) <= now.isoformat()]
    out = []
    for (pub, metric, scope), pts in daily_last(hist).items():
        for p in pts:
            out.append({"publisher": pub, "metric": metric, "scope": scope, "day": p["day"], "value": p["value"],
                        "as_of": p["as_of"], "url": p.get("url"), "computed_at": now})
    return out


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        since = (ctx.now - timedelta(days=LOOKBACK_DAYS)).isoformat()
        rows = ctx.db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,url",
                                             "as_of": f"gte.{since}", "order": "as_of.asc"})
        out = series_rows(rows, ctx.now)
        if out and not ctx.dry_run:
            ctx.db.upsert("figure_series", out, on_conflict="publisher,metric,scope,day")
        keys = {(r["publisher"], r["metric"], r["scope"]) for r in out}
        multi = sum(1 for k in keys if sum(1 for r in out if (r["publisher"], r["metric"], r["scope"]) == k) > 1)
        log.info("trends.done", rows=len(out), series=len(keys), multi_day=multi)
        return {"rows": len(out), "series": len(keys), "multi_day_series": multi}
    except Exception as e:  # noqa: BLE001
        log.error("trends.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
