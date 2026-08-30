/**
 * TerrainModule (web/docs/16-corridor-v2-plan.md §2.1, §2.3): the corridor's ground with an elevation × slope
 * colour ramp, sky gradient + haze fog, three lights, the river ribbon, the flood-extent band, the two barrier
 * lakes, the collapsing rock with its dust puff, the mud stain the wave leaves, and the X-ray mode for side views.
 *
 *   ctx.bed ──► grid mesh (vertex colours via lib/terrain-colours) ──► scene
 *              river ribbon (bed-following strip)   extent band (translucent, over the banks)
 *              lakes (first drains with run.injectedFrac) · rock + dust (first rockFallSeconds of a run)
 *              stain(cell) darkens a vertex · setXray(t) fades the mesh and shows the ridge outline
 */
import * as THREE from "three";
import { LAKE_KMS, SCENE_D, SCENE_W, bedH, kmToX, meander } from "@/lib/corridor-terrain";
import { cellIndex } from "@/lib/flood-sim";
import { RAMP, SKY, WATER, noise3, terrainColour } from "@/lib/terrain-colours";
import type { RunInfo, SceneCtx, TerrainModule } from "./types";

const ROCK_FALL_SECONDS = 1.1;
const ROCK_START_Y = 30;
const DUST_N = 48;
const DUST_SECONDS = 1.3;

/** The grid geometry every sheet shares: vertices are the cell centres. */
export function makeGridGeometry(ctx: SceneCtx): { geo: THREE.PlaneGeometry; vertCell: Int32Array } {
  const { nx, nz, cell } = ctx.grid;
  const geo = new THREE.PlaneGeometry(SCENE_W - cell, SCENE_D - cell, nx - 1, nz - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const vertCell = new Int32Array(pos.count);
  for (let v = 0; v < pos.count; v++) vertCell[v] = cellIndex(ctx.grid, pos.getX(v), pos.getZ(v));
  return { geo, vertCell };
}

function skyTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, SKY.top);
  grad.addColorStop(0.55, SKY.mid);
  grad.addColorStop(1, SKY.horizon);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** A strip of quads following the channel, `width` wide, `lift` above the bed, optionally with edge lines. */
function channelStrip(ctx: SceneCtx, width: number, lift: number, kmFrom: number, kmTo: number, step = 0.6): THREE.BufferGeometry {
  const pts: number[] = [];
  const idx: number[] = [];
  let n = 0;
  for (let km = kmFrom; km <= kmTo; km += step) {
    const x = kmToX(km);
    const z = meander(x);
    // tangent along the channel → normal across it
    const x2 = kmToX(km + step);
    const tz = meander(x2) - z;
    const tx = x2 - x;
    const tl = Math.hypot(tx, tz) || 1;
    const nxv = -tz / tl;
    const nzv = tx / tl;
    for (const s of [-1, 1]) {
      const px = x + nxv * s * width * 0.5;
      const pz = z + nzv * s * width * 0.5;
      const g = ctx.groundAt(px, pz);
      pts.push(px, (g ? g.y : bedH(px, pz)) + lift, pz);
    }
    if (n > 0) {
      const a = (n - 1) * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    n++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export function createTerrain(ctx: SceneCtx): TerrainModule {
  const { scene, bed, grid } = ctx;
  const { nx, nz } = grid;

  // ---- sky, fog, lights ----------------------------------------------------------------------------------
  const sky = ctx.own(skyTexture());
  scene.background = sky;
  scene.fog = new THREE.Fog(new THREE.Color().setRGB(SKY.haze[0], SKY.haze[1], SKY.haze[2]), 180, 520);
  (scene.fog as THREE.Fog).color.setRGB(SKY.haze[0], SKY.haze[1], SKY.haze[2]);
  const hemi = new THREE.HemisphereLight(0xcfdcec, 0x8a7458, 1.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe6c4, 2.0); // low from the east: it was 08:37
  sun.position.set(70, 34, -18);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbfd0e6, 0.35);
  fill.position.set(-40, 30, 40);
  scene.add(fill);

  // ---- the ground -----------------------------------------------------------------------------------------
  const { geo, vertCell } = makeGridGeometry(ctx);
  // crop the plate to the corridor band (±22 units of the channel, east of the collapse site): the plane's empty
  // margins and the landslide wedge would otherwise dominate the fit and read as a grey slab
  {
    const full = (geo.index as THREE.BufferAttribute).array as Uint16Array | Uint32Array;
    const posA = geo.attributes.position as THREE.BufferAttribute;
    const keepV = new Uint8Array(posA.count);
    const xMin = kmToX(-11.5);
    for (let v = 0; v < posA.count; v++) {
      const x = posA.getX(v);
      const z = posA.getZ(v);
      keepV[v] = x >= xMin && Math.abs(z - meander(x)) <= 22 ? 1 : 0;
    }
    const kept: number[] = [];
    for (let t = 0; t < full.length; t += 3) {
      if (keepV[full[t]] && keepV[full[t + 1]] && keepV[full[t + 2]]) kept.push(full[t], full[t + 1], full[t + 2]);
    }
    geo.setIndex(kept);
  }
  ctx.own(geo);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let v = 0; v < pos.count; v++) pos.setY(v, vertCell[v] >= 0 ? bed[vertCell[v]] : 0);
  geo.computeVertexNormals();
  const base = new Float32Array(pos.count * 3); // the un-stained colour, kept for clearStain
  const col = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
  for (let v = 0; v < pos.count; v++) {
    const x = pos.getX(v);
    const z = pos.getZ(v);
    const g = ctx.groundAt(x, z);
    const slope = g ? 1 - g.ny : 0;
    const aspectNorth = g ? -g.nz : 0;
    const [r, gg, b] = terrainColour(pos.getY(v), slope, aspectNorth, noise3(x, z));
    base[v * 3] = r;
    base[v * 3 + 1] = gg;
    base[v * 3 + 2] = b;
    col.setXYZ(v, r, gg, b);
  }
  geo.setAttribute("color", col);
  const mat = ctx.own(new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 }));
  const terrain = new THREE.Mesh(geo, mat);
  terrain.renderOrder = 0;
  scene.add(terrain);

  // ridge outline for X-ray (ink edges, faded in with the X-ray amount)
  const edgeGeo = ctx.own(new THREE.EdgesGeometry(geo, 28));
  const edgeMat = ctx.own(new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0, depthWrite: false }));
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  edges.visible = false;
  edges.renderOrder = 1;
  scene.add(edges);

  // ---- river ribbon (the river before the wave) + extent band (the known flood path) ---------------------
  const riverGeo = ctx.own(channelStrip(ctx, 1.1, 0.12, -10, 110));
  const riverMat = ctx.own(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color().setRGB(WATER.river[0], WATER.river[1], WATER.river[2]),
      roughness: 0.25,
      metalness: 0.15,
      emissive: new THREE.Color().setRGB(WATER.river[0], WATER.river[1], WATER.river[2]),
      emissiveIntensity: 0.18,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.renderOrder = 2;
  scene.add(river);
  // foam edge lines
  const foamGeo = ctx.own(channelStrip(ctx, 1.3, 0.14, -10, 110));
  const foamMat = ctx.own(new THREE.LineBasicMaterial({ color: new THREE.Color().setRGB(WATER.riverFoam[0], WATER.riverFoam[1], WATER.riverFoam[2]), transparent: true, opacity: 0.55 }));
  const foamEdges = new THREE.LineSegments(ctx.own(new THREE.EdgesGeometry(foamGeo, 60)), foamMat);
  foamEdges.renderOrder = 3;
  scene.add(foamEdges);

  const bandGeo = ctx.own(channelStrip(ctx, 5.2, 0.08, -10, 110, 0.8));
  const bandMat = ctx.own(
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(WATER.extent[0], WATER.extent[1], WATER.extent[2]),
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
  );
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.renderOrder = 1;
  scene.add(band);

  // ---- barrier lakes ---------------------------------------------------------------------------------------
  const lakeGeo = ctx.own(new THREE.CylinderGeometry(2.1, 2.1, 0.35, 12));
  const lakeMat = ctx.own(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color().setRGB(WATER.lake[0], WATER.lake[1], WATER.lake[2]),
      emissive: new THREE.Color().setRGB(WATER.lake[0], WATER.lake[1], WATER.lake[2]),
      emissiveIntensity: 0.4,
      roughness: 0.3,
    }),
  );
  const lakes: THREE.Mesh[] = [];
  for (const km of LAKE_KMS) {
    const x = kmToX(km);
    const z = meander(x);
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    const g = ctx.groundAt(x, z);
    lake.position.set(x, (g?.y ?? bedH(x, z)) + 0.55, z);
    lake.renderOrder = 4;
    scene.add(lake);
    lakes.push(lake);
  }
  const lakePos = lakes[0].position.clone();

  // ---- the collapse: rock + dust ---------------------------------------------------------------------------
  const rockGeo = ctx.own(new THREE.DodecahedronGeometry(3, 0));
  const rockMat = ctx.own(new THREE.MeshStandardMaterial({ color: 0x4a4744, flatShading: true, roughness: 1 }));
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.visible = false;
  scene.add(rock);
  const dustPos = new Float32Array(DUST_N * 3);
  const dustVel = new Float32Array(DUST_N * 3);
  const dustGeo = ctx.own(new THREE.BufferGeometry());
  const dustAttr = new THREE.BufferAttribute(dustPos, 3);
  dustGeo.setAttribute("position", dustAttr);
  const dustMat = ctx.own(new THREE.PointsMaterial({ color: 0xbfb6aa, size: 2.6, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false }));
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.visible = false;
  dust.frustumCulled = false;
  scene.add(dust);
  let dustT = -1; // seconds since the impact; −1 = idle
  let rockWasFalling = false;

  const startDust = () => {
    for (let i = 0; i < DUST_N; i++) {
      const a = (i / DUST_N) * Math.PI * 2;
      const sp = 3 + (i % 5) * 1.3;
      dustPos[i * 3] = lakePos.x + Math.cos(a) * 0.8;
      dustPos[i * 3 + 1] = lakePos.y + 0.4;
      dustPos[i * 3 + 2] = lakePos.z + Math.sin(a) * 0.8;
      dustVel[i * 3] = Math.cos(a) * sp;
      dustVel[i * 3 + 1] = 4 + (i % 3) * 2.2;
      dustVel[i * 3 + 2] = Math.sin(a) * sp;
    }
    dustT = 0;
    dust.visible = true;
    dustAttr.needsUpdate = true;
  };

  // ---- stain ------------------------------------------------------------------------------------------------
  const stained = new Uint8Array(nx * nz);
  const cellVert = new Int32Array(nx * nz).fill(-1);
  for (let v = 0; v < pos.count; v++) if (vertCell[v] >= 0) cellVert[vertCell[v]] = v;
  let stainDirty = false;
  const stain = (cell: number) => {
    if (cell < 0 || cell >= stained.length || stained[cell]) return;
    stained[cell] = 1;
    const v = cellVert[cell];
    if (v < 0) return;
    // darken toward the stain colour, keeping some of the ground's own hue
    const r = base[v * 3] * 0.35 + RAMP.stain[0] * 0.65;
    const g = base[v * 3 + 1] * 0.35 + RAMP.stain[1] * 0.65;
    const b = base[v * 3 + 2] * 0.35 + RAMP.stain[2] * 0.65;
    col.setXYZ(v, r, g, b);
    stainDirty = true;
  };
  const clearStain = () => {
    stained.fill(0);
    for (let v = 0; v < pos.count; v++) col.setXYZ(v, base[v * 3], base[v * 3 + 1], base[v * 3 + 2]);
    col.needsUpdate = true;
  };

  // ---- X-ray ---------------------------------------------------------------------------------------------------
  let xray = 0;
  const setXray = (t: number) => {
    const k = Math.max(0, Math.min(1, t));
    if (Math.abs(k - xray) < 0.005) return;
    xray = k;
    const transparent = k > 0.02;
    if (mat.transparent !== transparent) {
      mat.transparent = transparent;
      mat.needsUpdate = true;
    }
    mat.opacity = 1 - 0.6 * k;
    mat.depthWrite = k < 0.5; // let the wave show through the far wall when mostly transparent
    edges.visible = k > 0.05;
    edgeMat.opacity = 0.55 * k;
  };

  // ---- per-frame ---------------------------------------------------------------------------------------------
  const update = (dt: number, run: RunInfo) => {
    if (stainDirty) {
      col.needsUpdate = true;
      stainDirty = false;
    }
    // lake drains as the breach empties it; the second lake stays
    lakes[0].scale.y = run.state === "idle" ? 1 : Math.max(0.08, 1 - run.injectedFrac);
    // rock fall during the first rockFallSeconds of a run
    const t = run.runT;
    const falling = run.state === "running" && t < ROCK_FALL_SECONDS;
    if (falling) {
      rock.visible = true;
      const u = Math.min(1, t / ROCK_FALL_SECONDS);
      rock.position.set(lakePos.x - 2.2, lakePos.y + ROCK_START_Y * (1 - u * u), lakePos.z - 0.6);
      rock.rotation.x = t * 3.1;
      rock.rotation.z = t * 2.3;
      rockWasFalling = true;
    } else {
      if (rockWasFalling && run.state === "running") {
        // impact
        startDust();
        rockWasFalling = false;
      }
      rock.visible = false;
      if (run.state !== "running") rockWasFalling = false;
    }
    // the lake heaves after the impact
    const since = t - ROCK_FALL_SECONDS;
    const heave = run.state === "running" && since > 0 && since < 2 ? 1 + 0.9 * Math.exp(-since * 4) : 1;
    lakes[0].scale.x = heave;
    lakes[0].scale.z = heave;
    // dust
    if (dustT >= 0) {
      dustT += dt;
      for (let i = 0; i < DUST_N; i++) {
        dustVel[i * 3 + 1] -= 9 * dt;
        dustVel[i * 3] *= 1 - 1.4 * dt;
        dustVel[i * 3 + 2] *= 1 - 1.4 * dt;
        dustPos[i * 3] += dustVel[i * 3] * dt;
        dustPos[i * 3 + 1] += dustVel[i * 3 + 1] * dt;
        dustPos[i * 3 + 2] += dustVel[i * 3 + 2] * dt;
        const g = ctx.groundAt(dustPos[i * 3], dustPos[i * 3 + 2]);
        if (g && dustPos[i * 3 + 1] < g.y + 0.3) dustPos[i * 3 + 1] = g.y + 0.3;
      }
      dustAttr.needsUpdate = true;
      dustMat.opacity = 0.85 * Math.max(0, 1 - dustT / DUST_SECONDS);
      if (dustT > DUST_SECONDS) {
        dustT = -1;
        dust.visible = false;
      }
    }
    // river shimmer: a slow emissive pulse (cheap, reads as moving water)
    riverMat.emissiveIntensity = 0.16 + 0.06 * Math.sin(ctx.time * 1.7);
  };

  return {
    terrain,
    lakePos,
    rockFallSeconds: ROCK_FALL_SECONDS,
    update,
    stain,
    clearStain,
    setXray,
    dispose() {
      scene.remove(terrain, edges, river, foamEdges, band, rock, dust, hemi, sun, fill);
      for (const l of lakes) scene.remove(l);
      scene.background = null;
      scene.fog = null;
    },
  };
}
