#!/usr/bin/env node
/**
 * Pre-renders public/corridor-fallback.png (1280×480, < 90 KB) — the static stand-in for the 3D corridor on 2G/3G
 * or when WebGL fails (Component Sheet §06). Same landscape, colour ramp and overview camera as the live scene
 * (corridor v2, 30 Aug), projected to 2D and drawn as a low-poly SVG, then rasterised with sharp into a small
 * palette PNG. No text inside the image: the legend and caption live in the parent block. Run with `npm run fallback`.
 *
 * This is plain ESM and cannot import the TypeScript, so the maths below are copied verbatim from
 *   lib/corridor-terrain.ts   (v2 landscape, 30 Aug 2026)
 *   lib/terrain-colours.ts    (ramp, sky, water palette)
 *   lib/corridor-camera.ts    (corridorBounds / boxFits / fitCamera)
 * Keep them in step when those change.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/corridor-fallback.png");
const W = 1280;
const H = 480;
const LIMIT = 90_000;

// ---- lib/corridor-terrain.ts (v2 landscape, 30 Aug 2026) ---------------------------------------------------
const SCENE_W = 96, SCENE_D = 52;
const KM_LINEAR_END = 74, KM_SCALE = 0.84, KM_TAIL_SCALE = 0.15;
const kmToX = (km) => (km <= KM_LINEAR_END ? (km - 32) * KM_SCALE : (KM_LINEAR_END - 32) * KM_SCALE + (km - KM_LINEAR_END) * KM_TAIL_SCALE);
const meander = (x) => Math.sin(x * 0.16) * 3.2 + Math.sin(x * 0.043 + 1.2) * 5;
const along = (x) => Math.max(0, Math.min(1, (x + 42) / 84));
const smooth = (t) => t * t * (3 - 2 * t);
const baseElev = (x) => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35);
const floorHalfWidth = (x) => 1.0 + 6.0 * smooth(along(x));
const wallHeight = (x) => 26 - 20 * smooth(along(x));
const wallRun = (x) => 6 + 14 * smooth(along(x));
const ridges = (x, z) => Math.sin(x * 0.11 + z * 0.07) * Math.cos(z * 0.13 - x * 0.05) * 3.2 + Math.sin(x * 0.23 + 1.7) * Math.sin(z * 0.19 + 0.4) * 1.6;
const sideValleys = (x, z) => { const g = Math.max(0, Math.cos(x * 0.45 + z * 0.08)); return -Math.pow(g, 6) * 4.5; };
const n2 = (x, z) => Math.sin(x * 0.9 + z * 1.3) * Math.cos(z * 0.7 - x * 0.4) * 0.45;
const terrainH = (x, z) => {
  const d = Math.abs(z - meander(x));
  const floor = baseElev(x);
  const half = floorHalfWidth(x);
  const run = wallRun(x);
  const t = Math.max(0, Math.min(1, (d - half) / run));
  const wall = smooth(t) * wallHeight(x);
  const relief = (ridges(x, z) + sideValleys(x, z)) * t + n2(x, z) * (0.3 + 0.7 * t);
  const peaks = d > half + run ? (d - half - run) * 0.35 * (1 - along(x)) : 0;
  return floor + wall + relief + peaks;
};
const LAKE_KMS = [-8, -6];
const DAM_KM = -9.5;
const damH = (x) => { const xd = kmToX(DAM_KM); return x < xd ? Math.min(9, (xd - x) * 3) : 0; };
const bedH = (x, z) => { const dz = z - meander(x); return terrainH(x, z) - 1.2 * Math.exp(-(dz * dz) / 4.0) + damH(x); };
// the rendered plate is cropped to the corridor band (components/three/scene/terrain.ts)
const CROP_X_MIN = kmToX(-11.5), CROP_Z = 22;

// ---- lib/terrain-colours.ts ---------------------------------------------------------------------------------
const hexRGB = (h) => { const n = parseInt(h.replace("#", ""), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const RAMP = { silt: hexRGB("#8f7a5a"), terrace: hexRGB("#6f8f4f"), forest: hexRGB("#3f6b3a"), scree: hexRGB("#8d8a84"), rock: hexRGB("#6b6660"), snow: hexRGB("#f2f4f7"), rim: hexRGB("#ffe9c8") };
const SNOW_LINE = 36, ROCK_SLOPE = 0.72, SCREE_SLOPE = 0.52;
const mixRGB = (a, b, t) => { const k = Math.max(0, Math.min(1, t)); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; };
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const band = (e, lo, hi) => { if (hi <= lo) return e >= hi ? 1 : 0; const t = clamp01((e - lo) / (hi - lo)); return t * t * (3 - 2 * t); };
const noise3 = (x, z) => { let sum = 0, amp = 0.55, f = 0.23; for (let o = 0; o < 3; o++) { sum += amp * Math.sin(x * f + 1.7 * o) * Math.cos(z * f * 1.3 - 0.9 * o + Math.sin(x * f * 0.5)); amp *= 0.5; f *= 2.1; } return Math.max(-1, Math.min(1, sum / 0.9625)); };
function terrainColour(elev, slope, aspectNorth = 0, noise = 0) {
  const e = elev + noise * 1.6;
  let c = RAMP.silt;
  c = mixRGB(c, RAMP.terrace, band(e, 2.0, 3.6));
  c = mixRGB(c, RAMP.forest, band(e, 6.0, 8.5));
  c = mixRGB(c, RAMP.scree, band(e, 14, 17));
  c = mixRGB(c, RAMP.snow, band(e, SNOW_LINE - 1.5, SNOW_LINE + 1.5));
  const s = clamp01(slope + noise * 0.05);
  const snowy = band(e, SNOW_LINE - 1.5, SNOW_LINE + 1.5);
  c = mixRGB(c, RAMP.scree, band(s, SCREE_SLOPE - 0.08, SCREE_SLOPE + 0.08) * (1 - snowy * 0.5));
  c = mixRGB(c, RAMP.rock, band(s, ROCK_SLOPE - 0.06, ROCK_SLOPE + 0.06) * (1 - snowy * 0.35));
  const north = clamp01(aspectNorth), south = clamp01(-aspectNorth);
  const dark = 1 - 0.22 * north;
  c = [c[0] * dark, c[1] * dark, c[2] * dark];
  c = mixRGB(c, RAMP.rim, south * 0.12);
  const g = 1 + noise * 0.05;
  return [clamp01(c[0] * g), clamp01(c[1] * g), clamp01(c[2] * g)];
}
const SKY_TOP = "#c9d6e6", SKY_MID = "#dfe6ee", SKY_HORIZON = "#efe7dc", HAZE = "#efe7dc";
const RIVER = "#2f8fb8", RIVER_FOAM = "#e9f1f3", EXTENT = "#b8241a", LAKE = "#1b4a8f";
const AMBER = "#ffb800", GREEN = "#148a4e", GREY = "#8a8a8a", WALL = "#ffffff", INK = "#1a1a1a";

// ---- lib/corridor-camera.ts (corridorBounds · boxFits · fitCamera, landscape) ------------------------------
const FOV = (42 * Math.PI) / 180;
const RAD_MIN = 16, RAD_MAX = 260;
function corridorBounds() {
  let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let km = -12; km <= 112; km += 2) {
    const x = kmToX(km), z = meander(x), y = bedH(x, z);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  return { minX: Math.max(-SCENE_W / 2, kmToX(-12)), maxX: Math.min(SCENE_W / 2, kmToX(112)), minZ: Math.max(-SCENE_D / 2, minZ - 8), maxZ: Math.min(SCENE_D / 2, maxZ + 8), minY, maxY: maxY + 5 };
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const orbitPosition = (o) => [o.target[0] + o.rad * Math.sin(o.pol) * Math.sin(o.az), o.target[1] + o.rad * Math.cos(o.pol), o.target[2] + o.rad * Math.sin(o.pol) * Math.cos(o.az)];
function basis(o) {
  const cam = orbitPosition(o);
  const f = norm(sub(o.target, cam));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  return { cam, f, r, u };
}
function boxFits(o, aspect, margin) {
  const b = corridorBounds();
  const { cam, f, r, u } = basis(o);
  const tanV = Math.tan(FOV / 2) * (1 - margin), tanH = tanV * aspect;
  for (const x of [b.minX, b.maxX]) for (const y of [b.minY, b.maxY]) for (const z of [b.minZ, b.maxZ]) {
    const d = [x - cam[0], y - cam[1], z - cam[2]];
    const depth = dot(d, f);
    if (depth <= 1) return false;
    if (Math.abs(dot(d, r) / depth) > tanH || Math.abs(dot(d, u) / depth) > tanV) return false;
  }
  return true;
}
function fitCamera(aspect, margin = 0.0) {
  const b = corridorBounds();
  const o = { target: [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, (b.minZ + b.maxZ) / 2], rad: RAD_MIN, pol: 0.5, az: -0.75 };
  while (o.rad < RAD_MAX && !boxFits(o, aspect, margin)) o.rad *= 1.03;
  o.rad = Math.min(RAD_MAX, o.rad);
  return o;
}
const orbit = fitCamera(W / H);
const camPos = orbitPosition(orbit);
const { f: fwd, r: right, u: up } = basis(orbit);
const focal = H / 2 / Math.tan(FOV / 2);
/** World → [screenX, screenY, depth]. */
function project(p) {
  const d = sub(p, camPos);
  const z = dot(d, fwd);
  return [W / 2 + (focal * dot(d, right)) / z, H / 2 - (focal * dot(d, up)) / z, z];
}
// scene lights (components/three/scene/terrain.ts): warm sun from (70, 34, −18), hemisphere sky/ground, cool fill
const L = norm([70, 34, -18]);

// ---- sample places (design script) — houses ∝ √reported, roofs carry the status colour, no pads ------------
const PLACES = [
  { id: "gyirong", km: -3, side: 0, reported: 560, unknown: 558 },
  { id: "timure", km: 4, side: 0.4, reported: 190, unknown: 67 },
  { id: "syabrubesi", km: 16, side: -0.6, reported: 140, unknown: 44 },
  { id: "langtang", km: 20, side: -7, reported: 60, unknown: 60, off: true },
  { id: "mailung", km: 26, side: 0.7, reported: 320, unknown: 66 },
  { id: "betrawati", km: 40, side: -0.5, reported: 450, unknown: 70 },
  { id: "bidur", km: 46, side: 0.6, reported: 300, unknown: 35 },
  { id: "devighat", km: 50, side: -0.4, reported: 120, unknown: 10 },
  { id: "galchhi", km: 60, side: 0.5, reported: 85, unknown: 5 },
  { id: "malekhu", km: 68, side: -0.3, reported: 40, unknown: 2 },
];

const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v * 255))).toString(16).padStart(2, "0")).join("");
const hex255 = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mixHex = (a, b, k) => "#" + hex255(a).map((v, i) => Math.round(v + (hex255(b)[i] - v) * k)).map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

/** Build the SVG for a given grid density and quantisation. */
function buildSvg({ nx, nz, steps }) {
  const tris = [];
  const X0 = -48, Z0 = -26, SX = SCENE_W / nx, SZ = SCENE_D / nz;
  const verts = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = X0 + i * SX, z = Z0 + j * SZ; verts.push([x, bedH(x, z), z]); }
  const V = (i, j) => verts[j * (nx + 1) + i];
  const inBand = (v) => v[0] >= CROP_X_MIN && Math.abs(v[2] - meander(v[0])) <= CROP_Z;
  const push = (a, b, c) => {
    if (!inBand(a) || !inBand(b) || !inBand(c)) return;
    const n = norm(cross(sub(b, a), sub(c, a)));
    const nn = n[1] < 0 ? n.map((v) => -v) : n;
    if (dot(nn, sub(camPos, a)) <= 0) return; // back faces (the underside) are not drawn
    const pa = project(a), pb = project(b), pc = project(c);
    if (pa[2] <= 2 || pb[2] <= 2 || pc[2] <= 2) return;
    const depth = (pa[2] + pb[2] + pc[2]) / 3;
    const cx = (a[0] + b[0] + c[0]) / 3, cz = (a[2] + b[2] + c[2]) / 3;
    const elev = (a[1] + b[1] + c[1]) / 3;
    // hemisphere (0.55 sky + 0.45 ground by n.y) + sun 0.9·max(0, n·L)
    const light = 0.62 + 0.28 * (nn[1] * 0.5 + 0.5) + 0.9 * Math.max(0, dot(nn, L));
    const rgb = terrainColour(elev, 1 - nn[1], -nn[2], noise3(cx, cz));
    tris.push({ pa, pb, pc, depth, light, rgb });
  };
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
    if ((i + j) % 2 === 0) { push(a, b, c); push(a, c, d); } else { push(a, b, d); push(b, c, d); }
  }
  tris.sort((p, q) => q.depth - p.depth); // painter's: far first

  // quantise colour × light × fog so the SVG groups into few paths and the palette PNG stays small
  const q = (v) => Math.round(v * steps) / steps;
  const fogOf = (depth) => Math.max(0, Math.min(1, (depth - 180) / 340)) * 0.6;
  const colourFor = (t) => {
    const k = Math.min(1.25, t.light);
    const lit = [q(t.rgb[0] * k), q(t.rgb[1] * k), q(t.rgb[2] * k)];
    return mixHex(toHex(lit), HAZE, q(fogOf(t.depth)));
  };
  const parts = [];
  let cur = null, buf = [];
  const flush = () => { if (cur && buf.length) parts.push(`<path fill="${cur}" stroke="${cur}" stroke-width="0.6" shape-rendering="crispEdges" d="${buf.join("")}"/>`); buf = []; };
  for (const t of tris) {
    const c = colourFor(t);
    if (c !== cur) { flush(); cur = c; }
    buf.push(`M${f1(t.pa[0])} ${f1(t.pa[1])}L${f1(t.pb[0])} ${f1(t.pb[1])}L${f1(t.pc[0])} ${f1(t.pc[1])}Z`);
  }
  flush();

  // the flood-extent band (translucent dark red on the banks) and the river ribbon in the bed
  const path = [];
  for (let km = -10; km <= 110; km += 0.8) {
    const x = kmToX(km), z = meander(x);
    const p = project([x, bedH(x, z) + 0.14, z]);
    path.push(`${path.length ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`);
  }
  const riverD = path.join("");
  const sMid = focal / project([kmToX(40), bedH(kmToX(40), meander(kmToX(40))), meander(kmToX(40))])[2];
  parts.push(`<path d="${riverD}" fill="none" stroke="${EXTENT}" stroke-opacity="0.35" stroke-width="${f1(5.0 * sMid)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  parts.push(`<path d="${riverD}" fill="none" stroke="${RIVER_FOAM}" stroke-width="${f1(2.0 * sMid)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  parts.push(`<path d="${riverD}" fill="none" stroke="${RIVER}" stroke-width="${f1(1.5 * sMid)}" stroke-linecap="round" stroke-linejoin="round"/>`);

  // barrier lakes upstream (deep blue)
  for (const km of LAKE_KMS) {
    const x = kmToX(km), z = meander(x);
    const p = project([x, bedH(x, z) + 0.5, z]);
    const s = focal / p[2];
    parts.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(2.1 * s)}" ry="${f1(2.1 * s * 0.55)}" fill="${LAKE}" stroke="${INK}" stroke-width="1.2"/>`);
  }

  // settlement clusters: houses stand on their own ground; roofs carry the status colour (no pads, no rings)
  const hash01 = (str, salt) => { let h = 2166136261 ^ salt; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return (h >>> 0) / 4294967295; };
  const houses = [];
  for (const p of PLACES) {
    if (p.km < -11) continue;
    const x = kmToX(p.km), z = meander(x) + p.side * (p.off ? 1 : 2.2);
    const heavy = p.unknown / Math.max(1, p.reported) > 0.4;
    const roof = p.reported <= 0 ? GREY : heavy ? AMBER : GREEN;
    const radius = Math.min(2.6, 1.2 + Math.sqrt(p.reported) * 0.06);
    const count = Math.max(2, Math.min(7, Math.round(2 + Math.sqrt(p.reported) / 4)));
    for (let i = 0; i < count; i++) {
      const a = hash01(p.id, 10 + i) * Math.PI * 2, rr = (0.25 + hash01(p.id, 30 + i) * 0.6) * radius;
      const sc = 0.8 + hash01(p.id, 70 + i) * 0.5;
      const hx = x + Math.cos(a) * rr, hz = z + Math.sin(a) * rr;
      houses.push({ p: project([hx, bedH(hx, hz) + 0.3 * sc, hz]), sc, roof });
    }
  }
  houses.sort((a, b) => b.p[2] - a.p[2]);
  for (const h of houses) {
    const hs = (focal / h.p[2]) * 0.9 * h.sc;
    parts.push(`<rect x="${f1(h.p[0] - hs / 2)}" y="${f1(h.p[1] - hs * 0.45)}" width="${f1(hs)}" height="${f1(hs * 0.55)}" fill="${WALL}" stroke="${INK}" stroke-width="0.7"/>`);
    parts.push(`<polygon points="${f1(h.p[0] - hs * 0.6)},${f1(h.p[1] - hs * 0.45)} ${f1(h.p[0] + hs * 0.6)},${f1(h.p[1] - hs * 0.45)} ${f1(h.p[0])},${f1(h.p[1] - hs * 0.95)}" fill="${h.roof}" stroke="${INK}" stroke-width="0.7"/>`);
  }

  const sky = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_TOP}"/><stop offset="0.55" stop-color="${SKY_MID}"/><stop offset="1" stop-color="${SKY_HORIZON}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${sky}${parts.join("")}</svg>`;
}

async function render(settings) {
  const svg = buildSvg(settings);
  return sharp(Buffer.from(svg), { density: 72 })
    .resize(W, H)
    .png({ palette: true, colours: settings.colours, compressionLevel: 9, effort: 10 })
    .toBuffer();
}

// Try the richest rendering first; drop colours/detail until it fits under the limit.
const ATTEMPTS = [
  { nx: 128, nz: 70, steps: 12, colours: 128 },
  { nx: 128, nz: 70, steps: 10, colours: 96 },
  { nx: 96, nz: 52, steps: 10, colours: 64 },
  { nx: 96, nz: 52, steps: 8, colours: 48 },
  { nx: 72, nz: 40, steps: 8, colours: 32 },
  { nx: 60, nz: 32, steps: 6, colours: 24 },
];

let done = false;
for (const s of ATTEMPTS) {
  const buf = await render(s);
  const size = buf.byteLength;
  console.log(`corridor-fallback.png: ${size} bytes (grid ${s.nx}×${s.nz}, ${s.colours} colours) · camera rad ${orbit.rad.toFixed(1)}`);
  if (size < LIMIT) {
    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, buf);
    console.log(`wrote ${OUT}`);
    done = true;
    break;
  }
}
if (!done) {
  console.error(`corridor-fallback.png is still ≥ ${LIMIT} bytes after every attempt`);
  process.exit(1);
}
