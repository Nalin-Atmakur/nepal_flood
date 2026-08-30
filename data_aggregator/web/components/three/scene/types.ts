/**
 * Contracts between the corridor's scene modules (web/docs/16-corridor-v2-plan.md).
 *
 *   corridor-3d.ts (orchestrator) ──► context.ts  (ctx: renderer, scene, sim, bed, ground/flow sampling)
 *        │                             │
 *        ├── terrain.ts   TerrainModule (terrain colours, sky, lights, river ribbon, extent band, lakes, rock, dust, stain)
 *        ├── water.ts     WaterModule   (wet-only water sheet, spray, debris)
 *        ├── markers.ts   MarkersModule (settlement clusters, kind shapes, status rings, labels, pick targets)
 *        ├── objects.ts   ObjectsModule (catalogue objects, placement, break-up, piece physics via lib/flood-physics)
 *        └── camera.ts    CameraModule  (fit, orbit, pan, ride, shake, impact cam, picking rays)
 *
 * Every module: pure construction from `ctx`, an `update(dt)` per frame, and `dispose()`. No module reads another's
 * internals — they only share `ctx` and these types.
 */
import type * as THREE from "three";
import type { CorridorPlace } from "@/lib/corridor";
import type { Grid, Sim } from "@/lib/flood-sim";
import type { ObjectKind } from "@/lib/object-catalogue";

export type Ground = { y: number; nx: number; ny: number; nz: number };
export type Flow = { depth: number; vx: number; vz: number; speed: number; surface: number };

export type SceneCtx = {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  sim: Sim;
  grid: Grid;
  /** terrain height per cell (what the meshes and the sim share) */
  bed: Float32Array;
  /** visual exaggeration of water depth */
  visAmp: number;
  quality: { low: boolean; mobile: boolean; reducedMotion: boolean };
  /** frame counter and seconds since mount, advanced by the orchestrator */
  frame: number;
  time: number;
  /** bilinear ground height + normal at a scene point (null outside the grid) */
  groundAt(x: number, z: number): Ground | null;
  /** water surface height (bed + depth × visAmp) — bed when dry */
  surfaceAt(x: number, z: number): number;
  /** the sim's flow at a point (zeros outside the grid) */
  flowAt(x: number, z: number): Flow;
  /** register a disposable (geometry, material, texture) for teardown */
  own<T extends { dispose(): void }>(d: T): T;
};

export type RunInfo = { state: "idle" | "running" | "done"; runT: number; frontX: number; injectedFrac: number };

export interface TerrainModule {
  terrain: THREE.Mesh;
  /** the first barrier lake's position (the breach) */
  lakePos: THREE.Vector3;
  /** per-frame: rock fall, lake drain/heave, dust, river shimmer */
  update(dt: number, run: RunInfo): void;
  /** darken the terrain where the wave passed (called by water with wet cells) */
  stain(cell: number): void;
  clearStain(): void;
  /** the rock impact moment (t crosses ROCK_FALL_SECONDS) — for shake */
  readonly rockFallSeconds: number;
  /** X-ray: 0 = solid, 1 = the side view looks through the mountain (opacity ≈ 0.4 + ridge outline) */
  setXray(amount: number): void;
  dispose(): void;
}

export interface WaterModule {
  mesh: THREE.Mesh;
  visible(): boolean;
  update(dt: number): void;
  reset(): void;
  drawCount(): number;
  sprayCount(): number;
  dispose(): void;
}

export interface MarkersModule {
  set(places: CorridorPlace[]): void;
  /** meshes the pointer can hit; `placeOf` maps a hit object back to its place */
  pickables(): THREE.Object3D[];
  placeOf(obj: THREE.Object3D): CorridorPlace | null;
  /** the cell the front must wet for the place to count as reached */
  reachCell(placeId: string): number;
  /** world anchor above the marker (for cards / reached pops) */
  anchor(placeId: string): THREE.Vector3 | null;
  /** camera is riding: thin + translucent so they do not crowd the wave */
  setRide(on: boolean): void;
  /** the wave reached this place: ring turns amber-bright, label shows */
  markReached(placeId: string): void;
  clearReached(): void;
  update(dt: number, camPos: THREE.Vector3): void;
  dispose(): void;
}

export type PlacedObject = {
  id: number;
  kind: ObjectKind;
  real: boolean;
  group: THREE.Group;
  home: { x: number; z: number };
  state: "standing" | "broken" | "wreck";
};

export type ObjectEvent = { type: "hit"; obj: PlacedObject; x: number; y: number; z: number } | { type: "placed"; obj: PlacedObject };

export interface ObjectsModule {
  place(kind: ObjectKind, x: number, z: number, opts?: { real?: boolean; snap?: boolean }): PlacedObject | null;
  move(obj: PlacedObject, x: number, z: number): void;
  remove(obj: PlacedObject): void;
  /** put every object back where it stood (replay) */
  restore(): void;
  /** remove the visitor's objects (reset) — real bridges stay */
  clearVisitor(): void;
  update(dt: number): ObjectEvent[];
  list(): PlacedObject[];
  /** the most recently placed visitor object (for "move it by tapping") */
  last(): PlacedObject | null;
  dispose(): void;
}

export type CameraMode = "overview" | "ride" | "user";

export interface CameraModule {
  cam: THREE.PerspectiveCamera;
  target: THREE.Vector3;
  mode(): CameraMode;
  /** frame the whole corridor for the current aspect */
  fit(animate?: boolean): void;
  /** the run started: open close on the lakes */
  openOnLakes(lake: THREE.Vector3): void;
  /** per-frame easing; `frontX` drives the ride */
  update(dt: number, run: RunInfo, allowRide: boolean): void;
  shake(amount: number): void;
  /** desktop impact cam: punch toward a point for ~0.7 s */
  impact(x: number, y: number, z: number): void;
  /** nudge the target so a point is in frame (placement) */
  reveal(x: number, y: number, z: number): void;
  screenOf(x: number, y: number, z: number): { x: number; y: number };
  rayAt(px: number, py: number): THREE.Raycaster;
  /** pointer/keyboard handlers; returns true when the gesture was a tap (no drag) */
  attach(canvas: HTMLCanvasElement, onTap: (px: number, py: number) => void): void;
  resize(): void;
  dispose(): void;
}
