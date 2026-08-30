/**
 * Pure camera maths for the corridor (web/docs/16-corridor-v2-plan.md §1.2): frame the whole corridor for a given
 * aspect, portrait or landscape, and convert between orbit parameters and positions. No three.js here so it is
 * unit-tested.
 */
import { SCENE_D, SCENE_W, kmToX, meander, bedH } from "./corridor-terrain";

export type Orbit = { target: { x: number; y: number; z: number }; rad: number; pol: number; az: number };

export const FOV_DEG = 42;
export const RAD_MIN = 16;
export const RAD_MAX = 260;
export const POL_MIN = 0.25; // near top-down
export const POL_MAX = 1.42; // near horizontal

/** The corridor's box: the channel's extent (km −12 … 112, meander ± 11) × its height range — not the whole plane,
 *  so the fit is tight around what matters. */
export function corridorBounds(): { minX: number; maxX: number; minZ: number; maxZ: number; minY: number; maxY: number } {
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let km = -12; km <= 112; km += 2) {
    const x = kmToX(km);
    const z = meander(x);
    const y = bedH(x, z);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return {
    minX: Math.max(-SCENE_W / 2, kmToX(-12)),
    maxX: Math.min(SCENE_W / 2, kmToX(112)),
    minZ: Math.max(-SCENE_D / 2, minZ - 8),
    maxZ: Math.min(SCENE_D / 2, maxZ + 8),
    minY,
    maxY: maxY + 5,
  };
}

/** Orbit position from parameters (target + spherical offset). */
export function orbitPosition(o: Orbit): { x: number; y: number; z: number } {
  return {
    x: o.target.x + o.rad * Math.sin(o.pol) * Math.sin(o.az),
    y: o.target.y + o.rad * Math.cos(o.pol),
    z: o.target.z + o.rad * Math.sin(o.pol) * Math.cos(o.az),
  };
}

/** Camera basis for an orbit (forward / right / up unit vectors), for projecting points. */
function basis(o: Orbit): { cam: { x: number; y: number; z: number }; f: Vec; r: Vec; u: Vec } {
  const cam = orbitPosition(o);
  const f = norm({ x: o.target.x - cam.x, y: o.target.y - cam.y, z: o.target.z - cam.z });
  const r = norm(cross(f, { x: 0, y: 1, z: 0 }));
  const u = cross(r, f);
  return { cam, f, r, u };
}
type Vec = { x: number; y: number; z: number };
const cross = (a: Vec, b: Vec): Vec => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const norm = (a: Vec): Vec => {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
};

/** True when every corner of the corridor box projects inside the frustum with `margin` to spare. */
export function boxFits(o: Orbit, aspect: number, margin = 0.06): boolean {
  const b = corridorBounds();
  const { cam, f, r, u } = basis(o);
  const tanV = Math.tan(((FOV_DEG * Math.PI) / 180) / 2) * (1 - margin);
  const tanH = tanV * aspect;
  for (const x of [b.minX, b.maxX])
    for (const y of [b.minY, b.maxY])
      for (const z of [b.minZ, b.maxZ]) {
        const d = { x: x - cam.x, y: y - cam.y, z: z - cam.z };
        const depth = d.x * f.x + d.y * f.y + d.z * f.z;
        if (depth <= 1) return false;
        const sx = (d.x * r.x + d.y * r.y + d.z * r.z) / depth;
        const sy = (d.x * u.x + d.y * u.y + d.z * u.z) / depth;
        if (Math.abs(sx) > tanH || Math.abs(sy) > tanV) return false;
      }
  return true;
}

/**
 * Frame the corridor for the panel's aspect. Landscape: the corridor runs left → right (west → east) seen from
 * the south-west and above. Portrait: look along the corridor from the east so it runs top → bottom and fills the
 * tall panel.
 * The radius is found by projection: start close and pull back until every corner of the corridor box is inside
 * the frustum (exact for the pinhole model, so the test and the scene agree).
 */
export function fitCamera(aspect: number, margin = 0.0): Orbit {
  const b = corridorBounds();
  const portrait = aspect < 1;
  const o: Orbit = {
    target: { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2, z: (b.minZ + b.maxZ) / 2 },
    rad: RAD_MIN,
    pol: portrait ? 0.42 : 0.5,
    az: portrait ? -1.5 : -0.75,
  };
  while (o.rad < RAD_MAX && !boxFits(o, aspect, margin)) o.rad *= 1.03;
  o.rad = Math.min(RAD_MAX, o.rad);
  return o;
}

/** Clamp orbit parameters to the allowed ranges. */
export function clampOrbit(o: Orbit): Orbit {
  return { target: o.target, rad: Math.max(RAD_MIN, Math.min(RAD_MAX, o.rad)), pol: Math.max(POL_MIN, Math.min(POL_MAX, o.pol)), az: o.az };
}

/** How "horizontal" the view is, 0 (top-down) … 1 (side view) — drives the terrain X-ray. */
export function horizontality(pol: number): number {
  return Math.max(0, Math.min(1, (pol - 1.02) / (POL_MAX - 1.02)));
}

/** Pan the target across the ground plane by screen deltas (pixels → scene units at the target's distance). */
export function panTarget(o: Orbit, dxPx: number, dyPx: number, viewportH: number): Orbit {
  const worldPerPx = (2 * o.rad * Math.tan(((FOV_DEG * Math.PI) / 180) / 2)) / viewportH;
  // camera-right and camera-forward (on the ground) from the azimuth
  const rx = Math.cos(o.az);
  const rz = -Math.sin(o.az);
  const fx = -Math.sin(o.az);
  const fz = -Math.cos(o.az);
  const b = corridorBounds();
  const x = o.target.x - (dxPx * rx - dyPx * fx) * worldPerPx;
  const z = o.target.z - (dxPx * rz - dyPx * fz) * worldPerPx;
  return {
    ...o,
    target: { x: Math.max(b.minX, Math.min(b.maxX, x)), y: o.target.y, z: Math.max(b.minZ, Math.min(b.maxZ, z)) },
  };
}

/**
 * Zoom toward a point on the ground (the one under the cursor or the pinch midpoint): the radius scales by
 * `factor` and the target slides toward the point by the same factor, so the point stays put on screen and the
 * visitor zooms into *that* part of the corridor rather than the centre. Clamped like a pan.
 */
export function zoomToward(o: Orbit, point: { x: number; z: number }, factor: number): Orbit {
  const rad = Math.max(RAD_MIN, Math.min(RAD_MAX, o.rad * factor));
  const f = rad / o.rad; // the factor actually applied after clamping
  const b = corridorBounds();
  const x = point.x + (o.target.x - point.x) * f;
  const z = point.z + (o.target.z - point.z) * f;
  return { ...o, rad, target: { x: Math.max(b.minX, Math.min(b.maxX, x)), y: o.target.y, z: Math.max(b.minZ, Math.min(b.maxZ, z)) } };
}
