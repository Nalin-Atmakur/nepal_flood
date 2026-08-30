import * as THREE from "three";
import { FOV_DEG, POL_MAX, POL_MIN, RAD_MAX, RAD_MIN, clampOrbit, fitCamera, horizontality, orbitPosition, panTarget, zoomToward, type Orbit } from "@/lib/corridor-camera";
import { bedH, meander } from "@/lib/corridor-terrain";
import type { CameraModule, CameraMode, RunInfo, SceneCtx } from "./types";

/**
 * The camera (web/docs/16-corridor-v2-plan.md §1.2): an orbit (target · radius · polar · azimuth) with
 *   - fit: frame the whole corridor for the panel's aspect (exact, from lib/corridor-camera),
 *   - orbit: one-finger / left-drag; pan: right-drag, shift-drag, two fingers, arrow keys; wheel / pinch zooms
 *     toward the point under the cursor / between the fingers (lib/corridor-camera `zoomToward`),
 *   - ride: while a run is on and the visitor hasn't taken over, chase the front down the channel from above,
 *   - a floor: never below the water surface or the ground near the camera,
 *   - shake (impact, bridges), impact cam (desktop punch-in), reveal (nudge to keep a placed object in frame),
 *   - a slow drift when idle, and `horizontality()` for the terrain X-ray.
 */
export function createCamera(ctx: SceneCtx, el: HTMLElement): CameraModule {
  const W = () => Math.max(1, el.clientWidth);
  const H = () => Math.max(1, el.clientHeight);
  const cam = new THREE.PerspectiveCamera(FOV_DEG, W() / H(), 0.5, 900);

  // current + goal orbits (goal is eased toward every frame)
  const cur: Orbit = fitCamera(W() / H());
  const goal: Orbit = { target: { ...cur.target }, rad: cur.rad, pol: cur.pol, az: cur.az };
  const target = new THREE.Vector3(cur.target.x, cur.target.y, cur.target.z);
  let mode: CameraMode = "overview";
  let userTook = false;
  let drift = false; // the overview holds still: a first-time viewer must not be moved around
  let shakeAmt = 0;
  let ease = 0.35; // goal-chasing rate (higher = snappier)
  let impact: { x: number; y: number; z: number; t: number } | null = null;
  const RIDE = { rad: 40, pol: 0.42, az: -1.5 };
  /** Owner's call (30 Aug 10:30): the whole scene stays in view — no chase camera. Kept for a future "cinematic" toggle. */
  const RIDE_ENABLED = false;

  const setGoal = (o: Partial<Orbit>) => {
    if (o.target) goal.target = { ...o.target };
    if (o.rad !== undefined) goal.rad = o.rad;
    if (o.pol !== undefined) goal.pol = o.pol;
    if (o.az !== undefined) goal.az = o.az;
  };

  function fit(animate = true): void {
    const o = fitCamera(W() / H());
    userTook = false;
    mode = "overview";
    drift = true;
    if (animate) {
      setGoal(o);
      ease = 0.35;
    } else {
      Object.assign(cur, { target: { ...o.target }, rad: o.rad, pol: o.pol, az: o.az });
      setGoal(o);
    }
  }

  function apply(): void {
    const p = orbitPosition(cur);
    let cx = p.x;
    let cy = p.y;
    let cz = p.z;
    // floor: above ground and water near the camera
    const g = ctx.groundAt(cx, cz);
    if (g) {
      const f = ctx.flowAt(cx, cz);
      const floor = g.y + f.depth * ctx.visAmp + 5;
      if (cy < floor) cy = floor;
    }
    if (impact) {
      // punch 40 % of the way toward the impact point and back over 0.7 s
      const k = Math.sin(Math.min(1, impact.t / 0.7) * Math.PI) * 0.4;
      cx += (impact.x - cx) * k;
      cy += (impact.y + 6 - cy) * k;
      cz += (impact.z - cz) * k;
    }
    if (shakeAmt > 0) {
      cx += (Math.random() - 0.5) * shakeAmt;
      cy += (Math.random() - 0.5) * shakeAmt;
      cz += (Math.random() - 0.5) * shakeAmt;
    }
    cam.position.set(cx, cy, cz);
    target.set(cur.target.x, cur.target.y, cur.target.z);
    cam.lookAt(impact ? new THREE.Vector3(cur.target.x + (impact.x - cur.target.x) * 0.5, cur.target.y, cur.target.z + (impact.z - cur.target.z) * 0.5) : target);
  }

  function update(dt: number, run: RunInfo, allowRide: boolean): void {
    const k = 1 - Math.pow(1 - ease, dt * 8);
    if (RIDE_ENABLED && !userTook && allowRide && run.state === "running" && Number.isFinite(run.frontX)) {
      mode = "ride";
      const tx = Math.min(run.frontX + 3, 40);
      const tz = meander(tx);
      setGoal({ target: { x: tx, y: bedH(tx, tz) + 1, z: tz }, rad: RIDE.rad, pol: RIDE.pol, az: RIDE.az });
      ease = 0.3;
    } else if (!userTook && mode === "ride" && run.state !== "running") {
      // the run ended: ease back to the fitted overview
      fit(true);
    }
    cur.target.x += (goal.target.x - cur.target.x) * k;
    cur.target.y += (goal.target.y - cur.target.y) * k;
    cur.target.z += (goal.target.z - cur.target.z) * k;
    cur.rad += (goal.rad - cur.rad) * k;
    cur.pol += (goal.pol - cur.pol) * k;
    cur.az += (goal.az - cur.az) * k;
    if (drift && mode === "overview") goal.az += 0.0007 * dt * 60;
    if (shakeAmt > 0) shakeAmt = Math.max(0, shakeAmt - dt * 2.2);
    if (impact) {
      impact.t += dt;
      if (impact.t > 0.7) impact = null;
    }
    cam.aspect = W() / H();
    apply();
  }

  // ---- input ----------------------------------------------------------------------------------------------
  type Pointer = { id: number; x: number; y: number };
  const pointers = new Map<number, Pointer>();
  let gesture: { kind: "orbit" | "pan" | "pinch"; x: number; y: number; az: number; pol: number; dist: number; rad: number; moved: boolean; target: Orbit["target"] } | null = null;
  let onTapCb: ((px: number, py: number) => void) | null = null;
  let canvasEl: HTMLCanvasElement | null = null;

  /** where a screen point meets the plane of the target's height (the ground the visitor is looking at) */
  const pickRay = new THREE.Raycaster();
  const pickNdc = new THREE.Vector2();
  const pickPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pickOut = new THREE.Vector3();
  const pointUnder = (clientX: number, clientY: number): { x: number; z: number } | null => {
    if (!canvasEl) return null;
    const r = canvasEl.getBoundingClientRect();
    pickNdc.set(((clientX - r.left) / Math.max(1, r.width)) * 2 - 1, -((clientY - r.top) / Math.max(1, r.height)) * 2 + 1);
    pickRay.setFromCamera(pickNdc, cam);
    pickPlane.constant = -goal.target.y;
    const hit = pickRay.ray.intersectPlane(pickPlane, pickOut);
    return hit ? { x: hit.x, z: hit.z } : null;
  };

  const takeOver = () => {
    userTook = true;
    drift = false;
    mode = "user";
    ease = 0.6;
  };

  const onPointerDown = (e: PointerEvent) => {
    pointers.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });
    try {
      canvasEl?.setPointerCapture(e.pointerId);
    } catch {
      /* best effort */
    }
    if (pointers.size === 1) {
      const pan = e.button === 2 || e.shiftKey;
      gesture = { kind: pan ? "pan" : "orbit", x: e.clientX, y: e.clientY, az: goal.az, pol: goal.pol, dist: 0, rad: goal.rad, moved: false, target: { ...goal.target } };
    } else if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      gesture = { kind: "pinch", x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, az: goal.az, pol: goal.pol, dist: Math.hypot(a.x - b.x, a.y - b.y), rad: goal.rad, moved: true, target: { ...goal.target } };
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p || !gesture) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (gesture.kind === "pinch" && pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      takeOver();
      // zoom toward the pinch midpoint, then pan by how far the midpoint moved
      const factor = gesture.dist / Math.max(1, dist);
      const under = pointUnder(mx, my);
      const zoomed = under ? zoomToward({ ...goal, target: gesture.target, rad: gesture.rad }, under, factor) : { ...goal, target: gesture.target, rad: Math.max(RAD_MIN, Math.min(RAD_MAX, gesture.rad * factor)) };
      const panned = panTarget(zoomed, mx - gesture.x, my - gesture.y, H());
      setGoal({ rad: zoomed.rad, target: panned.target });
      return;
    }
    const dx = e.clientX - gesture.x;
    const dy = e.clientY - gesture.y;
    if (!gesture.moved && Math.abs(dx) + Math.abs(dy) > 4) gesture.moved = true;
    if (!gesture.moved) return;
    takeOver();
    if (gesture.kind === "orbit") {
      const o = clampOrbit({ ...goal, az: gesture.az - dx * 0.005, pol: gesture.pol - dy * 0.005 });
      setGoal({ az: o.az, pol: o.pol });
    } else {
      const panned = panTarget({ ...goal, target: gesture.target }, dx, dy, H());
      setGoal({ target: panned.target });
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    const wasTap = gesture && !gesture.moved && pointers.size === 1 && gesture.kind !== "pinch";
    pointers.delete(e.pointerId);
    if (wasTap && canvasEl && onTapCb) {
      const r = canvasEl.getBoundingClientRect();
      onTapCb(e.clientX - r.left, e.clientY - r.top);
    }
    if (pointers.size === 0) gesture = null;
    else if (pointers.size === 1) {
      const p = Array.from(pointers.values())[0];
      gesture = { kind: "orbit", x: p.x, y: p.y, az: goal.az, pol: goal.pol, dist: 0, rad: goal.rad, moved: true, target: { ...goal.target } };
    }
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    takeOver();
    const factor = 1 + e.deltaY * 0.0012;
    const under = pointUnder(e.clientX, e.clientY);
    if (under) {
      const z = zoomToward(goal, under, factor);
      setGoal({ rad: z.rad, target: z.target });
    } else setGoal({ rad: Math.max(RAD_MIN, Math.min(RAD_MAX, goal.rad * factor)) });
  };
  const onKey = (e: KeyboardEvent) => {
    const stepPx = 60;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -stepPx;
    else if (e.key === "ArrowRight") dx = stepPx;
    else if (e.key === "ArrowUp") dy = -stepPx;
    else if (e.key === "ArrowDown") dy = stepPx;
    else if (e.key === "+" || e.key === "=") return setGoal({ rad: Math.max(RAD_MIN, goal.rad * 0.85) });
    else if (e.key === "-") return setGoal({ rad: Math.min(RAD_MAX, goal.rad * 1.15) });
    else return;
    e.preventDefault();
    takeOver();
    setGoal({ target: panTarget(goal, dx, dy, H()).target });
  };
  const onContext = (e: Event) => e.preventDefault();

  const ray = new THREE.Raycaster();
  const v2 = new THREE.Vector2();
  const v3 = new THREE.Vector3();

  return {
    cam,
    target,
    mode: () => mode,
    fit,
    openOnLakes(lake) {
      if (!RIDE_ENABLED || userTook) return;
      mode = "ride";
      drift = false;
      Object.assign(cur, { target: { x: lake.x + 3, y: lake.y, z: lake.z }, rad: 26, pol: 0.8, az: -1.5 });
      setGoal(cur);
    },
    update,
    shake(a) {
      if (ctx.quality.reducedMotion) return;
      shakeAmt = Math.max(shakeAmt, a);
    },
    impact(x, y, z) {
      if (ctx.quality.mobile || ctx.quality.reducedMotion || mode === "user") return;
      impact = { x, y, z, t: 0 };
    },
    reveal(x, y, z) {
      // keep the point roughly in frame: move the goal target a third of the way toward it
      if (mode === "ride") return;
      setGoal({ target: { x: goal.target.x + (x - goal.target.x) * 0.35, y: goal.target.y, z: goal.target.z + (z - goal.target.z) * 0.35 } });
      void y;
    },
    screenOf(x, y, z) {
      v3.set(x, y, z).project(cam);
      return { x: ((v3.x + 1) / 2) * W(), y: ((1 - v3.y) / 2) * H() };
    },
    rayAt(px, py) {
      v2.set((px / W()) * 2 - 1, -(py / H()) * 2 + 1);
      ray.setFromCamera(v2, cam);
      return ray;
    },
    attach(canvas, onTap) {
      canvasEl = canvas;
      onTapCb = onTap;
      canvas.tabIndex = 0;
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      canvas.addEventListener("keydown", onKey);
      canvas.addEventListener("contextmenu", onContext);
    },
    resize() {
      cam.aspect = W() / H();
      cam.updateProjectionMatrix();
      if (!userTook && mode === "overview") fit(false);
    },
    dispose() {
      if (canvasEl) {
        canvasEl.removeEventListener("pointerdown", onPointerDown);
        canvasEl.removeEventListener("pointermove", onPointerMove);
        canvasEl.removeEventListener("pointerup", onPointerUp);
        canvasEl.removeEventListener("pointercancel", onPointerUp);
        canvasEl.removeEventListener("wheel", onWheel);
        canvasEl.removeEventListener("keydown", onKey);
        canvasEl.removeEventListener("contextmenu", onContext);
      }
    },
  };
}

export { horizontality, POL_MIN, POL_MAX };
