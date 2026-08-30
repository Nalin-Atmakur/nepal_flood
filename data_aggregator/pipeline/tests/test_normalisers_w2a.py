"""Fixture-backed tests for the wave-2 official/government normalisers (docs/pull_external_data/05a-sources-wave2-official.md)."""
from __future__ import annotations

import json
from datetime import datetime, timezone

import pytest
import yaml

import normalisers as N
from lib import config
from lib.places import Gazetteer
from lib.state import State
from normalisers import Context, Part, load_fixture
from normalisers._rss import is_relevant

FIXTURES = {
    "setu_recordlist": "w2a_setu_recordlist.json", "police_udb": "w2a_police_udb.json",
    "volunteer_bulletin_repo": "w2a_volunteer_bulletin_repo.json", "heoc_sitreps": "w2a_heoc_sitreps.html",
    "dao_nuwakot_rescued": "w2a_dao_nuwakot_rescued.html", "dao_rasuwa_hub": "w2a_dao_rasuwa_hub.html",
    "ifrc_go": "w2a_ifrc_go.json", "china_mwr": "w2a_china_mwr.html", "china_mfa_pressers": "w2a_china_mfa_pressers.html",
    "us_embassy_alerts": "w2a_us_embassy_alerts.html", "ndrrma_newsinfo": "w2a_ndrrma_newsinfo.json",
    "ndrrma_bulletins": "w2a_ndrrma_bulletins.json",
}
SOURCES = {s["id"]: s for s in yaml.safe_load(config.SOURCES_YAML.read_text())["sources"]}
PII_TOKENS = ("EXAMPLE-PERSON", "EXAMPLE-REPORTER", "98XXXXXXXX", "REDACTED", "deadbody/", '"name"', "fullName", "contact")
FETCH_MAP = [  # url substring → fixture (served by the fake fetcher below)
    ("recordlist.php?page=2", "w2a_setu_recordlist_p18.html"),
    ("get-district/3", "w2a_police_udb_dist3.json"), ("get-district/4", "w2a_police_udb_dist4.json"),
    ("get-district/5", "w2a_police_udb_dist5.json"),
    ("district_id=29&", "w2a_police_udb_rasuwa.html"), ("district_id=35&", "w2a_police_udb_chitwan.html"),
    ("sitrep-00/detail", "w2a_heoc_sitreps_detail.html"), (".xlsx", "w2a_dao_nuwakot_rescued.xlsx"),
    ("appeal_document/?appeal=4462", "w2a_ifrc_go_appealdoc.json"),
    ("t20260827_2140605", "w2a_china_mwr_2140605.html"), ("t20260830_2140823", "w2a_china_mwr_2140823.html"),
    ("t20260828_12012299", "w2a_china_mfa_pressers_0828.html"),
    ("natural-disaster-alert-continued-flood-risk", "w2a_us_embassy_alerts_0829.html"),
]


class FakeFetched:
    def __init__(self, body: bytes = b"", ok: bool = True, status: int = 200):
        self.body, self.ok, self.status = body, ok, status
        self.error = None if ok else "http 404"

    @property
    def text(self) -> str:
        return self.body.decode("utf-8", errors="replace")


def w2a_fetch(url: str, **_: object) -> FakeFetched:
    for needle, fx in FETCH_MAP:
        if needle in url:
            return FakeFetched(load_fixture(fx))
    return FakeFetched(b"", ok=False, status=404)


@pytest.fixture
def w2a_ctx(tmp_path):
    uploads: dict[str, bytes] = {}

    def upload(path: str, body: bytes, ct: str) -> str:
        uploads[path] = body
        return "raw/" + path
    c = Context(source_id="test", fetch=w2a_fetch, upload=upload, state=State(tmp_path / "_state.json"),
                gazetteer=Gazetteer.builtin(), dry_run=False)
    c.uploads = uploads  # type: ignore[attr-defined]
    return c


def _run(sid, ctx, now):
    mod = N.get(sid)
    assert mod is not None
    return mod.normalise(load_fixture(FIXTURES[sid]), now, SOURCES[sid], ctx)


def _fig(rows, metric, scope="national", publisher=None):
    return [f for f in rows.figures if f["metric"] == metric and f["scope"] == scope and (publisher is None or f["publisher"] == publisher)]


def _ktm(dt: datetime) -> str:
    return dt.astimezone(config.KTM).strftime("%Y-%m-%d %H:%M")


def test_registry_covers_wave2_official():
    assert set(FIXTURES) <= set(N.registry())
    for sid in FIXTURES:
        assert N.get(sid).SOURCE_ID == sid


@pytest.mark.parametrize("sid", sorted(FIXTURES))
def test_no_pii_in_output(sid, w2a_ctx, now):
    rows = _run(sid, w2a_ctx, now)
    blob = json.dumps(rows.figures + rows.articles + rows.gauges + rows.place_hints + rows.notes, ensure_ascii=False, default=str)
    for tok in PII_TOKENS:
        assert tok not in blob, f"{sid} leaked {tok}"
    for f in rows.figures:
        assert f["publisher"] and f["metric"] and f["scope"] and f["url"] and f["as_of"] is not None
        assert isinstance(f["value"], (int, float)) and not isinstance(f["value"], bool)
    for a in rows.articles:
        assert a["url"].startswith("http") and a["title"] and a["publisher"]


# ── 1. setu ──────────────────────────────────────────────────────────────────

def test_setu_recordlist_counts_and_paging(w2a_ctx, now):
    r = _run("setu_recordlist", w2a_ctx, now)
    got = {(f["metric"], f["scope"]): f["value"] for f in r.figures}
    assert got[("missing", "national")] == 95                     # page 1 (95) + page 2 (0)
    assert got[("found_safe", "national")] == 4 + 23
    assert got[("rescued", "national")] == 16 and got[("found_injured", "national")] == 5 and got[("found_dead", "national")] == 4
    assert got[("found", "national")] == 27 + 5 + 4
    assert got[("records_total", "national")] == 99 + 48
    assert any(s.startswith("source:dao_") for _, s in got)
    assert any("counts are partial" in n for n in r.notes)        # pages 3–18 are 404 in the fake fetcher
    assert all(f["as_of"] == now and f["publisher"] == "Setu (NDRRMA)" for f in r.figures)


def test_setu_prestore_projects_names_out():
    from normalisers import setu_recordlist as S
    html = ('<span class="cur">1</span><a href="recordlist.php?page=2">2</a><script>var REC = [{"name":"Example Person","gender":"Male",'
            '"age":31,"loc":"Timure, Rasuwa","status":"Missing","source":"DAO Kaski","verified":true,"contact":"9841234567",'
            '"reporter":"Some Relative","repcon":"9851234567","details":"x","when":"Aug 28, 2026","time":"5:54 PM"}];</script>')
    out = S.prestore([Part(url=S.BASE, body=html)], None)[0]
    doc = json.loads(out.body)
    rec = doc["records"][0]
    assert doc["pages"] == 2 and rec["status"] == "Missing" and rec["age_band"] == "18-39" and len(rec["person_key"]) == 64
    for tok in ("Example Person", "Some Relative", "9841234567", "9851234567"):
        assert tok not in out.body


# ── 2. police udb ────────────────────────────────────────────────────────────

def test_police_udb_counts(w2a_ctx, now):
    r = _run("police_udb", w2a_ctx, now)
    got = {(f["metric"], f["scope"]): f["value"] for f in r.figures}
    assert got[("bodies_recorded", "national")] == 560
    assert got[("missing_recorded", "national")] == 57
    assert got[("found_recorded", "national")] == 0
    assert got[("bodies_recorded", "district:rasuwa")] == 5 and got[("bodies_recorded", "district:chitwan")] == 117
    assert got[("bodies_recorded_sum_of_districts", "national")] == 122
    assert sum(1 for n in r.notes if n.startswith("district ")) >= 8      # the other districts 404 in the fake fetcher
    assert all(f["publisher"] == "Nepal Police (UDB)" for f in r.figures)


def test_police_udb_prestore_projection():
    from normalisers import police_udb as P
    html = ('<a href="/x?count=560&page=2">2</a> Showing 1 out of 28 Pages <tbody><tr><td><img src="/deadbody/photo/1"></td><td>Somebody</td></tr></tbody>')
    out = P.prestore([Part(url=f"{P.BASE}/dead-bodies-lists?date_from=2026-08-26", body=html)], None)[0]
    d = json.loads(out.body)
    assert d == {"section": "dead-bodies-lists", "url": out.url, "date_from": "2026-08-26", "count": 560, "pages": 28, "rows": 1}
    empty = P.parse_list_page('<tbody><tr><td colspan="4">No record found</td></tr></tbody>')
    assert empty == {"count": 0, "pages": 0, "rows": 0}


# ── 3. volunteer bulletin ────────────────────────────────────────────────────

def test_volunteer_bulletin_repo(w2a_ctx, now):
    r = _run("volunteer_bulletin_repo", w2a_ctx, now)
    got = {(f["metric"], f["scope"]): f["value"] for f in r.figures}
    assert got[("rescued_named_listed", "national")] == 2189
    assert got[("heli_rescued_listed", "national")] == 654
    assert got[("foreigners_rescued_listed", "national")] == 152
    assert got[("hospital_dhunche_listed", "national")] == 79      # csv.reader: two rows hold quoted line breaks
    assert got[("repo_files", "national")] >= 20
    levels = [f for f in r.figures if f["metric"] == "water_level_m"]
    assert len(levels) == 5 and all(f["scope"].startswith("station:") and f["as_of"] != now for f in levels)
    assert any(f["scope"].startswith("place:") for f in r.figures if f["metric"] == "rescued")
    assert all(f["publisher"] == "Volunteer bulletin (nirajbhusal)" for f in r.figures)


def test_volunteer_bulletin_prestore_drops_rows():
    from normalisers import volunteer_bulletin_repo as V
    csv_text = "sn,id,name,name_ne,age,gender,nationality,country,location,remarks,status,rescued_date\n" \
               "1,9,Example Person,उदाहरण,33,Male,Nepali,Nepal,Timure,called home,Rescued,2026-08-27\n" \
               "2,10,Another Person,,40,Female,Indian,India,Dhunche,,Rescued,2026-08-27\n"
    out = V.prestore([Part(url="https://raw.githubusercontent.com/x/main/ndrrma-rescue.csv", body=csv_text)])[0]
    d = json.loads(out.body)
    assert d["rows"] == 2 and d["counts"]["location"] == {"Timure": 1, "Dhunche": 1} and d["counts"]["country"]["India"] == 1
    assert "Example Person" not in out.body and "called home" not in out.body and "name" not in d["counts"]


# ── 4. heoc ──────────────────────────────────────────────────────────────────

def test_heoc_sitreps(w2a_ctx, now):
    r = _run("heoc_sitreps", w2a_ctx, now)
    by_url = {a["url"]: a for a in r.articles}
    feat = by_url["https://heoc.mohp.gov.np/news/sitrep-00/detail"]
    assert feat["title"].startswith("SitRep 04") and _ktm(feat["published_at"]) == "2026-08-29 12:00"
    assert len(r.articles) >= 5 and all(a["publisher"] == "HEOC/MoHP" and a["body"] is None for a in r.articles)
    others = [a for a in r.articles if a["url"] != feat["url"]]
    assert all(a["published_at"] is not None and a["published_at"].year == 2026 for a in others)
    assert any("not OCR'd" in n for n in r.notes)
    assert is_relevant(feat["title"], None, w2a_ctx.gazetteer)


# ── 5. dao nuwakot ───────────────────────────────────────────────────────────

def test_dao_nuwakot_rescued(w2a_ctx, now):
    r = _run("dao_nuwakot_rescued", w2a_ctx, now)
    got = {(f["metric"], f["scope"]): f["value"] for f in r.figures}
    assert got[("rescued", "national")] == 12 and got[("rescued_foreign", "national")] == 5
    assert got[("rescued", "place:nuwakot")] == 5 and got[("rescued", "place:betrawati")] == 3 and got[("rescued", "place:dhunche")] == 2
    assert sorted(v for (m, s), v in got.items() if m == "rescued_foreign" and s.startswith("nationality:")) == [2, 3]
    assert all(_ktm(f["as_of"]) == "2026-08-28 00:00" and f["publisher"] == "DAO Nuwakot" for f in r.figures)
    assert list(w2a_ctx.uploads) and list(w2a_ctx.uploads)[0].startswith("dao_nuwakot/") and list(w2a_ctx.uploads)[0].endswith(".xlsx")
    assert len(r.articles) == 1 and is_relevant(r.articles[0]["title"], r.articles[0]["body"], w2a_ctx.gazetteer)


def test_dao_nuwakot_links_prefer_direct_file():
    from normalisers import dao_nuwakot_rescued as D
    links = D.find_xlsx_links(load_fixture("w2a_dao_nuwakot_rescued.html").decode("utf-8"))
    assert links and "/upload/" in links[0] and all(l.endswith(".xlsx") for l in links)


# ── 6. dao rasuwa ────────────────────────────────────────────────────────────

def test_dao_rasuwa_hub(w2a_ctx, now):
    r = _run("dao_rasuwa_hub", w2a_ctx, now)
    assert len(r.articles) == 3 and all(a["publisher"] == "DAO Rasuwa" and a["lang"] == "ne" for a in r.articles)
    hub = r.articles[0]
    assert hub["url"] == SOURCES["dao_rasuwa_hub"]["url"] and _ktm(hub["published_at"]) == "2026-08-29 15:12"
    dates = sorted(_ktm(a["published_at"]) for a in r.articles[1:])
    assert dates == ["2026-08-27 12:00", "2026-08-29 12:00"]            # 2083-05-11 / 2083-05-13
    assert all(is_relevant(a["title"], a["body"], w2a_ctx.gazetteer) for a in r.articles)


# ── 7. ifrc ──────────────────────────────────────────────────────────────────

def test_ifrc_go(w2a_ctx, now):
    r = _run("ifrc_go", w2a_ctx, now)
    got = {(f["metric"], f["scope"]): f["value"] for f in r.figures}
    assert got[("appeal_amount_requested_chf", "national")] == 18_000_000
    assert got[("appeal_amount_funded_chf", "national")] == 0 and got[("appeal_beneficiaries", "national")] == 28_000
    assert all("MDRNP022" in f["note"] and "FF-2026-000162-NPL" in f["note"] for f in r.figures)
    assert all(f["as_of"].isoformat().startswith("2026-08-29T05:54") for f in r.figures)
    urls = {a["url"] for a in r.articles}
    assert urls == {"https://go.ifrc.org/emergencies/8073", "https://go.ifrc.org/reports/18558", "https://go-api.ifrc.org/api/DownloadFile/96511/MDRNP022EA"}
    assert all(is_relevant(a["title"], a["body"], w2a_ctx.gazetteer) for a in r.articles)


# ── 8–9. china ───────────────────────────────────────────────────────────────

def test_china_mwr(w2a_ctx, now):
    from normalisers import china_mwr as M
    r = _run("china_mwr", w2a_ctx, now)
    assert len(r.articles) == 5 and all(a["lang"] == "zh" and a["publisher"] == "China MWR" for a in r.articles)
    by_url = {a["url"]: a for a in r.articles}
    lake = by_url["http://www.mwr.gov.cn/xw/slyw/202608/t20260827_2140605.html"]
    assert lake["published_at"] == datetime(2026, 8, 27, 14, 57, 20, tzinfo=timezone.utc) and "堰塞湖" in lake["body"]
    assert sum(1 for a in r.articles if a["body"]) == 2                     # two detail pages served; the rest 404 → listing date only
    assert w2a_ctx.state.seen("china_mwr", "pages") == {lake["url"], "http://www.mwr.gov.cn/xw/slyw/202608/t20260830_2140823.html"}
    assert not r.figures                                                    # no volume stated in these two bulletins
    assert M.volumes("堰塞湖蓄水量约200万立方米，仍在上涨") == [(2_000_000.0, "堰塞湖蓄水量约200万立方米", "barrier_lake_volume_m3")]
    assert M.volumes("总量超过2.5亿立方米") == [(250_000_000.0, "总量超过2.5亿立方米", "barrier_lake_volume_m3")]
    assert M.volumes("堰塞湖未来3天入湖水量约300万立方米") == [(3_000_000.0, "堰塞湖未来3天入湖水量约300万立方米", "barrier_lake_inflow_m3")]


def test_china_mfa_pressers(w2a_ctx, now):
    r = _run("china_mfa_pressers", w2a_ctx, now)
    assert len(r.articles) == 1
    a = r.articles[0]
    assert a["url"].endswith("t20260828_12012299.html") and "Gyirong" in a["body"] and a["lang"] == "en"
    assert a["published_at"] == datetime(2026, 8, 27, 16, 0, tzinfo=timezone.utc)       # PubDate 2026-08-28 CST
    assert is_relevant(a["title"], a["body"], w2a_ctx.gazetteer) and not is_relevant(a["title"], None, w2a_ctx.gazetteer)
    assert sum(1 for n in r.notes if "404" in n) == 2                                 # 26 / 27 Aug pressers not served


# ── 10. us embassy ───────────────────────────────────────────────────────────

def test_us_embassy_alerts(w2a_ctx, now):
    r = _run("us_embassy_alerts", w2a_ctx, now)
    assert len(r.articles) == 9 and all(a["publisher"] == "US Embassy Kathmandu" and a["lang"] == "en" for a in r.articles)
    first = r.articles[0]
    assert first["title"] == "Natural Disaster Alert: Continued Flood Risk and Travel Disruptions" and _ktm(first["published_at"]) == "2026-08-29 12:00"
    assert " " not in json.dumps(r.articles, default=str)
    assert "Rasuwagadhi" in first["body"] and "Assistance" not in first["body"] and "+977" not in first["body"]
    assert sum(1 for a in r.articles if a["body"]) == 1 and sum(1 for n in r.notes if "404" in n) == 4   # the other post-event alerts are not served
    kept = [a for a in r.articles if is_relevant(a["title"], a["body"], w2a_ctx.gazetteer)]
    assert len(kept) == 4 and all(a["published_at"] >= config.EVENT_START_UTC.replace(hour=0) for a in kept)
    assert w2a_ctx.state.seen("us_embassy_alerts", "pages") == {first["url"]}


# ── 11–12. ndrrma json ───────────────────────────────────────────────────────

def test_ndrrma_newsinfo(w2a_ctx, now):
    r = _run("ndrrma_newsinfo", w2a_ctx, now)
    assert 5 <= len(r.articles) <= 12 and all(a["publisher"] == "NDRRMA" and a["lang"] == "ne" for a in r.articles)
    assert all(a["url"].startswith("https://ndrrma.gov.np/mediafiles/") for a in r.articles)
    assert all(a["published_at"] >= datetime(2026, 8, 24, tzinfo=timezone.utc) and a["body"] for a in r.articles)
    assert any("skipped" in n for n in r.notes)
    blob = json.dumps(r.articles, ensure_ascii=False, default=str)
    assert "Contact:" not in blob and "[phone]" not in blob and "EXAMPLE-PERSON" not in blob


def test_ifrc_prestore_strips_contacts():
    from normalisers import ifrc_go as I
    body = json.dumps({"id": 1, "contacts": [{"name": "Example Person", "phone": "+9779841234567"}], "emergency_response_contact_email": "x@y.org",
                       "field_reports": [{"id": 2, "contacts": [{"name": "Example Person"}], "summary": "NPL: Flood"}]})
    out = I.prestore([Part(url="u", body=body)], None)[0]
    assert "Example Person" not in out.body and "x@y.org" not in out.body and '"summary": "NPL: Flood"' in out.body


def test_ndrrma_bulletins(w2a_ctx, now):
    r = _run("ndrrma_bulletins", w2a_ctx, now)
    assert len(r.articles) == 5 and all(a["url"].endswith(".pdf") and a["publisher"] == "NDRRMA" for a in r.articles)
    got = {_ktm(f["as_of"]): f["value"] for f in r.figures if f["metric"] == "disaster_incidents_24h"}
    assert got["2026-08-27 10:00"] == 51 and got["2026-08-26 10:00"] == 29
    assert all(is_relevant(a["title"], a["body"], w2a_ctx.gazetteer) for a in r.articles)
