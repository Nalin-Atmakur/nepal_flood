/**
 * The corridor scene — orchestrator (web/docs/16-corridor-v2-plan.md). Mounts the renderer, builds the modules
 * from one shared context, runs the flood simulation and the run's state machine, and exposes a handle to
 * CorridorScene.tsx. No React, no DOM custom element.
 *
 *   mountCorridor(el, opts)
 *     ctx      = createContext(renderer)          scene/context.ts   (sim, bed, groundAt, flowAt)
 *     terrain  = createTerrain(ctx)               scene/terrain.ts   (look, sky, lights, river, lakes, rock, stain, x-ray)
 *     water    = createWater(ctx, terrain)        scene/water.ts     (level-fill sheet, translucency, spray, waterfall, debris)
 *     markers  = createMarkers(ctx)               scene/markers.ts   (settlement clusters, labels + names toggle)
 *     objects  = createObjects(ctx, onEvent)      scene/objects.ts   (catalogue + piece physics)
 *     camera   = createCamera(ctx, el)            scene/camera.ts    (fit, orbit, pan, ride, shake, impact)
 *     tick: sim step → water/objects/terrain/markers update → camera → render
 */
import * as THREE from "three";
import type { CorridorPlace, RealBridge } from "@/lib/corridor";
import { kmToX, meander } from "@/lib/corridor-terrain";
import { horizontality } from "@/lib/corridor-camera";
import { BREACH, DEFAULT_SCENARIO, SIM_UNITS_PER_MM3, breachVolume, clockForFrontX, type Scenario } from "@/lib/flood-sim";
import type { ObjectKind } from "@/lib/object-catalogue";
import { createCamera } from "./scene/camera";
import { createContext, disposeContext } from "./scene/context";
import { createMarkers } from "./scene/markers";
import { createObjects, defaultPlacement } from "./scene/objects";
import { createTerrain } from "./scene/terrain";
import type { PlacedObject, RunInfo } from "./scene/types";
import { createWater } from "./scene/water";

export { kmToX, meander, terrainH, baseElev, n2 } from "@/lib/corridor-terrain";

export type RunState = "idle" | "running" | "done";
/** Story beats of a run, for the caption: the collapse → the breach → the wave → after. */
export type Phase = "collapse" | "breach" | "wave" | "after";

export type MountOptions = {
  places: CorridorPlace[];
  /** Real bridges (HOT OSM) pre-placed on the path; restored on every replay, never cleared by reset. */
  bridges?: RealBridge[];
  scenario?: Scenario;
  mobile?: boolean;
  reducedMotion?: boolean;
  /** Called on a tap/click: the picked place (or null on empty terrain) and the pointer position relative to `el`. */
  onPick?: (place: CorridorPlace | null, x: number, y: number) => void;
  /** The front has reached a place (first time this run); x/y = marker's screen position relative to `el`. */
  onReached?: (place: CorridorPlace, clock: string, x: number, y: number) => void;
  /** An object was taken by the flow: counters + where it happened on screen + the clock. */
  onSwept?: (kind: ObjectKind, total: number, real: number, x: number, y: number, clock: string) => void;
  /** An object was placed (chip tap or terrain tap): where on screen, so the UI can say "placed in the path". */
  onPlaced?: (kind: ObjectKind, x: number, y: number) => void;
  /** The clock label changed (≈ every 100 ms while running). */
  onClock?: (clock: string) => void;
  onState?: (state: RunState) => void;
  onPhase?: (phase: Phase) => void;
  /** X-ray amount changed (0…1) — the UI shows a chip above 0.35. */
  onXray?: (amount: number) => void;
  /** localised name for an object kind (the placement label) */
  objectLabel?: (kind: ObjectKind) => string;
};

export type CorridorHandle = {
  dispose(): void;
  setPlaces(places: CorridorPlace[]): void;
  /** Start (or restart) the breach. Dropped objects are put back where they stood. */
  play(): void;
  /** Clear water and the visitor's objects. */
  reset(): void;
  setScenario(s: Scenario): void;
  /** Arm a kind: places one in the path immediately; the next terrain tap moves it (Escape / arm(null) disarms). */
  arm(kind: ObjectKind | null): void;
  armed(): ObjectKind | null;
  /** Place an object directly at scene coordinates (tests; the UI goes through `arm`). */
  drop(kind: ObjectKind, x: number, z: number): void;
  /** Frame the whole corridor again. */
  frame(): void;
  /** Place names on/off. */
  setLabels(on: boolean): void;
  labels(): boolean;
  objectCount(): number;
  state(): RunState;
  swept(): { visitor: number; real: number };
  debug(): {
    state: RunState;
    waterVisible: boolean;
    drawCount: number;
    maxDepth: number;
    frontX: number;
    objects: number;
    swept: number;
    injected: number;
    lowQuality: boolean;
    spray: number;
    belowGround: number;
    xray: number;
    labels: boolean;
    /** objects currently carried whole by the flow */
    carried: number;
    /** the last visitor object: state and world position (tests trace the ride) */
    last: { state: PlacedObject["state"]; x: number; y: number; z: number } | null;
    /** deepest water in the plate's east column (the waterfall) */
    edgeDepth: number;
  };
};

const SUBSTEPS = 2;
const REACH_DEPTH = 0.2;
const RUN_SECONDS = 34;
const XRAY_DEFAULT = 0.3;

/**
 * Mount the scene into `el` (which should be `position: relative` and sized by CSS).
 * Throws when WebGL is unavailable so the caller can swap in the static fallback.
 */
export function mountCorridor(el: HTMLElement, opts: MountOptions): CorridorHandle {
  const W = () => Math.max(1, el.clientWidth);
  const H = () => Math.max(1, el.clientHeight);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (err) {
    throw new Error("WebGL renderer unavailable: " + (err instanceof Error ? err.message : String(err)));
  }
  if (!renderer.getContext()) {
    renderer.dispose();
    throw new Error("WebGL context unavailable");
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2));
  renderer.setSize(W(), H());
  const canvas = renderer.domElement;
  // pan-y: a vertical swipe scrolls the page (the panel sits near the top on phones); horizontal drags orbit.
  canvas.style.cssText = "position:absolute;inset:0;touch-action:pan-y;display:block;outline:none";
  el.appendChild(canvas);

  const ctx = createContext(renderer, { low: false, mobile: !!opts.mobile, reducedMotion: !!opts.reducedMotion });
  const { sim } = ctx;
  const terrain = createTerrain(ctx);
  const water = createWater(ctx, terrain);
  const markers = createMarkers(ctx);
  const camera = createCamera(ctx, el);

  let sweptTotal = 0;
  let sweptReal = 0;
  let armedKind: ObjectKind | null = null;
  let places: CorridorPlace[] = opts.places;
  markers.set(places);

  const objects = createObjects(ctx, (e) => {
    if (e.type === "placed" && !e.obj.real) {
      const p = e.obj.group.position;
      const s = camera.screenOf(p.x, p.y + 2, p.z);
      camera.reveal(p.x, p.y, p.z);
      opts.onPlaced?.(e.obj.kind, s.x, s.y);
    }
    if (e.type === "hit") {
      if (e.obj.real) {
        sweptReal++;
        camera.shake(0.7);
      } else {
        sweptTotal++;
        camera.shake(0.45);
        camera.impact(e.x, e.y, e.z);
      }
      const s = camera.screenOf(e.x, e.y + 1, e.z);
      opts.onSwept?.(e.obj.kind, sweptTotal, sweptReal, s.x, s.y, clockForFrontX(sim.frontX()));
    }
  }, opts.objectLabel);
  for (const b of opts.bridges ?? []) objects.place("bridge", kmToX(b.km), meander(kmToX(b.km)), { real: true });

  // ---- the run --------------------------------------------------------------------------------------------
  let scenario: Scenario = opts.scenario ?? DEFAULT_SCENARIO;
  let runState: RunState = "idle";
  let runT = 0;
  let injectedFrac = 0;
  const reached = new Set<string>();
  let lastClock = "";
  let clockTick = 0;
  let phase: Phase = "after";
  let lowQuality = false;
  let xray = 0;
  let labelsOn = true;
  const setState = (s: RunState) => {
    if (runState === s) return;
    runState = s;
    opts.onState?.(s);
  };
  const setPhase = (p: Phase) => {
    if (phase === p) return;
    phase = p;
    opts.onPhase?.(p);
  };
  const runInfo = (): RunInfo => ({ state: runState, runT, frontX: sim.frontX(), injectedFrac });

  const simStep = (dtReal: number, substeps: number) => {
    const total = scenario.lakeMm3 * SIM_UNITS_PER_MM3;
    const sub = dtReal / substeps;
    const before = runT;
    for (let s = 0; s < substeps; s++) {
      const dv = breachVolume(total, scenario.breachSeconds, runT - terrain.rockFallSeconds, sub);
      if (dv > 0) sim.inject(BREACH.x, BREACH.z, BREACH.radius, dv);
      sim.step(sub);
      runT += sub;
    }
    injectedFrac = Math.min(1, sim.injected() / total);
    if (before < terrain.rockFallSeconds && runT >= terrain.rockFallSeconds) camera.shake(1.1); // impact
    // rumble while the lake is still emptying
    if (runState === "running" && injectedFrac < 0.995 && runT > terrain.rockFallSeconds) camera.shake(0.12);
    setPhase(runT < terrain.rockFallSeconds ? "collapse" : injectedFrac < 0.995 ? "breach" : runT < RUN_SECONDS ? "wave" : "after");
    for (const p of places) {
      if (reached.has(p.id)) continue;
      const c = markers.reachCell(p.id);
      if (c < 0) continue;
      if (sim.depth[c] > REACH_DEPTH) {
        reached.add(p.id);
        markers.markReached(p.id);
        if (p.reported <= 0) continue;
        const a = markers.anchor(p.id);
        if (!a) continue;
        const s = camera.screenOf(a.x, a.y, a.z);
        opts.onReached?.(p, clockForFrontX(sim.frontX()), s.x, s.y);
      }
    }
    clockTick += dtReal;
    if (clockTick > 0.1) {
      clockTick = 0;
      const c = clockForFrontX(sim.frontX());
      if (c !== lastClock) {
        lastClock = c;
        opts.onClock?.(c);
      }
    }
    if (runT > RUN_SECONDS) setState("done");
  };

  const play = () => {
    sim.reset();
    terrain.clearStain();
    water.reset();
    runT = 0;
    injectedFrac = 0;
    reached.clear();
    markers.clearReached();
    objects.restore();
    sweptTotal = 0;
    sweptReal = 0;
    lastClock = "";
    opts.onClock?.(clockForFrontX(-Infinity));
    camera.openOnLakes(terrain.lakePos);
    setPhase("collapse");
    setState("running");
  };
  const resetAll = () => {
    sim.reset();
    terrain.clearStain();
    water.reset();
    runT = 0;
    injectedFrac = 0;
    reached.clear();
    markers.clearReached();
    objects.clearVisitor();
    sweptTotal = 0;
    sweptReal = 0;
    lastClock = "";
    water.update(0);
    opts.onClock?.(clockForFrontX(-Infinity));
    setPhase("after");
    setState("idle");
  };

  // ---- picking / placing ----------------------------------------------------------------------------------
  const onTap = (px: number, py: number) => {
    const ray = camera.rayAt(px, py);
    if (armedKind) {
      const hit = ray.intersectObject(terrain.terrain, false)[0];
      if (!hit) return;
      const last = objects.last();
      if (last && last.state === "standing") objects.move(last, hit.point.x, hit.point.z);
      else objects.place(armedKind, hit.point.x, hit.point.z);
      return;
    }
    const hit = ray.intersectObjects(markers.pickables(), false)[0];
    const place = hit ? markers.placeOf(hit.object) : null;
    opts.onPick?.(place, px, py);
  };
  camera.attach(canvas, onTap);

  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H());
    camera.resize();
  });
  ro.observe(el);
  let visible = true;
  const io =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          visible = entries.some((e) => e.isIntersecting);
        }, { threshold: 0.02 })
      : null;
  io?.observe(el);

  // ---- the loop ------------------------------------------------------------------------------------------
  let raf = 0;
  let alive = true;
  let last = performance.now();
  let slowFrames = 0;
  // polar angle from the camera's actual position (for the X-ray amount)
  const currentPol = () => {
    const d = camera.cam.position.clone().sub(camera.target);
    const r = d.length() || 1;
    return Math.acos(Math.max(-1, Math.min(1, d.y / r)));
  };
  const tick = (now: number) => {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    ctx.frame++;
    ctx.time += dt;
    if (dt > 0.034) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (!lowQuality && slowFrames > 20) {
      lowQuality = true;
      ctx.quality.low = true;
    }
    const active = runState === "running" || (runState === "done" && water.visible());
    if (active) {
      simStep(dt, lowQuality ? 1 : SUBSTEPS);
      if (!lowQuality || ctx.frame % 2 === 0) water.update(dt);
      if (runState === "done" && runT > RUN_SECONDS + 40) water.reset();
      if (runState === "done") setPhase("after");
    }
    objects.update(dt); // pieces settle and placement markers pulse even when idle
    terrain.update(dt, runInfo());
    camera.update(dt, runInfo(), false);
    markers.setRide(false);
    markers.update(dt, camera.cam.position);
    // X-ray: on by default (owner likes seeing the flood through the mountain), stronger when tilted to the side
    const hx = Math.max(XRAY_DEFAULT, horizontality(currentPol()));
    if (Math.abs(hx - xray) > 0.01) {
      xray = hx;
      terrain.setXray(hx);
      water.setXray(hx);
      opts.onXray?.(hx);
    }
    renderer.render(ctx.scene, camera.cam);
  };
  raf = requestAnimationFrame(tick);

  return {
    setPlaces(list) {
      if (!alive) return;
      places = list;
      markers.set(list);
    },
    play,
    reset: resetAll,
    setScenario(s) {
      scenario = s;
    },
    arm(kind) {
      armedKind = kind;
      canvas.style.cursor = kind ? "crosshair" : "";
      if (kind) {
        const p = defaultPlacement(sim.frontX(), runState === "running");
        objects.place(kind, p.x, p.z);
      }
    },
    armed: () => armedKind,
    drop(kind, x, z) {
      objects.place(kind, x, z);
    },
    frame() {
      camera.fit(true);
    },
    setLabels(on) {
      labelsOn = on;
      markers.setLabels(on);
    },
    labels: () => labelsOn,
    objectCount: () => objects.list().length,
    state: () => runState,
    swept: () => ({ visitor: sweptTotal, real: sweptReal }),
    debug() {
      let maxDepth = 0;
      for (let i = 0; i < sim.depth.length; i++) if (sim.depth[i] > maxDepth) maxDepth = sim.depth[i];
      // the invariant the owner asked for: nothing below the ground (standing objects and carried ones — a carried
      // object hangs halfH below its body, whose centre the physics keeps ≥ ground + halfH)
      let below = 0;
      const wp = new THREE.Vector3();
      for (const o of objects.list() as PlacedObject[]) {
        if (o.state === "broken" || o.state === "wreck") continue;
        o.group.getWorldPosition(wp);
        const g = ctx.groundAt(wp.x, wp.z);
        if (g && wp.y < g.y - 0.05) below++;
      }
      return {
        state: runState,
        waterVisible: water.visible(),
        drawCount: water.drawCount(),
        maxDepth,
        frontX: sim.frontX(),
        objects: objects.list().length,
        swept: sweptTotal,
        injected: sim.injected(),
        lowQuality,
        spray: water.sprayCount(),
        belowGround: below,
        xray,
        labels: labelsOn,
        carried: objects.list().filter((o) => o.state === "taken").length,
        last: (() => {
          const o = objects.last();
          if (!o) return null;
          if (o.state === "broken" || o.state === "wreck") {
            // the mean of the visible pieces (they are re-parented to the scene when the object breaks)
            let n = 0;
            const m = new THREE.Vector3();
            for (const c of ctx.scene.children) {
              if (c.userData.pieceOf !== o.id || !c.visible) continue;
              m.add(c.position);
              n++;
            }
            if (n) m.divideScalar(n);
            return { state: o.state, x: m.x, y: m.y, z: m.z };
          }
          o.group.getWorldPosition(wp);
          return { state: o.state, x: wp.x, y: wp.y, z: wp.z };
        })(),
        edgeDepth: (() => {
          let m = 0;
          for (let k = 0; k < ctx.grid.nz; k++) for (let i = ctx.grid.nx - 3; i < ctx.grid.nx; i++) m = Math.max(m, sim.depth[k * ctx.grid.nx + i]);
          return m;
        })(),
      };
    },
    dispose() {
      if (!alive) return;
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      camera.dispose();
      objects.dispose();
      markers.dispose();
      water.dispose();
      terrain.dispose();
      disposeContext(ctx);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
