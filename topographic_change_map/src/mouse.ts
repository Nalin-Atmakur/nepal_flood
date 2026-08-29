import { runCommand } from "./process.js";

export interface MousePosition {
  x: number;
  y: number;
}

export async function readMousePosition(): Promise<MousePosition> {
  const swift = [
    "import CoreGraphics",
    "guard let event = CGEvent(source: nil) else { exit(1) }",
    'let point = event.location; print("\\(point.x),\\(point.y)")',
  ].join("; ");
  const result = await runCommand("swift", ["-e", swift], { timeoutMs: 30_000 });
  if (result.exitCode !== 0) throw new Error("Could not read system mouse position");
  const [x, y] = result.stdout.trim().split(",").map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error("Invalid system mouse position");
  }
  return { x: x!, y: y! };
}
