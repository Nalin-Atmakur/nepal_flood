import { describe, expect, it } from "vitest";
import { DRY, FILL_LIP, fillLevels } from "@/lib/water-fill";
import type { Grid } from "@/lib/flood-sim";

/** a V-shaped valley: bed rises 1 unit per cell either side of the centre row */
function valley(nx: number, nz: number, slope = 1): { grid: Grid; bed: Float32Array } {
  const grid: Grid = { nx, nz, x0: 0, z0: 0, cell: 1 };
  const bed = new Float32Array(nx * nz);
  const mid = Math.floor(nz / 2);
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) bed[k * nx + i] = Math.abs(k - mid) * slope;
  return { grid, bed };
}

describe("water level fill", () => {
  it("is dry everywhere when the sim is dry", () => {
    const { grid, bed } = valley(10, 9);
    const depth = new Float32Array(90);
    const out = new Float32Array(90);
    const scratch = new Float32Array(90);
    expect(fillLevels(grid, bed, depth, 4, out, scratch)).toBe(false);
    expect(out.every((v) => v === DRY)).toBe(true);
  });

  it("extends the surface sideways until it meets the valley walls at its own height", () => {
    const { grid, bed } = valley(12, 13); // walls rise 1/cell; centre row k = 6
    const depth = new Float32Array(grid.nx * grid.nz);
    for (let i = 0; i < grid.nx; i++) depth[6 * grid.nx + i] = 1; // 1 deep along the channel
    const out = new Float32Array(depth.length);
    const scratch = new Float32Array(depth.length);
    expect(fillLevels(grid, bed, depth, 4, out, scratch, { falloff: 0 })).toBe(true);
    // level 4 above the floor → the walls stand 4 high four cells out: rows 2..10 are under water, 1 and 11 are not
    const wetRows: number[] = [];
    for (let k = 0; k < grid.nz; k++) if (out[k * grid.nx + 5] > bed[k * grid.nx + 5] + FILL_LIP) wetRows.push(k);
    expect(wetRows).toEqual([3, 4, 5, 6, 7, 8, 9]);
    // and the surface is level across the fill (a lake, not a ridge)
    for (const k of wetRows) expect(out[k * grid.nx + 5]).toBeCloseTo(4, 6);
  });

  it("falls off with distance so it does not reach forever across a plain, and stays within the radius", () => {
    const grid: Grid = { nx: 30, nz: 5, x0: 0, z0: 0, cell: 1 };
    const bed = new Float32Array(150); // flat
    const depth = new Float32Array(150);
    depth[2 * 30 + 10] = 0.5; // one wet cell
    const out = new Float32Array(150);
    const scratch = new Float32Array(150);
    fillLevels(grid, bed, depth, 4, out, scratch, { radius: 6, falloff: 0.25 });
    expect(out[2 * 30 + 10]).toBeCloseTo(2, 6);
    expect(out[2 * 30 + 13]).toBeCloseTo(2 - 0.75, 6);
    expect(out[2 * 30 + 16]).toBeCloseTo(2 - 1.5, 6);
    expect(out[2 * 30 + 17]).toBe(DRY);
    // the separable passes give a Manhattan falloff: (dx 3, dz 2) → 5 cells
    expect(out[0 * 30 + 13]).toBeCloseTo(2 - 1.25, 6);
  });
});
