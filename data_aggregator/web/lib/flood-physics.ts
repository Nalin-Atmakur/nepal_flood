/**
 * Piece physics for things the flood breaks (web/docs/16-corridor-v2-plan.md §3.3). Pure, allocation-free per
 * step, unit-tested. A "piece" is a rigid body approximated by a sphere of radius r: gravity, drag toward the
 * flow, buoyancy toward the water surface, spin from the flow's shear, and a ground contact that can never be
 * tunnelled — the position is clamped to ground + r and the velocity is reflected against the ground normal.
 *
 *   per step (dt ≤ 1/60):
 *     flow u at p (capped) · surface s = ground + depth·visAmp · inWater = p.y < s
 *     a = g + inWater ? drag·(u − v) + buoy·clamp(s − p.y, 0, 2r)·up : 0
 *     v += a·dt; p += v·dt
 *     if p.y < ground + r:  p.y = ground + r; v ← reflect(v, n)·restitution; v ∥ ground *= (1 − friction)
 *     ω += shear·k·dt − ω·damp·dt
 *     asleep when |v| < SLEEP and not in water for SLEEP_SECONDS  → wreckage
 */
export type Vec3 = { x: number; y: number; z: number };
export type Ground = { y: number; nx: number; ny: number; nz: number };
export type Flow = { depth: number; vx: number; vz: number; speed: number; surface: number };

export type Body = {
  p: Vec3;
  v: Vec3;
  /** angular velocity (rad/s) about x, y, z */
  w: Vec3;
  /** accumulated rotation (rad) — the scene applies it as Euler */
  rot: Vec3;
  r: number;
  /** mass factor: lighter bodies follow the flow faster */
  m: number;
  asleep: boolean;
  still: number; // seconds nearly at rest
};

export type World = {
  groundAt(x: number, z: number): Ground | null;
  flowAt(x: number, z: number): Flow;
  visAmp: number;
};

export const G = -22; // scene units/s² (the terrain is 1.5× exaggerated; this reads right)
export const DRAG = 3.2; // 1/s toward the flow velocity
export const BUOY = 26; // upward acceleration per unit of submersion
export const FLOW_CAP = 7; // units/s — the sim's peaks are 20–30, far too fast to read
export const RESTITUTION = 0.28;
export const FRICTION = 0.45;
export const SPIN_DAMP = 1.6;
export const SLEEP_SPEED = 0.08;
export const SLEEP_SECONDS = 0.6;
export const MAX_SPEED = 14;

export function makeBody(p: Vec3, r: number, m = 1): Body {
  return { p: { ...p }, v: { x: 0, y: 0, z: 0 }, w: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, r, m, asleep: false, still: 0 };
}

/** Kick a body when its object breaks: the flow's push plus a random-ish scatter (deterministic given `seed`). */
export function kick(b: Body, flow: Flow, seed: number, strength = 1): void {
  const s = Math.min(flow.speed, FLOW_CAP) * strength;
  const a = seed * 6.28318;
  b.v.x += (flow.vx / (flow.speed || 1)) * s * 0.8 + Math.cos(a) * 1.5 * strength;
  b.v.z += (flow.vz / (flow.speed || 1)) * s * 0.8 + Math.sin(a) * 1.5 * strength;
  b.v.y += 3 + ((seed * 7) % 1) * 4 * strength;
  b.w.x += (((seed * 13) % 1) - 0.5) * 8;
  b.w.y += (((seed * 17) % 1) - 0.5) * 8;
  b.w.z += (((seed * 19) % 1) - 0.5) * 8;
  b.asleep = false;
  b.still = 0;
}

/** One integration step. Returns true when the body touched the ground this step (for splashes/sounds). */
export function step(b: Body, world: World, dt: number): boolean {
  if (b.asleep) {
    // wake if water arrives
    const f = world.flowAt(b.p.x, b.p.z);
    if (f.depth > 0.15 && f.speed > 0.5) b.asleep = false;
    else return false;
  }
  const f = world.flowAt(b.p.x, b.p.z);
  const inWater = f.depth > 0.05 && b.p.y < f.surface + b.r;
  // accelerations
  let ax = 0;
  let ay = G;
  let az = 0;
  if (inWater) {
    const ux = Math.max(-FLOW_CAP, Math.min(FLOW_CAP, f.vx * 0.35));
    const uz = Math.max(-FLOW_CAP, Math.min(FLOW_CAP, f.vz * 0.35));
    ax += DRAG * b.m * (ux - b.v.x);
    az += DRAG * b.m * (uz - b.v.z);
    const sub = Math.max(0, Math.min(2 * b.r, f.surface - b.p.y + b.r));
    ay += BUOY * sub * (0.6 + 0.4 * b.m) - 2.0 * b.v.y; // buoyancy + vertical damping in water
    // shear: the flow spins things about the axis perpendicular to it
    b.w.z += (ux * 0.9) * dt;
    b.w.x -= (uz * 0.9) * dt;
  }
  b.v.x += ax * dt;
  b.v.y += ay * dt;
  b.v.z += az * dt;
  // cap
  const sp = Math.hypot(b.v.x, b.v.y, b.v.z);
  if (sp > MAX_SPEED) {
    const k = MAX_SPEED / sp;
    b.v.x *= k;
    b.v.y *= k;
    b.v.z *= k;
  }
  b.p.x += b.v.x * dt;
  b.p.y += b.v.y * dt;
  b.p.z += b.v.z * dt;

  // ground contact — the invariant: p.y ≥ ground + r, always
  let touched = false;
  const g = world.groundAt(b.p.x, b.p.z);
  if (g) {
    const floor = g.y + b.r;
    if (b.p.y < floor + 1e-4) {
      b.p.y = floor;
      const vn = b.v.x * g.nx + b.v.y * g.ny + b.v.z * g.nz;
      if (vn < -0.6) {
        // a real impact: reflect the normal component
        b.v.x -= (1 + RESTITUTION) * vn * g.nx;
        b.v.y -= (1 + RESTITUTION) * vn * g.ny;
        b.v.z -= (1 + RESTITUTION) * vn * g.nz;
        touched = true;
      } else if (vn < 0) {
        // resting contact: remove the inward component
        b.v.x -= vn * g.nx;
        b.v.y -= vn * g.ny;
        b.v.z -= vn * g.nz;
      }
      // gravity along the slope (tangential component of G·up)
      const gt = -G * g.ny; // magnitude of the tangential pull scales with the slope
      b.v.x += gt * g.nx * dt;
      b.v.z += gt * g.nz * dt;
      // kinetic friction on the ground every contact frame
      const kf = Math.max(0, 1 - FRICTION * 10 * dt);
      b.v.x *= kf;
      b.v.z *= kf;
      // static friction: on gentle ground a slow body simply stops (no creeping)
      const slope = 1 - g.ny;
      if (!inWater && slope < 0.18 && Math.hypot(b.v.x, b.v.z) < 0.9) {
        b.v.x = 0;
        b.v.z = 0;
        if (b.v.y < 0) b.v.y = 0;
      }
    }
  } else {
    // off the grid: keep it from falling forever
    b.v.x = 0;
    b.v.z = 0;
    if (b.p.y < -20) b.asleep = true;
  }
  // spin
  const damp = Math.max(0, 1 - SPIN_DAMP * dt);
  b.w.x *= damp;
  b.w.y *= damp;
  b.w.z *= damp;
  b.rot.x += b.w.x * dt;
  b.rot.y += b.w.y * dt;
  b.rot.z += b.w.z * dt;
  // sleep
  if (!inWater && Math.hypot(b.v.x, b.v.y, b.v.z) < SLEEP_SPEED) {
    b.still += dt;
    if (b.still > SLEEP_SECONDS) {
      b.asleep = true;
      b.v.x = b.v.y = b.v.z = 0;
      b.w.x = b.w.y = b.w.z = 0;
    }
  } else b.still = 0;
  return touched;
}

/** Ground-truth check used by tests and the debug hook: nothing may be below ground − ε. */
export function belowGround(b: Body, world: World, eps = 1e-3): boolean {
  const g = world.groundAt(b.p.x, b.p.z);
  return !!g && b.p.y < g.y + b.r - eps;
}
