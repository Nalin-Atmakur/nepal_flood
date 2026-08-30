"""`*_quoted` figures (third-party numbers lifted from NRCS / ReliefWeb reports, wave 4) are context, never headline
numbers — docs/process_data/04-figures-latest.md §quoted."""
from __future__ import annotations

from processing import digest, stats


def test_is_headline_metric():
    assert stats.is_headline_metric("dead") and stats.is_headline_metric("missing")
    assert not stats.is_headline_metric("dead_quoted")
    assert not stats.is_headline_metric("rescued_quoted")


def test_stats_candidate_lists_never_name_quoted_metrics():
    for pub, metric in stats.MISSING_CANDIDATES:
        assert stats.is_headline_metric(metric), (pub, metric)


def test_digest_headline_metrics_never_name_quoted_metrics():
    assert all(stats.is_headline_metric(m) for m in digest.HEADLINE_METRICS)
    assert not any(str(p).endswith("(quoted)") for p in digest.HEADLINE_PUBLISHERS)


def test_stats_skip_quoted_missing_candidates(monkeypatch):
    """Even if a quoted metric were listed, the divergence stat ignores it."""
    monkeypatch.setattr(stats, "MISSING_CANDIDATES", [("NRCS", "missing_quoted"), ("NDRRMA", "missing")])
    src = open(stats.__file__, encoding="utf-8").read()
    assert "if not is_headline_metric(metric):" in src
