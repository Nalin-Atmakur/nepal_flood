#!/usr/bin/env python3
"""Export an RGB public-ortho preview on the viewer's exact UTM grid."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import rasterio
from rasterio.enums import ColorInterp, Resampling
from rasterio.transform import from_origin
from rasterio.vrt import WarpedVRT


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--metadata", required=True)
    parser.add_argument("--scene-id", required=True)
    parser.add_argument("--acquired-at", required=True)
    parser.add_argument("--off-nadir-deg", required=True, type=float)
    parser.add_argument("--azimuth-deg", required=True, type=float)
    parser.add_argument(
        "--bounds",
        nargs=4,
        type=float,
        required=True,
        metavar=("XMIN", "YMIN", "XMAX", "YMAX"),
    )
    parser.add_argument("--resolution", type=float, default=2.0)
    parser.add_argument("--quality", type=int, default=86)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    xmin, ymin, xmax, ymax = args.bounds
    width = math.ceil((xmax - xmin) / args.resolution)
    height = math.ceil((ymax - ymin) / args.resolution)
    transform = from_origin(xmin, ymax, args.resolution, args.resolution)
    output = Path(args.output)
    metadata = Path(args.metadata)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".part")
    temporary.unlink(missing_ok=True)
    with rasterio.open(args.input) as source:
        if source.count < 3:
            raise RuntimeError("RGB imagery export requires at least three bands")
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
            rgb = warped.read([1, 2, 3], out_dtype="uint8")
        with rasterio.Env(GDAL_PAM_ENABLED="NO"):
            with rasterio.open(
                temporary,
                "w",
                driver="JPEG",
                width=width,
                height=height,
                count=3,
                dtype="uint8",
                crs="EPSG:32645",
                transform=transform,
                quality=args.quality,
                photometric="YCBCR",
                worldfile=False,
            ) as destination:
                destination.write(rgb)
                destination.colorinterp = (
                    ColorInterp.red,
                    ColorInterp.green,
                    ColorInterp.blue,
                )
    temporary.replace(output)
    payload = {
        "schemaVersion": 1,
        "sceneId": args.scene_id,
        "acquiredAt": args.acquired_at,
        "offNadirDeg": args.off_nadir_deg,
        "azimuthDeg": args.azimuth_deg,
        "crs": "EPSG:32645",
        "originX": xmin,
        "originY": ymax,
        "resolutionM": args.resolution,
        "width": width,
        "height": height,
        "bounds": [xmin, ymin, xmax, ymax],
        "image": output.name,
        "role": "post-event opposite-look parallax acquisition",
        "displayNote": "Web preview is downsampled; analysis uses the co-registered 1 m grid.",
        "sourceUrl": f"https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/{args.scene_id}.tif",
        "copyright": "Vantor Inc. 2026",
        "license": "CC BY-NC 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-nc/4.0/",
        "adaptation": "Reprojected to EPSG:32645 and downsampled to a 2 m RGB web preview.",
    }
    metadata.write_text(json.dumps(payload, indent=2) + "\n")
    print(json.dumps({"sceneId": args.scene_id, "width": width, "height": height}))


if __name__ == "__main__":
    main()
