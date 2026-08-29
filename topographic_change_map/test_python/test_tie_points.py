from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).parents[1] / "python"))
from tie_points import extract_tie_points  # noqa: E402


def textured_image(size: int = 256) -> np.ndarray:
    rng = np.random.default_rng(42)
    image = rng.normal(120, 30, (size, size)).astype(np.float32)
    for center in [(60, 70), (170, 80), (120, 190)]:
        cv2.circle(image, center, 15, 230, -1)
    return image


def test_recovers_known_shift() -> None:
    reference = textured_image()
    shift_x_px, shift_y_px = 4.25, -3.5
    matrix = np.float32([[1, 0, shift_x_px], [0, 1, shift_y_px]])
    target = cv2.warpAffine(reference, matrix, reference.shape[::-1], borderValue=0)
    gt = (300000.0, 2.0, 0.0, 3200000.0, 0.0, -2.0)
    points = extract_tie_points(
        reference,
        target,
        gt,
        gt,
        grid_res=64,
        window_size=64,
        max_shift=10,
        min_reliability=10,
        nodata=0,
        ransac=False,
        min_std=2,
        workers=2,
    )
    assert len(points["x_map"]) >= 4
    assert abs(np.median(points["x_shift_m"]) - shift_x_px * 2) < 0.8
    assert abs(np.median(points["y_shift_m"]) - (-shift_y_px * 2)) < 0.8


def test_rejects_flat_windows() -> None:
    flat = np.full((128, 128), 100, dtype=np.float32)
    gt = (0.0, 1.0, 0.0, 128.0, 0.0, -1.0)
    points = extract_tie_points(
        flat,
        flat,
        gt,
        gt,
        grid_res=32,
        window_size=64,
        max_shift=10,
        min_reliability=1,
        nodata=0,
        ransac=False,
        min_std=2,
    )
    assert len(points["x_map"]) == 0
