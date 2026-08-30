"""Archive-only intake: questionnaire data never crosses into process_data."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from lib import config
from processing import ProcCtx
from processing import anonymise, dedup, ledger, place_now, report_counts, resolve_places, stats
from process_data import finalise_statuses


NOW = datetime(2026, 8, 30, 12, 0, tzinfo=timezone.utc)
FAMILY_TABLES = {"reports_archive", "reports_anon", "report_counts"}


class NoFamilyDb:
    """Public-source DB stub that fails if archive-only code touches family tables."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []

    def _check(self, method: str, table: str) -> None:
        self.calls.append((method, table))
        if table in FAMILY_TABLES:
            raise AssertionError(f"archive-only pipeline touched {table} via {method}")

    def select(self, table: str, _params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        self._check("select", table)
        if table == "v_live_counts":
            return [{"last_pull_at": "2026-08-30T11:30:00+00:00"}]
        return []

    def select_all(self, table: str, _params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        self._check("select_all", table)
        return []

    def count(self, table: str, _params: dict[str, Any] | None = None) -> int:
        self._check("count", table)
        return 0

    def update(self, table: str, _match: dict[str, Any], _values: dict[str, Any]) -> None:
        self._check("update", table)

    def upsert(self, table: str, _rows: list[dict[str, Any]], **_kw: Any) -> None:
        self._check("upsert", table)


class NoLlm:
    def can_call(self) -> tuple[bool, str]:
        raise AssertionError("archive-only family path consulted the LLM")

    def complete_json(self, *_args: Any, **_kwargs: Any) -> dict[str, Any]:
        raise AssertionError("archive-only family path called the LLM")


def archive_ctx(db: NoFamilyDb, gaz: Any, state: Any) -> ProcCtx:
    return ProcCtx(db=db, gaz=gaz, llm=NoLlm(), state=state,
                   family_report_processing_enabled=False, dry_run=True, now=NOW)


def test_flag_is_fail_closed_and_runtime(monkeypatch):
    monkeypatch.delenv("FAMILY_REPORT_PROCESSING_ENABLED", raising=False)
    assert config.family_report_processing_enabled() is False
    for value in ("", "false", "0", "disabled", "unexpected"):
        monkeypatch.setenv("FAMILY_REPORT_PROCESSING_ENABLED", value)
        assert config.family_report_processing_enabled() is False
    for value in ("1", "true", "TRUE", "yes", "on"):
        monkeypatch.setenv("FAMILY_REPORT_PROCESSING_ENABLED", value)
        assert config.family_report_processing_enabled() is True


def test_family_entrypoints_do_not_read_or_project_archive_rows(gaz, state):
    db = NoFamilyDb()
    ctx = archive_ctx(db, gaz, state)

    out = anonymise.run(ctx)
    assert out["reports"] == {"mode": "archive_only", "read": 0, "written": 0}
    assert out["withdrawn"] == {"skipped": "archive_only"}
    assert out["opmcm"] == {"projected": 0}
    assert resolve_places.resolve_reports(ctx)["skipped"] == "archive_only"
    assert dedup.form_records(ctx) == []
    assert report_counts.run(ctx)["skipped"] == "archive_only"
    assert finalise_statuses(ctx) == {"processed": 0, "archive_only": 1}


def test_public_derived_steps_ignore_family_tables(gaz, state):
    db = NoFamilyDb()
    ctx = archive_ctx(db, gaz, state)

    ledger_result = ledger.run(ctx)
    assert ledger_result == {"places": 0, "timeline": 0, "with_unknown": 0}
    assert place_now.run(ctx) == {"places": 0, "polished": 0, "written": 0}

    live = stats.compute_live(ctx)
    ids = {row["id"] for row in live}
    assert "reports_total" not in ids
    assert "reports_last_hour" not in ids
    assert "submissions_today" not in ids
    assert not any(table in FAMILY_TABLES for _method, table in db.calls)
