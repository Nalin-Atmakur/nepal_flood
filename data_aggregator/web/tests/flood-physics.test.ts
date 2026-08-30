import { describe, expect, it } from "vitest";
import { GRID, sampleBed } from "@/lib/flood-sim";
import { kmToX, meander } from "@/lib/corridor-terrain";
import { makeGroundSampler } from "@/components/three/scene/context";
import { belowGround, kick, makeBody, step, type Flow, type World } from "@/lib/flood-physics";

const bed = sampleBed(GRID);
const groundAt = makeGroundSampler(GRID, bed);
const dry: Flow = { depth: 0, vx: 0, vz: 0, speed: 0, surface: 0 };

function world(flow: (x: number, z: number) => Flow): World {
  return { groundAt, flowAt: flow, visAmp: 1.5 };
}

describe("ground sampler", () => {
  it("interpolates and returns unit normals", () => {
    const g = groundAt(kmToX(20), meander(kmToX(20)));
    expect(g).not.toBeNull();
    expect(Math.hypot(g!.nx, g!.ny, g!.nz)).toBeCloseTo(1, 6);
    expect(g!.ny).toBeGreaterThan(0.3);
    expect(groundAt(1e6, 0)).toBeNull();
  });
});

describe("piece physics", () => {
  it("a dropped piece falls, bounces and settles on the ground — never below it", () => {
    const w = world(() => dry);
    const x = kmToX(30);
    const z = meander(x);
    const g = groundAt(x, z)!;
    const b = makeBody({ x, y: g.y + 12, z }, 0.4);
    let touched = false;
    for (let i = 0; i < 600; i++) {
      touched = step(b, w, 1 / 60) || touched;
      expect(belowGround(b, w)).toBe(false);
    }
    expect(touched).toBe(true);
    expect(b.asleep).toBe(true);
    const gEnd = groundAt(b.p.x, b.p.z)!;
    expect(b.p.y).toBeCloseTo(gEnd.y + b.r, 1);
  });

  it("slides down a steep bank instead of hovering in it", () => {
    const w = world(() => dry);
    // a point up the gorge wall near km 10
    const x = kmToX(10);
    const z = meander(x) + 3.5;
    const g = groundAt(x, z)!;
    const b = makeBody({ x, y: g.y + 0.4, z }, 0.4);
    for (let i = 0; i < 400; i++) {
      step(b, w, 1 / 60);
      expect(belowGround(b, w)).toBe(false);
    }
    // it moved toward the channel (lower ground)
    expect(Math.abs(b.p.z - meander(b.p.x))).toBeLessThan(3.5);
  });

  it("in a flow it moves downstream and rides the surface, never tunnelling", () => {
    const x0 = kmToX(20);
    const z0 = meander(x0);
    const w = world((x, z) => {
      const g = groundAt(x, z);
      return { depth: 2, vx: 20, vz: 0, speed: 20, surface: (g?.y ?? 0) + 3 };
    });
    const g = groundAt(x0, z0)!;
    const b = makeBody({ x: x0, y: g.y + 1, z: z0 }, 0.4);
    kick(b, w.flowAt(x0, z0), 0.37);
    for (let i = 0; i < 300; i++) {
      step(b, w, 1 / 60);
      expect(belowGround(b, w)).toBe(false);
    }
    expect(b.p.x).toBeGreaterThan(x0 + 5);
    expect(b.asleep).toBe(false);
    expect(Math.hypot(b.v.x, b.v.z)).toBeLessThanOrEqual(14 + 1e-6);
  });

  it("spin decays and a sleeping body wakes when water arrives", () => {
    let wet = false;
    const w = world((x, z) => (wet ? { depth: 1, vx: 8, vz: 0, speed: 8, surface: (groundAt(x, z)?.y ?? 0) + 1.5 } : dry));
    const x = kmToX(40);
    const z = meander(x);
    const g = groundAt(x, z)!;
    const b = makeBody({ x, y: g.y + 0.4, z }, 0.4);
    b.w.y = 6;
    for (let i = 0; i < 300; i++) step(b, w, 1 / 60);
    expect(b.asleep).toBe(true);
    expect(Math.abs(b.w.y)).toBeLessThan(0.01);
    wet = true;
    step(b, w, 1 / 60);
    expect(b.asleep).toBe(false);
  });
});
