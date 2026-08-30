/**
 * WaterModule (web/docs/16-corridor-v2-plan.md §2.1, §2.3): the wet-only water sheet over the shared grid, three
 * mud tones + foam by speed + a crest band where the sheet drops ahead, turbulence jitter, the terrain stain,
 * foam spray at the front, and debris riding the surface.
 *
 *   sim.depth/vx/vz ──► sheet: vertex y = bed + depth·visAmp (+ jitter), colour by depth/speed/crest,
 *                              index rebuilt each frame with only the triangles that touch a wet vertex
 *                       spray: 900-point pool spawned in fast deep cells, ballistic, 0.5–1 s
 *                       debris: 120 instanced boxes riding the surface with the flow (cap 6 u/s), spinning
 */
import * as THREE from "three";
import { BREACH } from "@/lib/flood-sim";

/** A soft round dot (radial gradient) so spray reads as droplets, not squares. */
function sprayTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.75)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}
import { cellCentre } from "@/lib/flood-sim";
import { WATER } from "@/lib/terrain-colours";
import { makeGridGeometry } from "./terrain";
import type { SceneCtx, TerrainModule, WaterModule } from "./types";

const WET = 0.05;
const STAIN_DEPTH = 0.25;

export function createWater(ctx: SceneCtx, terrain: TerrainModule): WaterModule {
  const { scene, sim, bed, grid } = ctx;
  const { cell } = grid;
  const low = ctx.quality.low;
  const SPRAY_N = low ? 450 : 900;
  const DEBRIS_N = low ? 0 : 120;

  // ---- the sheet ----------------------------------------------------------------------------------------------
  const { geo, vertCell } = makeGridGeometry(ctx);
  ctx.own(geo);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
  geo.setAttribute("color", col);
  const fullIndex = (geo.index as THREE.BufferAttribute).array as Uint16Array | Uint32Array;
  const wetIndex = new Uint32Array(fullIndex.length);
  geo.setIndex(new THREE.BufferAttribute(wetIndex, 1));
  const wetV = new Uint8Array(pos.count);
  const vx0 = new Float32Array(pos.count); // vertex x/z cached for the jitter
  const vz0 = new Float32Array(pos.count);
  for (let v = 0; v < pos.count; v++) {
    const c = vertCell[v];
    pos.setY(v, c >= 0 ? bed[c] : 0);
    col.setXYZ(v, WATER.mudShallow[0], WATER.mudShallow[1], WATER.mudShallow[2]);
    vx0[v] = pos.getX(v);
    vz0[v] = pos.getZ(v);
  }
  const mat = ctx.own(
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.42,
      metalness: 0.12,
      emissive: 0x2a1a0c,
      emissiveIntensity: 0.28,
      transparent: false, opacity: 1,
    }),
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  scene.add(mesh);

  /** deep lake blue (#1b4a8f) and the run over which it turns to mud (scene units from the breach) */
  const BLUE: [number, number, number] = [0.106, 0.29, 0.561];
  const BLUE_X0 = BREACH.x + 6;
  const BROWN_RUN = 42;
  const nx = ctx.grid.nx;
  const deep = WATER.mudDeep;
  const body = WATER.mudBody;
  const shallow = WATER.mudShallow;
  const foam = WATER.foam;
  let anyWet = false;

  const updateSheet = () => {
    const d = sim.depth;
    const vx = sim.vx;
    const vz = sim.vz;
    const t = ctx.time;
    const amp = ctx.visAmp;
    anyWet = false;
    for (let v = 0; v < pos.count; v++) {
      const c = vertCell[v];
      if (c < 0) {
        wetV[v] = 0;
        continue;
      }
      // dilate by one cell so the sheet reads as a flood from the overview, not a hairline
      const dep0 = d[c];
      const dep = Math.max(dep0, 0.85 * Math.max(c > 0 ? d[c - 1] : 0, c + 1 < d.length ? d[c + 1] : 0, c >= nx ? d[c - nx] : 0, c + nx < d.length ? d[c + nx] : 0));
      if (dep > WET) {
        anyWet = true;
        wetV[v] = 1;
        if (dep > STAIN_DEPTH) terrain.stain(c);
        const jitter = 0.12 * Math.sin(vx0[v] * 1.7 + t * 9) * Math.sin(vz0[v] * 2.3 - t * 7) * Math.min(1, dep);
        pos.setY(v, bed[c] + dep * amp + jitter);
        const speed = Math.hypot(vx[c], vz[c]);
        // depth ramp: shallow → body → deep
        let r: number;
        let g: number;
        let b: number;
        if (dep < 1.2) {
          const k = dep / 1.2;
          r = shallow[0] + (body[0] - shallow[0]) * k;
          g = shallow[1] + (body[1] - shallow[1]) * k;
          b = shallow[2] + (body[2] - shallow[2]) * k;
        } else {
          const k = Math.min(1, (dep - 1.2) / 3.5);
          r = body[0] + (deep[0] - body[0]) * k;
          g = body[1] + (deep[1] - body[1]) * k;
          b = body[2] + (deep[2] - body[2]) * k;
        }
        // colour by sediment: deep blue where the lake water leaves the breach, browning as it scours the corridor
        // (owner's call: blue contrasts with everything else; brown says how much it has picked up)
        const sed = Math.min(1, Math.max(0, (vx0[v] - BLUE_X0) / BROWN_RUN));
        const bluek = 1 - sed * sed;
        r += (BLUE[0] - r) * bluek;
        g += (BLUE[1] - g) * bluek;
        b += (BLUE[2] - b) * bluek;
        // crest band: the sheet drops steeply within the next two cells downstream
        const c1 = c + 1 < d.length ? d[c + 1] : dep;
        const c2 = c + 2 < d.length ? d[c + 2] : c1;
        const drop = Math.max(dep - c1, dep - c2);
        const crest = Math.min(1, Math.max(0, (drop - 0.35) / 1.4));
        const fast = Math.min(1, Math.max(0, (speed - 18) / 22)) * 0.35;
        const f = Math.max(fast, crest * 0.85);
        if (f > 0) {
          r += (foam[0] - r) * f;
          g += (foam[1] - g) * f;
          b += (foam[2] - b) * f;
        }
        col.setXYZ(v, r, g, b);
      } else {
        wetV[v] = 0;
        pos.setY(v, bed[c]);
        col.setXYZ(v, shallow[0], shallow[1], shallow[2]);
      }
    }
    mesh.visible = anyWet;
    if (!anyWet) return;
    let n = 0;
    for (let i = 0; i < fullIndex.length; i += 3) {
      const a = fullIndex[i];
      const b2 = fullIndex[i + 1];
      const c3 = fullIndex[i + 2];
      if (wetV[a] | wetV[b2] | wetV[c3]) {
        wetIndex[n++] = a;
        wetIndex[n++] = b2;
        wetIndex[n++] = c3;
      }
    }
    geo.setDrawRange(0, n);
    (geo.index as THREE.BufferAttribute).needsUpdate = true;
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.computeVertexNormals();
  };

  // ---- spray -----------------------------------------------------------------------------------------------------
  const sprayPos = new Float32Array(SPRAY_N * 3);
  const sprayVel = new Float32Array(SPRAY_N * 3);
  const sprayLife = new Float32Array(SPRAY_N);
  const sprayGeo = ctx.own(new THREE.BufferGeometry());
  const sprayAttr = new THREE.BufferAttribute(sprayPos, 3);
  sprayGeo.setAttribute("position", sprayAttr);
  sprayGeo.setDrawRange(0, 0);
  const sprayMat = ctx.own(new THREE.PointsMaterial({ color: 0xf6f1e8, size: 0.8, map: sprayTexture() ?? undefined, alphaTest: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.92, depthWrite: false }));
  const spray = new THREE.Points(sprayGeo, sprayMat);
  spray.frustumCulled = false;
  spray.visible = false;
  spray.renderOrder = 6;
  scene.add(spray);
  let sprayCursor = 0;
  const updateSpray = (dt: number) => {
    const d = sim.depth;
    const vx = sim.vx;
    const vz = sim.vz;
    let spawned = 0;
    for (let i = (ctx.frame * 7) % 11; i < d.length && spawned < 48; i += 11) {
      const dep = d[i];
      if (dep < 0.9) continue;
      const sp = Math.hypot(vx[i], vz[i]);
      if (sp < 12) continue;
      const k = sprayCursor;
      sprayCursor = (sprayCursor + 1) % SPRAY_N;
      const { x, z } = cellCentre(grid, i);
      sprayPos[k * 3] = x + (Math.random() - 0.5) * cell;
      sprayPos[k * 3 + 1] = bed[i] + dep * ctx.visAmp + 0.3;
      sprayPos[k * 3 + 2] = z + (Math.random() - 0.5) * cell;
      sprayVel[k * 3] = vx[i] * 0.15 + (Math.random() - 0.5) * 2.4;
      sprayVel[k * 3 + 1] = 3.5 + Math.random() * 4.5;
      sprayVel[k * 3 + 2] = vz[i] * 0.15 + (Math.random() - 0.5) * 2.4;
      sprayLife[k] = 0.5 + Math.random() * 0.5;
      spawned++;
    }
    let n = 0;
    for (let k = 0; k < SPRAY_N; k++) {
      if (sprayLife[k] <= 0) continue;
      sprayLife[k] -= dt;
      sprayVel[k * 3 + 1] -= 12 * dt;
      sprayPos[k * 3] += sprayVel[k * 3] * dt;
      sprayPos[k * 3 + 1] += sprayVel[k * 3 + 1] * dt;
      sprayPos[k * 3 + 2] += sprayVel[k * 3 + 2] * dt;
      if (k !== n) {
        sprayPos[n * 3] = sprayPos[k * 3];
        sprayPos[n * 3 + 1] = sprayPos[k * 3 + 1];
        sprayPos[n * 3 + 2] = sprayPos[k * 3 + 2];
        sprayVel[n * 3] = sprayVel[k * 3];
        sprayVel[n * 3 + 1] = sprayVel[k * 3 + 1];
        sprayVel[n * 3 + 2] = sprayVel[k * 3 + 2];
        sprayLife[n] = sprayLife[k];
        sprayLife[k] = 0;
      }
      n++;
    }
    sprayCursor = n % SPRAY_N;
    sprayGeo.setDrawRange(0, n);
    sprayAttr.needsUpdate = true;
    spray.visible = n > 0;
  };

  // ---- debris ----------------------------------------------------------------------------------------------------
  const debGeo = ctx.own(new THREE.BoxGeometry(0.5, 0.3, 0.9));
  const debMat = ctx.own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }));
  const debris = new THREE.InstancedMesh(debGeo, debMat, Math.max(1, DEBRIS_N));
  debris.count = 0;
  debris.frustumCulled = false;
  debris.visible = false;
  debris.renderOrder = 6;
  const debColour = new THREE.Color();
  const inkC = new THREE.Color(0x1a1a1a);
  const trunkC = new THREE.Color(0x5a3b1c);
  for (let i = 0; i < DEBRIS_N; i++) debris.setColorAt(i, i % 3 === 0 ? debColour.copy(inkC) : debColour.copy(trunkC));
  if (debris.instanceColor) debris.instanceColor.needsUpdate = true;
  scene.add(debris);
  const debX = new Float32Array(DEBRIS_N);
  const debZ = new Float32Array(DEBRIS_N);
  const debRot = new Float32Array(DEBRIS_N * 3);
  const debSpin = new Float32Array(DEBRIS_N * 3);
  const debAlive = new Uint8Array(DEBRIS_N);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p3 = new THREE.Vector3();
  const s3 = new THREE.Vector3(1, 1, 1);
  let debCursor = 0;
  const updateDebris = (dt: number) => {
    if (DEBRIS_N === 0) return;
    const d = sim.depth;
    const vx = sim.vx;
    const vz = sim.vz;
    // spawn a few per frame in fast, deep cells
    let spawned = 0;
    for (let i = (ctx.frame * 5) % 13; i < d.length && spawned < 3; i += 13) {
      if (d[i] < 0.6) continue;
      if (Math.hypot(vx[i], vz[i]) < 4) continue;
      const k = debCursor;
      debCursor = (debCursor + 1) % DEBRIS_N;
      if (debAlive[k]) continue;
      const { x, z } = cellCentre(grid, i);
      debX[k] = x + (Math.random() - 0.5) * cell;
      debZ[k] = z + (Math.random() - 0.5) * cell;
      debRot[k * 3] = Math.random() * 6.28;
      debRot[k * 3 + 1] = Math.random() * 6.28;
      debRot[k * 3 + 2] = Math.random() * 6.28;
      debSpin[k * 3] = (Math.random() - 0.5) * 4;
      debSpin[k * 3 + 1] = (Math.random() - 0.5) * 4;
      debSpin[k * 3 + 2] = (Math.random() - 0.5) * 4;
      debAlive[k] = 1;
      spawned++;
    }
    let n = 0;
    for (let k = 0; k < DEBRIS_N; k++) {
      if (!debAlive[k]) continue;
      const f = ctx.flowAt(debX[k], debZ[k]);
      if (f.depth < 0.12) {
        debAlive[k] = 0; // beached
        continue;
      }
      const sp = f.speed || 1;
      const cap = Math.min(6, sp);
      debX[k] += (f.vx / sp) * cap * dt;
      debZ[k] += (f.vz / sp) * cap * dt;
      const g = ctx.groundAt(debX[k], debZ[k]);
      if (!g) {
        debAlive[k] = 0;
        continue;
      }
      debRot[k * 3] += debSpin[k * 3] * dt;
      debRot[k * 3 + 1] += debSpin[k * 3 + 1] * dt;
      debRot[k * 3 + 2] += debSpin[k * 3 + 2] * dt;
      const y = Math.max(g.y + 0.15, f.surface - 0.1);
      e.set(debRot[k * 3], debRot[k * 3 + 1], debRot[k * 3 + 2]);
      q.setFromEuler(e);
      p3.set(debX[k], y, debZ[k]);
      m4.compose(p3, q, s3);
      debris.setMatrixAt(n, m4);
      if (debris.instanceColor) debris.setColorAt(n, k % 3 === 0 ? debColour.copy(inkC) : debColour.copy(trunkC));
      n++;
    }
    debris.count = n;
    debris.visible = n > 0;
    debris.instanceMatrix.needsUpdate = true;
    if (debris.instanceColor) debris.instanceColor.needsUpdate = true;
  };

  const reset = () => {
    sprayLife.fill(0);
    sprayGeo.setDrawRange(0, 0);
    spray.visible = false;
    debAlive.fill(0);
    debris.count = 0;
    debris.visible = false;
    for (let v = 0; v < pos.count; v++) {
      wetV[v] = 0;
      const c = vertCell[v];
      pos.setY(v, c >= 0 ? bed[c] : 0);
    }
    geo.setDrawRange(0, 0);
    pos.needsUpdate = true;
    mesh.visible = false;
    anyWet = false;
  };

  return {
    mesh,
    visible: () => mesh.visible,
    update(dt: number) {
      const every = low ? 2 : 1;
      if (ctx.frame % every === 0) updateSheet();
      if (!low) updateSpray(dt);
      updateDebris(dt);
    },
    reset,
    drawCount: () => geo.drawRange.count,
    sprayCount: () => sprayGeo.drawRange.count,
    dispose() {
      scene.remove(mesh, spray, debris);
      debris.dispose();
    },
  };
}
