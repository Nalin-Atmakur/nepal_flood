"""
processing/figures_latest.py — step ④. See docs/process_data/04-figures-latest.md.
figures (last 30 days) ─▶ for each (publisher, metric, scope) the row with the newest as_of
(ties: newest fetched_at) ─▶ upsert figures_latest (primary key publisher, metric, scope).
The side-by-side table on the home page reads publishers NDRRMA · Nepal Police · MoFA ·
Dept of Tourism · OPMCM portal for metrics dead · missing · rescued (+ foreigners_* / tourists_*).
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from lib import log
from processing import ProcCtx

STEP = "04-figures-latest"
LOOKBACK_DAYS = 30


def pick_latest(rows: list[dict[str, Any]]) -> dict[tuple[str, str, str], dict[str, Any]]:
    best: dict[tuple[str, str, str], dict[str, Any]] = {}
    for f in rows:
        k = (f["publisher"], f["metric"], f.get("scope") or "national")
        cur = best.get(k)
        key = (f.get("as_of") or "", f.get("fetched_at") or "")
        if cur is None or key > (cur.get("as_of") or "", cur.get("fetched_at") or ""):
            best[k] = f
    return best


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        since = (ctx.now - timedelta(days=LOOKBACK_DAYS)).isoformat()
        rows = ctx.db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,fetched_at,url,note",
                                             "fetched_at": f"gte.{since}", "order": "as_of.desc"})
        best = pick_latest(rows)
        out = [{"publisher": p, "metric": m, "scope": s, "value": f["value"], "as_of": f.get("as_of"), "url": f.get("url"),
                "note": f.get("note"), "computed_at": ctx.now} for (p, m, s), f in best.items()]
        if not ctx.dry_run and out:
            ctx.db.upsert("figures_latest", out, on_conflict="publisher,metric,scope")
        pubs = sorted({p for p, _, _ in best})
        log.info("figures_latest.done", rows=len(out), publishers=len(pubs))
        return {"rows": len(out), "publishers": pubs}
    except Exception as e:  # noqa: BLE001
        log.error("figures_latest.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
