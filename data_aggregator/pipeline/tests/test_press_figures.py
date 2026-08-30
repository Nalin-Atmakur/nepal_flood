"""③b press_figures — regex extraction on fixture headlines / sentences (EN + NE), the LLM fallback with a fake model."""
from datetime import datetime, timezone

from lib.llm import LLM, FakeClient
from processing import ProcCtx
from processing import press_figures as P

NOW = datetime(2026, 8, 30, 0, 30, tzinfo=timezone.utc)


def _vals(rows):
    return sorted((r["publisher"], r["metric"], r["value"]) for r in rows)


def test_police_counts_in_english():
    body = ("Nepal Police said on Saturday that 626 people have died and 2,426 remain missing in the Rasuwa flood. "
            "Police added that 4,451 people have been rescued so far. "
            "Police said 246 bodies were recovered in Chitwan alone. "
            "Police said 12 people were arrested for looting.")
    rows = P.extract("Death toll rises to 626 as flood recovery continues", body)
    assert _vals(rows) == [("Nepal Police (via press)", "dead", 626.0), ("Nepal Police (via press)", "missing", 2426.0),
                           ("Nepal Police (via press)", "rescued", 4451.0)]
    assert rows[0]["phrase"].startswith("Nepal Police said on Saturday that 626 people have died")


def test_death_toll_phrase_and_no_context_no_figure():
    rows = P.extract("Police: death toll from Rasuwa flood reaches 616", "")
    assert _vals(rows) == [("Nepal Police (via press)", "dead", 616.0)]
    assert P.extract("Police say 300 people died in road accidents this year", "") == []          # no flood context
    assert P.extract("Rasuwa flood: officials say 626 people died", "") == []                      # no agency attribution


def test_tourism_counts_and_nepali():
    body = ("The Nepal Tourism Board said 668 tourists from 34 countries remain out of contact after the Rasuwa flood, "
            "while the Department of Tourism said 261 tourists have been rescued and flown to Kathmandu.")
    rows = P.extract("Tourists still out of contact", body)
    assert _vals(rows) == [("Dept of Tourism (via press)", "tourists_rescued", 261.0), ("NTB (via press)", "tourists_missing", 668.0)]
    ne = "रसुवा बाढीमा ६२६ जनाको मृत्यु भएको प्रहरीले जनाएको छ। प्रहरीका अनुसार २,४२६ जना अझै बेपत्ता छन्।"
    rows = P.extract("रसुवा बाढी: प्रहरीको विवरण", ne)
    assert _vals(rows) == [("Nepal Police (via press)", "dead", 626.0), ("Nepal Police (via press)", "missing", 2426.0)]


def test_nepali_thousands_and_bodies_of_missing():
    assert P.expand_thousands("दुई हजार 381 जना") == "2381 जना" and P.expand_thousands("दुई हजार जना") == "2000 जना" and P.expand_thousands("12 हजार 5") == "12005"
    rows = P.extract("रसुवा बाढी", "बाढीमा परी सर्वसाधारणसहित हालसम्म दुई हजार ३८१ जना सम्पर्कविहीन रहेको प्रहरीले जनाएको छ ।")
    assert _vals(rows) == [("Nepal Police (via press)", "missing", 2381.0)]
    rows = P.extract("Rasuwa flood", "The bodies of 616 people reported missing after the flood have been recovered, police said.")
    assert _vals(rows) == [("Nepal Police (via press)", "dead", 616.0)]


def test_figures_rows_and_dedupe_shape():
    arts = [{"source_id": "outlet_rss_set", "url": "u1", "title": "Police: 626 dead in Rasuwa flood, 626 dead confirmed", "body": None,
             "published_at": "2026-08-29T09:00:00+00:00", "fetched_at": "2026-08-29T10:00:00+00:00"},
            {"source_id": "outlet_rss_set", "url": "u2", "title": "Bank rates", "body": "no flood here", "published_at": None, "fetched_at": "2026-08-29T10:00:00+00:00"}]
    rows = P.figures_from_articles(arts)
    assert len(rows) == 1 and rows[0]["publisher"] == "Nepal Police (via press)" and rows[0]["as_of"] == "2026-08-29T09:00:00+00:00"
    assert rows[0]["scope"] == "national" and rows[0]["url"] == "u1" and rows[0]["source_id"] == "outlet_rss_set" and "626" in rows[0]["note"]


def test_llm_fill_only_for_missing_publishers(state, gaz):
    arts = [{"source_id": "s", "url": "u1", "title": "Tourism board tallies missing pilgrims", "body": "NTB lists many pilgrims unreached after the Rasuwa flood.",
             "published_at": "2026-08-29T09:00:00+00:00", "fetched_at": "2026-08-29T10:00:00+00:00"}]
    fake = FakeClient([{"figures": [{"publisher": "NTB (via press)", "metric": "tourists_missing", "value": 667, "article": 0, "phrase": "NTB lists 667"},
                                    {"publisher": "NTB (via press)", "metric": "tourists_rescued", "value": 187, "article": 0, "phrase": "184 rescued and 3 found"},   # model arithmetic
                                    {"publisher": "Nepal Police (via press)", "metric": "dead", "value": 626, "article": 0, "phrase": "x"},   # not asked for
                                    {"publisher": "NTB (via press)", "metric": "dead", "value": 5, "article": 0, "phrase": "bad metric"},
                                    {"publisher": "NTB (via press)", "metric": "tourists_rescued", "value": 3, "article": 9, "phrase": "bad index"}]}])
    ctx = ProcCtx(db=None, gaz=gaz, llm=LLM(state, client=fake, budget_usd=20), state=state, dry_run=True, now=NOW)
    rows = P.llm_fill(ctx, arts, ["NTB (via press)"])
    assert _vals(rows) == [("NTB (via press)", "tourists_missing", 667.0)] and rows[0]["note"].startswith("llm: ") and len(fake.calls) == 1
    assert P.llm_fill(ctx, arts, []) == []
    state.llm_add(prompt_tokens=1, completion_tokens=1, usd=30, purpose="t")
    assert P.llm_fill(ctx, arts, ["NTB (via press)"]) == [] and len(fake.calls) == 1        # budget gone → no call
