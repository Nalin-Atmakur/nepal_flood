from datetime import datetime, timedelta, timezone

import pull_external_data as P
from lib import config
from lib.state import State
from normalisers import Part, make_envelope, parts


def test_cadence_minutes():
    assert config.cadence_minutes("30m") == 30 and config.cadence_minutes("2h") == 120 and config.cadence_minutes("10m") == 10
    assert config.cadence_minutes("daily") == 1440 and config.cadence_minutes("2/day (08:00, 18:00 NPT)") == 720
    assert config.cadence_minutes("static (fetch once)") == config.STATIC_MINUTES and config.cadence_minutes(None) == 60


def test_expand_alternatives():
    assert P.expand_alternatives("https://a/{x|y}/z") == ["https://a/x/z", "https://a/y/z"]
    got = P.expand_alternatives("https://h/api/{p/?limit=500&offset={n} | s/ | t/}")
    assert got == ["https://h/api/p/?limit=500&offset={n}", "https://h/api/s/", "https://h/api/t/"]
    assert P.expand_alternatives("https://h/x?type={lost|found|rescued}&page={n}")[1] == "https://h/x?type=found&page={n}"
    assert P.expand_alternatives("https://plain") == ["https://plain"]


def test_requests_for_all_sources():
    srcs = P.load_sources()
    assert len(srcs) == 51
    for s in srcs:
        reqs = P.requests_for(s)
        for r in reqs:
            assert r["url"].startswith("http") and "{" not in r["url"].replace("{n}", "")
    by = {s["id"]: P.requests_for(s) for s in srcs}
    assert len(by["outlet_rss_set"]) == 13 and len(by["openmeteo_corridor"]) == 2 and len(by["dhm_weather"]) == 4
    assert [r["paged"] for r in by["opmcm_person_reports"]] == [True, True, True]
    assert by["china_search_apis"][0]["method"] == "POST" and by["china_search_apis"][0]["json"]["word"] == "吉隆口岸"
    assert by["ntc_restoration_articles"] == []
    assert by["police_udb"][0]["verify"] is False


def test_is_due(tmp_path):
    st = State(tmp_path / "s.json")
    now = datetime(2026, 8, 30, tzinfo=timezone.utc)
    src = {"id": "x", "cadence": "30m"}
    assert P.is_due(st, src, now)
    st.record_fetch("x", ok=True, etag=None, last_modified=None, body_hash="h", at=now - timedelta(minutes=10))
    assert not P.is_due(st, src, now)
    st.record_fetch("x", ok=True, etag=None, last_modified=None, body_hash="h", at=now - timedelta(minutes=31))
    assert P.is_due(st, src, now)
    static = {"id": "y", "cadence": "static (fetch once)"}
    assert P.is_due(st, static, now)
    st.record_fetch("y", ok=True, etag=None, last_modified=None, body_hash="h", at=now - timedelta(days=30))
    assert not P.is_due(st, static, now)


def test_page_empty():
    assert P._page_empty('{"data": {"items": [], "total": 5}}')
    assert not P._page_empty('{"data": {"items": [1]}}')
    assert P._page_empty('{"results": []}') and P._page_empty("[]") and not P._page_empty('{"features": [1]}')


def test_envelope_roundtrip():
    ps = [Part(url="a", body="x"), Part(url="b", status=400, body="", error="http 400")]
    back = parts(make_envelope(ps))
    assert back[0].url == "a" and back[0].ok and back[1].status == 400 and not back[1].ok
    single = parts(b"plain body")
    assert len(single) == 1 and single[0].body == "plain body"
