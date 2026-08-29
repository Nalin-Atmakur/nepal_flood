import fs from "node:fs";
import path from "node:path";
import type { Feature, Polygon } from "geojson";
import { PROJECT_ROOT } from "../constants.js";
import { projectAois } from "./aois.js";
import { generatePairs } from "./pairs.js";
import { crawlStac } from "./stac.js";
import type { AoiProperties, PairRecord, SceneRecord } from "./types.js";

const VANTOR_ROOT =
  "https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json";
const PLANET_ROOT =
  "https://data.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/catalog.json";
const OUTPUT_ROOT = path.join(PROJECT_ROOT, "catalogue");

function writeJson(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

function candidateRows(pairs: PairRecord[]): string {
  const targetIds = new Set([
    "20260827_020055_ssc1_u0001",
    "20260827_060959_65_3009",
    "B040001100881610",
    "B040001100881710",
  ]);
  return pairs
    .filter((pair) => targetIds.has(pair.leftSceneId) && targetIds.has(pair.rightSceneId))
    .slice(0, 30)
    .map(
      (pair) =>
        `| ${pair.aoiId} | ${pair.leftSceneId} | ${pair.rightSceneId} | ${(pair.commonAoiFraction * 100).toFixed(1)}% | ${pair.approximateRaySeparationDeg?.toFixed(2) ?? "unknown"} | ${pair.verdict} |`,
    )
    .join("\n");
}

function buildReport(scenes: SceneRecord[], pairs: PairRecord[]): string {
  const byProvider = Object.entries(
    scenes.reduce<Record<string, number>>((counts, scene) => {
      counts[scene.provider] = (counts[scene.provider] ?? 0) + 1;
      return counts;
    }, {}),
  );
  const cameraCount = scenes.filter((scene) => scene.cameraModelAvailable).length;
  return `# Public imagery catalogue report

Generated: ${new Date().toISOString()}

## Summary

- Scenes: ${scenes.length}
- Providers: ${byProvider.map(([name, count]) => `${name} ${count}`).join(", ")}
- Public products with rigorous camera model assets: ${cameraCount}
- Same-epoch overlapping AOI pair records: ${pairs.length}
- Public-parallax-only pairs: ${pairs.filter((pair) => pair.verdict === "PUBLIC_PARALLAX_ONLY").length}

The public Vantor and Planet disaster products are orthorectified. Their view metadata can rank correspondence/parallax experiments, but no pair is promoted to rigorous DSM reconstruction unless both original camera models become available.

## Named candidate combinations

| AOI | Left | Right | Common AOI | Approx. ray separation | Verdict |
|---|---|---|---:|---:|---|
${candidateRows(pairs) || "| — | — | — | — | — | No named combinations overlap |"}

## Important interpretation

- Coverage is calculated against explicit 1 km AOI polygons, not the older Rasuwagadhi point flag.
- Approximate ray separation uses published off-nadir and azimuth metadata, not RPC ray casting.
- PUBLIC_PARALLAX_ONLY means imagery may support correspondence and relative residual-parallax experiments but not defensible absolute elevation.
- Scene-wide cloud cover is retained but must later be recomputed locally using usability masks.
`;
}

export interface CatalogueBuildResult {
  scenes: number;
  pairs: number;
  outputRoot: string;
}

export async function buildPublicCatalogue(): Promise<CatalogueBuildResult> {
  const [vantor, planet] = await Promise.all([crawlStac(VANTOR_ROOT), crawlStac(PLANET_ROOT)]);
  const scenes = [...vantor, ...planet];
  const aois = projectAois();
  const pairs = generatePairs(scenes, aois.features as Feature<Polygon, AoiProperties>[]);
  writeJson(path.join(OUTPUT_ROOT, "aois.geojson"), aois);
  writeJson(path.join(OUTPUT_ROOT, "public-scenes.json"), {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scenes,
  });
  writeJson(path.join(OUTPUT_ROOT, "public-pairs.json"), {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    pairs,
  });
  fs.writeFileSync(path.join(OUTPUT_ROOT, "REPORT.md"), buildReport(scenes, pairs));
  return { scenes: scenes.length, pairs: pairs.length, outputRoot: OUTPUT_ROOT };
}
