"""⑧ timeline + ⑨ trends — deterministic ids, three languages, no duplicates of the seeded rows."""
from datetime import datetime, timezone

from processing import timeline as T
from processing import trends

NOW = datetime(2026, 8, 30, 0, 30, tzinfo=timezone.utc)
U7, U8 = "s7.pdf", "s8.pdf"
FIGS = [
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 165, "as_of": "2026-08-27T03:31:00+00:00", "url": "s5"},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 389, "as_of": "2026-08-27T04:15:00+00:00", "url": "s6"},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 579, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "missing", "scope": "national", "value": 1924, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "rescued", "scope": "national", "value": 4451, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 675, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "missing", "scope": "national", "value": 2498, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "rescued", "scope": "national", "value": 7514, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "telecom_towers_restored", "scope": "national", "value": 145, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "telecom_towers_damaged", "scope": "national", "value": 198, "as_of": "2026-08-28T13:15:00+00:00", "url": U7},
    {"publisher": "NDRRMA", "metric": "telecom_towers_restored", "scope": "national", "value": 145, "as_of": "2026-08-29T12:45:00+00:00", "url": U8},
    {"publisher": "NDRRMA", "metric": "telecom_towers_restored", "scope": "national", "value": 160, "as_of": "2026-08-30T00:10:00+00:00", "url": "s9"},
    {"publisher": "Open-Meteo (ECMWF)", "metric": "precip_mm", "scope": "place:dhunche", "value": 3, "as_of": "2026-09-01T03:00:00+00:00"},
]


def test_ndrrma_rows_one_per_day_with_deltas():
    rows = T.ndrrma_rows(FIGS, NOW)
    assert [r["id"] for r in rows] == ["r20260827_ndrrma", "r20260828_ndrrma", "r20260829_ndrrma"]
    assert rows[0]["what_en"] == "NDRRMA situation report: 389 dead" and rows[0]["source_url"] == "s6" and rows[0]["at_label"] == "27 Aug 10:00"
    assert rows[1]["what_en"] == "NDRRMA situation report: 579 dead (+190), 1,924 out of contact, 4,451 rescued"
    assert rows[2]["what_en"] == "NDRRMA situation report: 675 dead (+96), 2,498 out of contact (+574), 7,514 rescued (+3,063)"
    assert rows[2]["what_ne"] == "NDRRMA स्थिति प्रतिवेदन: 675 मृत (+96), 2,498 सम्पर्कविहीन (+574), 7,514 उद्धार (+3,063)"
    assert rows[2]["what_hi"].startswith("NDRRMA स्थिति रिपोर्ट: 675 मृत (+96)") and rows[2]["kind"] == "response" and rows[2]["at_label"] == "29 Aug 18:30"
    assert T.ndrrma_rows(FIGS, NOW) == rows                      # deterministic


def test_towers_rows_only_when_the_number_moves():
    rows = T.towers_rows(FIGS, NOW)
    assert [r["id"] for r in rows] == ["r20260828_towers", "r20260830_towers"]
    assert rows[0]["what_en"] == "145 of 198 damaged telecom towers back on air (NDRRMA)"
    assert rows[1]["what_en"] == "160 telecom towers back on air (NDRRMA)" and "160" in rows[1]["what_ne"] and "160" in rows[1]["what_hi"]


def test_phones_rows_first_restoration_per_place():
    ps = [{"place_id": "syabrubesi", "as_of": "2026-08-29T10:00:00+00:00", "telecom_restored": True, "phones": "yes (since 28 Aug)"},
          {"place_id": "syabrubesi", "as_of": "2026-08-30T00:00:00+00:00", "telecom_restored": True, "phones": "yes (since 28 Aug)"},
          {"place_id": "timure", "as_of": "2026-08-30T00:00:00+00:00", "telecom_restored": False, "phones": "no"},
          {"place_id": "mailung", "as_of": "2026-08-29T23:00:00+00:00", "telecom_restored": True, "phones": "yes"}]
    names = {"syabrubesi": ("Syabrubesi", "स्याफ्रुबेसी", "स्याब्रुबेसी"), "mailung": ("Mailung", "मैलुङ", "मैलुंग")}
    assert [r["id"] for r in T.phones_rows(ps, names, NOW, eligible={"mailung"})] == ["r20260830_phones_mailung"]
    rows = T.phones_rows(ps, names, NOW)
    assert [r["id"] for r in rows] == ["r20260828_phones_syabrubesi", "r20260830_phones_mailung"]
    assert rows[0]["what_en"] == "Syabrubesi: phones working again" and rows[0]["at_label"] == "28 Aug" and rows[0]["place_id"] == "syabrubesi"
    assert rows[0]["what_ne"] == "स्याफ्रुबेसी: फोन फेरि चल्न थाल्यो" and rows[1]["at_label"] == "30 Aug 04:45"


def test_gauge_rows_skip_event_day_deaths_and_detect_revivals():
    obs = [{"station_name": "Bhotekoshi at Rasuwagadi", "observed_at": "2026-08-26T02:55:00+00:00", "level": 1.62},       # seeded death: skipped
           {"station_name": "Trishuli at Galchi", "observed_at": "2026-08-26T05:00:00+00:00", "level": 5.0},
           {"station_name": "Trishuli at Galchi", "observed_at": "2026-08-28T05:00:00+00:00", "level": 1.9},             # back after 48 h
           {"station_name": "Trishuli at Galchi", "observed_at": "2026-08-28T20:00:00+00:00", "level": 1.92},
           {"station_name": "Trishuli at Galchi", "observed_at": "2026-08-29T12:00:00+00:00", "level": 1.93},
           {"station_name": "Trishuli at Galchi", "observed_at": "2026-08-30T00:15:00+00:00", "level": 1.94},
           {"station_name": "Trishuli Khola at Dhunche", "observed_at": "2026-08-28T03:00:00+00:00", "level": 2.7},
           {"station_name": "Trishuli Khola at Dhunche", "observed_at": "2026-08-28T09:00:00+00:00", "level": 2.76},     # silent since
           {"station_name": "Bagmati River at Bhorleni", "observed_at": "2026-08-20T00:00:00+00:00", "level": 1}]        # not corridor
    rows = T.gauge_rows(obs, NOW)
    assert [r["id"] for r in rows] == ["g20260828_dhunche_silent", "g20260828_galchhi_back"]
    assert rows[0]["what_en"] == "Dhunche river gauge falls silent — last reading (2.76 m)" and rows[0]["kind"] == "gauge"
    assert rows[1]["what_en"] == "Galchhi river gauge back online (1.90 m) after 48 h of silence" and "48" in rows[1]["what_ne"]


def test_breach_rows_dated_and_not_duplicating_seed():
    arts = [{"title": "Barrier lake near China border breaches, raising fresh flood threat", "publisher": "Kathmandu Post", "url": "a", "published_at": "2026-08-28T06:00:00+00:00"},
            {"title": "Barrier lake continues to pose flood risk, China warns", "publisher": "Kathmandu Post", "url": "b", "published_at": "2026-08-29T06:00:00+00:00"},
            {"title": "Second barrier lake overtops, engineers say", "publisher": "Republica", "url": "c", "published_at": "2026-08-29T07:00:00+00:00"},
            {"title": "Glacial lake bursts again", "publisher": "X", "url": "d", "published_at": "2026-08-29T09:00:00+00:00"},
            {"title": "Barrier lake breaches", "publisher": "X", "url": "e", "published_at": None},
            {"title": "‘ताल फुट्ने जोखिम कम छ, सतर्क हुनुपर्छ’", "publisher": "Onlinekhabar", "url": "f", "published_at": "2026-08-30T01:00:00+00:00"},
            {"title": "Barrier lake could breach within days, experts warn", "publisher": "Y", "url": "g", "published_at": "2026-08-30T02:00:00+00:00"},
            {"title": "हिमताल फुट्यो, तल्लो तटीय क्षेत्रमा सतर्कता", "publisher": "Z", "url": "h", "published_at": "2026-08-30T03:00:00+00:00"}]
    seeded = [{"id": "d2_breach", "at": "2026-08-28T05:00:00+00:00", "what_en": "The lower barrier lake overtops; rescue is suspended"}]
    rows = T.breach_rows(arts, seeded, NOW)
    assert [r["id"] for r in rows] == ["w20260829_barrier_lake", "w20260830_barrier_lake"]   # seed covers 28 Aug; undated + negated ("risk is low", "could") skipped
    assert rows[1]["source_url"] == "h"
    assert rows[0]["what_en"].startswith("Barrier lake breach reported — Republica: Second barrier lake overtops") and rows[0]["kind"] == "warning"
    assert rows[0]["place_id"] == "barrier_lake_site" and rows[0]["source_url"] == "c"
    assert T.breach_rows(arts, [], NOW)[0]["id"] == "w20260828_barrier_lake"


def test_series_rows_drop_forecasts():
    rows = trends.series_rows(FIGS, NOW)
    keys = {(r["publisher"], r["metric"], r["scope"]) for r in rows}
    assert ("Open-Meteo (ECMWF)", "precip_mm", "place:dhunche") not in keys
    dead = sorted((r["day"].isoformat(), r["value"]) for r in rows if r["metric"] == "dead")
    assert dead == [("2026-08-27", 389.0), ("2026-08-28", 579.0), ("2026-08-29", 675.0)]
    assert all(r["computed_at"] == NOW for r in rows)
