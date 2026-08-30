import { describe, expect, it } from "vitest";
import { CATALOGUE, MAX_OBJECTS, OBJECT_KINDS, catalogue, isSwept, massFactor, snapToPath } from "@/lib/object-catalogue";

describe("object catalogue", () => {
  it("has 14 non-sensitive kinds, each with parts whose masses sum to ~1", () => {
    expect(OBJECT_KINDS.length).toBe(14);
    expect(OBJECT_KINDS).not.toContain("school");
    expect(OBJECT_KINDS).not.toContain("temple");
    expect(OBJECT_KINDS).toContain("office");
    for (const c of CATALOGUE) {
      expect(c.parts.length).toBeGreaterThan(0);
      const m = c.parts.reduce((s, p) => s + (p.mass ?? 0), 0);
      expect(m).toBeGreaterThan(0.9);
      expect(m).toBeLessThan(1.1);
      expect(c.radius).toBeGreaterThan(0);
      expect(c.threshold.depth).toBeGreaterThan(0);
    }
    expect(MAX_OBJECTS).toBe(24);
  });
  it("heavier things need a bigger flood; the bridge and mast are anchored", () => {
    expect(catalogue("camp").threshold.depth).toBeLessThan(catalogue("house").threshold.depth);
    expect(catalogue("house").threshold.depth).toBeLessThan(catalogue("boulder").threshold.depth);
    expect(catalogue("bridge").mass).toBe("anchored");
    expect(isSwept("camp", 0.2, 0.5)).toBe(true);
    expect(isSwept("boulder", 0.2, 0.5)).toBe(false);
    expect(massFactor("light")).toBeGreaterThan(massFactor("heavy"));
  });
  it("snaps to the path: channel-spanning kinds exactly, others onto the bank", () => {
    expect(snapToPath("bridge", 3, 4, 1)).toEqual({ x: 3, z: 1 });
    expect(snapToPath("house", 3, 4, 1)).toEqual({ x: 3, z: 1.9 });
    expect(snapToPath("house", 3, -20, 1)).toEqual({ x: 3, z: -20 });
  });
  it("throws on an unknown kind", () => {
    expect(() => catalogue("castle" as never)).toThrow();
  });
});
