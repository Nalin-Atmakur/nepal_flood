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
