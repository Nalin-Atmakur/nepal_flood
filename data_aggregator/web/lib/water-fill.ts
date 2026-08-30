/**
 * The water's visual level field (web/docs/14-flood-sim.md §3, D-059). The sim knows which cells are wet and how
 * deep; the scene exaggerates depth ×visAmp, which lifts the sheet off the bed — and a sheet lifted off the bed
 * has edges hanging in the air where the real water would meet the valley walls. So the scene renders the water
 * as a *level fill*: every cell gets the highest surface level among the wet cells around it (within `radius`
 * cells along each axis, falling by `falloff` per cell of Manhattan distance so the surface never reaches out
 * forever on a flat plain), and a cell is
 * drawn wet when that level stands above its own ground. The result moulds to the mountain: the surface extends
 * sideways exactly until it meets the terrain at its own height.
 *
 *   level[c]  = bed[c] + depth[c]·amp      where depth > wet, else DRY
 *   fill[c]   = max over |di|,|dk| ≤ radius of level[c'] − falloff·(max(0,|di|−flat) + max(0,|dk|−flat))   (x pass, then z)
 *               — level for the first `flat` cells (a lake between the walls), then decaying (a plain floods only so far)
 *   drawn wet = fill[c] > bed[c] + lip
 *
 * Pure and allocation-free per call (the caller owns `out` and `scratch`), unit-tested.
 */
import type { Grid } from "./flood-sim";

export const DRY = -1e9;
export const FILL_RADIUS = 8;
/** no decay within this many cells: the surface is a level lake wall to wall, not a hump over the channel (D-071) */
export const FILL_FLAT = 4;
export const FILL_FALLOFF = 0.25;
/** a cell is drawn wet when the fill stands at least this far above its ground */
export const FILL_LIP = 0.05;

/**
 * Compute the fill into `out` (one value per cell). Returns true when any cell is wet.
 * `scratch` must be another Float32Array of the same length.
 */
export function fillLevels(
  grid: Grid,
  bed: Float32Array,
  depth: Float32Array,
  amp: number,
  out: Float32Array,
  scratch: Float32Array,
  opts: { wet?: number; radius?: number; falloff?: number; flat?: number } = {},
): boolean {
  const { nx, nz } = grid;
  const wet = opts.wet ?? 0.05;
  const R = opts.radius ?? FILL_RADIUS;
  const K = opts.falloff ?? FILL_FALLOFF;
  const F = opts.flat ?? FILL_FLAT;
  const n = nx * nz;
  let any = false;
  for (let c = 0; c < n; c++) {
    if (depth[c] > wet) {
      scratch[c] = bed[c] + depth[c] * amp;
      any = true;
    } else scratch[c] = DRY;
  }
  if (!any) {
    out.fill(DRY);
    return false;
  }
  // x pass: scratch → out
  for (let k = 0; k < nz; k++) {
    const row = k * nx;
    for (let i = 0; i < nx; i++) {
      let m = scratch[row + i];
      const i0 = Math.max(0, i - R);
      const i1 = Math.min(nx - 1, i + R);
      for (let j = i0; j <= i1; j++) {
        const v = scratch[row + j] - K * Math.max(0, Math.abs(j - i) - F);
        if (v > m) m = v;
      }
      out[row + i] = m;
    }
  }
  // z pass: out → scratch, then copy back
  for (let i = 0; i < nx; i++) {
    for (let k = 0; k < nz; k++) {
      let m = out[k * nx + i];
      const k0 = Math.max(0, k - R);
      const k1 = Math.min(nz - 1, k + R);
      for (let j = k0; j <= k1; j++) {
        const v = out[j * nx + i] - K * Math.max(0, Math.abs(j - k) - F);
        if (v > m) m = v;
      }
      scratch[k * nx + i] = m;
    }
  }
  out.set(scratch);
  return true;
}
