/**
 * Terrain colour ramp for the corridor (web/docs/16-corridor-v2-plan.md §2.1) — pure, unit-tested, no three.js.
 * Elevation × slope × aspect × noise → linear-ish RGB in [0, 1] (three converts sRGB hex the same way, so these
 * are sRGB-space numbers to feed a colour attribute with `color.setRGB(r, g, b, SRGBColorSpace)`).
 *
 *   elevation (scene units, 1.5× exaggerated)         slope (0 flat … 1 vertical)
 *   ─────────────────────────────────────────         ──────────────────────────
 *   < 2.5  silt floor  #8f7a5a                        > 0.62  rock  #6b6660  (overrides everything but snow)
 *   2.5–7  terrace     #6f8f4f                        0.42–0.62 scree #8d8a84 blend
 *   7–15   forest      #3f6b3a
 *   15–22  scree       #8d8a84
 *   > 22   snow        #f2f4f7  (ridge line; band edges broken by noise)
 *   north-facing faces (aspectNorth > 0) darken up to 22 %; a warm rim lifts sun-facing faces.
 */
export type RGB = [number, number, number];

export const RAMP = {
  silt: hex("#8f7a5a"),
  terrace: hex("#6f8f4f"),
  forest: hex("#3f6b3a"),
  scree: hex("#8d8a84"),
  rock: hex("#6b6660"),
  snow: hex("#f2f4f7"),
  stain: hex("#5c4630"),
  rim: hex("#ffe9c8"),
} as const;

export const SNOW_LINE = 22;
export const ROCK_SLOPE = 0.62;
export const SCREE_SLOPE = 0.42;

export function hex(h: string): RGB {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Smooth step between two elevations. */
function band(elev: number, lo: number, hi: number): number {
  if (hi <= lo) return elev >= hi ? 1 : 0;
  const t = clamp01((elev - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
}

/** Deterministic value noise, 3 octaves, in [-1, 1] — cheap, no tables, stable across runs. */
export function noise3(x: number, z: number): number {
  let sum = 0;
  let amp = 0.55;
  let f = 0.23;
  for (let o = 0; o < 3; o++) {
    sum += amp * Math.sin(x * f + 1.7 * o) * Math.cos(z * f * 1.3 - 0.9 * o + Math.sin(x * f * 0.5));
    amp *= 0.5;
    f *= 2.1;
  }
  return Math.max(-1, Math.min(1, sum / 0.9625));
}

/**
 * The ramp. `slope` is 1 − normal.y (0 flat … 1 vertical), `aspectNorth` is the normal's −z component in
 * [−1, 1] (positive = faces north, away from the low eastern sun), `noise` in [−1, 1] breaks the bands.
 */
export function terrainColour(elev: number, slope: number, aspectNorth = 0, noise = 0): RGB {
  const e = elev + noise * 1.6; // wobble the band edges
  // elevation ramp
  let c: RGB = RAMP.silt;
  c = mix(c, RAMP.terrace, band(e, 2.0, 3.6));
  c = mix(c, RAMP.forest, band(e, 6.0, 8.5));
  c = mix(c, RAMP.scree, band(e, 14, 17));
  c = mix(c, RAMP.snow, band(e, SNOW_LINE - 1.5, SNOW_LINE + 1.5));
  // slope: scree then bare rock on steep faces (snow still clings above the snow line)
  const s = clamp01(slope + noise * 0.05);
  const snowy = band(e, SNOW_LINE - 1.5, SNOW_LINE + 1.5);
  const screeT = band(s, SCREE_SLOPE - 0.08, SCREE_SLOPE + 0.08) * (1 - snowy * 0.5);
  c = mix(c, RAMP.scree, screeT);
  const rockT = band(s, ROCK_SLOPE - 0.06, ROCK_SLOPE + 0.06) * (1 - snowy * 0.35);
  c = mix(c, RAMP.rock, rockT);
  // aspect: north faces darker, sun-facing a warm rim
  const north = clamp01(aspectNorth);
  const south = clamp01(-aspectNorth);
  const dark = 1 - 0.22 * north;
  c = [c[0] * dark, c[1] * dark, c[2] * dark];
  c = mix(c, RAMP.rim, south * 0.12);
  // fine grain
  const g = 1 + noise * 0.05;
  return [clamp01(c[0] * g), clamp01(c[1] * g), clamp01(c[2] * g)];
}

/** Sky gradient stops (top → horizon) and the fog/haze colour. */
export const SKY = { top: "#c9d6e6", mid: "#dfe6ee", horizon: "#efe7dc", haze: hex("#efe7dc") } as const;

/** River, extent band, water tones, foam — the rest of the palette, in one place. */
export const WATER = {
  river: hex("#4d7d8f"),
  riverFoam: hex("#e9f1f3"),
  extent: hex("#b8241a"),
  mudDeep: hex("#3d2a18"),
  mudBody: hex("#8a5a2b"),
  mudShallow: hex("#c9a56a"),
  foam: hex("#f6f1e8"),
  lake: hex("#5b7f8f"),
} as const;
