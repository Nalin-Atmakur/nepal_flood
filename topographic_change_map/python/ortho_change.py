#!/usr/bin/env python3
"""Approximate surface change from opposite-look public Vantor orthos.

This is not conventional RPC stereo. Both orthos were produced against a
pre-event reference surface; post-event height change leaves an opposing-look
planimetric disagreement. The displacement is projected onto the look axis,
calibrated to zero on stable terrain, and divided by the sum of look tangents.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np
import cv2
import rasterio
from rasterio.transform import from_origin
from rasterio.warp import Resampling, reproject

from tie_points import extract_tie_points


GLO30_URL = (
    "https://copernicus-dem-30m.s3.amazonaws.com/"
    "Copernicus_DSM_COG_10_N28_00_E085_00_DEM/"
    "Copernicus_DSM_COG_10_N28_00_E085_00_DEM.tif"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--left", required=True)
    parser.add_argument("--right", required=True)
    parser.add_argument("--centerline", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--left-scene-id", required=True)
    parser.add_argument("--right-scene-id", required=True)
    parser.add_argument("--left-off-nadir-deg", required=True, type=float)
    parser.add_argument("--right-off-nadir-deg", required=True, type=float)
    parser.add_argument("--left-azimuth-deg", required=True, type=float)
    parser.add_argument("--right-azimuth-deg", required=True, type=float)
    parser.add_argument("--grid-res-px", type=int, default=32)
    parser.add_argument("--window-size", type=int, default=96)
    parser.add_argument("--output-res-m", type=float, default=32.0)
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--min-reliability", type=float, default=25.0)
    parser.add_argument("--candidate-buffer-m", type=float, default=0.0)
    parser.add_argument("--glo30-url", default=GLO30_URL)
    return parser.parse_args()


def robust_nmad(values: np.ndarray) -> float:
    median = np.median(values)
    return float(1.4826 * np.median(np.abs(values - median)))


def parallax_sensitivity(
    left_off_nadir_deg: float,
    left_azimuth_deg: float,
    right_off_nadir_deg: float,
    right_azimuth_deg: float,
) -> tuple[np.ndarray, float]:
    """Horizontal relative displacement per metre of height change."""
    left_azimuth = np.radians(left_azimuth_deg)
    right_azimuth = np.radians(right_azimuth_deg)
    vector = np.array(
        [
            np.tan(np.radians(left_off_nadir_deg)) * np.sin(left_azimuth)
            - np.tan(np.radians(right_off_nadir_deg)) * np.sin(right_azimuth),
            np.tan(np.radians(left_off_nadir_deg)) * np.cos(left_azimuth)
            - np.tan(np.radians(right_off_nadir_deg)) * np.cos(right_azimuth),
        ]
    )
    magnitude = float(np.linalg.norm(vector))
    if magnitude < 0.1:
        raise ValueError("Viewing geometry has insufficient height sensitivity")
    return vector / magnitude, magnitude


def centerline_arrays(path: str) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rows = list(csv.DictReader(open(path)))
    return (
        np.array([float(row["x_utm45"]) for row in rows]),
        np.array([float(row["y_utm45"]) for row in rows]),
        np.array([float(row["chainage_m"]) for row in rows]),
    )


def nearest_centerline(
    x: np.ndarray,
    y: np.ndarray,
    cx: np.ndarray,
    cy: np.ndarray,
    chainage: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    sample = slice(None, None, 4)
    sx, sy, schain = cx[sample], cy[sample], chainage[sample]
    distance = np.empty(len(x), dtype=np.float64)
    matched_chainage = np.empty(len(x), dtype=np.float64)
    batch = 4000
    for start in range(0, len(x), batch):
        stop = min(len(x), start + batch)
        squared = (x[start:stop, None] - sx[None, :]) ** 2 + (
            y[start:stop, None] - sy[None, :]
        ) ** 2
        nearest = np.argmin(squared, axis=1)
        distance[start:stop] = np.sqrt(squared[np.arange(stop - start), nearest])
        matched_chainage[start:stop] = schain[nearest]
    return distance, matched_chainage


def grid_points(
    x: np.ndarray,
    y: np.ndarray,
    values: np.ndarray,
    reliability: np.ndarray,
    transform: rasterio.Affine,
    width: int,
    height: int,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    cols = np.floor((x - transform.c) / transform.a).astype(int)
    rows = np.floor((transform.f - y) / abs(transform.e)).astype(int)
    valid = (rows >= 0) & (rows < height) & (cols >= 0) & (cols < width)
    buckets: dict[tuple[int, int], list[tuple[float, float]]] = {}
    for row, col, value, rel in zip(
        rows[valid], cols[valid], values[valid], reliability[valid]
    ):
        buckets.setdefault((int(row), int(col)), []).append((float(value), float(rel)))
    change = np.full((height, width), np.nan, dtype=np.float32)
    support = np.zeros((height, width), dtype=np.uint16)
    rel_grid = np.full((height, width), np.nan, dtype=np.float32)
    for (row, col), entries in buckets.items():
        change[row, col] = np.median([entry[0] for entry in entries])
        rel_grid[row, col] = np.median([entry[1] for entry in entries])
        support[row, col] = len(entries)
    return change, support, rel_grid


def write_raster(
    path: Path,
    array: np.ndarray,
    transform: rasterio.Affine,
    dtype: str,
    nodata: float | int,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        width=array.shape[1],
        height=array.shape[0],
        count=1,
        dtype=dtype,
        crs="EPSG:32645",
        transform=transform,
        nodata=nodata,
        compress="deflate",
        tiled=True,
        blockxsize=256,
        blockysize=256,
    ) as destination:
        destination.write(array.astype(dtype), 1)


def main() -> None:
    args = parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    with rasterio.open(args.left) as left, rasterio.open(args.right) as right:
        if left.crs != right.crs or left.transform != right.transform or left.shape != right.shape:
            raise RuntimeError("Inputs must share an identical projected grid")
        left_array = left.read(1)
        right_array = right.read(1)
        source_transform = left.transform
        source_crs = left.crs
        source_width, source_height = left.width, left.height
    if str(source_crs) != "EPSG:32645":
        raise RuntimeError("Inputs must use EPSG:32645")

    cx, cy, centerline_chainage = centerline_arrays(args.centerline)
    candidate_mask = None
    if args.candidate_buffer_m > 0:
        candidate_mask = np.zeros(left_array.shape, dtype=np.uint8)
        centerline_cols = np.round((cx - source_transform.c) / source_transform.a).astype(np.int32)
        centerline_rows = np.round((source_transform.f - cy) / abs(source_transform.e)).astype(np.int32)
        centerline_pixels = np.column_stack([centerline_cols, centerline_rows])
        centerline_pixels = centerline_pixels[
            (centerline_cols >= 0)
            & (centerline_cols < source_width)
            & (centerline_rows >= 0)
            & (centerline_rows < source_height)
        ]
        if len(centerline_pixels) >= 2:
            cv2.polylines(
                candidate_mask,
                [centerline_pixels.reshape(-1, 1, 2)],
                isClosed=False,
                color=1,
                thickness=max(
                    1,
                    round(
                        2 * args.candidate_buffer_m / abs(source_transform.a)
                    ),
                ),
            )
        candidate_mask = candidate_mask.astype(bool)
    points = extract_tie_points(
        left_array,
        right_array,
        source_transform.to_gdal(),
        source_transform.to_gdal(),
        grid_res=args.grid_res_px,
        window_size=args.window_size,
        max_shift=100,
        min_reliability=args.min_reliability,
        nodata=0,
        ransac=False,
        min_std=1.2,
        min_range_fraction=0.002,
        workers=args.workers,
        candidate_mask=candidate_mask,
    )
    x, y = points["x_map"], points["y_map"]
    if len(x) < 100:
        raise RuntimeError(f"Only {len(x)} reliable tie points")
    reliability = points["reliability"]
    axis, sensitivity = parallax_sensitivity(
        args.left_off_nadir_deg,
        args.left_azimuth_deg,
        args.right_off_nadir_deg,
        args.right_azimuth_deg,
    )
    along = points["x_shift_m"] * axis[0] + points["y_shift_m"] * axis[1]
    distance, chainage = nearest_centerline(x, y, cx, cy, centerline_chainage)

    stable = distance > 500
    if stable.sum() < 30:
        raise RuntimeError("Insufficient stable-terrain tie points")
    centered_x, centered_y = x - x.mean(), y - y.mean()
    design = np.column_stack(
        [np.ones(stable.sum()), centered_x[stable], centered_y[stable]]
    )
    coefficients, *_ = np.linalg.lstsq(design, along[stable], rcond=None)
    bias = (
        coefficients[0]
        + coefficients[1] * centered_x
        + coefficients[2] * centered_y
    )
    residual_along = along - bias
    stable_residual = residual_along[stable]
    stable_sigma_along = robust_nmad(stable_residual)
    base_uncertainty_m = stable_sigma_along / sensitivity
    change_values = residual_along / sensitivity

    physical = np.isfinite(change_values) & (np.abs(change_values) <= 40)
    corridor = distance <= 600
    measured = physical & corridor

    output_transform = from_origin(
        source_transform.c,
        source_transform.f,
        args.output_res_m,
        args.output_res_m,
    )
    output_width = int(np.ceil(source_width * source_transform.a / args.output_res_m))
    output_height = int(
        np.ceil(source_height * abs(source_transform.e) / args.output_res_m)
    )
    change, support, rel_grid = grid_points(
        x[measured],
        y[measured],
        change_values[measured],
        reliability[measured],
        output_transform,
        output_width,
        output_height,
    )
    uncertainty = np.where(
        np.isfinite(change),
        base_uncertainty_m
        * np.sqrt(100.0 / np.clip(rel_grid, args.min_reliability, 100.0)),
        np.nan,
    ).astype(np.float32)
    valid = np.isfinite(change)
    change_out = np.where(valid, change, -9999.0)
    uncertainty_out = np.where(valid, uncertainty, -9999.0)
    coverage = np.where(valid, 1, 0).astype(np.uint8)

    write_raster(output / "surface_change_32m.tif", change_out, output_transform, "float32", -9999.0)
    write_raster(output / "uncertainty_32m.tif", uncertainty_out, output_transform, "float32", -9999.0)
    write_raster(output / "support_count_32m.tif", support, output_transform, "uint16", 0)
    write_raster(output / "coverage_32m.tif", coverage, output_transform, "uint8", 0)
    significance = np.full(change.shape, -128, dtype=np.int8)
    significance[valid] = 0
    significance[valid & (np.abs(change) > 2 * uncertainty) & (change > 0)] = 1
    significance[valid & (np.abs(change) > 2 * uncertainty) & (change < 0)] = -1
    write_raster(
        output / "significant_change_32m.tif",
        significance,
        output_transform,
        "int8",
        -128,
    )

    pre_dem = np.full((output_height, output_width), -9999.0, dtype=np.float32)
    env = {
        "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
        "GDAL_HTTP_MULTIRANGE": "YES",
        "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".tif,.TIF",
    }
    with rasterio.Env(**env), rasterio.open(args.glo30_url) as source:
        reproject(
            source=rasterio.band(source, 1),
            destination=pre_dem,
            src_transform=source.transform,
            src_crs=source.crs,
            src_nodata=source.nodata,
            dst_transform=output_transform,
            dst_crs="EPSG:32645",
            dst_nodata=-9999.0,
            resampling=Resampling.bilinear,
        )
    post_dem = np.where(valid & (pre_dem != -9999.0), pre_dem + change, -9999.0)
    write_raster(output / "pre_glo30_32m.tif", pre_dem, output_transform, "float32", -9999.0)
    write_raster(output / "post_surface_estimate_32m.tif", post_dem, output_transform, "float32", -9999.0)

    with open(output / "tie_points.csv", "w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "x_utm45",
                "y_utm45",
                "chainage_m",
                "distance_to_centerline_m",
                "surface_change_m",
                "reliability",
                "stable",
            ]
        )
        for index in range(len(x)):
            writer.writerow(
                [
                    f"{x[index]:.2f}",
                    f"{y[index]:.2f}",
                    f"{chainage[index]:.1f}",
                    f"{distance[index]:.1f}",
                    f"{change_values[index]:.3f}",
                    f"{reliability[index]:.2f}",
                    int(stable[index]),
                ]
            )

    stable_change = change_values[stable & physical]
    corridor_change = change_values[measured]
    summary = {
        "schemaVersion": 1,
        "method": "opposite-look orthorectified-image parallax",
        "leftSceneId": args.left_scene_id,
        "rightSceneId": args.right_scene_id,
        "leftOffNadirDeg": args.left_off_nadir_deg,
        "rightOffNadirDeg": args.right_off_nadir_deg,
        "leftAzimuthDeg": args.left_azimuth_deg,
        "rightAzimuthDeg": args.right_azimuth_deg,
        "parallaxAxisEastNorth": [float(axis[0]), float(axis[1])],
        "horizontalSensitivityPerHeight": sensitivity,
        "tiePoints": int(len(x)),
        "stableTiePoints": int(stable.sum()),
        "corridorTiePoints": int(measured.sum()),
        "stableMedianChangeM": float(np.median(stable_change)),
        "stableNmadChangeM": float(robust_nmad(stable_change)),
        "baseUncertaintyM": float(base_uncertainty_m),
        "minimumReliability": args.min_reliability,
        "candidateBufferM": args.candidate_buffer_m,
        "corridorMedianChangeM": float(np.median(corridor_change)),
        "corridorP10ChangeM": float(np.percentile(corridor_change, 10)),
        "corridorP90ChangeM": float(np.percentile(corridor_change, 90)),
        "supportedCells": int(valid.sum()),
        "supportedAreaKm2": float(valid.sum() * args.output_res_m**2 / 1e6),
        "significantCells2Sigma": int(
            ((significance == 1) | (significance == -1)).sum()
        ),
        "absoluteHeightSource": "Copernicus GLO-30 broad baseline",
        "accuracyClass": "RESEARCH_ONLY",
        "limitations": [
            "Public orthos lack original camera models.",
            "Look angles are treated as constant over the working extent.",
            "GLO-30 is too coarse for building-level burial depth.",
            "Only cells with direct tie-point support are published as measured change.",
        ],
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
