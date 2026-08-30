"""Fixture-backed tests for the wave-2 geospatial + text normalisers (docs/pull_external_data/05b-sources-wave2-geospatial-text.md)."""
from __future__ import annotations

import json
from datetime import datetime, timezone

import pytest
import yaml

import normalisers as N
from lib import config
from lib.htmlx import first_sentence, iso_dt, live_blog_posts
from lib.places import Gazetteer
from normalisers import Context, load_fixture
from normalisers import china_search_apis as CS
from normalisers import google_news_site_queries as GN
from normalisers import nesra_bucket as NB
from normalisers import wikipedia_revisions as WR

FIXTURES = {
    "nesra_bucket": "w2b_nesra_bucket.json", "emsr927_dashboard": "w2b_emsr927_dashboard.json",
    "hot_tasking_manager": "w2b_hot_tasking_manager.json", "google_news_site_queries": "w2b_google_news_site_queries.json",
    "ekantipur_live": "w2b_ekantipur_live.json", "live_blogs": "w2b_live_blogs.json", "china_search_apis": "w2b_china_search_apis.json",
    "wikipedia_revisions": "w2b_wikipedia_revisions.json", "geofon_fdsn": "w2b_geofon_fdsn.txt",
    "dhm_riverwatch_post": "w2b_dhm_riverwatch_post.json", "ntc_restoration_articles": "w2b_ntc_restoration_articles.json",
    "hdx_search": "w2b_hdx_search.json", "hot_s3_listing": "w2b_hot_s3_listing.xml", "oam_bbox": "w2b_oam_bbox.json",
}
SOURCES = {s["id"]: s for s in yaml.safe_load(config.SOURCES_YAML.read_text())["sources"]}
PII_TOKENS = ("@gmail", "scolch", "contact\"", "editor\"", "Angus Thompson", "Nelli Saarinen", "EXAMPLE-PERSON")
W2B_NOW = datetime(2026, 8, 30, 1, 0, tzinfo=timezone.utc)


class _Fetched:
    def __init__(self, body: bytes, ok: bool = True):
        self.body, self.ok, self.status, self.error, self.last_modified = body, ok, 200 if ok else 404, None if ok else "http 404", None

    @property
    def text(self) -> str:
        return self.body.decode("utf-8")


def _fetch(url: str) -> _Fetched:
    if url.endswith("/63069/statistics/"):
        return _Fetched(load_fixture("w2b_hot_tm_stats_63069.json"))
    return _Fetched(b"", ok=False)


@pytest.fixture
def w2b_ctx(gaz, state) -> Context:
    return Context(source_id="w2b", fetch=_fetch, upload=None, state=state, gazetteer=gaz, dry_run=False)


def _run(sid, ctx, now=W2B_NOW):
    mod = N.get(sid)
    assert mod is not None, sid
    return mod.normalise(load_fixture(FIXTURES[sid]), now, SOURCES[sid], ctx)


def _fig(rows, metric, scope="national", publisher=None):
    return [f for f in rows.figures if f["metric"] == metric and f["scope"] == scope and (publisher is None or f["publisher"] == publisher)]


def test_registry_covers_wave2b():
    assert set(FIXTURES) <= set(N.registry())


@pytest.mark.parametrize("sid", sorted(FIXTURES))
def test_contract_and_no_pii(sid, w2b_ctx):
    rows = _run(sid, w2b_ctx)
    blob = json.dumps(rows.figures + rows.articles + rows.gauges + rows.place_hints + rows.notes, ensure_ascii=False, default=str)
    for tok in PII_TOKENS:
        assert tok not in blob, f"{sid} leaked {tok}"
    for f in rows.figures:
        assert f["publisher"] and f["metric"] and f["scope"] and isinstance(f["value"], (int, float))
        assert f["as_of"] is not None and f["as_of"].tzinfo is not None, (sid, f["metric"])
    for a in rows.articles:
        assert a["url"].startswith("http") and a["title"] and a["publisher"]
    assert len({a["url"] for a in rows.articles}) == len(rows.articles), f"{sid} duplicate article urls"


# ─── geospatial ───────────────────────────────────────────────────────────────

def test_nesra_bucket(w2b_ctx):
    r = _run("nesra_bucket", w2b_ctx)
    assert _fig(r, "reach_km")[0]["value"] == 101.6 and _fig(r, "buildings_floodway")[0]["value"] == 3216
    assert _fig(r, "buildings_osm_confirmed")[0]["value"] == 2293 and _fig(r, "bridges_intersecting")[0]["value"] == 62
    assert _fig(r, "reach_km")[0]["as_of"] == datetime(2026, 8, 27, tzinfo=timezone.utc)          # imagery_date
    bridges = [f for f in r.figures if f["metric"] == "bridge_to_inspect"]
    assert len(bridges) == 62 and all(f["value"] == 1 and f["as_of"] == datetime(2026, 8, 27, tzinfo=timezone.utc) for f in bridges)
    scopes = {f["scope"] for f in bridges}
    assert len(scopes) == 62 and all("|bridge:" in s for s in scopes)             # unique per bridge (figures unique key)
    places = {s.split("|")[0] for s in scopes}
    assert "place:devighat" in places                                # 'devighat-Tadi bridge' by name
    assert sum(1 for s in places if s.startswith("place:unresolved:")) < 62 and any(s.startswith("place:unresolved:") for s in places)
    assert _fig(r, "bridges_to_inspect", "place:devighat")[0]["value"] >= 1 and _fig(r, "bridges_to_inspect")[0]["value"] == 62
    assert all(f["publisher"] == "NESRA FloodWatch" for f in r.figures)
    assert _fig(r, "buildings_destroyed")[0]["value"] == 10 and _fig(r, "buildings_unconfirmed")[0]["value"] == 10


def test_nesra_bridge_resolution_helpers(gaz):
    assert NB.haversine_km(28.1642, 85.3392, 28.1642, 85.3392) == 0
    near = NB.nearest_place(gaz, 28.1642, 85.3392)
    assert near and near[0] == "syabrubesi_shelter" and near[1] < 0.1
    assert NB.nearest_place(gaz, 20.0, 80.0) is None
    ctx = Context(gazetteer=Gazetteer.from_csv(config.GAZETTEER_CSV))          # every CSV place has coordinates
    assert NB.resolve_bridge("Trishuli River Old Bridge", 27.93, 85.16, ctx)[0] == "trishuli_bazar"
    assert NB.resolve_bridge("Trishuli River Old Bridge", 28.30, 85.40, ctx)[0] != "trishuli_bazar"   # name rejected: > 10 km away
    assert NB.resolve_bridge("", 26.0, 84.0, ctx) == (None, "unresolved")


def test_emsr927_dashboard(w2b_ctx):
    r = _run("emsr927_dashboard", w2b_ctx)
    assert _fig(r, "buildings_affected", "place:syabrubesi")[0]["value"] == 433
    assert _fig(r, "buildings_total", "place:syabrubesi")[0]["value"] == 559
    assert _fig(r, "bridges_affected", "place:bidur")[0]["value"] == 20 and _fig(r, "buildings_affected", "place:bidur")[0]["value"] == 2343
    assert _fig(r, "population_affected", "place:timure")[0]["value"] == 450
    assert _fig(r, "roads_affected_km", "place:syabrubesi")[0]["value"] == pytest.approx(7.6)
    assert _fig(r, "buildings_affected", "place:bidur")[0]["as_of"].isoformat().startswith("2026-08-29T02:57")
    assert _fig(r, "aoi_delivered", "place:bharatpur")[0]["value"] == 0 and not _fig(r, "buildings_affected", "place:bharatpur")
    assert _fig(r, "identified_buildings")[0]["value"] == 3207 and _fig(r, "population")[0]["value"] == 5300
    assert all(f["publisher"] == "Copernicus EMS" for f in r.figures)


def test_hot_tasking_manager(w2b_ctx):
    r = _run("hot_tasking_manager", w2b_ctx)
    assert _fig(r, "mapped_pct", "project:63069")[0]["value"] == 100 and _fig(r, "validated_pct", "project:63069")[0]["value"] == 32
    assert _fig(r, "mapped_pct", "project:63235")[0]["value"] == 23 and _fig(r, "validated_pct", "project:63236")[0]["value"] == 0
    assert "[BUILDING]" in _fig(r, "mapped_pct", "project:63069")[0]["note"]
    assert _fig(r, "tasks_total", "project:63069")[0]["value"] == 648            # from the statistics sub-fetch
    assert not _fig(r, "tasks_total", "project:63235")                              # sub-fetch 404 → no row, no crash
    assert _fig(r, "projects_active")[0]["value"] == 4 and all(f["publisher"] == "HOT" for f in r.figures)


def test_geofon_fdsn(w2b_ctx):
    r = _run("geofon_fdsn", w2b_ctx)
    ev = _fig(r, "seismic_event", publisher="GFZ GEOFON")
    assert len(ev) == 1 and ev[0]["value"] == 5.69 and "gfz2026qrfy" in ev[0]["note"] and "landslide" in ev[0]["note"]
    assert ev[0]["as_of"].isoformat().startswith("2026-08-26T02:52:23") and "gfz2026qrfy" in ev[0]["url"]
    assert _fig(r, "seismic_events_since_25aug")[0]["value"] == 1


def test_dhm_riverwatch_post(w2b_ctx):
    r = _run("dhm_riverwatch_post", w2b_ctx)
    by = {g["station_id"]: g for g in r.gauges}
    assert "dhm:5705" in by and by["dhm:5705"]["station_name"] == "Trishuli at Galchi" and by["dhm:5705"]["alive"] is True
    assert "dhm:4913" not in by                                                    # Rasuwagadhi has no reading → no gauges row
    assert all(g["station_id"].startswith("dhm:") for g in r.gauges)
    assert _fig(r, "water_level_m", "place:galchhi", "DHM")[0]["value"] == pytest.approx(365.26, abs=0.01)
    assert _fig(r, "water_level_m", "place:dhunche")[0]["as_of"].isoformat().startswith("2026-08-30T00:15")
    assert _fig(r, "gauges_alive_corridor")[0]["value"] == 4 and _fig(r, "stations_reporting")[0]["value"] == len(r.gauges)


# ─── text ────────────────────────────────────────────────────────────────────

def test_google_news_site_queries(w2b_ctx):
    r = _run("google_news_site_queries", w2b_ctx)
    pubs = {a["publisher"] for a in r.articles}
    assert {"Kathmandu Post", "Kantipur", "The Guardian"} <= pubs
    assert all(a["lang"] == "en" for a in r.articles)                       # Google renders Devanagari headlines in English
    assert all(not a["title"].endswith((" - The Kathmandu Post", " - The Guardian")) for a in r.articles)
    assert all(a["published_at"] is not None for a in r.articles)
    assert any("503" in n for n in r.notes)
    assert GN.split_title("Nepal flood: X - The Kathmandu Post") == ("Nepal flood: X", "The Kathmandu Post")
    assert GN.decode_redirector("https://news.google.com/rss/articles/CBMisAFBVV95cUxQZkQwc1k1TnlEaGFEWDhKeXljc2Y5Q1I0b2lKRGVoWmhURU5Pa3lwUUMwb2JOUjU4emVwRG5ZSjFNR2VleV9ZMTJZcVB3TkhWQXpXS0UxN1Z1czNXS0RfR1lSdnpZQUVrTzRoUkQ3RXh2MWM0RHFhcWpOVnB2UWd1Njh0eFhRenRybTQ1aWxUM2cyT01BMFJ4ZzMxN1dmR1pULUhqdFpLd2lzSlVxY2lqUg?oc=5") is None
    import base64
    target = b"https://kathmandupost.com/national/2026/08/29"
    token = base64.urlsafe_b64encode(b"\x08\x13\x22" + bytes([len(target)]) + target + b"\xd2\x01\x00").decode().rstrip("=")
    assert GN.decode_redirector(f"https://news.google.com/rss/articles/{token}?oc=5") == target.decode()


def test_ekantipur_live(w2b_ctx):
    r = _run("ekantipur_live", w2b_ctx)
    live = [a for a in r.articles if "#" in a["url"]]
    home = [a for a in r.articles if "#" not in a["url"]]
    assert len(live) >= 20 and len(home) >= 10
    a = live[0]
    assert a["publisher"] == "Kantipur" and a["lang"] == "ne" and a["title"] == "तनहुँमा शनिबार थप ५ वटा शव फेला"
    assert a["published_at"].astimezone(config.KTM).strftime("%Y-%m-%d %H:%M") == "2026-08-29 22:47"
    assert "tanahun" in a["places"] and "shantibazar" not in a["places"]        # exact aliases only (शनिबार is Saturday)
    assert a["body"] and "EXAMPLE-PERSON" not in a["body"]                          # reporter byline stripped
    assert all(h["published_at"] >= config.EVENT_START_UTC.astimezone(config.KTM).replace(hour=0, minute=0) for h in home)
    assert any("timure" in x["places"] or "dhunche" in x["places"] for x in r.articles)


def test_live_blogs(w2b_ctx):
    r = _run("live_blogs", w2b_ctx)
    pubs = {a["publisher"] for a in r.articles}
    assert {"BBC News", "CNN", "NBC News", "The Guardian", "ABC News (Australia)"} == pubs
    assert all(len(a["title"]) <= 141 and a["published_at"] is not None and a["lang"] == "en" for a in r.articles)
    assert any("?post=asset:" in a["url"] for a in r.articles)                       # BBC post ids
    assert any("?page=with:block-" in a["url"] for a in r.articles)                 # Guardian block permalinks
    assert any("post-id=" in a["url"] for a in r.articles)                          # CNN post ids
    assert any("#live-blog-post-" in a["url"] for a in r.articles)                  # ABC post ids
    assert first_sentence("• Death toll climbs: More than 600 people have been killed in Nepal, according to police. Around 2,500 are missing.", 140) == \
        "Death toll climbs: More than 600 people have been killed in Nepal, according to police."
    assert len(first_sentence("word " * 60, 140)) <= 141
    assert iso_dt("2026-08-29T22:27:09+0000").isoformat() == "2026-08-29T22:27:09+00:00"
    assert live_blog_posts("<html></html>") == []


def test_china_search_apis(w2b_ctx):
    r = _run("china_search_apis", w2b_ctx)
    pubs = {a["publisher"] for a in r.articles}
    assert "The Paper" in pubs and any(p.endswith("via People's Daily") for p in pubs)
    assert all(a["lang"] == "zh" and a["published_at"] >= CS.SINCE for a in r.articles)
    assert all("<em>" not in a["title"] and "<font" not in a["title"] for a in r.articles)
    assert any(a["url"].startswith("https://www.thepaper.cn/newsDetail_forward_") for a in r.articles)
    dead = _fig(r, "dead", "country:china", "Xinhua/People’s Daily")
    miss = _fig(r, "missing", "country:china", "Xinhua/People’s Daily")
    assert dead and dead[0]["value"] == 7 and miss and miss[0]["value"] == 554
    assert CS.counts_in("已致7人死亡 554人失联") == [("dead", 7), ("missing", 554)]
    assert CS.counts_in("死亡人数升至7人，失联554人") == [("dead", 7), ("missing", 554)]
    assert CS.counts_in("吉隆口岸恢复通关") == []


def test_wikipedia_revisions(w2b_ctx):
    r = _run("wikipedia_revisions", w2b_ctx)
    pub = "Wikipedia (unattributed)"
    assert _fig(r, "revision_id", publisher=pub)[0]["value"] == 1372040276
    assert _fig(r, "dead", publisher=pub)[0]["value"] == 675 and _fig(r, "dead", "country:china", pub)[0]["value"] == 7
    assert _fig(r, "missing", publisher=pub)[0]["value"] == 2426 and _fig(r, "missing", "country:china", pub)[0]["value"] == 554
    assert _fig(r, "injured", publisher=pub)[0]["value"] == 1473
    assert all("do not cite" in f["note"] for f in r.figures)
    assert _fig(r, "dead", publisher=pub)[0]["as_of"].isoformat().startswith("2026-08-30T00:23:29")
    assert len(r.articles) >= 80
    pubs = {a["publisher"] for a in r.articles}
    assert "The Kathmandu Post" in pubs and "Reuters" in pubs
    assert all("web.archive.org" not in a["url"] for a in r.articles)
    got = WR.infobox_numbers("| deaths = 682+{{efn|675+ in Nepal,<ref/> 7+ in China}}\n| missing = 2,980+\n| injuries = 1,473+ {{small|(in Nepal)}}")
    assert got == {"dead": {"national": 675, "country:china": 7}, "missing": {"national": 2980}, "injured": {"national": 1473}}


def test_ntc_restoration_articles(w2b_ctx):
    r = _run("ntc_restoration_articles", w2b_ctx)
    pub = "NTC/Ncell via press"
    restored = {f["scope"] for f in r.figures if f["metric"] == "telecom_restored"}
    assert {"place:betrawati", "place:dhunche", "place:syabrubesi", "place:goljung"} <= restored
    assert "place:rasuwa" not in restored and "place:langtang_village" not in restored      # district skipped; 20 Aug too old
    outage = [f for f in r.figures if f["metric"] == "telecom_outage"]
    assert {f["scope"] for f in outage} == {"place:timure"}
    assert _fig(r, "telecom_sites_restored", publisher=pub)[0]["value"] == 80 and _fig(r, "telecom_sites_affected")[0]["value"] == 120
    f = [x for x in r.figures if x["scope"] == "place:betrawati"][0]
    assert f["as_of"].isoformat().startswith("2026-08-29T06:00") and f["url"].startswith("https://english.khabarhub.com") and f["publisher"] == pub


# ─── dataset availability ────────────────────────────────────────────────────

def test_hdx_search(w2b_ctx):
    r = _run("hdx_search", w2b_ctx)
    urls = {a["url"] for a in r.articles}
    assert "https://data.humdata.org/dataset/hot_flood_npl" in urls and "https://data.humdata.org/dataset/npl-flood-emsr927" in urls
    assert "https://data.humdata.org/dataset/cerf-allocations-npl" not in urls        # no event keyword
    assert all(a["publisher"] == "HDX" and a["published_at"] >= config.EVENT_START_UTC for a in r.articles)
    assert "Humanitarian OpenStreetMap Team" in [a for a in r.articles if a["url"].endswith("/hot_flood_npl")][0]["body"]
    assert _fig(r, "datasets_updated_since_event", publisher="HDX")[0]["value"] == len(r.articles)


def test_hot_s3_listing(w2b_ctx):
    r = _run("hot_s3_listing", w2b_ctx)
    assert r.articles and all(a["publisher"] == "HOT" and a["url"].startswith("https://production-raw-data-api.s3.amazonaws.com/ISO3/NPL/") for a in r.articles)
    assert all("/_layers/" not in a["url"] for a in r.articles)
    names = [a["title"] for a in r.articles]
    assert len(names) == len(set(names))                                              # one row per layer, formats collapsed
    assert any(a["url"].endswith("_geojson.zip") and "gpkg" in a["body"] for a in r.articles)
    assert _fig(r, "objects_updated_since_event", publisher="HOT")[0]["value"] >= len(r.articles)


def test_oam_bbox(w2b_ctx):
    r = _run("oam_bbox", w2b_ctx)
    assert r.articles and all(a["publisher"] == "OpenAerialMap" and a["published_at"] >= config.EVENT_START_UTC for a in r.articles)
    assert any("Vantor" in a["body"] and "satellite" in a["body"] for a in r.articles)
    assert _fig(r, "uploads_since_event")[0]["value"] == len(r.articles)
    assert _fig(r, "post_event_uav_uploads")[0]["value"] == 0
