from __future__ import annotations

import os
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import from_origin

sys.path.insert(0, str(Path(__file__).parents[1] / "python"))
from download_hma import read_env, validate_manifest  # noqa: E402
from validate_products import bundle_invariants  # noqa: E402


def write_raster(path: Path, values: np.ndarray, nodata: float | int) -> None:
    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        width=values.shape[1],
        height=values.shape[0],
        count=1,
        dtype=str(values.dtype),
        crs="EPSG:32645",
        transform=from_origin(500000, 3100000, 10, 10),
        nodata=nodata,
    ) as dataset:
        dataset.write(values, 1)


def test_bundle_validator_accepts_non_default_resolution(tmp_path: Path) -> None:
    change = np.array([[2.0, -9999.0], [1.0, 3.0]], dtype=np.float32)
    uncertainty = np.array([[1.0, -9999.0], [1.0, 1.0]], dtype=np.float32)
    support = np.array([[1, 0], [2, 1]], dtype=np.uint16)
    coverage = (support > 0).astype(np.uint8)
    pre = np.array([[100.0, 101.0], [102.0, 103.0]], dtype=np.float32)
    post = np.where(coverage == 1, pre + change, -9999.0).astype(np.float32)
    for name, values, nodata in [
        ("surface_change_10m.tif", change, -9999.0),
        ("uncertainty_10m.tif", uncertainty, -9999.0),
        ("support_count_10m.tif", support, 0),
        ("coverage_10m.tif", coverage, 0),
        ("pre_glo30_10m.tif", pre, -9999.0),
        ("post_surface_estimate_10m.tif", post, -9999.0),
    ]:
        write_raster(tmp_path / name, values, nodata)
    result = bundle_invariants(tmp_path, "10m")
    assert result["sameGrid"]
    assert result["masksConsistent"]
    assert result["postEquationPass"]
    assert result["measuredCells"] == 3


def test_hma_secret_file_requires_private_mode(tmp_path: Path) -> None:
    env = tmp_path / "credentials.env"
    env.write_text("TCM_EARTHDATA_USERNAME=user\nTCM_EARTHDATA_PASSWORD=secret\n")
    os.chmod(env, 0o600)
    assert read_env(env)["TCM_EARTHDATA_USERNAME"] == "user"
    os.chmod(env, 0o644)
    try:
        read_env(env)
    except RuntimeError as error:
        assert "0600" in str(error)
    else:
        raise AssertionError("public secret file mode was accepted")


def test_hma_manifest_rejects_path_traversal() -> None:
    manifest = {
        "granules": [
            {
                "title": "../secret",
                "downloadUrl": "https://data.nsidc.earthdatacloud.nasa.gov/file",
            }
        ]
    }
    try:
        validate_manifest(manifest)
    except RuntimeError as error:
        assert "Unsafe" in str(error)
    else:
        raise AssertionError("unsafe title was accepted")
