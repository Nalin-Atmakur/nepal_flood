"""⓪ with a fake model: PII never survives into the reports_anon row; hashes are computed in code."""
from datetime import datetime, timezone

from lib.llm import LLM, FakeClient
from processing import anonymise as A
from processing import ProcCtx

ROW = {"id": "11111111-1111-1111-1111-111111111111", "user_id": "u", "created_at": "2026-08-29T20:00:00+00:00", "lang": "en",
       "respondent_type": "family", "text": "My brother Ram Bahadur Tamang (34) was at Timure on 26 Aug 8am with Isha group of 12. "
       "Call me 9841234567, passport PU846865, ram@example.com", "place_id": None, "contact": "9841234567", "supersedes": None}
MODEL = {
    "subject_count": 1, "place_text": "Timure", "place_id": "timure", "event_time": "2026-08-26T08:00:00+05:45", "status": "missing",
    "nationality": "Nepali", "age_band": "18-39", "sex": "male", "purpose": "pilgrimage", "travel_mode": None, "operator": "Isha group",
    "employer_project": None, "reported_to": ["police"],
    "text_redacted": "My brother [name] (34) was at Timure on 26 Aug 8am with Isha group of 12. Call me [phone], passport [id], [email]",
    "text_en": "My brother [name] (34) was at Timure on 26 Aug 8am with Isha group of 12. Call me [phone], passport [id], [email]",
    "summary_public": "1 person · last at Timure · 26 Aug ~08:00 · group of 12 with an agency · phone number given",
    "private": {"names": ["Ram Bahadur Tamang"], "phones": ["9841234567"], "passports": ["PU846865"], "emails": ["ram@example.com"]},
}
PII = ("Ram Bahadur", "Tamang", "9841234567", "PU846865", "ram@example.com")


def _ctx(state, gaz, answers):
    llm = LLM(state, client=FakeClient(answers), budget_usd=20)
    return ProcCtx(db=None, gaz=gaz, llm=llm, state=state, dry_run=True, now=datetime(2026, 8, 29, 23, 0, tzinfo=timezone.utc))


def test_pii_never_survives(state, gaz):
    anon, how = A.anonymise_one(ROW, _ctx(state, gaz, [MODEL]))
    assert how == "llm"
    blob = str({k: v for k, v in anon.items()})
    for tok in PII:
        assert tok not in blob, tok
    assert anon["place_id"] == "timure" and anon["status"] == "missing" and anon["subject_count"] == 1
    assert anon["person_key"] and len(anon["person_key"]) == 64 and anon["group_key"]
    assert anon["summary_public"].startswith("1 person · last at Timure")
    assert "private" not in anon["extracted"]


def test_model_slip_is_caught_by_code(state, gaz):
    leaky = dict(MODEL, text_redacted="Ram Bahadur Tamang 9841234567 ram@example.com was at Timure",
                 summary_public="Ram Bahadur Tamang missing at Timure, call 9841234567")
    anon, _ = A.anonymise_one(ROW, _ctx(state, gaz, [leaky]))
    for tok in PII:
        assert tok not in anon["text_redacted"] and tok not in anon["summary_public"], tok
    assert "[name]" in anon["summary_public"] and "[phone]" in anon["summary_public"]


def test_fallback_when_budget_exhausted(state, gaz):
    ctx = _ctx(state, gaz, [MODEL])
    state.llm_add(prompt_tokens=1, completion_tokens=1, usd=25.0, purpose="test")
    anon, how = A.anonymise_one(ROW, ctx)
    assert how == "fallback" and anon["model"] == "fallback"
    assert anon["text_redacted"] is None and anon["text_en"] is None      # no model → no free text leaves ⓪
    for tok in PII:
        assert tok not in str(anon), tok
    assert anon["place_id"] == "timure"          # alias resolution still works without the model


def test_transient_failure_skips(state, gaz):
    class Boom(FakeClient):
        def create(self, **kw):
            raise RuntimeError("api down")
    llm = LLM(state, client=Boom([MODEL]), budget_usd=20)
    ctx = ProcCtx(db=None, gaz=gaz, llm=llm, state=state, dry_run=True)
    anon, how = A.anonymise_one(ROW, ctx)
    assert anon is None and how == "skip"


def test_opmcm_items_helper():
    from normalisers import Part, make_envelope
    import json
    env = make_envelope([Part(url="u?type=lost", body=json.dumps({"data": {"items": [{"_id": "1", "locationText": "Timure"}]}}))])
    assert A.opmcm_items(env)[0]["_id"] == "1"
