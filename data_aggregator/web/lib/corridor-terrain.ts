/**
 * Terrain maths for the corridor scene — pure functions shared by the three.js scene (components/three/scene/*),
 * the flood simulation (lib/flood-sim.ts), the fallback PNG script and the tests.
 *
 * v2 landscape (30 Aug, "it must read as a Himalayan gorge at first glance"): a true V-shaped gorge with a flat
 * river floor in the north (Rasuwa), walls that drop and part as the valley opens through Nuwakot and Dhading, and
 * a wide plain at Chitwan; long-wavelength ridges and side valleys instead of high-frequency corrugation; a
 * landslide dam upstream of the barrier lakes. Heights are ×1.5 exaggerated like the design's original.
 *
 *   kmToX     km along the corridor → scene x (−10…74 at the design's scale, compressed beyond)
 *   meander   scene x → channel centre z
 *   terrainH  the landscape (walls, ridges, side valleys, plain)
 *   bedH      terrainH with the riverbed carved and the landslide dam added — what the scene renders and the
 *             water flows over
 */

/** Scene extent: the terrain plane is 96 × 52 units centred on the origin. */
export const SCENE_W = 96;
export const SCENE_D = 52;
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

/** 0 in the far north … 1 on the plain: how far down the corridor a point is. */
const along = (x: number): number => Math.max(0, Math.min(1, (x + 42) / 84));
const smooth = (t: number): number => t * t * (3 - 2 * t);

/** Channel floor elevation: high north, falling fast through the gorge, flattening on the plain (×1.5). */
export const baseElev = (x: number): number => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35);

/** Half-width of the flat river floor: a slot in the gorge, a broad bed on the plain. */
export const floorHalfWidth = (x: number): number => 1.0 + 6.0 * smooth(along(x));
/** Height of the valley walls above the floor: towering in the north, low hills in the south. */
export const wallHeight = (x: number): number => 34 - 26 * smooth(along(x));
/** Horizontal distance over which the wall climbs (steeper = smaller). */
export const wallRun = (x: number): number => 6 + 14 * smooth(along(x));

/** Low-frequency ridge relief (two octaves) — long spurs, not corrugation. */
export const ridges = (x: number, z: number): number =>
  Math.sin(x * 0.11 + z * 0.07) * Math.cos(z * 0.13 - x * 0.05) * 3.2 + Math.sin(x * 0.23 + 1.7) * Math.sin(z * 0.19 + 0.4) * 1.6;
/** Side valleys cutting into the walls every ~14 units, only on the walls (not the floor). */
export const sideValleys = (x: number, z: number): number => {
  const g = Math.max(0, Math.cos(x * 0.45 + z * 0.08));
  return -Math.pow(g, 6) * 4.5;
};
/** Legacy name kept for the fallback script: fine surface noise. */
export const n2 = (x: number, z: number): number => Math.sin(x * 0.9 + z * 1.3) * Math.cos(z * 0.7 - x * 0.4) * 0.45;

/** The landscape. */
export const terrainH = (x: number, z: number): number => {
  const d = Math.abs(z - meander(x));
  const floor = baseElev(x);
  const half = floorHalfWidth(x);
  const run = wallRun(x);
  // 0 on the floor, 1 at the top of the wall, with a rounded shoulder
  const t = Math.max(0, Math.min(1, (d - half) / run));
  const wall = smooth(t) * wallHeight(x);
  const relief = (ridges(x, z) + sideValleys(x, z)) * t + n2(x, z) * (0.3 + 0.7 * t);
  // beyond the wall top the plateau keeps rising gently (the peaks)
  const peaks = d > half + run ? (d - half - run) * 0.35 * (1 - along(x)) : 0;
  return floor + wall + relief + peaks;
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

/** The riverbed: a shallow channel in the floor's centre so the water follows the meander. */
export const bedH = (x: number, z: number): number => {
  const dz = z - meander(x);
  const carve = 1.2 * Math.exp(-(dz * dz) / 4.0);
  return terrainH(x, z) - carve + damH(x);
};
