import { describe, expect, it } from "vitest";
import { fmtDay, fmtDayTime, fmtInt, fmtSinceArcade, normaliseKey, prettySourceName } from "@/lib/format";

describe("fmtInt()", () => {
  it("groups thousands with Latin digits", () => {
    expect(fmtInt(2498)).toBe("2,498");
    expect(fmtInt(675)).toBe("675");
    expect(fmtInt(1234567)).toBe("1,234,567");
    expect(fmtInt("4451")).toBe("4,451");
  });

  it("shows a dash for nothing", () => {
    expect(fmtInt(null)).toBe("—");
    expect(fmtInt(undefined)).toBe("—");
    expect(fmtInt("")).toBe("—");
  });
});

describe("fmtDayTime() / fmtDay()", () => {
  it("renders in Nepal time (UTC+5:45)", () => {
    expect(fmtDayTime("2026-08-29T12:45:00Z")).toBe("29 Aug 18:30");
    expect(fmtDayTime("2026-08-29T19:00:00Z")).toBe("30 Aug 00:45");
    expect(fmtDay("2026-08-29T12:45:00Z")).toBe("29 Aug");
  });

  it("uses Latin digits with a localised month", () => {
    expect(fmtDayTime("2026-08-29T12:45:00Z", "ne")).toBe("29 अग 18:30");
    expect(fmtDayTime("2026-08-29T12:45:00Z", "hi")).toBe("29 अग 18:30");
  });

  it("dashes out missing or invalid input", () => {
    expect(fmtDayTime(null)).toBe("—");
    expect(fmtDayTime("not a date")).toBe("—");
  });
});

describe("fmtSinceArcade()", () => {
  const now = new Date("2026-08-29T12:00:00Z");
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

  it("prints minutes under an hour", () => {
    expect(fmtSinceArcade(minutesAgo(4), now)).toBe("4 MIN");
    expect(fmtSinceArcade(minutesAgo(4).toISOString(), now)).toBe("4 MIN");
  });

  it("prints hours and minutes above an hour", () => {
    expect(fmtSinceArcade(minutesAgo(134), now)).toBe("2 H 14 MIN");
    expect(fmtSinceArcade(minutesAgo(120), now)).toBe("2 H");
  });

  it("dashes out nothing", () => {
    expect(fmtSinceArcade(null, now)).toBe("—");
  });
});

describe("normaliseKey()", () => {
  it("lower-cases and strips diacritics in Latin", () => {
    expect(normaliseKey("Shyaprubesi")).toBe("shyaprubesi");
    expect(normaliseKey("  Syāphru-besi ")).toBe("syaphru besi");
  });

  it("is stable and lowercase-safe for Devanagari", () => {
    const a = normaliseKey("स्याफ्रुबेसी");
    expect(a.length).toBeGreaterThan(0);
    expect(normaliseKey(a)).toBe(a);
    expect(a.toLowerCase()).toBe(a);
    expect(normaliseKey("स्याफ्रुबेसी")).toBe(a);
  });
});

describe("prettySourceName()", () => {
  it("upper-cases known acronyms and lower-cases the rest", () => {
    expect(prettySourceName("Opmcm Stats")).toBe("OPMCM stats");
    expect(prettySourceName("ndrrma bipad portal")).toBe("NDRRMA BIPAD portal");
  });

  it("falls back to the id", () => {
    expect(prettySourceName(null, "dhm_gauges")).toBe("DHM gauges");
  });
});
