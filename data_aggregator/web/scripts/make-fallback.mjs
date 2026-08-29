#!/usr/bin/env node
/**
 * Pre-renders public/corridor-fallback.png (1280×480, < 60 KB) — the static stand-in for the 3D
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
const LIMIT = 60_000;

// ---- palette (lib/tokens.ts + the design script) ----
const BG = "#e9e7e5";
// The three design shades plus a darker tone for gorge walls turned away from the sun and a
// brighter one for faces square to it (three.js lights the same material from ~#a6a4a2 up to
// white, so this is still the tamer end of what the live scene shows).
const SHADES = ["#c6c2be", "#d3cfcb", "#dedbd8", "#e6e3e0", "#efedeb"]; // low → high light
// ambient 0.75 + diffuse 1.4·(n·L) ∈ [0.75, 2.15] → shade index
// flat ground (n·L ≈ 0.77 → 1.83) lands on the base #dedbd8; slopes go darker / lighter
const SHADE_STEPS = [0.95, 1.4, 1.95, 2.08];
const FLOOD = "#ec3013";
const LAKE = "#5b7f8f";
const UNKNOWN_C = "#b06a00";
const CONFIRMED_C = "#1c7a45";
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

// ---- terrain maths (identical to corridor-3d.ts) ----
const kmToX = (km) => (km - 32) * 0.84;
const meander = (x) => Math.sin(x * 0.16) * 3.2 + Math.sin(x * 0.043 + 1.2) * 5;
const baseElev = (x) => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35);
const n2 = (x, z) => Math.sin(x * 0.35 + z * 0.9) * Math.cos(z * 0.5 - x * 0.21) + 0.6 * Math.sin(x * 0.9 + 2.3) * Math.sin(z * 1.7);
const terrainH = (x, z) => {
  const d = Math.abs(z - meander(x));
  const wall = Math.min(1, d / (5 + (x + 42) * 0.1));
  const ridge = Math.pow(wall, 1.6) * (10 + baseElev(x) * 1.5) + n2(x, z) * (0.7 + wall * 1.8);
  return baseElev(x) + ridge - 1.2;
};

// ---- camera (PerspectiveCamera(42) · az −0.9 · pol 0.98 · rad 62 · target (0,4,0)) ----
const FOV = (42 * Math.PI) / 180;
const az = -0.9;
const pol = 0.98;
const rad = 62;
const target = [0, 4, 0];
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
const L = norm([-30, 50, 25]);

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
    tris.push({ pa, pb, pc, depth, light });
  };
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
      // alternate the diagonal for a less regular low-poly look
      if ((i + j) % 2 === 0) { push(a, b, c); push(a, c, d); } else { push(a, b, d); push(b, c, d); }
    }
  }
  tris.sort((p, q) => q.depth - p.depth); // painter's: far first

  // lighting → shades on fixed thresholds; fog (70..160) → blend toward BG in a few steps
  const shadeOf = (l) => {
    let i = 0;
    while (i < SHADE_STEPS.length && l >= SHADE_STEPS[i]) i++;
    return i;
  };
  const fogOf = (depth) => {
    const f = Math.max(0, Math.min(1, (depth - 70) / 90));
    return Math.round(f * fogSteps) / fogSteps;
  };
  const colourCache = new Map();
  const colourFor = (shade, fog) => {
    const key = shade + ":" + fog;
    let c = colourCache.get(key);
    if (!c) { c = mix(SHADES[shade], BG, fog); colourCache.set(key, c); }
    return c;
  };

  // group triangles by colour to keep the SVG small (one <path> per colour, in painter order)
  const parts = [];
  let cur = null, buf = [];
  const flush = () => { if (cur && buf.length) parts.push(`<path fill="${cur}" stroke="${cur}" stroke-width="0.6" shape-rendering="crispEdges" d="${buf.join("")}"/>`); buf = []; };
  for (const t of tris) {
    const c = colourFor(shadeOf(t.light), fogOf(t.depth));
    if (c !== cur) { flush(); cur = c; }
    buf.push(`M${f1(t.pa[0])} ${f1(t.pa[1])}L${f1(t.pb[0])} ${f1(t.pb[1])}L${f1(t.pc[0])} ${f1(t.pc[1])}Z`);
  }
  flush();

  // flood path along the meander, draped on the terrain
  const path = [];
  for (let km = -10; km <= 74; km += 0.8) {
    const x = kmToX(km), z = meander(x);
    const p = project([x, terrainH(x, z) + 0.35, z]);
    path.push(`${path.length ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`);
  }
  const floodD = path.join("");
  parts.push(`<path d="${floodD}" fill="none" stroke="${FLOOD}" stroke-opacity="0.28" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`);
  parts.push(`<path d="${floodD}" fill="none" stroke="${FLOOD}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);

  // barrier lakes upstream
  for (const km of [-8, -6]) {
    const x = kmToX(km), z = meander(x);
    const p = project([x, terrainH(x, z) + 0.5, z]);
    const s = focal / p[2];
    parts.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(1.8 * s)}" ry="${f1(1.8 * s * 0.55)}" fill="${LAKE}" stroke="${INK}" stroke-width="1.5"/>`);
  }

  // markers: rounded-rect stem + circle cap, height ∝ √reported
  const markers = PLACES.map((p) => {
    const x = kmToX(p.km), z = meander(x) + p.side * (p.off ? 1 : 2.2);
    const y = terrainH(x, z);
    const h = 1.5 + Math.sqrt(p.reported) * 0.32;
    const heavy = p.unknown / Math.max(1, p.reported) > 0.4;
    const base = project([x, y + 0.2, z]);
    const top = project([x, y + h + 0.2, z]);
    const cap = project([x, y + h + 0.6, z]);
    return { base, top, cap, heavy, depth: base[2] };
  }).sort((a, b) => b.depth - a.depth);
  for (const m of markers) {
    const c = m.heavy ? UNKNOWN_C : CONFIRMED_C;
    const s = focal / m.base[2];
    const w = 1.1 * s;
    const hpx = m.base[1] - m.top[1];
    parts.push(`<rect x="${f1(m.base[0] - w / 2)}" y="${f1(m.top[1])}" width="${f1(w)}" height="${f1(hpx)}" rx="${f1(w * 0.3)}" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`);
    parts.push(`<circle cx="${f1(m.cap[0])}" cy="${f1(m.cap[1])}" r="${f1(0.8 * s)}" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${BG}"/>${parts.join("")}</svg>`;
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
