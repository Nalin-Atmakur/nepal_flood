#!/usr/bin/env python3
"""Add a conservative significance classification to a product bundle."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import rasterio


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--products", required=True)
    parser.add_argument("--sigma", type=float, default=2.0)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    products = Path(args.products)
    with rasterio.open(products / "surface_change_32m.tif") as change_ds, rasterio.open(
        products / "uncertainty_32m.tif"
    ) as uncertainty_ds:
        change = change_ds.read(1).astype(np.float32)
        uncertainty = uncertainty_ds.read(1).astype(np.float32)
        valid = np.isfinite(change) & np.isfinite(uncertainty)
        if change_ds.nodata is not None:
            valid &= change != change_ds.nodata
        if uncertainty_ds.nodata is not None:
            valid &= uncertainty != uncertainty_ds.nodata
        significance = np.full(change.shape, -128, dtype=np.int8)
        significance[valid] = 0
        significant = valid & (np.abs(change) > args.sigma * uncertainty)
        significance[significant & (change > 0)] = 1
        significance[significant & (change < 0)] = -1
        profile = change_ds.profile.copy()
        profile.update(dtype="int8", nodata=-128, compress="deflate")
        with rasterio.open(products / "significant_change_32m.tif", "w", **profile) as destination:
            destination.write(significance, 1)
        cell_area_km2 = abs(change_ds.transform.a * change_ds.transform.e) / 1e6
    significant_count = int(significant.sum())
    summary = {
        "schemaVersion": 1,
        "sigmaThreshold": args.sigma,
        "measuredCells": int(valid.sum()),
        "significantPositiveCells": int((significance == 1).sum()),
        "significantNegativeCells": int((significance == -1).sum()),
        "notSignificantCells": int((significance == 0).sum()),
        "significantAreaKm2": float(significant_count * cell_area_km2),
        "significantFractionOfMeasured": float(significant_count / valid.sum()) if valid.any() else 0.0,
    }
    (products / "significance-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
