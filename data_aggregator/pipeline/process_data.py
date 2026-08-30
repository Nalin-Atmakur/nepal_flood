#!/usr/bin/env python3
"""
process_data.py — ARCHIVE + RAW → DERIVED, in numbered steps (one module each under processing/).
Docs: docs/process_data/00-anonymise.md … 07-digest.md, then 08-llm-budget.md, 09-failure-modes.md.

    ⓪ anonymise        reports_archive → reports_anon · OPMCM projection        processing/anonymise.py
    ① resolve_places   articles.places, reports_anon.place_id                    processing/resolve_places.py
    ② dedup            entities / entity_events / dedup_queue                   processing/dedup.py
    ③ ledger           place_status / place_timeline                            processing/ledger.py
    ③b press_figures   Police / Tourism counts quoted in articles → figures     processing/press_figures.py  (--step 3.5)
    ④ figures_latest   latest per publisher × metric × scope                    processing/figures_latest.py
    ⑤ stats            striking + live numbers, report_counts                   processing/stats.py
    ⑥ findings         data-quality findings                                    processing/findings.py
    ⑦ digest           daily "what changed" bullets (EN/NE/HI)                  processing/digest.py
    ⑧ timeline         dated milestones appended to event_timeline              processing/timeline.py
    ⑨ trends           figure_series: one value per publisher × metric × day    processing/trends.py
    then reports_archive.status anonymised → processed (matched rows keep 'matched')

Flags: --step N (repeatable; default all; 3.5 = ③b) · --dry-run (compute, write nothing) · --verbose ·
--purge-irrelevant (one-off maintenance: drop stored articles that fail the relevance gate).
Needs SUPABASE_URL (the DERIVED zone lives only in the DB); exits 2 without it.
A step that fails logs and returns {"error"}; the next step still runs; exit code stays 0.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import config, log  # noqa: E402
from lib.db import Db  # noqa: E402
from lib.llm import LLM  # noqa: E402
from lib.places import Gazetteer  # noqa: E402
from lib.state import State, utcnow  # noqa: E402
from processing import ProcCtx  # noqa: E402
from processing import (anonymise, dedup, digest, figures_latest, findings, ledger, press_figures, purge_irrelevant,  # noqa: E402
                        resolve_places, stats, timeline, trends)

STEPS = [
    (0, "anonymise", anonymise.run),
    (1, "resolve_places", resolve_places.run),
    (2, "dedup", dedup.run),
    (3, "ledger", ledger.run),
    (3.5, "press_figures", press_figures.run),     # ③b — before ④ so figures_latest picks the press figures up
    (4, "figures_latest", figures_latest.run),
    (5, "stats", stats.run),
    (6, "findings", findings.run),
    (7, "digest", digest.run),
    (8, "timeline", timeline.run),
    (9, "trends", trends.run),
]


def finalise_statuses(ctx: ProcCtx) -> dict[str, int]:
    """anonymised → processed once every step has run (matched rows were set by ②)."""
    rows = ctx.db.select("reports_archive", {"select": "id", "status": "eq.anonymised", "withdrawn_at": "is.null", "limit": 1000})
    if not ctx.dry_run:
        for r in rows:
            ctx.db.update("reports_archive", {"id": f"eq.{r['id']}"}, {"status": "processed"})
    return {"processed": len(rows)}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--step", action="append", type=float, default=[], help="run only this step number (repeatable; 3.5 = press_figures)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--purge-irrelevant", action="store_true", help="one-off: delete stored articles that fail the relevance gate, then exit")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args(argv)
    config.load_env()
    log.configure("debug" if args.verbose else "info", file=config.RUN_LOG)
    t0 = time.monotonic()
    db = Db.from_env()
    if db is None:
        log.error("process.no_db", hint="SUPABASE_URL unset — process_data needs the database")
        return 2
    if not db.ping():
        return 2
    state = State()
    gaz = Gazetteer.load(db)
    llm = LLM(state)
    ctx = ProcCtx(db=db, gaz=gaz, llm=llm, state=state, dry_run=args.dry_run, now=utcnow())
    log.info("process.start", dry_run=args.dry_run, steps=args.step or "all", places=len(gaz),
             llm_spent_usd=round(llm.spent_usd, 4), llm_budget_usd=llm.budget_usd)
    summary: dict[str, object] = {}
    if args.purge_irrelevant:
        summary["purge_irrelevant"] = purge_irrelevant.run(ctx)
        print(json.dumps(summary, ensure_ascii=False, indent=1, default=str))
        return 0
    for n, name, fn in STEPS:
        if args.step and n not in args.step:
            continue
        ts = time.monotonic()
        try:
            res = fn(ctx)
        except Exception as e:  # noqa: BLE001 — belt and braces; steps catch their own errors
            log.error("process.step_crashed", step=n, name=name, error=f"{type(e).__name__}: {str(e)[:200]}")
            res = {"error": type(e).__name__}
        summary[f"{n:g}-{name}"] = res
        log.info("process.step", step=n, name=name, seconds=round(time.monotonic() - ts, 1), result=res)
    if not args.step or max(args.step) >= 7:
        summary["finalise"] = finalise_statuses(ctx)
    if not args.dry_run:
        state.mark_run("process", llm_usd=round(llm.spent_usd, 4))
        state.save()
    summary["llm"] = {"calls_this_run": llm.calls_this_run, "refused": llm.refused, "spent_usd": round(llm.spent_usd, 4)}
    log.info("process.done", seconds=round(time.monotonic() - t0, 1), llm_calls=llm.calls_this_run, llm_usd=round(llm.spent_usd, 4))
    print(json.dumps(summary, ensure_ascii=False, indent=1, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
