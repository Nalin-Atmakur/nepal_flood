#!/usr/bin/env python3
"""Decide whether a reconstructed pair may enter a published mosaic."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--summary", required=True)
    parser.add_argument("--validation", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--max-stable-nmad-m", type=float, default=6.0)
    parser.add_argument("--min-stable-ties", type=int, default=100)
    parser.add_argument("--min-corridor-ties", type=int, default=100)
    parser.add_argument("--min-supported-area-km2", type=float, default=0.05)
    parser.add_argument("--rigorous-camera-models", action="store_true")
    return parser.parse_args()


def evaluate(
    summary: dict,
    validation: dict,
    *,
    max_stable_nmad_m: float = 6.0,
    min_stable_ties: int = 100,
    min_corridor_ties: int = 100,
    min_supported_area_km2: float = 0.05,
    rigorous_camera_models: bool = False,
) -> dict:
    checks = {
        "bundleInvariants": bool(validation.get("passed")),
        "stableNmad": float(summary.get("stableNmadChangeM", float("inf")))
        <= max_stable_nmad_m,
        "stableSupport": int(summary.get("stableTiePoints", 0)) >= min_stable_ties,
        "corridorSupport": int(summary.get("corridorTiePoints", 0))
        >= min_corridor_ties,
        "measuredArea": float(summary.get("supportedAreaKm2", 0.0))
        >= min_supported_area_km2,
    }
    promoted = all(checks.values())
    nmad = float(summary.get("stableNmadChangeM", float("inf")))
    if not promoted:
        accuracy_class = "FAILED"
    elif not rigorous_camera_models:
        accuracy_class = "RESEARCH_ONLY"
    elif nmad <= 1.0:
        accuracy_class = "BUILDING_SCALE_CANDIDATE"
    elif nmad <= 3.0:
        accuracy_class = "BROAD_CHANGE_CANDIDATE"
    else:
        accuracy_class = "RESEARCH_ONLY"
    return {
        "schemaVersion": 1,
        "promotedToMosaic": promoted,
        "accuracyClass": accuracy_class,
        "rigorousCameraModels": rigorous_camera_models,
        "checks": checks,
        "thresholds": {
            "maxStableNmadM": max_stable_nmad_m,
            "minStableTiePoints": min_stable_ties,
            "minCorridorTiePoints": min_corridor_ties,
            "minSupportedAreaKm2": min_supported_area_km2,
        },
        "observed": {
            "stableNmadM": summary.get("stableNmadChangeM"),
            "stableTiePoints": summary.get("stableTiePoints"),
            "corridorTiePoints": summary.get("corridorTiePoints"),
            "supportedAreaKm2": summary.get("supportedAreaKm2"),
        },
        "interpretation": (
            "Promotion permits inclusion in the uncertainty-weighted research mosaic; "
            "it does not establish debris depth, burial, or operational accuracy."
        ),
    }


def main() -> None:
    args = parse_args()
    summary = json.loads(Path(args.summary).read_text())
    validation = json.loads(Path(args.validation).read_text())
    result = evaluate(
        summary,
        validation,
        max_stable_nmad_m=args.max_stable_nmad_m,
        min_stable_ties=args.min_stable_ties,
        min_corridor_ties=args.min_corridor_ties,
        min_supported_area_km2=args.min_supported_area_km2,
        rigorous_camera_models=args.rigorous_camera_models,
    )
    Path(args.output).write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))
    if not result["promotedToMosaic"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
