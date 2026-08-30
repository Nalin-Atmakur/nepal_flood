import { describe, expect, it } from "vitest";
import type { SeriesPoint } from "@/lib/queries";
import { deltaSinceYesterday, fmtDelta, seriesFor, sparkPoints } from "@/lib/trends";

const pt = (metric: string, day: string, value: number, publisher = "NDRRMA"): SeriesPoint => ({ publisher, metric, scope: "national", day, value, as_of: null });

describe("trends", () => {
  const rows = [pt("dead", "2026-08-27", 389), pt("dead", "2026-08-29", 675), pt("dead", "2026-08-28", 579), pt("missing", "2026-08-29", 2498), pt("dead", "2026-08-29", 600, "MoFA")];
  it("seriesFor filters, sorts by day and is publisher-case-insensitive", () => {
    expect(seriesFor(rows, "ndrrma", "dead").map((p) => p.value)).toEqual([389, 579, 675]);
    expect(seriesFor(rows, "NDRRMA", "rescued")).toEqual([]);
    expect(seriesFor(null, "NDRRMA", "dead")).toEqual([]);
  });
  it("deltaSinceYesterday needs two points", () => {
    expect(deltaSinceYesterday(seriesFor(rows, "NDRRMA", "dead"))).toBe(96);
    expect(deltaSinceYesterday(seriesFor(rows, "NDRRMA", "missing"))).toBeNull();
  });
  it("fmtDelta uses Latin digits, a plus and a real minus", () => {
    expect(fmtDelta(1234)).toBe("+1,234");
    expect(fmtDelta(-3)).toBe("−3");
    expect(fmtDelta(0)).toBe("0");
  });
  it("sparkPoints scales into the box and handles flat series", () => {
    const pts = sparkPoints([1, 3, 2], 60, 20).split(" ");
    expect(pts).toHaveLength(3);
    expect(pts[1].split(",")[1]).toBe("2.0"); // the max sits at the top pad
    expect(sparkPoints([5, 5], 60, 20).split(" ").every((p) => p.endsWith(",10.0"))).toBe(true);
    expect(sparkPoints([], 60, 20)).toBe("");
  });
});
