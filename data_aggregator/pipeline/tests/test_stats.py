"""⑤ stats — the pure builders: every live row is ≤ 14 chars, captioned in three languages, with as_of + source."""
from datetime import datetime, timezone

from lib import config
from processing import stats as S
from processing._series import daily_last, latest_and_previous, with_deltas

NOW = datetime(2026, 8, 30, 0, 30, tzinfo=timezone.utc)   # 06:15 NPT on 30 Aug
U7, U8 = "https://ndrrma.gov.np/s7.pdf", "https://ndrrma.gov.np/s8.pdf"
FIGS = [
    {"publisher": "NDRRMA", "metric": "rescued", "scope": "national", "value": 4451, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "rescued", "scope": "national", "value": 7514, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 165, "as_of": "2026-08-27T03:31:00+00:00", "url": "s5"},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 389, "as_of": "2026-08-27T04:15:00+00:00", "url": "s6"},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 675, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "district:chitwan", "value": 246, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "district:rasuwa", "value": 13, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "district:gorkha", "value": 46, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "missing", "scope": "national", "value": 2498, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "missing", "scope": "category:hydropower_projects", "value": 933, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "telecom_towers_restored", "scope": "national", "value": 145, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "telecom_towers_damaged", "scope": "national", "value": 198, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "heli_flights_total", "scope": "national", "value": 261, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "personnel", "scope": "national", "value": 15224, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
]


def test_daily_series_keeps_last_value_per_npt_day():
    s = daily_last(FIGS)
    dead = s[("NDRRMA", "dead", "national")]
    assert [(p["day"].isoformat(), p["value"]) for p in dead] == [("2026-08-27", 389.0), ("2026-08-29", 675.0)]
    latest, prev = latest_and_previous(s[("NDRRMA", "rescued", "national")])
    assert latest["value"] == 7514 and prev["value"] == 4451 and latest["url"] == U8
    assert [p["delta"] for p in with_deltas(dead)] == [None, 286.0]
    # a value stamped 23:30 UTC belongs to the next NPT day
    s2 = daily_last([{"publisher": "X", "metric": "m", "scope": "national", "value": 1, "as_of": "2026-08-28T23:30:00+00:00"}])
    assert s2[("X", "m", "national")][0]["day"].isoformat() == "2026-08-29"


def test_ndrrma_rows():
    rows = {r["id"]: r for r in S.ndrrma_rows(FIGS, NOW)}
    assert rows["rescued_total_ndrrma"]["value"] == "7,514" and rows["rescued_total_ndrrma"]["source_url"] == U8
    assert rows["rescued_total_ndrrma"]["as_of"].isoformat() == "2026-08-29T12:45:00+00:00"
    assert rows["rescued_per_day"]["value"] == "+3,063" and rows["rescued_per_day"]["numeric"] == 3063
    assert rows["rescued_per_day"]["caption_en"].endswith("(28 Aug → 29 Aug).") and "28 Aug → 29 Aug" in rows["rescued_per_day"]["caption_ne"]
    top = rows["bodies_by_district_top"]
    assert top["value"] == "246" and top["caption_en"] == "of 675 bodies (36%) were recovered in Chitwan, far downstream — only 13 in Rasuwa itself."
    assert "रसुवामा मात्र 13" in top["caption_ne"] and "रसुवा में केवल 13" in top["caption_hi"]
    assert rows["missing_hydropower"]["value"] == "933" and "2,498" in rows["missing_hydropower"]["caption_en"]
    assert rows["towers_restored"]["value"] == "145 of 198"
    assert rows["heli_flights"]["value"] == "261" and rows["personnel_deployed"]["value"] == "15,224"
    for r in rows.values():
        assert len(r["value"]) <= S.MAX_VALUE_CHARS and r["caption_ne"] and r["caption_hi"] and r["as_of"]
    # only one sitrep → no per-day delta
    one = {r["id"] for r in S.ndrrma_rows(FIGS[1:2], NOW)}
    assert one == {"rescued_total_ndrrma"}


def test_divergence_live_and_fallback():
    latest = [{"publisher": "NDRRMA", "metric": "missing", "scope": "national", "value": 2498, "as_of": "2026-08-29T12:45:00+00:00"},
              {"publisher": "MoFA", "metric": "missing", "scope": "national", "value": 2400, "as_of": "2026-08-29T08:15:00+00:00"},
              {"publisher": "MoFA", "metric": "foreigners_missing", "scope": "national", "value": 511, "as_of": "2026-08-28T11:15:00+00:00"},
              {"publisher": "OPMCM portal", "metric": "lost_open", "scope": "national", "value": 10823, "as_of": "2026-08-29T23:50:00+00:00"},
              {"publisher": "Nepal Police (via press)", "metric": "missing", "scope": "national", "value": 2426, "as_of": "2026-08-29T09:00:00+00:00"},
              {"publisher": "Nepal Police (UDB)", "metric": "missing", "scope": "national", "value": 2430, "as_of": "2026-08-29T10:00:00+00:00"},   # official beats press for the same agency
              {"publisher": "NDRRMA", "metric": "missing", "scope": "district:rasuwa", "value": 5, "as_of": "2026-08-29T12:45:00+00:00"}]
    r = S.divergence_row(latest, NOW)
    assert r["value"] == "4 numbers" and r["numeric"] == 4
    assert r["caption_en"] == "different “missing” figures from 4 agencies — from 2,400 (MoFA) to 10,823 (OPMCM portal)."
    assert "2,400 (MoFA)" in r["caption_ne"] and "10,823 (OPMCM portal)" in r["caption_hi"]
    assert r["as_of"].isoformat() == "2026-08-29T23:50:00+00:00"
    assert S.divergence_row(latest[:1], NOW)["value"] == "5 numbers"     # < 2 agencies → the seeded static row


def test_places_gauges_flying_and_event_day(gaz):
    ps = [{"place_id": "timure", "expected": 10, "confirmed_reached": 2, "unknown": 8, "reports_count": 0},
          {"place_id": "galchhi", "expected": 5, "confirmed_reached": 5, "unknown": 0, "reports_count": 1},
          {"place_id": "nowhere", "expected": 0, "confirmed_reached": 0, "unknown": 0, "reports_count": 0}]
    rows = {r["id"]: r for r in S.places_rows(ps, NOW)}
    assert rows["places_with_unknown"]["value"] == "1" and rows["places_reached"]["value"] == "1 of 2"
    assert rows["places_reached"]["caption_en"].endswith("; 1 still have people missing.")
    g = S.gauges_row([{"station_name": "Trishuli at Galchi", "alive": True}, {"station_name": "Trishuli at Galchi", "alive": True},   # two ids, one gauge
                      {"station_name": "Bhotekoshi at Rasuwagadi", "alive": False}, {"station_name": "Bagmati River at Bhorleni", "alive": True}], NOW)
    assert g["value"] == "1 of 11" and g["numeric"] == 1
    fw = S.flying_window_row([{"scope": "place:dhunche", "value": 1, "as_of": "2026-08-30T00:15:00+00:00"}], gaz, NOW)
    assert fw["value"] == "30 Aug 06–11" and fw["caption_en"] == "next good morning flying window (forecast) at Dhunche."
    none = S.flying_window_row([], gaz, NOW)
    assert none["value"] == "none in 3 days" and "3" in none["caption_ne"]
    d = S.days_since_event(NOW)
    assert d["value"] == "Day 4" and d["numeric"] == 4
    assert S.days_since_event(config.EVENT_START_UTC)["value"] == "Day 0"


def test_fit_and_static_rows():
    assert S.fit("7,514") == "7,514" and len(S.fit("30 Aug 06–11 NPT · Dhunche")) <= S.MAX_VALUE_CHARS
    for s in S.STATIC + [S.STATIC_DIVERGENCE]:
        assert len(s["value"]) <= S.MAX_VALUE_CHARS and s["caption_ne"] and s["caption_hi"] and s["source_url"] and s["as_of"]
    for key, (en, ne, hi) in S.CAPTIONS.items():
        assert en and ne and hi, key
