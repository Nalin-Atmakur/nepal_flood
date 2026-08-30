import { describe, expect, it } from "vitest";
import { RAMP, SNOW_LINE, hex, mix, noise3, terrainColour, type RGB } from "@/lib/terrain-colours";

const lum = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const near = (a: RGB, b: RGB, tol = 0.06) => Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol && Math.abs(a[2] - b[2]) < tol;

describe("terrain colours", () => {
  it("parses hex and mixes", () => {
    expect(hex("#ffffff")).toEqual([1, 1, 1]);
    expect(mix([0, 0, 0], [1, 1, 1], 0.5)).toEqual([0.5, 0.5, 0.5]);
  });
  it("stays in [0, 1] over the whole domain", () => {
    for (let e = -5; e <= 40; e += 2.5)
      for (let s = 0; s <= 1; s += 0.25)
        for (const a of [-1, 0, 1])
          for (const n of [-1, 0, 1]) {
            const c = terrainColour(e, s, a, n);
            for (const v of c) {
              expect(v).toBeGreaterThanOrEqual(0);
              expect(v).toBeLessThanOrEqual(1);
              expect(Number.isFinite(v)).toBe(true);
            }
          }
  });
  it("valley floor is silt, mid slopes forest, ridge line snow", () => {
    expect(near(terrainColour(0, 0.05), RAMP.silt)).toBe(true);
    expect(near(terrainColour(11, 0.2), RAMP.forest)).toBe(true);
    expect(near(terrainColour(SNOW_LINE + 6, 0.1), RAMP.snow)).toBe(true);
    expect(lum(terrainColour(SNOW_LINE + 6, 0.1))).toBeGreaterThan(lum(terrainColour(11, 0.2)));
  });
  it("steep faces are bare rock regardless of elevation (below the snow line)", () => {
    expect(near(terrainColour(11, 0.9), RAMP.rock, 0.08)).toBe(true);
    expect(near(terrainColour(3, 0.9), RAMP.rock, 0.08)).toBe(true);
  });
  it("north faces are darker than south faces", () => {
    expect(lum(terrainColour(11, 0.3, 1))).toBeLessThan(lum(terrainColour(11, 0.3, -1)));
  });
  it("noise is bounded and deterministic", () => {
    let mn = 1;
    let mx = -1;
    for (let x = -50; x < 50; x += 1.7)
      for (let z = -30; z < 30; z += 1.3) {
        const n = noise3(x, z);
        mn = Math.min(mn, n);
        mx = Math.max(mx, n);
      }
    expect(mn).toBeGreaterThanOrEqual(-1);
    expect(mx).toBeLessThanOrEqual(1);
    expect(mx - mn).toBeGreaterThan(0.8);
    expect(noise3(3.2, -4.1)).toBe(noise3(3.2, -4.1));
  });
});
