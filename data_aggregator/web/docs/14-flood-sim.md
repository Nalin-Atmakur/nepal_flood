# 14 · The corridor as a flood simulation ("Play the breach")

Owner's brief (30 Aug 02:15 BST): the 3D corridor is the first thing visitors see and must be captivating — an
animated flood tearing through the landscape, interactive (change the conditions, drop objects in its path and watch
them get destroyed, Turbo-Dismount style), with the statistics layered on afterwards. It is the cornerstone of the
viral surface. Shipped 30 Aug 04:05 BST (pass 2 04:40); this file is the reference for how it works and how to tune it.

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
7. **Real bridges** (pass 2): `getLostBridges()` reads `figures_latest` rows with metric `bridge_status` and a note
   starting "washed out" / "damaged" (HOT OSM damage survey), `toRealBridges()` joins them to gazetteer chainage (one
   per place, washed-out first, max 10) and the scene pre-places ink bridge decks where they stood. They are swept
   like any object, restored on Replay, never cleared by Reset, and counted separately ("real bridges lost 7/10").
8. **Share this run** (pass 2 + 3): once anything is swept (or the run ends) a button offers `navigator.share` with the
   `corridor.share_text` copy (visitor objects + real bridges swept) and the link `/{lang}/run?swept=N&bridges=M`,
   falling back to the WhatsApp link from `lib/share.ts`. `app/[lang]/run/page.tsx` is a tiny dynamic landing whose
   OG image is `/api/og?lang&swept&bridges` ("I watched N things and M real bridges go — play the breach yourself")
   and which meta-refreshes to the home page; robots disallow it.
9. **Lake volume** slider (0.5–20 Mm³, seeded with the latest `figures_latest.barrier_lake_volume_m3` — China MWR
   published 2.0 Mm³) and **breach** speed change the next run.

## 1b. What the visitor sees now (v2, 30 Aug 11:00)

Overview from above (no chase camera); the run auto-plays 0.7 s after the scene boots; on phones the story feed
(reached places, phase captions, SWEPT/PLACED) sits under the canvas with a placeholder line until the first event;
on desktop it is an overlay column bottom-left. A plain sentence under the heading explains what the panel is
("The 72 km the flood travelled on 26 August, replayed from above — press ▶, drop something in its path…").
- **12:30 pass (owner's screenshots):** place names are small pills with a **Names** toggle top-right (off = the damage alone); no discs under anything — the real bridges had kept the object foundation pad + ring, now removed; an object the flood takes lifts off *whole*, rides the crest tumbling for up to 6 s, breaks on a hard hit, and its pieces are carried on down the corridor — over the plate's east edge as a waterfall if the water goes that far; the story feed shows up to six rows when the panel has room.
- **13:00 pass:** the water is a *level fill* of the valley — its surface extends sideways until it meets the walls at its own height, so from the side it moulds to the mountain instead of standing on the bed with edges in the air; it is translucent (denser than the X-ray mountain, thinner as the view tilts) so the carried objects show through; the mud line stains the walls up to the water line; wheel/pinch zoom goes toward the point under the cursor.

## 2. Architecture (v2, 30 Aug 10:00 — see 16-corridor-v2-plan.md for the brief)

```
 lib/ (pure, vitest)                          components/three/scene/ (three.js, one shared ctx)
 ┌──────────────────────────┐                 ┌──────────────────────────────────────────────────────────┐
 │ corridor-terrain.ts      │  bed, meander   │ context.ts   createContext(): scene, sim, bed, groundAt   │
 │ flood-sim.ts             │  depth/velocity │              (bilinear height + normal), flowAt, surfaceAt│
 │ object-catalogue.ts      │  14 kinds       │ terrain.ts   colours (lib/terrain-colours), sky, lights,  │
 │ flood-physics.ts         │  piece bodies   │              river ribbon, extent band, lakes, rock, dust, │
 │ corridor-camera.ts       │  fit, pan       │              stain, setXray                                │
 │ terrain-colours.ts       │  ramp           │ water.ts     wet-only sheet, mud tones, crest, spray,     │
 └──────────────────────────┘                 │              debris                                        │
                                              │ markers.ts   settlement clusters, kind shapes, rings,     │
   corridor-3d.ts (orchestrator)              │              labels, pick targets, reach cells            │
     mountCorridor(el, opts) → CorridorHandle  │ objects.ts   catalogue objects on pads, placement marker, │
     run state machine · sim step · events    │              break-up → physics bodies → wreckage          │
                                              │ camera.ts    orbit/pan/pinch/keys, fit, ride, floor,      │
   CorridorScene.tsx (React)                  │              shake, impact cam, reveal, rays              │
     phone story feed under the canvas,       └──────────────────────────────────────────────────────────┘
     desktop feed overlay, pops, controls
```

Invariants: every module samples the same ground (`ctx.groundAt`) — objects sit on pads aligned to the ground
normal, pieces can never be below ground (`lib/flood-physics.ts`, unit-tested; `debug().belowGround` must be 0),
the camera never sinks below the water surface, and the X-ray amount follows `horizontality(pol)`.

## 2a. Architecture (v1, kept for reference)

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

## 3. Tuning knobs (v2 values, 30 Aug 13:00)

| Knob | Where | Value | Effect |
|---|---|---|---|
| `SIM_UNITS_PER_MM3` | lib/flood-sim.ts | 260 | wave volume; 2 Mm³ → ≈ 8 units deep at the lake, 1–3 mid-gorge |
| `BREACH.radius` | lib/flood-sim.ts | 3.6 | source footprint |
| `g` / `friction` | createSim | 9.8 / 0.9 | front speed: Syabrubesi ≈ 4 s, Betrawati ≈ 11 s, Galchhi ≈ 18 s, Devghat ≈ 24 s |
| `DEFAULT_SCENARIO.breachSeconds` | lib/flood-sim.ts | 4 (UI: sudden 4 / slow 12) | how fast the lake empties |
| `VIS_AMP` | scene/context.ts | 3.2 | visual depth exaggeration (the overview needs it) |
| level fill | lib/water-fill.ts (`fillLevels`) | `FILL_RADIUS` 8 cells · `FILL_FLAT` 4 (level wall to wall, no decay) · `FILL_FALLOFF` 0.25/cell beyond (Manhattan) · `FILL_LIP` 0.05 | the sheet is the highest nearby surface level, extended sideways until it meets the terrain at its own height — it moulds to the mountain (replaces the 1-cell dilation; D-059) |
| water opacity | scene/water.ts | `OPACITY_TOP` 0.97 − `OPACITY_XRAY` 0.3 × X-ray amount (0.88 by default, 0.67 from the side; the mountain goes 0.82 → 0.4) | translucent, always denser than the mountain; what it carries shows through |
| zoom | scene/camera.ts · lib/corridor-camera.ts (`zoomToward`) | wheel: toward the point under the cursor · pinch: toward the midpoint | zooming into a part of the corridor goes to that part (D-060) |
| `BLUE` / `BLUE_X0` / `BROWN_RUN` | scene/water.ts | #144fb3 / breach + 6 / 64 units | clear blue through the gorge → mud on the plain; emissive #0e2f66 × 0.22, roughness 0.32, metalness 0.04 so shading never greys it (D-071) |
| foam | scene/water.ts | crest band × 0.45, speed term (v − 24)/22 × 0.25 | foam only on the steepest crests — the sheet stays blue |
| `XRAY_DEFAULT` | corridor-3d.ts | 0.3 (→ 1 with tilt; depth-write off above 0.1) | see the surge through the near wall |
| `fitCamera` | lib/corridor-camera.ts | landscape pol 0.5 az −0.75 · portrait pol 0.42 az −1.5 | overview-only camera (`RIDE_ENABLED = false`) |
| `wallHeight` / `floorHalfWidth` | lib/corridor-terrain.ts | 26 → 6 · 1 → 7 | the gorge → plain profile |
| `OBJECT_SCALE` (catalogue `scale`) / real bridges | lib/object-catalogue.ts · scene/objects.ts | 2.8 / × 0.55 | readability from the overview |
| `thresholdFor` | lib/object-catalogue.ts | camp 0.1/0.4 … bridge 0.9/2.5 … boulder 1.2/3.0 | depth / speed an object survives |
| physics | lib/flood-physics.ts | G −22 · drag 4.5 · `FLOW_GAIN` 0.85 · `FLOW_CAP` 12 · `MAX_SPEED` 20 · `CENTRE` 3.5 · restitution 0.28 · friction 0.45 (÷3 in water) · static-friction slope < 0.18 · `FALL_FLOOR` −45 | bodies never below ground (tested); carried bodies match the water within ~¼ s and are pulled back to the channel; off the east edge they fly and fall |
| carried phase | scene/objects.ts | `CARRY_SECONDS` 6 · `CARRY_MIN_SECONDS` 0.55 · break on a hard hit (vₙ < −2.5) | a taken object rides whole (one body of radius = half its height, pivot at its centre), then breaks; anchored kinds break in place |
| waterfall | scene/water.ts | column nx−2, depth > 0.15, ≤ 14 drops/frame, life 1.4–2.2 s | water that reaches the plate's open east edge goes over as spray |
| `LABEL_HEIGHT` | scene/markers.ts | 1.1 (was 1.9) + **Names** toggle (`setLabels`, persisted in `nft.corridor.names`) | names are a small key; off = look at the damage alone |
| feed rows | CorridorScene.tsx | 3 → 6 by canvas height (`FEED_ROW_PX` 50); 5 under the canvas on phones | as many story rows as the panel has room for |
| `SNOW_LINE` / `ROCK_SLOPE` / `SCREE_SLOPE` | lib/terrain-colours.ts | 36 / 0.72 / 0.52 | snow only on the high northern walls |

Re-tune with `npx vitest run` (front ordering, physics invariants, camera fit must hold) and the screenshot loop in §5.

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

## 5b. Pass 3 (after the independent QA in lane V2, 06:20 BST)

Chase camera along the channel with a water-surface floor and an opening shot on the lakes; pop cards in a fixed
bottom-left column and only for places with people (`reported > 0`); arming a chip pauses the ride (`follow` =
not dragged and not armed); real bridges ≥ 3 km apart; the wave leaves a mud stain on the terrain (vertex colours,
cleared on Replay/Reset); camera shake on the rock impact and on every real-bridge loss; markers thin and translucent
while riding; 40 px tap targets; the rock hides at impact; foam spray (`THREE.Points`, 700-particle pool, spawned in cells with depth ≥ 0.3 and speed ≥ 3.5, skipped in low-quality mode). Known limits: the gorge walls still fill the frame edges
at the chase distance; whitecap particles and the "your run" OG card remain queued.

## 6. Non-goals (do not over-engineer)

No DEM, no real hydraulics, no GPU compute, no physics engine, no new npm packages, no persistence or sharing of
scenarios (the share bar already shares the page).

## 7. Ideas queued (not built)

Sound (off by default); NESRA `bridges_to_inspect` as a second, lighter bridge class; a top-down "map" camera option.
