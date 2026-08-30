from datetime import datetime, timezone

from processing import ledger as L


def test_expected_confirmed_unknown():
    assert L.expected_count(12, 8) == 12 and L.expected_count(3, 9) == 9 and L.expected_count(0, 0) == 0
    assert L.confirmed_count(5, 2, 1) == 8
    assert L.unknown_count(12, 8) == 4 and L.unknown_count(3, 9) == 0


def test_status_label():
    assert L.status_label(0, 0, 0) == "no_data"
    assert L.status_label(10, 2, 8) == "mostly_unknown"
    assert L.status_label(10, 6, 4) == "mostly_reached"
    assert L.status_label(10, 5, 5) == "mostly_reached"


def test_phones_from_articles():
    restored = [{"title": "NTC restores tower at Syabrubesi", "body": "", "published_at": "2026-08-28T10:00:00+00:00"}]
    down = [{"title": "रसुवाका गाउँहरू सञ्चारविहीन", "body": "", "published_at": "2026-08-29T10:00:00+00:00"}]
    assert L.phones_from_articles(restored) == (True, "yes (since 28 Aug)")
    assert L.phones_from_articles(down) == (False, "no")
    assert L.phones_from_articles([]) == (None, None)
    assert L.phones_from_articles(down + restored) == (False, "no")   # newest first wins


def test_nearest_gauge_label():
    g = {"galchhi": {"alive": True, "observed_at": "2026-08-29T22:45:00+00:00", "label": "Galchhi"},
         "rasuwagadhi": {"alive": False, "observed_at": "2026-08-26T02:55:00+00:00", "label": "Rasuwagadhi"}}
    assert L.nearest_gauge_label(4.0, g) == "Rasuwagadhi — dead since 26 Aug 08:40"
    assert L.nearest_gauge_label(80.0, g) == "Galchhi — alive"
    assert L.nearest_gauge_label(None, g) is None


def test_templates_in_three_languages():
    en, ne, hi = L.tpl("ndrrma_rescued", n=12)
    assert en == "NDRRMA lists 12 people rescued from here" and "१२" not in ne and "12" in ne and "12" in hi


# ─── P4: every place-scoped figure family has a timeline line; bridges/help requests fold into place_status ───────────

U = "https://x/inv"
PF = [   # newest first, as the step passes them
    {"publisher": "Setu (NDRRMA)", "metric": "missing", "value": 9, "as_of": "2026-08-30T00:47:00+00:00", "url": "https://setu"},
    {"publisher": "NESRA FloodWatch", "metric": "bridges_to_inspect", "value": 2, "as_of": "2026-08-29T20:00:00+00:00", "url": "https://nesra"},
    {"publisher": "NESRA FloodWatch", "metric": "bridge_to_inspect", "value": 1, "as_of": "2026-08-29T20:00:00+00:00", "url": "https://nesra"},
    {"publisher": "DoR RIMES", "metric": "bridges_damaged", "value": 3, "as_of": "2026-08-29T10:00:00+00:00", "url": U},
    {"publisher": "DoR RIMES", "metric": "bridges_washed_out", "value": 2, "as_of": "2026-08-29T10:00:00+00:00", "url": U},
    {"publisher": "DoR RIMES", "metric": "bridges_intact", "value": 4, "as_of": "2026-08-29T10:00:00+00:00", "url": U},
    {"publisher": "OPMCM portal", "metric": "help_requests_open", "value": 12, "as_of": "2026-08-29T10:00:00+00:00", "url": "https://opmcm"},
    {"publisher": "OPMCM portal", "metric": "help_requests_critical", "value": 3, "as_of": "2026-08-29T10:00:00+00:00", "url": "https://opmcm"},
    {"publisher": "OPMCM portal", "metric": "people_affected_reported", "value": 40, "as_of": "2026-08-29T10:00:00+00:00", "url": "https://opmcm"},
    {"publisher": "Copernicus EMS", "metric": "buildings_affected", "value": 80, "as_of": "2026-08-28T10:00:00+00:00", "url": "https://ems"},
    {"publisher": "Copernicus EMS", "metric": "buildings_total", "value": 300, "as_of": "2026-08-28T10:00:00+00:00", "url": "https://ems"},
    {"publisher": "DAO Nuwakot", "metric": "rescued", "value": 0, "as_of": "2026-08-27T10:00:00+00:00", "url": None},   # zero → no line
    {"publisher": "Volunteer bulletin (nirajbhusal)", "metric": "rescued", "value": 5, "as_of": "2026-08-27T10:00:00+00:00", "url": None},
]


def test_figure_lines_cover_every_family_once_per_day():
    lines = L.figure_lines(PF)
    keys = sorted((d, k) for d, k, _, _, _ in lines)
    assert keys == [("2026-08-27", "volunteer_rescued"), ("2026-08-28", "ems_buildings"), ("2026-08-29", "bridges_damaged"),
                    ("2026-08-29", "help_requests"), ("2026-08-29", "people_affected"), ("2026-08-30", "bridges_to_inspect"),
                    ("2026-08-30", "setu_missing")]
    by = {k: (dot, url, kw) for _, k, dot, url, kw in lines}
    assert by["bridges_damaged"] == ("unknown", U, {"n": 3, "w": 2})
    assert by["help_requests"] == ("unknown", "https://opmcm", {"n": 12, "c": 3})
    assert by["ems_buildings"][2] == {"n": 80, "total": 300} and by["setu_missing"][2] == {"n": 9}
    for _, k, _, _, kw in lines:
        en, ne, hi = L.tpl(k, **kw)
        assert en and ne and hi and "१" not in ne and "१" not in hi          # Latin digits everywhere


def test_figure_lines_empty_without_signal():
    assert L.figure_lines([]) == []
    assert L.figure_lines([{"publisher": "Open-Meteo (ECMWF)", "metric": "precip_mm", "value": 3, "as_of": "2026-08-29T10:00:00+00:00"}]) == []


def test_access_and_notes_from_inventories_and_help_requests():
    assert L.access_from_bridges(PF, "unknown") == "road_partial"                 # washed out here
    intact_only = [f for f in PF if f["metric"] == "bridges_intact"]
    assert L.access_from_bridges(intact_only, "unknown") == "road"
    assert L.access_from_bridges(intact_only, "foot") == "foot"                  # never downgrades an observed value
    assert L.access_from_bridges([], "unknown") == "unknown"
    assert L.help_note(PF) == "12 open help request(s) (3 critical), 40 people reported affected (PM portal)"
    assert L.help_note([]) is None
    assert L.bridge_note(PF) == "3 bridge(s) damaged, 2 washed out (DoR RIMES)"
    assert L.bridge_note(intact_only) is None
