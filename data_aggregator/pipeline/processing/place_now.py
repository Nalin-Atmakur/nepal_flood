"""
processing/place_now.py — step ⑩: the per-place "what is happening now" line.
docs/process_data/11-place-now.md.

For every gazetteer place with a public-source signal in the last PLACE_NOW_HOURS (36 h) — a place-scoped figure,
article or public-source place_timeline line — build ONE or TWO sentences in English
from counts, publisher names and headline titles only (never names, phones or free text from reports), then ask
the model to polish the English and translate to Nepali and Hindi (batched, budget-guarded, capped per run).
When the model is unavailable or refused, a deterministic trilingual template is written instead, so the
column is never empty where a signal exists.

    figures (scope place:<id>, 36 h)  ─┐
    articles (places ∋ id, 36 h)      ─┤
    reports_anon (legacy mode only)   ─┼─▶ facts(place) ─▶ template_en / template_ne / template_hi
    place_timeline (day ≥ yesterday)  ─┤            │
    v_place_status_latest             ─┘            ▼  batches of PLACE_NOW_BATCH
                                              llm.complete_json("place_now") ─▶ {en, ne, hi} per place
                                                        │ (fallback: the templates)
                                                        ▼
                                    place_status (latest row per place): now_en/now_ne/now_hi/now_sources/now_as_of
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any

from lib import config
from lib import log
from lib.llm import schema

from . import ProcCtx


PLACE_NOW_HOURS = 36
PLACE_NOW_BATCH = 6            # places per model call (keeps each answer well under max_tokens)
PLACE_NOW_STEP_CAP_USD = 1.0   # this step never spends more than this per run
MAX_HEADLINES = 2
MAX_FRAGMENTS = 6              # figure fragments per line, in FRAGMENTS order (the most rescue-useful first)

# metric → (en, ne, hi) fragments; {n} = value, {pub} = publisher. Unknown metrics fall back to GENERIC.
FRAGMENTS: dict[str, tuple[str, str, str]] = {
    "help_requests_open": ("{n} open help requests ({pub})", "{n} खुला सहायता अनुरोध ({pub})", "{n} खुले सहायता अनुरोध ({pub})"),
    "help_requests_critical": ("{n} critical ({pub})", "{n} अति-आवश्यक ({pub})", "{n} अति-गंभीर ({pub})"),
    "people_affected_reported": ("{n} people reported affected ({pub})", "{n} जना प्रभावित भनी रिपोर्ट ({pub})", "{n} लोग प्रभावित बताए गए ({pub})"),
    "bridges_to_inspect": ("{n} bridge(s) to inspect ({pub})", "{n} पुल निरीक्षण गर्नुपर्ने ({pub})", "{n} पुल निरीक्षण बाकी ({pub})"),
    "bridges_affected": ("{n} bridge(s) affected ({pub})", "{n} पुल प्रभावित ({pub})", "{n} पुल प्रभावित ({pub})"),
    "buildings_affected": ("{n} buildings affected ({pub})", "{n} भवन प्रभावित ({pub})", "{n} इमारतें प्रभावित ({pub})"),
    "rescued": ("{n} rescued ({pub})", "{n} उद्धार ({pub})", "{n} बचाए गए ({pub})"),
    "missing": ("{n} missing ({pub})", "{n} बेपत्ता ({pub})", "{n} लापता ({pub})"),
    "dead": ("{n} dead ({pub})", "{n} मृत ({pub})", "{n} मृत ({pub})"),
    "found": ("{n} found ({pub})", "{n} फेला परेका ({pub})", "{n} मिले ({pub})"),
    "stationed": ("{n} stationed here ({pub})", "{n} यहाँ रहेका ({pub})", "{n} यहाँ ठहरे हुए ({pub})"),
    "telecom_towers_restored": ("{n} tower(s) restored ({pub})", "{n} टावर पुनर्स्थापित ({pub})", "{n} टावर बहाल ({pub})"),
    "road_bridges_inventory": ("{n} road bridge(s) in the inventory ({pub})", "{n} सडक पुल सूचीमा ({pub})", "{n} सड़क पुल सूची में ({pub})"),
    "lost_open": ("{n} open missing-person reports ({pub})", "{n} खुला बेपत्ता रिपोर्ट ({pub})", "{n} खुली लापता रिपोर्ट ({pub})"),
    "lost": ("{n} missing-person reports ({pub})", "{n} बेपत्ता रिपोर्ट ({pub})", "{n} लापता रिपोर्ट ({pub})"),
    "barrier_lake_volume_m3": ("barrier lake volume {n} m³ ({pub})", "थुनिएको तालको आयतन {n} घन मि. ({pub})", "बांध-झील का आयतन {n} घन मी. ({pub})"),
    "barrier_lake_inflow_m3": ("inflow {n} m³ ({pub})", "आगमन {n} घन मि. ({pub})", "आवक {n} घन मी. ({pub})"),
    "flood_extent_km2": ("flood extent {n} km² ({pub})", "बाढी फैलावट {n} वर्ग किमि ({pub})", "बाढ़ का फैलाव {n} वर्ग किमी ({pub})"),
}
FRAGMENT_ORDER = {k: i for i, k in enumerate(FRAGMENTS)}
BRIDGE_STATUS = ("{n} bridge(s) washed out or damaged ({pub})", "{n} पुल बगेका वा क्षतिग्रस्त ({pub})", "{n} पुल बहे या क्षतिग्रस्त ({pub})")
LEDGER = ("{e} people believed here, {c} confirmed reached, {u} unknown (ledger)",
          "{e} जना यहाँ भएको अनुमान, {c} पुगेको पुष्टि, {u} अज्ञात (लेजर)",
          "{e} लोग यहाँ होने का अनुमान, {c} पहुँचने की पुष्टि, {u} अज्ञात (लेजर)")
REPORTS = ("{n} new report(s) through the form", "फारमबाट {n} नयाँ रिपोर्ट", "फ़ॉर्म से {n} नई रिपोर्ट")
HEADLINE = ("latest headline {day}: “{title}” ({pub})", "पछिल्लो समाचार {day}: “{title}” ({pub})", "ताज़ा सुर्खी {day}: “{title}” ({pub})")
PREFIX = ("As of {t}: ", "{t} सम्म: ", "{t} तक: ")
SKIP_METRICS = {"bridge_to_inspect", "bridge_status", "flying_window_quality"}   # per-bridge rows and forecasts are folded elsewhere

RESPONSE_FORMAT = schema("place_now", {
    "items": {"type": "array", "items": {"type": "object", "properties": {
        "id": {"type": "string"}, "en": {"type": "string"}, "ne": {"type": "string"}, "hi": {"type": "string"},
    }, "required": ["id", "en", "ne", "hi"], "additionalProperties": False}},
})
SYSTEM = ("You write one-line status notes for places on a volunteer flood-tracking site (26 Aug 2026 Bhote Koshi / "
          "Trishuli flood, Nepal). For each item you get a factual English draft built from counts, publisher names "
          "and headline titles. Rewrite it as one or two plain sentences in English (keep every number, publisher and "
          "the 'As of …' time exactly; no new facts; no advice), then translate it into Nepali and Hindi. Numbers stay "
          "in Latin digits; keep publisher names and headline titles as they are. Return one item per id, same ids.")


_DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")


def latin_digits(text: str) -> str:
    """The site's rule: numbers stay Latin in every language (the model sometimes localises them anyway)."""
    return text.translate(_DEVANAGARI_DIGITS)


def _fmt(n: Any) -> str:
    try:
        f = float(n)
    except (TypeError, ValueError):
        return str(n)
    return f"{int(f):,}" if f.is_integer() else f"{f:g}"


def _dt(v: Any) -> datetime | None:
    if not v:
        return None
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
    try:
        d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _day(v: Any) -> str:
    d = _dt(v)
    return d.astimezone(config.KTM).strftime("%-d %b") if d else ""


def place_of(scope: str | None) -> str | None:
    """'place:betrawati|bridge:27' → 'betrawati'."""
    if not scope or not scope.startswith("place:"):
        return None
    return scope[len("place:"):].split("|")[0] or None


def facts_for(pid: str, figs: list[dict[str, Any]], arts: list[dict[str, Any]], reports: int,
              status: dict[str, Any] | None) -> dict[str, Any]:
    """Counts, publishers and headline titles for one place — the only things that reach the model."""
    latest: dict[tuple[str, str], dict[str, Any]] = {}
    for f in figs:
        key = (f["publisher"], f["metric"])
        if key not in latest or (f.get("as_of") or "") > (latest[key].get("as_of") or ""):
            latest[key] = f
    bridge_lost = sum(1 for f in figs if f["metric"] == "bridge_status" and str(f.get("note") or "").lower().startswith(("washed out", "damaged")))
    figures = [{"publisher": p, "metric": m, "value": f.get("value")} for (p, m), f in sorted(latest.items())
               if m not in SKIP_METRICS and f.get("value") is not None]
    heads = [{"title": (a.get("title") or "")[:120], "publisher": a.get("publisher") or "", "day": _day(a.get("published_at"))}
             for a in arts[:MAX_HEADLINES] if a.get("title")]
    return {
        "id": pid, "figures": figures, "bridges_lost": bridge_lost,
        "bridges_lost_publisher": next((f["publisher"] for f in figs if f["metric"] == "bridge_status"), "HOT OSM"),
        "headlines": heads, "reports": reports,
        "ledger": {k: int(status.get(k) or 0) for k in ("expected", "confirmed_reached", "unknown")} if status else None,
    }


def sources_of(facts: dict[str, Any]) -> str:
    seen: list[str] = []
    for f in facts["figures"]:
        if f["publisher"] not in seen:
            seen.append(f["publisher"])
    if facts["bridges_lost"] and facts["bridges_lost_publisher"] not in seen:
        seen.append(facts["bridges_lost_publisher"])
    for h in facts["headlines"]:
        if h["publisher"] and h["publisher"] not in seen:
            seen.append(h["publisher"])
    if facts["reports"]:
        seen.append("form")
    return " · ".join(seen)


def template(facts: dict[str, Any], now: datetime) -> tuple[str, str, str]:
    """Deterministic trilingual line from the facts — the model's input and the fallback output."""
    t = now.astimezone(config.KTM).strftime("%-d %b %H:%M")
    parts: list[tuple[str, str, str]] = []
    known = sorted((f for f in facts["figures"] if f["metric"] in FRAGMENTS), key=lambda f: FRAGMENT_ORDER[f["metric"]])
    for f in known[:MAX_FRAGMENTS]:   # metrics without a fragment stay out of the line (they are still on /numbers)
        en, ne, hi = FRAGMENTS[f["metric"]]
        kw = {"n": _fmt(f["value"]), "pub": f["publisher"]}
        parts.append((en.format(**kw), ne.format(**kw), hi.format(**kw)))
    if facts["bridges_lost"]:
        kw = {"n": facts["bridges_lost"], "pub": facts["bridges_lost_publisher"]}
        parts.append(tuple(s.format(**kw) for s in BRIDGE_STATUS))  # type: ignore[arg-type]
    if facts["ledger"] and facts["ledger"]["expected"]:
        kw = {"e": _fmt(facts["ledger"]["expected"]), "c": _fmt(facts["ledger"]["confirmed_reached"]), "u": _fmt(facts["ledger"]["unknown"])}
        parts.append(tuple(s.format(**kw) for s in LEDGER))  # type: ignore[arg-type]
    if facts["reports"]:
        parts.append(tuple(s.format(n=facts["reports"]) for s in REPORTS))  # type: ignore[arg-type]
    for h in facts["headlines"][:1]:
        kw = {"day": h["day"], "title": h["title"], "pub": h["publisher"]}
        parts.append(tuple(s.format(**kw).replace("headline : ", "headline: ").replace("समाचार : ", "समाचार: ").replace("सुर्खी : ", "सुर्खी: ")
                           for s in HEADLINE))  # type: ignore[arg-type]
    if not parts:
        return "", "", ""
    out = []
    for i in range(3):
        body = "; ".join(p[i] for p in parts)
        out.append(PREFIX[i].format(t=t) + body + ".")
    return out[0], out[1], out[2]


def polish(ctx: ProcCtx, drafts: list[dict[str, str]], cap_usd: float = PLACE_NOW_STEP_CAP_USD) -> dict[str, dict[str, str]]:
    """Batches → {id: {en, ne, hi}} from the model; missing / refused ids are simply absent (caller falls back)."""
    out: dict[str, dict[str, str]] = {}
    if ctx.llm is None or not drafts:
        return out
    start = float(getattr(ctx.llm, "spent_usd", 0.0) or 0.0)
    for i in range(0, len(drafts), PLACE_NOW_BATCH):
        spent = float(getattr(ctx.llm, "spent_usd", 0.0) or 0.0) - start
        if spent >= cap_usd:
            log.warn("place_now.step_cap", spent_usd=round(spent, 4), cap_usd=cap_usd, remaining=len(drafts) - i)
            break
        batch = drafts[i:i + PLACE_NOW_BATCH]
        user = "\n".join(f"- id={d['id']}: {d['en']}" for d in batch)
        ok, _why = ctx.llm.can_call() if hasattr(ctx.llm, "can_call") else (True, "")
        if not ok:
            break                                  # the global guard refused: nothing more will succeed
        res = ctx.llm.complete_json("place_now", SYSTEM, user, RESPONSE_FORMAT, max_tokens=420 * len(batch))
        if not res:
            continue                               # one bad/truncated answer: this batch keeps its templates
        for it in res.get("items") or []:
            pid = str(it.get("id") or "")
            en, ne, hi = (latin_digits(str(it.get(k) or "").strip()) for k in ("en", "ne", "hi"))
            if pid and en and ne and hi and pid in {d["id"] for d in batch}:
                out[pid] = {"en": en, "ne": ne, "hi": hi}
    return out


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        return _run(ctx)
    except Exception as e:  # noqa: BLE001
        log.error("place_now.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}


def _run(ctx: ProcCtx) -> dict[str, Any]:
    db = ctx.db
    since = (ctx.now - timedelta(hours=PLACE_NOW_HOURS)).isoformat()
    figs = db.select_all("figures", {"select": "publisher,metric,scope,value,as_of,note", "scope": "like.place:*",
                                     "fetched_at": f"gte.{since}", "order": "as_of.desc"})
    arts = db.select_all("articles", {"select": "id,title,publisher,published_at,places", "places": "neq.{}",
                                      "fetched_at": f"gte.{since}", "order": "published_at.desc"})
    reports = (db.select_all("reports_anon", {"select": "place_id", "created_at": f"gte.{since}", "place_id": "not.is.null"})
               if ctx.family_report_processing_enabled else [])
    statuses = db.select_all("v_place_status_latest", {"select": "place_id,as_of,expected,confirmed_reached,unknown"})
    status_by = {s["place_id"]: s for s in statuses}

    figs_by: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for f in figs:
        pid = place_of(f.get("scope"))
        if pid:
            figs_by[pid].append(f)
    arts_by: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for a in arts:
        for pid in a.get("places") or []:
            arts_by[pid].append(a)
    reps_by: dict[str, int] = defaultdict(int)
    for r in reports:
        reps_by[r["place_id"]] += 1

    signal = set(figs_by) | set(arts_by) | set(reps_by)
    drafts: list[dict[str, str]] = []
    facts_by: dict[str, dict[str, Any]] = {}
    for pid in sorted(signal):
        if pid not in status_by:
            continue   # the ledger has not seen this place yet; it will next run
        facts = facts_for(pid, figs_by.get(pid, []), arts_by.get(pid, []), reps_by.get(pid, 0), status_by[pid])
        en, ne, hi = template(facts, ctx.now)
        if not en:
            continue
        facts_by[pid] = facts
        drafts.append({"id": pid, "en": en, "ne": ne, "hi": hi})

    polished = polish(ctx, drafts) if not ctx.dry_run else {}
    written = 0
    for d in drafts:
        line = polished.get(d["id"]) or {"en": d["en"], "ne": d["ne"], "hi": d["hi"]}
        if ctx.dry_run:
            continue
        st = status_by[d["id"]]
        db.update("place_status", {"place_id": f"eq.{d['id']}", "as_of": f"eq.{st['as_of']}"},
                  {"now_en": line["en"], "now_ne": line["ne"], "now_hi": line["hi"],
                   "now_sources": sources_of(facts_by[d["id"]]), "now_as_of": ctx.now})
        written += 1
    log.info("place_now.done", places=len(drafts), polished=len(polished), written=written)
    return {"places": len(drafts), "polished": len(polished), "written": written}
