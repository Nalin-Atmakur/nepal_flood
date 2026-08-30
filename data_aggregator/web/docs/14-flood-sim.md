# 14 · The corridor as a flood simulation ("Play the breach")

Owner's brief (30 Aug 02:15 BST): the 3D corridor is the first thing visitors see and must be captivating — an
animated flood tearing through the landscape, interactive (change the conditions, drop objects in its path and watch
them get destroyed, Turbo-Dismount style), with the statistics layered on afterwards. It is the cornerstone of the
viral surface. Shipped 30 Aug ~05:30 BST; this file is the reference for how it works and how to tune it.

## 1. What the visitor experiences

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ ● 09:19 NPT · 26 Aug                  ┌ The wave runs the corridor: Timure 08:45 …┐ │  ← clock chip · phase caption
 │                                                                                  │
 │        ▲ collapse: a rock falls into the first lake (t < 1.1 s)                  │
 │       ▒▒▒▒░░  breach: mud pond spills downstream (t ≈ 1–7 s, "sudden" / "slow")  │
 │      ╱ gorge ╲░░░░░░ Timure ● ─┐ pop card: "Timure 08:45 · 190 reported · 67 unknown"
 │     ╱         ╲░░░░░░░ Syabrubesi ●                                              │
 │    ╱  low-poly ╲░░░░░░░░░░░░ Betrawati ●    🏠 tilt → carried → sunk             │
 │   ╱   valley    ╲░░░░░░░░░░░░░░░░ Galchhi ● 🚌   objects dropped by the visitor   │
 │  ╱  wide plain   ╲░░░░░░░░░░░░░░░░░░░░░░░░░░ Bharatpur ●                          │
 ├──────────────────────────────────────────────────────────────────────────────────┤
 │ [▶ Replay the breach] [⟲ Reset]                                 swept away  3    │
 │ Lake volume ─●──────── 2.0 Mm³   Breach (sudden) (slow)                          │
 │ Drop in the path: [🏠 house] [🌉 bridge] [🚌 bus] [⛺ camp]                       │
 │ Illustrative, not a hydraulic model. The clock follows the recorded front …       │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

1. Page loads → the scene boots after first paint (as before) and **auto-plays once** 1.4 s later, unless
   `prefers-reduced-motion` (then the visitor presses ▶). Slow connections / no WebGL → the PNG fallback, no controls.
2. A run: the rock falls into the first barrier lake (collapse, 1.1 s) → the lake drains into the channel over the
   breach duration (sudden 4 s / slow 12 s) → the wave runs the corridor (≈ 25 s to Devghat) → the tail drains.
3. The **camera rides with the front** from above and slightly upstream while the run is on and eases back to the
   overview when done. Any drag or wheel hands the camera to the visitor for good (orbit/zoom as before).
4. As the front wets the channel beside a place marker, its **pop card** appears for 2.6 s: name, the clock, reported
   and unknown counts (the live ledger). Off-channel places (Langtang) use their own cell, so they are never "reached".
5. The **clock** is honest: it maps the front's chainage onto the recorded arrivals (08:37 collapse · 08:40 Gyirong ·
   08:45 Timure · 08:50 Syabrubesi · 09:20 Betrawati · 10:28 Galchhi · 11:26 Malekhu · 13:00 Devghat), from the seeded
   `event_timeline` (DHM river watch, USGS, ICIMOD). It is a lookup, not a prediction.
6. **Objects**: arm a chip, tap the terrain. Taps within 5 units of the channel snap into the path (bridges exactly
   onto it). A standing object wobbles as the water rises; once depth × speed exceed its threshold
   (camp < bus < house < bridge) it is *carried* (its pieces tumble apart, moving with the flow at ≤ 5 units/s) for
   1.8 s, then *sinks* (shrinks, drops) and disappears; "swept away" counts. Replay restores every object to where
   it stood; Reset clears water and objects. Max 24 objects (oldest is recycled).
7. **Lake volume** slider (0.5–20 Mm³, seeded with the latest `figures_latest.barrier_lake_volume_m3` — China MWR
   published 2.0 Mm³) and **breach** speed change the next run.

## 2. Architecture

```
 lib/corridor-terrain.ts (pure)        lib/flood-sim.ts (pure, typed arrays)        components/three/
 ┌────────────────────────────┐        ┌──────────────────────────────────┐          ┌────────────────────────────┐
 │ kmToX / xToKm (compressed  │        │ GRID 192 × 104 cells, 0.5 units  │          │ corridor-3d.ts             │
 │   beyond km 74)            │───────▶│ sampleBed(GRID, bedH)            │─────────▶│  terrain mesh (grid-res,   │
 │ meander · terrainH (design)│        │ createSim(grid, bed): step(dt)   │          │   heights = bed[])         │
 │ bedH = terrainH − carve    │        │   virtual pipes: flux L/R/U/D,   │          │  water mesh (same grid;    │
 │   + damH (landslide dam)   │        │   K clamp, friction, film drain, │          │   wet triangles only,      │
 │ LAKE_KMS · DAM_KM          │        │   open east edge                 │          │   vertex colours mud→foam) │
 └────────────────────────────┘        │ inject / depthAt / velocityAt /  │          │  breach source · rock fall │
                                       │   frontX                         │          │  markers + reached cells   │
                                       │ BREACH · breachVolume (triangular│          │  objects (state machine)   │
                                       │   rate) · SIM_UNITS_PER_MM3      │          │  ride camera · clock       │
                                       │ thresholdFor · isSwept · advect  │          │  IntersectionObserver pause│
                                       │   (CARRY_MAX_SPEED) · snapToPath │          └─────────────┬──────────────┘
                                       │ FRONT_ANCHORS · clockForFrontX   │                        │ handle
                                       └──────────────────────────────────┘          ┌─────────────▼──────────────┐
                                                                                     │ CorridorScene.tsx (client) │
                     blocks/Corridor.tsx (server) ── lakeVolumeM3 ──▶ CorridorIsland ─▶│  boot · autoplay · controls│
                     page.tsx: getLakeVolumeM3()                                     │  pop cards · phase caption │
                                                                                     └────────────────────────────┘
```

- `lib/flood-sim.ts` has no three.js import → `tests/flood-sim.test.ts` (vitest) covers terrain mapping (every
  gazetteer km lands on the mesh; monotone/invertible `kmToX`; the dam), mass conservation in a closed box, front
  ordering Syabrubesi → Betrawati → Galchhi with no NaN, breach integration, object rules, snapping and the clock.
- The sim is **virtual pipes** (Mei, Decaudin, Hu 2007): per cell water depth `d` and four outflow fluxes;
  `f += dt·g·Δh`, clamped so a cell never sends more than it holds; depth from net flux; velocity from net flux ÷
  depth; friction 0.9/s; films thinner than 0.06 drain at 0.6/s (clears puddles after the wave). Fixed
  `dt = 1/120`, two substeps per frame, ≈ 0.13 ms per step in node.
- Rendering: terrain and water share one `PlaneGeometry(95.5, 51.5, 191, 103)` whose vertices are the cell centres
  (`vertCell[v]` maps vertex → cell). Each frame the water sheet sets `y = bed + depth × 1.5` on wet vertices (dry
  ones sit on the bed), colours by depth (mud) and speed (foam), and **rebuilds its index with only the triangles
  that touch a wet vertex** — that is what keeps skirts from hanging under the terrain at the silhouettes.
  `MeshStandardMaterial` flat-shaded, vertex colours, opacity 0.93.
- The breach injects `lakeMm3 × SIM_UNITS_PER_MM3` (260) units over `breachSeconds` with a triangular rate at
  `BREACH` (first lake, radius 3.6) — after the 1.1 s rock fall. The landslide dam (`damH`, up to 9 units west of
  km −9.5) stops the pond from flooding "uphill" off the scene.
- Objects are small groups of primitives in the design palette (white walls + ultramarine roof, ink deck + amber
  pylons, amber bus + ink wheels, amber tent) at `OBJECT_SCALE` 3. `drop(kind, x, z)` on the handle places one
  directly (used by the e2e test); the UI goes through `arm(kind)` + tap → raycast on the terrain → `snapToPath`.
- The handle also exposes `debug()` (state, water visibility, draw count, max depth, front, objects, swept,
  injected); `?debug=1` puts the handle on `window.__corridor` for Playwright.

## 3. Tuning knobs (and what the current values do)

| Knob | Where | Value | Effect |
|---|---|---|---|
| `SIM_UNITS_PER_MM3` | flood-sim.ts | 260 | wave depth; 2 Mm³ → ~9 units at the lake, 2–3 in the mid-gorge |
| `BREACH.radius` | flood-sim.ts | 3.6 | source footprint; smaller ponds a tall column at the lake |
| `g` / `friction` | createSim | 9.8 / 0.9 | front speed: Syabrubesi ≈ 4 s, Betrawati ≈ 11 s, Galchhi ≈ 18 s, Devghat ≈ 24 s |
| `DEFAULT_SCENARIO.breachSeconds` | flood-sim.ts | 6 (UI: 4 / 12) | how fast the lake empties |
| `VIS_AMP` | corridor-3d.ts | 1.5 | visual-only depth exaggeration |
| `RIDE` | corridor-3d.ts | rad 46 · pol 0.42 · az −1.3 | ride camera: above and a little upstream, looking downstream |
| `OBJECT_SCALE`, `CARRY_SECONDS`, `SINK_SECONDS` | corridor-3d.ts | 3 · 1.8 · 0.9 | object readability and destruction timing |
| `REACH_DEPTH` | corridor-3d.ts | 0.2 | when a place counts as reached |
| `thresholdFor` | flood-sim.ts | camp 0.1/0.4 … bridge 0.8/1.6 | depth / speed an object survives (the sim's front runs at 20–30) |

Re-tune with `npx vitest run tests/flood-sim.test.ts` (front ordering must hold) and the screenshot loop in §5.

## 4. Copy, i18n, design

- Keys `corridor.play|replay|reset|swept|lake_volume|breach|breach_fast|breach_slow|drop|drop_hint|obj.*|clock_label|
  illustrative|phase_collapse|phase_breach|phase_wave` in en/ne/hi (Latin digits). `sec.corridor_caption` updated.
- Chips = `components/ui/Chip`; buttons use the design's ink border + hard shadow + press; the clock and counters are
  Press Start 2P (`.arcade`); pop cards and the phase caption use the `corridor-pop` / `corridor-pop-hold`
  keyframes in `globals.css` (disabled under reduced motion).
- Everything is labelled "Illustrative, not a hydraulic model … Nothing here is a forecast." The clock is the recorded
  front, the starting lake volume is the published figure, and the counts on the pop cards are the live ledger.

## 5. Verify

1. `npx vitest run` — flood-sim tests green.
2. `npm run build && npx next start -p 3100`, then a Playwright script with `--use-gl=angle --use-angle=swiftshader`
   at `/en?debug=1`: `window.__corridor.debug()` → `waterVisible: true`, `drawCount > 0`, `frontX` increasing,
   `swept ≥ 1` after `drop("house", -10, 0); play()`. Screenshot the block at 2 / 6 / 12 / 22 s and look at them.
3. `npm run e2e` — "the corridor flood sim" test (skips itself where WebGL is unavailable).
4. On the live site: the run starts by itself, the clock moves, cards pop, ▶ Replay works, a dropped house is swept.

## 6. Non-goals (do not over-engineer)

No DEM, no real hydraulics, no GPU compute, no physics engine, no new npm packages, no persistence or sharing of
scenarios (the share bar already shares the page).

## 7. Ideas queued (not built)

Whitecap particles at the front; a "your run" share card (swept count + scenario) via `/api/og`; a bridge-inventory
overlay from `figures` (`bridges_washed_out` per place) so real lost bridges appear on the path; sound (off by
default).
