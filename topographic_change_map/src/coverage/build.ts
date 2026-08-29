import fs from "node:fs";
import path from "node:path";
import { area, bbox, buffer, feature, featureCollection, intersect, union } from "@turf/turf";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { PROJECT_ROOT } from "../constants.js";
import type { SceneRecord } from "../catalogue/types.js";
import { approximateRaySeparationDeg } from "../catalogue/pairs.js";

type AreaFeature = Feature<Polygon | MultiPolygon>;

interface SceneCatalogue {
  scenes: SceneRecord[];
}

const SOURCES = [
  ["UNOSAT", "unosat_damage_area.geojson"],
  ["HOT", "hot_flood_extent.geojson"],
  ["NESRA", "nesra_flood_zones.geojson"],
] as const;

function readFeatures(target: string): AreaFeature[] {
  const value = JSON.parse(fs.readFileSync(target, "utf8")) as FeatureCollection;
  return value.features.filter(
    (item): item is AreaFeature =>
      item.geometry?.type === "Polygon" || item.geometry?.type === "MultiPolygon",
  );
}

function pairFootprint(scenes: SceneRecord[]): AreaFeature {
  const ids = ["B040001100881410", "B040001100881710"];
  const selected = ids.map((id) => scenes.find((scene) => scene.sceneId === id));
  if (selected.some((scene) => !scene)) throw new Error("Strong Vantor pair missing from catalogue");
  const left = feature(selected[0]!.geometry) as AreaFeature;
  const right = feature(selected[1]!.geometry) as AreaFeature;
  const common = intersect(featureCollection([left, right]));
  if (!common) throw new Error("Strong Vantor pair has no common footprint");
  return common as AreaFeature;
}

export function buildCoverageReport(): { sourceCount: number; pairFootprintKm2: number } {
  const affectedRoot = path.join(PROJECT_ROOT, "catalogue/affected");
  const catalogue = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, "catalogue/public-scenes.json"), "utf8"),
  ) as SceneCatalogue;
  const footprint = pairFootprint(catalogue.scenes);
  const pairAreaKm2 = area(footprint) / 1e6;
  const results = SOURCES.map(([name, filename]) => {
    const features = readFeatures(path.join(affectedRoot, filename));
    const totalAreaM2 = features.reduce((sum, item) => sum + area(item), 0);
    const coveredAreaM2 = features.reduce((sum, item) => {
      const overlap = intersect(featureCollection([item, footprint]));
      return sum + (overlap ? area(overlap) : 0);
    }, 0);
    return {
      source: name,
      file: filename,
      polygons: features.length,
      affectedAreaKm2: totalAreaM2 / 1e6,
      pairCoveredAreaKm2: coveredAreaM2 / 1e6,
      pairCoverageFraction: totalAreaM2 > 0 ? coveredAreaM2 / totalAreaM2 : 0,
    };
  });
  const unosat = readFeatures(path.join(affectedRoot, "unosat_damage_area.geojson"))[0]!;
  const vantorPost = catalogue.scenes.filter(
    (scene) => scene.provider === "VANTOR_OPEN" && scene.epoch === "POST",
  );
  const candidatePairs: Array<{
    leftSceneId: string;
    rightSceneId: string;
    acquisitionDeltaSeconds: number;
    separationDeg: number;
    affectedCoverageKm2: number;
    workingBboxWgs84: [number, number, number, number];
    footprint: AreaFeature;
  }> = [];
  for (let leftIndex = 0; leftIndex < vantorPost.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < vantorPost.length; rightIndex += 1) {
      const left = vantorPost[leftIndex]!;
      const right = vantorPost[rightIndex]!;
      const acquisitionDeltaSeconds = Math.abs(
        (Date.parse(left.acquiredAt) - Date.parse(right.acquiredAt)) / 1000,
      );
      if (acquisitionDeltaSeconds > 1800) continue;
      const separationDeg = approximateRaySeparationDeg(
        left.offNadirDeg,
        left.azimuthDeg,
        right.offNadirDeg,
        right.azimuthDeg,
      );
      if (separationDeg === null || separationDeg < 15) continue;
      const common = intersect(
        featureCollection([
          feature(left.geometry) as AreaFeature,
          feature(right.geometry) as AreaFeature,
        ]),
      ) as AreaFeature | null;
      if (!common) continue;
      const affected = intersect(featureCollection([common, unosat]));
      const affectedCoverageKm2 = affected ? area(affected) / 1e6 : 0;
      if (affectedCoverageKm2 <= 0) continue;
      const buffered = buffer(affected!, 1, { units: "kilometers" });
      const working = bbox(buffered ?? affected!) as [number, number, number, number];
      candidatePairs.push({
        leftSceneId: left.sceneId,
        rightSceneId: right.sceneId,
        acquisitionDeltaSeconds,
        separationDeg,
        affectedCoverageKm2,
        workingBboxWgs84: working,
        footprint: common,
      });
    }
  }
  candidatePairs.sort((a, b) => b.affectedCoverageKm2 - a.affectedCoverageKm2);
  let plausibleUnion: AreaFeature | null = null;
  for (const candidate of candidatePairs) {
    plausibleUnion = plausibleUnion
      ? ((union(featureCollection([plausibleUnion, candidate.footprint])) as AreaFeature | null) ??
        plausibleUnion)
      : candidate.footprint;
  }
  const plausibleAffected = plausibleUnion
    ? intersect(featureCollection([plausibleUnion, unosat]))
    : null;
  const plausibleAffectedKm2 = plausibleAffected ? area(plausibleAffected) / 1e6 : 0;
  fs.writeFileSync(
    path.join(affectedRoot, "strong-pair-common-footprint.geojson"),
    `${JSON.stringify({ type: "FeatureCollection", features: [{ ...footprint, properties: { pair: "B040001100881410 + B040001100881710" } }] }, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(affectedRoot, "coverage-summary.json"),
    `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), pairFootprintKm2: pairAreaKm2, sources: results, plausibleVantorPairs: candidatePairs.map(({ footprint: _footprint, ...candidate }) => candidate), plausiblePairUnionAffectedKm2: plausibleAffectedKm2, plausiblePairUnionAffectedFraction: plausibleAffectedKm2 / (area(unosat) / 1e6) }, null, 2)}\n`,
  );
  const rows = results
    .map(
      (entry) =>
        `| ${entry.source} | ${entry.polygons} | ${entry.affectedAreaKm2.toFixed(2)} | ${entry.pairCoveredAreaKm2.toFixed(2)} | ${(entry.pairCoverageFraction * 100).toFixed(1)}% |`,
    )
    .join("\n");
  const pairRows = candidatePairs
    .map(
      (pair) =>
        `| ${pair.leftSceneId} | ${pair.rightSceneId} | ${pair.acquisitionDeltaSeconds.toFixed(0)} | ${pair.separationDeg.toFixed(2)} | ${pair.affectedCoverageKm2.toFixed(2)} |`,
    )
    .join("\n");
  fs.writeFileSync(
    path.join(PROJECT_ROOT, "catalogue/COVERAGE.md"),
    `# Affected-area stereo coverage

Generated: ${new Date().toISOString()}

The strong public Vantor pair has a ${pairAreaKm2.toFixed(2)} km² common footprint. Footprint coverage is an acquisition upper bound; direct change-measurement support is reported separately after dense matching.

| Affected source | Polygons | Source area km² | Inside pair km² | Footprint coverage |
|---|---:|---:|---:|---:|
${rows}

UNOSAT is the primary authoritative mask. HOT and NESRA are retained as independent supplementary interpretations; their polygon areas may overlap internally and are not added together.

## Plausible Vantor ortho-parallax pairs

Pairs below are no more than 30 minutes apart, have at least 15 degrees approximate separation, and overlap the UNOSAT affected mask. This is a screening list; each still requires independent matching and stable-terrain validation.

| Left | Right | Delta seconds | Separation | UNOSAT overlap km² |
|---|---|---:|---:|---:|
${pairRows || "| — | — | — | — | No additional plausible pairs |"}

Their union covers ${plausibleAffectedKm2.toFixed(2)} km² (${(plausibleAffectedKm2 / (area(unosat) / 1e6) * 100).toFixed(1)}%) of the UNOSAT mask before cloud/matching losses.
`,
  );
  return { sourceCount: results.length, pairFootprintKm2: pairAreaKm2 };
}
