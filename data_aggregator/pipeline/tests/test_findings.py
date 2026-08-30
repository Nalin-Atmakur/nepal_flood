"""⑥ findings — the pure builders; every finding carries a plain-English summary and its evidence."""
from datetime import datetime, timezone

from lib import config
from processing import findings as F

NOW = datetime(2026, 8, 30, 0, 30, tzinfo=timezone.utc)


def test_publisher_divergence():
    latest = [{"publisher": "NDRRMA", "metric": "dead", "scope": "national", "value": 675, "as_of": "t1", "url": "u1"},
              {"publisher": "MoFA", "metric": "dead", "scope": "national", "value": 626, "as_of": "t2", "url": "u2"},
              {"publisher": "Nepal Police (via press)", "metric": "dead", "scope": "national", "value": 616, "as_of": "t3", "url": "u3"},
              {"publisher": "NDRRMA", "metric": "missing", "scope": "national", "value": 2498, "as_of": "t1", "url": "u1"},
              {"publisher": "OPMCM portal", "metric": "missing", "scope": "national", "value": 10823, "as_of": "t4", "url": "u4"},
              {"publisher": "MoFA", "metric": "missing", "scope": "national", "value": 2400, "as_of": "t2", "url": "u2"},
              {"publisher": "NDRRMA", "metric": "rescued", "scope": "national", "value": 7514, "as_of": "t1", "url": "u1"},
              {"publisher": "NDRRMA", "metric": "dead", "scope": "district:chitwan", "value": 246, "as_of": "t1", "url": "u1"}]
    d = F.publisher_divergence(latest)
    assert [m["metric"] for m in d["metrics"]] == ["missing", "dead"]       # rescued has one publisher; OPMCM 'missing' skipped
    assert d["metrics"][0]["spread"] == 98 and d["metrics"][0]["low"]["publisher"] == "MoFA" and d["metrics"][0]["high"]["publisher"] == "NDRRMA"
    assert d["metrics"][1]["values"] == {"MoFA": 626.0, "NDRRMA": 675.0, "Nepal Police (via press)": 616.0}
    assert d["summary"].startswith("Publishers disagree most on 'missing': MoFA says 2,400, NDRRMA says 2,498 (spread 98).")
    assert "figures_latest" in d["evidence"]
    assert F.publisher_divergence(latest[:1]) is None


def test_unreached_by_record():
    ps = [{"place_id": "timure", "expected": 190, "confirmed_reached": 0, "unknown": 190, "reports_count": 0, "access": "helicopter_only"},
          {"place_id": "betrawati", "expected": 450, "confirmed_reached": 380, "unknown": 70, "reports_count": 3},
          {"place_id": "gatlang", "expected": 12, "confirmed_reached": 0, "unknown": 12, "reports_count": 1, "phones": "no"},
          {"place_id": "empty", "expected": 0, "confirmed_reached": 0, "unknown": 0, "reports_count": 0}]
    u = F.unreached_by_record(ps, {"timure": "Timure", "gatlang": "Gatlang"})
    assert u["places"] == 2 and u["people"] == 202 and [r["place_id"] for r in u["list"]] == ["timure", "gatlang"]
    assert u["summary"].startswith("2 places have 202 people reported missing there and no official rescue or stationed count at all")
    assert "Largest: Timure (190), Gatlang (12)." in u["summary"]
    assert F.unreached_by_record(ps[1:2], {}) is None


def test_stale_sources_two_times_cadence():
    rows = [{"id": "fresh", "cadence": "30m", "last_fetched_at": "2026-08-30T00:00:00+00:00", "last_ok": True},
            {"id": "old", "cadence": "30m", "last_fetched_at": "2026-08-29T00:00:00+00:00", "last_ok": True},
            {"id": "failed", "cadence": "60m", "last_fetched_at": "2026-08-30T00:10:00+00:00", "last_ok": False, "last_error": "http 500"},
            {"id": "never", "cadence": "60m", "last_fetched_at": None, "last_ok": None},
            {"id": "static", "cadence": "static (fetch once)", "last_fetched_at": "2026-08-01T00:00:00+00:00", "last_ok": True}]
    s = F.stale_sources(rows, NOW)
    assert [r["source"] for r in s["sources"]] == ["failed", "old"]
    assert s["sources"][1]["limit_minutes"] == 2 * max(30, config.PULL_INTERVAL_MINUTES) and s["sources"][0]["error"] == "http 500"
    assert s["summary"].startswith("2 sources are stale or failing (1 failed on their last pull: failed)")
    assert F.stale_sources(rows[:1], NOW) is None


def test_duplicate_rate_summary():
    d = F.duplicate_rate({"entities": 9903, "merged": 2338, "merge_rate": 0.2361, "cross_source": 1500, "by_source_pair": {"ndrrma+opmcm": 1500, "opmcm": 838}, "queue_open": 4})
    assert d["summary"] == "2,338 of 9,903 resolved people (24%) were built from more than one record; 1,500 span different lists. 4 ambiguous pairs await a human."
    assert d["merge_rate"] == 0.2361 and "dedup_queue" in d["evidence"]
    assert F.duplicate_rate({"entities": 0}) is None


def test_name_collision_has_summary(gaz):
    items = [{"daoOffice": "DAO Sindhupalchok", "locationText": "Bhotekoshi RM-3, Sindhupalchok"},
             {"daoOffice": "DAO Sindhupalchok", "locationText": "Chautara"},
             {"daoOffice": "DAO Rasuwa", "locationText": "Timure"}]
    nc = F.name_collision(items, gaz)
    assert nc["dao_sindhupalchok_rows"] == 2 and nc["bhotekoshi_rm_rows"] == 1
    assert nc["summary"].startswith("1 of the 2 OPMCM rows filed by DAO Sindhupalchok give a Bhotekoshi Rural Municipality address")
    assert F.name_collision(items[2:], gaz) is None
