#!/usr/bin/env python3
"""Export measured support and human-readable 1 km WGS84 tile locations."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np
import rasterio
from rasterio.features import shapes
from rasterio.transform import xy
from rasterio.warp import transform, transform_geom


SETTLEMENTS = [
    ("Rasuwagadhi", 85.377744, 28.279672),
    ("Timure", 85.3702, 28.2555),
    ("Syabrubesi", 85.3344, 28.1633),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--coverage", required=True)
    parser.add_argument("--output-dir", required=True)
    return parser.parse_args()


def nearest_settlement(lon: float, lat: float) -> tuple[str, float]:
    best = min(
        SETTLEMENTS,
        key=lambda item: (item[1] - lon) ** 2 * math.cos(math.radians(lat)) ** 2
        + (item[2] - lat) ** 2,
    )
    dx = (best[1] - lon) * 111.32 * math.cos(math.radians(lat))
    dy = (best[2] - lat) * 110.54
    return best[0], math.hypot(dx, dy)


def utm_polygon_wgs84(xmin: float, ymin: float, xmax: float, ymax: float) -> dict:
    geometry = {
        "type": "Polygon",
        "coordinates": [
            [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]
        ],
    }
    return transform_geom("EPSG:32645", "EPSG:4326", geometry, precision=7)


def main() -> None:
    args = parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    with rasterio.open(args.coverage) as dataset:
        coverage = dataset.read(1) == 1
        measured_shapes = [
            {
                "type": "Feature",
                "geometry": transform_geom(
                    dataset.crs, "EPSG:4326", geometry, precision=7
                ),
                "properties": {"class": "direct_measurement_support"},
            }
            for geometry, value in shapes(
                coverage.astype(np.uint8), mask=coverage, transform=dataset.transform
            )
            if value == 1
        ]
        left, bottom, right, top = dataset.bounds
        working_geometry = utm_polygon_wgs84(left, bottom, right, top)
        rows, cols = np.nonzero(coverage)
        east, north = xy(dataset.transform, rows, cols, offset="center")
        tile_counts: dict[tuple[int, int], int] = {}
        for x_value, y_value in zip(east, north):
            tile_x = math.floor(x_value / 1000) * 1000
            tile_y = math.floor(y_value / 1000) * 1000
            tile_counts[(tile_x, tile_y)] = tile_counts.get((tile_x, tile_y), 0) + 1

    tile_features = []
    table_rows = []
    for (tile_x, tile_y), count in sorted(
        tile_counts.items(), key=lambda item: (-item[0][1], item[0][0])
    ):
        geometry = utm_polygon_wgs84(tile_x, tile_y, tile_x + 1000, tile_y + 1000)
        center_lon, center_lat = transform(
            "EPSG:32645",
            "EPSG:4326",
            [tile_x + 500],
            [tile_y + 500],
        )
        coordinates = geometry["coordinates"][0]
        longitudes = [point[0] for point in coordinates]
        latitudes = [point[1] for point in coordinates]
        settlement, distance_km = nearest_settlement(center_lon[0], center_lat[0])
        tile_id = f"UTM45-{tile_x // 1000:03d}-{tile_y // 1000:04d}"
        properties = {
            "tile_id": tile_id,
            "center_lon": round(center_lon[0], 6),
            "center_lat": round(center_lat[0], 6),
            "west": round(min(longitudes), 6),
            "south": round(min(latitudes), 6),
            "east": round(max(longitudes), 6),
            "north": round(max(latitudes), 6),
            "measured_cells": count,
            "measured_area_km2": round(count * 32 * 32 / 1e6, 4),
            "nearest_settlement": settlement,
            "distance_to_settlement_km": round(distance_km, 2),
        }
        tile_features.append(
            {"type": "Feature", "geometry": geometry, "properties": properties}
        )
        table_rows.append(
            f"| {tile_id} | {center_lat[0]:.6f} | {center_lon[0]:.6f} | "
            f"{min(latitudes):.6f}…{max(latitudes):.6f} | "
            f"{min(longitudes):.6f}…{max(longitudes):.6f} | {count} | "
            f"{count * 32 * 32 / 1e6:.4f} | {settlement} ({distance_km:.2f} km) |"
        )

    (output / "measured-support.geojson").write_text(
        json.dumps(
            {"type": "FeatureCollection", "features": measured_shapes},
            separators=(",", ":"),
        )
        + "\n"
    )
    (output / "mapped-tiles-1km.geojson").write_text(
        json.dumps(
            {"type": "FeatureCollection", "features": tile_features},
            separators=(",", ":"),
        )
        + "\n"
    )
    (output / "working-extent.geojson").write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": working_geometry,
                        "properties": {"class": "processing_extent"},
                    }
                ],
            },
            separators=(",", ":"),
        )
        + "\n"
    )
    extent_coordinates = working_geometry["coordinates"][0]
    extent_lon = [point[0] for point in extent_coordinates]
    extent_lat = [point[1] for point in extent_coordinates]
    (output / "MAPPED_TILES.md").write_text(
        f"""# Directly mapped 1 km reporting tiles

The processing grid covers latitude `{min(extent_lat):.6f}` to `{max(extent_lat):.6f}` and longitude `{min(extent_lon):.6f}` to `{max(extent_lon):.6f}`. The tiles below are 1 km UTM Zone 45N reporting cells generated after matching and containing at least one direct stereo-supported measurement. They are not satellite product identifiers, source pixels, or analysis windows.

| Tile | Center lat | Center lon | Latitude range | Longitude range | Measured cells | Measured km² | Nearest settlement |
|---|---:|---:|---|---|---:|---:|---|
{chr(10).join(table_rows)}
"""
    )
    print(
        json.dumps(
            {
                "workingBoundsWgs84": [
                    min(extent_lon),
                    min(extent_lat),
                    max(extent_lon),
                    max(extent_lat),
                ],
                "mappedTiles": len(tile_features),
                "supportPolygons": len(measured_shapes),
                "measuredCells": int(coverage.sum()),
            }
        )
    )


if __name__ == "__main__":
    main()
