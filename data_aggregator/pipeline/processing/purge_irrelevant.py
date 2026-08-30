"""
processing/purge_irrelevant.py — one-off maintenance: `process_data.py --purge-irrelevant`.
See docs/process_data/09-failure-modes.md §"off-topic articles" and docs/pull_external_data/04-normalising.md.

Deletes every `articles` row that fails normalisers/_rss.is_relevant(title, body) — the gate every
new pull applies — and the place_timeline rows whose source_url pointed at a deleted article.
Safe to re-run; prints what it removed.
"""
from __future__ import annotations

from typing import Any

from lib import log
from normalisers._rss import is_relevant
from processing import ProcCtx


def run(ctx: ProcCtx) -> dict[str, Any]:
    db = ctx.db
    rows = db.select_all("articles", {"select": "id,url,title,body"})
    bad = [a for a in rows if not is_relevant(a.get("title"), a.get("body"), ctx.gaz)]
    if not ctx.dry_run:
        for i in range(0, len(bad), 60):
            chunk = bad[i:i + 60]
            db.delete("articles", {"id": f"in.({','.join(str(a['id']) for a in chunk)})"})
        urls = [a["url"] for a in bad if a.get("url")]
        for i in range(0, len(urls), 20):
            for u in urls[i:i + 20]:
                db.delete("place_timeline", {"source_url": f"eq.{u}"})
    log.info("purge_irrelevant.done", scanned=len(rows), removed=len(bad), dry_run=ctx.dry_run)
    return {"scanned": len(rows), "removed": len(bad), "sample_removed": [a.get("title", "")[:80] for a in bad[:5]]}
