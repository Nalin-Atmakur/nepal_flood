/**
 * MarkersModule (web/docs/16-corridor-v2-plan.md §2.2): every place on the corridor becomes what is actually
 * there — a settlement cluster of tiny houses (count ∝ √reported), or a kind shape (dam, helipad, tents, health
 * post, border post) — on a flat pad whose centre sits on the sampled ground and whose tilt follows the ground
 * normal, with a status ring on the pad carrying the legend colour (amber = mostly unknown, green = mostly
 * reached, grey = nothing reported). One InstancedMesh per shape family → one draw call each. Picking goes
 * through an invisible-but-raycastable sphere per place (`placeOf`).
 */
import * as THREE from "three";
import type { CorridorPlace } from "@/lib/corridor";
import { kmToX, meander } from "@/lib/corridor-terrain";
import { cellIndex } from "@/lib/flood-sim";
import { createLabel } from "./labels";
import type { MarkersModule, SceneCtx } from "./types";

const AMBER = 0xffb800;
const GREEN = 0x148a4e;
const GREY = 0x9a9a9a;
const WALL = 0xffffff;
const ROOF_A = 0x2438e8;
const ROOF_B = 0x1a1a1a;
const PAD = 0x8f7a5a;
const TENT = 0xffb800;
const STEEL = 0x8d8a84;
const RED = 0xe5484d;

type Kind = "houses" | "dam" | "helipad" | "tents" | "health" | "border";

type Record_ = {
  place: CorridorPlace;
  kind: Kind;
  /** pad centre on the ground */
  x: number;
  y: number;
  z: number;
  /** ground normal → pad tilt */
  n: THREE.Vector3;
  reachCell: number;
  pick: THREE.Mesh;
  label: THREE.Sprite | null;
  reached: number; // seconds since reached, −1 = not
  ringIndex: number;
  /** instance indices of this place's roofs/tents (they carry the status colour) */
  roofIdx: number[];
  top8: boolean;
  radius: number;
};

/** Deterministic 0..1 from a string (stable layouts per place). */
function hash01(s: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function kindOf(p: CorridorPlace): Kind {
  const s = `${p.id} ${p.name}`.toLowerCase();
  if (/hydro|power|mw\)/.test(s)) return "dam";
  if (/helipad|heli/.test(s)) return "helipad";
  if (/shelter|camp|relief/.test(s)) return "tents";
  if (/health|hospital|clinic/.test(s)) return "health";
  if (/border|customs|security|police|army|apf|post/.test(s)) return "border";
  return "houses";
}

/** Pad radius in scene units: grows with the settlement, capped so it never eats the channel. */
function padRadius(p: CorridorPlace, kind: Kind): number {
  if (kind !== "houses") return 1.6;
  return Math.min(2.6, 1.2 + Math.sqrt(Math.max(0, p.reported)) * 0.06);
}

function houseCount(p: CorridorPlace): number {
  return Math.max(2, Math.min(7, Math.round(2 + Math.sqrt(Math.max(0, p.reported)) / 4)));
}

/** A family of instances with one material (and a clone for the ride's translucency). */
class Family {
  mesh: THREE.InstancedMesh;
  n = 0;
  private m4 = new THREE.Matrix4();
  private color = new THREE.Color();
  constructor(ctx: SceneCtx, geo: THREE.BufferGeometry, colour: number, cap: number, opts: { emissive?: number; rough?: number } = {}) {
    const mat = ctx.own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: opts.rough ?? 0.85, flatShading: true, emissive: opts.emissive ?? 0x000000, emissiveIntensity: 0.35 }));
    this.mesh = new THREE.InstancedMesh(ctx.own(geo), mat, Math.max(1, cap));
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.color.setHex(colour);
    ctx.scene.add(this.mesh);
  }
  add(p: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3, colour?: number): number {
    const i = this.n++;
    this.m4.compose(p, q, s);
    this.mesh.setMatrixAt(i, this.m4);
    this.mesh.setColorAt(i, colour === undefined ? this.color : new THREE.Color(colour));
    return i;
  }
  commit() {
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  clear() {
    this.n = 0;
    this.mesh.count = 0;
  }
  setColor(i: number, colour: number) {
    this.mesh.setColorAt(i, new THREE.Color(colour));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  setTranslucent(on: boolean) {
    const m = this.mesh.material as THREE.MeshStandardMaterial;
    m.transparent = on;
    m.opacity = on ? 0.35 : 1;
    m.depthWrite = !on;
    m.needsUpdate = true;
  }
  dispose(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.mesh.dispose();
  }
}

export function createMarkers(ctx: SceneCtx): MarkersModule {
  const { scene, grid } = ctx;
  const CAP = 120;

  // families (one draw call each)
  const pads = new Family(ctx, new THREE.CylinderGeometry(1, 1.06, 0.16, 12), PAD, CAP, { rough: 1 });
  const rings = new Family(ctx, new THREE.TorusGeometry(1, 0.07, 6, 24), GREY, CAP, { emissive: 0x000000 });
  const houses = new Family(ctx, new THREE.BoxGeometry(0.9, 0.55, 0.8), WALL, CAP * 7, { rough: 0.9 });
  const roofs = new Family(ctx, new THREE.ConeGeometry(0.72, 0.45, 4), ROOF_A, CAP * 7, { rough: 0.8 });
  const tents = new Family(ctx, new THREE.ConeGeometry(0.5, 0.6, 5), TENT, CAP * 3);
  const cubes = new Family(ctx, new THREE.BoxGeometry(1.2, 0.9, 1.2), WALL, CAP, { rough: 0.9 });
  const crosses = new Family(ctx, new THREE.BoxGeometry(0.7, 0.14, 0.18), RED, CAP * 2);
  const dams = new Family(ctx, new THREE.BoxGeometry(0.8, 1.4, 2.6), STEEL, CAP, { rough: 0.7 });
  const pipes = new Family(ctx, new THREE.CylinderGeometry(0.16, 0.16, 2.4, 6), ROOF_B, CAP);
  const hpads = new Family(ctx, new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16), 0x3c3c40, CAP, { rough: 1 });
  const hmarks = new Family(ctx, new THREE.BoxGeometry(0.18, 0.04, 0.9), WALL, CAP * 3);
  const barriers = new Family(ctx, new THREE.BoxGeometry(2.2, 0.16, 0.16), RED, CAP);
  const poles = new Family(ctx, new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), ROOF_B, CAP * 2);
  const flags = new Family(ctx, new THREE.BoxGeometry(0.6, 0.36, 0.04), AMBER, CAP);
  const families = [pads, rings, houses, roofs, tents, cubes, crosses, dams, pipes, hpads, hmarks, barriers, poles, flags];
  for (const f of families) f.mesh.renderOrder = 8;
  rings.mesh.renderOrder = 9;

  const pickGeo = ctx.own(new THREE.SphereGeometry(1, 8, 6));
  const pickMat = ctx.own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }));

  let records: Record_[] = [];
  const byId = new Map<string, Record_>();
  const byPick = new Map<THREE.Object3D, Record_>();
  let ride = false;

  const up = new THREE.Vector3(0, 1, 0);
  const tmpQ = new THREE.Quaternion();
  const tmpQ2 = new THREE.Quaternion();
  const tmpP = new THREE.Vector3();
  const tmpS = new THREE.Vector3();

  /** Quaternion that tilts +y onto the ground normal, then yaws by `yaw`. */
  const tilt = (n: THREE.Vector3, yaw: number): THREE.Quaternion => {
    tmpQ.setFromUnitVectors(up, n);
    tmpQ2.setFromAxisAngle(up, yaw);
    return tmpQ.multiply(tmpQ2).clone();
  };
  /** Point at local (dx, dy, dz) on a pad with tilt `q` at centre c. */

  const clear = () => {
    for (const r of records) {
      scene.remove(r.pick);
      if (r.label) {
        scene.remove(r.label);
        (r.label.material as THREE.SpriteMaterial).dispose();
      }
    }
    records = [];
    byId.clear();
    byPick.clear();
    for (const f of families) f.clear();
  };

  const build = (places: CorridorPlace[]) => {
    clear();
    const top8 = new Set(
      [...places]
        .sort((a, b) => b.unknown - a.unknown)
        .slice(0, 8)
        .map((p) => p.id),
    );
    for (const p of places) {
      const kind = kindOf(p);
      if (p.km < -11) continue; // west of the collapse site — off the rendered plate
      const x0 = kmToX(p.km);
      const z0 = meander(x0) + p.side * (p.off ? 1 : 2.2);
      // settle on the flattest ground within 2.5 units (villages sit on terraces, not on cliff faces)
      let x = x0;
      let z = z0;
      let best = Infinity;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const rr = i === 0 ? 0 : 1.2 + (i % 2) * 1.3;
        const cx = x0 + Math.cos(a) * rr;
        const cz = z0 + Math.sin(a) * rr;
        const gg = ctx.groundAt(cx, cz);
        if (!gg) continue;
        const slope = 1 - gg.ny;
        if (slope < best) {
          best = slope;
          x = cx;
          z = cz;
        }
      }
      const g = ctx.groundAt(x, z);
      if (!g) continue;
      const n = new THREE.Vector3(g.nx, g.ny, g.nz);
      const centre = new THREE.Vector3(x, g.y + 0.06, z);
      const yaw = hash01(p.id, 3) * Math.PI * 2;
      const q = tilt(n, yaw);
      const radius = padRadius(p, kind);
      const statusColour = p.reported <= 0 ? GREY : p.heavy ? AMBER : GREEN;
      // no pads, no rings (they read as floating discs): the roofs carry the legend colour
      const ringIndex = -1;
      const roofIdx: number[] = [];
      /** world point for a local offset, seated on its own ground (each house stands on the terrain itself) */
      const onGround = (dx: number, dy: number, dz: number): THREE.Vector3 => {
        const wx = x + Math.cos(yaw) * dx - Math.sin(yaw) * dz;
        const wz = z + Math.sin(yaw) * dx + Math.cos(yaw) * dz;
        const gg = ctx.groundAt(wx, wz);
        return tmpP.set(wx, (gg ? gg.y : centre.y) + dy, wz).clone();
      };
      // the shape
      const one = new THREE.Vector3(1, 1, 1);
      switch (kind) {
        case "houses": {
          const count = houseCount(p);
          for (let i = 0; i < count; i++) {
            const a = hash01(p.id, 10 + i) * Math.PI * 2;
            const rr = (0.25 + hash01(p.id, 30 + i) * 0.6) * radius;
            const hx = Math.cos(a) * rr;
            const hz = Math.sin(a) * rr;
            const hyaw = hash01(p.id, 50 + i) * Math.PI;
            const hq = tilt(n, yaw + hyaw);
            const s = 0.8 + hash01(p.id, 70 + i) * 0.5;
            houses.add(onGround(hx, 0.275 * s, hz), hq, tmpS.set(s, s, s));
            roofIdx.push(roofs.add(onGround(hx, 0.55 * s + 0.2 * s, hz), tilt(n, yaw + hyaw + Math.PI / 4), tmpS.set(s, s, s), statusColour));
          }
          break;
        }
        case "tents":
          for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 + yaw;
            roofIdx.push(tents.add(onGround(Math.cos(a) * 0.8, 0.38, Math.sin(a) * 0.8), tilt(n, yaw), one, i === 1 ? statusColour : TENT));
          }
          break;
        case "health":
          cubes.add(onGround(0, 0.53, 0), q, one);
          crosses.add(onGround(0, 1.06, 0), q, one);
          crosses.add(onGround(0, 1.06, 0), tilt(n, yaw + Math.PI / 2), one);
          break;
        case "dam":
          dams.add(onGround(0, 0.78, 0), q, one);
          pipes.add(onGround(1.2, 0.5, 0), tilt(n, yaw).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2 - 0.5)), one);
          break;
        case "helipad":
          hpads.add(onGround(0, 0.06, 0), q, one);
          hmarks.add(onGround(-0.3, 0.14, 0), q, one);
          hmarks.add(onGround(0.3, 0.14, 0), q, one);
          hmarks.add(onGround(0, 0.14, 0), tilt(n, yaw + Math.PI / 2), tmpS.set(1, 1, 0.65));
          break;
        case "border":
          poles.add(onGround(-1.1, 0.88, 0), q, one);
          poles.add(onGround(1.1, 0.88, 0), q, one);
          barriers.add(onGround(0, 1.0, 0), q, one);
          flags.add(onGround(1.1, 1.55, 0.3), q, one);
          break;
      }
      // pick sphere (invisible but raycastable)
      const pick = new THREE.Mesh(pickGeo, pickMat);
      pick.position.copy(centre).addScaledVector(n, 0.8);
      pick.scale.setScalar(Math.max(1.4, radius * 1.1));
      pick.userData.placeId = p.id;
      scene.add(pick);
      // label
      let label: THREE.Sprite | null = null;
      try {
        label = createLabel(p.name, { height: 1.9 });
        label.position.copy(centre).addScaledVector(n, 1.9 + (kind === "dam" ? 0.6 : 0));
        label.visible = false;
        scene.add(label);
      } catch {
        label = null; // no DOM canvas (tests)
      }
      const rc = p.off ? cellIndex(grid, x, z) : cellIndex(grid, x, meander(x));
      const rec: Record_ = { place: p, kind, x, y: centre.y, z, n, reachCell: rc, pick, label, reached: -1, ringIndex, roofIdx, top8: top8.has(p.id), radius };
      records.push(rec);
      byId.set(p.id, rec);
      byPick.set(pick, rec);
    }
    for (const f of families) f.commit();
    if (ride) for (const f of families) f.setTranslucent(true);
  };

  return {
    set: build,
    pickables: () => records.map((r) => r.pick),
    placeOf: (obj) => byPick.get(obj)?.place ?? null,
    reachCell: (id) => byId.get(id)?.reachCell ?? -1,
    anchor: (id) => {
      const r = byId.get(id);
      return r ? new THREE.Vector3(r.x, r.y, r.z).addScaledVector(r.n, 2.4) : null;
    },
    setRide(on) {
      if (on === ride) return;
      ride = on;
      for (const f of families) f.setTranslucent(on);
    },
    markReached(id) {
      const r = byId.get(id);
      if (!r || r.reached >= 0) return;
      r.reached = 0;
      for (const i of r.roofIdx) (r.kind === "tents" ? tents : roofs).setColor(i, 0xffd24d);
    },
    clearReached() {
      for (const r of records) {
        if (r.reached >= 0) for (const i of r.roofIdx) (r.kind === "tents" ? tents : roofs).setColor(i, r.place.reported <= 0 ? GREY : r.place.heavy ? AMBER : GREEN);
        r.reached = -1;
      }
    },
    update(dt, camPos) {
      for (const r of records) {
        if (r.reached >= 0) r.reached += dt;
        if (!r.label) continue;
        const dx = camPos.x - r.x;
        const dz = camPos.z - r.z;
        const near = dx * dx + dz * dz < 45 * 45;
        const justReached = r.reached >= 0 && r.reached < 6;
        r.label.visible = !ride && (near || justReached || r.top8) && r.place.reported > 0;
      }
    },
    dispose() {
      clear();
      for (const f of families) f.dispose(scene);
    },
  };
}
