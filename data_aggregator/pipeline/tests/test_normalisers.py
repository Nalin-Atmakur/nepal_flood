"""One fixture-backed test per wave-1 normaliser + a PII sweep over everything they emit."""
from __future__ import annotations

import json
from datetime import datetime, timezone

import pytest
import yaml

import normalisers as N
from lib import config
from normalisers import load_fixture
from normalisers import ndrrma_publications as NP

FIXTURES = {
    "opmcm_stats": "opmcm_stats.json", "opmcm_person_reports": "opmcm_person_reports.json",
    "ndrrma_rescues": "ndrrma_rescues.json", "ndrrma_publications": "ndrrma_publications.json",
    "bipad_river_stations": "bipad_river_stations.json", "mofa_flashflood": "mofa_flashflood.html",
    "dhm_weather": "dhm_weather.json", "openmeteo_corridor": "openmeteo_corridor.json", "usgs_fdsn": "usgs_fdsn.json",
    "gdacs_event": "gdacs_event.json", "hot_bridge_damage": "hot_bridge_damage.geojson",
    "reliefweb_rss": "reliefweb_rss.xml", "outlet_rss_set": "outlet_rss_set.json",
}
SOURCES = {s["id"]: s for s in yaml.safe_load(config.SOURCES_YAML.read_text())["sources"]}
PII_TOKENS = ("fullName", "thumbnail", "data:image", "Stanislav", "PU846865", "name_ne", "Passport no")


def _run(sid, ctx, now):
    mod = N.get(sid)
    assert mod is not None
    return mod.normalise(load_fixture(FIXTURES[sid]), now, SOURCES[sid], ctx)


def test_registry_covers_wave1():
    assert set(FIXTURES) <= set(N.registry())


@pytest.mark.parametrize("sid", sorted(FIXTURES))
def test_no_pii_in_output(sid, ctx, now):
    rows = _run(sid, ctx, now)
    blob = json.dumps(rows.figures + rows.articles + rows.gauges + rows.place_hints, ensure_ascii=False, default=str)
    for tok in PII_TOKENS:
        assert tok not in blob, f"{sid} leaked {tok}"
    for f in rows.figures:
        assert f["publisher"] and f["metric"] and isinstance(f["value"], (int, float))


def _fig(rows, metric, scope="national", publisher=None):
    return [f for f in rows.figures if f["metric"] == metric and f["scope"] == scope and (publisher is None or f["publisher"] == publisher)]


def test_opmcm_stats(ctx, now):
    r = _run("opmcm_stats", ctx, now)
    assert _fig(r, "lost")[0]["value"] == 10823
    assert _fig(r, "without_contact")[0]["value"] == 6062
    assert _fig(r, "help_requests")[0]["value"] == 232
    assert _fig(r, "help_offers")[0]["value"] == 107
    assert all(f["as_of"] == now for f in r.figures)


def test_opmcm_person_reports(ctx, now):
    r = _run("opmcm_person_reports", ctx, now)
    assert _fig(r, "lost_reports_total")[0]["value"] == 10823
    assert _fig(r, "found_reports_total")[0]["value"] == 2452
    assert _fig(r, "lost_reports_listed")[0]["value"] == 20
    assert any(f["scope"].startswith("place:") for f in r.figures)
    assert any("400" in n for n in r.notes)          # rescued type is refused by the portal
    assert all("fullName" not in json.dumps(h) for h in r.place_hints)


def test_opmcm_prestore_strips_identifiers():
    from normalisers import Part
    from normalisers import opmcm_person_reports as O
    body = json.dumps({"success": True, "data": {"items": [{"_id": "x", "fullName": "Example Person", "approximateAge": "40",
                       "description": "Passport no. - AB123456\nNationality - Ukraine", "images": ["/a.jpg"], "thumbnail": "data:image/jpeg;base64,xx",
                       "locationText": "Timure", "type": "lost", "status": "open"}], "total": 1}})
    out = O.prestore([Part(url="u?type=lost", body=body)], None)
    doc = json.loads(out[0].body)["data"]["items"][0]
    assert "fullName" not in doc and "description" not in doc and "images" not in doc and "thumbnail" not in doc
    assert doc["person_key"] and len(doc["person_key"]) == 64 and doc["key_strength"] == "passport"
    assert doc["nationality"] == "ukraine" and doc["has_photo"] is True and doc["age_band"] == "40-64"


def test_ndrrma_rescues(ctx, now):
    r = _run("ndrrma_rescues", ctx, now)
    assert _fig(r, "rescued_portal", publisher="NDRRMA")[0]["value"] == 6633
    assert _fig(r, "rescued_named")[0]["value"] == 2189
    assert _fig(r, "rescued_named_foreign")[0]["value"] == 155
    assert _fig(r, "rescued_named", "status:under_medical_care")[0]["value"] == 8
    hints = {h["text"]: h["place_id"] for h in r.place_hints}
    assert hints["टिमुरे"] == "timure" and hints["धुन्चे"] == "dhunche"
    assert hints["Syabrubesi Temporary Shelter"] == "syabrubesi_shelter"


def test_ndrrma_numbered_sitreps_are_never_filed_as_name_lists():
    """Sitrep #10's Nepali title contains "विवरण"; it was filed as PII and dropped, freezing the headline figures."""
    sitrep10 = {"id": 393, "title": "Rasuwa Flood Situation Report No. 10",
                "title_ne": "रसुवा बाढीसम्बन्धी खोज, उद्धार तथा राहतको स्थिति प्रतिवेदन विवरण",
                "publication_type": {"pub_type": "Situation Report"}}
    patients = {"id": 392, "title": "काठमाडौं ल्याइएको घाइतेहरुको विवरण", "publication_type": {"pub_type": "Notice"}}
    assert NP.is_pii_publication(sitrep10) is False and NP.is_sitrep(sitrep10) is True
    assert NP.is_pii_publication(patients) is True          # an actual list of people stays protected
    assert NP.is_pii_publication({"id": 373, "title": "x"}) is True   # the explicit id list still wins
    assert NP.sitrep_number("Situation Report No. 10") == 10
    assert NP.sitrep_number("स्थिति प्रतिवेदन # ११") == 11


def test_ndrrma_sitrep10_headline_figures():
    text = load_fixture("ndrrma_publications_sitrep10.txt").decode("utf-8")
    s = NP.parse_sitrep_text(text, title="Rasuwa Flood Situation Report No. 10", date="2026-08-31", url="u",
                             fetched_at=datetime(2026, 9, 2, tzinfo=timezone.utc), pub_id=393)
    got = {(f["metric"], f["scope"]): f["value"] for f in s.figures}
    # mixed Latin/Devanagari digits in the source: "9३९", "3,925", "5९२"
    assert got[("dead", "national")] == 939
    assert got[("missing", "national")] == 3925
    assert got[("rescued", "national")] == 11379
    assert got[("foreigners_missing", "national")] == 592
    assert s.figures[0]["as_of"].astimezone(config.KTM).strftime("%Y-%m-%d %H:%M") == "2026-08-31 19:00"


def test_ndrrma_english_sitrep_is_read_too():
    """NDRRMA publishes the same report in English; the Nepali patterns find nothing in it."""
    text = load_fixture("ndrrma_publications_sitrep11_en.txt").decode("utf-8")
    assert NP.looks_english(text) is True
    s = NP.parse_sitrep_text(text, title="Rasuwa_Flood_SitRep_Temp_ENG_01_01092026", date="2026-09-01", url="u",
                             fetched_at=datetime(2026, 9, 2, tzinfo=timezone.utc), pub_id=395)
    got = {f["metric"]: f["value"] for f in s.figures}
    assert got["missing"] == 3916 and got["rescued"] == 11814 and got["personnel"] == 21011
    assert s.figures[0]["as_of"].astimezone(config.KTM).strftime("%Y-%m-%d %H:%M") == "2026-09-01 09:00"
    # the Nepali edition must still parse as Nepali
    assert NP.looks_english(load_fixture("ndrrma_publications_sitrep8.txt").decode("utf-8")) is False


def test_ndrrma_publications_list_and_sitrep(ctx, now):
    r = _run("ndrrma_publications", ctx, now)
    assert len(r.articles) == 40 and all(a["publisher"] == "NDRRMA" for a in r.articles)
    assert any("download failed" in n for n in r.notes)      # fake fetch cannot serve PDFs
    text = load_fixture("ndrrma_publications_sitrep8.txt").decode("utf-8")
    s = NP.parse_sitrep_text(text, title="रसुवा भोटेकोशी बाढीसम्बन्धी खोज तथा उद्धारको स्थिति प्रतिवेदन #८", date="2026-08-29",
                             url="u", fetched_at=now, pub_id=388)
    got = {(f["metric"], f["scope"]): f["value"] for f in s.figures}
    assert got[("dead", "national")] == 675
    assert got[("missing", "national")] == 2498
    assert got[("rescued", "national")] == 7514
    assert got[("injured", "national")] == 242
    assert got[("dead", "district:chitwan")] == 246 and got[("dead", "district:rasuwa")] == 13
    assert got[("dead_sum_of_districts", "national")] == 675
    assert got[("shelter_people", "district:nuwakot")] == 2318 and got[("shelter_sites", "district:rasuwa")] == 12
    assert got[("foreigners_missing", "national")] == 589
    as_of = s.figures[0]["as_of"]
    assert as_of.astimezone(config.KTM).strftime("%Y-%m-%d %H:%M") == "2026-08-29 18:30"


def test_ndrrma_pii_detection():
    assert NP.is_pii_publication({"id": 373, "title": "x"})
    assert NP.is_pii_publication({"id": 999, "title": "List of Rescued Foreign citizens"})
    assert NP.is_pii_publication({"id": 999, "title": "हवाई उद्धार गरिएका नेपाली व्यक्तिहरुको विवरण"})
    assert not NP.is_pii_publication({"id": 388, "title": "Rasuwa Bhotekoshi Flood Situation Report #8"})


def test_bipad_river_stations(ctx, now):
    r = _run("bipad_river_stations", ctx, now)
    by_name = {g["station_name"]: g for g in r.gauges}
    assert by_name["Trishuli at Galchi"]["alive"] is True
    assert by_name["Bhotekoshi at Rasuwagadi"]["alive"] is False
    assert by_name["Bhotekoshi at Rasuwagadi"]["observed_at"].astimezone(config.KTM).strftime("%d %b %H:%M") == "26 Aug 08:40"
    assert by_name["Bhotekoshi at Rasuwagadi"]["warning"] == 6.0 and by_name["Bhotekoshi at Rasuwagadi"]["danger"] == 7.0
    assert by_name["Trishuli at Galchi"]["lat"] == pytest.approx(27.8023, abs=1e-3)
    assert _fig(r, "gauges_alive_corridor")[0]["value"] == 4
    assert _fig(r, "water_level_m", "place:rasuwagadhi")[0]["value"] == 1.62


def test_mofa_flashflood(ctx, now):
    r = _run("mofa_flashflood", ctx, now)
    got = {(f["metric"], f["scope"], f["as_of"].strftime("%d")): f["value"] for f in r.figures}
    assert got[("dead", "national", "28")] == 538
    assert got[("foreigners_total", "national", "28")] == 632
    assert got[("foreigners_missing", "national", "28")] == 511
    assert got[("foreigners_missing", "nationality:china", "28")] == 84
    assert got[("foreigners_total", "nationality:australia", "28")] == 35
    assert got[("dead", "national", "29")] == 626
    assert got[("rescued", "national", "29")] == 4450
    assert len(r.articles) == 2 and all(a["publisher"] == "MoFA" for a in r.articles)


def test_dhm_weather(ctx, now):
    r = _run("dhm_weather", ctx, now)
    assert _fig(r, "weather_warning_level", publisher="DHM")[0]["value"] == 2
    assert len(r.articles) == 3 and any(a["lang"] == "ne" for a in r.articles)
    assert "EXAMPLE-PERSON" not in json.dumps(r.articles, default=str)


def test_openmeteo_corridor(ctx, now):
    r = _run("openmeteo_corridor", ctx, now)
    sites = {f["scope"] for f in r.figures}
    assert sites == {"place:dhunche", "place:langtang_village"}
    fw = [f for f in r.figures if f["metric"].startswith("flying_window_quality")]
    assert 4 <= len(fw) <= 8 and all(f["value"] in (0, 1) for f in fw)
    assert all(f["as_of"] >= now.replace(hour=0) for f in r.figures)
    assert any(f["metric"] == "precip_mm" for f in r.figures) and any(f["metric"] == "low_cloud_pct" for f in r.figures)


def test_usgs_fdsn(ctx, now):
    r = _run("usgs_fdsn", ctx, now)
    ev = _fig(r, "seismic_event")
    assert {f["value"] for f in ev} == {5.2, 4.2}
    assert any("us7000tbwb" in f["note"] and "landslide" in f["note"] for f in ev)


def test_gdacs_event(ctx, now):
    r = _run("gdacs_event", ctx, now)
    assert _fig(r, "sendai_death")[0]["value"] == 359                      # highest of the cumulative Nepal rows
    assert _fig(r, "sendai_death", "country:china")[0]["value"] == 3      # "Fatalities in Gyirong Port" is Tibet-side
    assert _fig(r, "sendai_affected", "country:china")[0]["value"] == 558
    assert len(_fig(r, "sendai_affected")) == 1
    assert all("FL-2026-000167-NPL" in f["note"] for f in r.figures)


def test_hot_bridge_damage(ctx, now):
    r = _run("hot_bridge_damage", ctx, now)
    assert _fig(r, "bridges_washed_out")[0]["value"] == 39
    assert _fig(r, "bridges_damaged")[0]["value"] == 43
    assert _fig(r, "bridge_status", "place:rasuwagadhi")
    assert sum(1 for f in r.figures if f["metric"] == "bridge_status") == 59


def test_reliefweb_rss(ctx, now):
    r = _run("reliefweb_rss", ctx, now)
    assert len(r.articles) == 20
    a = r.articles[0]
    assert a["title"] == "Nepal: Rasuwa Flood Flash Update #3" and "ReliefWeb" in a["publisher"] and a["lang"] == "en"
    assert a["published_at"].isoformat().startswith("2026-08-28T15:07")


def test_outlet_rss_set(ctx, now):
    r = _run("outlet_rss_set", ctx, now)
    assert len(r.articles) >= 60   # gate tightened 30 Aug (district/Kathmandu-only headlines excluded): 81 of the fixture pass
    pubs = {a["publisher"] for a in r.articles}
    assert {"Onlinekhabar", "Kathmandu Post", "BBC Nepali", "Nepali Times"} <= pubs
    langs = {a["lang"] for a in r.articles}
    assert {"ne", "en"} <= langs
    assert len({a["url"] for a in r.articles}) == len(r.articles)
