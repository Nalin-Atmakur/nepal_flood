#!/usr/bin/env python3
"""Resumable Earthdata download for the exact HMA 8 m baseline granules."""

from __future__ import annotations

import argparse
import json
import os
import stat
import subprocess
import tempfile
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--env", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def read_env(path: Path) -> dict[str, str]:
    if stat.S_IMODE(path.stat().st_mode) != 0o600:
        raise RuntimeError("Earthdata env file must have mode 0600")
    values = {}
    for line in path.read_text().splitlines():
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            values[key] = value
    return values


def validate_manifest(manifest: dict) -> list[dict]:
    granules = manifest.get("granules")
    if not isinstance(granules, list) or not granules:
        raise RuntimeError("HMA manifest contains no granules")
    titles: set[str] = set()
    for granule in granules:
        title = granule.get("title", "")
        url = granule.get("downloadUrl", "")
        if not title or Path(title).name != title:
            raise RuntimeError(f"Unsafe HMA granule title: {title!r}")
        if title in titles:
            raise RuntimeError(f"Duplicate HMA granule title: {title}")
        if not url.startswith("https://data.nsidc.earthdatacloud.nasa.gov/"):
            raise RuntimeError(f"Unexpected HMA download host for {title}")
        titles.add(title)
    return granules


def main() -> None:
    args = parse_args()
    manifest = json.loads(Path(args.manifest).read_text())
    granules = validate_manifest(manifest)
    secrets = read_env(Path(args.env))
    username = secrets.get("TCM_EARTHDATA_USERNAME", "")
    password = secrets.get("TCM_EARTHDATA_PASSWORD", "")
    if not username or not password:
        raise RuntimeError("Earthdata credentials are incomplete")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    completed = []
    with tempfile.NamedTemporaryFile("w", delete=False) as handle:
        netrc = Path(handle.name)
        handle.write(
            f"machine urs.earthdata.nasa.gov login {username} password {password}\n"
        )
    os.chmod(netrc, 0o600)
    try:
        for granule in granules:
            target = output / granule["title"]
            temporary = target.with_suffix(target.suffix + ".part")
            command = [
                "curl",
                "--fail",
                "--location",
                "--location-trusted",
                "--retry",
                "4",
                "--continue-at",
                "-",
                "--netrc-file",
                str(netrc),
                granule["downloadUrl"],
                "--output",
                str(temporary),
            ]
            subprocess.run(command, check=True)
            temporary.replace(target)
            completed.append({"title": granule["title"], "bytes": target.stat().st_size})
    finally:
        netrc.unlink(missing_ok=True)
    (output / "download-manifest.json").write_text(
        json.dumps({"schemaVersion": 1, "completed": completed}, indent=2) + "\n"
    )
    print(json.dumps({"completed": len(completed)}))


if __name__ == "__main__":
    main()
