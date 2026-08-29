#!/usr/bin/env python3
"""Attach support-aware surface-change statistics to building features."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.features import geometry_mask, geometry_window
from rasterio.transform import rowcol
from rasterio.warp import transform, transform_geom
from rasterio.windows import Window, transform as window_transform


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--change", required=True)
    parser.add_argument("--uncertainty", required=True)
    parser.add_argument("--support", required=True)
    parser.add_argument("--source", action="append", required=True, help="NAME=path.geojson")
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def clipped_window(dataset: rasterio.DatasetReader, geometry: dict) -> Window | None:
    try:
        window = geometry_window(dataset, [geometry], pad_x=0, pad_y=0)
    except Exception:
        return None
    full = Window(0, 0, dataset.width, dataset.height)
    try:
        return window.intersection(full)
    except Exception:
        return None


def sample_geometry(
    geometry: dict,
    change: np.ndarray,
    uncertainty: np.ndarray,
    support: np.ndarray,
    dataset: rasterio.DatasetReader,
) -> dict:
    projected = transform_geom("EPSG:4326", dataset.crs, geometry, precision=3)
    if projected["type"] == "Point":
        x, y = projected["coordinates"]
        row, col = rowcol(dataset.transform, x, y)
        if row < 0 or row >= dataset.height or col < 0 or col >= dataset.width:
            values = np.array([], dtype=np.float32)
            uncertainties = np.array([], dtype=np.float32)
            supports = np.array([], dtype=np.uint16)
            candidate_count = 1
        else:
            values = np.array([change[row, col]])
            uncertainties = np.array([uncertainty[row, col]])
            supports = np.array([support[row, col]])
            candidate_count = 1
    else:
        window = clipped_window(dataset, projected)
        if window is None or window.width <= 0 or window.height <= 0:
            values = np.array([], dtype=np.float32)
            uncertainties = np.array([], dtype=np.float32)
            supports = np.array([], dtype=np.uint16)
            candidate_count = 0
        else:
            rows = slice(int(window.row_off), int(window.row_off + window.height))
            cols = slice(int(window.col_off), int(window.col_off + window.width))
            inside = geometry_mask(
                [projected],
                out_shape=(int(window.height), int(window.width)),
                transform=window_transform(window, dataset.transform),
                invert=True,
            )
            values = change[rows, cols][inside]
            uncertainties = uncertainty[rows, cols][inside]
            supports = support[rows, cols][inside]
            candidate_count = int(inside.sum())
    valid = np.isfinite(values) & np.isfinite(uncertainties) & (supports > 0)
    measured = values[valid]
    measured_uncertainty = uncertainties[valid]
    measured_support = supports[valid]
    significant = valid & (np.abs(values) > 2 * uncertainties)
    significant_values = values[significant]
    if significant_values.size:
        significance_class = (
            "SIGNIFICANT_POSITIVE"
            if np.median(significant_values) > 0
            else "SIGNIFICANT_NEGATIVE"
        )
    elif measured.size:
        significance_class = "MEASURED_NOT_SIGNIFICANT"
    else:
        significance_class = "UNSUPPORTED"
    return {
        "change_valid_cells": int(valid.sum()),
        "change_candidate_cells": candidate_count,
        "change_valid_fraction": float(valid.sum() / candidate_count) if candidate_count else 0.0,
        "surface_change_median_m": float(np.median(measured)) if measured.size else None,
        "surface_change_p10_m": float(np.percentile(measured, 10)) if measured.size else None,
        "surface_change_p90_m": float(np.percentile(measured, 90)) if measured.size else None,
        "change_uncertainty_median_m": float(np.median(measured_uncertainty)) if measured.size else None,
        "change_support_median": float(np.median(measured_support)) if measured.size else None,
        "change_significant_cells": int(significant.sum()),
        "change_significant_fraction": float(significant.sum() / valid.sum())
        if valid.any()
        else 0.0,
        "change_significance_class": significance_class,
        "change_measurement_status": "MEASURED" if measured.size else "UNSUPPORTED",
    }


def main() -> None:
    args = parse_args()
    with rasterio.open(args.change) as change_dataset, rasterio.open(
        args.uncertainty
    ) as uncertainty_dataset, rasterio.open(args.support) as support_dataset:
        if (
            change_dataset.shape != uncertainty_dataset.shape
            or change_dataset.shape != support_dataset.shape
            or change_dataset.transform != uncertainty_dataset.transform
            or change_dataset.transform != support_dataset.transform
        ):
            raise RuntimeError("Change, uncertainty, and support rasters must share a grid")
        change = change_dataset.read(1).astype(np.float32)
        uncertainty = uncertainty_dataset.read(1).astype(np.float32)
        support = support_dataset.read(1)
        change[change == change_dataset.nodata] = np.nan
        uncertainty[uncertainty == uncertainty_dataset.nodata] = np.nan
        features = []
        counts: dict[str, dict[str, int]] = {}
        for source_argument in args.source:
            source_name, source_path = source_argument.split("=", 1)
            source = json.loads(Path(source_path).read_text())
            counts[source_name] = {"total": 0, "measured": 0}
            for index, item in enumerate(source["features"]):
                statistics = sample_geometry(
                    item["geometry"], change, uncertainty, support, change_dataset
                )
                properties = dict(item.get("properties") or {})
                properties.update(statistics)
                properties["change_source"] = source_name
                properties["change_feature_id"] = f"{source_name}-{index + 1}"
                features.append(
                    {
                        "type": "Feature",
                        "geometry": item["geometry"],
                        "properties": properties,
                    }
                )
                counts[source_name]["total"] += 1
                if statistics["change_measurement_status"] == "MEASURED":
                    counts[source_name]["measured"] += 1
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "name": "Building damage with support-aware surface change",
                "features": features,
            },
            separators=(",", ":"),
        )
        + "\n"
    )
    summary = {
        "schemaVersion": 1,
        "sources": counts,
        "total": len(features),
        "measured": sum(value["measured"] for value in counts.values()),
        "warning": "Surface change is not automatically debris depth or burial depth.",
    }
    output.with_suffix(".summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
