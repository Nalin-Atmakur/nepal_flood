/**
 * Stylised low-poly Bhote Koshi / Trishuli corridor with the flood simulation on top.
 * Started as a verbatim port of design/Design form preferences/corridor-3d.js; the terrain, markers, lights,
 * camera and orbit are unchanged. Added (web/docs/14-flood-sim.md): a water mesh driven by lib/flood-sim.ts,
 * the breach at the first barrier lake, objects the visitor drops in the path, "reached" events per place, the
 * clock and a pause when the panel is off-screen.
 *
 * No React, no DOM custom element: CorridorScene.tsx mounts it into a host element after first paint.
 */
import * as THREE from "three";
import type { CorridorPlace, RealBridge } from "@/lib/corridor";
import { LAKE_KMS, SCENE_D, SCENE_W, bedH, kmToX, meander } from "@/lib/corridor-terrain";
import {
  BREACH,
  DEFAULT_SCENARIO,
  GRID,
  MAX_OBJECTS,
  SIM_UNITS_PER_MM3,
  advect,
  breachVolume,
  cellIndex,
  clockForFrontX,
  snapToPath,
  createSim,
  isSwept,
  sampleBed,
  type ObjectKind,
  type Scenario,
  type Sim,
} from "@/lib/flood-sim";

export { kmToX, meander, terrainH, baseElev, n2 } from "@/lib/corridor-terrain";

export type RunState = "idle" | "running" | "done";
/** Story beats of a run, for the caption chip: the collapse → the breach → the wave → after. */
export type Phase = "collapse" | "breach" | "wave" | "after";

export type MountOptions = {
  places: CorridorPlace[];
  /** Real bridges (HOT OSM) pre-placed on the path; restored on every replay, never cleared by reset. */
  bridges?: RealBridge[];
  scenario?: Scenario;
  /** Called on a tap/click: the picked place (or null on empty terrain) and the pointer position relative to `el`. */
  onPick?: (place: CorridorPlace | null, x: number, y: number) => void;
  /** The front has reached a place (first time this run); x/y = marker's screen position relative to `el`. */
  onReached?: (place: CorridorPlace, clock: string, x: number, y: number) => void;
  /** An object was taken by the flow: `total` = the visitor's objects this run, `real` = surveyed bridges. */
  onSwept?: (kind: ObjectKind, total: number, real: number) => void;
  /** The clock label changed (≈ every 100 ms while running). */
  onClock?: (clock: string) => void;
  onState?: (state: RunState) => void;
  onPhase?: (phase: Phase) => void;
};

export type CorridorHandle = {
  dispose(): void;
  setPlaces(places: CorridorPlace[]): void;
  /** Start (or restart) the breach. Dropped objects are put back where they stood. */
  play(): void;
  /** Clear water and objects. */
  reset(): void;
  setScenario(s: Scenario): void;
  /** Arm a kind to drop on the next tap, or null to disarm. */
  arm(kind: ObjectKind | null): void;
  /** Place an object directly at scene coordinates (tests; the UI goes through `arm` + tap). */
  drop(kind: ObjectKind, x: number, z: number): void;
  armed(): ObjectKind | null;
  objectCount(): number;
  state(): RunState;
  /** swept objects this run, split visitor / real bridges */
  swept(): { visitor: number; real: number };
  /** Introspection for tests and debugging (`?debug=1` exposes the handle as `window.__corridor`). */
  debug(): { state: RunState; waterVisible: boolean; drawCount: number; maxDepth: number; frontX: number; objects: number; swept: number; injected: number; lowQuality: boolean };
};

const UNKNOWN_C = 0xb06a00;
const CONFIRMED_C = 0x1c7a45;
const FLOOD_C = 0xec3013;
const LAKE_C = 0x5b7f8f;
const BG = 0xe9e7e5;
const TER = 0xdedbd8;
const INK = 0x1a1a1a;
const ULTRA = 0x2438e8;
const AMBER = 0xffb800;
const CARD = 0xffffff;

const MUD_SHALLOW = new THREE.Color(0xa8784a);
const MUD_DEEP = new THREE.Color(0x5a3a1e);
const FOAM = new THREE.Color(0xf4efe6);

/** Marker position and height for a place — the same maths the fallback PNG uses. */
export function markerFor(p: CorridorPlace): { x: number; z: number; y: number; h: number } {
  const x = kmToX(p.km);
  const z = meander(x) + p.side * (p.off ? 1 : 2.2);
  return { x, z, y: bedH(x, z), h: 1.5 + Math.sqrt(Math.max(0, p.reported)) * 0.32 };
}

type PickMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

type Piece = { mesh: THREE.Mesh; spin: THREE.Vector3; drift: THREE.Vector3; y0: number };
type DroppedObject = {
  kind: ObjectKind;
  /** a surveyed bridge, not a visitor's object */
  real?: boolean;
  group: THREE.Group;
  home: { x: number; z: number; y: number };
  x: number;
  z: number;
  state: "standing" | "carried" | "sunk";
  age: number;
  pieces: Piece[];
};

const SUBSTEPS = 2;
const CARRY_SECONDS = 1.8;
const SINK_SECONDS = 0.9;
const REACH_DEPTH = 0.2;
const RUN_SECONDS = 34;
const OBJECT_SCALE = 3;
const REAL_BRIDGE_SCALE = 2.1;
/** Visual exaggeration of water depth (the terrain is already ×1.5); the sim itself is untouched. */
const VIS_AMP = 1.5;

/**
 * Mount the scene into `el` (which should be `position: relative` and sized by CSS).
 * Throws when WebGL is unavailable so the caller can swap in the static fallback.
 */
export function mountCorridor(el: HTMLElement, opts: MountOptions): CorridorHandle {
  const W = () => Math.max(1, el.clientWidth);
  const H = () => Math.max(1, el.clientHeight);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (err) {
    throw new Error("WebGL renderer unavailable: " + (err instanceof Error ? err.message : String(err)));
  }
  if (!renderer.getContext()) {
    renderer.dispose();
    throw new Error("WebGL context unavailable");
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W(), H());
  const canvas = renderer.domElement;
  // pan-y: a vertical swipe scrolls the page (the panel sits near the top on phones); horizontal drags orbit.
  canvas.style.cssText = "position:absolute;inset:0;touch-action:pan-y;display:block";
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 70, 160);

  // ---- terrain + water share one grid so the water sits exactly on the bed -------------------------------
  const bed = sampleBed(GRID);
  const sim: Sim = createSim(GRID, bed);
  const { nx, nz, cell } = GRID;
  const makeGridGeometry = () => {
    const g = new THREE.PlaneGeometry(SCENE_W - cell, SCENE_D - cell, nx - 1, nz - 1);
    g.rotateX(-Math.PI / 2);
    return g;
  };
  const geo = makeGridGeometry();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  // vertex → cell (positions after the rotation are the cell centres; z sign may flip, so look it up)
  const vertCell = new Int32Array(pos.count);
  for (let v = 0; v < pos.count; v++) vertCell[v] = cellIndex(GRID, pos.getX(v), pos.getZ(v));
  for (let v = 0; v < pos.count; v++) pos.setY(v, vertCell[v] >= 0 ? bed[vertCell[v]] : 0);
  geo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ color: TER, flatShading: true, roughness: 1 });
  const terrain = new THREE.Mesh(geo, terrainMat);
  scene.add(terrain);

  // The water sheet reuses the grid but only wet triangles are drawn (the index is rebuilt every frame),
  // so nothing hangs under the terrain at the silhouettes. Dry vertices next to wet ones sit on the bed,
  // which closes the sheet's edge with a natural skirt.
  const waterGeo = makeGridGeometry();
  const wpos = waterGeo.attributes.position as THREE.BufferAttribute;
  const wcol = new THREE.BufferAttribute(new Float32Array(wpos.count * 3), 3);
  waterGeo.setAttribute("color", wcol);
  const fullIndex = (waterGeo.index as THREE.BufferAttribute).array as Uint16Array | Uint32Array;
  const wetIndex = new Uint32Array(fullIndex.length);
  waterGeo.setIndex(new THREE.BufferAttribute(wetIndex, 1));
  const wetV = new Uint8Array(wpos.count);
  for (let v = 0; v < wpos.count; v++) {
    wpos.setY(v, vertCell[v] >= 0 ? bed[vertCell[v]] : 0);
    wcol.setXYZ(v, MUD_SHALLOW.r, MUD_SHALLOW.g, MUD_SHALLOW.b);
  }
  const waterMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.5, metalness: 0.1, emissive: 0x3a2410, emissiveIntensity: 0.3, transparent: true, opacity: 0.93 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.visible = false;
  water.frustumCulled = false;
  scene.add(water);
  const tmpC = new THREE.Color();
  const updateWater = () => {
    const d = sim.depth;
    const vx = sim.vx;
    const vz = sim.vz;
    let any = false;
    for (let v = 0; v < wpos.count; v++) {
      const c = vertCell[v];
      if (c < 0) {
        wetV[v] = 0;
        continue;
      }
      const dep = d[c];
      if (dep > 0.05) {
        any = true;
        wetV[v] = 1;
        wpos.setY(v, bed[c] + dep * VIS_AMP);
        const speed = Math.hypot(vx[c], vz[c]);
        tmpC.copy(MUD_SHALLOW).lerp(MUD_DEEP, Math.min(1, dep / 4));
        // foam where it runs fast, and a crest where the sheet drops steeply ahead (the wave's face)
        const ahead = c + 1 < d.length ? d[c + 1] : dep;
        const crest = Math.min(1, Math.max(0, (dep - ahead - 0.4) / 1.5));
        const foam = Math.max(Math.min(1, Math.max(0, (speed - 5) / 14)), crest);
        if (foam > 0) tmpC.lerp(FOAM, foam * 0.85);
        wcol.setXYZ(v, tmpC.r, tmpC.g, tmpC.b);
      } else {
        wetV[v] = 0;
        wpos.setY(v, bed[c]);
        wcol.setXYZ(v, MUD_SHALLOW.r, MUD_SHALLOW.g, MUD_SHALLOW.b);
      }
    }
    water.visible = any;
    if (!any) return;
    let n = 0;
    for (let t = 0; t < fullIndex.length; t += 3) {
      const a = fullIndex[t];
      const b = fullIndex[t + 1];
      const c = fullIndex[t + 2];
      if (wetV[a] | wetV[b] | wetV[c]) {
        wetIndex[n++] = a;
        wetIndex[n++] = b;
        wetIndex[n++] = c;
      }
    }
    waterGeo.setDrawRange(0, n);
    (waterGeo.index as THREE.BufferAttribute).needsUpdate = true;
    wpos.needsUpdate = true;
    wcol.needsUpdate = true;
    waterGeo.computeVertexNormals();
  };

  // ---- flood path (known extent) draped on the bed ------------------------------------------------------
  const pts: THREE.Vector3[] = [];
  for (let km = -10; km <= 110; km += 0.8) {
    const x = kmToX(km);
    const z = meander(x);
    pts.push(new THREE.Vector3(x, bedH(x, z) + 0.3, z));
  }
  const floodGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.42, 6);
  const floodMat = new THREE.MeshStandardMaterial({ color: FLOOD_C, emissive: FLOOD_C, emissiveIntensity: 0.55, roughness: 0.6 });
  scene.add(new THREE.Mesh(floodGeo, floodMat));

  // ---- barrier lakes: the first one drains as the breach runs ------------------------------------------
  const lakeGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 10);
  const lakeMat = new THREE.MeshStandardMaterial({ color: LAKE_C, emissive: LAKE_C, emissiveIntensity: 0.5 });
  const lakes: THREE.Mesh[] = [];
  for (const km of LAKE_KMS) {
    const x = kmToX(km);
    const z = meander(x);
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.position.set(x, bedH(x, z) + 0.5, z);
    scene.add(lake);
    lakes.push(lake);
  }

  // ---- the collapse: a rock mass falls into the first lake during the first second of a run --------------
  const rockGeo = new THREE.DodecahedronGeometry(2.2, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, flatShading: true, roughness: 1 });
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.visible = false;
  scene.add(rock);
  const ROCK_FALL_SECONDS = 1.1;
  const ROCK_START_Y = 26;
  const updateRock = (t: number) => {
    if (t > ROCK_FALL_SECONDS + 0.6) {
      rock.visible = false;
      return;
    }
    rock.visible = true;
    const u = Math.min(1, t / ROCK_FALL_SECONDS);
    const y = lakes[0].position.y + ROCK_START_Y * (1 - u * u) - 1.2 * Math.max(0, t - ROCK_FALL_SECONDS) * 4;
    rock.position.set(lakes[0].position.x - 1.5, y, lakes[0].position.z);
    rock.rotation.x = t * 3.1;
    rock.rotation.z = t * 2.3;
    // the lake heaves as the rock lands
    const splash = t > ROCK_FALL_SECONDS ? 1 + 0.9 * Math.exp(-(t - ROCK_FALL_SECONDS) * 4) : 1;
    lakes[0].scale.x = splash;
    lakes[0].scale.z = splash;
  };

  // ---- markers (rebuilt by setPlaces) --------------------------------------------------------------------
  const capGeo = new THREE.SphereGeometry(0.8, 10, 8);
  let markers: PickMesh[] = [];
  let places: CorridorPlace[] = opts.places;
  const markerCell = new Map<string, number>();
  const clearMarkers = () => {
    for (const m of markers) {
      scene.remove(m);
      if (m.geometry !== capGeo) m.geometry.dispose();
    }
    const seen = new Set<THREE.Material>();
    for (const m of markers) {
      if (!seen.has(m.material)) {
        seen.add(m.material);
        m.material.dispose();
      }
    }
    markers = [];
    markerCell.clear();
  };
  const buildMarkers = (list: CorridorPlace[]) => {
    clearMarkers();
    for (const p of list) {
      const { x, z, y, h } = markerFor(p);
      const c = p.heavy ? UNKNOWN_C : CONFIRMED_C;
      const mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.25 });
      const stem: PickMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, h, 8), mat);
      stem.position.set(x, y + h / 2 + 0.2, z);
      stem.userData = p;
      scene.add(stem);
      markers.push(stem);
      const cap: PickMesh = new THREE.Mesh(capGeo, mat);
      cap.position.set(x, y + h + 0.6, z);
      cap.userData = p;
      scene.add(cap);
      markers.push(cap);
      // the cell the front must wet to count as "reached": the channel beside an in-channel marker,
      // the marker's own cell for off-channel places (Langtang was cut off, not flooded)
      markerCell.set(p.id, p.off ? cellIndex(GRID, x, z) : cellIndex(GRID, x, meander(x)));
    }
  };
  buildMarkers(places);

  // ---- objects in the path -------------------------------------------------------------------------------
  const objMats = {
    wall: new THREE.MeshStandardMaterial({ color: CARD, roughness: 0.9 }),
    roof: new THREE.MeshStandardMaterial({ color: ULTRA, roughness: 0.8 }),
    ink: new THREE.MeshStandardMaterial({ color: INK, roughness: 0.9 }),
    amber: new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.8 }),
  };
  const objGeos: THREE.BufferGeometry[] = [];
  const box = (w: number, h: number, d: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    objGeos.push(g);
    return g;
  };
  const cone = (r: number, h: number, seg: number) => {
    const g = new THREE.ConeGeometry(r, h, seg);
    objGeos.push(g);
    return g;
  };
  const geoHouseWall = box(1.6, 1.2, 1.4);
  const geoHouseRoof = cone(1.35, 0.9, 4);
  const geoBridgeDeck = box(0.9, 0.25, 4.2);
  const geoBridgePylon = box(0.45, 1.6, 0.45);
  const geoBusBody = box(2.6, 1.0, 1.1);
  const geoBusWheel = box(0.5, 0.35, 1.25);
  const geoCamp = cone(0.9, 1.1, 5);

  const buildObject = (kind: ObjectKind): THREE.Group => {
    const g = new THREE.Group();
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, ry = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      g.add(m);
      return m;
    };
    switch (kind) {
      case "house":
        add(geoHouseWall, objMats.wall, 0, 0.6, 0);
        add(geoHouseRoof, objMats.roof, 0, 1.65, 0, Math.PI / 4);
        break;
      case "bridge":
        add(geoBridgeDeck, objMats.ink, 0, 1.5, 0);
        add(geoBridgePylon, objMats.amber, 0, 0.8, -1.6);
        add(geoBridgePylon, objMats.amber, 0, 0.8, 1.6);
        break;
      case "bus":
        add(geoBusBody, objMats.amber, 0, 0.85, 0);
        add(geoBusWheel, objMats.ink, -0.8, 0.25, 0);
        add(geoBusWheel, objMats.ink, 0.8, 0.25, 0);
        break;
      case "camp":
        add(geoCamp, objMats.amber, 0, 0.55, 0);
        break;
    }
    return g;
  };

  let objects: DroppedObject[] = [];
  let sweptTotal = 0;
  let sweptReal = 0;
  let armedKind: ObjectKind | null = null;

  const placeObject = (kind: ObjectKind, px: number, pz: number, real = false) => {
    const { x, z } = snapToPath(kind, px, pz, meander(px));
    const idx = cellIndex(GRID, x, z);
    if (idx < 0) return;
    if (objects.filter((o) => !o.real).length >= MAX_OBJECTS) removeObject(objects.find((o) => !o.real)!);
    const y = bed[idx];
    const group = buildObject(kind);
    group.scale.setScalar(real ? REAL_BRIDGE_SCALE : OBJECT_SCALE);
    group.position.set(x, y, z);
    if (kind === "bridge") group.rotation.y = 0;
    else group.rotation.y = Math.random() * Math.PI * 2;
    scene.add(group);
    const pieces: Piece[] = group.children.map((m) => ({
      mesh: m as THREE.Mesh,
      spin: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6),
      drift: new THREE.Vector3((Math.random() - 0.5) * 1.6, Math.random() * 1.2, (Math.random() - 0.5) * 1.6),
      y0: m.position.y,
    }));
    objects.push({ kind, real, group, home: { x, z, y }, x, z, state: "standing", age: 0, pieces });
  };
  for (const b of opts.bridges ?? []) placeObject("bridge", kmToX(b.km), 0, true);
  const removeObject = (o: DroppedObject) => {
    scene.remove(o.group);
    objects = objects.filter((q) => q !== o);
  };
  const restoreObjects = () => {
    for (const o of objects) {
      o.state = "standing";
      o.age = 0;
      o.x = o.home.x;
      o.z = o.home.z;
      o.group.position.set(o.home.x, o.home.y, o.home.z);
      o.group.rotation.set(0, o.kind === "bridge" ? 0 : o.group.rotation.y, 0);
      o.group.scale.setScalar(o.real ? REAL_BRIDGE_SCALE : OBJECT_SCALE);
      for (const p of o.pieces) {
        p.mesh.position.set(p.mesh.position.x, p.y0, p.mesh.position.z);
        p.mesh.rotation.set(0, p.mesh.rotation.y, 0);
      }
    }
  };
  const updateObjects = (dt: number) => {
    for (const o of objects.slice()) {
      const idx = cellIndex(GRID, o.x, o.z);
      const dep = idx >= 0 ? sim.depth[idx] : 0;
      const v = idx >= 0 ? { vx: sim.vx[idx], vz: sim.vz[idx] } : { vx: 0, vz: 0 };
      const speed = Math.hypot(v.vx, v.vz);
      if (o.state === "standing") {
        if (isSwept(o.kind, dep, speed)) {
          o.state = "carried";
          o.age = 0;
          if (o.real) sweptReal++;
          else sweptTotal++;
          opts.onSwept?.(o.kind, sweptTotal, sweptReal);
        } else if (dep > 0.05) {
          // wobble as the water rises around it
          o.group.rotation.x = Math.sin(o.age * 9) * Math.min(0.25, dep * 0.4);
          o.age += dt;
        }
        continue;
      }
      o.age += dt;
      if (o.state === "carried") {
        const next = advect({ x: o.x, z: o.z }, v, dt);
        if (cellIndex(GRID, next.x, next.z) >= 0) {
          o.x = next.x;
          o.z = next.z;
        }
        const surface = (idx >= 0 ? bed[idx] : o.home.y) + dep * VIS_AMP;
        o.group.position.set(o.x, surface - 0.15, o.z);
        o.group.rotation.x += dt * 2.2;
        o.group.rotation.z += dt * 1.4;
        for (const p of o.pieces) {
          p.mesh.rotation.x += p.spin.x * dt;
          p.mesh.rotation.y += p.spin.y * dt;
          p.mesh.rotation.z += p.spin.z * dt;
          p.mesh.position.addScaledVector(p.drift, dt);
        }
        if (o.age > CARRY_SECONDS) {
          o.state = "sunk";
          o.age = 0;
        }
      } else if (o.state === "sunk") {
        const k = Math.max(0, 1 - o.age / SINK_SECONDS);
        o.group.scale.setScalar(k * (o.real ? REAL_BRIDGE_SCALE : OBJECT_SCALE));
        o.group.position.y -= dt * 1.2;
        if (k <= 0) {
          o.group.visible = false;
        }
      }
    }
  };

  // ---- lights, camera, orbit (unchanged from the design) -------------------------------------------------
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xfff4ea, 1.4);
  sun.position.set(-30, 50, 25);
  scene.add(sun);

  const cam = new THREE.PerspectiveCamera(42, W() / H(), 0.5, 400);
  let az = -0.9;
  let pol = 0.98;
  let rad = 62;
  let drift = true;
  const target = new THREE.Vector3(0, 4, 0);
  const HOME = { target: new THREE.Vector3(0, 4, 0), rad: 62, pol: 0.98, az: -0.9 };
  // ride: above the channel, looking downstream from a little upstream of the front
  const RIDE = { rad: 46, pol: 0.42, az: -1.3 };
  let follow = true; // false once the visitor orbits or zooms
  const tmpT = new THREE.Vector3();
  // thinner marker stems while the camera rides (they crowd the view in front of the wave)
  let thinMarkers = false;
  const setThinMarkers = (thin: boolean) => {
    if (thin === thinMarkers) return;
    thinMarkers = thin;
    for (const m of markers) if (m.geometry !== capGeo) m.scale.set(thin ? 0.5 : 1, 1, thin ? 0.5 : 1);
  };
  const updateCamera = (dt: number) => {
    setThinMarkers(follow && runState === "running");
    if (!follow) return;
    const k = 1 - Math.pow(0.001, dt); // exponential ease, frame-rate independent
    if (runState === "running") {
      const fx = sim.frontX();
      if (Number.isFinite(fx)) {
        const tx = Math.min(fx + 2, HOME.target.x + 40);
        tmpT.set(tx, 3, meander(tx));
        target.lerp(tmpT, k * 0.6);
        rad += (RIDE.rad - rad) * k * 0.5;
        pol += (RIDE.pol - pol) * k * 0.5;
        az += (RIDE.az - az) * k * 0.5;
      }
    } else {
      target.lerp(HOME.target, k * 0.4);
      rad += (HOME.rad - rad) * k * 0.3;
      pol += (HOME.pol - pol) * k * 0.3;
      az += (HOME.az - az) * k * 0.3;
    }
  };
  const setCam = () => {
    cam.position.set(
      target.x + rad * Math.sin(pol) * Math.sin(az),
      target.y + rad * Math.cos(pol),
      target.z + rad * Math.sin(pol) * Math.cos(az),
    );
    cam.lookAt(target);
  };

  type Down = { x: number; y: number; az: number; pol: number; moved: boolean };
  let down: Down | null = null;

  const ray = new THREE.Raycaster();
  const v2 = new THREE.Vector2();
  const v3 = new THREE.Vector3();
  const screenOf = (x: number, y: number, z: number): { x: number; y: number } => {
    v3.set(x, y, z).project(cam);
    return { x: ((v3.x + 1) / 2) * W(), y: ((1 - v3.y) / 2) * H() };
  };
  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    v2.set((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1);
    ray.setFromCamera(v2, cam);
    if (armedKind) {
      const hit = ray.intersectObject(terrain, false)[0];
      if (hit) placeObject(armedKind, hit.point.x, hit.point.z);
      return;
    }
    const hit = ray.intersectObjects(markers, false)[0];
    const place = hit ? (hit.object.userData as CorridorPlace) : null;
    opts.onPick?.(place, px, py);
  };

  const onPointerDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY, az, pol, moved: false };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      down.moved = true;
      drift = false;
      follow = false;
    }
    az = down.az - dx * 0.005;
    pol = Math.min(1.35, Math.max(0.35, down.pol - dy * 0.005));
  };
  const onPointerUp = (e: PointerEvent) => {
    if (down && !down.moved) pick(e);
    down = null;
  };
  const onPointerCancel = () => {
    down = null;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    drift = false;
    follow = false;
    rad = Math.min(120, Math.max(28, rad + e.deltaY * 0.05));
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H());
    cam.aspect = W() / H();
    cam.updateProjectionMatrix();
  });
  ro.observe(el);

  // Pause the loop while the panel is off-screen or the tab is hidden.
  let visible = true;
  const io =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          visible = entries.some((e) => e.isIntersecting);
        }, { threshold: 0.15 })
      : null;
  io?.observe(el);

  // ---- the run --------------------------------------------------------------------------------------------
  let scenario: Scenario = opts.scenario ?? DEFAULT_SCENARIO;
  let runState: RunState = "idle";
  let runT = 0;
  let injectedFrac = 0;
  const reached = new Set<string>();
  let lastClock = "";
  let clockTick = 0;
  const setState = (s: RunState) => {
    if (runState === s) return;
    runState = s;
    opts.onState?.(s);
  };
  let phase: Phase = "after";
  const setPhase = (p: Phase) => {
    if (phase === p) return;
    phase = p;
    opts.onPhase?.(p);
  };

  const simStep = (dtReal: number, substeps: number = SUBSTEPS) => {
    const total = scenario.lakeMm3 * SIM_UNITS_PER_MM3;
    const sub = dtReal / substeps;
    for (let s = 0; s < substeps; s++) {
      const dv = breachVolume(total, scenario.breachSeconds, runT - ROCK_FALL_SECONDS, sub);
      if (dv > 0) sim.inject(BREACH.x, BREACH.z, BREACH.radius, dv);
      sim.step(sub);
      runT += sub;
    }
    injectedFrac = Math.min(1, sim.injected() / total);
    lakes[0].scale.y = Math.max(0.08, 1 - injectedFrac);
    updateRock(runT);
    setPhase(runT < ROCK_FALL_SECONDS ? "collapse" : injectedFrac < 0.995 ? "breach" : runT < RUN_SECONDS ? "wave" : "after");
    // reached places
    for (const p of places) {
      if (reached.has(p.id)) continue;
      const c = markerCell.get(p.id);
      if (c === undefined || c < 0) continue;
      if (sim.depth[c] > REACH_DEPTH) {
        reached.add(p.id);
        const m = markerFor(p);
        const s = screenOf(m.x, m.y + m.h + 1.2, m.z);
        opts.onReached?.(p, clockForFrontX(sim.frontX()), s.x, s.y);
      }
    }
    // clock
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
    runT = 0;
    injectedFrac = 0;
    reached.clear();
    lakes[0].scale.setScalar(1);
    for (const o of objects) o.group.visible = true;
    restoreObjects();
    sweptTotal = 0;
    sweptReal = 0;
    lastClock = "";
    opts.onClock?.(clockForFrontX(-Infinity));
    setPhase("collapse");
    setState("running");
  };
  const resetAll = () => {
    sim.reset();
    runT = 0;
    injectedFrac = 0;
    reached.clear();
    lakes[0].scale.setScalar(1);
    for (const o of objects.slice()) if (!o.real) removeObject(o);
    restoreObjects();
    sweptTotal = 0;
    lastClock = "";
    updateWater();
    rock.visible = false;
    opts.onClock?.(clockForFrontX(-Infinity));
    setPhase("after");
    setState("idle");
  };

  let raf = 0;
  let alive = true;
  let last = performance.now();
  // Adaptive quality: a slow device (long frames) gets one sim substep and a water-mesh update every other frame.
  let slowFrames = 0;
  let lowQuality = false;
  let frameNo = 0;
  const tick = (now: number) => {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    const dtReal = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    frameNo++;
    if (dtReal > 0.034) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (!lowQuality && slowFrames > 20) lowQuality = true;
    const active = runState === "running" || (runState === "done" && water.visible);
    if (active) {
      simStep(dtReal, lowQuality ? 1 : SUBSTEPS);
      if (!lowQuality || frameNo % 2 === 0) updateWater();
      updateObjects(dtReal);
      if (runState === "done") {
        // let the tail drain for a while after the run
        if (runT > RUN_SECONDS + 40) water.visible = false;
        setPhase("after");
      }
    }
    if (drift) az += 0.0009;
    updateCamera(dtReal);
    setCam();
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(tick);

  return {
    setPlaces(list: CorridorPlace[]) {
      if (!alive) return;
      places = list;
      buildMarkers(list);
    },
    play,
    reset: resetAll,
    setScenario(s: Scenario) {
      scenario = s;
    },
    arm(kind) {
      armedKind = kind;
      canvas.style.cursor = kind ? "crosshair" : "";
    },
    armed: () => armedKind,
    drop: placeObject,
    objectCount: () => objects.length,
    state: () => runState,
    swept: () => ({ visitor: sweptTotal, real: sweptReal }),
    debug() {
      let maxDepth = 0;
      for (let i = 0; i < sim.depth.length; i++) if (sim.depth[i] > maxDepth) maxDepth = sim.depth[i];
      return {
        state: runState,
        waterVisible: water.visible,
        drawCount: waterGeo.drawRange.count,
        maxDepth,
        frontX: sim.frontX(),
        objects: objects.length,
        swept: sweptTotal,
        injected: sim.injected(),
        lowQuality,
      };
    },
    dispose() {
      if (!alive) return;
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("wheel", onWheel);
      clearMarkers();
      for (const o of objects) scene.remove(o.group);
      objects = [];
      for (const g of objGeos) g.dispose();
      for (const m of Object.values(objMats)) m.dispose();
      capGeo.dispose();
      geo.dispose();
      terrainMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      floodGeo.dispose();
      floodMat.dispose();
      lakeGeo.dispose();
      lakeMat.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
