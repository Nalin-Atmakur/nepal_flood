import fs from "node:fs";
import path from "node:path";
import { STATE_PATH } from "./constants.js";

export type MilestoneState =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "BLOCKED"
  | "FAILED";

export interface ProjectState {
  schemaVersion: 1;
  updatedAt: string;
  activeMilestone: string;
  milestones: Record<string, MilestoneState>;
  lastError?: string;
}

export function initialState(): ProjectState {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    activeMilestone: "M1_AUTOMATION_HARNESS",
    milestones: {
      M0_DURABLE_FOUNDATION: "COMPLETE",
      M1_AUTOMATION_HARNESS: "IN_PROGRESS",
      M2_PROVIDER_CATALOGUE: "PENDING",
      M3_DSM_READINESS: "PENDING",
      M4_DENSE_RECONSTRUCTION: "PENDING",
      M5_CHANGE_MAP_VIEWER: "PENDING",
    },
  };
}

export function loadState(statePath = STATE_PATH): ProjectState {
  if (!fs.existsSync(statePath)) return initialState();
  return JSON.parse(fs.readFileSync(statePath, "utf8")) as ProjectState;
}

export function saveState(state: ProjectState, statePath = STATE_PATH): void {
  fs.mkdirSync(path.dirname(statePath), { recursive: true, mode: 0o700 });
  const next = { ...state, updatedAt: new Date().toISOString() };
  const temporary = `${statePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, statePath);
}
