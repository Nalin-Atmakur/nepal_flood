import { describe, expect, it } from "vitest";
import { pickStatCards } from "@/lib/stats-pick";
import type { StatRow } from "@/lib/queries";

const row = (id: string, numeric: number | null, value = "x"): StatRow =>
  ({ id, value, numeric, caption_en: id, caption_ne: null, caption_hi: null, source_url: null, as_of: null, computed_at: "" }) as StatRow;

describe("pickStatCards", () => {
  it("skips reports_total until five people have contributed and fills from ranked live facts", () => {
    const rows = [row("wave_time_to_port", 7), row("wave_speed", 193), row("galchhi_rise", 9), row("bodies_downstream_km", 240),
      row("reports_total", 0), row("personnel_deployed", 18708), row("towers_restored_pct", 73), row("towers_restored", 145), row("heli_flights", 261)];
    const ids = pickStatCards(rows).map((r) => r.id);
    expect(ids).toEqual(["wave_time_to_port", "wave_speed", "galchhi_rise", "bodies_downstream_km", "personnel_deployed", "towers_restored_pct"]);
    expect(ids).not.toContain("reports_total");
  });
  it("never promotes the private intake count into public stat cards", () => {
    const rows = [row("wave_time_to_port", 7), row("reports_total", 12)];
    const picked = pickStatCards(rows);
    expect(picked.map((r) => r.id)).toEqual(["wave_time_to_port"]);
  });
  it("tolerates empty input", () => {
    expect(pickStatCards(null)).toEqual([]);
  });
});
