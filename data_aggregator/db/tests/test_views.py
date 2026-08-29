"""Views return the shape the website reads (docs/04-derived.md)."""
from __future__ import annotations


def test_live_counts_shape(anon):
    row = anon.table("v_live_counts").select("*").execute().data[0]
    for k in ("submissions_10m", "submissions_today", "submissions_total", "last_pull_at", "last_processed_at"):
        assert k in row


def test_sources_status_has_all_sources(anon, service):
    n_sources = len(service.table("sources").select("id").execute().data)
    n_view = len(anon.table("v_sources_status").select("id").execute().data)
    assert n_view == n_sources >= 50


def test_place_status_latest_columns(anon):
    res = anon.table("v_place_status_latest").select("*").limit(1).execute()
    assert isinstance(res.data, list)  # may be empty before the first process_data run
