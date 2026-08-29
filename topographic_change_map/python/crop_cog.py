#!/usr/bin/env python3
"""Read only the declared AOI window from a remote public COG."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds as window_from_bounds


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--aoi", required=True)
    parser.add_argument("--aoi-id", required=True)
    parser.add_argument("--scene-id", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--max-dimension", type=int, default=4500)
    return parser.parse_args()


def geometry_bounds(geometry: dict) -> tuple[float, float, float, float]:
    coordinates = geometry["coordinates"]
    points: list[tuple[float, float]] = []

    def visit(value: object) -> None:
        if isinstance(value, list) and len(value) >= 2 and all(
            isinstance(item, (int, float)) for item in value[:2]
        ):
            points.append((float(value[0]), float(value[1])))
        elif isinstance(value, list):
            for item in value:
                visit(item)

    visit(coordinates)
    return (
        min(point[0] for point in points),
        min(point[1] for point in points),
        max(point[0] for point in points),
        max(point[1] for point in points),
    )


def main() -> None:
    args = parse_args()
    collection = json.loads(Path(args.aoi).read_text())
    feature = next(
        feature
        for feature in collection["features"]
        if feature["properties"]["id"] == args.aoi_id
    )
    wgs84_bounds = geometry_bounds(feature["geometry"])
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    env_options = {
        "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
        "GDAL_HTTP_MULTIRANGE": "YES",
        "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".tif,.TIF",
    }
    with rasterio.Env(**env_options), rasterio.open(args.url) as source:
        if source.crs is None:
            raise RuntimeError("Source COG has no CRS")
        projected = transform_bounds("EPSG:4326", source.crs, *wgs84_bounds, densify_pts=21)
        clipped = (
            max(projected[0], source.bounds.left),
            max(projected[1], source.bounds.bottom),
            min(projected[2], source.bounds.right),
            min(projected[3], source.bounds.top),
        )
        if clipped[0] >= clipped[2] or clipped[1] >= clipped[3]:
            raise RuntimeError("Source does not intersect the AOI")
        window = window_from_bounds(*clipped, transform=source.transform).round_offsets().round_lengths()
        native_width = max(1, int(window.width))
        native_height = max(1, int(window.height))
        scale = min(1.0, args.max_dimension / max(native_width, native_height))
        width = max(1, round(native_width * scale))
        height = max(1, round(native_height * scale))
        band_count = min(3, source.count)
        indexes = list(range(1, band_count + 1))
        data = source.read(
            indexes,
            window=window,
            out_shape=(band_count, height, width),
            resampling=Resampling.bilinear,
            boundless=False,
        )
        mask = source.dataset_mask(
            window=window,
            out_shape=(height, width),
            resampling=Resampling.nearest,
            boundless=False,
        )
        transform = from_bounds(*clipped, width=width, height=height)
        profile = source.profile.copy()
        for incompatible in ("photometric", "interleave", "compress"):
            profile.pop(incompatible, None)
        profile.update(
            driver="GTiff",
            width=width,
            height=height,
            count=band_count,
            dtype=data.dtype,
            transform=transform,
            compress="deflate",
            tiled=True,
            blockxsize=256,
            blockysize=256,
        )
        temporary = output.with_suffix(output.suffix + ".part")
        temporary.unlink(missing_ok=True)
        with rasterio.open(temporary, "w", **profile) as destination:
            destination.write(data)
            destination.write_mask(mask)
        temporary.replace(output)

        result = {
            "schemaVersion": 1,
            "sceneId": args.scene_id,
            "aoiId": args.aoi_id,
            "sourceUrl": args.url,
            "output": str(output),
            "sourceCrs": str(source.crs),
            "width": width,
            "height": height,
            "bands": band_count,
            "nativeWindowWidth": native_width,
            "nativeWindowHeight": native_height,
            "downsampleScale": scale,
            "validFraction": float((mask > 0).mean()),
        }
        print(json.dumps(result))


if __name__ == "__main__":
    main()
