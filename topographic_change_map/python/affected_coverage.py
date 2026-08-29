#!/usr/bin/env python3
"""Measure direct raster support against authoritative affected-area polygons."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.features import rasterize
from rasterio.warp import transform_geom


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--coverage", required=True)
    parser.add_argument("--affected", required=True)
    parser.add_argument("--affected-area-km2", type=float, required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = json.loads(Path(args.affected).read_text())
    with rasterio.open(args.coverage) as dataset:
        measured = dataset.read(1) == 1
        geometries = [
            transform_geom("EPSG:4326", dataset.crs, feature["geometry"], precision=3)
            for feature in source["features"]
        ]
        affected = rasterize(
            [(geometry, 1) for geometry in geometries],
            out_shape=dataset.shape,
            transform=dataset.transform,
            fill=0,
            all_touched=True,
            dtype="uint8",
        ) == 1
        cell_area_km2 = abs(dataset.transform.a * dataset.transform.e) / 1e6
    overlap = measured & affected
    result = {
        "schemaVersion": 1,
        "rasterCellAreaKm2": cell_area_km2,
        "processingExtentAreaKm2": float(measured.size * cell_area_km2),
        "authoritativeAffectedAreaKm2": args.affected_area_km2,
        "affectedAreaInsideProcessingExtentKm2": float(affected.sum() * cell_area_km2),
        "directMeasuredAreaKm2": float(measured.sum() * cell_area_km2),
        "directMeasuredAffectedAreaKm2": float(overlap.sum() * cell_area_km2),
        "directMeasuredFractionOfAuthoritativeAffectedArea": float(
            overlap.sum() * cell_area_km2 / args.affected_area_km2
        ),
        "directMeasuredFractionInsideProcessingExtent": float(
            overlap.sum() / affected.sum()
        )
        if affected.any()
        else 0.0,
    }
    Path(args.output).write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
