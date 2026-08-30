/**
 * Terrain maths for the corridor scene — pure functions shared by the three.js scene
 * (components/three/corridor-3d.ts), the flood simulation (lib/flood-sim.ts) and the tests.
 * The base shape is the design script's (`design/Design form preferences/corridor-3d.js`); two additions:
 *   - `kmToX` compresses km > 74 so Devghat/Bharatpur stay on the mesh instead of falling off the south edge,
 *   - `bedH` carves a shallow riverbed into the channel so simulated water follows the meander instead of
 *     pooling in the noise.
 * See web/docs/10-3d-corridor.md and web/docs/14-flood-sim.md.
 */

/** Scene extent: the terrain plane is 96 × 52 units centred on the origin. */
export const SCENE_W = 96;
export const SCENE_D = 52;
/** Last km drawn at the design's scale; beyond it the chainage is compressed ×0.15. */
const KM_LINEAR_END = 74;
const KM_SCALE = 0.84;
const KM_TAIL_SCALE = 0.15;

/** River path: x = km along corridor (−10…74 mapped to −42…42, then compressed), z = meander. */
export const kmToX = (km: number): number =>
  km <= KM_LINEAR_END ? (km - 32) * KM_SCALE : (KM_LINEAR_END - 32) * KM_SCALE + (km - KM_LINEAR_END) * KM_TAIL_SCALE;
/** Inverse of `kmToX`. */
export const xToKm = (x: number): number => {
  const xEnd = (KM_LINEAR_END - 32) * KM_SCALE;
  return x <= xEnd ? x / KM_SCALE + 32 : KM_LINEAR_END + (x - xEnd) / KM_TAIL_SCALE;
};
export const meander = (x: number): number => Math.sin(x * 0.16) * 3.2 + Math.sin(x * 0.043 + 1.2) * 5;
/** north high → south low, 1.5x exaggerated */
export const baseElev = (x: number): number => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35);
export const n2 = (x: number, z: number): number =>
  Math.sin(x * 0.35 + z * 0.9) * Math.cos(z * 0.5 - x * 0.21) + 0.6 * Math.sin(x * 0.9 + 2.3) * Math.sin(z * 1.7);
/** The design's terrain height (gorge narrow in the north, opening south). */
export const terrainH = (x: number, z: number): number => {
  const d = Math.abs(z - meander(x));
  const wall = Math.min(1, d / (5 + (x + 42) * 0.1));
  const ridge = Math.pow(wall, 1.6) * (10 + baseElev(x) * 1.5) + n2(x, z) * (0.7 + wall * 1.8);
  return baseElev(x) + ridge - 1.2;
};
/** Barrier lakes upstream (design: km −8 and −6). The breach is injected at the first one. */
export const LAKE_KMS = [-8, -6] as const;
/** The collapse site: a ~600 m rock/ice mass fell into the Lhende Khola just upstream of the lakes (USGS us7000tbwb). */
export const DAM_KM = -9.5;

/** Height added by the landslide dam upstream of the lakes: blocks the pond from flooding "uphill" off the scene. */
export const damH = (x: number): number => {
  const xd = kmToX(DAM_KM);
  return x < xd ? Math.min(9, (xd - x) * 3) : 0;
};

/**
 * Terrain with a shallow riverbed carved along the meander and the landslide dam upstream — what the scene renders
 * and the water flows over.
 */
export const bedH = (x: number, z: number): number => {
  const dz = z - meander(x);
  const carve = 1.4 * Math.exp(-(dz * dz) / 6.0);
  return terrainH(x, z) - carve + damH(x);
};
