#!/usr/bin/env python3
"""Sparse correspondence and residual-parallax diagnostics for orthorectified imagery."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np
import rasterio
from rasterio.warp import transform as transform_coordinates


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--left", required=True)
    parser.add_argument("--right", required=True)
    parser.add_argument("--left-id", required=True)
    parser.add_argument("--right-id", required=True)
    parser.add_argument("--aoi-id", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--ratio", type=float, default=0.82)
    parser.add_argument("--ransac-threshold-m", type=float, default=15.0)
    parser.add_argument("--grid-size", type=int, default=10)
    parser.add_argument(
        "--dem-url",
        default="https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N28_00_E085_00_DEM/Copernicus_DSM_COG_10_N28_00_E085_00_DEM.tif",
    )
    return parser.parse_args()


def read_gray(path: str) -> tuple[np.ndarray, np.ndarray, rasterio.Affine, object]:
    with rasterio.open(path) as dataset:
        data = dataset.read()
        mask = dataset.dataset_mask()
        transform = dataset.transform
        crs = dataset.crs
    if data.shape[0] >= 3:
        rgb = np.moveaxis(data[:3], 0, 2)
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    else:
        gray = data[0]
    if gray.dtype != np.uint8:
        valid = gray[mask > 0]
        low, high = np.percentile(valid, [2, 98]) if valid.size else (0, 1)
        gray = np.clip((gray.astype(np.float32) - low) * 255 / max(high - low, 1), 0, 255).astype(np.uint8)
    gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    return gray, mask, transform, crs


def reciprocal_ratio_matches(
    left_descriptors: np.ndarray,
    right_descriptors: np.ndarray,
    ratio: float,
) -> list[cv2.DMatch]:
    matcher = cv2.BFMatcher(cv2.NORM_L2)
    forward = matcher.knnMatch(left_descriptors, right_descriptors, k=2)
    reverse = matcher.knnMatch(right_descriptors, left_descriptors, k=2)
    accepted_forward = {
        first.queryIdx: first
        for pair in forward
        if len(pair) == 2
        for first, second in [pair]
        if first.distance < ratio * second.distance
    }
    accepted_reverse = {
        first.queryIdx: first.trainIdx
        for pair in reverse
        if len(pair) == 2
        for first, second in [pair]
        if first.distance < ratio * second.distance
    }
    return [
        match
        for query, match in accepted_forward.items()
        if accepted_reverse.get(match.trainIdx) == query
    ]


def world_points(keypoints: list[cv2.KeyPoint], transform, crs) -> np.ndarray:
    cols = np.array([keypoint.pt[0] for keypoint in keypoints])
    rows = np.array([keypoint.pt[1] for keypoint in keypoints])
    xs, ys = rasterio.transform.xy(transform, rows, cols, offset="center")
    east, north = transform_coordinates(crs, "EPSG:32645", list(xs), list(ys))
    return np.column_stack([east, north]).astype(np.float64)


def elevation_correlation(
    dem_url: str,
    world: np.ndarray,
    residual_vectors: np.ndarray,
    inliers: np.ndarray,
) -> dict:
    selected_world = world[inliers]
    selected_residuals = residual_vectors[inliers]
    if len(selected_world) < 5:
        return {"sampleCount": 0, "principalResidualVsElevationCorrelation": None, "rSquared": None}
    with rasterio.Env(
        GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
        GDAL_HTTP_MULTIRANGE="YES",
        CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.TIF",
    ), rasterio.open(dem_url) as dem:
        xs, ys = transform_coordinates(
            "EPSG:32645", dem.crs, selected_world[:, 0].tolist(), selected_world[:, 1].tolist()
        )
        elevation = np.array([value[0] for value in dem.sample(zip(xs, ys))], dtype=np.float64)
        valid = np.isfinite(elevation)
        if dem.nodata is not None:
            valid &= elevation != dem.nodata
    if valid.sum() < 5:
        return {"sampleCount": int(valid.sum()), "principalResidualVsElevationCorrelation": None, "rSquared": None}
    residual_centered = selected_residuals - np.mean(selected_residuals, axis=0)
    _, _, directions = np.linalg.svd(residual_centered, full_matrices=False)
    signed_principal = residual_centered @ directions[0]
    correlation = float(np.corrcoef(elevation[valid], signed_principal[valid])[0, 1])
    return {
        "sampleCount": int(valid.sum()),
        "principalResidualDirection": [float(value) for value in directions[0]],
        "principalResidualVsElevationCorrelation": correlation,
        "rSquared": correlation * correlation,
        "dem": "Copernicus GLO-30; coarse diagnostic only",
    }


def main() -> None:
    args = parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    left_gray, left_mask, left_transform, left_crs = read_gray(args.left)
    right_gray, right_mask, right_transform, right_crs = read_gray(args.right)

    sift = cv2.SIFT_create(nfeatures=30000, contrastThreshold=0.02, edgeThreshold=15)
    left_keypoints, left_descriptors = sift.detectAndCompute(left_gray, left_mask)
    right_keypoints, right_descriptors = sift.detectAndCompute(right_gray, right_mask)
    if left_descriptors is None or right_descriptors is None:
        raise RuntimeError("SIFT produced no descriptors")
    matches = reciprocal_ratio_matches(left_descriptors, right_descriptors, args.ratio)
    if len(matches) < 3:
        raise RuntimeError(f"Only {len(matches)} reciprocal ratio matches")

    left_selected = [left_keypoints[match.queryIdx] for match in matches]
    right_selected = [right_keypoints[match.trainIdx] for match in matches]
    left_world = world_points(left_selected, left_transform, left_crs)
    right_world = world_points(right_selected, right_transform, right_crs)
    origin = np.median(np.vstack([left_world, right_world]), axis=0)
    affine, inlier_mask = cv2.estimateAffinePartial2D(
        left_world - origin,
        right_world - origin,
        method=cv2.RANSAC,
        ransacReprojThreshold=args.ransac_threshold_m,
        maxIters=10000,
        confidence=0.999,
        refineIters=50,
    )
    if affine is None or inlier_mask is None:
        raise RuntimeError("RANSAC could not estimate the global alignment")
    inliers = inlier_mask.ravel().astype(bool)
    predicted = cv2.transform((left_world - origin)[None, :, :], affine)[0] + origin
    residual_vectors = right_world - predicted
    residual_magnitudes = np.linalg.norm(residual_vectors, axis=1)

    left_pixels = np.array([keypoint.pt for keypoint in left_selected])
    valid_pixels = left_pixels[inliers]
    occupied: set[tuple[int, int]] = set()
    if valid_pixels.size:
        for x, y in valid_pixels:
            gx = min(args.grid_size - 1, max(0, int(x / left_gray.shape[1] * args.grid_size)))
            gy = min(args.grid_size - 1, max(0, int(y / left_gray.shape[0] * args.grid_size)))
            occupied.add((gx, gy))
    support_fraction = len(occupied) / (args.grid_size * args.grid_size)

    inlier_residuals = residual_magnitudes[inliers]
    direct_offsets = right_world - left_world
    quality_verdict = (
        "PASS_LIMITED_PARALLAX"
        if len(matches) >= 100
        and int(inliers.sum()) >= 50
        and float(inliers.mean()) >= 0.3
        and support_fraction >= 0.15
        else "FAIL_SPARSE_CORRESPONDENCE"
    )
    correlation = elevation_correlation(
        args.dem_url, left_world, residual_vectors, inliers
    )
    summary = {
        "schemaVersion": 1,
        "aoiId": args.aoi_id,
        "leftSceneId": args.left_id,
        "rightSceneId": args.right_id,
        "algorithm": "SIFT reciprocal ratio + RANSAC partial affine in EPSG:32645",
        "leftKeypoints": len(left_keypoints),
        "rightKeypoints": len(right_keypoints),
        "reciprocalRatioMatches": len(matches),
        "ransacInliers": int(inliers.sum()),
        "inlierFraction": float(inliers.mean()),
        "gridSize": args.grid_size,
        "occupiedGridCells": len(occupied),
        "spatialSupportFraction": support_fraction,
        "directOffsetMedianM": [float(value) for value in np.median(direct_offsets[inliers], axis=0)],
        "residualMedianM": float(np.median(inlier_residuals)),
        "residualP90M": float(np.percentile(inlier_residuals, 90)),
        "residualMaxM": float(np.max(inlier_residuals)),
        "globalAffineLocalUtm": affine.tolist(),
        "qualityVerdict": quality_verdict,
        "elevationDiagnostic": correlation,
        "absoluteHeightRecoverable": False,
        "limitation": "Orthorectified public products lack rigorous camera models; residuals cannot be converted defensibly to height.",
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")

    features = []
    for index in np.flatnonzero(inliers)[:5000]:
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(left_world[index, 0]), float(left_world[index, 1])],
                },
                "properties": {
                    "residualDxM": float(residual_vectors[index, 0]),
                    "residualDyM": float(residual_vectors[index, 1]),
                    "residualM": float(residual_magnitudes[index]),
                },
            }
        )
    (output / "inlier-residuals-utm45n.geojson").write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "name": "Sparse residual parallax; EPSG:32645",
                "features": features,
            }
        )
        + "\n"
    )

    selected_matches = [matches[index] for index in np.flatnonzero(inliers)[:150]]
    visual = cv2.drawMatches(
        left_gray,
        left_keypoints,
        right_gray,
        right_keypoints,
        selected_matches,
        None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS,
    )
    cv2.imwrite(str(output / "matches.jpg"), visual, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
