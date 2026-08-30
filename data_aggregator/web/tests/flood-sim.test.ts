import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DAM_KM, SCENE_W, bedH, damH, kmToX, meander, terrainH, xToKm } from "@/lib/corridor-terrain";
import {
  BREACH,
  DEFAULT_SCENARIO,
  GRID,
  SIM_UNITS_PER_MM3,
  breachVolume,
  cellCentre,
  cellIndex,
  clockForFrontX,
  createSim,
  minutesForKm,
  sampleBed,
} from "@/lib/flood-sim";
import { catalogue, isSwept, snapToPath } from "@/lib/object-catalogue";

/** Minimal RFC-4180 reader (quoted fields may contain commas). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

describe("corridor terrain", () => {
  it("maps every gazetteer chainage onto the mesh", () => {
    const rows = parseCsv(readFileSync(resolve(__dirname, "../../gazetteer/places.csv"), "utf8"));
    const kmCol = rows[0].indexOf("km");
    let n = 0;
    for (const cells of rows.slice(1)) {
      if (!cells.length || !cells[kmCol]) continue;
      const km = Number(cells[kmCol]);
      if (!Number.isFinite(km)) continue;
      const x = kmToX(km);
      expect(Math.abs(x)).toBeLessThan(SCENE_W / 2);
      n++;
    }
    expect(n).toBeGreaterThan(30);
  });
  it("kmToX is monotone and invertible", () => {
    let prev = -Infinity;
    for (let km = -10; km <= 120; km += 0.5) {
      const x = kmToX(km);
      expect(x).toBeGreaterThan(prev);
      expect(xToKm(x)).toBeCloseTo(km, 6);
      prev = x;
    }
  });
  it("the landslide dam rises upstream of the lakes and nowhere else", () => {
    expect(damH(kmToX(DAM_KM) + 0.1)).toBe(0);
    expect(damH(kmToX(DAM_KM) - 1)).toBeGreaterThan(2);
    expect(damH(-48)).toBe(9);
    expect(bedH(kmToX(-12), meander(kmToX(-12)))).toBeGreaterThan(bedH(kmToX(-8), meander(kmToX(-8))) + 4);
  });
  it("the channel runs downhill from the lakes to the plain", () => {
    let prev = Infinity;
    for (let km = -8; km <= 100; km += 4) {
      const x = kmToX(km);
      const h = bedH(x, meander(x));
      expect(h).toBeLessThan(prev + 0.6); // allow the noise but no real climbs
      prev = Math.min(prev, h);
    }
    expect(bedH(0, meander(0))).toBeLessThan(terrainH(0, meander(0)));
  });
});

describe("grid", () => {
  it("indexes and centres round-trip", () => {
    const idx = cellIndex(GRID, 3.3, -2.1);
    const c = cellCentre(GRID, idx);
    expect(Math.abs(c.x - 3.3)).toBeLessThanOrEqual(GRID.cell / 2);
    expect(Math.abs(c.z + 2.1)).toBeLessThanOrEqual(GRID.cell / 2);
    expect(cellIndex(GRID, 1e9, 0)).toBe(-1);
  });
});

describe("flood sim", () => {
  const bed = sampleBed(GRID);

  it("conserves mass in a closed box", () => {
    const sim = createSim(GRID, bed, { openEast: false, drain: 0 });
    sim.inject(BREACH.x, BREACH.z, BREACH.radius, 100);
    for (let i = 0; i < 600; i++) sim.step(1 / 120);
    expect(sim.totalWater()).toBeCloseTo(100, 0); // float32 accumulation over 600 steps
  });

  it("the breach reaches Syabrubesi before Betrawati before Galchhi, and never produces NaN", () => {
    const sim = createSim(GRID, bed);
    const V = DEFAULT_SCENARIO.lakeMm3 * SIM_UNITS_PER_MM3;
    const dt = 1 / 120;
    const arrivals: Record<number, number> = {};
    for (let t = 0; t < 40; t += dt) {
      sim.inject(BREACH.x, BREACH.z, BREACH.radius, breachVolume(V, DEFAULT_SCENARIO.breachSeconds, t, dt));
      sim.step(dt);
      const fx = sim.frontX();
      for (const km of [16, 40, 60]) if (!(km in arrivals) && fx >= kmToX(km)) arrivals[km] = t;
    }
    expect(arrivals[16]).toBeLessThan(arrivals[40]);
    expect(arrivals[40]).toBeLessThan(arrivals[60]);
    expect(arrivals[60]).toBeLessThan(30);
    for (let i = 0; i < sim.depth.length; i++) {
      expect(Number.isNaN(sim.depth[i])).toBe(false);
      expect(sim.depth[i]).toBeGreaterThanOrEqual(0);
    }
    // injected = still on the grid + drained (to 1%)
    expect(sim.totalWater() + sim.drained()).toBeCloseTo(sim.injected(), -1);
    // nothing floods upstream of the dam
    expect(sim.depthAt(kmToX(-14), meander(kmToX(-14)))).toBeLessThan(0.05);
  });

  it("breachVolume integrates to the total", () => {
    let s = 0;
    for (let t = 0; t < 10; t += 0.01) s += breachVolume(50, 6, t, 0.01);
    expect(s).toBeCloseTo(50, 6);
    expect(breachVolume(50, 6, 0, 0.1)).toBeGreaterThan(breachVolume(50, 6, 5, 0.1));
  });

  it("reset empties everything", () => {
    const sim = createSim(GRID, bed);
    sim.inject(BREACH.x, BREACH.z, 2, 30);
    sim.step(0.01);
    sim.reset();
    expect(sim.totalWater()).toBe(0);
    expect(sim.frontX()).toBe(-Infinity);
  });
});

describe("objects", () => {
  it("camp < bus < house < bridge", () => {
    const d = ["camp", "bus", "house", "bridge"].map((k) => catalogue(k as never).threshold.depth);
    expect(d).toEqual([...d].sort((a, b) => a - b));
    expect(isSwept("camp", 0.2, 0.5)).toBe(true);
    expect(isSwept("bridge", 0.2, 0.5)).toBe(false);
    expect(isSwept("house", 1, 0.1)).toBe(false);
  });
  it("taps near the channel snap into the path", () => {
    expect(snapToPath("bridge", 3, 4, 1)).toEqual({ x: 3, z: 1 });
    expect(snapToPath("house", 3, 4, 1)).toEqual({ x: 3, z: 1.9 });
    expect(snapToPath("house", 3, -20, 1)).toEqual({ x: 3, z: -20 });
  });
});

describe("clock", () => {
  it("follows the recorded front", () => {
    expect(minutesForKm(40)).toBe(9 * 60 + 20);
    expect(minutesForKm(50)).toBeGreaterThan(9 * 60 + 20);
    expect(minutesForKm(50)).toBeLessThan(10 * 60 + 28);
    expect(minutesForKm(-20)).toBe(8 * 60 + 37);
    expect(minutesForKm(500)).toBe(13 * 60);
    expect(clockForFrontX(-Infinity)).toBe("08:37");
    expect(clockForFrontX(kmToX(60))).toBe("10:28");
  });
});
