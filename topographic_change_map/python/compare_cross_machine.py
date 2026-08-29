#!/usr/bin/env python3
"""Compare independently generated raster products on the same grid."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import rasterio


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference", required=True)
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def load(root: Path) -> tuple[np.ndarray, np.ndarray, rasterio.DatasetReader]:
    dataset = rasterio.open(root / "surface_change_32m.tif")
    change = dataset.read(1).astype(np.float32)
    if dataset.nodata is not None:
        change[change == dataset.nodata] = np.nan
    with rasterio.open(root / "uncertainty_32m.tif") as source:
        uncertainty = source.read(1).astype(np.float32)
        if source.nodata is not None:
            uncertainty[uncertainty == source.nodata] = np.nan
    return change, uncertainty, dataset


def main() -> None:
    args = parse_args()
    reference_change, reference_uncertainty, reference_ds = load(Path(args.reference))
    candidate_change, candidate_uncertainty, candidate_ds = load(Path(args.candidate))
    if (
        reference_ds.shape != candidate_ds.shape
        or reference_ds.transform != candidate_ds.transform
        or reference_ds.crs != candidate_ds.crs
    ):
        raise RuntimeError("Cross-machine products do not share a grid")
    reference_valid = np.isfinite(reference_change)
    candidate_valid = np.isfinite(candidate_change)
    overlap = reference_valid & candidate_valid
    union = reference_valid | candidate_valid
    if overlap.sum() < 3:
        raise RuntimeError("Insufficient common measured cells")
    ref, candidate = reference_change[overlap], candidate_change[overlap]
    correlation = float(np.corrcoef(ref, candidate)[0, 1])
    result = {
        "schemaVersion": 1,
        "reference": str(args.reference),
        "candidate": str(args.candidate),
        "referenceMeasuredCells": int(reference_valid.sum()),
        "candidateMeasuredCells": int(candidate_valid.sum()),
        "overlapCells": int(overlap.sum()),
        "maskIntersectionOverUnion": float(overlap.sum() / union.sum()),
        "changeCorrelation": correlation,
        "changeRSquared": correlation * correlation,
        "changeMedianAbsoluteDifferenceM": float(np.median(np.abs(ref - candidate))),
        "changeMedianDifferenceM": float(np.median(candidate - ref)),
        "uncertaintyMedianAbsoluteDifferenceM": float(
            np.median(
                np.abs(
                    reference_uncertainty[overlap]
                    - candidate_uncertainty[overlap]
                )
            )
        ),
    }
    Path(args.output).write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
