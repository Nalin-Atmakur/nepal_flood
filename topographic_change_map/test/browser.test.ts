import { describe, expect, it } from "vitest";
import { CHROME_BOUNDS } from "../src/constants.js";
import { isWithinTargetDisplay } from "../src/browser/launch.js";

describe("headed browser placement", () => {
  it("places the configured window within secondary display 1", () => {
    expect(isWithinTargetDisplay(CHROME_BOUNDS)).toBe(true);
  });

  it("rejects a window on the primary display", () => {
    expect(isWithinTargetDisplay({ x: 10, y: 10, width: 1000, height: 800 })).toBe(false);
  });
});
