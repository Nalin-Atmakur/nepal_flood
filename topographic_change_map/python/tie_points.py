"""Dense, deterministic phase-correlation tie points for co-gridded orthoimages.

Implements the interface expected by the MIT-licensed upstream Bhote Koshi
reconstruction while keeping every quality filter explicit and testable.
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np


@dataclass(frozen=True)
class Candidate:
    row: int
    col: int


def _window_candidate(
    candidate: Candidate,
    reference: np.ndarray,
    target: np.ndarray,
    window: np.ndarray,
    window_size: int,
    max_shift: float,
    nodata: float,
    min_std: float,
    min_range_fraction: float,
    max_mean: float,
) -> tuple[int, int, float, float, float] | None:
    half = window_size // 2
    row, col = candidate.row, candidate.col
    ref = reference[row - half : row + half, col - half : col + half]
    tgt = target[row - half : row + half, col - half : col + half]
    if ref.shape != (window_size, window_size) or tgt.shape != ref.shape:
        return None
    valid = (ref != nodata) & (tgt != nodata) & np.isfinite(ref) & np.isfinite(tgt)
    if valid.mean() < 0.8:
        return None
    ref_values = ref[valid].astype(np.float32)
    tgt_values = tgt[valid].astype(np.float32)
    if ref_values.std() < min_std or tgt_values.std() < min_std:
        return None
    if ref_values.mean() > max_mean or tgt_values.mean() > max_mean:
        return None
    full_range = max(float(reference.max() - reference.min()), float(target.max() - target.min()), 1.0)
    if (np.ptp(ref_values) / full_range) < min_range_fraction or (np.ptp(tgt_values) / full_range) < min_range_fraction:
        return None

    ref_work = np.where(valid, ref, np.median(ref_values)).astype(np.float32)
    tgt_work = np.where(valid, tgt, np.median(tgt_values)).astype(np.float32)
    ref_work -= ref_work.mean()
    tgt_work -= tgt_work.mean()
    cross_power = np.fft.fft2(ref_work * window) * np.conj(
        np.fft.fft2(tgt_work * window)
    )
    correlation = np.abs(
        np.fft.ifft2(cross_power / (np.abs(cross_power) + 1e-12))
    )
    peak_row, peak_col = np.unravel_index(np.argmax(correlation), correlation.shape)

    def subpixel(row: int, col: int, axis: int) -> float:
        if axis == 0:
            previous = correlation[(row - 1) % window_size, col]
            center = correlation[row, col]
            following = correlation[(row + 1) % window_size, col]
        else:
            previous = correlation[row, (col - 1) % window_size]
            center = correlation[row, col]
            following = correlation[row, (col + 1) % window_size]
        denominator = previous - 2 * center + following
        return float(0.5 * (previous - following) / denominator) if abs(denominator) > 1e-12 else 0.0

    dy = (peak_row if peak_row < window_size // 2 else peak_row - window_size) + subpixel(
        peak_row, peak_col, 0
    )
    dx = (peak_col if peak_col < window_size // 2 else peak_col - window_size) + subpixel(
        peak_row, peak_col, 1
    )
    peak_mask = np.zeros_like(correlation, dtype=bool)
    for row_offset in (-1, 0, 1):
        for col_offset in (-1, 0, 1):
            peak_mask[
                (peak_row + row_offset) % window_size,
                (peak_col + col_offset) % window_size,
            ] = True
    peak_mean = float(correlation[peak_mask].mean())
    background = correlation[~peak_mask]
    reliability = float(
        np.clip(
            100.0
            - 100.0 * (float(background.mean()) + 3.0 * float(background.std())) / max(peak_mean, 1e-12),
            0.0,
            100.0,
        )
    )
    if not np.isfinite(dx) or not np.isfinite(dy) or not np.isfinite(reliability):
        return None
    if abs(dx) > max_shift or abs(dy) > max_shift:
        return None
    return row, col, float(dx), float(dy), reliability


def extract_tie_points(
    ref: np.ndarray,
    tgt: np.ndarray,
    ref_gt: tuple[float, float, float, float, float, float],
    tgt_gt: tuple[float, float, float, float, float, float],
    grid_res: int,
    window_size: int,
    max_shift: float,
    min_reliability: float,
    nodata: float,
    ransac: bool,
    min_std: float,
    min_range_fraction: float = 0.0,
    max_mean: float = 215.0,
    workers: int = 0,
    candidate_mask: np.ndarray | None = None,
) -> dict[str, Any]:
    """Return world-coordinate shifts between co-gridded rasters.

    `x_shift_m` is east-positive and `y_shift_m` north-positive. The function
    assumes north-up rasters and verifies that both pixel grids are compatible.
    """
    del ransac  # Callers perform stable-terrain bias fitting; no global RANSAC here.
    if ref.ndim != 2 or tgt.ndim != 2:
        raise ValueError("ref and tgt must be 2D arrays")
    if ref.shape != tgt.shape:
        raise ValueError("ref and tgt must share a grid and shape")
    if candidate_mask is not None and candidate_mask.shape != ref.shape:
        raise ValueError("candidate_mask must share the input shape")
    if window_size < 16 or window_size % 2:
        raise ValueError("window_size must be an even integer >= 16")
    if grid_res < 1:
        raise ValueError("grid_res must be positive")
    if not np.isclose(ref_gt[1], tgt_gt[1]) or not np.isclose(ref_gt[5], tgt_gt[5]):
        raise ValueError("input pixel sizes differ")
    if not np.isclose(ref_gt[0], tgt_gt[0]) or not np.isclose(ref_gt[3], tgt_gt[3]):
        raise ValueError("input origins differ")

    half = window_size // 2
    candidates = [
        Candidate(row, col)
        for row in range(half, ref.shape[0] - half, grid_res)
        for col in range(half, ref.shape[1] - half, grid_res)
        if candidate_mask is None or candidate_mask[row, col]
    ]
    hanning = cv2.createHanningWindow((window_size, window_size), cv2.CV_32F)
    worker_count = workers if workers > 0 else min(16, max(1, len(candidates) // 1000))
    print(
        f"tie-point candidates={len(candidates)} workers={worker_count} "
        f"window={window_size}px spacing={grid_res}px",
        flush=True,
    )

    def evaluate(candidate: Candidate):
        return _window_candidate(
            candidate,
            ref,
            tgt,
            hanning,
            window_size,
            max_shift,
            nodata,
            min_std,
            min_range_fraction,
            max_mean,
        )

    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        measured = []
        for index, result in enumerate(
            executor.map(evaluate, candidates, chunksize=64), start=1
        ):
            if result:
                measured.append(result)
            if index % 10_000 == 0 or index == len(candidates):
                print(
                    f"tie-point progress={index}/{len(candidates)} "
                    f"quality-passing={len(measured)}",
                    flush=True,
                )
    measured = [result for result in measured if result[4] >= min_reliability]
    if not measured:
        empty = np.array([], dtype=np.float64)
        return {
            "x_map": empty,
            "y_map": empty,
            "x_shift_m": empty,
            "y_shift_m": empty,
            "reliability": empty,
            "inlier": np.array([], dtype=bool),
        }

    rows = np.array([result[0] for result in measured], dtype=np.float64)
    cols = np.array([result[1] for result in measured], dtype=np.float64)
    dx_px = np.array([result[2] for result in measured], dtype=np.float64)
    dy_px = np.array([result[3] for result in measured], dtype=np.float64)
    reliability = np.array([result[4] for result in measured], dtype=np.float64)
    x_map = ref_gt[0] + (cols + 0.5) * ref_gt[1] + (rows + 0.5) * ref_gt[2]
    y_map = ref_gt[3] + (cols + 0.5) * ref_gt[4] + (rows + 0.5) * ref_gt[5]
    x_shift_m = dx_px * abs(ref_gt[1])
    y_shift_m = -dy_px * abs(ref_gt[5])
    return {
        "x_map": x_map,
        "y_map": y_map,
        "x_shift_m": x_shift_m,
        "y_shift_m": y_shift_m,
        "reliability": reliability,
        "inlier": np.ones(len(measured), dtype=bool),
    }
