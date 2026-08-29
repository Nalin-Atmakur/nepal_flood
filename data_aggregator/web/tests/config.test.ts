import { describe, expect, it } from "vitest";
import {
  AGENCIES,
  PULL_INTERVAL_MINUTES,
  SITE_HOST,
  STALE_AFTER_MINUTES,
  cadenceParts,
  refreshLabel,
} from "@/lib/config";

describe("refreshLabel()", () => {
  it("prints whole hours as H and everything else as MIN", () => {
    expect(refreshLabel(240)).toBe("EVERY 4 H");
    expect(refreshLabel(60)).toBe("EVERY 1 H");
    expect(refreshLabel(15)).toBe("EVERY 15 MIN");
    expect(refreshLabel(90)).toBe("EVERY 90 MIN");
  });

  it("defaults to the pipeline cadence", () => {
    expect(refreshLabel()).toBe(refreshLabel(PULL_INTERVAL_MINUTES));
  });
});

describe("cadenceParts()", () => {
  it("splits minutes into a number and a unit", () => {
    expect(cadenceParts(240)).toEqual({ n: 4, unit: "hours" });
    expect(cadenceParts(60)).toEqual({ n: 1, unit: "hours" });
    expect(cadenceParts(15)).toEqual({ n: 15, unit: "minutes" });
  });
});

describe("constants", () => {
  it("keeps the stale threshold at 1.5× the cadence (6 h)", () => {
    expect(PULL_INTERVAL_MINUTES).toBe(240);
    expect(STALE_AFTER_MINUTES).toBe(360);
  });

  it("names the public host", () => {
    expect(SITE_HOST).toBe("nepalfloodtracker.com");
  });

  it("lists the five agencies in design order", () => {
    expect(AGENCIES.map((a) => a.publisher)).toEqual(["NDRRMA", "Nepal Police", "MoFA", "DoT", "OPMCM"]);
    for (const a of AGENCIES) {
      expect(a.dead.length).toBeGreaterThan(0);
      expect(a.missing.length).toBeGreaterThan(0);
      expect(a.rescued.length).toBeGreaterThan(0);
      expect(a.url.startsWith("https://")).toBe(true);
    }
  });
});
