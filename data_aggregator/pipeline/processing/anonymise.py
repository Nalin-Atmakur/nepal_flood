"""
processing/anonymise.py — step ⓪. See docs/process_data/00-anonymise.md.

Default mode is archive-only: no questionnaire row is selected, transformed, sent to a
model, or projected. The legacy family-processing functions below are dormant unless
FAMILY_REPORT_PROCESSING_ENABLED is explicitly enabled after a coordinated review.

    [explicit legacy mode only] reports_archive (anonymised_at is null, withdrawn_at is null)
        │  one LLM call per row (gpt-4o-mini, strict json schema, gazetteer id list in the prompt)
        ▼
    public fields ─▶ reports_anon (subject_count, place_id, event_time, status, nationality, age_band,
                     sex, purpose, travel_mode, operator, employer_project, reported_to[], text_redacted,
                     text_en, extracted, model)
    private fields (names, phones, passports, emails) ─▶ person_key / group_key hashes in code ─▶ DROPPED
    reports_archive.{anonymised_at, status='anonymised', summary_public} updated
    reports_archive.withdrawn_at not null ─▶ its reports_anon row is deleted (retract_withdrawn, runs first)

    raw_pulls (source opmcm_person_reports, projected_at is null) ─▶ per-place anonymised counts
        → figures 'OPMCM portal' lost_reports scope place:<id> (note 'process_data ⓪ projection') ; projected_at set

Belt-and-braces: every free-text field is passed through lib.text.redact_pii (phones, e-mails,
passport-like ids, and every name the model listed) before insert, so a model slip cannot leak.
If the budget is exhausted the row still gets a deterministic, PII-free projection ('fallback'
model: place via aliases, no free text at all — regexes cannot find names); a transient API
error leaves the row for the next run.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from lib import config, log
from lib.llm import nullable, schema
from lib.text import age_band as _age_band, group_key, nfc, normalise_phone, person_key, redact_pii
from normalisers import parts as _parts
from processing import ProcCtx

STEP = "00-anonymise"
MODEL_TAG = f"{config.LLM_MODEL}/anon-v1"
STATUSES = ["missing", "reported_safe", "rescued", "seen", "deceased", "unknown"]
AGE_BANDS = ["0-17", "18-39", "40-64", "65+"]

RESPONSE_FORMAT = schema("report_extraction", {
    "subject_count": nullable("integer", description="how many people this report is about; null if unclear"),
    "place_text": nullable("string", description="the place mentioned, copied/translated, without personal names"),
    "place_id": nullable("string", description="one id from the gazetteer list, or null"),
    "event_time": nullable("string", description="ISO 8601 with timezone (+05:45 for Nepal) of the last contact / presence, or null"),
    "status": {"type": "string", "enum": STATUSES},
    "nationality": nullable("string"),
    "age_band": {"type": ["string", "null"], "enum": AGE_BANDS + [None]},
    "sex": nullable("string", description="male | female | other | null"),
    "purpose": nullable("string", description="trekking | pilgrimage | work | trade | transit | resident | rescue | other"),
    "travel_mode": nullable("string"),
    "operator": nullable("string", description="tour/trek agency or transport operator named, if any"),
    "employer_project": nullable("string", description="employer or hydropower project named, if any"),
    "reported_to": {"type": "array", "items": {"type": "string"}, "description": "authorities already contacted (police, embassy, OPMCM portal, Setu, NDRRMA…)"},
    "text_redacted": {"type": "string", "description": "the original text with every name, phone, passport, e-mail replaced by [name]/[phone]/[id]/[email]"},
    "text_en": {"type": "string", "description": "English translation of text_redacted (same redaction placeholders)"},
    "summary_public": {"type": "string", "description": "ONE line, no names/phones, e.g. '1 person · last at Timure · 26 Aug ~08:00 · group of 12 with an agency · phone number given'"},
    "private": {
        "type": "object",
        "properties": {
            "names": {"type": "array", "items": {"type": "string"}},
            "phones": {"type": "array", "items": {"type": "string"}},
            "passports": {"type": "array", "items": {"type": "string"}},
            "emails": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["names", "phones", "passports", "emails"],
        "additionalProperties": False,
    },
})

SYSTEM = (
    "You anonymise and structure crowd reports about the 26 August 2026 Bhote Koshi / Trishuli flood in Nepal "
    "(Rasuwa–Nuwakot–Dhading corridor, Gyirong/Kerung border, Langtang). Return ONLY the JSON schema. "
    "Rules: text_redacted and text_en and summary_public must contain NO personal names, phone numbers, passport "
    "numbers or e-mail addresses — replace them with [name], [phone], [id], [email]. Put the raw names/phones/"
    "passports/emails you found into `private` (they are hashed and discarded). place_id must be one of the "
    "gazetteer ids listed, else null. Dates: the flood struck 26 Aug 2026 ~08:40 NPT; BS dates 2083 भदौ D = 2026-08-(16+D). "
    "Be conservative: unknown → null."
)


def gazetteer_list(gaz: Any, limit: int = 120) -> str:
    rows = []
    for p in list(gaz.all())[:limit]:
        rows.append(f"{p.id} = {p.name_en}" + (f" / {p.name_ne}" if p.name_ne else ""))
    return "\n".join(rows)


def build_user_prompt(row: dict[str, Any], gaz: Any) -> str:
    picked = row.get("place_id")
    return (
        f"respondent_type: {row.get('respondent_type')}\nlang: {row.get('lang')}\n"
        f"submitted_at: {row.get('created_at')}\nplace picked in the form: {picked or 'none'}\n"
        f"contact field given: {'yes' if row.get('contact') else 'no'}\n\n"
        f"GAZETTEER IDS:\n{gazetteer_list(gaz)}\n\nREPORT TEXT:\n{nfc(row.get('text'))}"
    )


def _dt(s: Any) -> datetime | None:
    if not s:
        return None
    try:
        d = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=config.KTM)
    except ValueError:
        return None


def fallback_extraction(row: dict[str, Any], gaz: Any) -> dict[str, Any]:
    """Deterministic, PII-free projection used when the model cannot be called."""
    text = nfc(row.get("text"))
    pid = row.get("place_id") or (gaz.resolve(text) if gaz else None)
    place = gaz.get(pid).name_en if (gaz and pid and gaz.get(pid)) else "place not given"
    day = str(row.get("created_at") or "")[:10]
    return {
        "subject_count": None, "place_text": None, "place_id": pid, "event_time": None, "status": "unknown",
        "nationality": None, "age_band": None, "sex": None, "purpose": None, "travel_mode": None, "operator": None,
        "employer_project": None, "reported_to": [], "text_redacted": None, "text_en": None,   # no model = no free text
        "summary_public": f"Report received · {place} · {day} · awaiting extraction",
        "private": {"names": [], "phones": [], "passports": [], "emails": []},
    }


def to_anon_row(row: dict[str, Any], ex: dict[str, Any], gaz: Any, model: str) -> dict[str, Any]:
    """Build the reports_anon row. Hashes are computed here; `private` never leaves this function."""
    priv = ex.get("private") or {}
    names = [n for n in (priv.get("names") or []) if isinstance(n, str)]
    phones = [p for p in (priv.get("phones") or []) if isinstance(p, str)]
    passports = [p for p in (priv.get("passports") or []) if isinstance(p, str)]
    contact_phone = normalise_phone(row.get("contact")) if row.get("contact") else None
    pkey = None
    for ph in phones:
        pkey = person_key(phone=ph)
        if pkey:
            break
    if not pkey:
        for pp in passports:
            pkey = person_key(passport=pp)
            if pkey:
                break
    if not pkey and names:
        pkey = person_key(name=names[0], age=None, nationality=ex.get("nationality"))
        if ex.get("age_band"):
            pkey = person_key(name=names[0], age={"0-17": 10, "18-39": 30, "40-64": 50, "65+": 70}[ex["age_band"]],
                              nationality=ex.get("nationality"))
    if not pkey and contact_phone and row.get("respondent_type") == "survivor":
        pkey = person_key(phone=contact_phone)
    gkey = group_key(ex.get("operator"), ex.get("employer_project"))
    pid = ex.get("place_id")
    if pid and gaz and not gaz.get(pid):
        pid = gaz.resolve(pid)
    if not pid and row.get("place_id") and gaz and gaz.get(row["place_id"]):
        pid = row["place_id"]
    if not pid and ex.get("place_text") and gaz:
        pid = gaz.resolve(ex["place_text"])
    scrub = lambda s: redact_pii(s, names) if s else None  # noqa: E731
    ab = ex.get("age_band") if ex.get("age_band") in AGE_BANDS else None
    status = ex.get("status") if ex.get("status") in STATUSES else "unknown"
    extracted = {k: v for k, v in ex.items() if k != "private"}
    for k in ("place_text", "text_redacted", "text_en", "summary_public", "operator", "employer_project"):
        if extracted.get(k):
            extracted[k] = scrub(extracted[k])
    return {
        "id": row["id"], "archive_id": row["id"], "created_at": row["created_at"], "lang": row.get("lang"),
        "respondent_type": row["respondent_type"], "supersedes": row.get("supersedes"),
        "person_key": pkey, "group_key": gkey, "place_id": pid, "place_text": scrub(ex.get("place_text")),
        "event_time": _dt(ex.get("event_time")), "status": status,
        "subject_count": ex.get("subject_count") if isinstance(ex.get("subject_count"), int) else None,
        "nationality": (ex.get("nationality") or None), "age_band": ab, "sex": (ex.get("sex") or None),
        "purpose": (ex.get("purpose") or None), "travel_mode": (ex.get("travel_mode") or None),
        "operator": scrub(ex.get("operator")), "employer_project": scrub(ex.get("employer_project")),
        "reported_to": [str(x)[:60] for x in (ex.get("reported_to") or []) if x][:10],
        "extracted": extracted, "text_redacted": scrub(ex.get("text_redacted")),   # never the raw text
        "text_en": scrub(ex.get("text_en")), "model": model,
        "summary_public": scrub(ex.get("summary_public")) or "Report received",
    }


def anonymise_one(row: dict[str, Any], ctx: ProcCtx) -> tuple[dict[str, Any] | None, str]:
    """→ (reports_anon row, 'llm' | 'fallback' | 'skip')."""
    ok, _why = ctx.llm.can_call()
    if not ok:
        return to_anon_row(row, fallback_extraction(row, ctx.gaz), ctx.gaz, "fallback"), "fallback"
    ex = ctx.llm.complete_json("anonymise", SYSTEM, build_user_prompt(row, ctx.gaz), RESPONSE_FORMAT, max_tokens=1200)
    if ex is None:
        if ctx.llm.can_call()[0]:
            return None, "skip"      # transient failure: retry next run
        return to_anon_row(row, fallback_extraction(row, ctx.gaz), ctx.gaz, "fallback"), "fallback"
    return to_anon_row(row, ex, ctx.gaz, MODEL_TAG), "llm"


def run_reports(ctx: ProcCtx, limit: int = 200) -> dict[str, Any]:
    db = ctx.db
    rows = db.select("reports_archive", {"select": "*", "anonymised_at": "is.null", "withdrawn_at": "is.null",
                                         "status": "in.(received)", "order": "created_at.asc", "limit": limit})
    done = fallback = skipped = 0
    for row in rows:
        anon, how = anonymise_one(row, ctx)
        if anon is None:
            skipped += 1
            continue
        summary = anon.pop("summary_public")
        if ctx.dry_run:
            log.info("anonymise.dry_run", report=row["id"], how=how, place=anon.get("place_id"), status=anon.get("status"))
        else:
            db.upsert("reports_anon", [anon], on_conflict="id")
            db.update("reports_archive", {"id": f"eq.{row['id']}"},
                      {"anonymised_at": ctx.now, "status": "anonymised", "summary_public": summary})
        done += 1
        fallback += how == "fallback"
        log.info("anonymise.report", report=row["id"], how=how, place=anon.get("place_id"), status=anon.get("status"))
    return {"pending": len(rows), "anonymised": done, "fallback": fallback, "skipped": skipped}


def load_pull_body(db: Any, pull: dict[str, Any]) -> bytes | None:
    if pull.get("body"):
        return pull["body"].encode("utf-8")
    if pull.get("storage_path"):
        try:
            path = pull["storage_path"].split("/", 1)[1] if pull["storage_path"].startswith(config.STORAGE_BUCKET + "/") else pull["storage_path"]
            return db.storage_download(path)
        except Exception as e:  # noqa: BLE001
            log.warn("anonymise.storage_download_failed", pull=pull.get("id"), error=type(e).__name__)
    return None


def opmcm_items(raw: bytes) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for p in _parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            continue
        d = doc.get("data")
        if isinstance(d, dict) and isinstance(d.get("items"), list):
            items.extend(x for x in d["items"] if isinstance(x, dict))
        elif isinstance(d, list):
            items.extend(x for x in d if isinstance(x, dict))
    return items


def project_opmcm(ctx: ProcCtx) -> dict[str, Any]:
    """Latest un-projected OPMCM person-reports pull → per-place anonymised counts; older pulls marked too."""
    db = ctx.db
    pulls = db.select("raw_pulls", {"select": "id,fetched_at,body,storage_path,unchanged",
                                    "source_id": "eq.opmcm_person_reports", "projected_at": "is.null",
                                    "unchanged": "eq.false", "order": "fetched_at.desc", "limit": 5})
    if not pulls:
        return {"projected": 0}
    latest = pulls[0]
    raw = load_pull_body(db, latest)
    if not raw:
        return {"projected": 0, "error": "no body"}
    items = opmcm_items(raw)
    ctx.cache["opmcm_items"] = items
    by_place: dict[tuple[str, str, str], int] = {}
    unresolved = 0
    for it in items:
        if "fullName" in it or "images" in it:      # must never happen: prestore strips these
            log.error("anonymise.opmcm_unstripped_row")
            continue
        loc = str(it.get("locationText") or "").strip()
        pid = ctx.gaz.resolve(loc) if loc else None
        t = str(it.get("type") or "lost")
        st = str(it.get("status") or "open").lower()
        if pid:
            by_place[(t, pid, st)] = by_place.get((t, pid, st), 0) + 1
        else:
            unresolved += 1
    fetched_at = datetime.fromisoformat(latest["fetched_at"].replace("Z", "+00:00"))
    figs = []
    per_place: dict[tuple[str, str], int] = {}
    for (t, pid, st), n in by_place.items():
        figs.append({"source_id": "opmcm_person_reports", "publisher": "OPMCM portal", "metric": f"{t}_reports",
                     "scope": f"place:{pid}|status:{st}", "value": n, "as_of": fetched_at, "fetched_at": fetched_at,
                     "url": "https://rescue.opmcm.gov.np/person-lost-found", "note": "process_data ⓪ projection"})
        per_place[(t, pid)] = per_place.get((t, pid), 0) + n
    for (t, pid), n in per_place.items():
        figs.append({"source_id": "opmcm_person_reports", "publisher": "OPMCM portal", "metric": f"{t}_reports",
                     "scope": f"place:{pid}", "value": n, "as_of": fetched_at, "fetched_at": fetched_at,
                     "url": "https://rescue.opmcm.gov.np/person-lost-found", "note": "process_data ⓪ projection"})
    if not ctx.dry_run:
        if figs:
            db.upsert_figures(figs)
        for p in pulls:
            db.update("raw_pulls", {"id": f"eq.{p['id']}"}, {"projected_at": ctx.now})
    log.info("anonymise.opmcm_projected", items=len(items), places=len(per_place), unresolved=unresolved)
    return {"projected": len(items), "places": len(per_place), "unresolved": unresolved, "figures": len(figs)}


def retract_withdrawn(ctx: ProcCtx) -> dict[str, Any]:
    """Withdrawn archive rows leave RAW: their reports_anon projection is deleted (counts follow next step)."""
    db = ctx.db
    withdrawn = db.select("reports_archive", {"select": "id", "withdrawn_at": "not.is.null", "limit": 1000})
    ids = [w["id"] for w in withdrawn]
    removed = 0
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        present = db.select("reports_anon", {"select": "id", "id": f"in.({','.join(chunk)})"})
        if present and not ctx.dry_run:
            db.delete("reports_anon", {"id": f"in.({','.join(p['id'] for p in present)})"})
        removed += len(present)
    if removed:
        log.info("anonymise.retracted", withdrawn=removed)
    return {"withdrawn_total": len(ids), "retracted": removed}


def run(ctx: ProcCtx) -> dict[str, Any]:
    out: dict[str, Any] = {}
    if ctx.family_report_processing_enabled:
        try:
            out["withdrawn"] = retract_withdrawn(ctx)
        except Exception as e:  # noqa: BLE001
            log.error("anonymise.retract_failed", error=f"{type(e).__name__}: {str(e)[:200]}")
            out["withdrawn"] = {"error": type(e).__name__}
        try:
            out["reports"] = run_reports(ctx)
        except Exception as e:  # noqa: BLE001
            log.error("anonymise.reports_failed", error=f"{type(e).__name__}: {str(e)[:200]}")
            out["reports"] = {"error": type(e).__name__}
    else:
        out["withdrawn"] = {"skipped": "archive_only"}
        out["reports"] = {"mode": "archive_only", "read": 0, "written": 0}
        log.info("anonymise.family_reports_disabled", mode="archive_only")
    try:
        out["opmcm"] = project_opmcm(ctx)
    except Exception as e:  # noqa: BLE001
        log.error("anonymise.opmcm_failed", error=f"{type(e).__name__}: {str(e)[:200]}")
        out["opmcm"] = {"error": type(e).__name__}
    return out
