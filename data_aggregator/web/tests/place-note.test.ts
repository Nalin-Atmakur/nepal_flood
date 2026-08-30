import { describe, expect, it } from "vitest";
import { noteFor } from "@/components/blocks/PlacesTable";
import { isDerivedSource } from "@/app/[lang]/sources/page";

describe("places table note", () => {
  it("prefers the localised now-line, strips the 'As of …:' prefix and truncates on a word", () => {
    const long = "As of 30 Aug 09:19: " + "word ".repeat(60).trim();
    const out = noteFor({ note: "ledger note", now_en: long, now_ne: null, now_hi: null }, "en");
    expect(out.startsWith("word word")).toBe(true);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(141);
    expect(noteFor({ note: "ledger note", now_en: "As of 30 Aug: 5 open help requests", now_ne: "५ खुला", now_hi: null }, "ne")).toBe("५ खुला");
  });
  it("falls back to the ledger note, then empty", () => {
    expect(noteFor({ note: "bridge to inspect", now_en: null, now_ne: null, now_hi: null }, "en")).toBe("bridge to inspect");
    expect(noteFor({ note: null, now_en: null, now_ne: null, now_hi: null }, "hi")).toBe("");
  });
});

describe("derived sources", () => {
  it("treats '(derived …)' urls, empty urls and family=derived as derived", () => {
    expect(isDerivedSource({ url: "(derived from outlet_rss_* sources)", family: "rss" })).toBe(true);
    expect(isDerivedSource({ url: null, family: "rss" })).toBe(true);
    expect(isDerivedSource({ url: "https://x", family: "derived" })).toBe(true);
    expect(isDerivedSource({ url: "https://x", family: "rss" })).toBe(false);
  });
});
