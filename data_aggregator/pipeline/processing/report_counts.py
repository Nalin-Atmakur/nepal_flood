"""
processing/report_counts.py — part of step ⑤. See docs/process_data/05-stats.md ("report_counts").
reports_anon ─▶ count per (hour bucket, respondent_type, place_id or 'unresolved') ─▶ upsert report_counts.
No other columns, ever (the table is public).
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Any

from lib import log
from processing import ProcCtx


def bucket_of(created_at: str) -> datetime:
    d = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    d = d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)


def counts(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    c: Counter[tuple[datetime, str, str]] = Counter()
    for r in rows:
        c[(bucket_of(r["created_at"]), r["respondent_type"], r.get("place_id") or "unresolved")] += 1
    return [{"bucket": b, "respondent_type": t, "place_id": p, "n": n} for (b, t, p), n in c.items()]


def run(ctx: ProcCtx) -> dict[str, Any]:
    rows = ctx.db.select_all("reports_anon", {"select": "created_at,respondent_type,place_id"})
    out = counts(rows)
    for o in out:
        o["computed_at"] = ctx.now
    if out and not ctx.dry_run:
        ctx.db.upsert("report_counts", out, on_conflict="bucket,respondent_type,place_id")
    log.info("report_counts.done", buckets=len(out))
    return {"buckets": len(out)}
