import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CORRIDOR_BBOX, CORRIDOR_VIEW } from "@/lib/map-view";
import { TILE_SIZE, clampTransform, coverSize, fitTransform, fractionBounds, isInView, latToWorldY, lonToWorldX, projectToFraction, zoomAbout } from "@/lib/map-projection";

type Row = { id: string; lat: number; lon: number; district: string };
const places: Row[] = readFileSync(join(__dirname, "..", "..", "gazetteer", "places.csv"), "utf8")
  .split("\n")
  .slice(1)
  .filter(Boolean)
  .map((line) => {
    // the file has quoted fields with commas; a tiny CSV reader is enough for the columns we need
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    return { id: cells[0], district: cells[7], lat: Number(cells[10]), lon: Number(cells[11]) };
  })
  .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon));

describe("web mercator", () => {
  it("puts the origin at the middle of the world at zoom 0", () => {
    expect(lonToWorldX(0, 0)).toBeCloseTo(TILE_SIZE / 2, 6);
    expect(latToWorldY(0, 0)).toBeCloseTo(TILE_SIZE / 2, 6);
    expect(lonToWorldX(-180, 0)).toBeCloseTo(0, 6);
    expect(lonToWorldX(180, 5)).toBeCloseTo(2 ** 5 * TILE_SIZE, 6);
  });

  it("is monotonic: east is right, north is up", () => {
    expect(lonToWorldX(85.4, 11)).toBeGreaterThan(lonToWorldX(84.8, 11));
    expect(latToWorldY(28.3, 11)).toBeLessThan(latToWorldY(27.6, 11));
  });

  it("clamps beyond the Mercator limit instead of returning infinity", () => {
    expect(Number.isFinite(latToWorldY(90, 3))).toBe(true);
    expect(Number.isFinite(latToWorldY(-90, 3))).toBe(true);
  });
});

describe("the corridor view", () => {
  it("covers the bbox the image was cut to", () => {
    const nw = projectToFraction(CORRIDOR_BBOX.north, CORRIDOR_BBOX.west, CORRIDOR_VIEW);
    const se = projectToFraction(CORRIDOR_BBOX.south, CORRIDOR_BBOX.east, CORRIDOR_VIEW);
    expect(isInView(nw)).toBe(true);
    expect(isInView(se)).toBe(true);
    expect(nw.x).toBeLessThan(se.x);
    expect(nw.y).toBeLessThan(se.y);
  });

  it("plots the corridor's places, and only leaves the far-away ones off", () => {
    const inside = places.filter((p) => isInView(projectToFraction(p.lat, p.lon, CORRIDOR_VIEW)));
    expect(inside.length).toBeGreaterThanOrEqual(80);
    for (const id of ["rasuwagadhi", "gyirong_port", "timure", "syabrubesi", "betrawati", "bidur", "devghat", "trishuli_bazar"]) {
      const p = places.find((x) => x.id === id)!;
      expect(isInView(projectToFraction(p.lat, p.lon, CORRIDOR_VIEW)), id).toBe(true);
    }
    for (const id of ["pokhara_pahs", "nawalparasi_west"]) {
      const p = places.find((x) => x.id === id)!;
      expect(isInView(projectToFraction(p.lat, p.lon, CORRIDOR_VIEW)), id).toBe(false);
    }
  });

  it("places Rasuwagadhi north of Betrawati and west of Sindhupalchok", () => {
    const r = projectToFraction(28.27777, 85.37778, CORRIDOR_VIEW);
    const b = projectToFraction(27.9718, 85.1885, CORRIDOR_VIEW);
    expect(r.y).toBeLessThan(b.y);
    expect(r.x).toBeGreaterThan(b.x);
  });
});

describe("the view transform", () => {
  const IMG = { w: 2304, h: 1536 };
  const wide = { w: 800, h: 400 };
  const tall = { w: 390, h: 520 };

  it("covers a box of any shape without distorting the map", () => {
    for (const box of [wide, tall, { w: 1000, h: 1000 }]) {
      const c = coverSize(IMG, box);
      expect(c.w).toBeGreaterThanOrEqual(box.w - 1e-6);
      expect(c.h).toBeGreaterThanOrEqual(box.h - 1e-6);
      expect(c.w / c.h).toBeCloseTo(IMG.w / IMG.h, 6); // aspect preserved
    }
  });

  it("frames a bounding box and keeps the content covering the box", () => {
    const content = coverSize(IMG, wide);
    const t = fitTransform({ x0: 0.4, y0: 0.1, x1: 0.6, y1: 0.4 }, content, wide);
    expect(t.scale).toBeGreaterThan(1);
    expect(t.tx).toBeLessThanOrEqual(0);
    expect(t.tx).toBeGreaterThanOrEqual(wide.w - content.w * t.scale - 1e-6);
    expect(t.ty).toBeGreaterThanOrEqual(wide.h - content.h * t.scale - 1e-6);
  });

  it("never zooms out past the cover size", () => {
    const content = coverSize(IMG, tall);
    expect(clampTransform({ scale: 0.2, tx: 100, ty: 100 }, content, tall).scale).toBe(1);
    expect(fitTransform({ x0: 0, y0: 0, x1: 1, y1: 1 }, content, tall).scale).toBe(1);
  });

  it("zooms about a point, keeping that point still", () => {
    const content = coverSize(IMG, wide);
    const start = { scale: 1, tx: 0, ty: 0 };
    const px = 600;
    const py = 300;
    const z = zoomAbout(start, px, py, 2, content, wide);
    expect(z.scale).toBeCloseTo(2, 6);
    expect((px - z.tx) / z.scale).toBeCloseTo((px - start.tx) / start.scale, 4);
    expect((py - z.ty) / z.scale).toBeCloseTo((py - start.ty) / start.scale, 4);
  });

  it("bounds a set of fractions", () => {
    expect(fractionBounds([])).toBeNull();
    expect(fractionBounds([{ x: 0.2, y: 0.8 }, { x: 0.5, y: 0.1 }])).toEqual({ x0: 0.2, y0: 0.1, x1: 0.5, y1: 0.8 });
  });
});
