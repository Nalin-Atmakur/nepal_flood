import { describe, expect, it } from "vitest";
import { attributeValue } from "../src/catalogue/sentinel2.js";

describe("Sentinel-2 catalogue normalization", () => {
  it("preserves zero and distinguishes a missing attribute", () => {
    const attributes = [
      { Name: "cloudCover", Value: 0 },
      { Name: "tileId", Value: "45RTM" },
    ];
    expect(attributeValue(attributes, "cloudCover")).toBe(0);
    expect(attributeValue(attributes, "tileId")).toBe("45RTM");
    expect(attributeValue(attributes, "missing")).toBeNull();
  });
});
