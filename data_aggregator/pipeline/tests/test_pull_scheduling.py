"""(02) scheduling — due-ness, per-source backoff, --only lists and the fetch-pool plumbing. Pure; no network."""
from datetime import datetime, timedelta, timezone

import pull_external_data as P
from lib import config
from lib.state import State

NOW = datetime(2026, 8, 30, 3, 0, tzinfo=timezone.utc)


def test_backoff_doubles_per_failure_and_caps_at_24h():
    assert P.backoff_minutes(30, 0) == 30
    assert [P.backoff_minutes(30, n) for n in (1, 2, 3)] == [60, 120, 240]
    assert P.backoff_minutes(30, 6) == 1440 and P.backoff_minutes(30, 40) == 1440   # cap, and no overflow
    assert P.backoff_minutes(config.STATIC_MINUTES, 0) == 60                      # a failed static source behaves like hourly
    assert P.backoff_minutes(config.STATIC_MINUTES, 2) == 240


def test_failures_counter_in_state(tmp_path):
    st = State(tmp_path / "s.json")
    for _ in range(3):
        st.record_fetch("x", ok=False, etag=None, last_modified=None, body_hash=None, at=NOW)
    assert st.failures("x") == 3
    st.record_fetch("x", ok=True, etag='"e"', last_modified=None, body_hash="h", at=NOW)
    assert st.failures("x") == 0 and st.source("x")["etag"] == '"e"'
    st.save()
    assert State(tmp_path / "s.json").failures("x") == 0


def test_is_due_respects_backoff(tmp_path):
    st = State(tmp_path / "s.json")
    src = {"id": "s", "cadence": "30m", "url": "https://x"}
    assert P.is_due(st, src, NOW)                                                  # never fetched
    st.record_fetch("s", ok=False, etag=None, last_modified=None, body_hash=None, at=NOW)
    assert not P.is_due(st, src, NOW + timedelta(minutes=45))                      # 1 failure → wait 60 min, not 30
    assert P.is_due(st, src, NOW + timedelta(minutes=61))
    st.record_fetch("s", ok=True, etag=None, last_modified=None, body_hash=None, at=NOW)
    assert not P.is_due(st, src, NOW + timedelta(minutes=29)) and P.is_due(st, src, NOW + timedelta(minutes=30))


def test_static_source_is_due_once_then_retried_on_failure(tmp_path):
    st = State(tmp_path / "s.json")
    src = {"id": "st", "cadence": "static (fetch once)", "url": "https://x"}
    assert P.is_due(st, src, NOW)
    st.record_fetch("st", ok=False, etag=None, last_modified=None, body_hash=None, at=NOW)
    assert not P.is_due(st, src, NOW + timedelta(minutes=90)) and P.is_due(st, src, NOW + timedelta(minutes=121))
    st.record_fetch("st", ok=True, etag=None, last_modified=None, body_hash=None, at=NOW)
    assert not P.is_due(st, src, NOW + timedelta(days=30))


def test_select_due_only_force_and_no_url(tmp_path):
    st = State(tmp_path / "s.json")
    srcs = [{"id": "a", "cadence": "30m", "url": "https://a"}, {"id": "b", "cadence": "30m", "url": "https://b"},
            {"id": "c", "cadence": "30m", "url": "n/a — needs discovery"}]
    for sid in ("a", "b"):
        st.record_fetch(sid, ok=True, etag=None, last_modified=None, body_hash=None, at=NOW)
    assert P.select_due(srcs, st, NOW + timedelta(minutes=5), only=[], force=False) == []
    assert [s["id"] for s in P.select_due(srcs, st, NOW, only=[], force=True)] == ["a", "b"]         # c has no url
    assert [s["id"] for s in P.select_due(srcs, st, NOW, only=["b", "c"], force=False)] == ["b"]     # --only skips cadence


def test_prefetch_carries_exceptions_to_the_main_thread(tmp_path, monkeypatch):
    st = State(tmp_path / "s.json")

    def boom(*a, **k):
        raise RuntimeError("socket")

    monkeypatch.setattr(P, "fetch_source", boom)
    pf = P.prefetch({"id": "z", "url": "https://z"}, st, False)
    assert isinstance(pf.error, RuntimeError) and pf.parts == [] and pf.fetched_at.tzinfo is not None
    r = P.Runner(db=None, state=st, gaz=_Gaz(), dry_run=True, force=False).run_source({"id": "z", "url": "https://z"}, pf)
    assert r["ok"] is False and "RuntimeError" in r["error"]
    assert st.failures("z") == 1 and not (tmp_path / "s.json").exists()         # counted in memory; dry-run never saves


class _Gaz:
    def all(self):
        return []

    def get(self, _pid):
        return None
