from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.io import MemoryFile
from rasterio.transform import from_origin
from rasterio.warp import transform as warp_coordinates

sys.path.insert(0, str(Path(__file__).parents[1] / "python"))
from building_stats import sample_geometry  # noqa: E402


def test_point_outside_support_is_explicitly_unsupported() -> None:
    transform = from_origin(500000, 3100100, 10, 10)
    profile = {
        "driver": "GTiff",
        "width": 10,
        "height": 10,
        "count": 1,
        "dtype": "float32",
        "crs": "EPSG:32645",
        "transform": transform,
    }
    with MemoryFile() as memory:
        with memory.open(**profile) as dataset:
            change = np.full((10, 10), np.nan, dtype=np.float32)
            uncertainty = np.full((10, 10), np.nan, dtype=np.float32)
            support = np.zeros((10, 10), dtype=np.uint16)
            lon, lat = warp_coordinates(
                "EPSG:32645", "EPSG:4326", [500050], [3100050]
            )
            result = sample_geometry(
                {"type": "Point", "coordinates": [lon[0], lat[0]]},
                change,
                uncertainty,
                support,
                dataset,
            )
    assert result["change_measurement_status"] == "UNSUPPORTED"
    assert result["surface_change_median_m"] is None
