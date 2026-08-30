"""Fixture-backed tests for the wave-3 normalisers (docs/pull_external_data/05c-sources-wave3.md)."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone

import pytest
import yaml

import normalisers as N
from lib import config
from normalisers import Context, load_fixture
from normalisers import _geo
from normalisers import opmcm_help_requests as HR
from normalisers import outlet_tag_pages as OT

FIXTURES = {
    "opmcm_help_requests": "w3_opmcm_help_requests.json", "opmcm_government_efforts": "w3_opmcm_government_efforts.json",
    "bipad_river_series": "w3_bipad_river_series.json", "nesra_bridges": "w3_nesra_bridges.json",
    "dor_rimes_bridges": "w3_dor_rimes_bridges.json", "microsoft_unosat_extent": "w3_microsoft_unosat_extent.json",
    "outlet_tag_pages": "w3_outlet_tag_pages.json", "gdelt_monitor": "w3_gdelt_monitor.json",
    "vantor_stac": "w3_vantor_stac.json", "planet_stac": "w3_planet_stac.json",
    "cdse_catalogue": "w3_cdse_catalogue.json", "hf_fair_footprints": "w3_hf_fair_footprints.json",
}
SOURCES = {s["id"]: s for s in yaml.safe_load(config.SOURCES_YAML.read_text())["sources"]}
W3_NOW = datetime(2026, 8, 30, 3, 0, tzinfo=timezone.utc)
PHONE = re.compile(r"(?<![\d.])9[678]\d{8}(?![\d.])")


class _Fetched:
    def __init__(self, body: bytes, ok: bool = True):
        self.body, self.ok, self.status, self.error, self.last_modified = body, ok, 200 if ok else 404, None if ok else "http 404", None

    @property
    def text(self) -> str:
        return self.body.decode("utf-8")


def _fetch(url: str) -> _Fetched:
    if "vantor-opendata" in url and url.endswith(".json") and "collection.json" not in url:
        return _Fetched(load_fixture("w3_vantor_item_post.json" if "B" in url.rsplit("/", 1)[-1][:1] else "w3_vantor_item_pre.json"))
    if url.endswith("post-event/catalog.json"):
        return _Fetched(load_fixture("w3_planet_post_catalog.json"))
    if url.endswith("pre-event/catalog.json"):
        return _Fetched(load_fixture("w3_planet_pre_catalog.json"))
    if url.endswith("/collection.json") and "planet" in url:
        return _Fetched(load_fixture("w3_planet_collection.json"))
    return _Fetched(b"", ok=False)


@pytest.fixture
def w3_ctx(gaz, state) -> Context:
    return Context(source_id="w3", fetch=_fetch, upload=None, state=state, gazetteer=gaz, dry_run=False)


def _run(sid, ctx, now=W3_NOW):
    mod = N.get(sid)
    assert mod is not None, sid
    return mod.normalise(load_fixture(FIXTURES[sid]), now, SOURCES[sid], ctx)


def _fig(rows, metric, scope="national", publisher=None):
    return [f for f in rows.figures if f["metric"] == metric and f["scope"] == scope and (publisher is None or f["publisher"] == publisher)]


def test_every_wave3_source_has_a_normaliser_and_fixture():
    reg = N.registry()
    for sid in FIXTURES:
        assert sid in reg, sid
        assert sid in SOURCES, sid
        assert (config.FIXTURE_DIR / FIXTURES[sid]).exists(), sid


# ── opmcm_help_requests ──────────────────────────────────────────────────────

def test_help_requests_prestore_drops_identifiers_and_keeps_place_ids(gaz):
    raw = {"success": True, "data": {"total": 1, "page": 1, "limit": 200, "items": [{
        "_id": "x", "referenceId": "REQ-1", "reporterName": "EXAMPLE-PERSON-1", "phone": "9800000000",
        "title": "Timure ma flood", "description": "Call 9811111111, my uncle EXAMPLE-PERSON-2 is at Syabrubesi",
        "thumbnail": "data:image/jpeg;base64,AAAA", "problemType": "FLOOD", "helpTypes": ["RESCUE"], "affectedCount": 3,
        "urgency": "CRITICAL", "status": "OPEN", "district": "Rasuwa", "placeName": "Timure, Rasuwa",
        "location": {"type": "Point", "coordinates": [85.38, 28.27]}, "createdAt": "2026-08-29T10:00:00Z"}]}}
    ctx = Context(source_id="t", gazetteer=gaz)
    out = HR.prestore([N.Part(url="u", body=json.dumps(raw))], ctx)
    body = out[0].body
    for tok in ("EXAMPLE-PERSON", "9800000000", "9811111111", "thumbnail", "base64", "Call "):
        assert tok not in body
    it = json.loads(body)["data"]["items"][0]
    assert "title" not in it and "description" not in it and "reporterName" not in it and "phone" not in it
    assert "timure" in it["place_ids"] and it["affectedCount"] == 3 and it["urgency"] == "CRITICAL"


def test_help_requests_fixture_is_clean_and_counts_per_place(w3_ctx):
    body = load_fixture(FIXTURES["opmcm_help_requests"]).decode()
    assert not PHONE.search(body) and "reporterName" not in body and "thumbnail" not in body
    rows = _run("opmcm_help_requests", w3_ctx)
    assert not rows.articles and not rows.gauges
    tot = _fig(rows, "people_affected_reported")
    assert len(tot) == 1 and tot[0]["value"] > 0 and tot[0]["publisher"] == "OPMCM portal"
    # national help_requests_open is opmcm_stats' — must NOT be emitted here
    assert not _fig(rows, "help_requests_open")
    place_open = [f for f in rows.figures if f["metric"] == "help_requests_open" and f["scope"].startswith("place:") and f["scope"] != "place:unresolved"]
    assert place_open, "expected open requests resolved to gazetteer places"
    for f in rows.figures:
        assert f["as_of"] == W3_NOW and f["url"].startswith("https://rescue.opmcm.gov.np/")
        assert re.fullmatch(r"(national|place:[a-z0-9_:]+|district:[a-z0-9_]+|problem:[a-z0-9_]+|help:[a-z0-9_]+)", f["scope"]), f["scope"]
    crit = [f for f in rows.figures if f["metric"] == "help_requests_critical" and f["scope"].startswith("problem:")]
    assert crit and all(f["value"] >= 0 for f in crit)


def test_help_requests_resolution_order(gaz):
    ctx = Context(source_id="t", gazetteer=gaz)
    # text wins over the point (a Kathmandu reporter asking about Timure)
    it = {"place_ids": ["timure"], "location": {"type": "Point", "coordinates": [85.28, 27.69]}, "district": "Rasuwa"}
    assert HR.resolve_item(it, ctx)[0] == "timure"
    # no text → nearest corridor place to the point
    it = {"place_ids": [], "location": {"type": "Point", "coordinates": [85.34, 28.16]}, "district": ""}
    pid, _ = HR.resolve_item(it, ctx)
    assert pid is not None and pid not in ("kathmandu",)
    # a Kathmandu point with no text resolves to no place (generic city excluded)
    it = {"place_ids": [], "location": {"type": "Point", "coordinates": [85.32, 27.71]}, "district": ""}
    assert HR.resolve_item(it, ctx)[0] is None


# ── opmcm_government_efforts ─────────────────────────────────────────────────

def test_government_efforts_articles(w3_ctx):
    rows = _run("opmcm_government_efforts", w3_ctx)
    assert rows.articles, "expected relevance-gated notices"
    urls = [a["url"] for a in rows.articles]
    assert len(urls) == len(set(urls))
    for a in rows.articles:
        assert a["url"].startswith("https://") and a["lang"] in ("ne", "en", "hi") and a["published_at"] is not None
        assert a["publisher"] == "Nepal Govt portal (via OPMCM)"
    assert _fig(rows, "government_notices_total", publisher="OPMCM portal")[0]["value"] == 94


# ── bipad_river_series ───────────────────────────────────────────────────────

def test_river_series_gauges(w3_ctx):
    rows = _run("bipad_river_series", w3_ctx)
    assert rows.gauges and not rows.figures
    keys = {(g["station_id"], g["observed_at"]) for g in rows.gauges}
    assert len(keys) == len(rows.gauges)
    assert all(g["station_id"].startswith("bipad-") and g["level"] is not None for g in rows.gauges)
    assert all(g["alive"] is False for g in rows.gauges)   # fixture readings are from 26 Aug, "now" is 30 Aug
    assert any("http 500" in n for n in rows.notes)


# ── bridges ──────────────────────────────────────────────────────────────────

def test_nesra_bridges_delegates_to_nesra_bucket(w3_ctx):
    rows = _run("nesra_bridges", w3_ctx)
    nat = _fig(rows, "bridges_to_inspect")
    assert nat and nat[0]["value"] == 62 and nat[0]["source_id"] == "nesra_bridges"
    assert all(f["source_id"] == "nesra_bridges" for f in rows.figures)


def test_dor_bridges_corridor_inventory(w3_ctx):
    rows = _run("dor_rimes_bridges", w3_ctx)
    nat = _fig(rows, "road_bridges_inventory")
    assert nat and nat[0]["value"] == 30
    per_place = [f for f in rows.figures if f["scope"].startswith("place:")]
    assert per_place and sum(f["value"] for f in per_place) <= 30
    assert all(f["publisher"] == "DoR (RIMES bridge inventory)" for f in rows.figures)


def test_geo_helpers(gaz):
    assert abs(_geo.haversine_km(28.0, 85.0, 28.0, 85.0)) < 1e-9
    assert 9 < _geo.haversine_km(28.0, 85.0, 28.0, 85.1) < 11
    assert _geo.centroid({"type": "LineString", "coordinates": [[85.0, 28.0], [85.2, 28.2]]}) == (28.1, 85.1)
    assert _geo.centroid({"type": "Point", "coordinates": []}) is None
    hit = _geo.nearest_place(gaz, 28.27, 85.38, max_km=8)
    assert hit is not None and hit[0].startswith(("timure", "rasuwagadhi", "ghattekhola"))
    assert _geo.nearest_place(gaz, 10.0, 10.0, max_km=8) is None


# ── unosat ───────────────────────────────────────────────────────────────────

def test_unosat_extent(w3_ctx):
    rows = _run("microsoft_unosat_extent", w3_ctx)
    f = _fig(rows, "flood_extent_km2")
    assert len(f) == 1 and 37 < f[0]["value"] < 38 and "bbox" in f[0]["note"]


# ── outlet tag pages ─────────────────────────────────────────────────────────

def test_outlet_tag_pages_articles(w3_ctx):
    rows = _run("outlet_tag_pages", w3_ctx)
    pubs = {a["publisher"] for a in rows.articles}
    assert {"Kathmandu Post", "The Himalayan Times", "Onlinekhabar English", "Gorkhapatra"} <= pubs, pubs
    assert any("inseconline.org" in a["url"] for a in rows.articles)
    urls = [a["url"] for a in rows.articles]
    assert len(urls) == len(set(urls))
    kp = [a for a in rows.articles if a["publisher"] == "Kathmandu Post"]
    assert kp and all(a["published_at"] is not None for a in kp)
    assert all(len(a["title"]) >= OT.MIN_TITLE for a in rows.articles)
    assert not any(re.search(r"/tags?/|/categories/|\?s=", a["url"]) for a in rows.articles)


def test_outlet_candidates_and_dates():
    html = ('<a href="/national/2026/08/30/nepali-army-rescues-2-697-people"><img alt="x"></a>'
            '<a href="/national/2026/08/30/nepali-army-rescues-2-697-people">Nepali Army rescues 2,697 people from flood-hit Rasuwa</a>'
            '<a href="/tags/rasuwa-flood?page=2">Next</a><a href="https://other.com/national/2026/08/30/abcdefghij">Elsewhere long title here</a>')
    c = OT.candidates(html, "https://kathmandupost.com/tags/rasuwa-flood?page=1")
    assert list(c) == ["https://kathmandupost.com/national/2026/08/30/nepali-army-rescues-2-697-people"]
    assert c[next(iter(c))].startswith("Nepali Army rescues")
    assert OT.published_from_path(next(iter(c))) == datetime(2026, 8, 30, tzinfo=timezone.utc)
    assert OT.published_from_path("https://gorkhapatraonline.com/news/220488") is None


# ── gdelt ────────────────────────────────────────────────────────────────────

def test_gdelt_articles_and_volume(w3_ctx):
    rows = _run("gdelt_monitor", w3_ctx)
    assert rows.articles and all(a["published_at"] is not None for a in rows.articles)
    assert all(a["lang"] in ("en", "ne", "hi", "zh") for a in rows.articles)
    vol = _fig(rows, "gdelt_articles_24h", publisher="GDELT")
    assert vol and vol[0]["value"] == 40 and "relevant" in vol[0]["note"]
    from normalisers.gdelt_monitor import seendate
    assert seendate("20260829T120000Z") == datetime(2026, 8, 29, 12, 0, tzinfo=timezone.utc)
    assert seendate("garbage") is None


# ── imagery catalogues ───────────────────────────────────────────────────────

def test_vantor_scene_counts(w3_ctx):
    rows = _run("vantor_stac", w3_ctx)
    tot = _fig(rows, "imagery_scenes_total", publisher="Vantor Open Data")
    post = _fig(rows, "imagery_scenes_post_event", publisher="Vantor Open Data")
    assert tot and tot[0]["value"] == 13
    assert post and 0 < post[0]["value"] < 13 and "latest post-event scene" in post[0]["note"]
    assert post[0]["as_of"] >= datetime(2026, 8, 26, tzinfo=timezone.utc)


def test_vantor_without_fetch_still_counts(gaz, state):
    rows = _run("vantor_stac", Context(source_id="w3", gazetteer=gaz, state=state))
    assert _fig(rows, "imagery_scenes_total")[0]["value"] == 13 and not _fig(rows, "imagery_scenes_post_event")


def test_planet_scene_counts(w3_ctx):
    rows = _run("planet_stac", w3_ctx)
    assert _fig(rows, "imagery_collections", publisher="Planet")[0]["value"] >= 3   # fake fetch answers every collection.json
    tot = _fig(rows, "imagery_scenes_total")[0]["value"]
    post = _fig(rows, "imagery_scenes_post_event")[0]
    assert tot >= post["value"] > 0 and "pelican" in post["note"]
    assert post["as_of"].date().isoformat() == "2026-08-27"


def test_cdse_products(w3_ctx):
    rows = _run("cdse_catalogue", w3_ctx)
    f = _fig(rows, "s2_products_since_event", publisher="Copernicus Data Space")
    assert f and f[0]["value"] == 12 and f[0]["note"].startswith("latest S2")
    d = _fig(rows, "s2_acquisition_dates")
    assert d and d[0]["value"] >= 2 and "2026-08-29" in d[0]["note"]


def test_hf_dataset_freshness(w3_ctx):
    rows = _run("hf_fair_footprints", w3_ctx)
    f = _fig(rows, "dataset_files", publisher="HOT fAIr (Hugging Face)")
    assert f and f[0]["value"] == 7 and "Nepal Flood 2026" in f[0]["note"]   # 7 parquet/geojson of 12 files
    assert f[0]["as_of"] == datetime(2026, 8, 27, 7, 32, 24, tzinfo=timezone.utc)
    assert _fig(rows, "dataset_downloads")[0]["value"] == 53


# ── cross-cutting ────────────────────────────────────────────────────────────

@pytest.mark.parametrize("sid", sorted(FIXTURES))
def test_no_pii_and_well_formed(sid, w3_ctx):
    rows = _run(sid, w3_ctx)
    blob = json.dumps(rows.figures + rows.articles + rows.gauges + rows.place_hints, default=str, ensure_ascii=False)
    assert not PHONE.search(blob), sid
    assert "EXAMPLE-PERSON" not in blob and "base64" not in blob
    for f in rows.figures:
        assert f["publisher"] and f["metric"] and isinstance(f["value"], (int, float)) and f["source_id"] == sid
    for a in rows.articles:
        assert a["url"].startswith("http") and a["title"] and a["source_id"] == sid
