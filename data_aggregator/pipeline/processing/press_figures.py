"""
processing/press_figures.py — step ③b. See docs/process_data/03b-press-figures.md.

Nepal Police and the Department of Tourism / NTB publish no machine-readable totals — their numbers reach us
only through press reports. This step reads articles from the last WINDOW_HOURS (title + body) sentence by
sentence and, where a sentence names the agency, states a count and sits in the flood context, writes a
`figures` row:

    publisher  'Nepal Police (via press)' · 'Dept of Tourism (via press)' · 'NTB (via press)'
    metric     dead | missing | rescued           (police)      tourists_missing | tourists_rescued  (tourism)
    scope      national · as_of = article published_at (fetched_at when absent) · url = article · note = the sentence

Regexes first (EN + NE + HI). One gpt-4o-mini call at most per run, only when the budget allows and the regexes
found nothing for an agency in the window. ④ figures_latest keys by publisher, so each "(via press)" name becomes
its own column on the site. Dedupe: the figures unique key (publisher, metric, scope, as_of, value).
"""
from __future__ import annotations

import json
import re
from datetime import timedelta
from typing import Any

from lib import config, log
from lib.text import nepali_digits, nfc
from processing import ProcCtx

STEP = "03b-press-figures"
WINDOW_HOURS = 48
MAX_BODY_CHARS = 6000
NUM = r"(\d{1,3}(?:,\d{3})+|\d+)"
CONTEXT_RE = re.compile(r"flood|rasuwa|trishuli|trisuli|bhote ?koshi|bhotekoshi|glacier|glof|barrier lake|langtang|rasuwagad|"
                        r"बाढी|बाढि|रसुवा|त्रिशूली|त्रिशुली|भोटेकोशी|हिमताल|बाढ़", re.I)
DISTRICT_RE = re.compile(r"\b(?:in|at|from)\s+(?:chitwan|nawalparasi|gorkha|dhading|tanahun|nuwakot|makwanpur|parsa|bara)\b|"
                         r"(?:चितवन|नवलपरासी|गोरखा|धादिङ|तनहुँ|नुवाकोट)(?:मा|बाट)", re.I)
PUBLISHERS: dict[str, re.Pattern[str]] = {
    "Nepal Police (via press)": re.compile(r"\bpolice\b|प्रहरी|पुलिस", re.I),
    "Dept of Tourism (via press)": re.compile(r"tourism department|department of tourism|dept\.? of tourism|पर्यटन विभाग|पर्यटन मन्त्रालय|पर्यटन विभाग", re.I),
    "NTB (via press)": re.compile(r"tourism board|\bNTB\b|पर्यटन बोर्ड", re.I),
}
POLICE_METRICS: list[tuple[str, re.Pattern[str]]] = [
    ("dead", re.compile(NUM + r"\s*(?:people|persons|bodies|individuals|जना(?:को)?|लोग(?:ों)?)?\s*(?:have\s+|had\s+|were\s+|are\s+)?(?:been\s+)?"
                        r"(?:confirmed\s+)?(?:dead|killed|died|deaths?|bodies|fatalit|मृत्यु|मृतक|शव|मरे|मारे गए|मौत)", re.I)),
    ("dead", re.compile(r"(?:death toll|toll|bodies of|number of (?:dead|deaths)|मृतकको सङ्ख्या|मृतकको संख्या|मृत्यु हुनेको सङ्ख्या|मरने वालों की संख्या)"
                        r"[^.।\d]{0,40}?" + NUM, re.I)),
    ("missing", re.compile(NUM + r"\s*(?:people|persons|others|individuals|जना|लोग)?\s*(?:are\s+|remain\s+|still\s+|were\s+|have\s+been\s+|अझै\s+|अझैसम्म\s+|अब भी\s+)*"
                           r"(?:reported\s+)?(?:missing|out of contact|unaccounted|uncontactable|बेपत्ता|सम्पर्कविहीन|सम्पर्कबाहिर|हराए|लापता)", re.I)),
    ("missing", re.compile(r"(?:number of (?:the\s+)?missing|missing persons?|बेपत्ताको सङ्ख्या|बेपत्ताको संख्या|लापता लोगों की संख्या)"
                           r"[^.।\d]{0,40}?(?:at|to|reached|stands at|is|पुगेको|पुग्यो|छ)\s*" + NUM, re.I)),
    ("rescued", re.compile(NUM + r"\s*(?:people|persons|others|individuals|जना(?:को)?|लोग(?:ों)?)?\s*(?:have\s+been\s+|were\s+|been\s+|had\s+been\s+)?"
                           r"(?:rescued|evacuated|airlifted|उद्धार|बचाए|बचाया)", re.I)),
]
TOURISM_METRICS: list[tuple[str, re.Pattern[str]]] = [
    ("tourists_missing", re.compile(NUM + r"\s*(?:foreign\s+)?(?:tourists?|trekkers?|pilgrims?|foreigners?|पर्यटक|पर्यटकहरू|तीर्थयात्री|विदेशी)[^.।]{0,60}?"
                                    r"(?:missing|out of contact|unaccounted|uncontactable|बेपत्ता|सम्पर्कविहीन|सम्पर्कबाहिर|लापता)", re.I)),
    ("tourists_missing", re.compile(r"(?:missing|out of contact|unaccounted|बेपत्ता|सम्पर्कविहीन|लापता)[^.।\d]{0,40}?" + NUM +
                                    r"\s*(?:foreign\s+)?(?:tourists?|trekkers?|pilgrims?|पर्यटक|तीर्थयात्री)", re.I)),
    ("tourists_rescued", re.compile(NUM + r"\s*(?:foreign\s+)?(?:tourists?|trekkers?|pilgrims?|foreigners?|पर्यटक|पर्यटकहरू|तीर्थयात्री|विदेशी)[^.।]{0,60}?"
                                    r"(?:rescued|evacuated|airlifted|safe|उद्धार|बचाए|सुरक्षित)", re.I)),
]
MIN_VALUE = {"dead": 100, "missing": 100, "rescued": 100, "tourists_missing": 10, "tourists_rescued": 10}
SENTENCE_RE = re.compile(r"(?<=[.!?।])\s+|\n+")
ALLOWED_METRICS = {"Nepal Police (via press)": {"dead", "missing", "rescued"},
                   "Dept of Tourism (via press)": {"tourists_missing", "tourists_rescued"},
                   "NTB (via press)": {"tourists_missing", "tourists_rescued"}}


_NE_THOUSANDS = {"एक": 1, "दुई": 2, "तीन": 3, "चार": 4, "पाँच": 5, "छ": 6, "सात": 7, "आठ": 8, "नौ": 9, "दश": 10, "दस": 10}
_THOUSANDS_RE = re.compile(r"(एक|दुई|तीन|चार|पाँच|छ|सात|आठ|नौ|दश|दस|\d{1,2})\s*हजार(?:\s*(\d{1,3}))?(?!\d)")


def expand_thousands(text: str) -> str:
    """'दुई हजार 381' → '2381', 'दुई हजार' → '2000', '12 हजार 5' → '12005' (Nepali prose writes thousands in words)."""
    def rep(m: re.Match[str]) -> str:
        k = _NE_THOUSANDS.get(m.group(1)) or int(m.group(1))
        return str(k * 1000 + int(m.group(2) or 0))
    return _THOUSANDS_RE.sub(rep, text)


def _num(s: str) -> float | None:
    try:
        return float(s.replace(",", ""))
    except ValueError:
        return None


def extract(title: str | None, body: str | None) -> list[dict[str, Any]]:
    """Pure: article text → [{publisher, metric, value, phrase}] (deduped per publisher × metric × value)."""
    title = nepali_digits(nfc(title))
    text = expand_thousands(nepali_digits(nfc(f"{title}. {body or ''}")))[:MAX_BODY_CHARS + 1000]
    title_ctx = bool(CONTEXT_RE.search(title))
    out: list[dict[str, Any]] = []
    seen: set[tuple[str, str, float]] = set()
    for sent in SENTENCE_RE.split(text):
        s = sent.strip()
        if len(s) < 12 or not (title_ctx or CONTEXT_RE.search(s)):
            continue
        mentions = sorted((m.start(), pub) for pub, pub_re in PUBLISHERS.items() for m in pub_re.finditer(s))
        if not mentions:
            continue
        dead_here: set[float] = set()
        for metric, m_re in POLICE_METRICS + TOURISM_METRICS:
            for m in m_re.finditer(s):
                if metric == "missing" and _num(m.group(1)) in dead_here:
                    continue   # "the bodies of 616 people reported missing have been recovered" — that number is the dead count
                pub = _attribute(mentions, m.start())      # the agency named nearest before the number (else nearest after)
                if metric not in ALLOWED_METRICS[pub]:
                    continue
                v = _num(m.group(1))
                if v is None or v < MIN_VALUE[metric] or v > 1_000_000:
                    continue
                if metric == "dead" and DISTRICT_RE.search(s):
                    continue   # "246 bodies recovered in Chitwan" is a district count, not the national toll
                key = (pub, metric, v)
                if key in seen:
                    continue
                seen.add(key)
                if metric == "dead":
                    dead_here.add(v)
                out.append({"publisher": pub, "metric": metric, "value": v, "phrase": s[:200]})
    return out


def _attribute(mentions: list[tuple[int, str]], pos: int) -> str:
    before = [m for m in mentions if m[0] <= pos]
    return (before[-1] if before else mentions[0])[1]


def figures_from_articles(articles: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for a in articles:
        for f in extract(a.get("title"), a.get("body")):
            rows.append({"source_id": a.get("source_id"), "publisher": f["publisher"], "metric": f["metric"], "scope": "national",
                         "value": f["value"], "as_of": a.get("published_at") or a.get("fetched_at"), "fetched_at": a.get("fetched_at"),
                         "url": a.get("url"), "note": f["phrase"]})
    return rows


# ─── the optional single LLM call ────────────────────────────────────────────

LLM_FORMAT = {"type": "json_schema", "json_schema": {"name": "press_figures", "strict": True, "schema": {
    "type": "object", "additionalProperties": False, "required": ["figures"],
    "properties": {"figures": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["publisher", "metric", "value", "article", "phrase"],
        "properties": {"publisher": {"type": "string", "enum": list(PUBLISHERS)},
                       "metric": {"type": "string", "enum": ["dead", "missing", "rescued", "tourists_missing", "tourists_rescued"]},
                       "value": {"type": "number"}, "article": {"type": "integer"}, "phrase": {"type": "string"}}}}}}}}
LLM_SYSTEM = ("You extract official casualty figures that news articles attribute to Nepal Police, the Department of Tourism or the "
              "Nepal Tourism Board for the 26 Aug 2026 Bhote Koshi / Trishuli flood (Rasuwa, Nepal). Only report a figure when the "
              "article explicitly attributes it to that agency for this flood: national totals of dead, missing (out of contact) or "
              "rescued for Nepal Police; tourists/foreigners missing or rescued for the tourism bodies. Copy the sentence as `phrase`. "
              "Return an empty list when unsure.")


def llm_fill(ctx: ProcCtx, articles: list[dict[str, Any]], missing_pubs: list[str]) -> list[dict[str, Any]]:
    if not missing_pubs or not ctx.llm.can_call()[0]:
        return []
    pats = [PUBLISHERS[p] for p in missing_pubs]
    cands = [a for a in articles if any(p.search(f"{a.get('title') or ''} {(a.get('body') or '')[:MAX_BODY_CHARS]}") for p in pats)]
    if not cands:
        return []
    cands = cands[:10]
    user = json.dumps({"agencies_wanted": missing_pubs,
                       "articles": [{"i": i, "title": a.get("title"), "text": (a.get("body") or "")[:1200]} for i, a in enumerate(cands)]},
                      ensure_ascii=False)
    res = ctx.llm.complete_json("press_figures", LLM_SYSTEM, user[:config.LLM_MAX_INPUT_CHARS * 3], LLM_FORMAT, max_tokens=600)
    rows = []
    for f in (res or {}).get("figures") or []:
        pub, metric, i = f.get("publisher"), f.get("metric"), f.get("article")
        if pub not in missing_pubs or metric not in ALLOWED_METRICS.get(pub, set()) or not isinstance(i, int) or not (0 <= i < len(cands)):
            continue
        try:
            v = float(f.get("value"))
        except (TypeError, ValueError):
            continue
        phrase = expand_thousands(nepali_digits(str(f.get("phrase") or "")))
        if v < MIN_VALUE[metric] or v > 1_000_000 or not re.search(rf"(?<![\d,]){int(v):,}(?![\d,])|(?<![\d,]){int(v)}(?![\d,])", phrase):
            continue   # the quoted sentence must contain the number — no model arithmetic
        a = cands[i]
        rows.append({"source_id": a.get("source_id"), "publisher": pub, "metric": metric, "scope": "national", "value": v,
                     "as_of": a.get("published_at") or a.get("fetched_at"), "fetched_at": a.get("fetched_at"), "url": a.get("url"),
                     "note": "llm: " + str(f.get("phrase") or "")[:190]})
    return rows


def run(ctx: ProcCtx) -> dict[str, Any]:
    try:
        since = (ctx.now - timedelta(hours=WINDOW_HOURS)).isoformat()
        arts = ctx.db.select_all("articles", {"select": "source_id,url,title,body,published_at,fetched_at",
                                              "fetched_at": f"gte.{since}", "order": "published_at.desc"})
        arts = [a for a in arts if not a.get("published_at") or a["published_at"] >= since]
        rows = figures_from_articles(arts)
        found = {r["publisher"] for r in rows}
        missing_pubs = [p for p in PUBLISHERS if p not in found]
        llm_rows = llm_fill(ctx, arts, missing_pubs) if missing_pubs else []
        rows += llm_rows
        n = 0
        if rows and not ctx.dry_run:
            n = ctx.db.upsert_figures(rows)
        by_pub = {p: sum(1 for r in rows if r["publisher"] == p) for p in PUBLISHERS}
        log.info("press_figures.done", articles=len(arts), figures=len(rows), written=n, llm=len(llm_rows), **{k.split(" ")[0].lower(): v for k, v in by_pub.items()})
        return {"articles": len(arts), "figures": len(rows), "written": n, "by_publisher": by_pub, "llm_rows": len(llm_rows),
                "latest": {p: max((r for r in rows if r["publisher"] == p), key=lambda r: str(r["as_of"]))["value"] for p in found}}
    except Exception as e:  # noqa: BLE001
        log.error("press_figures.failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        return {"error": f"{type(e).__name__}: {str(e)[:120]}"}
