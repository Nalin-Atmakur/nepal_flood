from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "python"))
from quality_gate import evaluate  # noqa: E402


def valid_summary() -> dict:
    return {
        "stableNmadChangeM": 4.2,
        "stableTiePoints": 1000,
        "corridorTiePoints": 250,
        "supportedAreaKm2": 1.1,
    }


def test_public_ortho_pair_can_be_promoted_only_as_research() -> None:
    result = evaluate(valid_summary(), {"passed": True})
    assert result["promotedToMosaic"]
    assert result["accuracyClass"] == "RESEARCH_ONLY"


def test_failed_bundle_cannot_be_promoted() -> None:
    result = evaluate(valid_summary(), {"passed": False})
    assert not result["promotedToMosaic"]
    assert result["accuracyClass"] == "FAILED"


def test_excess_stable_error_is_rejected() -> None:
    summary = valid_summary()
    summary["stableNmadChangeM"] = 7.0
    result = evaluate(summary, {"passed": True})
    assert not result["checks"]["stableNmad"]
    assert not result["promotedToMosaic"]
