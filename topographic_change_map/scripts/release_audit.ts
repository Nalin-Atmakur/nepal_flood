import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "../src/constants.js";

const REPO_ROOT = path.resolve(PROJECT_ROOT, "..");

type Check = { id: string; passed: boolean; evidence: string };
const checks: Check[] = [];

function check(id: string, passed: boolean, evidence: string): void {
  checks.push({ id, passed, evidence });
}

function exists(relative: string): boolean {
  return fs.existsSync(path.join(REPO_ROOT, relative));
}

function readJson(relative: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relative), "utf8")) as Record<string, unknown>;
}

const requiredDocs = [
  "topographic_change_map/PLAN.md",
  "topographic_change_map/STATUS.md",
  "topographic_change_map/DECISIONS.md",
  "topographic_change_map/RUNBOOK.md",
  "topographic_change_map/SCALES_AND_AOI.md",
  "topographic_change_map/PUBLICATION.md",
  "topographic_change_map/products/VALIDATION.md",
];
check("durable-documentation", requiredDocs.every(exists), `${requiredDocs.length} canonical documents`);

for (const [name, tag] of [["ortho-change-v3-strict", "32m"], ["ortho-change-10m-experimental", "10m"]] as const) {
  const root = `topographic_change_map/products/${name}`;
  const required = [
    `surface_change_${tag}.tif`, `uncertainty_${tag}.tif`, `support_count_${tag}.tif`,
    `coverage_${tag}.tif`, `significant_change_${tag}.tif`, `pre_glo30_${tag}.tif`,
    `post_surface_estimate_${tag}.tif`, "summary.json", "validation.json", "promotion.json",
    "affected-coverage.json", "measured-support.geojson", "mapped-tiles-1km.geojson",
  ];
  check(`${name}-bundle`, required.every((file) => exists(`${root}/${file}`)), `${required.length} required artifacts`);
  const validation = readJson(`${root}/validation.json`);
  const promotion = readJson(`${root}/promotion.json`);
  check(`${name}-validation`, validation.passed === true, "validation.json passed=true");
  check(`${name}-promotion`, promotion.promotedToMosaic === true && promotion.accuracyClass === "RESEARCH_ONLY", "promoted only as RESEARCH_ONLY");
}

const release = readJson("topographic_change_map/products/release-manifest.json") as {
  defaultProduct?: { id?: string };
  rejectedProducts?: unknown[];
};
check(
  "release-selection",
  release.defaultProduct?.id === "ortho-change-v3-strict" && release.rejectedProducts?.length === 2,
  "strict default plus two documented expansion rejections",
);
for (const name of ["rejected-pair2-diagnostic", "rejected-pair3-diagnostic"]) {
  const promotion = readJson(`topographic_change_map/products/${name}/promotion.json`);
  check(
    `${name}-excluded`,
    promotion.promotedToMosaic === false && promotion.accuracyClass === "FAILED",
    "failed promotion is explicit and no rejected raster is published",
  );
}

const catalogue = readJson("topographic_change_map/catalogue/public-scenes.json") as { scenes?: unknown[] };
const sentinel = readJson("topographic_change_map/catalogue/sentinel2-context.json") as { scenes?: unknown[] };
check("public-imagery-catalogue", (catalogue.scenes?.length ?? 0) >= 37, `${catalogue.scenes?.length ?? 0} Vantor/Planet scenes`);
check("sentinel-context-catalogue", (sentinel.scenes?.length ?? 0) >= 1, `${sentinel.scenes?.length ?? 0} exact-overlap Sentinel-2 products`);

const accounts = fs.readFileSync(path.join(PROJECT_ROOT, "ACCOUNTS_REDACTED.md"), "utf8");
check(
  "provider-access-register",
  accounts.includes("Planet | Created and verified") && accounts.includes("NASA Earthdata/NSIDC | Registration submitted"),
  "redacted Planet entitlement and Earthdata handoff recorded",
);

const viewerFiles = [
  "docs/topographic-change-viewer/index.html",
  "docs/topographic-change-viewer/data/surface-grid.json",
  "docs/topographic-change-viewer/data/surface-grid-10m.json",
];
check("static-viewer", viewerFiles.every(exists), "32 m and 10 m static viewer grids");

const trackedTiffs = execFileSync("git", ["ls-files", "*.tif"], { cwd: REPO_ROOT, encoding: "utf8" })
  .trim().split("\n").filter(Boolean);
const invalidTrackedTiffs = trackedTiffs.filter((item) => !item.startsWith("topographic_change_map/products/"));
check("source-imagery-excluded", invalidTrackedTiffs.length === 0, `${trackedTiffs.length} tracked TIFFs, all aggregate products`);

const secretPath = path.join(PROJECT_ROOT, ".env.topographic.local");
if (fs.existsSync(secretPath)) {
  const mode = fs.statSync(secretPath).mode & 0o777;
  const tracked = execFileSync("git", ["ls-files", "--", "topographic_change_map/.env.topographic.local"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  check("secret-file-mode", mode === 0o600, `mode=${mode.toString(8)}`);
  check("secret-file-untracked", tracked.trim() === "", "ignored local secret file is not tracked");
} else {
  check("secret-file-absent", true, "no local secret file on this machine");
}

const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  passed: checks.every((item) => item.passed),
  scientificClass: "RESEARCH_ONLY",
  checks,
  externalGates: [
    "Earthdata HMA download awaits manual CAPTCHA/account activation.",
    "Rigorous absolute DSM awaits original RPC/physical camera products.",
    "GitHub Pages awaits repository-admin activation; committed static viewer is independently reachable.",
  ],
};
if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(PROJECT_ROOT, "products/release-audit.json"), `${JSON.stringify(result, null, 2)}\n`);
}
process.stdout.write(`${JSON.stringify(result)}\n`);
if (!result.passed) process.exitCode = 1;
