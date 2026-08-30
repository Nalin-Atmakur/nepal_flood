"""Fixture-backed tests for the wave-4 normalisers (docs/pull_external_data/05d-sources-wave4.md)."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone

import pytest
import yaml

import normalisers as N
from lib import config
from normalisers import Context, load_fixture
from normalisers import bipad_incidents as BI
from normalisers import nrcs_situation_updates as NR
from normalisers import reliefweb_reports as RW

FIXTURES = {
    "nrcs_situation_updates": "w4_nrcs_home.html",
    "bipad_incidents": "w4_bipad_incidents.json",
    "outlet_rss_set_2": "w4_outlet_rss_set_2.json",
    "reliefweb_reports": "w4_reliefweb_rss.xml",
}
SOURCES = {s["id"]: s for s in yaml.safe_load(config.SOURCES_YAML.read_text())["sources"]}
NOW = datetime(2026, 8, 30, 4, 30, tzinfo=timezone.utc)
PHONE = re.compile(r"(?<![\d.])9[678]\d{8}(?![\d.])")


class _Fetched:
    def __init__(self, body: bytes, ok: bool = True):
        self.body, self.ok, self.status, self.error, self.last_modified = body, ok, 200 if ok else 404, None if ok else "http 404", None


def _fetch(url: str) -> _Fetched:
    if url.endswith(".pdf"):
        return _Fetched(b"%PDF-fake " + url.encode())  # pdf_text is monkeypatched in the NRCS test
    if "reliefweb.int/report/nepal/nepal-rasuwa-flood-flash-update-3" in url:
        return _Fetched(load_fixture("w4_reliefweb_page.html"))
    return _Fetched(b"", ok=False)


@pytest.fixture
def w4_ctx(gaz, state) -> Context:
    return Context(source_id="w4", fetch=_fetch, upload=None, state=state, gazetteer=gaz, dry_run=False)


def _run(sid, ctx, now=NOW):
    mod = N.get(sid)
    assert mod is not None, sid
    return mod.normalise(load_fixture(FIXTURES[sid]), now, SOURCES[sid], ctx)


def test_every_wave4_source_has_a_normaliser_and_fixture():
    reg = N.registry()
    for sid in FIXTURES:
        assert sid in reg, sid
        assert sid in SOURCES, sid
        assert (config.FIXTURE_DIR / FIXTURES[sid]).exists(), sid
    for sid in ("dao_downstream_hubs", "ntc_news", "moha_notices", "nea_notices", "ippan_statements"):
        assert sid in SOURCES and SOURCES[sid]["verified"] is False, sid  # registered candidates, not built


def test_reliefweb_reports_is_flagged_to_enrich_bodies():
    assert SOURCES["reliefweb_reports"].get("enrich_bodies") is True
    assert not any(s.get("enrich_bodies") for i, s in SOURCES.items() if i != "reliefweb_reports")


def test_fixtures_carry_no_phone_numbers():
    for name in list(FIXTURES.values()) + ["w4_nrcs_update3.txt", "w4_reliefweb_page.html"]:
        assert not PHONE.search(load_fixture(name).decode("utf-8", "replace")), name


# ── nrcs_situation_updates ───────────────────────────────────────────────────

def test_nrcs_parse_update_reads_the_quoted_ndrrma_numbers_and_the_date():
    parsed = NR.parse_update(load_fixture("w4_nrcs_update3.txt").decode())
    figs = dict((m, v) for m, v, _ in parsed["figures"])
    assert figs["dead_quoted"] == 579 and figs["missing_quoted"] == 1924 and figs["rescued_quoted"] == 4451
    assert figs["personnel_army_quoted"] == 6755 and figs["personnel_police_quoted"] == 4473 and figs["personnel_apf_quoted"] == 4203
    assert parsed["as_of"] == datetime(2026, 8, 28, 6, 15, tzinfo=timezone.utc)
    assert "Situation Overview" in parsed["excerpt"] and len(parsed["excerpt"]) <= 3000


def test_nrcs_pdf_links_newest_update_first_and_press_release_last():
    links = NR.pdf_links(load_fixture("w4_nrcs_home.html").decode())
    assert links[0].endswith("Rasuwa_Situation_Update_3.pdf")
    assert links[1].endswith("Rasuwa_Situation_Update_2.pdf")
    assert links[-1].endswith("Press_release_2083-5-10.pdf")
    assert len(links) == 4


def test_nrcs_normalise_emits_figures_for_updates_and_an_article_per_pdf(w4_ctx, monkeypatch):
    text = load_fixture("w4_nrcs_update3.txt").decode()
    monkeypatch.setattr(NR, "pdf_text", lambda body: text)
    rows = _run("nrcs_situation_updates", w4_ctx)
    assert len(rows.articles) == 4
    assert all(a["publisher"] == "Nepal Red Cross" and a["lang"] == "en" and a["body"] for a in rows.articles)
    titles = {a["title"] for a in rows.articles}
    assert "NRCS Rasuwa flood situation update #3" in titles and any(t.startswith("NRCS press release") for t in titles)
    dead = [f for f in rows.figures if f["metric"] == "dead_quoted"]
    assert dead and dead[0]["value"] == 579 and "NDRRMA" in dead[0]["note"] and dead[0]["publisher"] == "Nepal Red Cross"
    # the press release contributes an article but no headline figures
    assert not [f for f in rows.figures if "Press_release" in (f["url"] or "")]


def test_nrcs_without_fetch_context_only_notes(w4_ctx):
    mod = N.get("nrcs_situation_updates")
    rows = mod.normalise(load_fixture("w4_nrcs_home.html"), NOW, SOURCES["nrcs_situation_updates"], Context(source_id="t"))
    assert not rows.figures and not rows.articles and rows.notes


# ── bipad_incidents ──────────────────────────────────────────────────────────

def test_bipad_prestore_keeps_only_count_fields_and_identifiers():
    raw = {"results": [{"id": 1, "title": "Flood at Timure, Gosaikunda Rural Municipality-2", "incidentOn": "2026-08-26T00:00:00+05:45",
                        "createdBy": {"name": "EXAMPLE-PERSON-1"}, "detail": "call 9800000000",
                        "loss": {"peopleDeathCount": 3, "peopleMissingCount": 2, "description": "EXAMPLE-PERSON-2 lost", "estimatedLoss": 5}}]}
    out = BI.prestore([N.Part(url="u", body=json.dumps(raw))], None)
    body = out[0].body
    assert "EXAMPLE-PERSON" not in body and "9800000000" not in body and "estimatedLoss" not in body
    inc = json.loads(body)["results"][0]
    assert inc["loss"] == {"peopleDeathCount": 3, "peopleMissingCount": 2} and inc["title"].startswith("Flood at")


def test_bipad_split_title_and_hazard_filter():
    assert BI.split_title("Flood at Molung Rural Municipality-1") == ("flood", "Molung Rural Municipality-1")
    assert BI.split_title("Snake Bite at Buddhabhumi Municipality-8")[0] not in BI.FLOOD_HAZARDS
    assert BI.split_title("Landslide at Kodari, Jugal Rural Municipality-2")[0] in BI.FLOOD_HAZARDS


def test_bipad_normalise_counts_flood_family_incidents_and_sums(w4_ctx):
    rows = _run("bipad_incidents", w4_ctx)
    nat = {f["metric"]: f for f in rows.figures if f["scope"] == "national"}
    assert nat["bipad_flood_incidents"]["value"] == 15
    assert nat["bipad_flood_dead"]["value"] >= 0 and "not yet entered" in nat["bipad_flood_dead"]["note"]
    assert all(f["publisher"] == "BIPAD (NEOC)" for f in rows.figures)
    scoped = [f for f in rows.figures if f["scope"] != "national"]
    assert all(f["scope"].startswith(("place:", "incident:")) for f in scoped)
    assert rows.place_hints and all(h["kind"] == "incident" for h in rows.place_hints)
    # unrelated hazards (snake bite, fire, thunderbolt) never produce rows
    assert not [f for f in scoped if "snake" in (f["note"] or "").lower() or "fire" in (f["note"] or "").lower()]


# ── outlet_rss_set_2 ─────────────────────────────────────────────────────────

def test_outlet_rss_set_2_yields_gated_articles_from_every_feed(w4_ctx):
    rows = _run("outlet_rss_set_2", w4_ctx)
    assert rows.articles, "no articles"
    hosts = {re.sub(r"^www\.", "", a["url"].split("/")[2]) for a in rows.articles}
    assert len(hosts) >= 3, hosts
    assert all(a["source_id"] == "outlet_rss_set_2" and a["title"] and a["publisher"] for a in rows.articles)
    assert {a["lang"] for a in rows.articles} & {"en", "ne"}
    assert not any(PHONE.search((a["title"] or "") + (a["body"] or "")) for a in rows.articles)


# ── reliefweb_reports ────────────────────────────────────────────────────────

def test_reliefweb_report_links_from_the_feed():
    links = RW.report_links(load_fixture("w4_reliefweb_rss.xml").decode())
    assert 1 <= len(links) <= RW.MAX_REPORTS
    assert all("reliefweb.int/report/" in u for u in links)
    assert links[0].endswith("nepal-rasuwa-flood-flash-update-3")


def test_reliefweb_parse_report_reads_jsonld_and_body():
    rep = RW.parse_report(load_fixture("w4_reliefweb_page.html").decode(), "https://reliefweb.int/report/nepal/x")
    assert "Flash Update #3" in rep["title"]
    assert rep["published_at"] and rep["published_at"].date().isoformat() == "2026-08-28"
    assert rep["org"] == "UN"
    assert "Trishuli" in rep["body"] and len(rep["body"]) <= RW.MAX_BODY
    assert all(isinstance(v, int) for _, v in rep["figures"])


def test_reliefweb_normalise_fetches_pages_and_emits_articles(w4_ctx):
    rows = _run("reliefweb_reports", w4_ctx)
    assert len(rows.articles) == 1  # only the flash update is served by the fake fetch; the rest 404 → notes
    a = rows.articles[0]
    assert a["publisher"] == "UN (via ReliefWeb)" and a["lang"] == "en" and "Flash Update #3" in a["title"]
    assert a["published_at"].date().isoformat() == "2026-08-28"
    assert all(f["publisher"] == "UN (via ReliefWeb)" and f["metric"].endswith("_quoted") for f in rows.figures)
    assert rows.notes  # the 404s
