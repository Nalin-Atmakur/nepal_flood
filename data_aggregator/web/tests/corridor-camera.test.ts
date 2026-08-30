import { describe, expect, it } from "vitest";
import { FOV_DEG, RAD_MAX, RAD_MIN, clampOrbit, corridorBounds, fitCamera, horizontality, orbitPosition, panTarget } from "@/lib/corridor-camera";

function projectsInside(o: ReturnType<typeof fitCamera>, aspect: number): boolean {
  // every corner of the corridor box must land inside the frustum: check with the pinhole model
  const b = corridorBounds();
  const cam = orbitPosition(o);
  const f = { x: o.target.x - cam.x, y: o.target.y - cam.y, z: o.target.z - cam.z };
  const fl = Math.hypot(f.x, f.y, f.z);
  f.x /= fl;
  f.y /= fl;
  f.z /= fl;
  // camera basis
  const up = { x: 0, y: 1, z: 0 };
  const r = { x: f.y * up.z - f.z * up.y, y: f.z * up.x - f.x * up.z, z: f.x * up.y - f.y * up.x };
  const rl = Math.hypot(r.x, r.y, r.z);
  r.x /= rl;
  r.y /= rl;
  r.z /= rl;
  const u = { x: r.y * f.z - r.z * f.y, y: r.z * f.x - r.x * f.z, z: r.x * f.y - r.y * f.x };
  const tanV = Math.tan(((FOV_DEG * Math.PI) / 180) / 2);
  const tanH = tanV * aspect;
  for (const x of [b.minX, b.maxX]) for (const y of [b.minY, b.maxY]) for (const z of [b.minZ, b.maxZ]) {
    const d = { x: x - cam.x, y: y - cam.y, z: z - cam.z };
    const depth = d.x * f.x + d.y * f.y + d.z * f.z;
    const sx = (d.x * r.x + d.y * r.y + d.z * r.z) / depth;
    const sy = (d.x * u.x + d.y * u.y + d.z * u.z) / depth;
    if (depth <= 0 || Math.abs(sx) > tanH * 1.02 || Math.abs(sy) > tanV * 1.02) return false;
  }
  return true;
}

describe("corridor camera", () => {
  it("fits the whole corridor in landscape and portrait frames", () => {
    for (const aspect of [1280 / 480, 1024 / 480, 390 / 520, 360 / 600]) {
      const o = fitCamera(aspect);
      expect(o.rad).toBeGreaterThanOrEqual(RAD_MIN);
      expect(o.rad).toBeLessThanOrEqual(RAD_MAX);
      expect(projectsInside(o, aspect)).toBe(true);
    }
  });
  it("portrait turns the corridor diagonal and pulls back further", () => {
    const l = fitCamera(2.5);
    const p = fitCamera(0.7);
    expect(p.az).not.toBe(l.az);
    expect(p.rad).toBeGreaterThan(l.rad * 0.8);
  });
  it("clamps and measures horizontality", () => {
    expect(clampOrbit({ target: { x: 0, y: 0, z: 0 }, rad: 1, pol: 9, az: 0 }).rad).toBe(RAD_MIN);
    expect(horizontality(0.3)).toBe(0);
    expect(horizontality(1.42)).toBe(1);
    expect(horizontality(0.9)).toBe(0);
    expect(horizontality(1.25)).toBeGreaterThan(0.4);
  });
  it("pans the target on the ground and stays inside the corridor", () => {
    const o = fitCamera(2.5);
    const moved = panTarget(o, 200, 0, 480);
    expect(moved.target.x).not.toBe(o.target.x);
    expect(moved.target.y).toBe(o.target.y);
    const far = panTarget(o, 1e6, 1e6, 480);
    const b = corridorBounds();
    expect(far.target.x).toBeGreaterThanOrEqual(b.minX);
    expect(far.target.x).toBeLessThanOrEqual(b.maxX);
  });
});
