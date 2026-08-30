import * as THREE from "three";
import { kmToX, meander } from "@/lib/corridor-terrain";
import { kick, makeBody, step as physicsStep, type Body } from "@/lib/flood-physics";
import { MAX_OBJECTS, catalogue, isSwept, massFactor, snapToPath, type ObjectKind, type Palette, type Part } from "@/lib/object-catalogue";
import { createLabel } from "./labels";
import type { ObjectEvent, ObjectsModule, PlacedObject, SceneCtx } from "./types";

/**
 * Things in the flood's path (web/docs/16-corridor-v2-plan.md §3). An object is a group of catalogue parts
 * standing directly on the sampled ground (no pad, no ring — D-056/D-058), aligned to its normal. When the flow at
 * its base exceeds the kind's threshold it is *taken*: the whole thing lifts off as one body (lib/flood-physics),
 * rides the surface downstream, tumbling — and on its first hard impact (or after a few seconds) it *breaks*: each
 * part becomes its own body, inheriting the object's velocity, carried on down the corridor, off the east edge of
 * the plate if the water takes it that far. Anchored kinds (bridges, masts) break where they stand. Replay puts
 * everything back; Reset removes the visitor's objects (real bridges stay).
 *
 *   standing ──(depth & speed over threshold)──► taken (one body, ≤ CARRY_SECONDS) ──(hard hit | timeout)──► broken ──(all asleep)──► wreck
 */

const PALETTE: Record<Palette, number> = {
  wall: 0xffffff,
  roof: 0x2438e8,
  ink: 0x1a1a1a,
  amber: 0xffb800,
  ultra: 0x2438e8,
  steel: 0x9aa3ad,
  rock: 0x5c5650,
  leaf: 0x3f6b3a,
  trunk: 0x6b4a2b,
  red: 0xe5484d,
  glass: 0x8fb3c9,
};

const BAND_X_MIN = kmToX(-11);
const BAND_Z = 20;
/** the whole object rides as one body for at most this long before it breaks up */
const CARRY_SECONDS = 6;
/** no break-up in the first moments of the ride (it has to visibly lift off first) */
const CARRY_MIN_SECONDS = 0.55;

type PieceRec = { mesh: THREE.Mesh; body: Body; local: THREE.Vector3; baseRot: THREE.Euler; mass: number };
type Rec = PlacedObject & {
  pieces: PieceRec[];
  wobble: number;
  scale: number;
  /** half the object's height (scene units) — the radius of the body that carries it whole */
  halfH: number;
  marker: THREE.Group | null;
  /** the carried phase: a pivot at the object's centre and the body driving it */
  carrier: THREE.Group | null;
  carry: Body | null;
  carryT: number;
};

export function createObjects(ctx: SceneCtx, onEvent?: (e: ObjectEvent) => void, labelFor?: (kind: ObjectKind) => string): ObjectsModule {
  const mats = new Map<Palette, THREE.MeshStandardMaterial>();
  const mat = (p: Palette) => {
    let m = mats.get(p);
    if (!m) {
      m = ctx.own(new THREE.MeshStandardMaterial({ color: PALETTE[p], flatShading: true, roughness: p === "glass" ? 0.35 : 0.85, metalness: p === "steel" ? 0.35 : 0 }));
      if (p === "glass") {
        m.transparent = true;
        m.opacity = 0.85;
      }
      mats.set(p, m);
    }
    return m;
  };
  const geos = new Map<string, THREE.BufferGeometry>();
  const geo = (part: Part) => {
    const key = `${part.shape}:${part.size.join("x")}`;
    let g = geos.get(key);
    if (!g) {
      const [a, b, c] = part.size;
      switch (part.shape) {
        case "box":
          g = new THREE.BoxGeometry(a, b, c ?? a);
          break;
        case "cone":
          g = new THREE.ConeGeometry(a, b, Math.max(3, Math.round(c ?? 6)));
          break;
        case "cylinder":
          g = new THREE.CylinderGeometry(a, a, b, Math.max(5, Math.round(c ?? 8)));
          break;
        case "sphere":
          g = new THREE.SphereGeometry(a, Math.max(6, Math.round(c ?? 8)), 6);
          break;
        case "dodeca":
          g = new THREE.DodecahedronGeometry(a, 0);
          break;
      }
      ctx.own(g);
      geos.set(key, g);
    }
    return g;
  };
  const ringGeo = ctx.own(new THREE.TorusGeometry(1.25, 0.08, 6, 24));
  const markerRingMat = ctx.own(new THREE.MeshBasicMaterial({ color: 0xffb800, transparent: true, opacity: 0.95 }));
  const markerArrowGeo = ctx.own(new THREE.ConeGeometry(0.55, 1.3, 4));
  const markerArrowMat = ctx.own(new THREE.MeshBasicMaterial({ color: 0xffb800 }));

  let objects: Rec[] = [];
  let seq = 0;
  let lastVisitor: Rec | null = null;
  const up = new THREE.Vector3(0, 1, 0);
  const n = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const world = { groundAt: ctx.groundAt, flowAt: ctx.flowAt, visAmp: ctx.visAmp, channelZ: meander };

  /**
   * Put the group on the ground at (x, z), aligned to the normal. Channel-spanning kinds (bridges) sit level on
   * the higher of their two abutments so the deck crosses above the river instead of lying in it.
   */
  function seat(rec: Rec, x: number, z: number): void {
    const g = ctx.groundAt(x, z);
    if (!g) return;
    const c = catalogue(rec.kind);
    if (c.spansChannel) {
      const off = 1.7 * rec.scale;
      const ya = ctx.groundAt(x, z - off)?.y ?? g.y;
      const yb = ctx.groundAt(x, z + off)?.y ?? g.y;
      rec.group.position.set(x, Math.max(ya, yb, g.y) + 0.02, z);
      rec.group.quaternion.identity();
      return;
    }
    rec.group.position.set(x, g.y + 0.02, z);
    // follow the ground normal only partially so tall things don't lean absurdly on steep banks
    n.set(g.nx, g.ny, g.nz).lerp(up, 0.6).normalize();
    q.setFromUnitVectors(up, n);
    rec.group.quaternion.copy(q);
    rec.group.rotateY(hash(rec.id) * Math.PI * 2);
  }

  function build(kind: ObjectKind, real: boolean): Rec {
    const c = catalogue(kind);
    const group = new THREE.Group();
    const scale = real ? c.scale * 0.55 : c.scale;
    const pieces: PieceRec[] = [];
    let top = 0;
    for (const part of c.parts) {
      const m = new THREE.Mesh(geo(part), mat(part.colour));
      m.userData.pieceOf = seq + 1; // the object's id (for the debug trace)
      m.position.set(part.at[0], part.at[1], part.at[2]);
      if (part.rotY) m.rotation.y = part.rotY;
      if (part.shape === "cylinder" && kind === "tanker") m.rotation.z = Math.PI / 2;
      group.add(m);
      top = Math.max(top, part.at[1] + part.size[1] / 2);
      pieces.push({ mesh: m, body: makeBody({ x: 0, y: 0, z: 0 }, c.radius * scale, massFactor(c.mass)), local: m.position.clone(), baseRot: m.rotation.clone(), mass: part.mass ?? 1 / c.parts.length });
    }
    group.scale.setScalar(scale);
    ctx.scene.add(group);
    return { id: ++seq, kind, real, group, home: { x: 0, z: 0 }, state: "standing", pieces, wobble: 0, scale, halfH: Math.max(0.6, (top * scale) / 2), marker: null, carrier: null, carry: null, carryT: 0 };
  }

  function showPlacementMarker(rec: Rec): void {
    clearMarker(rec);
    const g = new THREE.Group();
    const ring = new THREE.Mesh(ringGeo, markerRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(4.4, 4.4, 1);
    ring.position.y = 0.3;
    g.add(ring);
    const arrow = new THREE.Mesh(markerArrowGeo, markerArrowMat);
    arrow.rotation.x = Math.PI;
    arrow.scale.setScalar(2.2);
    arrow.position.y = 7.5;
    g.add(arrow);
    if (labelFor) {
      try {
        const label = createLabel(labelFor(rec.kind), { height: 2.6, tone: "amber" });
        label.position.y = 10.5;
        g.add(label);
      } catch {
        /* no DOM canvas (tests) */
      }
    }
    g.position.copy(rec.group.position);
    g.userData.t = 0;
    ctx.scene.add(g);
    rec.marker = g;
  }
  function clearMarker(rec: Rec): void {
    if (rec.marker) {
      ctx.scene.remove(rec.marker);
      rec.marker = null;
    }
  }

  function place(kind: ObjectKind, px: number, pz: number, opts: { real?: boolean; snap?: boolean } = {}): PlacedObject | null {
    const snap = opts.snap ?? true;
    const { x, z } = snap ? snapToPath(kind, px, pz, meander(px)) : { x: px, z: pz };
    if (!ctx.groundAt(x, z)) return null;
    const visitor = objects.filter((o) => !o.real);
    if (!opts.real && visitor.length >= MAX_OBJECTS) remove(visitor[0]);
    const rec = build(kind, !!opts.real);
    rec.home = { x, z };
    seat(rec, x, z);
    objects.push(rec);
    if (!opts.real) {
      lastVisitor = rec;
      showPlacementMarker(rec);
    }
    onEvent?.({ type: "placed", obj: rec });
    return rec;
  }

  function move(obj: PlacedObject, px: number, pz: number): void {
    const rec = objects.find((o) => o.id === obj.id);
    if (!rec || rec.state !== "standing") return;
    const { x, z } = snapToPath(rec.kind, px, pz, meander(px));
    if (!ctx.groundAt(x, z)) return;
    rec.home = { x, z };
    seat(rec, x, z);
    showPlacementMarker(rec);
  }

  function dropCarrier(rec: Rec): void {
    if (!rec.carrier) return;
    ctx.scene.attach(rec.group); // back to the scene at its world transform
    ctx.scene.remove(rec.carrier);
    rec.carrier = null;
    rec.carry = null;
  }

  function remove(obj: PlacedObject): void {
    const rec = objects.find((o) => o.id === obj.id);
    if (!rec) return;
    clearMarker(rec);
    dropCarrier(rec);
    for (const p of rec.pieces) ctx.scene.remove(p.mesh);
    ctx.scene.remove(rec.group);
    objects = objects.filter((o) => o !== rec);
    if (lastVisitor === rec) lastVisitor = null;
  }

  function restoreOne(rec: Rec): void {
    dropCarrier(rec);
    rec.state = "standing";
    rec.wobble = 0;
    rec.carryT = 0;
    rec.group.rotation.set(0, 0, 0);
    for (const p of rec.pieces) {
      p.mesh.position.copy(p.local);
      p.mesh.rotation.copy(p.baseRot);
      p.mesh.visible = true;
      rec.group.add(p.mesh); // pieces are re-parented to the scene when they break
      p.body.asleep = false;
      p.body.still = 0;
      p.body.v.x = p.body.v.y = p.body.v.z = 0;
      p.body.w.x = p.body.w.y = p.body.w.z = 0;
      p.body.rot.x = p.body.rot.y = p.body.rot.z = 0;
    }
    rec.group.visible = true;
    seat(rec, rec.home.x, rec.home.z);
  }

  /** The flood takes the whole object: lift it into a carrier pivot at its centre and let one body drive it. */
  function take(rec: Rec, flow: ReturnType<SceneCtx["flowAt"]>): void {
    rec.state = "taken";
    rec.carryT = 0;
    clearMarker(rec);
    rec.group.updateMatrixWorld(true);
    const c = catalogue(rec.kind);
    const carrier = new THREE.Group();
    const wp = rec.group.position;
    carrier.position.set(wp.x, wp.y + rec.halfH, wp.z);
    ctx.scene.add(carrier);
    carrier.attach(rec.group); // keeps the group's world transform; it now hangs halfH below the pivot
    rec.carrier = carrier;
    const body = makeBody({ x: carrier.position.x, y: carrier.position.y, z: carrier.position.z }, rec.halfH, massFactor(c.mass));
    kick(body, flow, hash(rec.id * 17), 0.9);
    body.v.y = Math.max(body.v.y, 2.5); // a visible lift-off
    rec.carry = body;
  }

  /** Break the carried object (or an anchored one where it stands) into pieces that inherit its motion. */
  function breakUp(rec: Rec, flow: ReturnType<SceneCtx["flowAt"]>): void {
    const inherit = rec.carry ? { ...rec.carry.v } : { x: 0, y: 0, z: 0 };
    const spin = rec.carry ? { ...rec.carry.w } : { x: 0, y: 0, z: 0 };
    rec.state = "broken";
    clearMarker(rec);
    rec.group.updateMatrixWorld(true);
    const wp = new THREE.Vector3();
    let i = 0;
    for (const p of rec.pieces) {
      p.mesh.getWorldPosition(wp);
      // re-parent to the scene at the same world transform; the body takes over from here
      ctx.scene.attach(p.mesh);
      p.body.p.x = wp.x;
      p.body.p.y = wp.y;
      p.body.p.z = wp.z;
      p.body.rot.x = p.mesh.rotation.x;
      p.body.rot.y = p.mesh.rotation.y;
      p.body.rot.z = p.mesh.rotation.z;
      p.body.v.x = inherit.x;
      p.body.v.y = inherit.y;
      p.body.v.z = inherit.z;
      p.body.w.x = spin.x;
      p.body.w.y = spin.y;
      p.body.w.z = spin.z;
      p.body.asleep = false;
      p.body.still = 0;
      kick(p.body, flow, hash(rec.id * 31 + i++), rec.carry ? 0.45 / (0.5 + p.mass) : 1 / (0.5 + p.mass));
    }
    dropCarrier(rec);
    rec.group.visible = false; // nothing is left at the origin but the stain
  }

  /** A piece has left the corridor band or fallen off the plate: hide it. */
  function offBand(b: Body): boolean {
    return b.p.x < BAND_X_MIN || Math.abs(b.p.z - meander(b.p.x)) > BAND_Z || b.p.y < -40;
  }

  function update(dt: number): ObjectEvent[] {
    const events: ObjectEvent[] = [];
    const sub = dt > 1 / 50 ? 2 : 1;
    for (const rec of objects) {
      const f = ctx.flowAt(rec.home.x, rec.home.z);
      if (rec.state === "standing") {
        if (isSwept(rec.kind, f.depth, f.speed)) {
          const p = rec.group.position;
          const ev: ObjectEvent = { type: "hit", obj: rec, x: p.x, y: p.y + 1.5, z: p.z };
          if (catalogue(rec.kind).mass === "anchored") breakUp(rec, f);
          else take(rec, f);
          events.push(ev);
          onEvent?.(ev);
        } else if (f.depth > 0.05) {
          rec.wobble += dt;
          rec.group.rotation.x = Math.sin(rec.wobble * 9) * Math.min(0.2, f.depth * 0.3);
        }
        if (rec.marker) {
          rec.marker.userData.t += dt;
          const t = rec.marker.userData.t as number;
          const s = 4.4 + Math.sin(t * 5) * 0.5;
          rec.marker.children[0].scale.set(s, s, 1);
          rec.marker.children[1].position.y = 7.5 + Math.sin(t * 6) * 0.8;
          if (t > 6) clearMarker(rec);
        }
        continue;
      }
      if (rec.state === "taken" && rec.carry && rec.carrier) {
        const b = rec.carry;
        let hard = false;
        for (let s = 0; s < sub; s++) hard = physicsStep(b, world, dt / sub) || hard;
        rec.carryT += dt;
        rec.carrier.position.set(b.p.x, b.p.y, b.p.z);
        rec.carrier.rotation.set(b.rot.x, b.rot.y, b.rot.z);
        const gone = offBand(b) || !ctx.groundAt(b.p.x, b.p.z);
        if ((hard && rec.carryT > CARRY_MIN_SECONDS) || rec.carryT > CARRY_SECONDS || gone || b.asleep) {
          breakUp(rec, ctx.flowAt(b.p.x, b.p.z));
        }
        continue;
      }
      // broken: integrate pieces
      let allAsleep = true;
      for (const p of rec.pieces) {
        if (!p.mesh.visible) continue;
        for (let s = 0; s < sub; s++) physicsStep(p.body, world, dt / sub);
        if (offBand(p.body)) {
          p.mesh.visible = false;
          p.body.asleep = true;
          continue;
        }
        p.mesh.position.set(p.body.p.x, p.body.p.y, p.body.p.z);
        p.mesh.rotation.set(p.body.rot.x, p.body.rot.y, p.body.rot.z);
        if (!p.body.asleep) allAsleep = false;
      }
      if (allAsleep && rec.state === "broken") rec.state = "wreck";
    }
    return events;
  }

  return {
    place,
    move,
    remove,
    restore() {
      for (const rec of objects) restoreOne(rec);
    },
    clearVisitor() {
      for (const rec of objects.slice()) if (!rec.real) remove(rec);
      for (const rec of objects) restoreOne(rec);
    },
    update,
    list: () => objects.slice(),
    last: () => lastVisitor,
    dispose() {
      for (const rec of objects) {
        clearMarker(rec);
        dropCarrier(rec);
        for (const p of rec.pieces) ctx.scene.remove(p.mesh);
        ctx.scene.remove(rec.group);
      }
      objects = [];
    },
  };
}

/** Deterministic 0…1 from an integer. */
function hash(i: number): number {
  let h = (i * 2654435761) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995) >>> 0;
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * Where a chip-tap places an object with no tap on the terrain: ahead of the front while a run is on (so the
 * visitor sees it hit within seconds), otherwise at Timure (km 4) — the first place the wave reaches on replay.
 */
export function defaultPlacement(frontX: number, running: boolean): { x: number; z: number } {
  const x = running && Number.isFinite(frontX) ? Math.min(frontX + 8, kmToX(96)) : kmToX(4);
  return { x, z: meander(x) + 0.9 };
}
