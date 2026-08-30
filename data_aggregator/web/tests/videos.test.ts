import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FEATURED_VIDEOS, FLOOD_VIDEOS, YOUTUBE_ID, videoEmbed, videoThumb, videoWatch } from "@/lib/videos";

const gazetteerIds = new Set(
  readFileSync(join(__dirname, "..", "..", "gazetteer", "places.csv"), "utf8")
    .split("\n")
    .slice(1)
    .map((l) => l.split(",")[0])
    .filter(Boolean),
);

describe("curated flood videos", () => {
  it("has well-formed, unique YouTube ids", () => {
    const ids = FLOOD_VIDEOS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(YOUTUBE_ID);
  });
  it("every clip carries a credit, a verified title, a checked date and captions in all three languages", () => {
    for (const v of FLOOD_VIDEOS) {
      expect(v.credit.length).toBeGreaterThan(1);
      expect(v.creditUrl).toMatch(/^https:\/\/www\.youtube\.com\//);
      expect(v.title.length).toBeGreaterThan(8);
      expect(v.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const l of ["en", "ne", "hi"] as const) expect(v.caption[l].trim().length).toBeGreaterThan(4);
    }
  });
  it("place ids point at the gazetteer", () => {
    for (const v of FLOOD_VIDEOS) if (v.placeId) expect(gazetteerIds.has(v.placeId), v.placeId).toBe(true);
  });
  it("features exactly three clips under the simulation", () => {
    expect(FEATURED_VIDEOS).toHaveLength(3);
    expect(FEATURED_VIDEOS.every((v) => v.featured)).toBe(true);
  });
  it("builds poster, embed and watch URLs", () => {
    expect(videoThumb("abc")).toBe("https://i.ytimg.com/vi/abc/hqdefault.jpg");
    expect(videoEmbed("abc")).toContain("youtube-nocookie.com/embed/abc");
    expect(videoWatch("abc")).toBe("https://www.youtube.com/watch?v=abc");
  });
});
