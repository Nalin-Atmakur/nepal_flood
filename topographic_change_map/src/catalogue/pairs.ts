import { area, feature, featureCollection, intersect } from "@turf/turf";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import type { AoiProperties, PairRecord, SceneRecord } from "./types.js";

function degrees(value: number): number {
  return (value * Math.PI) / 180;
}

export function approximateRaySeparationDeg(
  leftOffNadir: number | null,
  leftAzimuth: number | null,
  rightOffNadir: number | null,
  rightAzimuth: number | null,
): number | null {
  if ([leftOffNadir, leftAzimuth, rightOffNadir, rightAzimuth].some((v) => v === null)) {
    return null;
  }
  const vector = (offNadir: number, azimuth: number): [number, number, number] => {
    const off = degrees(offNadir);
    const az = degrees(azimuth);
    return [Math.sin(off) * Math.sin(az), Math.sin(off) * Math.cos(az), Math.cos(off)];
  };
  const a = vector(leftOffNadir!, leftAzimuth!);
  const b = vector(rightOffNadir!, rightAzimuth!);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return (Math.acos(dot) * 180) / Math.PI;
}

function overlapFraction(
  aoi: Feature<Polygon, AoiProperties>,
  left: SceneRecord,
  right: SceneRecord,
): number {
  const leftFeature = feature(left.geometry) as Feature<Polygon | MultiPolygon>;
  const rightFeature = feature(right.geometry) as Feature<Polygon | MultiPolygon>;
  const leftRight = intersect(featureCollection([leftFeature, rightFeature]));
  if (!leftRight) return 0;
  const common = intersect(featureCollection([aoi, leftRight]));
  if (!common) return 0;
  return Math.min(1, area(common) / area(aoi));
}

export function generatePairs(
  scenes: SceneRecord[],
  aois: Feature<Polygon, AoiProperties>[],
): PairRecord[] {
  const pairs: PairRecord[] = [];
  for (const aoi of aois) {
    for (const epoch of ["PRE", "POST"] as const) {
      const candidates = scenes.filter((scene) => scene.epoch === epoch);
      for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
          const left = candidates[leftIndex]!;
          const right = candidates[rightIndex]!;
          const commonAoiFraction = overlapFraction(aoi, left, right);
          if (commonAoiFraction <= 0) continue;
          const approximateSeparation = approximateRaySeparationDeg(
            left.offNadirDeg,
            left.azimuthDeg,
            right.offNadirDeg,
            right.azimuthDeg,
          );
          const cameraModelsAvailable = left.cameraModelAvailable && right.cameraModelAvailable;
          const reasons: string[] = [];
          let verdict: PairRecord["verdict"] = "METADATA_REVIEW";
          if (approximateSeparation !== null && approximateSeparation < 5) {
            verdict = "REJECT_WEAK_GEOMETRY";
            reasons.push(`Approximate ray separation ${approximateSeparation.toFixed(2)} deg is below 5 deg`);
          } else if (!cameraModelsAvailable) {
            verdict = "PUBLIC_PARALLAX_ONLY";
            reasons.push("At least one public product lacks a rigorous camera model");
          }
          if (commonAoiFraction < 0.5) reasons.push("Pair covers less than half of the AOI");
          pairs.push({
            schemaVersion: 1,
            pairId: `${aoi.properties.id}__${left.sceneId}__${right.sceneId}`,
            aoiId: aoi.properties.id,
            epoch,
            leftSceneId: left.sceneId,
            rightSceneId: right.sceneId,
            providers: [...new Set([left.provider, right.provider])],
            commonAoiFraction,
            acquisitionDeltaSeconds: Math.abs(Date.parse(left.acquiredAt) - Date.parse(right.acquiredAt)) / 1000,
            approximateRaySeparationDeg: approximateSeparation,
            cameraModelsAvailable,
            verdict,
            reasons,
          });
        }
      }
    }
  }
  return pairs.sort(
    (a, b) =>
      b.commonAoiFraction - a.commonAoiFraction ||
      (b.approximateRaySeparationDeg ?? -1) - (a.approximateRaySeparationDeg ?? -1),
  );
}
