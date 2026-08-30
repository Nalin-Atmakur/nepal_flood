"""Pure helpers of scripts/morning_report.py (no network). docs/reports/README.md."""
from __future__ import annotations

import importlib.util
import re
from datetime import date
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "morning_report.py"
spec = importlib.util.spec_from_file_location("morning_report", SCRIPT)
mr = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mr)


def test_fmt_int_and_delta():
    assert mr.fmt_int(1234.0) == "1,234"
    assert mr.fmt_int(None) == "—"
    assert mr.fmt_int(2.5) == "2.5"
    assert mr.delta_str(10, 7) == "+3"
    assert mr.delta_str(7, 10) == "−3"
    assert mr.delta_str(5, 5) == "±0"
    assert mr.delta_str(None, 5) == "—"


def test_bar_scales_and_clamps():
    assert mr.bar(0, 10, 4) == "░░░░"
    assert mr.bar(10, 10, 4) == "████"
    assert mr.bar(5, 10, 4) == "██░░"
    assert mr.bar(50, 10, 4) == "████"
    assert mr.bar(None, None, 3) == "░░░"


def test_npt_day_and_short_time():
    # 18:30 UTC on 29 Aug is 00:15 NPT on 30 Aug
    assert mr.npt_day("2026-08-29T18:30:00+00:00") == date(2026, 8, 30)
    assert mr.npt_day("2026-08-29T18:00:00Z") == date(2026, 8, 29)
    assert mr.npt_day(None) is None
    assert mr.short_time("2026-08-29T12:45:00+00:00") == "29 Aug 18:30"


def test_series_value_takes_last_value_on_or_before_day():
    series = {("NDRRMA", "dead"): {date(2026, 8, 27): 500.0, date(2026, 8, 29): 675.0}}
    assert mr.series_value(series, "NDRRMA", "dead", date(2026, 8, 29)) == 675.0
    assert mr.series_value(series, "NDRRMA", "dead", date(2026, 8, 28)) == 500.0
    assert mr.series_value(series, "NDRRMA", "dead", date(2026, 8, 26)) is None
    assert mr.series_value(series, "MoFA", "dead", date(2026, 8, 29)) is None


def test_report_data_roundtrip_and_diff():
    text = "# x\n\n" + mr.DATA_MARK + '{"NDRRMA · dead": 675, "help · open": 178}' + " -->\n"
    prev = mr.parse_report_data(text)
    assert prev == {"NDRRMA · dead": 675, "help · open": 178}
    changes = mr.diff_data(prev, {"NDRRMA · dead": 690, "help · open": 178, "new": 1})
    assert changes == ["NDRRMA · dead: 675 → 690 (+15)"]
    assert mr.parse_report_data("no block here") == {}


def test_sanitize_masks_phone_like_runs():
    assert "[number]" in mr.sanitize("call +977 9841234567 now")
    assert mr.sanitize("  a   b  ") == "a b"
    assert mr.sanitize("x" * 200, 10).endswith("…")


@pytest.fixture
def fixture_data():
    today = date(2026, 8, 30)
    return {
        "today": today.isoformat(),
        "latest": {
            ("NDRRMA", "dead"): {"publisher": "NDRRMA", "metric": "dead", "value": 675, "as_of": "2026-08-29T12:45:00+00:00"},
            ("NDRRMA", "missing"): {"publisher": "NDRRMA", "metric": "missing", "value": 2498, "as_of": "2026-08-29T12:45:00+00:00"},
            ("NDRRMA", "rescued"): {"publisher": "NDRRMA", "metric": "rescued", "value": 7514, "as_of": "2026-08-29T12:45:00+00:00"},
            ("HOT OSM", "bridges_surveyed"): {"publisher": "HOT OSM", "metric": "bridges_surveyed", "value": 59, "as_of": "2026-08-29T23:53:00+00:00"},
            ("HOT OSM", "bridges_washed_out"): {"publisher": "HOT OSM", "metric": "bridges_washed_out", "value": 39, "as_of": "2026-08-29T23:53:00+00:00"},
            ("HOT OSM", "bridges_damaged"): {"publisher": "HOT OSM", "metric": "bridges_damaged", "value": 43, "as_of": "2026-08-29T23:53:00+00:00"},
            ("HOT OSM", "bridges_intact"): {"publisher": "HOT OSM", "metric": "bridges_intact", "value": 16, "as_of": "2026-08-29T23:53:00+00:00"},
            ("NDRRMA", "telecom_towers_damaged"): {"publisher": "NDRRMA", "metric": "telecom_towers_damaged", "value": 198, "as_of": "2026-08-29T12:45:00+00:00"},
            ("NDRRMA", "telecom_towers_restored"): {"publisher": "NDRRMA", "metric": "telecom_towers_restored", "value": 145, "as_of": "2026-08-29T12:45:00+00:00"},
        },
        "place_figs": [
            {"publisher": "OPMCM portal", "metric": "help_requests_open", "scope": "place:timure", "value": 34, "as_of": "2026-08-30T04:47:00+00:00"},
            {"publisher": "OPMCM portal", "metric": "help_requests_critical", "scope": "place:timure", "value": 27, "as_of": "2026-08-30T04:47:00+00:00"},
        ],
        "flying": [{"publisher": "Open-Meteo (ECMWF)", "metric": "flying_window_quality:2026-08-31", "scope": "place:dhunche", "value": 1, "as_of": "x", "note": "good · 06–11 NPT"}],
        "series": {("NDRRMA", "dead"): {date(2026, 8, 28): 579.0, date(2026, 8, 29): 675.0}, ("NDRRMA", "rescued"): {date(2026, 8, 29): 7514.0}},
        "places": [
            {"place_id": "timure", "name_en": "Timure", "kind": "place", "expected": 1110, "confirmed_reached": 3, "unknown": 1107, "status_label": "mostly_unknown", "now_en": "As of 30 Aug: 34 open help requests.", "now_as_of": "2026-08-30T04:49:00+00:00"},
            {"place_id": "rasuwa", "name_en": "Rasuwa", "kind": "district", "expected": 5000, "confirmed_reached": 100, "unknown": 4900, "status_label": "district"},
        ],
        "prev_unknown": {"timure": 1100.0},
        "prev_label": "yesterday",
        "sources": [{"id": "a", "last_ok": True, "last_fetched_at": "2026-08-30T04:47:00+00:00"}, {"id": "b", "last_ok": False, "last_fetched_at": "2026-08-30T04:47:00+00:00", "last_error": "timeout 9841234567"}],
        "findings": [{"kind": "name_collision", "detail": {"summary": "DAO Sindhupalchok rows collide"}, "created_at": "2026-08-30T00:00:00+00:00"}],
        "entities_total": 10677,
        "merged": 3288,
        "articles": [{"published_at": "2026-08-30T02:00:00+00:00"}, {"published_at": None, "fetched_at": "2026-08-29T02:00:00+00:00"}],
        "gauges": [{"station_name": "Trishuli at Galchi", "alive": True}, {"station_name": "Bhotekoshi at Rasuwagadi", "alive": False}],
        "live": {"last_pull_at": "2026-08-30T04:47:00+00:00", "last_processed_at": "2026-08-30T04:49:00+00:00", "submissions_total": 0},
    }


def test_render_report_has_every_section_and_only_latin_digits(fixture_data):
    text = mr.render_report(fixture_data, prev_data={"NDRRMA · dead": 579})
    for h in ["## 1.", "## 2.", "## 3.", "## 4.", "## 5.", "## 6.", "## 7."]:
        assert h in text
    assert "| NDRRMA | dead (`dead`) | 675 | 29 Aug 18:30 | ±0 | +96 |" in text
    assert "Timure" in text and "Rasuwa " not in text.split("## 2.")[1].split("## 3.")[0]  # districts excluded
    assert "vs yesterday +7" in text
    assert "| Timure | 34 | 27 | — |" in text
    assert "145 of 198 restored — 73%" in text
    assert "NDRRMA · dead: 579 → 675 (+96)" in text
    assert "[number]" in text  # the failing source's error was sanitised
    assert not re.search(r"[०-९]", text)
    assert mr.parse_report_data(text)["NDRRMA · dead"] == 675
