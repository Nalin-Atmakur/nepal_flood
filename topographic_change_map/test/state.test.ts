import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { initialState, loadState, saveState } from "../src/state.js";

describe("state", () => {
  it("persists state atomically with private permissions", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tcm-state-"));
    const target = path.join(root, "state.json");
    const state = initialState();
    saveState(state, target);
    expect(loadState(target).activeMilestone).toBe("M1_AUTOMATION_HARNESS");
    expect(fs.statSync(target).mode & 0o777).toBe(0o600);
  });
});
