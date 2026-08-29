import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT, WORK_ROOT } from "../constants.js";
import { runCommand } from "../process.js";
import type { SceneRecord } from "../catalogue/types.js";

interface SceneCatalogue {
  scenes: SceneRecord[];
}

interface PilotDefinition {
  id: string;
  aoiId: string;
  leftSceneId: string;
  rightSceneId: string;
}

const PILOTS: PilotDefinition[] = [
  {
    id: "vantor-opposite-look-syabrubesi",
    aoiId: "syabrubesi-pilot-v1",
    leftSceneId: "B040001100881610",
    rightSceneId: "B040001100881710",
  },
  {
    id: "skysat-pelican-syabrubesi",
    aoiId: "syabrubesi-pilot-v1",
    leftSceneId: "20260827_020055_ssc1_u0001",
    rightSceneId: "20260827_060959_65_3009",
  },
];

const PYTHON = path.join(WORK_ROOT, "venv/bin/python");
const AOIS = path.join(PROJECT_ROOT, "catalogue/aois.geojson");
const SCENES = path.join(PROJECT_ROOT, "catalogue/public-scenes.json");
const OUTPUT = path.join(WORK_ROOT, "parallax");
const PUBLISHED = path.join(PROJECT_ROOT, "parallax");

function visualAsset(scene: SceneRecord): string {
  const preferred = scene.assets.find((asset) => asset.key === "visual") ?? scene.assets.find((asset) => asset.roles.includes("visual"));
  if (!preferred) throw new Error(`Scene ${scene.sceneId} has no visual asset`);
  return preferred.href;
}

async function crop(scene: SceneRecord, aoiId: string, target: string): Promise<void> {
  const result = await runCommand(
    PYTHON,
    [
      path.join(PROJECT_ROOT, "python/crop_cog.py"),
      "--url",
      visualAsset(scene),
      "--aoi",
      AOIS,
      "--aoi-id",
      aoiId,
      "--scene-id",
      scene.sceneId,
      "--output",
      target,
    ],
    { timeoutMs: 300_000 },
  );
  if (result.exitCode !== 0) throw new Error(`Crop failed for ${scene.sceneId}: ${result.stderr}`);
}

function isValidRaster(target: string): boolean {
  return fs.existsSync(target) && fs.statSync(target).size > 4096;
}

export async function runPublicParallaxPilots(): Promise<{ pilots: number; results: unknown[] }> {
  if (!fs.existsSync(PYTHON)) throw new Error("Python CV environment is missing under .work/venv");
  const catalogue = JSON.parse(fs.readFileSync(SCENES, "utf8")) as SceneCatalogue;
  fs.mkdirSync(OUTPUT, { recursive: true });
  fs.mkdirSync(PUBLISHED, { recursive: true });
  const summaries: unknown[] = [];
  for (const pilot of PILOTS) {
    const left = catalogue.scenes.find((scene) => scene.sceneId === pilot.leftSceneId);
    const right = catalogue.scenes.find((scene) => scene.sceneId === pilot.rightSceneId);
    if (!left || !right) throw new Error(`Pilot ${pilot.id} references an unknown scene`);
    const root = path.join(OUTPUT, pilot.id);
    const leftCrop = path.join(root, `${left.sceneId}.tif`);
    const rightCrop = path.join(root, `${right.sceneId}.tif`);
    if (!isValidRaster(leftCrop)) await crop(left, pilot.aoiId, leftCrop);
    if (!isValidRaster(rightCrop)) await crop(right, pilot.aoiId, rightCrop);
    const result = await runCommand(
      PYTHON,
      [
        path.join(PROJECT_ROOT, "python/sparse_parallax.py"),
        "--left",
        leftCrop,
        "--right",
        rightCrop,
        "--left-id",
        left.sceneId,
        "--right-id",
        right.sceneId,
        "--aoi-id",
        pilot.aoiId,
        "--output",
        root,
      ],
      { timeoutMs: 600_000 },
    );
    if (result.exitCode !== 0) throw new Error(`Parallax pilot ${pilot.id} failed: ${result.stderr}`);
    const summary = JSON.parse(fs.readFileSync(path.join(root, "summary.json"), "utf8"));
    summaries.push({ pilotId: pilot.id, ...summary });
  }
  fs.writeFileSync(
    path.join(PUBLISHED, "public-pilot-results.json"),
    `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), results: summaries }, null, 2)}\n`,
  );
  const rows = summaries
    .map((entry) => {
      const value = entry as Record<string, unknown>;
      const diagnostic = value.elevationDiagnostic as Record<string, unknown> | undefined;
      return `| ${value.pilotId} | ${value.reciprocalRatioMatches} | ${value.ransacInliers} | ${((value.spatialSupportFraction as number) * 100).toFixed(1)}% | ${(value.residualMedianM as number).toFixed(2)} m | ${typeof diagnostic?.principalResidualVsElevationCorrelation === "number" ? diagnostic.principalResidualVsElevationCorrelation.toFixed(3) : "n/a"} | ${value.qualityVerdict} |`;
    })
    .join("\n");
  fs.writeFileSync(
    path.join(PUBLISHED, "REPORT.md"),
    `# Public orthorectified-image parallax pilots

Generated: ${new Date().toISOString()}

## Results

| Pilot | Reciprocal matches | RANSAC inliers | Spatial support | Median residual | Residual/elevation correlation | Verdict |
|---|---:|---:|---:|---:|---:|---|
${rows}

## Interpretation

- The Vantor opposite-look pair passes the limited sparse-parallax gate. Its residual displacement remains spatially sparse and cannot be converted to absolute height without the original camera models.
- The public SkySat-Pelican orthorectified pair fails sparse correspondence on the explicit Syabrubesi pilot. Camera-bearing Basic products may still be tested if acquired, but the public orthos do not currently support a reliable reconstruction.
- The elevation correlation uses coarse Copernicus GLO-30 only as a diagnostic for terrain dependence. It is not a calibration from residual pixels or metres to elevation.
- All crops, match visualizations, and point-level residuals remain under the ignored local work directory. Only aggregate non-imagery results are published.
`,
  );
  return { pilots: PILOTS.length, results: summaries };
}
