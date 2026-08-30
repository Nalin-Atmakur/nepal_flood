"""
processing/resolve_places.py — step ①. See docs/process_data/01-resolve-places.md.

    articles (places = '{}' and extracted is null, last ARTICLE_LOOKBACK_DAYS)
        │  alias match over title + body (lib.places, NE/HI/EN/ZH, diacritic/script-insensitive)
        │  no alias hit AND corridor keyword present AND budget left → LLM constrained to gazetteer ids
        ▼
    articles.places = [ids] · articles.extracted = {"resolved_at", "method", "matches"}
    reports_anon (place_id is null, place_text not null) → place_id via aliases

Every article is touched once (extracted is set even when nothing matched) so re-runs are cheap.
The LLM path is capped by lib.llm's per-run cap and only fires for texts that mention the corridor.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from lib import config, log
from lib.llm import nullable, schema
from lib.text import nfc
from processing import ProcCtx

STEP = "01-resolve-places"
LLM_FORMAT = schema("place_pick", {
    "place_ids": {"type": "array", "items": {"type": "string"}, "description": "gazetteer ids mentioned, best first; empty if none"},
    "confidence": nullable("number"),
})
SYSTEM = ("You map news headlines about the 26 Aug 2026 Bhote Koshi/Trishuli flood (Nepal) to gazetteer place ids. "
          "Answer only with ids from the list; empty array when no listed place is mentioned.")


def llm_pick(ctx: ProcCtx, text: str) -> list[str]:
    ids = ctx.gaz.ids()
    listing = "\n".join(f"{p.id} = {p.name_en}" + (f" / {p.name_ne}" if p.name_ne else "") for p in ctx.gaz.all())
    res = ctx.llm.complete_json("resolve_place", SYSTEM, f"GAZETTEER:\n{listing}\n\nTEXT:\n{text[:1500]}", LLM_FORMAT, max_tokens=120)
    if not res:
        return []
    return [i for i in (res.get("place_ids") or []) if i in ids][:5]


def resolve_articles(ctx: ProcCtx, limit: int = 400) -> dict[str, Any]:
    db = ctx.db
    since = (ctx.now - timedelta(days=config.ARTICLE_LOOKBACK_DAYS)).isoformat()
    rows = db.select("articles", {"select": "id,title,body,publisher,lang", "extracted": "is.null",
                                  "fetched_at": f"gte.{since}", "order": "fetched_at.desc", "limit": limit})
    matched = llm_used = 0
    for a in rows:
        text = nfc(a.get("title") or "") + "\n" + nfc(a.get("body") or "")[:1500]
        ids = ctx.gaz.resolve_ids(text)
        method = "alias"
        if not ids and config.LLM_CORRIDOR_KEYWORDS.search(text) and ctx.llm.can_call()[0]:
            ids = llm_pick(ctx, text)
            method = "llm"
            llm_used += 1
        matched += bool(ids)
        if not ctx.dry_run:
            db.update("articles", {"id": f"eq.{a['id']}"},
                      {"places": ids, "extracted": {"resolved_at": ctx.now.isoformat(), "method": method if ids else "none", "matches": ids}})
    log.info("resolve_places.articles", scanned=len(rows), matched=matched, llm=llm_used)
    return {"scanned": len(rows), "matched": matched, "llm": llm_used}


def resolve_reports(ctx: ProcCtx) -> dict[str, Any]:
    db = ctx.db
    rows = db.select("reports_anon", {"select": "id,place_text,text_redacted", "place_id": "is.null", "limit": 500})
    n = 0
    for r in rows:
        pid = ctx.gaz.resolve(r.get("place_text")) or ctx.gaz.resolve(r.get("text_redacted"))
        if pid:
            n += 1
            if not ctx.dry_run:
                db.update("reports_anon", {"id": f"eq.{r['id']}"}, {"place_id": pid})
    log.info("resolve_places.reports", scanned=len(rows), resolved=n)
    return {"scanned": len(rows), "resolved": n}


def run(ctx: ProcCtx) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for name, fn in (("articles", resolve_articles), ("reports", resolve_reports)):
        try:
            out[name] = fn(ctx)
        except Exception as e:  # noqa: BLE001
            log.error("resolve_places.failed", part=name, error=f"{type(e).__name__}: {str(e)[:200]}")
            out[name] = {"error": type(e).__name__}
    return out
