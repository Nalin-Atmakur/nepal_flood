import { describe, expect, it } from "vitest";
import type { DigestRow, EventTimelineRow } from "@/lib/queries";
import { isAlarmKind, isEventKind, normaliseBullets, pickDigest, splitTimeline } from "@/lib/story";

function ev(id: string, at: string, kind = "gauge"): EventTimelineRow {
  return {
    id,
    at,
    at_label: "",
    place_id: null,
    km: null,
    what_en: id,
    what_ne: null,
    what_hi: null,
    kind,
    source: null,
    source_url: null,
    place_name_en: null,
    place_name_ne: null,
    place_name_hi: null,
  };
}

describe("splitTimeline()", () => {
  it("keeps the event day (Nepal time) first and everything later under 'later', both sorted by at", () => {
    const rows = [
      ev("d3", "2026-08-28T10:00:00Z"),
      ev("t0837", "2026-08-26T02:52:00Z"),
      ev("t0820", "2026-08-26T02:35:00Z"),
      ev("d2", "2026-08-28T04:30:00Z"),
      ev("late_night", "2026-08-26T17:30:00Z"), // 23:15 NPT — still 26 Aug
      ev("after_midnight", "2026-08-26T18:30:00Z"), // 00:15 NPT on 27 Aug
    ];
    const { first, later } = splitTimeline(rows);
    expect(first.map((r) => r.id)).toEqual(["t0820", "t0837", "late_night"]);
    expect(later.map((r) => r.id)).toEqual(["after_midnight", "d2", "d3"]);
  });

  it("puts lead-up rows before the event day into 'first' and copes with nothing", () => {
    const { first, later } = splitTimeline([ev("prev", "2026-08-25T10:00:00Z")]);
    expect(first.map((r) => r.id)).toEqual(["prev"]);
    expect(later).toEqual([]);
    expect(splitTimeline(null)).toEqual({ first: [], later: [] });
    expect(splitTimeline([])).toEqual({ first: [], later: [] });
  });
});

describe("event kinds", () => {
  it("recognises the six kinds and flags trigger/warning as alarms", () => {
    for (const k of ["trigger", "wave", "gauge", "warning", "impact", "response"]) expect(isEventKind(k), k).toBe(true);
    expect(isEventKind("event")).toBe(false);
    expect(isEventKind(null)).toBe(false);
    expect(isAlarmKind("trigger")).toBe(true);
    expect(isAlarmKind("warning")).toBe(true);
    expect(isAlarmKind("gauge")).toBe(false);
  });
});

describe("normaliseBullets()", () => {
  it("keeps well-formed bullets, defaults unknown kinds to news and drops junk", () => {
    const out = normaliseBullets([
      { text: "NDRRMA dead 41 → 44", kind: "figure", source_url: "https://bipadportal.gov.np/" },
      { text: "  Timure reached  ", kind: "place" },
      { text: "Something", kind: "rumour", source_url: "javascript:alert(1)" },
      { text: "", kind: "news" },
      { kind: "gauge" },
      "a string",
      null,
    ]);
    expect(out).toEqual([
      { text: "NDRRMA dead 41 → 44", kind: "figure", source_url: "https://bipadportal.gov.np/" },
      { text: "Timure reached", kind: "place", source_url: null },
      { text: "Something", kind: "news", source_url: null },
    ]);
  });

  it("returns [] for anything that is not an array", () => {
    expect(normaliseBullets(null)).toEqual([]);
    expect(normaliseBullets({ text: "x" })).toEqual([]);
    expect(normaliseBullets("[]")).toEqual([]);
  });
});

describe("pickDigest()", () => {
  const row = (day: string, lang: DigestRow["lang"], n = 1): DigestRow => ({
    day,
    lang,
    headline: `${lang} ${day}`,
    bullets: Array.from({ length: n }, (_, i) => ({ text: `b${i}`, kind: "news" as const, source_url: null })),
    computed_at: `${day}T06:00:00Z`,
  });

  it("prefers the requested language for the latest day, then EN, then nothing", () => {
    const rows = [row("2026-08-29", "ne"), row("2026-08-30", "en"), row("2026-08-30", "ne")];
    expect(pickDigest(rows, "ne")?.headline).toBe("ne 2026-08-30");
    expect(pickDigest(rows, "hi")?.headline).toBe("en 2026-08-30");
    expect(pickDigest([row("2026-08-30", "ne")], "hi")).toBeNull(); // no EN for that day → hide
    expect(pickDigest([row("2026-08-30", "ne")], "en")).toBeNull();
  });

  it("never shows an empty digest and never reaches back to an older day", () => {
    expect(pickDigest([{ ...row("2026-08-30", "en", 0), headline: "" }], "en")).toBeNull();
    expect(pickDigest([row("2026-08-29", "en"), { ...row("2026-08-30", "en", 0), headline: "" }], "en")?.day).toBe("2026-08-29");
    expect(pickDigest(null, "en")).toBeNull();
    expect(pickDigest([], "en")).toBeNull();
  });
});
