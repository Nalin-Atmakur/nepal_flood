import { describe, expect, it } from "vitest";
import { approximateRaySeparationDeg } from "../src/catalogue/pairs.js";

describe("approximate viewing-ray separation", () => {
  it("reproduces the approximately 30 degree SkySat/Pelican metadata estimate", () => {
    const separation = approximateRaySeparationDeg(28.9, 3.7, 3.8, 256.1);
    expect(separation).not.toBeNull();
    expect(separation!).toBeGreaterThan(29);
    expect(separation!).toBeLessThan(32);
  });

  it("identifies the strongly opposed Vantor look directions", () => {
    const separation = approximateRaySeparationDeg(9.13, 17.54, 26.56, 190.45);
    expect(separation).not.toBeNull();
    expect(separation!).toBeGreaterThan(34);
  });

  it("returns null without complete metadata", () => {
    expect(approximateRaySeparationDeg(null, 0, 10, 180)).toBeNull();
  });
});
