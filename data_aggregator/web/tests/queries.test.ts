import { describe, expect, it } from "vitest";
import { pickFigure, type FigureLatest } from "@/lib/queries";

const row = (publisher: string, metric: string, value: number): FigureLatest =>
  ({ publisher, metric, scope: "national", value, as_of: "2026-08-29T12:45:00Z", url: null, note: null, computed_at: "2026-08-30T00:00:00Z" }) as FigureLatest;

const rows = [
  row("NDRRMA", "dead", 675),
  row("Nepal Police (via press)", "dead", 669),
  row("Nepal Police (UDB)", "bodies_recorded", 560),
  row("OPMCM portal", "lost_open", 10809),
];

describe("pickFigure", () => {
  it("matches a single publisher case-insensitively and in metric order", () => {
    expect(pickFigure(rows, "ndrrma", ["missing", "dead"])?.value).toBe(675);
    expect(pickFigure(rows, "NDRRMA", ["missing"])).toBeNull();
  });
  it("tries publisher spellings in order and returns the first with a matching metric", () => {
    expect(pickFigure(rows, ["Nepal Police", "Nepal Police (via press)", "Nepal Police (UDB)"], ["dead", "bodies_recorded"])?.value).toBe(669);
    expect(pickFigure(rows, ["Nepal Police (UDB)", "Nepal Police (via press)"], ["dead", "bodies_recorded"])?.value).toBe(560);
    expect(pickFigure(rows, ["OPMCM portal", "OPMCM"], ["lost_open"])?.value).toBe(10809);
  });
  it("returns null for no rows", () => {
    expect(pickFigure(null, ["NDRRMA"], ["dead"])).toBeNull();
  });
});
