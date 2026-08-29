#!/usr/bin/env python3
"""Mosaic validated pair products, preferring the lower-uncertainty measurement."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import from_origin
from rasterio.warp import Resampling, reproject


LAYERS = {
    "change": "surface_change_32m.tif",
    "uncertainty": "uncertainty_32m.tif",
    "support": "support_count_32m.tif",
    "pre": "pre_glo30_32m.tif",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", action="append", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def select_lower_uncertainty(
    current_change: np.ndarray,
    current_uncertainty: np.ndarray,
    candidate_change: np.ndarray,
    candidate_uncertainty: np.ndarray,
) -> np.ndarray:
    candidate_valid = np.isfinite(candidate_change) & np.isfinite(candidate_uncertainty)
    current_valid = np.isfinite(current_change) & np.isfinite(current_uncertainty)
    return candidate_valid & (~current_valid | (candidate_uncertainty < current_uncertainty))


def read_metadata(product: Path):
    return rasterio.open(product / LAYERS["change"])


def warp_layer(
    source_path: Path,
    transform: rasterio.Affine,
    width: int,
    height: int,
    discrete: bool = False,
) -> np.ndarray:
    with rasterio.open(source_path) as source:
        destination = np.full((height, width), np.nan, dtype=np.float32)
        source_array = source.read(1).astype(np.float32)
        if source.nodata is not None:
            source_array[source_array == source.nodata] = np.nan
        reproject(
            source=source_array,
            destination=destination,
            src_transform=source.transform,
            src_crs=source.crs,
            src_nodata=np.nan,
            dst_transform=transform,
            dst_crs="EPSG:32645",
            dst_nodata=np.nan,
            resampling=Resampling.nearest if discrete else Resampling.bilinear,
        )
    return destination


def write(path: Path, values: np.ndarray, transform, dtype: str, nodata) -> None:
    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        width=values.shape[1],
        height=values.shape[0],
        count=1,
        dtype=dtype,
        crs="EPSG:32645",
        transform=transform,
        nodata=nodata,
        tiled=True,
        compress="deflate",
        blockxsize=256,
        blockysize=256,
    ) as destination:
        destination.write(values.astype(dtype), 1)


def main() -> None:
    args = parse_args()
    inputs = [Path(value) for value in args.input]
    metadata = [read_metadata(value) for value in inputs]
    if any(str(dataset.crs) != "EPSG:32645" for dataset in metadata):
        raise RuntimeError("All products must use EPSG:32645")
    resolution = min(dataset.transform.a for dataset in metadata)
    left = math.floor(min(dataset.bounds.left for dataset in metadata) / resolution) * resolution
    bottom = math.floor(min(dataset.bounds.bottom for dataset in metadata) / resolution) * resolution
    right = math.ceil(max(dataset.bounds.right for dataset in metadata) / resolution) * resolution
    top = math.ceil(max(dataset.bounds.top for dataset in metadata) / resolution) * resolution
    width = round((right - left) / resolution)
    height = round((top - bottom) / resolution)
    transform = from_origin(left, top, resolution, resolution)
    change = np.full((height, width), np.nan, dtype=np.float32)
    uncertainty = np.full_like(change, np.nan)
    support = np.zeros((height, width), dtype=np.uint16)
    pre = np.full_like(change, np.nan)
    source_index = np.zeros((height, width), dtype=np.uint8)
    contributions = []
    for index, product in enumerate(inputs, start=1):
        candidate_change = warp_layer(product / LAYERS["change"], transform, width, height)
        candidate_uncertainty = warp_layer(product / LAYERS["uncertainty"], transform, width, height)
        candidate_support = warp_layer(product / LAYERS["support"], transform, width, height, True)
        candidate_pre = warp_layer(product / LAYERS["pre"], transform, width, height)
        use = select_lower_uncertainty(change, uncertainty, candidate_change, candidate_uncertainty)
        change[use] = candidate_change[use]
        uncertainty[use] = candidate_uncertainty[use]
        support[use] = np.nan_to_num(candidate_support[use]).astype(np.uint16)
        source_index[use] = index
        pre_missing = ~np.isfinite(pre) & np.isfinite(candidate_pre)
        pre[pre_missing] = candidate_pre[pre_missing]
        contributions.append({"sourceIndex": index, "path": str(product), "selectedCells": int(use.sum())})
    measured = np.isfinite(change) & np.isfinite(uncertainty) & (support > 0)
    post = np.where(measured & np.isfinite(pre), pre + change, np.nan)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    write(output / "surface_change_32m.tif", np.where(measured, change, -9999), transform, "float32", -9999)
    write(output / "uncertainty_32m.tif", np.where(measured, uncertainty, -9999), transform, "float32", -9999)
    write(output / "support_count_32m.tif", support, transform, "uint16", 0)
    write(output / "coverage_32m.tif", measured.astype(np.uint8), transform, "uint8", 0)
    write(output / "source_index_32m.tif", source_index, transform, "uint8", 0)
    write(output / "pre_glo30_32m.tif", np.where(np.isfinite(pre), pre, -9999), transform, "float32", -9999)
    write(output / "post_surface_estimate_32m.tif", np.where(np.isfinite(post), post, -9999), transform, "float32", -9999)
    summary = {
        "schemaVersion": 1,
        "inputs": contributions,
        "measuredCells": int(measured.sum()),
        "measuredAreaKm2": float(measured.sum() * resolution**2 / 1e6),
        "changeMedianM": float(np.nanmedian(change)) if measured.any() else None,
        "uncertaintyMedianM": float(np.nanmedian(uncertainty)) if measured.any() else None,
        "selectionRule": "lowest uncertainty in overlaps",
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
