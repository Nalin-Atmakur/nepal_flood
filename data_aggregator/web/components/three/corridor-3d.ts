/**
 * Stylised low-poly Bhote Koshi / Trishuli corridor — a verbatim port of
 * design/Design form preferences/corridor-3d.js (light theme only) to a plain TypeScript module.
 * No React, no DOM custom element: CorridorScene.tsx mounts it into a host element after first paint.
 *
 * Procedural terrain, flood channel draped on the terrain, two barrier lakes upstream, one
 * cylinder + sphere marker per place (height ∝ √reported, amber when mostly unknown).
 */
import * as THREE from "three";
import type { CorridorPlace } from "@/lib/corridor";

export type MountOptions = {
  places: CorridorPlace[];
  /** Called on a tap/click: the picked place (or null on empty terrain) and the pointer position relative to `el`. */
  onPick?: (place: CorridorPlace | null, x: number, y: number) => void;
};

export type CorridorHandle = {
  dispose(): void;
  setPlaces(places: CorridorPlace[]): void;
};

const UNKNOWN_C = 0xb06a00;
const CONFIRMED_C = 0x1c7a45;
const FLOOD_C = 0xec3013;
const LAKE_C = 0x5b7f8f;
const BG = 0xe9e7e5;
const TER = 0xdedbd8;

// River path: x = km along corridor (-10..74 mapped to -42..42), z meander
export const kmToX = (km: number): number => (km - 32) * 0.84;
export const meander = (x: number): number => Math.sin(x * 0.16) * 3.2 + Math.sin(x * 0.043 + 1.2) * 5;
/** north high → south low, 1.5x exaggerated */
export const baseElev = (x: number): number => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35);
export const n2 = (x: number, z: number): number =>
  Math.sin(x * 0.35 + z * 0.9) * Math.cos(z * 0.5 - x * 0.21) + 0.6 * Math.sin(x * 0.9 + 2.3) * Math.sin(z * 1.7);
export const terrainH = (x: number, z: number): number => {
  const d = Math.abs(z - meander(x));
  const wall = Math.min(1, d / (5 + (x + 42) * 0.1)); // gorge narrow in north, opens south
  const ridge = Math.pow(wall, 1.6) * (10 + baseElev(x) * 1.5) + n2(x, z) * (0.7 + wall * 1.8);
  return baseElev(x) + ridge - 1.2;
};

/** Marker position and height for a place — shared with the fallback PNG script's maths. */
export function markerFor(p: CorridorPlace): { x: number; z: number; y: number; h: number } {
  const x = kmToX(p.km);
  const z = meander(x) + p.side * (p.off ? 1 : 2.2);
  return { x, z, y: terrainH(x, z), h: 1.5 + Math.sqrt(Math.max(0, p.reported)) * 0.32 };
}

type PickMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;touch-action:none;display:block";
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 70, 160);

  // Terrain
  const geo = new THREE.PlaneGeometry(96, 52, 150, 80);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, terrainH(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ color: TER, flatShading: true, roughness: 1 });
  const terrain = new THREE.Mesh(geo, terrainMat);
  scene.add(terrain);

  // Flood channel draped on terrain
  const pts: THREE.Vector3[] = [];
  for (let km = -10; km <= 74; km += 0.8) {
    const x = kmToX(km);
    const z = meander(x);
    pts.push(new THREE.Vector3(x, terrainH(x, z) + 0.35, z));
  }
  const floodGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.5, 6);
  const floodMat = new THREE.MeshStandardMaterial({ color: FLOOD_C, emissive: FLOOD_C, emissiveIntensity: 0.55, roughness: 0.6 });
  scene.add(new THREE.Mesh(floodGeo, floodMat));

  // Barrier lakes upstream
  const lakeGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 10);
  const lakeMat = new THREE.MeshStandardMaterial({ color: LAKE_C, emissive: LAKE_C, emissiveIntensity: 0.5 });
  for (const km of [-8, -6]) {
    const x = kmToX(km);
    const z = meander(x);
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.position.set(x, terrainH(x, z) + 0.5, z);
    scene.add(lake);
  }

  // Markers (rebuilt by setPlaces)
  const capGeo = new THREE.SphereGeometry(0.8, 10, 8);
  let markers: PickMesh[] = [];
  const clearMarkers = () => {
    for (const m of markers) {
      scene.remove(m);
      if (m.geometry !== capGeo) m.geometry.dispose();
    }
    // stem + cap share one material per place; dispose each once
    const seen = new Set<THREE.Material>();
    for (const m of markers) {
      if (!seen.has(m.material)) {
        seen.add(m.material);
        m.material.dispose();
      }
    }
    markers = [];
  };
  const buildMarkers = (places: CorridorPlace[]) => {
    clearMarkers();
    for (const p of places) {
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
    }
  };
  buildMarkers(opts.places);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xfff4ea, 1.4);
  sun.position.set(-30, 50, 25);
  scene.add(sun);

  // Camera + minimal orbit
  const cam = new THREE.PerspectiveCamera(42, W() / H(), 0.5, 400);
  let az = -0.9;
  let pol = 0.98;
  let rad = 62;
  let drift = true;
  const target = new THREE.Vector3(0, 4, 0);
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
  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    v2.set((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1);
    ray.setFromCamera(v2, cam);
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

  let raf = 0;
  let alive = true;
  const tick = () => {
    if (!alive) return;
    if (drift) az += 0.0009;
    setCam();
    renderer.render(scene, cam);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return {
    setPlaces(places: CorridorPlace[]) {
      if (!alive) return;
      buildMarkers(places);
    },
    dispose() {
      if (!alive) return;
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("wheel", onWheel);
      clearMarkers();
      capGeo.dispose();
      geo.dispose();
      terrainMat.dispose();
      floodGeo.dispose();
      floodMat.dispose();
      lakeGeo.dispose();
      lakeMat.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
