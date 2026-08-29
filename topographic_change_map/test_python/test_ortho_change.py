from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from rasterio.transform import from_origin

sys.path.insert(0, str(Path(__file__).parents[1] / "python"))
from ortho_change import grid_points, parallax_sensitivity, robust_nmad  # noqa: E402


def test_robust_nmad_ignores_large_outlier() -> None:
    values = np.array([-1.0, -0.5, 0.0, 0.5, 1.0, 100.0])
    assert robust_nmad(values) < 2.0


def test_grid_points_leaves_unsupported_cells_empty() -> None:
    transform = from_origin(0, 64, 32, 32)
    change, support, reliability = grid_points(
        np.array([16.0, 18.0]),
        np.array([48.0, 46.0]),
        np.array([4.0, 6.0]),
        np.array([80.0, 90.0]),
        transform,
        2,
        2,
    )
    assert change[0, 0] == 5.0
    assert support[0, 0] == 2
    assert reliability[0, 0] == 85.0
    assert np.isnan(change[1, 1])


def test_opposite_looks_have_sum_of_tangents_sensitivity() -> None:
    axis, sensitivity = parallax_sensitivity(20.0, 0.0, 30.0, 180.0)
    expected = np.tan(np.radians(20.0)) + np.tan(np.radians(30.0))
    assert abs(sensitivity - expected) < 1e-9
    assert abs(axis[0]) < 1e-9
    assert axis[1] > 0
