"""Regression: feed items without a pubDate take their date from a dated URL path; never invented otherwise (Q1 audit)."""
from __future__ import annotations

from datetime import datetime, timezone

from normalisers._rss import entry_datetime, published_from_path


def test_published_from_path_reads_dated_paths_only():
    assert published_from_path("https://kathmandupost.com/national/2026/08/29/hundreds-feared-trapped") == datetime(2026, 8, 29, tzinfo=timezone.utc)
    assert published_from_path("http://annapurnapost.com/story/506390") is None
    assert published_from_path("https://x.example/2026/13/40/bad") is None
    assert published_from_path("") is None


def test_entry_datetime_prefers_feed_dates_then_the_link():
    e = {"published_parsed": (2026, 8, 28, 10, 5, 0, 0, 0, 0)}
    assert entry_datetime(e, "https://kathmandupost.com/national/2026/08/29/x") == datetime(2026, 8, 28, 10, 5, tzinfo=timezone.utc)
    assert entry_datetime({}, "https://kathmandupost.com/national/2026/08/29/x") == datetime(2026, 8, 29, tzinfo=timezone.utc)
    assert entry_datetime({}, "http://annapurnapost.com/story/1") is None
    assert entry_datetime({}) is None
