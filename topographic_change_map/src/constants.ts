import path from "node:path";

export const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
export const LOCAL_ENV_PATH = path.join(PROJECT_ROOT, ".env.topographic.local");
export const WORK_ROOT = path.join(PROJECT_ROOT, ".work");
export const PRIVATE_ROOT = path.join(PROJECT_ROOT, "private");
export const STATE_PATH = path.join(WORK_ROOT, "state.json");
export const AUTOMATION_PROFILE_ROOT = path.join(PROJECT_ROOT, "automation-profile");

export const CHROME_EXECUTABLE =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const CHROME_SOURCE_ROOT = path.join(
  process.env.HOME ?? "",
  "Library/Application Support/Google/Chrome",
);
export const BREEZE_SOURCE_PROFILE = path.join(CHROME_SOURCE_ROOT, "Profile 12");
export const BREEZE_CLONE_PROFILE = path.join(AUTOMATION_PROFILE_ROOT, "Default");

export const SECONDARY_DISPLAY = Object.freeze({
  index: 1,
  x: 2560,
  y: 508,
  width: 1440,
  height: 932,
});

export const CHROME_BOUNDS = Object.freeze({
  x: 2590,
  y: 538,
  width: 1380,
  height: 860,
});

export const SANDBOX_DISPLAY = Object.freeze({
  index: 0,
  x: 0,
  y: 0,
  width: 1792,
  height: 1120,
});

export const SANDBOX_CHROME_BOUNDS = Object.freeze({
  x: 20,
  y: 30,
  width: 1750,
  height: 1050,
});

export function isSandboxRuntime(): boolean {
  return process.env.USER === "zoral" && process.env.HOME === "/Users/zoral";
}

export function targetDisplay() {
  return isSandboxRuntime() ? SANDBOX_DISPLAY : SECONDARY_DISPLAY;
}

export function targetChromeBounds() {
  return isSandboxRuntime() ? SANDBOX_CHROME_BOUNDS : CHROME_BOUNDS;
}
