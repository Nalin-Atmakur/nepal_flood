import { describe, expect, it } from "vitest";

describe("browser command contract", () => {
  it("uses an ignored work-directory transport", async () => {
    const { WORK_ROOT } = await import("../src/constants.js");
    expect(WORK_ROOT).toContain("/.work");
  });
});
