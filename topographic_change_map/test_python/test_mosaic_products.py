from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parents[1] / "python"))
from mosaic_products import require_promotion, select_lower_uncertainty  # noqa: E402


def test_prefers_valid_lower_uncertainty_candidate() -> None:
    current_change = np.array([[1.0, np.nan], [3.0, 4.0]])
    current_uncertainty = np.array([[5.0, np.nan], [2.0, 8.0]])
    candidate_change = np.array([[2.0, 6.0], [7.0, np.nan]])
    candidate_uncertainty = np.array([[3.0, 4.0], [6.0, np.nan]])
    selected = select_lower_uncertainty(
        current_change, current_uncertainty, candidate_change, candidate_uncertainty
    )
    assert selected.tolist() == [[True, True], [False, False]]


def test_mosaic_refuses_missing_promotion(tmp_path: Path) -> None:
    with pytest.raises(RuntimeError, match="Missing promotion"):
        require_promotion(tmp_path)


def test_mosaic_accepts_explicit_promotion(tmp_path: Path) -> None:
    (tmp_path / "promotion.json").write_text(
        '{"promotedToMosaic":true,"accuracyClass":"RESEARCH_ONLY"}\n'
    )
    assert require_promotion(tmp_path)["promotedToMosaic"] is True
