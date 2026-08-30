"""place_timeline is keyed (place_id, day, kind): a re-run replaces a line instead of adding one (migration 010,
docs/process_data/03-ledger.md §timeline)."""
from __future__ import annotations

from processing import ledger as L

NOW = "2026-08-30T04:30:00+00:00"


def test_article_kind_is_stable_and_matches_the_migration_backfill():
    import hashlib
    t = "परराष्ट्रमन्त्री खनाल र चिनियाँ समकक्षीबीच भेट"
    assert L.article_kind(t) == "article:" + hashlib.md5(t.encode("utf-8")).hexdigest()
    assert L.article_kind(t) == L.article_kind(t)
    assert L.article_kind(t) != L.article_kind(t + " ")


def test_timeline_row_carries_kind():
    r = L.timeline_row("dhunche", "2026-08-30", "gauge_alive", "River gauge live (2.59 m)", "ne", "hi", "live", None, NOW)
    assert r["kind"] == "gauge_alive" and r["place_id"] == "dhunche" and r["day"] == "2026-08-30" and r["dot"] == "live"
    assert set(r) == {"place_id", "day", "kind", "what_en", "what_ne", "what_hi", "dot", "source_url", "computed_at"}


def test_three_gauge_readings_on_one_day_collapse_to_the_last():
    rows = [L.timeline_row("dhunche", "2026-08-30", "gauge_alive", f"River gauge live ({v} m)", "ne", "hi", "live", None, NOW)
            for v in ("2.55", "2.57", "2.59")]
    rows.append(L.timeline_row("dhunche", "2026-08-30", "opmcm_lost", "12 people reported missing here on the PM's portal", "ne", "hi", "unknown", None, NOW))
    rows.append(L.timeline_row("dhunche", "2026-08-30", "opmcm_lost", "9 people reported missing here on the PM's portal", "ne", "hi", "unknown", None, NOW))
    out = L.collapse_timeline(rows)
    assert len(out) == 2
    by_kind = {r["kind"]: r["what_en"] for r in out}
    assert by_kind["gauge_alive"] == "River gauge live (2.59 m)"
    assert by_kind["opmcm_lost"].startswith("9 ")


def test_same_headline_on_two_places_or_days_stays_distinct():
    a = L.timeline_row("dhunche", "2026-08-30", L.article_kind("Bridge gone"), "Bridge gone", "Bridge gone", "Bridge gone", "live", "u", NOW)
    b = L.timeline_row("timure", "2026-08-30", L.article_kind("Bridge gone"), "Bridge gone", "Bridge gone", "Bridge gone", "live", "u", NOW)
    c = L.timeline_row("dhunche", "2026-08-29", L.article_kind("Bridge gone"), "Bridge gone", "Bridge gone", "Bridge gone", "live", "u", NOW)
    assert len(L.collapse_timeline([a, b, c, a])) == 3
