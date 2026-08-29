#!/usr/bin/env python3
"""Compare project outputs with the pinned GeoPera reconstruction products."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.features import rasterize
from rasterio.transform import rowcol
from rasterio.warp import transform_geom


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--products", required=True)
    parser.add_argument("--upstream", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def nmad(values: np.ndarray) -> float:
    return float(1.4826 * np.median(np.abs(values - np.median(values))))


def paired_statistics(observed: list[float], reference: list[float]) -> dict:
    if len(observed) < 3:
        return {"sampleCount": len(observed), "correlation": None}
    a, b = np.array(observed), np.array(reference)
    correlation = float(np.corrcoef(a, b)[0, 1])
    difference = a - b
    return {
        "sampleCount": len(a),
        "correlation": correlation,
        "rSquared": correlation * correlation,
        "medianAbsoluteDifferenceM": float(np.median(np.abs(difference))),
        "medianDifferenceM": float(np.median(difference)),
        "differenceNmadM": nmad(difference),
        "observedMedianM": float(np.median(a)),
        "referenceMedianM": float(np.median(b)),
    }


def sample(dataset, array, x: float, y: float) -> float | None:
    row, col = rowcol(dataset.transform, x, y)
    if row < 0 or row >= dataset.height or col < 0 or col >= dataset.width:
        return None
    value = float(array[row, col])
    if not np.isfinite(value) or (dataset.nodata is not None and value == dataset.nodata):
        return None
    return value


def main() -> None:
    args = parse_args()
    products, upstream = Path(args.products), Path(args.upstream)
    with rasterio.open(products / "surface_change_32m.tif") as change_ds, rasterio.open(
        products / "pre_glo30_32m.tif"
    ) as pre_ds:
        change = change_ds.read(1).astype(np.float32)
        pre = pre_ds.read(1).astype(np.float32)
        if change_ds.nodata is not None:
            change[change == change_ds.nodata] = np.nan
        if pre_ds.nodata is not None:
            pre[pre == pre_ds.nodata] = np.nan

        dense_observed, dense_reference = [], []
        for record in csv.DictReader(
            open(upstream / "sim/inputs/stereo_dh_dense_relaxed.csv")
        ):
            value = sample(change_ds, change, float(record["x"]), float(record["y"]))
            if value is not None:
                dense_observed.append(value)
                dense_reference.append(float(record["dh_m"]))

        centerline = list(csv.DictReader(open(upstream / "sim/inputs/centerline_v3.csv")))
        chainage = np.array([float(record["chainage_m"]) for record in centerline])
        center_x = np.array([float(record["x_utm45"]) for record in centerline])
        center_y = np.array([float(record["y_utm45"]) for record in centerline])
        center_elevation = np.array([float(record["elev_m"]) for record in centerline])

        sparse_observed, sparse_reference = [], []
        for record in csv.DictReader(open(upstream / "sim/inputs/stereo_dh.csv")):
            location = float(record["chainage_m"])
            x = float(np.interp(location, chainage, center_x))
            y = float(np.interp(location, chainage, center_y))
            value = sample(change_ds, change, x, y)
            if value is not None:
                sparse_observed.append(value)
                sparse_reference.append(float(record["dh_m"]))

        baseline_observed, baseline_reference = [], []
        for x, y, elevation in zip(center_x, center_y, center_elevation):
            value = sample(pre_ds, pre, float(x), float(y))
            if value is not None:
                baseline_observed.append(value)
                baseline_reference.append(float(elevation))

        wedge = json.loads((upstream / "vectors/deposition_wedge.geojson").read_text())
        projected = [
            transform_geom("EPSG:4326", change_ds.crs, feature["geometry"], precision=3)
            for feature in wedge["features"]
        ]
        wedge_mask = rasterize(
            [(geometry, 1) for geometry in projected],
            out_shape=change_ds.shape,
            transform=change_ds.transform,
            fill=0,
            all_touched=True,
            dtype="uint8",
        ) == 1
        measured = np.isfinite(change)
        our_deposition = measured & (change > 4)
        intersection = our_deposition & wedge_mask
        union = our_deposition | wedge_mask
        wedge_statistics = {
            "ourDepositionCells": int(our_deposition.sum()),
            "upstreamWedgeCellsInGrid": int(wedge_mask.sum()),
            "intersectionCells": int(intersection.sum()),
            "precision": float(intersection.sum() / our_deposition.sum())
            if our_deposition.any()
            else None,
            "recall": float(intersection.sum() / wedge_mask.sum())
            if wedge_mask.any()
            else None,
            "intersectionOverUnion": float(intersection.sum() / union.sum())
            if union.any()
            else None,
        }

    result = {
        "schemaVersion": 1,
        "upstreamRepository": "geo-pera/bhotekoshi-2026-reconstruction",
        "upstreamCommit": "43c22e0f9a3777d071c2f181302ca2daad384a53",
        "denseChangeComparison": paired_statistics(dense_observed, dense_reference),
        "sparseCenterlineComparison": paired_statistics(
            sparse_observed, sparse_reference
        ),
        "preBaselineVsHmaCenterline": paired_statistics(
            baseline_observed, baseline_reference
        ),
        "depositionWedgeComparison": wedge_statistics,
        "interpretation": "GeoPera is a same-source reproducibility benchmark, not independent ground truth.",
    }
    Path(args.output).write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
