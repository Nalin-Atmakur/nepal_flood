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


def test_source_extract_views_public_and_raw_denied(anon, service):
    """012: per-source extract views are readable with the anon key; the RAW tables behind them are not."""
    counts = anon.table("v_source_counts").select("source_id, figures_total, articles_total, last_row_at").execute().data
    assert len(counts) == len(service.table("sources").select("id").execute().data)
    assert any(c["figures_total"] > 0 for c in counts)
    figs = anon.table("v_source_figures_recent").select("source_id, publisher, metric, scope, value, as_of, url, note").limit(50).execute().data
    assert figs and all("metric" in f and "value" in f for f in figs)
    per_source = {}
    for f in anon.table("v_source_figures_recent").select("source_id").execute().data:
        per_source[f["source_id"]] = per_source.get(f["source_id"], 0) + 1
    assert max(per_source.values()) <= 40
    arts = anon.table("v_source_articles_recent").select("source_id, title, url, published_at").limit(20).execute().data
    assert isinstance(arts, list)
    import pytest as _pytest
    for table in ("figures", "articles"):
        with _pytest.raises(Exception):
            anon.table(table).select("id").limit(1).execute()
