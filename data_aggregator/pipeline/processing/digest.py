"""
processing/digest.py — step ⑦. See docs/process_data/07-digest.md.

    figures / figures_latest  ─┐   (a) headline-number deltas vs the last value before today (NPT)
    place_status (today vs before) ─┤   (b) newly reached places, phones restored, unknown → 0
    gauges                    ─┤   (c) corridor gauges that came back / went silent (else a count line)
    articles (today, gated)   ─┘   (d) the 3 most relevant new headlines
            │  build_bullets()  → deterministic EN headline + 5–8 bullets [{text, kind, source_url}]
            ▼
    ONE gpt-4o-mini call: polish EN, translate to NE + HI (strict JSON, same bullet count)
            │  budget exhausted / call failed → EN template text is stored and copied into ne/hi
            ▼
    digest (day, lang) × 3   +   event_timeline row r<YYYYMMDD>_ndrrma (kind=response) when NDRRMA
                                 published headline totals today
"""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone
from typing import Any

from lib import config, log
from lib.llm import schema
from lib.text import nepali_digits
from processing import ProcCtx

STEP = "07-digest"
MODEL_TAG = f"{config.LLM_MODEL}/digest-v1"
HEADLINE_PUBLISHERS = ["NDRRMA", "Nepal Police", "MoFA", "OPMCM portal"]
HEADLINE_METRICS = {"dead": "dead", "missing": "out of contact", "rescued": "rescued", "lost_open": "open missing-person reports",
                    "without_contact": "reports without contact", "foreigners_missing": "foreigners missing"}
MIN_BULLETS, MAX_BULLETS = 5, 8
EVENT_DAY = date(2026, 8, 26)

RESPONSE_FORMAT = schema("digest_translation", {
    "headline_en": {"type": "string"}, "bullets_en": {"type": "array", "items": {"type": "string"}},
    "headline_ne": {"type": "string"}, "bullets_ne": {"type": "array", "items": {"type": "string"}},
    "headline_hi": {"type": "string"}, "bullets_hi": {"type": "array", "items": {"type": "string"}},
})
SYSTEM = ("You edit a daily 'what changed' digest for a volunteer flood-tracking site (26 Aug 2026 Bhote Koshi / Trishuli "
          "flood, Nepal). Polish the English bullets lightly (keep every number, publisher name and place name exactly; "
          "no new facts), then translate the headline and each bullet into Nepali and Hindi. Keep numbers in Latin digits. "
          "Return exactly as many bullets per language as you were given, in the same order.")


def _fmt(n: float | int | None) -> str:
    if n is None:
        return "—"
    return f"{int(n):,}" if float(n).is_integer() else f"{n}"


def _delta(cur: float | None, prev: float | None) -> str:
    if cur is None or prev is None or cur == prev:
        return ""
    d = cur - prev
    return f" ({'+' if d > 0 else ''}{_fmt(d)} since yesterday)"


# ─── the deterministic builder (pure, unit-tested) ───────────────────────────

def build_bullets(*, day: date, latest: list[dict[str, Any]], previous: dict[tuple[str, str], float],
                  places_today: dict[str, dict[str, Any]], places_before: dict[str, dict[str, Any]],
                  place_names: dict[str, str], gauges_now: dict[str, bool], gauges_before: dict[str, bool],
                  articles: list[dict[str, Any]]) -> tuple[str, list[dict[str, Any]]]:
    """
    latest        figures_latest rows (publisher, metric, scope, value, url)
    previous      {(publisher, metric): value before today}
    places_*      {place_id: place_status row}  (today's latest / latest before today)
    gauges_*      {label: alive}
    articles      today's relevant articles, newest first, with places
    → (headline_en, bullets[{text, kind, source_url}])
    """
    bullets: list[dict[str, Any]] = []
    nat = {(f["publisher"], f["metric"]): f for f in latest if (f.get("scope") or "national") == "national"}
    # (a) figures
    for pub in HEADLINE_PUBLISHERS:
        parts = []
        url = None
        for metric, label in HEADLINE_METRICS.items():
            f = nat.get((pub, metric))
            if not f:
                continue
            if pub == "OPMCM portal" and metric in ("dead", "missing", "rescued"):
                continue   # the portal's counters are report counts, not casualty figures
            parts.append(f"{_fmt(f['value'])} {label}{_delta(f['value'], previous.get((pub, metric)))}")
            url = url or f.get("url")
        if parts:
            bullets.append({"text": f"{pub}: " + " · ".join(parts[:3]), "kind": "figure", "source_url": url})
    headline_src = nat.get(("NDRRMA", "dead")) and "NDRRMA" or (nat.get(("MoFA", "dead")) and "MoFA") or None
    day_n = (day - EVENT_DAY).days
    if headline_src:
        d, m, r = nat.get((headline_src, "dead")), nat.get((headline_src, "missing")), nat.get((headline_src, "rescued"))
        headline = f"Day {day_n} after the flood — {headline_src}: {_fmt(d['value'] if d else None)} dead · " \
                   f"{_fmt(m['value'] if m else None)} out of contact · {_fmt(r['value'] if r else None)} rescued"
    else:
        headline = f"Day {day_n} after the flood — {day.strftime('%-d %b %Y')}"
    # (b) places — only with a baseline (the first day of the ledger has none: everything would look "new")
    place_bullets: list[dict[str, Any]] = []
    for pid, cur in (places_today.items() if places_before else []):
        prev = places_before.get(pid, {})
        name = place_names.get(pid, pid)
        url = f"/places/{pid}"
        c_now, c_prev = int(cur.get("confirmed_reached") or 0), int(prev.get("confirmed_reached") or 0)
        if c_now > c_prev:
            place_bullets.append({"text": f"{name}: {_fmt(c_now)} people confirmed reached (+{_fmt(c_now - c_prev)})", "kind": "place", "source_url": url, "_w": c_now - c_prev})
        if (cur.get("phones") or "").startswith("yes") and not (prev.get("phones") or "").startswith("yes"):
            place_bullets.append({"text": f"{name}: phones working again ({cur['phones']})", "kind": "place", "source_url": url, "_w": 50})
        if int(cur.get("unknown") or 0) == 0 and int(prev.get("unknown") or 0) > 0:
            place_bullets.append({"text": f"{name}: everyone reported here is now accounted for", "kind": "place", "source_url": url, "_w": 40})
    place_bullets.sort(key=lambda b: -b["_w"])
    for b in place_bullets[:2]:
        b.pop("_w", None)
        bullets.append(b)
    # (c) gauges
    back = sorted(k for k, v in gauges_now.items() if v and not gauges_before.get(k, False))
    silent = sorted(k for k, v in gauges_now.items() if not v and gauges_before.get(k, False))
    if gauges_before and (back or silent):      # no observation history before today → no "change" claims
        txt = []
        if back:
            txt.append("gauge back online: " + ", ".join(back))
        if silent:
            txt.append("gauge went silent: " + ", ".join(silent))
        bullets.append({"text": "River gauges — " + "; ".join(txt), "kind": "gauge", "source_url": "https://bipadportal.gov.np/"})
    elif gauges_now:
        alive = sorted(k for k, v in gauges_now.items() if v)
        bullets.append({"text": f"River gauges: {len(alive)} of {len(gauges_now)} corridor stations reporting ({', '.join(alive) or 'none'}); the rest silent since 26 Aug",
                        "kind": "gauge", "source_url": "https://bipadportal.gov.np/"})
    # (d) news — fill to at least MIN_BULLETS, at most 3 news items unless needed
    news = []
    for a in articles:
        if not a.get("title"):
            continue
        news.append({"text": f"{a.get('publisher') or 'News'}: {a['title'][:140]}", "kind": "news", "source_url": a.get("url")})
    want = max(min(3, MAX_BULLETS - len(bullets)), MIN_BULLETS - len(bullets))   # 5 ≤ total ≤ 8
    bullets.extend(news[:want])
    return headline, bullets[:MAX_BULLETS]


# ─── data loading ─────────────────────────────────────────────────────────────

def _npt_day_bounds(now: datetime) -> tuple[date, datetime]:
    local = now.astimezone(config.KTM)
    start = local.replace(hour=0, minute=0, second=0, microsecond=0)
    return local.date(), start.astimezone(timezone.utc)


def load_inputs(ctx: ProcCtx) -> dict[str, Any]:
    db = ctx.db
    day, start = _npt_day_bounds(ctx.now)
    latest = db.select_all("figures_latest", {"select": "publisher,metric,scope,value,url", "scope": "eq.national"})
    previous: dict[tuple[str, str], float] = {}
    for pub in HEADLINE_PUBLISHERS:
        for metric in HEADLINE_METRICS:
            rows = db.select("figures", {"select": "value", "publisher": f"eq.{pub}", "metric": f"eq.{metric}", "scope": "eq.national",
                                         "as_of": f"lt.{start.isoformat()}", "order": "as_of.desc", "limit": 1})
            if rows:
                previous[(pub, metric)] = float(rows[0]["value"])
    ps_today = {r["place_id"]: r for r in db.select_all("v_place_status_latest", {"select": "place_id,confirmed_reached,unknown,phones,as_of"})}
    ps_before: dict[str, dict[str, Any]] = {}
    for r in db.select_all("place_status", {"select": "place_id,confirmed_reached,unknown,phones,as_of", "as_of": f"lt.{start.isoformat()}", "order": "as_of.desc"}):
        ps_before.setdefault(r["place_id"], r)
    names = {p.id: p.name_en for p in ctx.gaz.all()}
    gauges_now: dict[str, bool] = {}
    gauges_before: dict[str, bool] = {}
    corridor = {t.lower(): label for t, _, label in config.CORRIDOR_GAUGES}
    for g in db.select_all("v_gauges_latest", {"select": "station_name,alive"}):
        lab = corridor.get((g.get("station_name") or "").lower())
        if lab:
            gauges_now[lab] = bool(g.get("alive"))
    edge = (start - timedelta(hours=config.GAUGE_ALIVE_HOURS)).isoformat()
    for g in db.select_all("gauges", {"select": "station_name,observed_at", "observed_at": f"gte.{edge}", "order": "observed_at.asc"}):
        lab = corridor.get((g.get("station_name") or "").lower())
        if lab and g["observed_at"] < start.isoformat():
            gauges_before[lab] = True
    arts = db.select("articles", {"select": "title,publisher,url,places,published_at", "published_at": f"gte.{start.isoformat()}",
                                  "order": "published_at.desc", "limit": 60})
    arts.sort(key=lambda a: (0 if a.get("places") else 1, a.get("published_at") or ""), reverse=False)
    arts = [a for a in arts if a.get("places")] + [a for a in arts if not a.get("places")]
    return {"day": day, "latest": latest, "previous": previous, "places_today": ps_today, "places_before": ps_before,
            "place_names": names, "gauges_now": gauges_now, "gauges_before": gauges_before, "articles": arts[:10]}


# ─── the LLM polish/translate call ───────────────────────────────────────────

def translate(ctx: ProcCtx, headline: str, bullets: list[dict[str, Any]]) -> tuple[dict[str, tuple[str, list[str]]], str]:
    en = (headline, [b["text"] for b in bullets])
    fallback = {"en": en, "ne": en, "hi": en}
    if not ctx.llm.can_call()[0]:
        return fallback, "fallback"
    user = json.dumps({"headline_en": headline, "bullets_en": en[1]}, ensure_ascii=False)
    res = ctx.llm.complete_json("digest", SYSTEM, user, RESPONSE_FORMAT, max_tokens=1800)
    if not res:
        return fallback, "fallback"
    out: dict[str, tuple[str, list[str]]] = {}
    for lang in ("en", "ne", "hi"):
        bl = res.get(f"bullets_{lang}") or []
        hl = res.get(f"headline_{lang}") or headline
        if len(bl) != len(en[1]) or not all(isinstance(x, str) and x.strip() for x in bl):
            out[lang] = en
        else:   # numbers stay Latin in every language (design rule); the model sometimes converts them
            out[lang] = (nepali_digits(str(hl)), [nepali_digits(str(x)) for x in bl])
    return out, MODEL_TAG


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        inp = load_inputs(ctx)
        headline, bullets = build_bullets(**inp)
        if not bullets:
            return {"day": str(inp["day"]), "bullets": 0, "skipped": "nothing to say"}
        texts, model = translate(ctx, headline, bullets)
        rows = []
        for lang, (hl, bl) in texts.items():
            rows.append({"day": inp["day"], "lang": lang, "headline": hl,
                         "bullets": [{"text": t, "kind": b["kind"], "source_url": b.get("source_url")} for t, b in zip(bl, bullets)],
                         "computed_at": ctx.now, "model": model})
        if not ctx.dry_run:
            ctx.db.upsert("digest", rows, on_conflict="day,lang")
        appended = append_event_timeline(ctx, inp)
        log.info("digest.done", day=str(inp["day"]), bullets=len(bullets), model=model, timeline_appended=appended)
        return {"day": str(inp["day"]), "bullets": len(bullets), "model": model, "headline": headline, "timeline_appended": appended}
    except Exception as e:  # noqa: BLE001
        log.error("digest.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}


def append_event_timeline(ctx: ProcCtx, inp: dict[str, Any]) -> int:
    """One response event per day from NDRRMA's headline totals (only when published today)."""
    nat = {(f["publisher"], f["metric"]): f for f in inp["latest"]}
    d, m, r = nat.get(("NDRRMA", "dead")), nat.get(("NDRRMA", "missing")), nat.get(("NDRRMA", "rescued"))
    if not d:
        return 0
    rows = ctx.db.select("figures", {"select": "as_of,url", "publisher": "eq.NDRRMA", "metric": "eq.dead", "scope": "eq.national",
                                     "order": "as_of.desc", "limit": 1})
    if not rows or not rows[0].get("as_of"):
        return 0
    at = datetime.fromisoformat(rows[0]["as_of"].replace("Z", "+00:00"))
    if at.astimezone(config.KTM).date() != inp["day"]:
        return 0
    what_en = f"NDRRMA situation report: {_fmt(d['value'])} dead, {_fmt(m['value'] if m else None)} out of contact, {_fmt(r['value'] if r else None)} rescued"
    what_ne = f"NDRRMA स्थिति प्रतिवेदन: {_fmt(d['value'])} मृत, {_fmt(m['value'] if m else None)} सम्पर्कविहीन, {_fmt(r['value'] if r else None)} उद्धार"
    what_hi = f"NDRRMA स्थिति रिपोर्ट: {_fmt(d['value'])} मृत, {_fmt(m['value'] if m else None)} संपर्क से बाहर, {_fmt(r['value'] if r else None)} बचाए गए"
    row = {"id": f"r{inp['day'].strftime('%Y%m%d')}_ndrrma", "at": at, "at_label": at.astimezone(config.KTM).strftime("%-d %b %H:%M"),
           "place_id": None, "km": None, "what_en": what_en, "what_ne": what_ne, "what_hi": what_hi, "kind": "response",
           "source": "NDRRMA", "source_url": rows[0].get("url"), "computed_at": ctx.now}
    if not ctx.dry_run:
        ctx.db.upsert("event_timeline", [row], on_conflict="id")
    return 1
