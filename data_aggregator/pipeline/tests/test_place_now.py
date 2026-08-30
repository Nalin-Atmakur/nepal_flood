"""Step ⑩ place_now — facts, templates, model polishing (mocked), the per-step cap, and the write path (fake db)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from lib.llm import LLM, FakeClient
from processing import ProcCtx
from processing import place_now as PN

NOW = datetime(2026, 8, 30, 3, 0, tzinfo=timezone.utc)   # 08:45 NPT


def _figs() -> list[dict[str, Any]]:
    return [
        {"publisher": "OPMCM portal", "metric": "help_requests_open", "scope": "place:timure", "value": 33, "as_of": "2026-08-30T02:00:00+00:00", "note": None},
        {"publisher": "OPMCM portal", "metric": "help_requests_open", "scope": "place:timure", "value": 30, "as_of": "2026-08-29T20:00:00+00:00", "note": None},
        {"publisher": "OPMCM portal", "metric": "help_requests_critical", "scope": "place:timure", "value": 9, "as_of": "2026-08-30T02:00:00+00:00", "note": None},
        {"publisher": "NESRA FloodWatch", "metric": "bridges_to_inspect", "scope": "place:timure", "value": 2, "as_of": "2026-08-29T12:00:00+00:00", "note": None},
        {"publisher": "NESRA FloodWatch", "metric": "bridge_to_inspect", "scope": "place:timure|bridge:12", "value": 1, "as_of": "2026-08-29T12:00:00+00:00", "note": None},
        {"publisher": "HOT OSM", "metric": "bridge_status", "scope": "place:timure", "value": 1, "as_of": "2026-08-29T23:00:00+00:00", "note": "washed out · Miteri bridge · Gosaikunda"},
    ]


def _arts() -> list[dict[str, Any]]:
    return [{"id": "a1", "title": "Timure: search resumes as water drops", "publisher": "Kathmandu Post",
             "published_at": "2026-08-29T10:00:00+00:00", "places": ["timure"]},
            {"id": "a2", "title": "Older headline", "publisher": "THT", "published_at": "2026-08-28T10:00:00+00:00", "places": ["timure"]}]


STATUS = {"place_id": "timure", "as_of": "2026-08-30T02:40:00+00:00", "expected": 1104, "confirmed_reached": 12, "unknown": 1092}


def test_facts_keep_latest_per_publisher_metric_and_only_counts():
    f = PN.facts_for("timure", _figs(), _arts(), reports=2, status=STATUS)
    got = {(x["publisher"], x["metric"]): x["value"] for x in f["figures"]}
    assert got[("OPMCM portal", "help_requests_open")] == 33          # latest as_of wins
    assert ("NESRA FloodWatch", "bridge_to_inspect") not in got        # per-bridge rows are folded, not listed
    assert ("HOT OSM", "bridge_status") not in got and f["bridges_lost"] == 1
    assert [h["title"] for h in f["headlines"]] == ["Timure: search resumes as water drops", "Older headline"]
    assert f["ledger"] == {"expected": 1104, "confirmed_reached": 12, "unknown": 1092}
    assert "Miteri" not in str(f["figures"])                            # bridge names never travel as facts


def test_template_is_trilingual_named_and_latin_digits():
    f = PN.facts_for("timure", _figs(), _arts(), reports=2, status=STATUS)
    en, ne, hi = PN.template(f, NOW)
    assert en.startswith("As of 30 Aug 08:45: ")
    assert "33 open help requests (OPMCM portal)" in en and "9 critical (OPMCM portal)" in en
    assert "2 bridge(s) to inspect (NESRA FloodWatch)" in en
    assert "1 bridge(s) washed out or damaged (HOT OSM)" in en
    assert "1,104 people believed here, 12 confirmed reached, 1,092 unknown (ledger)" in en
    assert "2 new report(s) through the form" in en
    assert "latest headline 29 Aug: “Timure: search resumes as water drops” (Kathmandu Post)" in en
    assert ne.startswith("30 Aug 08:45 सम्म: ") and "33 खुला सहायता अनुरोध" in ne and "1,104" in ne
    assert hi.startswith("30 Aug 08:45 तक: ") and "33 खुले सहायता अनुरोध" in hi
    assert not any(ch in ne + hi for ch in "०१२३४५६७८९")
    assert PN.sources_of(f) == "NESRA FloodWatch · OPMCM portal · HOT OSM · Kathmandu Post · THT · form"


def test_template_caps_fragments_and_skips_unknown_metrics():
    figs = [{"publisher": "P", "metric": m, "scope": "place:x", "value": i + 1, "as_of": "2026-08-30T00:00:00+00:00", "note": None}
            for i, m in enumerate(["rescued", "missing", "dead", "found", "stationed", "lost", "lost_open", "records_total", "weird_metric"])]
    f = PN.facts_for("x", figs, [], reports=0, status=None)
    en, _ne, _hi = PN.template(f, NOW)
    assert "weird metric" not in en and "records total" not in en
    assert en.count("(P)") == PN.MAX_FRAGMENTS


def test_template_empty_without_signal():
    f = PN.facts_for("x", [], [], reports=0, status={"expected": 0, "confirmed_reached": 0, "unknown": 0})
    assert PN.template(f, NOW) == ("", "", "")


def test_place_of_strips_bridge_suffix():
    assert PN.place_of("place:betrawati|bridge:27") == "betrawati"
    assert PN.place_of("district:rasuwa") is None
    assert PN.place_of(None) is None


def _ctx(state, gaz, fake, db=None, dry_run=True, budget=20):
    return ProcCtx(db=db, gaz=gaz, llm=LLM(state, client=fake, budget_usd=budget), state=state, dry_run=dry_run, now=NOW)


def test_polish_batches_and_maps_ids(state, gaz):
    drafts = [{"id": f"p{i}", "en": f"As of x: {i} things.", "ne": "ne", "hi": "hi"} for i in range(PN.PLACE_NOW_BATCH + 2)]
    answers = [{"items": [{"id": d["id"], "en": d["en"] + " polished", "ne": "नेपाली", "hi": "हिन्दी"} for d in drafts[:PN.PLACE_NOW_BATCH]]},
               {"items": [{"id": d["id"], "en": d["en"] + " polished", "ne": "नेपाली", "hi": "हिन्दी"} for d in drafts[PN.PLACE_NOW_BATCH:]] + [{"id": "stranger", "en": "x", "ne": "y", "hi": "z"}]}]
    fake = FakeClient(answers)
    out = PN.polish(_ctx(state, gaz, fake), drafts)
    assert len(fake.calls) == 2
    assert set(out) == {d["id"] for d in drafts}           # every id, no strangers
    assert out["p0"]["en"].endswith("polished") and out["p0"]["ne"] == "नेपाली"
    # only counts and titles reach the model
    sent = fake.calls[0]["messages"][1]["content"]
    assert "id=p0: As of x: 0 things." in sent


def test_polish_normalises_devanagari_digits(state, gaz):
    fake = FakeClient([{"items": [{"id": "p", "en": "As of 30 Aug: 12 rescued.", "ne": "३० अगस्ट: १२ उद्धार।", "hi": "३० अगस्त: १२ बचाए गए।"}]}])
    out = PN.polish(_ctx(state, gaz, fake), [{"id": "p", "en": "d", "ne": "n", "hi": "h"}])
    assert out["p"]["ne"] == "30 अगस्ट: 12 उद्धार।" and out["p"]["hi"] == "30 अगस्त: 12 बचाए गए।"


def test_polish_stops_at_the_step_cap(state, gaz):
    drafts = [{"id": f"p{i}", "en": "d", "ne": "n", "hi": "h"} for i in range(PN.PLACE_NOW_BATCH * 3)]
    fake = FakeClient([{"items": [{"id": d["id"], "en": "e", "ne": "n", "hi": "h"} for d in drafts]}], prompt_tokens=2_000_000, completion_tokens=0)
    out = PN.polish(_ctx(state, gaz, fake), drafts, cap_usd=0.05)
    assert len(fake.calls) == 1                               # the first call blew the cap; the loop stopped
    assert 0 < len(out) <= len(drafts)


def test_polish_refused_returns_empty(state, gaz):
    fake = FakeClient([{"items": []}])
    out = PN.polish(_ctx(state, gaz, fake, budget=0.0), [{"id": "p", "en": "d", "ne": "n", "hi": "h"}])
    assert out == {} and fake.calls == []


class FakeDb:
    def __init__(self):
        self.updates: list[tuple[dict[str, Any], dict[str, Any]]] = []

    def select_all(self, table: str, params: dict[str, Any] | None = None):
        return {
            "figures": _figs(),
            "articles": _arts(),
            "reports_anon": [{"place_id": "timure"}, {"place_id": "timure"}],
            "v_place_status_latest": [STATUS, {"place_id": "quiet", "as_of": "2026-08-30T02:40:00+00:00", "expected": 0, "confirmed_reached": 0, "unknown": 0}],
        }[table]

    def update(self, table: str, match: dict[str, Any], values: dict[str, Any]) -> None:
        assert table == "place_status"
        self.updates.append((match, values))


def test_run_writes_polished_line_and_falls_back(state, gaz):
    db = FakeDb()
    fake = FakeClient([{"items": [{"id": "timure", "en": "As of 30 Aug 08:45: 33 open help requests (OPMCM portal).", "ne": "ने", "hi": "हि"}]}])
    res = PN.run(_ctx(state, gaz, fake, db=db, dry_run=False))
    assert res == {"places": 1, "polished": 1, "written": 1}
    match, values = db.updates[0]
    assert match == {"place_id": "eq.timure", "as_of": f"eq.{STATUS['as_of']}"}
    assert values["now_en"].startswith("As of 30 Aug 08:45") and values["now_ne"] == "ने"
    assert values["now_sources"].startswith("NESRA FloodWatch · OPMCM portal")
    assert values["now_as_of"] == NOW
    # model refused → the template is written instead
    db2 = FakeDb()
    res2 = PN.run(_ctx(state, gaz, FakeClient([{"items": []}]), db=db2, dry_run=False, budget=0.0))
    assert res2 == {"places": 1, "polished": 0, "written": 1}
    assert "33 open help requests (OPMCM portal)" in db2.updates[0][1]["now_en"]
    assert "33 खुला सहायता अनुरोध" in db2.updates[0][1]["now_ne"]


def test_run_dry_run_writes_nothing(state, gaz):
    db = FakeDb()
    res = PN.run(_ctx(state, gaz, FakeClient([{"items": []}]), db=db, dry_run=True))
    assert res["places"] == 1 and res["written"] == 0 and db.updates == []
