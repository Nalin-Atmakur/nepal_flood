import { describe, expect, it } from "vitest";
import { CHROME_BOUNDS } from "../src/constants.js";
import { isWithinSecondaryDisplay } from "../src/browser/launch.js";

describe("headed browser placement", () => {
  it("places the configured window within secondary display 1", () => {
    expect(isWithinSecondaryDisplay(CHROME_BOUNDS)).toBe(true);
  });

  it("rejects a window on the primary display", () => {
    expect(isWithinSecondaryDisplay({ x: 10, y: 10, width: 1000, height: 800 })).toBe(false);
  });
});
