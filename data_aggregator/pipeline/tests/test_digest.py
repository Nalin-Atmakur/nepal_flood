"""⑦ deterministic bullet builder + the translate/fallback path with a fake model."""
from datetime import date, datetime, timezone

from lib.llm import LLM, FakeClient
from processing import ProcCtx
from processing import digest as D

LATEST = [
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 675, "url": "u1"},
    {"publisher": "NDRRMA", "metric": "missing", "scope": "national", "value": 2498, "url": "u1"},
    {"publisher": "NDRRMA", "metric": "rescued", "scope": "national", "value": 6633, "url": "u1"},
    {"publisher": "MoFA", "metric": "dead", "scope": "national", "value": 626, "url": "u2"},
    {"publisher": "OPMCM portal", "metric": "lost_open", "scope": "national", "value": 10823, "url": "u3"},
    {"publisher": "OPMCM portal", "metric": "rescued", "scope": "national", "value": 1716, "url": "u3"},
]
PREV = {("NDRRMA", "dead"): 579, ("NDRRMA", "missing"): 1924, ("NDRRMA", "rescued"): 4451}
ARTS = [{"title": "Tunnel rescue at Upper Trishuli-1 enters fourth day", "publisher": "Kathmandu Post", "url": "a1", "places": ["ut1_mailung_camp"]},
        {"title": "रसुवागढीमा थप ३ शव भेटिए", "publisher": "Kantipur", "url": "a2", "places": ["rasuwagadhi"]},
        {"title": "Barrier lake level stable", "publisher": "Republica", "url": "a3", "places": []},
        {"title": "Fourth headline", "publisher": "X", "url": "a4", "places": []}]


def _build(**over):
    kw = dict(day=date(2026, 8, 30), latest=LATEST, previous=PREV,
              places_today={"betrawati": {"confirmed_reached": 40, "unknown": 5, "phones": "yes (since 29 Aug)"},
                            "timure": {"confirmed_reached": 3, "unknown": 968, "phones": "no"}},
              places_before={"betrawati": {"confirmed_reached": 2, "unknown": 43, "phones": None},
                             "timure": {"confirmed_reached": 3, "unknown": 968, "phones": "no"}},
              place_names={"betrawati": "Betrawati", "timure": "Timure"},
              gauges_now={"Galchhi": True, "Rasuwagadhi": False, "Dhunche": True},
              gauges_before={"Galchhi": False, "Rasuwagadhi": False, "Dhunche": True}, articles=ARTS)
    kw.update(over)
    return D.build_bullets(**kw)


def test_bullets_are_deterministic_and_bounded():
    h1, b1 = _build()
    h2, b2 = _build()
    assert h1 == h2 and b1 == b2
    assert 5 <= len(b1) <= D.MAX_BULLETS
    assert h1.startswith("Day 4 after the flood — NDRRMA: 675 dead · 2,498 out of contact · 6,633 rescued")
    kinds = [b["kind"] for b in b1]
    assert kinds[0] == "figure" and "place" in kinds and "gauge" in kinds and "news" in kinds and "rescuers" in kinds
    assert kinds.index("rescuers") < kinds.index("place") < kinds.index("gauge") < kinds.index("news")
    ndrrma = next(b for b in b1 if b["text"].startswith("NDRRMA:"))
    assert "675 dead (+96 since yesterday)" in ndrrma["text"] and "2,498 out of contact (+574 since yesterday)" in ndrrma["text"]
    assert not any("OPMCM portal: " in b["text"] and " dead" in b["text"] for b in b1)
    place = [b for b in b1 if b["kind"] == "place"]
    assert any("Betrawati: 40 people confirmed reached (+38)" == b["text"] for b in place)
    assert any("phones working again" in b["text"] for b in place)
    gauge = next(b for b in b1 if b["kind"] == "gauge")
    assert "back online: Galchhi" in gauge["text"]
    news = [b for b in b1 if b["kind"] == "news"]
    assert news[0]["source_url"] == "a1" and 2 <= len(news) <= 3 and len(b1) == 10
    resc = next(b for b in b1 if b["kind"] == "rescuers")
    assert resc["text"].startswith("For rescuers: 2 of 2 tracked places still have people unaccounted for")
    assert "largest gaps: Timure (968), Betrawati (5)" in resc["text"]


def test_figure_bullets_biggest_delta_first():
    _, b = _build(previous={("NDRRMA", "dead"): 674, ("MoFA", "dead"): 100, ("OPMCM portal", "lost_open"): 10000})
    fig = [x["text"].split(":")[0] for x in b if x["kind"] == "figure"]
    assert fig == ["OPMCM portal", "MoFA", "NDRRMA"]          # +823, +526, +1


def test_rescuers_newly_reached_and_watch():
    _, b = _build(places_before={"betrawati": {"confirmed_reached": 0, "unknown": 43, "phones": None},
                                 "timure": {"confirmed_reached": 3, "unknown": 968, "phones": "no"}},
                  watch={"flying_window": "30 Aug 06–11 NPT · Dhunche",
                         "barrier_lake": {"title": "Barrier lake level stable", "publisher": "Republica", "url": "a3"}})
    resc = next(x for x in b if x["kind"] == "rescuers")
    assert "newly reached: Betrawati" in resc["text"]
    w = next(x for x in b if x["kind"] == "watch")
    assert w["text"] == "What to watch: next good morning flying window 30 Aug 06–11 NPT · Dhunche; barrier lake — Republica: Barrier lake level stable"
    assert w["source_url"] == "a3"
    _, b2 = _build(watch={"flying_window": None, "barrier_lake": None})
    assert not any(x["kind"] == "watch" for x in b2)
    _, b3 = _build(watch={"flying_window": None, "barrier_lake": {"title": "Lake", "publisher": "X", "url": "u"}})
    assert "no good morning flying window" in next(x for x in b3 if x["kind"] == "watch")["text"]


def test_relevant_news_drops_off_topic_titles(gaz):
    arts = [{"title": "Nepal Rastra Bank Sets Today's Exchange Rates", "url": "x", "places": [], "published_at": "2026-08-30T05:00:00+00:00"},
            {"title": "Barrier lake level stable, army engineers say", "url": "y", "places": [], "published_at": "2026-08-30T06:00:00+00:00"},
            {"title": "Tunnel rescue at Upper Trishuli-1 enters fourth day", "url": "z", "places": ["ut1_mailung_camp"], "published_at": "2026-08-30T04:00:00+00:00"},
            {"title": "रसुवागढीमा थप ३ शव भेटिए", "url": "w", "places": ["rasuwagadhi"], "published_at": "2026-08-30T03:00:00+00:00"}]
    keep = D.relevant_news(arts, gaz)
    assert [a["url"] for a in keep] == ["z", "w", "y"]      # place-tagged first (newest first), then keyword-only; bank dropped


def test_first_day_has_no_baseline_claims():
    _, b = _build(places_before={}, gauges_before={})
    assert not any(x["kind"] == "place" for x in b)
    assert next(x for x in b if x["kind"] == "gauge")["text"].startswith("River gauges: 2 of 3")


def test_no_change_gauge_line_and_padding():
    _, b = _build(gauges_before={"Galchhi": True, "Rasuwagadhi": False, "Dhunche": True}, places_before={}, places_today={})
    gauge = next(x for x in b if x["kind"] == "gauge")
    assert gauge["text"].startswith("River gauges: 2 of 3 corridor stations reporting (Dhunche, Galchhi)")
    assert len(b) >= 5 and sum(1 for x in b if x["kind"] == "news") >= 3


def test_translate_with_fake_model(state, gaz):
    h, b = _build()
    n = len(b)
    fake = FakeClient([{"headline_en": h, "bullets_en": [x["text"] for x in b], "headline_ne": "शीर्षक", "bullets_ne": ["ने"] * n,
                        "headline_hi": "शीर्षक", "bullets_hi": ["हि"] * n}])
    ctx = ProcCtx(db=None, gaz=gaz, llm=LLM(state, client=fake, budget_usd=20), state=state, dry_run=True)
    texts, model = D.translate(ctx, h, b)
    assert model == D.MODEL_TAG and texts["ne"][1] == ["ने"] * n and texts["hi"][0] == "शीर्षक" and len(fake.calls) == 1
    fake2 = FakeClient([{"headline_en": h, "bullets_en": [x["text"] for x in b], "headline_ne": "६७५ मृत", "bullets_ne": ["२,४९८"] * n,
                         "headline_hi": "x", "bullets_hi": ["y"] * n}])
    ctx2 = ProcCtx(db=None, gaz=gaz, llm=LLM(state, client=fake2, budget_usd=20), state=state, dry_run=True)
    texts2, _ = D.translate(ctx2, h, b)
    assert texts2["ne"][0] == "675 मृत" and texts2["ne"][1][0] == "2,498"       # Latin digits enforced


def test_translate_length_mismatch_and_budget_fallback(state, gaz):
    h, b = _build()
    fake = FakeClient([{"headline_en": h, "bullets_en": [], "headline_ne": "x", "bullets_ne": ["one"], "headline_hi": "x", "bullets_hi": ["one"]}])
    ctx = ProcCtx(db=None, gaz=gaz, llm=LLM(state, client=fake, budget_usd=20), state=state, dry_run=True)
    texts, _ = D.translate(ctx, h, b)
    assert texts["ne"] == (h, [x["text"] for x in b])          # bad shape → EN copied
    state.llm_add(prompt_tokens=1, completion_tokens=1, usd=30, purpose="t")
    texts, model = D.translate(ctx, h, b)
    assert model == "fallback" and texts["hi"] == texts["en"] and len(fake.calls) == 1
