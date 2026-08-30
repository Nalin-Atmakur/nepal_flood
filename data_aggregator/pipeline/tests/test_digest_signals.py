"""Digest inputs added by P6: help requests on the PM's portal and quoted third-party figures (docs/process_data/07-digest.md)."""
from __future__ import annotations

from datetime import date

from processing import digest as D

DAY = date(2026, 8, 30)


def _bullets(latest, previous=None):
    _, bullets = D.build_bullets(day=DAY, latest=latest, previous=previous or {}, places_today={}, places_before={},
                                 place_names={}, gauges_now={}, gauges_before={}, articles=[])
    return bullets


def test_help_requests_bullet_with_deltas():
    latest = [
        {"publisher": "OPMCM portal", "metric": "help_requests_open", "scope": "national", "value": 180, "url": "https://rescue.opmcm.gov.np/help"},
        {"publisher": "OPMCM portal", "metric": "help_requests_critical", "scope": "national", "value": 146, "url": None},
        {"publisher": "OPMCM portal", "metric": "people_affected_reported", "scope": "national", "value": 12697, "url": None},
    ]
    b = [x for x in _bullets(latest, {("OPMCM portal", "help_requests_open"): 150, ("OPMCM portal", "people_affected_reported"): 12000}) if x["kind"] == "help"]
    assert len(b) == 1
    assert "180 open" in b[0]["text"] and "146 critical" in b[0]["text"] and "12,697 people reported affected" in b[0]["text"]
    assert "+30" in b[0]["text"] and "+697" in b[0]["text"]
    assert b[0]["source_url"] == "https://rescue.opmcm.gov.np/help"


def test_no_help_bullet_when_zero():
    latest = [{"publisher": "OPMCM portal", "metric": "help_requests_open", "scope": "national", "value": 0, "url": None}]
    assert not [x for x in _bullets(latest) if x["kind"] == "help"]


def test_quoted_figures_are_one_labelled_context_bullet_and_never_a_figure_bullet():
    latest = [
        {"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 675, "url": "https://bipad"},
        {"publisher": "Nepal Red Cross", "metric": "dead_quoted", "scope": "national", "value": 579, "url": "https://nrcs/sitrep"},
        {"publisher": "Nepal Red Cross", "metric": "missing_quoted", "scope": "national", "value": 1924, "url": "https://nrcs/sitrep"},
        {"publisher": "Nepal Red Cross", "metric": "rescued_quoted", "scope": "national", "value": 4451, "url": "https://nrcs/sitrep"},
        {"publisher": "Qatar Charity (via ReliefWeb)", "metric": "dead_quoted", "scope": "national", "value": 165, "url": "https://rw"},
        {"publisher": "Nepal Red Cross", "metric": "volunteers_quoted", "scope": "national", "value": 300, "url": "https://nrcs/sitrep"},
    ]
    bullets = _bullets(latest)
    ctx = [x for x in bullets if x["kind"] == "context"]
    assert len(ctx) == 1
    assert ctx[0]["text"].startswith("As quoted by Nepal Red Cross (their report, not an official count): ")
    assert "579 dead" in ctx[0]["text"] and "1,924 out of contact" in ctx[0]["text"] and "4,451 rescued" in ctx[0]["text"]
    assert "volunteers" not in ctx[0]["text"] and "Qatar" not in ctx[0]["text"]
    figs = [x for x in bullets if x["kind"] == "figure"]
    assert all("quoted" not in x["text"] and "Red Cross" not in x["text"] for x in figs)
    headline, _ = D.build_bullets(day=DAY, latest=latest, previous={}, places_today={}, places_before={}, place_names={},
                                  gauges_now={}, gauges_before={}, articles=[])
    assert "NDRRMA: 675 dead" in headline


def test_rescuers_bullet_ignores_district_rollups():
    today = {"rasuwa": {"expected": 2156, "confirmed_reached": 0, "unknown": 2156, "status_label": "district"},
             "timure": {"expected": 1104, "confirmed_reached": 0, "unknown": 1104, "status_label": "mostly_unknown"}}
    _, bullets = D.build_bullets(day=DAY, latest=[], previous={}, places_today=today, places_before={}, place_names={"rasuwa": "Rasuwa", "timure": "Timure"},
                                 gauges_now={}, gauges_before={}, articles=[])
    r = [b for b in bullets if b["kind"] == "rescuers"][0]
    assert "Rasuwa" not in r["text"] and "Timure (1,104)" in r["text"] and "1 of 1 tracked places" in r["text"]


def test_a_news_bullet_survives_when_every_signal_kind_is_present():
    latest = [{"publisher": p, "metric": "dead", "scope": "national", "value": 600 + i, "url": None}
              for i, p in enumerate(["NDRRMA", "Nepal Police", "MoFA", "Dept of Tourism (via press)", "NTB (via press)"])]
    latest += [{"publisher": "OPMCM portal", "metric": "help_requests_open", "scope": "national", "value": 5, "url": None},
               {"publisher": "Nepal Red Cross", "metric": "dead_quoted", "scope": "national", "value": 579, "url": None}]
    today = {"timure": {"expected": 3, "confirmed_reached": 0, "unknown": 3, "status_label": "mostly_unknown"}}
    _, bullets = D.build_bullets(day=DAY, latest=latest, previous={}, places_today=today, places_before={}, place_names={},
                                 gauges_now={"Galchhi": True}, gauges_before={}, articles=[{"title": "Bridge reopens", "publisher": "KP", "url": "u"}],
                                 watch={"flying_window": "30 Aug 06–11 NPT · Dhunche"})
    kinds = [b["kind"] for b in bullets]
    assert len(bullets) <= D.MAX_BULLETS and kinds.count("figure") <= D.MAX_FIGURE_BULLETS and "news" in kinds
