/**
 * The corridor flood simulation — pure TypeScript over typed arrays, no three.js, so it runs in vitest.
 * See web/docs/14-flood-sim.md.
 *
 *   grid (nx × nz cells over the scene plane) ──▶ createSim(grid, bed)
 *        depth[] · flux L/R/U/D[] · vx[] · vz[]      step(dt): virtual pipes (Mei, Decaudin, Hu 2007)
 *        inject(x, z, r, volume)                      breach source at the barrier lake
 *        depthAt / velocityAt / frontX                what the scene, the objects and the clock read
 *
 * Illustrative, not a hydraulic model: the shape of the wave is right (a surge that outruns its tail, ponds
 * behind narrows, spreads on the plain); the numbers are not.
 */
import { LAKE_KMS, SCENE_D, SCENE_W, bedH, kmToX, meander, xToKm } from "./corridor-terrain";

export type Grid = { nx: number; nz: number; x0: number; z0: number; cell: number };

/** The grid the scene uses: 0.5-unit cells over the 96 × 52 plane → 192 × 104 = 19,968 cells. */
export const GRID: Grid = { nx: 192, nz: 104, x0: -SCENE_W / 2, z0: -SCENE_D / 2, cell: 0.5 };

/** Index of the cell containing (x, z), or −1 outside the grid. */
export function cellIndex(g: Grid, x: number, z: number): number {
  const i = Math.floor((x - g.x0) / g.cell);
  const k = Math.floor((z - g.z0) / g.cell);
  if (i < 0 || k < 0 || i >= g.nx || k >= g.nz) return -1;
  return k * g.nx + i;
}

/** Centre of cell `idx`. */
export function cellCentre(g: Grid, idx: number): { x: number; z: number } {
  const i = idx % g.nx;
  const k = (idx - i) / g.nx;
  return { x: g.x0 + (i + 0.5) * g.cell, z: g.z0 + (k + 0.5) * g.cell };
}

/** Terrain heights sampled at cell centres. */
export function sampleBed(g: Grid, h: (x: number, z: number) => number = bedH): Float32Array {
  const out = new Float32Array(g.nx * g.nz);
  for (let idx = 0; idx < out.length; idx++) {
    const { x, z } = cellCentre(g, idx);
    out[idx] = h(x, z);
  }
  return out;
}

export type SimOptions = {
  /** gravity-like acceleration on the height difference */
  g?: number;
  /** per-second momentum loss */
  friction?: number;
  /** per-second loss of films thinner than `filmDepth` (clears puddles once the wave has passed) */
  drain?: number;
  filmDepth?: number;
  /** the east (downstream) edge drains freely; false = closed box (used by the mass-conservation test) */
  openEast?: boolean;
};

export type Sim = {
  grid: Grid;
  bed: Float32Array;
  depth: Float32Array;
  vx: Float32Array;
  vz: Float32Array;
  step(dt: number): void;
  inject(x: number, z: number, radius: number, volume: number): void;
  reset(): void;
  depthAt(x: number, z: number): number;
  velocityAt(x: number, z: number): { vx: number; vz: number };
  /** furthest-downstream x along the channel where depth > `threshold`, or −Infinity when dry */
  frontX(threshold?: number): number;
  totalWater(): number;
  injected(): number;
  drained(): number;
};

export function createSim(grid: Grid, bed: Float32Array, o: SimOptions = {}): Sim {
  const g = o.g ?? 9.8;
  const friction = o.friction ?? 0.9;
  const drain = o.drain ?? 0.6;
  const filmDepth = o.filmDepth ?? 0.06;
  const openEast = o.openEast ?? true;
  const { nx, nz, cell } = grid;
  const n = nx * nz;
  const area = cell * cell;
  const depth = new Float32Array(n);
  const fl = new Float32Array(n);
  const fr = new Float32Array(n);
  const fu = new Float32Array(n);
  const fd = new Float32Array(n);
  const vx = new Float32Array(n);
  const vz = new Float32Array(n);
  let injectedV = 0;
  let drainedV = 0;

  // Channel cells (one per column, ±3 cells across the meander) for the front scan.
  const channelK = new Int32Array(nx);
  for (let i = 0; i < nx; i++) {
    const x = grid.x0 + (i + 0.5) * cell;
    channelK[i] = Math.max(0, Math.min(nz - 1, Math.floor((meander(x) - grid.z0) / cell)));
  }

  function step(dt: number): void {
    const keep = Math.max(0, 1 - friction * dt);
    const gdt = g * dt;
    // 1. outflow fluxes
    for (let k = 0; k < nz; k++) {
      for (let i = 0; i < nx; i++) {
        const idx = k * nx + i;
        const d = depth[idx];
        if (d <= 0 && fl[idx] === 0 && fr[idx] === 0 && fu[idx] === 0 && fd[idx] === 0) continue;
        const h = bed[idx] + d;
        let a = 0;
        let b = 0;
        let c = 0;
        let e = 0;
        if (i > 0) a = Math.max(0, fl[idx] * keep + gdt * (h - bed[idx - 1] - depth[idx - 1]));
        if (i < nx - 1) b = Math.max(0, fr[idx] * keep + gdt * (h - bed[idx + 1] - depth[idx + 1]));
        else if (openEast) b = Math.max(0, fr[idx] * keep + gdt * (d + 0.5));
        if (k > 0) c = Math.max(0, fu[idx] * keep + gdt * (h - bed[idx - nx] - depth[idx - nx]));
        if (k < nz - 1) e = Math.max(0, fd[idx] * keep + gdt * (h - bed[idx + nx] - depth[idx + nx]));
        const sum = a + b + c + e;
        if (sum > 0) {
          const K = (d * area) / (sum * dt);
          if (K < 1) {
            a *= K;
            b *= K;
            c *= K;
            e *= K;
          }
        }
        fl[idx] = a;
        fr[idx] = b;
        fu[idx] = c;
        fd[idx] = e;
      }
    }
    // 2. depth update + velocity
    const filmKeep = Math.max(0, 1 - drain * dt);
    for (let k = 0; k < nz; k++) {
      for (let i = 0; i < nx; i++) {
        const idx = k * nx + i;
        const inL = i > 0 ? fr[idx - 1] : 0;
        const inR = i < nx - 1 ? fl[idx + 1] : 0;
        const inU = k > 0 ? fd[idx - nx] : 0;
        const inD = k < nz - 1 ? fu[idx + nx] : 0;
        const out = fl[idx] + fr[idx] + fu[idx] + fd[idx];
        const inflow = inL + inR + inU + inD;
        if (inflow === 0 && out === 0 && depth[idx] === 0) {
          vx[idx] = 0;
          vz[idx] = 0;
          continue;
        }
        const d0 = depth[idx];
        let d1 = d0 + (dt * (inflow - out)) / area;
        if (d1 < 0) d1 = 0;
        if (openEast && i === nx - 1) drainedV += dt * fr[idx];
        const dAvg = (d0 + d1) * 0.5;
        if (dAvg > 1e-3) {
          const inv = 1 / (dAvg * cell);
          vx[idx] = ((inL - fl[idx] + fr[idx] - inR) * 0.5) * inv;
          vz[idx] = ((inU - fu[idx] + fd[idx] - inD) * 0.5) * inv;
        } else {
          vx[idx] = 0;
          vz[idx] = 0;
        }
        if (d1 < filmDepth) {
          const d2 = d1 * filmKeep;
          drainedV += (d1 - d2) * area;
          d1 = d2 < 1e-4 ? 0 : d2;
        }
        depth[idx] = d1;
      }
    }
  }

  function inject(x: number, z: number, radius: number, volume: number): void {
    if (volume <= 0) return;
    const cells: number[] = [];
    const r2 = radius * radius;
    const i0 = Math.max(0, Math.floor((x - radius - grid.x0) / cell));
    const i1 = Math.min(nx - 1, Math.ceil((x + radius - grid.x0) / cell));
    const k0 = Math.max(0, Math.floor((z - radius - grid.z0) / cell));
    const k1 = Math.min(nz - 1, Math.ceil((z + radius - grid.z0) / cell));
    for (let k = k0; k <= k1; k++) {
      for (let i = i0; i <= i1; i++) {
        const cx = grid.x0 + (i + 0.5) * cell;
        const cz = grid.z0 + (k + 0.5) * cell;
        if ((cx - x) * (cx - x) + (cz - z) * (cz - z) <= r2) cells.push(k * nx + i);
      }
    }
    if (!cells.length) {
      const idx = cellIndex(grid, x, z);
      if (idx < 0) return;
      cells.push(idx);
    }
    const per = volume / cells.length / area;
    for (const idx of cells) depth[idx] += per;
    injectedV += volume;
  }

  function reset(): void {
    depth.fill(0);
    fl.fill(0);
    fr.fill(0);
    fu.fill(0);
    fd.fill(0);
    vx.fill(0);
    vz.fill(0);
    injectedV = 0;
    drainedV = 0;
  }

  const depthAt = (x: number, z: number): number => {
    const idx = cellIndex(grid, x, z);
    return idx < 0 ? 0 : depth[idx];
  };
  const velocityAt = (x: number, z: number): { vx: number; vz: number } => {
    const idx = cellIndex(grid, x, z);
    return idx < 0 ? { vx: 0, vz: 0 } : { vx: vx[idx], vz: vz[idx] };
  };
  const frontX = (threshold = 0.15): number => {
    for (let i = nx - 1; i >= 0; i--) {
      const kc = channelK[i];
      for (let k = Math.max(0, kc - 3); k <= Math.min(nz - 1, kc + 3); k++) {
        if (depth[k * nx + i] > threshold) return grid.x0 + (i + 0.5) * cell;
      }
    }
    return -Infinity;
  };
  const totalWater = (): number => {
    let s = 0;
    for (let idx = 0; idx < n; idx++) s += depth[idx];
    return s * area;
  };

  return {
    grid,
    bed,
    depth,
    vx,
    vz,
    step,
    inject,
    reset,
    depthAt,
    velocityAt,
    frontX,
    totalWater,
    injected: () => injectedV,
    drained: () => drainedV,
  };
}

// ---------------------------------------------------------------------------
// The breach

/** Where the breach enters the grid: the first barrier lake. */
export const BREACH = { x: kmToX(LAKE_KMS[0]), z: meander(kmToX(LAKE_KMS[0])), radius: 3.6 };

/** Owner-adjustable scenario. Lake volume in million m³ (China MWR quoted 2.0 for the first barrier lake). */
export type Scenario = { lakeMm3: number; breachSeconds: number };
export const DEFAULT_SCENARIO: Scenario = { lakeMm3: 2.0, breachSeconds: 4 };
export const LAKE_MM3_MIN = 0.5;
export const LAKE_MM3_MAX = 20;
/** Sim volume (cell units³) per million m³ — tuned so 2 Mm³ fills the gorge and 20 Mm³ drowns the plain. */
export const SIM_UNITS_PER_MM3 = 260;

/**
 * Volume to inject during [t, t+dt] of a breach lasting `T` seconds: a triangular rate (strong first, tapering
 * to zero at T) that integrates to the full volume.
 */
export function breachVolume(total: number, T: number, t: number, dt: number): number {
  const F = (s: number) => {
    const u = Math.min(1, Math.max(0, s / T));
    return total * (2 * u - u * u);
  };
  return F(t + dt) - F(t);
}

// ---------------------------------------------------------------------------
// Objects: the catalogue, sweep thresholds, snapping and piece physics live in lib/object-catalogue.ts and
// lib/flood-physics.ts (corridor v2). The sim only provides depth / velocity fields.

// ---------------------------------------------------------------------------
// The clock: where the front is → what time it was on 26 Aug 2026 (NPT), from the seeded event timeline
// (DHM river watch, USGS, ICIMOD): breach 08:37 · Gyirong 08:40 · Timure 08:45 · Syabrubesi 08:50 ·
// Betrawati 09:20 · Galchhi 10:28 · Malekhu 11:26 · Devghat 13:00.

export const FRONT_ANCHORS: ReadonlyArray<readonly [km: number, minutes: number]> = [
  [-8, 8 * 60 + 37],
  [-3, 8 * 60 + 40],
  [0, 8 * 60 + 40],
  [4, 8 * 60 + 45],
  [16, 8 * 60 + 50],
  [40, 9 * 60 + 20],
  [60, 10 * 60 + 28],
  [68, 11 * 60 + 26],
  [100, 13 * 60],
];

/** Minutes of day at which the recorded front passed `km` (linear between anchors, clamped at the ends). */
export function minutesForKm(km: number): number {
  const a = FRONT_ANCHORS;
  if (km <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) {
    if (km <= a[i][0]) {
      const [k0, m0] = a[i - 1];
      const [k1, m1] = a[i];
      return m0 + ((km - k0) / (k1 - k0)) * (m1 - m0);
    }
  }
  return a[a.length - 1][1];
}

export function clockLabel(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const hh = String(Math.floor(m / 60) % 24).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Clock for the sim's current front position (scene x). Dry → the breach time. */
export function clockForFrontX(frontX: number): string {
  if (!Number.isFinite(frontX)) return clockLabel(FRONT_ANCHORS[0][1]);
  return clockLabel(minutesForKm(xToKm(frontX)));
}
