# 14 · The corridor as a flood simulation ("Replay the night")

Owner's brief (30 Aug 02:15 BST): the 3D corridor is the first thing visitors see and must be *insanely* captivating —
an animated flood tearing through the landscape, interactive (change the conditions, drop objects in its path and watch
them get destroyed), with the statistics layered on afterwards. This is the cornerstone of the viral surface.

Status: spec (this file) → implementation in `components/three/` + `lib/flood-sim.ts`. Keep this file in sync.

## 1. What the visitor experiences

```
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ 01 THE CORRIDOR   Gyirong border → Bharatpur · 110 km          [03:41 NPT]   │  ← Press Start 2P clock chip
 │                                                                              │
 │        ▲ barrier lake                                                        │
 │       ▒▒▒▒▒░░░  ← breach: brown wave + white foam front                      │
 │      ╱  gorge  ╲░░░░░░░░                                                     │
 │     ╱ Timure ●  ╲░░░░░░░░░░░ Syabrubesi ●                                    │
 │    ╱             ╲░░░░░░░░░░░░░░░░░░░░░ Dhunche ●                            │
 │   ╱   low-poly    ╲▒▒▒░░░░░░░░░░░░░░░░░░░░░░ Betrawati ● ─┐ card pops       │
 │  ╱    valley       ╲   houses/bridges dropped here get   Trishuli ● │ as the │
 │ ╱                   ╲  tilted, carried, sunk              Galchhi ● │ front  │
 │╱   wide plain        ╲░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Bharatpur ● ─┘ arrives│
 ├──────────────────────────────────────────────────────────────────────────────┤
 │ [▶ Replay the night] [⟲ Reset]  Lake volume ──●──── 2.0 Mm³  Breach ──●──   │
 │ Drop in the path: [House] [Bridge] [Bus] [Camp]      objects swept: 7        │
 │ illustrative, not a hydraulic model · size = people believed there · drag to orbit │
 └──────────────────────────────────────────────────────────────────────────────┘
```

1. Page loads → terrain fades in, a 1.5 s beat, then the breach starts automatically (once). The wave runs the full
   corridor in ~25 s. `prefers-reduced-motion` or `saveData`/2g/3g → the existing static PNG fallback.
2. As the front reaches a real place (water depth at its marker > 0.15 in sim units) its card pops for ~2.5 s:
   name · sim clock · "N reported here · M confirmed reached · U unknown" (real `v_place_status_latest` numbers).
3. After the run the markers stay as the live ledger (existing behaviour: click → card, size = reported, colour =
   unknown ratio). "Replay" runs it again; the clock chip rewinds to 03:00 NPT.
4. Interaction: sliders change the lake volume (0.5–20 Mm³, seeded with the latest `China MWR` `lake_volume_mm3`
   figure when present, else 2.0) and the breach duration (fast/slow). Object chips arm a placement tool; tap/click on
   the terrain drops the object there (max 24). Objects have a threshold on depth × |velocity|; above it they
   `tilt → carried by the flow (velocity field) → spin → sink and fade` over ~1.5 s, and the "objects swept" counter
   ticks. Reset clears water and objects.
5. Orbit/drag as today; pinch/scroll zoom; the camera does a slow drift when idle.

## 2. Architecture

```
 lib/flood-sim.ts                     components/three/                         components/blocks/
 ┌──────────────────────────┐          ┌────────────────────────────┐            ┌──────────────────────┐
 │ makeTerrain(spec)        │          │ CorridorScene.tsx (island) │            │ Corridor.tsx         │
 │  → Float32Array heights  │◄─────────│  three r160 renderer       │◄───────────│  server: fetches     │
 │ createSim(terrain, opts) │          │  terrain mesh (static)     │            │  places + lake figure│
 │  step(dt) — virtual pipes│          │  water mesh (per frame)    │            │  renders controls    │
 │  depth[], vx[], vy[]     │          │  markers, cards, objects   │            │  + <CorridorScene/>  │
 │  breach(volume, seconds) │          │  raycast tap → sim coords  │            └──────────────────────┘
 │  probe(x,y)              │          │  IntersectionObserver pause│
 │ Object rules             │          └────────────────────────────┘
 │  thresholdFor(kind)      │                       │
 │  advect(obj, sim, dt)    │                       ▼
 └──────────────────────────┘          components/blocks/CorridorControls.tsx (client: sliders, chips, counters)
```

- `lib/flood-sim.ts` is pure TypeScript over typed arrays, no three.js import → unit-testable in vitest.
- Grid: `NX = 256` cells along the corridor × `NY = 64` across. Cell = corridor km / NX along. Sim units are
  dimensionless; vertical exaggeration is purely visual.
- Terrain (`makeTerrain`): `elev(x) = lerp(1800, 200, smoothstep)` (falls fast in the gorge, slow on the plain) +
  cross-section `V(y) = width(x)`-dependent (gorge: narrow steep; plain: wide shallow) + 2-octave value noise for
  ridges + a gentle meander offset of the channel centre `c(x)`. Places are placed at `(km → x, c(x))` so they sit in
  the valley floor, slightly up the bank. **Every place in the gazetteer with a `km` maps inside [0, NX)** — the old
  scene let markers fall off the mesh.
- Water (`createSim`): virtual pipes (Mei, Decaudin, Hu 2007): per cell water depth `d`, outflow flux to 4
  neighbours `f`; each step `f += dt·g·Δh` (h = terrain + d), clamp so total outflow ≤ d·cellArea/dt, `d += dt·Σ(in−out)`,
  velocity from net flux; friction `f *= (1 − k·dt)`; boundary cells absorb (open outflow at the Bharatpur end).
  Fixed `dt`, 3–4 substeps per animation frame; CFL-safe by construction; no NaN ever (guard + tests).
- Breach: a source term over the top 6 columns that injects `volume` over `breachSeconds` with an ease-out curve.
- Rendering: `THREE.PlaneGeometry(NX−1, NY−1)`; terrain positions set once; the water mesh's `position.z` =
  `terrain + d` where `d > 0.02` else pushed below terrain; vertex colour by depth (mud `#6b4a2b` → `#9c6b3c`) and a
  foam term from `|∇d|·|v|` (→ near-white). `MeshStandardMaterial({vertexColors:true, flatShading:true})` to stay in
  the low-poly look. `geometry.attributes.position.needsUpdate = true` per frame; `computeVertexNormals()` every
  frame for water only.
- Objects: small groups of primitives in the design palette (house = box + prism roof; bridge = flat slab over the
  channel; bus = elongated box; camp = cone). State machine `standing → hit → carried → sunk`. `carried` moves the
  object by the local velocity, adds rotation, lowers it; `sunk` fades and removes after 1.5 s.
- Cards/markers: the existing marker code stays (cylinder sized by reported, colour by unknown ratio); the pop card is
  the existing place card with a "reached at HH:MM" line.
- Clock: sim time → NPT label: `03:00 + t·scale` where `scale` makes the *default* run reach Devghat at ≈ 13:00
  (10 h of real night compressed into ~25 s). Purely cosmetic and labelled "illustrative".

## 3. Performance budget

- 256×64 = 16,384 cells; 4 substeps/frame × ~12 flops ≈ 0.8 M ops/frame → < 2 ms on a 2019 phone.
- Two 16k-vertex meshes; one `needsUpdate` per frame for water; normals recomputed for water only.
- Pause the loop when the panel is < 20 % visible (IntersectionObserver) or the tab is hidden.
- Never allocate in the frame loop (all typed arrays pre-allocated). No shadows. `pixelRatio` capped at 1.5.
- Bundle: no new dependencies; three is already there.

## 4. Controls (client component `CorridorControls.tsx`)

- Buttons `Replay the night` / `Reset` — `Button` primitive (ink border, hard shadow, press = translate).
- Sliders: native `<input type=range>` styled with the design tokens; value chips in Press Start 2P.
- Object chips: `Chip` primitive; the armed chip is amber-filled; escape/second tap disarms.
- Counter "objects swept: N" and the clock chip.
- i18n keys `corridor.replay`, `corridor.reset`, `corridor.lake_volume`, `corridor.breach`, `corridor.drop`,
  `corridor.obj.house|bridge|bus|camp`, `corridor.swept`, `corridor.illustrative`, `corridor.reached_at` in en/ne/hi
  (Latin digits everywhere).

## 5. Tests

- `tests/flood-sim.test.ts`: terrain monotone downhill along the channel; every gazetteer km maps into the grid;
  mass conservation (Σd + drained = injected ± 1e-6) with closed boundaries; a breach at the top reaches a probe at
  km 30 before km 60 before km 100; 5,000 steps produce no NaN/negative depth; `thresholdFor` ordering
  (camp < bus < house < bridge); `advect` moves an object downstream.
- Playwright smoke: the canvas mounts; the controls render; clicking Replay changes the clock chip.

## 6. Non-goals (do not over-engineer)

- No DEM, no real hydraulics, no GPU compute, no physics engine, no new npm packages.
- No persistence of user scenarios; no sharing of runs (the share bar already shares the page).
