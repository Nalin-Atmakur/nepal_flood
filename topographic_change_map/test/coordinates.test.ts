import { describe, expect, it } from "vitest";
import {
  cellCenterToUtm,
  sceneToUtm,
  utmToGridCell,
  utmToScene,
} from "../viewer/src/coordinates.js";

const grid = {
  width: 250,
  height: 493,
  originX: 334277,
  originY: 3129604,
  resolutionM: 32,
};

describe("viewer coordinate synchronization", () => {
  it("round-trips a raster cell through UTM", () => {
    const [east, north] = cellCenterToUtm(grid, 42, 123);
    expect(utmToGridCell(grid, east, north)).toEqual({ col: 42, row: 123 });
  });

  it("round-trips UTM through the Three.js scene", () => {
    const [east, north] = cellCenterToUtm(grid, 180, 320);
    const [x, y] = utmToScene(grid, east, north);
    const restored = sceneToUtm(grid, x, y);
    expect(restored[0]).toBeCloseTo(east, 8);
    expect(restored[1]).toBeCloseTo(north, 8);
  });

  it("rejects coordinates outside the raster", () => {
    expect(utmToGridCell(grid, 0, 0)).toBeNull();
  });
});
