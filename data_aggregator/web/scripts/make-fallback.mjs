#!/usr/bin/env node
/**
 * Pre-renders public/corridor-fallback.png (1280×480, < 90 KB) in the v2 look — the static stand-in for the 3D
 * corridor on 2G/3G or when WebGL fails (Component Sheet §06). Same maths and camera as
 * components/three/corridor-3d.ts, projected to 2D and drawn as a low-poly SVG, then rasterised
 * with sharp into a small palette PNG. No text inside the image: the legend and caption live in
 * the parent block. Run with `npm run fallback`.
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

// ---- palette (lib/terrain-colours.ts, lib/tokens.ts) — the v2 look ----
const SKY_TOP = "#c9d6e6", SKY_MID = "#dfe6ee", SKY_HORIZON = "#efe7dc";
const HAZE = "#efe7dc";
const RAMP = { silt: "#8f7a5a", terrace: "#6f8f4f", forest: "#3f6b3a", scree: "#8d8a84", rock: "#6b6660", snow: "#f2f4f7" };
const RIVER = "#4d7d8f", RIVER_FOAM = "#e9f1f3", EXTENT = "#b8241a", LAKE = "#5b7f8f";
const AMBER = "#ffb800", GREEN = "#148a4e", WALL = "#ffffff", ROOF = "#2438e8", ROOF_B = "#1a1a1a", PAD = "#8f7a5a";
const INK = "#1a1a1a";

// ---- sample places from the design script ----
const PLACES = [
  { id: "gyirong", km: -3, side: 0, reported: 560, confirmed: 2, unknown: 558 },
  { id: "timure", km: 4, side: 0.4, reported: 190, confirmed: 123, unknown: 67 },
  { id: "syabrubesi", km: 16, side: -0.6, reported: 140, confirmed: 96, unknown: 44 },
  { id: "langtang", km: 20, side: -7, reported: 60, confirmed: 0, unknown: 60, off: true },
  { id: "mailung", km: 26, side: 0.7, reported: 320, confirmed: 254, unknown: 66 },
  { id: "betrawati", km: 40, side: -0.5, reported: 450, confirmed: 380, unknown: 70 },
  { id: "bidur", km: 46, side: 0.6, reported: 300, confirmed: 265, unknown: 35 },
  { id: "devighat", km: 50, side: -0.4, reported: 120, confirmed: 110, unknown: 10 },
  { id: "galchhi", km: 60, side: 0.5, reported: 85, confirmed: 80, unknown: 5 },
  { id: "malekhu", km: 68, side: -0.3, reported: 40, confirmed: 38, unknown: 2 },
];

// ---- terrain maths (identical to lib/corridor-terrain.ts) ----
const kmToX = (km) => (km <= 74 ? (km - 32) * 0.84 : (74 - 32) * 0.84 + (km - 74) * 0.15);
const meander = (x) => Math.sin(x * 0.16) * 3.2 + Math.sin(x * 0.043 + 1.2) * 5;
const baseElev = (x) => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35);
const n2 = (x, z) => Math.sin(x * 0.35 + z * 0.9) * Math.cos(z * 0.5 - x * 0.21) + 0.6 * Math.sin(x * 0.9 + 2.3) * Math.sin(z * 1.7);
const terrainH0 = (x, z) => {
  const d = Math.abs(z - meander(x));
  const wall = Math.min(1, d / (5 + (x + 42) * 0.1));
  const ridge = Math.pow(wall, 1.6) * (10 + baseElev(x) * 1.5) + n2(x, z) * (0.7 + wall * 1.8);
  return baseElev(x) + ridge - 1.2;
};
const damH = (x) => { const xd = kmToX(-9.5); return x < xd ? Math.min(9, (xd - x) * 3) : 0; };
const terrainH = (x, z) => { const dz = z - meander(x); return terrainH0(x, z) - 1.4 * Math.exp(-(dz * dz) / 6.0) + damH(x); };
// value noise (lib/terrain-colours.ts noise3)
const noise3 = (x, z) => { let sum = 0, amp = 0.55, f = 0.23; for (let o = 0; o < 3; o++) { sum += amp * Math.sin(x * f + 1.7 * o) * Math.cos(z * f * 1.3 - 0.9 * o + Math.sin(x * f * 0.5)); amp *= 0.5; f *= 2.1; } return Math.max(-1, Math.min(1, sum / 0.9625)); };

// ---- camera (lib/corridor-camera.ts fitCamera for 1280×480: pol 0.86 · az −0.9 · target = corridor box centre) ----
const FOV = (42 * Math.PI) / 180;
const az = -0.72;
const pol = 0.86;
const rad = 98;
const target = [0, 11, 2];
const camPos = [target[0] + rad * Math.sin(pol) * Math.sin(az), target[1] + rad * Math.cos(pol), target[2] + rad * Math.sin(pol) * Math.cos(az)];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const fwd = norm(sub(target, camPos));
const right = norm(cross(fwd, [0, 1, 0]));
const up = cross(right, fwd);
const focal = H / 2 / Math.tan(FOV / 2);

/** World → [screenX, screenY, depth]. */
function project(p) {
  const d = sub(p, camPos);
  const z = dot(d, fwd);
  const x = dot(d, right);
  const y = dot(d, up);
  return [W / 2 + (focal * x) / z, H / 2 - (focal * y) / z, z];
}

// Directional light at (-30, 50, 25) → origin; ambient 0.75 + diffuse 1.4·max(0, n·L)
const L = norm([70, 34, -18]);

const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, k) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * k));

const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

/** Build the SVG for a given grid density and fog quantisation. */
function buildSvg({ nx, nz, fogSteps }) {
  const tris = [];
  const X0 = -48, Z0 = -26, SX = 96 / nx, SZ = 52 / nz;
  // vertices with terrain height
  const verts = [];
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = X0 + i * SX, z = Z0 + j * SZ;
      verts.push([x, terrainH(x, z), z]);
    }
  }
  const V = (i, j) => verts[j * (nx + 1) + i];
  const push = (a, b, c) => {
    const n = norm(cross(sub(b, a), sub(c, a)));
    const nn = n[1] < 0 ? n.map((v) => -v) : n; // the plane's front face is its top
    // FrontSide culling like three.js: the camera sits below the high north plateau, so its
    // underside is not drawn (the live scene shows background through it too)
    if (dot(nn, sub(camPos, a)) <= 0) return;
    const light = 0.75 + 1.4 * Math.max(0, dot(nn, L));
    const pa = project(a), pb = project(b), pc = project(c);
    if (pa[2] <= 2 || pb[2] <= 2 || pc[2] <= 2) return; // behind / on the near plane
    const depth = (pa[2] + pb[2] + pc[2]) / 3;
    const elev = (a[1] + b[1] + c[1]) / 3;
    const slope = 1 - nn[1];
    const nz = noise3((a[0] + b[0] + c[0]) / 3, (a[2] + b[2] + c[2]) / 3);
    tris.push({ pa, pb, pc, depth, light, elev, slope, nz });
  };
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
      // alternate the diagonal for a less regular low-poly look
      if ((i + j) % 2 === 0) { push(a, b, c); push(a, c, d); } else { push(a, b, d); push(b, c, d); }
    }
  }
  tris.sort((p, q) => q.depth - p.depth); // painter's: far first

  // colour = terrain ramp (elevation × slope × noise) × light, then fog toward the haze; quantised so the
  // SVG groups into few paths and the palette PNG stays small
  const bandOf = (e, slope, nz) => {
    const eb = e + nz * 1.6;
    if (slope > 0.62) return RAMP.rock;
    if (eb > 22) return RAMP.snow;
    if (slope > 0.42) return RAMP.scree;
    if (eb > 15.5) return RAMP.scree;
    if (eb > 7.2) return RAMP.forest;
    if (eb > 2.8) return RAMP.terrace;
    return RAMP.silt;
  };
  const lightSteps = [0.95, 1.35, 1.8];
  const lightOf = (l) => { let i = 0; while (i < lightSteps.length && l >= lightSteps[i]) i++; return i; };
  const LIGHT_K = [0.62, 0.8, 1.0, 1.14];
  const fogOf = (depth) => { const f = Math.max(0, Math.min(1, (depth - 90) / 140)); return Math.round(f * fogSteps) / fogSteps; };
  const colourCache = new Map();
  const colourFor = (base, li, fog) => {
    const key = base + ":" + li + ":" + fog;
    let c = colourCache.get(key);
    if (!c) { c = mix(toHex(hex(base).map((v) => v * LIGHT_K[li])), HAZE, fog * 0.7); colourCache.set(key, c); }
    return c;
  };

  // group triangles by colour to keep the SVG small (one <path> per colour, in painter order)
  const parts = [];
  let cur = null, buf = [];
  const flush = () => { if (cur && buf.length) parts.push(`<path fill="${cur}" stroke="${cur}" stroke-width="0.6" shape-rendering="crispEdges" d="${buf.join("")}"/>`); buf = []; };
  for (const t of tris) {
    const c = colourFor(bandOf(t.elev, t.slope, t.nz), lightOf(t.light), fogOf(t.depth));
    if (c !== cur) { flush(); cur = c; }
    buf.push(`M${f1(t.pa[0])} ${f1(t.pa[1])}L${f1(t.pb[0])} ${f1(t.pb[1])}L${f1(t.pc[0])} ${f1(t.pc[1])}Z`);
  }
  flush();

  // the known extent (translucent dark red band on the banks) and the river ribbon before the wave
  const path = [];
  for (let km = -10; km <= 110; km += 0.8) {
    const x = kmToX(km), z = meander(x);
    const p = project([x, terrainH(x, z) + 0.15, z]);
    path.push(`${path.length ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`);
  }
  const riverD = path.join("");
  parts.push(`<path d="${riverD}" fill="none" stroke="${EXTENT}" stroke-opacity="0.3" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`);
  parts.push(`<path d="${riverD}" fill="none" stroke="${RIVER_FOAM}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  parts.push(`<path d="${riverD}" fill="none" stroke="${RIVER}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`);

  // barrier lakes upstream
  for (const km of [-8, -6]) {
    const x = kmToX(km), z = meander(x);
    const p = project([x, terrainH(x, z) + 0.5, z]);
    const s = focal / p[2];
    parts.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(2.1 * s)}" ry="${f1(2.1 * s * 0.5)}" fill="${LAKE}" stroke="${INK}" stroke-width="1.5"/>`);
  }

  // settlement clusters on pads with a status ring
  const hash01 = (str, salt) => { let h = 2166136261 ^ salt; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return (h >>> 0) / 4294967295; };
  const clusters = PLACES.map((p) => {
    const x = kmToX(p.km), z = meander(x) + p.side * (p.off ? 1 : 2.2);
    const y = terrainH(x, z);
    const heavy = p.unknown / Math.max(1, p.reported) > 0.4;
    const radius = Math.min(2.6, 1.2 + Math.sqrt(p.reported) * 0.06);
    const count = Math.max(2, Math.min(7, Math.round(2 + Math.sqrt(p.reported) / 4)));
    const centre = project([x, y + 0.1, z]);
    const houses = [];
    for (let i = 0; i < count; i++) {
      const a = hash01(p.id, 10 + i) * Math.PI * 2, rr = (0.25 + hash01(p.id, 30 + i) * 0.6) * radius;
      const sc = 0.8 + hash01(p.id, 70 + i) * 0.5;
      const hx = x + Math.cos(a) * rr, hz = z + Math.sin(a) * rr;
      houses.push({ p: project([hx, y + 0.3 * sc, hz]), sc, dark: i % 3 === 0 });
    }
    return { centre, radius, heavy, houses, depth: centre[2] };
  }).sort((a, b) => b.depth - a.depth);
  for (const c of clusters) {
    const s = focal / c.centre[2];
    const rx = c.radius * s, ry = rx * 0.5;
    parts.push(`<ellipse cx="${f1(c.centre[0])}" cy="${f1(c.centre[1])}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${PAD}" stroke="${INK}" stroke-width="1"/>`);
    parts.push(`<ellipse cx="${f1(c.centre[0])}" cy="${f1(c.centre[1])}" rx="${f1(rx * 0.92)}" ry="${f1(ry * 0.92)}" fill="none" stroke="${c.heavy ? AMBER : GREEN}" stroke-width="${f1(Math.max(1.5, 0.14 * s))}"/>`);
    for (const h of c.houses) {
      const hs = (focal / h.p[2]) * 0.9 * h.sc;
      parts.push(`<rect x="${f1(h.p[0] - hs / 2)}" y="${f1(h.p[1] - hs * 0.45)}" width="${f1(hs)}" height="${f1(hs * 0.55)}" fill="${WALL}" stroke="${INK}" stroke-width="0.8"/>`);
      parts.push(`<polygon points="${f1(h.p[0] - hs * 0.6)},${f1(h.p[1] - hs * 0.45)} ${f1(h.p[0] + hs * 0.6)},${f1(h.p[1] - hs * 0.45)} ${f1(h.p[0])},${f1(h.p[1] - hs * 0.95)}" fill="${h.dark ? ROOF_B : ROOF}" stroke="${INK}" stroke-width="0.8"/>`);
    }
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
  { nx: 96, nz: 52, fogSteps: 3, colours: 96 },
  { nx: 72, nz: 40, fogSteps: 3, colours: 64 },
  { nx: 72, nz: 40, fogSteps: 4, colours: 48 },
  { nx: 72, nz: 40, fogSteps: 3, colours: 32 },
  { nx: 60, nz: 32, fogSteps: 3, colours: 32 },
  { nx: 60, nz: 32, fogSteps: 2, colours: 24 },
  { nx: 48, nz: 26, fogSteps: 2, colours: 16 },
];

let done = false;
for (const s of ATTEMPTS) {
  const buf = await render(s);
  const size = buf.byteLength;
  console.log(`corridor-fallback.png: ${size} bytes (grid ${s.nx}×${s.nz}, ${s.colours} colours)`);
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
