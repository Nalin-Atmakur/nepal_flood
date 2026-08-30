/**
 * The things a visitor can drop in the flood's path (web/docs/16-corridor-v2-plan.md §3.1). Pure data: the scene
 * builds meshes from `parts`, the physics uses `mass`/`threshold`/`breaks`. Every part is a primitive in the design
 * palette; sizes are in scene units before `scale`. Nothing sensitive (no schools, temples, hospitals).
 */
export type ObjectKind =
  | "house"
  | "lodge"
  | "office"
  | "bridge"
  | "bus"
  | "jeep"
  | "truck"
  | "tanker"
  | "excavator"
  | "camp"
  | "container"
  | "mast"
  | "boulder"
  | "tree";

export type Palette = "wall" | "roof" | "ink" | "amber" | "ultra" | "steel" | "rock" | "leaf" | "trunk" | "red" | "glass";

export type PartShape = "box" | "cone" | "cylinder" | "sphere" | "dodeca";
export type Part = {
  shape: PartShape;
  /** box: w,h,d · cone/cylinder: r,h,segments · sphere: r,segs · dodeca: r */
  size: [number, number, number?];
  /** offset from the object's ground point (y = up) */
  at: [number, number, number];
  rotY?: number;
  colour: Palette;
  /** roughly how much of the object's mass this part is (for break impulses) */
  mass?: number;
};

export type MassClass = "light" | "medium" | "heavy" | "anchored";

export type Catalogue = {
  kind: ObjectKind;
  /** i18n key suffix (corridor.obj.<kind>) */
  emoji: string;
  mass: MassClass;
  /** depth (units) and speed (units/s) at which the flow takes it */
  threshold: { depth: number; speed: number };
  /** spans the channel: snapped exactly onto it and aligned across it */
  spansChannel?: boolean;
  /** overall scale applied to `parts` */
  scale: number;
  /** collision radius of a piece (units, after scale) — how far above ground its centre sits */
  radius: number;
  parts: Part[];
};

const C = (kind: ObjectKind, emoji: string, mass: MassClass, threshold: Catalogue["threshold"], scale: number, radius: number, parts: Part[], extra: Partial<Catalogue> = {}): Catalogue => ({
  kind,
  emoji,
  mass,
  threshold,
  scale,
  radius,
  parts,
  ...extra,
});

export const CATALOGUE: Catalogue[] = [
  C("house", "🏠", "medium", { depth: 0.5, speed: 1.2 }, 2.8, 0.45, [
    { shape: "box", size: [1.6, 1.2, 1.4], at: [0, 0.6, 0], colour: "wall", mass: 0.6 },
    { shape: "cone", size: [1.35, 0.9, 4], at: [0, 1.65, 0], rotY: Math.PI / 4, colour: "roof", mass: 0.4 },
  ]),
  C("lodge", "🏨", "heavy", { depth: 0.7, speed: 1.6 }, 2.8, 0.5, [
    { shape: "box", size: [2.2, 1.2, 1.6], at: [0, 0.6, 0], colour: "wall", mass: 0.35 },
    { shape: "box", size: [2.2, 1.1, 1.6], at: [0, 1.75, 0], colour: "wall", mass: 0.35 },
    { shape: "cone", size: [1.8, 0.9, 4], at: [0, 2.75, 0], rotY: Math.PI / 4, colour: "roof", mass: 0.3 },
  ]),
  C("office", "🏢", "heavy", { depth: 0.9, speed: 2.0 }, 2.8, 0.6, [
    { shape: "box", size: [2.0, 1.3, 2.0], at: [0, 0.65, 0], colour: "glass", mass: 0.3 },
    { shape: "box", size: [2.0, 1.3, 2.0], at: [0, 1.95, 0], colour: "glass", mass: 0.3 },
    { shape: "box", size: [2.0, 1.3, 2.0], at: [0, 3.25, 0], colour: "glass", mass: 0.25 },
    { shape: "box", size: [2.1, 0.25, 2.1], at: [0, 4.0, 0], colour: "ink", mass: 0.15 },
  ]),
  C(
    "bridge",
    "🌉",
    "anchored",
    { depth: 0.9, speed: 2.5 },
    2.2,
    0.3,
    [
      { shape: "box", size: [1.0, 0.16, 4.4], at: [0, 1.3, 0], colour: "steel", mass: 0.4 },
      { shape: "box", size: [0.08, 0.32, 4.4], at: [-0.46, 1.54, 0], colour: "ink", mass: 0.1 },
      { shape: "box", size: [0.08, 0.32, 4.4], at: [0.46, 1.54, 0], colour: "ink", mass: 0.1 },
      { shape: "box", size: [0.5, 1.3, 0.5], at: [0, 0.65, -1.7], colour: "rock", mass: 0.2 },
      { shape: "box", size: [0.5, 1.3, 0.5], at: [0, 0.65, 1.7], colour: "rock", mass: 0.2 },
    ],
    { spansChannel: true },
  ),
  C("bus", "🚌", "medium", { depth: 0.3, speed: 0.9 }, 2.8, 0.4, [
    { shape: "box", size: [2.6, 1.0, 1.1], at: [0, 0.85, 0], colour: "amber", mass: 0.7 },
    { shape: "box", size: [2.4, 0.35, 1.12], at: [0, 1.05, 0], colour: "glass", mass: 0.1 },
    { shape: "box", size: [0.5, 0.35, 1.25], at: [-0.8, 0.25, 0], colour: "ink", mass: 0.1 },
    { shape: "box", size: [0.5, 0.35, 1.25], at: [0.8, 0.25, 0], colour: "ink", mass: 0.1 },
  ]),
  C("jeep", "🚙", "light", { depth: 0.2, speed: 0.6 }, 2.8, 0.32, [
    { shape: "box", size: [1.7, 0.6, 1.0], at: [0, 0.55, 0], colour: "leaf", mass: 0.5 },
    { shape: "box", size: [0.9, 0.5, 0.95], at: [-0.1, 1.1, 0], colour: "glass", mass: 0.2 },
    { shape: "box", size: [0.4, 0.4, 1.15], at: [-0.55, 0.2, 0], colour: "ink", mass: 0.15 },
    { shape: "box", size: [0.4, 0.4, 1.15], at: [0.55, 0.2, 0], colour: "ink", mass: 0.15 },
  ]),
  C("truck", "🚚", "medium", { depth: 0.4, speed: 1.1 }, 2.8, 0.45, [
    { shape: "box", size: [0.9, 0.9, 1.1], at: [-1.1, 0.75, 0], colour: "red", mass: 0.25 },
    { shape: "box", size: [2.0, 1.2, 1.15], at: [0.5, 0.95, 0], colour: "steel", mass: 0.55 },
    { shape: "box", size: [0.5, 0.4, 1.25], at: [-1.1, 0.2, 0], colour: "ink", mass: 0.1 },
    { shape: "box", size: [0.5, 0.4, 1.25], at: [0.9, 0.2, 0], colour: "ink", mass: 0.1 },
  ]),
  C("tanker", "🛢️", "medium", { depth: 0.4, speed: 1.0 }, 2.8, 0.45, [
    { shape: "box", size: [0.9, 0.9, 1.1], at: [-1.2, 0.75, 0], colour: "ultra", mass: 0.2 },
    { shape: "cylinder", size: [0.55, 2.1, 12], at: [0.5, 0.95, 0], rotY: 0, colour: "steel", mass: 0.6 },
    { shape: "box", size: [0.5, 0.4, 1.25], at: [-1.2, 0.2, 0], colour: "ink", mass: 0.1 },
    { shape: "box", size: [0.5, 0.4, 1.25], at: [1.0, 0.2, 0], colour: "ink", mass: 0.1 },
  ]),
  C("excavator", "🚜", "heavy", { depth: 0.6, speed: 1.5 }, 2.8, 0.5, [
    { shape: "box", size: [2.0, 0.5, 1.3], at: [0, 0.3, 0], colour: "ink", mass: 0.3 },
    { shape: "box", size: [1.3, 0.9, 1.1], at: [-0.2, 1.0, 0], colour: "amber", mass: 0.4 },
    { shape: "box", size: [1.8, 0.25, 0.3], at: [1.2, 1.4, 0], colour: "amber", mass: 0.2 },
    { shape: "box", size: [0.6, 0.5, 0.5], at: [2.0, 0.9, 0], colour: "steel", mass: 0.1 },
  ]),
  C("camp", "⛺", "light", { depth: 0.1, speed: 0.4 }, 2.8, 0.3, [
    { shape: "cone", size: [0.9, 1.1, 5], at: [0, 0.55, 0], colour: "amber", mass: 0.4 },
    { shape: "cone", size: [0.7, 0.9, 5], at: [1.4, 0.45, 0.6], colour: "ultra", mass: 0.3 },
    { shape: "cone", size: [0.7, 0.9, 5], at: [-1.2, 0.45, -0.5], colour: "amber", mass: 0.3 },
  ]),
  C("container", "📦", "medium", { depth: 0.35, speed: 1.0 }, 2.8, 0.45, [
    { shape: "box", size: [2.4, 1.0, 1.0], at: [0, 0.5, 0], colour: "red", mass: 0.5 },
    { shape: "box", size: [2.4, 1.0, 1.0], at: [0.3, 1.5, 0.1], rotY: 0.15, colour: "ultra", mass: 0.5 },
  ]),
  C("mast", "📡", "anchored", { depth: 0.8, speed: 2.2 }, 2.8, 0.3, [
    { shape: "box", size: [1.0, 0.3, 1.0], at: [0, 0.15, 0], colour: "steel", mass: 0.3 },
    { shape: "cylinder", size: [0.12, 3.2, 6], at: [0, 1.9, 0], colour: "steel", mass: 0.5 },
    { shape: "box", size: [0.5, 0.35, 0.12], at: [0.25, 3.1, 0], colour: "wall", mass: 0.2 },
  ]),
  C("boulder", "🪨", "heavy", { depth: 1.2, speed: 3.0 }, 2.8, 0.6, [{ shape: "dodeca", size: [0.9, 0, 0], at: [0, 0.8, 0], colour: "rock", mass: 1 }]),
  C("tree", "🌲", "light", { depth: 0.3, speed: 1.0 }, 2.8, 0.35, [
    { shape: "cylinder", size: [0.16, 1.2, 6], at: [0, 0.6, 0], colour: "trunk", mass: 0.3 },
    { shape: "cone", size: [0.8, 1.6, 6], at: [0, 1.9, 0], colour: "leaf", mass: 0.7 },
  ]),
];

export const OBJECT_KINDS: ObjectKind[] = CATALOGUE.map((c) => c.kind);
export const MAX_OBJECTS = 24;

const BY_KIND = new Map(CATALOGUE.map((c) => [c.kind, c]));
export function catalogue(kind: ObjectKind): Catalogue {
  const c = BY_KIND.get(kind);
  if (!c) throw new Error(`unknown object kind ${kind}`);
  return c;
}

/** Sweep rule: depth and speed both over the kind's threshold (heavier things need a real flood). */
export function isSwept(kind: ObjectKind, depth: number, speed: number): boolean {
  const t = catalogue(kind).threshold;
  return depth >= t.depth && speed >= t.speed;
}

/** Taps near the channel snap into the path (channel-spanning kinds exactly on it). */
export function snapToPath(kind: ObjectKind, x: number, z: number, channelZ: number, band = 5): { x: number; z: number } {
  const dz = z - channelZ;
  if (catalogue(kind).spansChannel) return { x, z: channelZ };
  if (Math.abs(dz) <= band) return { x, z: channelZ + Math.sign(dz || 1) * Math.min(Math.abs(dz), 0.9) };
  return { x, z };
}

/** Mass factor for the integrator (lighter things accelerate faster in the flow). */
export function massFactor(mass: MassClass): number {
  switch (mass) {
    case "light":
      return 1.4;
    case "medium":
      return 1.0;
    case "heavy":
      return 0.7;
    case "anchored":
      return 0.8;
  }
}
