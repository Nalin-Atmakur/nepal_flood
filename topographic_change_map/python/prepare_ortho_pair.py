#!/usr/bin/env python3
"""Warp one source band onto an explicit shared UTM grid, block by block."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_origin
from rasterio.vrt import WarpedVRT


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--bounds", nargs=4, type=float, required=True, metavar=("XMIN", "YMIN", "XMAX", "YMAX"))
    parser.add_argument("--resolution", type=float, default=1.0)
    parser.add_argument("--band", type=int, default=2)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    xmin, ymin, xmax, ymax = args.bounds
    width = math.ceil((xmax - xmin) / args.resolution)
    height = math.ceil((ymax - ymin) / args.resolution)
    transform = from_origin(xmin, ymax, args.resolution, args.resolution)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".part")
    temporary.unlink(missing_ok=True)
    with rasterio.open(args.input) as source:
        if args.band > source.count:
            raise RuntimeError(f"Input has only {source.count} bands")
        with WarpedVRT(
            source,
            crs="EPSG:32645",
            transform=transform,
            width=width,
            height=height,
            src_nodata=0,
            nodata=0,
            resampling=Resampling.cubic,
        ) as warped:
            with rasterio.open(
                temporary,
                "w",
                driver="GTiff",
                width=width,
                height=height,
                count=1,
                dtype=source.dtypes[args.band - 1],
                crs="EPSG:32645",
                transform=transform,
                nodata=0,
                tiled=True,
                blockxsize=512,
                blockysize=512,
                compress="deflate",
                BIGTIFF="YES",
            ) as destination:
                for _, window in destination.block_windows(1):
                    destination.write(warped.read(args.band, window=window), 1, window=window)
    temporary.replace(output)
    print(f"{output} {width}x{height} EPSG:32645 {args.resolution}m")


if __name__ == "__main__":
    main()
