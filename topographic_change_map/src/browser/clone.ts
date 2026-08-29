import fs from "node:fs";
import path from "node:path";
import {
  AUTOMATION_PROFILE_ROOT,
  BREEZE_CLONE_PROFILE,
  BREEZE_SOURCE_PROFILE,
} from "../constants.js";
import { runCommand } from "../process.js";

const EXCLUDES = [
  "Cache",
  "Code Cache",
  "GPUCache",
  "GrShaderCache",
  "DawnGraphiteCache",
  "DawnWebGPUCache",
  "Service Worker/CacheStorage",
  "Sessions",
  "LOCK",
  "LOG",
  "LOG.old",
];

export async function cloneBreezeProfile(): Promise<void> {
  if (!fs.existsSync(BREEZE_SOURCE_PROFILE)) {
    throw new Error("Breeze source profile Profile 12 was not found");
  }
  fs.mkdirSync(BREEZE_CLONE_PROFILE, { recursive: true, mode: 0o700 });
  const args = ["-a", "--delete"];
  for (const exclude of EXCLUDES) args.push("--exclude", exclude);
  args.push(`${BREEZE_SOURCE_PROFILE}/`, `${BREEZE_CLONE_PROFILE}/`);
  const result = await runCommand("rsync", args, { timeoutMs: 120_000 });
  if (result.exitCode !== 0) throw new Error("Breeze profile clone failed");

  for (const singleton of ["SingletonCookie", "SingletonLock", "SingletonSocket"]) {
    fs.rmSync(path.join(AUTOMATION_PROFILE_ROOT, singleton), { force: true });
  }
  fs.chmodSync(AUTOMATION_PROFILE_ROOT, 0o700);
}
