#!/usr/bin/env python3
"""Validate the complete surface-change raster bundle and upstream agreement."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import rowcol


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--products", required=True)
    parser.add_argument("--upstream-csv")
    parser.add_argument("--output", required=True)
    parser.add_argument(
        "--resolution-tag",
        default="32m",
        help="Filename suffix for the product grid, for example 32m or 10m",
    )
    return parser.parse_args()


def read(path: Path) -> tuple[np.ndarray, rasterio.DatasetReader]:
    dataset = rasterio.open(path)
    values = dataset.read(1)
    return values, dataset


def valid(array: np.ndarray, nodata: float | int | None) -> np.ndarray:
    mask = np.isfinite(array)
    if nodata is not None:
        mask &= array != nodata
    return mask


def bundle_invariants(products: Path, resolution_tag: str = "32m") -> dict:
    change, change_ds = read(products / f"surface_change_{resolution_tag}.tif")
    uncertainty, uncertainty_ds = read(products / f"uncertainty_{resolution_tag}.tif")
    support, support_ds = read(products / f"support_count_{resolution_tag}.tif")
    coverage, coverage_ds = read(products / f"coverage_{resolution_tag}.tif")
    pre, pre_ds = read(products / f"pre_glo30_{resolution_tag}.tif")
    post, post_ds = read(products / f"post_surface_estimate_{resolution_tag}.tif")
    datasets = [uncertainty_ds, support_ds, coverage_ds, pre_ds, post_ds]
    same_grid = all(
        dataset.shape == change_ds.shape
        and dataset.transform == change_ds.transform
        and dataset.crs == change_ds.crs
        for dataset in datasets
    )
    change_valid = valid(change, change_ds.nodata)
    uncertainty_valid = valid(uncertainty, uncertainty_ds.nodata)
    post_valid = valid(post, post_ds.nodata)
    pre_valid = valid(pre, pre_ds.nodata)
    support_valid = support > 0
    coverage_valid = coverage == 1
    masks_consistent = bool(
        np.array_equal(change_valid, uncertainty_valid)
        and np.array_equal(change_valid, support_valid)
        and np.array_equal(change_valid, coverage_valid)
        and np.array_equal(change_valid, post_valid)
    )
    equation_error = np.abs(post[change_valid] - (pre[change_valid] + change[change_valid]))
    return {
        "sameGrid": same_grid,
        "masksConsistent": masks_consistent,
        "measuredCells": int(change_valid.sum()),
        "preValidCells": int(pre_valid.sum()),
        "uncertaintyPositive": bool(np.all(uncertainty[change_valid] > 0)),
        "postEquationMaxErrorM": float(equation_error.max()) if equation_error.size else None,
        "postEquationPass": bool(equation_error.size and equation_error.max() < 0.01),
        "changeMedianM": float(np.median(change[change_valid])) if change_valid.any() else None,
        "changeP10M": float(np.percentile(change[change_valid], 10)) if change_valid.any() else None,
        "changeP90M": float(np.percentile(change[change_valid], 90)) if change_valid.any() else None,
        "uncertaintyMedianM": float(np.median(uncertainty[change_valid])) if change_valid.any() else None,
        "transform": list(change_ds.transform)[:6],
        "crs": str(change_ds.crs),
        "shape": list(change_ds.shape),
    }


def upstream_comparison(
    products: Path, upstream_path: str | None, resolution_tag: str = "32m"
) -> dict | None:
    if not upstream_path:
        return None
    change, dataset = read(products / f"surface_change_{resolution_tag}.tif")
    change_valid = valid(change, dataset.nodata)
    observed: list[float] = []
    upstream: list[float] = []
    for record in csv.DictReader(open(upstream_path)):
        row, col = rowcol(dataset.transform, float(record["x"]), float(record["y"]))
        if 0 <= row < dataset.height and 0 <= col < dataset.width and change_valid[row, col]:
            observed.append(float(change[row, col]))
            upstream.append(float(record["dh_m"]))
    if len(observed) < 3:
        return {"sampleCount": len(observed), "correlation": None, "medianAbsoluteDifferenceM": None}
    observed_array = np.array(observed)
    upstream_array = np.array(upstream)
    correlation = float(np.corrcoef(observed_array, upstream_array)[0, 1])
    return {
        "sampleCount": len(observed),
        "correlation": correlation,
        "rSquared": correlation * correlation,
        "medianAbsoluteDifferenceM": float(np.median(np.abs(observed_array - upstream_array))),
        "observedMedianM": float(np.median(observed_array)),
        "upstreamMedianM": float(np.median(upstream_array)),
    }


def main() -> None:
    args = parse_args()
    products = Path(args.products)
    invariants = bundle_invariants(products, args.resolution_tag)
    comparison = upstream_comparison(products, args.upstream_csv, args.resolution_tag)
    passed = bool(
        invariants["sameGrid"]
        and invariants["masksConsistent"]
        and invariants["uncertaintyPositive"]
        and invariants["postEquationPass"]
        and invariants["measuredCells"] > 0
    )
    result = {
        "schemaVersion": 1,
        "resolutionTag": args.resolution_tag,
        "passed": passed,
        "invariants": invariants,
        "upstreamComparison": comparison,
        "note": "Upstream agreement is diagnostic, not ground truth. Bundle invariants are mandatory.",
    }
    Path(args.output).write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))
    if not passed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
