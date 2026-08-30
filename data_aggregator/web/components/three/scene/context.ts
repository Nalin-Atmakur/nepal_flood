import * as THREE from "three";
import { GRID, createSim, sampleBed, type Grid } from "@/lib/flood-sim";
import type { Flow, Ground, SceneCtx } from "./types";

/** Visual exaggeration of water depth (the terrain is already ×1.5); the sim itself is untouched. */
export const VIS_AMP = 4.2;

/**
 * Bilinear ground height and normal from the bed grid — the one truth every module uses so nothing ever sits
 * inside the terrain: meshes, objects, pieces, the camera floor and placement all sample this.
 */
export function makeGroundSampler(grid: Grid, bed: Float32Array): (x: number, z: number) => Ground | null {
  const { nx, nz, cell, x0, z0 } = grid;
  return (x, z) => {
    const fx = (x - x0) / cell - 0.5;
    const fz = (z - z0) / cell - 0.5;
    const i = Math.floor(fx);
    const k = Math.floor(fz);
    if (i < 0 || k < 0 || i >= nx - 1 || k >= nz - 1) return null;
    const tx = fx - i;
    const tz = fz - k;
    const h00 = bed[k * nx + i];
    const h10 = bed[k * nx + i + 1];
    const h01 = bed[(k + 1) * nx + i];
    const h11 = bed[(k + 1) * nx + i + 1];
    const y = (h00 * (1 - tx) + h10 * tx) * (1 - tz) + (h01 * (1 - tx) + h11 * tx) * tz;
    // normal from the two gradients (scene units)
    const dhdx = ((h10 - h00) * (1 - tz) + (h11 - h01) * tz) / cell;
    const dhdz = ((h01 - h00) * (1 - tx) + (h11 - h10) * tx) / cell;
    const len = Math.hypot(dhdx, 1, dhdz);
    return { y, nx: -dhdx / len, ny: 1 / len, nz: -dhdz / len };
  };
}

export function createContext(renderer: THREE.WebGLRenderer, quality: SceneCtx["quality"]): SceneCtx {
  const scene = new THREE.Scene();
  const grid = GRID;
  const bed = sampleBed(grid);
  const sim = createSim(grid, bed);
  const groundAt = makeGroundSampler(grid, bed);
  const disposables: { dispose(): void }[] = [];
  const flowAt = (x: number, z: number): Flow => {
    const i = Math.floor((x - grid.x0) / grid.cell);
    const k = Math.floor((z - grid.z0) / grid.cell);
    if (i < 0 || k < 0 || i >= grid.nx || k >= grid.nz) return { depth: 0, vx: 0, vz: 0, speed: 0, surface: 0 };
    const c = k * grid.nx + i;
    const depth = sim.depth[c];
    const vx = sim.vx[c];
    const vz = sim.vz[c];
    return { depth, vx, vz, speed: Math.hypot(vx, vz), surface: bed[c] + depth * VIS_AMP };
  };
  const ctx: SceneCtx = {
    scene,
    renderer,
    sim,
    grid,
    bed,
    visAmp: VIS_AMP,
    quality,
    frame: 0,
    time: 0,
    groundAt,
    surfaceAt: (x, z) => {
      const g = groundAt(x, z);
      const f = flowAt(x, z);
      return (g?.y ?? 0) + f.depth * VIS_AMP;
    },
    flowAt,
    own: (d) => {
      disposables.push(d);
      return d;
    },
  };
  (ctx as SceneCtx & { disposeAll(): void }).disposeAll = () => {
    for (const d of disposables.splice(0)) d.dispose();
  };
  return ctx;
}

export function disposeContext(ctx: SceneCtx): void {
  (ctx as SceneCtx & { disposeAll?: () => void }).disposeAll?.();
  ctx.scene.clear();
}
