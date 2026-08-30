"""
normalisers/ndrrma_publications.py — NDRRMA publications API → PDFs in Storage + sitrep figures.
docs/pull_external_data/05-sources.md §ndrrma_publications.

    list JSON ─▶ new ids since last run (state 'publications') ─▶ GET pdffile
        ├─ PII list (ids 373,377,380,381,383,384 or title ~ /list|विवरण|नामावली/i) ─▶ Storage only
        ├─ Situation Report ─▶ Storage + pypdf text ─▶ parse_sitrep_text() ─▶ figures 'NDRRMA'
        └─ anything else   ─▶ Storage only
    every publication ─▶ an `articles` row (title, pdf url, date)

as_of comes from the BS date/time in the title or the sitrep header ("२०८३ भदौ १३ गते साँझ ६ः३०
बजे" → 2026-08-29 18:30 NPT), falling back to the `date` field. Canva PDFs lose some matras in
pypdf ("उ ार" for "उद्धार"), so every pattern below is deliberately loose.
"""
from __future__ import annotations

import io
import re
from datetime import datetime
from typing import Any

from lib import config, log
from lib.text import lang_of, nepali_digits, nfc, to_int

from . import Context, NormalisedRows, parts
from ._common import parse_bs_datetime, parse_dt

SOURCE_ID = "ndrrma_publications"
PUBLISHER = "NDRRMA"
STORAGE_PREFIX = "ndrrma_publications"

# district body-count lines; text is garbled so consonant-level patterns
DISTRICTS = [
    (re.compile(r"रसुवा\s*[:ः]"), "rasuwa"),
    (re.compile(r"नुवाकोट\s*[:ः]"), "nuwakot"),
    (re.compile(r"धा[\s\S]{0,3}?दङ\s*[:ः]"), "dhading"),
    (re.compile(r"गोरखा\s*[:ः]"), "gorkha"),
    (re.compile(r"नवलपरासी\s*पूव\S*\s*[:ः]"), "nawalparasi_east"),
    (re.compile(r"नवलपरासी\s*पि[\s\S]{0,4}?[:ः]"), "nawalparasi_west"),
    (re.compile(r"तनहुँ\s*[:ः]"), "tanahun"),
    (re.compile(r"ि?चतवन\s*[:ः]"), "chitwan"),
    (re.compile(r"मकवानपुर\s*[:ः]"), "makwanpur"),
]
_NUM = r"([0-9०-९][0-9०-९,]*)"
HEADLINE = [
    ("dead", re.compile(r"शव\s*फेला\s*परेको\s*" + _NUM)),
    ("missing", re.compile(r"सम्पक\s*\S*\s*व\s*हनः\s*" + _NUM)),
    ("missing", re.compile(r"सम्पक\s*\S*\s*व\s*हन\s*:\s*" + _NUM + r"\s*जना")),
    ("rescued", re.compile(r"कुल\s*उ\S*\s*ार\s*[:ः]\s*" + _NUM)),
    ("injured", re.compile(r"घाइते\s*[:ः]\s*" + _NUM)),
    ("personnel", re.compile(r"प\s*रचालन\s*[:ः]\s*" + _NUM)),
    ("foreigners_missing", re.compile(r"वदेशी\s*नाग\s*रक\s*[:ः]\s*" + _NUM)),
    ("foreigners_rescued_air", re.compile(r"वदेशी\s*नाग\s*रक\s*हेल\S*\s*उ\S*\s*ार\s*[:ः]\s*" + _NUM)),
    ("telecom_towers_damaged", re.compile(_NUM + r"\s*वटा\s*टे\s*लफोन\s*टावर")),
    ("telecom_towers_restored", re.compile(r"मम\s*\S*\s*त\s*\S*\s*छ\s*" + _NUM + r"\s*वटा\s*सञ्चालनमा")),
    ("heli_flights_total", re.compile(r"हे\s*लकप्टरबाट\s*" + _NUM + r"\s*हवाई\s*उडान")),
]
SHELTER_RE = re.compile(r"(नुवाकोट|रसुवा)[^\n]{0,60}?" + _NUM + r"\s*वटा[\s\S]{0,60}?आश्रयस्थल[\s\S]{0,15}?कुल\s*" + _NUM)
MISSING_CATS = [
    ("missing", "category:security_forces_police", re.compile(r"नेपाल\s*प्रहर\S*\s*[:ः]\s*" + _NUM + r"\s*जना")),
    ("missing", "category:security_forces_army", re.compile(r"नेपाल\s*सेना\s*[:ः]\s*" + _NUM + r"\s*जना")),
    ("missing", "category:customs", re.compile(r"भन्सार\s*काया\S*\s*लय\s*[:ः]\s*" + _NUM)),
    ("missing", "category:immigration", re.compile(r"अध्यागमन\s*काया\S*\s*लय\s*[:ः]\s*" + _NUM)),
    ("missing", "district:rasuwa", re.compile(r"रसुवा\s*[:ः]\s*" + _NUM + r"\s*जना\s*\(\s*DEOC")),
    ("missing", "district:nuwakot", re.compile(r"नुवाकोट\s*[:ः]\s*" + _NUM + r"\s*जना\s*\(\s*DEOC")),
    ("missing", "district:makwanpur", re.compile(r"मकवानपुर\s*[:ः]\s*" + _NUM + r"\s*जना")),
    ("missing", "category:hydropower_projects", re.compile(r"जल\s*व\S*\s*ुत\s*आयोजनाहरूबाट\s*[:ः]\s*" + _NUM)),
    ("missing", "category:nepalis_with_foreign_tourists", re.compile(r"पय\s*टकसँगै[\s\S]{0,40}?[:ः]\s*" + _NUM)),
    ("missing", "category:langtang_national_park", re.compile(r"लाङटाङ[\s\S]{0,30}?नकुञ्ज\s*[:ः]\s*" + _NUM)),
]


def _n(s: str) -> int | None:
    return to_int(nepali_digits(s).replace(",", ""))


def sitrep_number(title: str) -> int | None:
    m = re.search(r"#\s*([0-9०-९]+)", nfc(title))
    return _n(m.group(1)) if m else None


def parse_sitrep_text(text: str, *, title: str, date: str | None, url: str | None, fetched_at: datetime,
                      pub_id: str | int | None = None) -> NormalisedRows:
    """Pure function: sitrep text → figures. Tested on tests/fixtures/ndrrma_publications_sitrep8.txt."""
    out = NormalisedRows()
    # pypdf emits NUL bytes where Canva glyphs have no unicode mapping — treat them as spaces
    text = nfc(text.replace("\x00", " "))
    as_of = parse_bs_datetime(title) or parse_bs_datetime(text[:1500]) or parse_dt(date, default_tz=config.KTM) or fetched_at
    n = sitrep_number(title)
    tag = f"Sitrep #{n}" if n else "Situation update"
    if pub_id:
        tag += f" · publication {pub_id}"

    def fig(metric: str, value: int | None, scope: str = "national", note: str | None = None) -> None:
        if value is not None:
            out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=as_of, url=url,
                       note=(f"{tag} · {note}" if note else tag), source_id=SOURCE_ID, fetched_at=fetched_at)

    got: set[str] = set()
    for metric, rx in HEADLINE:
        if metric in got:
            continue
        m = rx.search(text)
        if m:
            fig(metric, _n(m.group(1)))
            got.add(metric)

    # district body counts: the block after "शव फेला" up to the security-forces sub-table
    m = re.search(r"शव\s*फेला", text)
    if m:
        block = text[m.start():m.start() + 1500]
        end = re.search(r"मानव\s*अङ्ग|नेपाल\s*प्रहर", block)
        block = block[:end.start()] if end else block
        total = 0
        for rx, slug in DISTRICTS:
            dm = rx.search(block)
            if dm:
                val = _n(re.match(r"\s*" + _NUM, block[dm.end():]).group(1)) if re.match(r"\s*" + _NUM, block[dm.end():]) else None
                if val is not None:
                    fig("dead", val, scope=f"district:{slug}")
                    total += val
        if total:
            fig("dead_sum_of_districts", total, note="sum of the district lines")

    for metric, scope, rx in MISSING_CATS:
        mm = rx.search(text)
        if mm:
            fig(metric, _n(mm.group(1)), scope=scope)

    for sm in SHELTER_RE.finditer(text):
        district = "nuwakot" if sm.group(1).startswith("नुवा") else "rasuwa"
        fig("shelter_sites", _n(sm.group(2)), scope=f"district:{district}")
        fig("shelter_people", _n(sm.group(3)), scope=f"district:{district}")

    # health-facility totals line: "Total 242 75 29 135 3"
    hm = re.search(r"\nTotal\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", text)
    if hm:
        fig("injured_treated_total", int(hm.group(1)), note="health facility table")
        fig("injured_under_treatment", int(hm.group(2)), note="health facility table")
        fig("injured_referred", int(hm.group(3)), note="health facility table")
        fig("injured_discharged", int(hm.group(4)), note="health facility table")
        fig("deaths_in_care", int(hm.group(5)), note="health facility table")
    return out


def is_pii_publication(pub: dict[str, Any]) -> bool:
    try:
        if int(pub.get("id")) in config.NDRRMA_PII_PUBLICATION_IDS:
            return True
    except (TypeError, ValueError):
        pass
    title = f"{pub.get('title') or ''} {pub.get('title_ne') or ''}"
    return bool(config.NDRRMA_PII_TITLE_RE.search(title))


def is_sitrep(pub: dict[str, Any]) -> bool:
    pt = pub.get("publication_type") or {}
    t = (pt.get("pub_type") if isinstance(pt, dict) else str(pt)) or ""
    title = f"{pub.get('title') or ''} {pub.get('title_ne') or ''}"
    return "situation" in t.lower() or "स्थिति" in title or "situation report" in title.lower()


def pdf_text(body: bytes) -> str:
    from pypdf import PdfReader
    try:
        reader = PdfReader(io.BytesIO(body))
        return "\n".join((pg.extract_text() or "") for pg in reader.pages)
    except Exception as e:  # noqa: BLE001 — scanned/odd PDFs
        log.warn("ndrrma_publications.pdf_text_failed", error=type(e).__name__)
        return ""


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    pubs: list[dict[str, Any]] = []
    for p in parts(raw):
        doc = p.json()
        if p.ok and isinstance(doc, dict):
            pubs.extend(x for x in (doc.get("results") or []) if isinstance(x, dict))
    if not pubs:
        out.notes.append("no publications parsed")
        return out
    seen = ctx.state.seen(SOURCE_ID, "publications") if (ctx and ctx.state is not None) else set()
    done: list[str] = []
    for pub in sorted(pubs, key=lambda x: int(x.get("id") or 0)):
        pid = str(pub.get("id"))
        title = nfc(pub.get("title") or pub.get("title_ne") or "")
        pdf_url = pub.get("pdffile")
        published = parse_dt(pub.get("date"), default_tz=config.KTM)
        if pdf_url:
            out.article(url=pdf_url, title=title[:500], publisher=PUBLISHER, lang=lang_of(title),
                        published_at=published, body=None, source_id=SOURCE_ID, fetched_at=fetched_at)
        if pid in seen or not pdf_url or ctx is None or ctx.fetch is None:
            continue
        if published is not None and published < config.EVENT_START_UTC.replace(hour=0, minute=0):
            continue  # pre-event publications: article row only, no download
        f = ctx.fetch(pdf_url)
        if not getattr(f, "ok", False) or not f.body:
            out.notes.append(f"publication {pid}: download failed ({getattr(f, 'error', None) or getattr(f, 'status', '?')})")
            continue
        path = f"{STORAGE_PREFIX}/{pid}.pdf"
        if ctx.upload is not None and not ctx.dry_run:
            try:
                ctx.upload(path, f.body, "application/pdf")
            except Exception as e:  # noqa: BLE001
                out.notes.append(f"publication {pid}: storage upload failed ({type(e).__name__})")
                continue
        if is_pii_publication(pub):
            out.notes.append(f"publication {pid}: PII list — stored PDF only")
        elif is_sitrep(pub):
            text = pdf_text(f.body)
            if len(text.strip()) < 200:
                out.notes.append(f"publication {pid}: sitrep is a scanned image (no text)")
            else:
                out.extend(parse_sitrep_text(text, title=title, date=pub.get("date"), url=pdf_url,
                                             fetched_at=fetched_at, pub_id=pid))
        done.append(pid)
    if done and ctx and ctx.state is not None and not ctx.dry_run:
        ctx.state.add_seen(SOURCE_ID, done, key="publications")
    return out
