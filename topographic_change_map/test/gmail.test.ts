import { describe, expect, it } from "vitest";

describe("Gmail verification security policy", () => {
  it("keeps authentication screenshots in the ignored work directory", async () => {
    const { WORK_ROOT } = await import("../src/constants.js");
    expect(WORK_ROOT.endsWith("topographic_change_map/.work")).toBe(true);
  });
});
