#!/usr/bin/env python3
"""Export validated raster products to the compact Three.js viewer schema."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.warp import transform as transform_coordinates


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--products", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--buildings")
    return parser.parse_args()


def read(path: Path) -> tuple[np.ndarray, rasterio.DatasetReader]:
    dataset = rasterio.open(path)
    array = dataset.read(1).astype(np.float32)
    if dataset.nodata is not None:
        array[array == dataset.nodata] = np.nan
    return array, dataset


def finite_or_none(array: np.ndarray) -> list[float | None]:
    return [round(float(value), 3) if np.isfinite(value) else None for value in array.ravel()]


def geometry_center(geometry: dict) -> tuple[float, float]:
    points: list[tuple[float, float]] = []

    def visit(value: object) -> None:
        if isinstance(value, list) and len(value) >= 2 and all(
            isinstance(item, (int, float)) for item in value[:2]
        ):
            points.append((float(value[0]), float(value[1])))
        elif isinstance(value, list):
            for item in value:
                visit(item)

    visit(geometry["coordinates"])
    return (
        (min(point[0] for point in points) + max(point[0] for point in points)) / 2,
        (min(point[1] for point in points) + max(point[1] for point in points)) / 2,
    )


def main() -> None:
    args = parse_args()
    products = Path(args.products)
    output = Path(args.output)
    pre, pre_dataset = read(products / "pre_glo30_32m.tif")
    post, post_dataset = read(products / "post_surface_estimate_32m.tif")
    change, change_dataset = read(products / "surface_change_32m.tif")
    uncertainty, uncertainty_dataset = read(products / "uncertainty_32m.tif")
    with rasterio.open(products / "support_count_32m.tif") as source:
        support = source.read(1).astype(np.int32)
    for dataset in [post_dataset, change_dataset, uncertainty_dataset]:
        if dataset.shape != pre_dataset.shape or dataset.transform != pre_dataset.transform:
            raise RuntimeError("Viewer rasters do not share a grid")
    measured = np.isfinite(change) & np.isfinite(post)
    display_elevation = np.where(measured, post, pre)
    finite_pre = pre[np.isfinite(pre)]
    buildings = []
    if args.buildings:
        source = json.loads(Path(args.buildings).read_text())
        for item in source["features"]:
            properties = item.get("properties") or {}
            if properties.get("change_measurement_status") != "MEASURED":
                continue
            lon, lat = geometry_center(item["geometry"])
            east, north = transform_coordinates(
                "EPSG:4326", "EPSG:32645", [lon], [lat]
            )
            col = int((east[0] - pre_dataset.transform.c) / pre_dataset.transform.a)
            row = int((pre_dataset.transform.f - north[0]) / abs(pre_dataset.transform.e))
            if row < 0 or row >= pre_dataset.height or col < 0 or col >= pre_dataset.width:
                continue
            index = row * pre_dataset.width + col
            buildings.append(
                {
                    "id": properties.get("change_feature_id"),
                    "source": properties.get("change_source"),
                    "damage": properties.get("damage")
                    or properties.get("grade")
                    or properties.get("damage_class"),
                    "col": col,
                    "row": row,
                    "elevationM": round(float(display_elevation[row, col]), 3),
                    "changeM": properties.get("surface_change_median_m"),
                    "uncertaintyM": properties.get("change_uncertainty_median_m"),
                    "validFraction": properties.get("change_valid_fraction"),
                }
            )
    payload = {
        "schemaVersion": 1,
        "crs": str(pre_dataset.crs),
        "width": pre_dataset.width,
        "height": pre_dataset.height,
        "originX": pre_dataset.transform.c,
        "originY": pre_dataset.transform.f,
        "resolutionM": pre_dataset.transform.a,
        "baseElevationM": round(float(np.nanmin(finite_pre)), 3),
        "elevationM": finite_or_none(display_elevation),
        "surfaceChangeM": finite_or_none(change),
        "uncertaintyM": finite_or_none(uncertainty),
        "supportCount": support.ravel().tolist(),
        "measured": measured.astype(np.uint8).ravel().tolist(),
        "buildings": buildings,
        "statistics": {
            "totalCells": int(measured.size),
            "measuredCells": int(measured.sum()),
            "measuredFraction": float(measured.mean()),
            "changeMedianM": float(np.nanmedian(change)) if measured.any() else None,
            "changeP10M": float(np.nanpercentile(change, 10)) if measured.any() else None,
            "changeP90M": float(np.nanpercentile(change, 90)) if measured.any() else None,
            "uncertaintyMedianM": float(np.nanmedian(uncertainty)) if measured.any() else None,
        },
        "provenance": {
            "method": "Opposite-look orthorectified-image parallax",
            "leftSceneId": "B040001100881410",
            "rightSceneId": "B040001100881710",
            "preSurface": "Copernicus GLO-30",
            "classification": "RESEARCH_ONLY",
            "warning": "Unsupported cells show the coarse pre-event terrain for context and are not post-event measurements.",
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, separators=(",", ":")) + "\n")
    print(json.dumps(payload["statistics"]))


if __name__ == "__main__":
    main()
