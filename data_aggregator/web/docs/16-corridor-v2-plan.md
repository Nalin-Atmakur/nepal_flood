# 16 · The corridor v2 — plan (30 Aug 09:30 BST, owner's brief)

Brief: the simulation is in decent shape; now make it *the* thing — it should feel like a robust video game and
convey the sheer scale of the disaster. Specifics from the owner: on phones the timeline/pop cards cover the 3D
view (move them below it); the default framing cuts the corridor off and leaves empty space (pan + a better
default); the colours and general feel need a big step up; clicking an object chip should place one in the flood's
path by default (and still allow placing anywhere), and it must be obvious where it is and what happens to it;
Turbo-Dismount-grade physics and more objects; the place markers should be realistic objects with better colours.

This document is the spec. Each phase ships on its own (gates → deploy → commit) so the site is never broken.

## 0. Design principles (what "perfect" means here)

1. **Readable in one glance at 390 px.** Terrain, river, wave, places, the object you dropped — all distinguishable
   by colour and silhouette, no reading required.
2. **A game's clarity, a disaster's weight.** Chunky low-poly art (the "Arcade ledger" design language: flat
   shading, ink outlines, hard shadows) but a palette and light that say *Himalaya* — snow, scree, forest, silt —
   and a flood that is brown, violent and loud (shake, spray, debris, breaking things).
3. **Every number stays honest.** The wave's timing follows the recorded front; the places and their counts are
   the live ledger; the bridges are the HOT survey; the objects you drop are a toy and labelled as one.
4. **Nothing new to install.** three r160 already has everything (vertex colours, instancing, sprites, fog,
   hemisphere light). No post-processing, no physics engine — the "physics" is a hand-tuned rigid-body-ish
   integrator over the sim's depth/velocity field, which is what makes it feel like a game rather than a solver.
5. **Phones first for performance.** ≤ 12 ms/frame on a 2020 mid-range phone, ≤ 6 ms on desktop; instanced
   meshes, pooled particles, the existing adaptive-quality switch.

## 1. Layout and camera (Phase 1)

### 1.1 Phones: nothing covers the scene
```
  390 px                          today                       v2
  ┌────────────────────────┐      ┌────────────────────────┐   ┌────────────────────────┐
  │ [clock]     [caption]  │      │ [clock]  [caption 3 ln]│   │ [clock]                │  ← only the clock stays
  │                        │      │  pop card              │   │                        │
  │        3D              │      │  pop card    3D        │   │        3D (taller: 60vh)│
  │                        │      │                        │   │                        │
  └────────────────────────┘      └────────────────────────┘   ├────────────────────────┤
                                                               │ ▌ 08:45 Timure — 1,107 unknown  ← story feed
                                                               │ ▌ 08:50 Syabrubesi — 508 unknown │  (newest first,
                                                               │ ▌ The wave runs the corridor…    │   3 rows, auto-
                                                               └────────────────────────┘   scroll, aria-live)
```
- `< md`: pop cards and phase captions render as a **story feed** under the canvas (newest on top, max 3 visible,
  the list keeps the last 12 for scrolling). `≥ md`: unchanged overlay column (bottom-left) — it doesn't cover
  anything there.
- The "armed" hint moves into the control bar next to the chips (both breakpoints).

### 1.2 Framing and pan
- **Fit on load**: compute the corridor's bounding box (terrain extents × the channel's y range) and set the
  overview camera so the box fits the panel's aspect with 6 % margin (`fitCamera(bounds, aspect)` — pure,
  unit-tested). Portrait panels get a different azimuth so the corridor runs diagonally top-left → bottom-right
  instead of being cut off at both ends.
- **Pan**: right-drag / shift-drag / two-finger drag moves the orbit target across the terrain plane; arrow keys
  nudge; wheel zooms toward the cursor; `⌂ Frame` button in the control bar returns to the fit. Touch: one finger
  orbits horizontally (vertical swipe still scrolls the page), two fingers pan/pinch-zoom.
- The ride camera keeps its behaviour but its *end* pose is the fitted overview (no more empty bottom half).

## 2. The look (Phase 2)

### 2.1 Palette (per vertex, flat shaded, no textures)
| element | today | v2 |
|---|---|---|
| terrain | one grey | elevation × slope ramp: valley floor silt `#8f7a5a` → terrace green `#6f8f4f` → forest `#3f6b3a` (mid slopes, north-facing darker) → scree `#8d8a84` → rock `#6b6660` (steep) → snow `#f2f4f7` above the ridge line, with 3-octave noise to break bands; a warm rim where the sun hits |
| river (before the wave) | red tube | glossy blue-grey ribbon `#4d7d8f` in the carved bed, thin foam lines at bends |
| flood path (known extent) | red tube | translucent dark-red band on the banks (`#b8241a` @ 35 %) drawn from the channel width × 2.2 — the legend keeps "flood path" |
| water | mud, one ramp | three-tone mud (`#3d2a18` deep · `#8a5a2b` body · `#c9a56a` shallow) + foam `#f6f1e8` at speed/crest; vertex jitter (sin(x·k + t·w)) for turbulence; leaves the stain |
| sky / fog | flat `#e9e7e5` | vertical gradient sky (dusk-blue `#c9d6e6` top → warm haze `#efe7dc` horizon) painted on a large background quad; fog to the haze colour, denser downstream (depth cue) |
| light | ambient + one sun | hemisphere (sky blue / ground warm) + warm key sun low from the east (it was 08:37) + a cool fill; shadows off (perf) but a fake AO tint on north faces |
| markers | amber/green cylinders | see §2.2 |

### 2.2 Place markers → "what is actually there"
- One **settlement cluster** per place: 2–7 tiny house prisms (count ∝ √reported, capped) in the design's white
  walls + ultramarine/ink roofs, scattered on the bank with a seeded layout, on a flat pad; a **status ring** on the
  ground (amber `#ffb800` mostly unknown / green `#148a4e` mostly reached / grey none) — the ring, not the marker,
  carries the legend colour.
- Kind-specific shapes from the gazetteer `kind`: hydropower → dam block + penstock, hospital/health post →
  white cube with a red cross, shelter/camp → row of tents, helipad → round pad with an H, border post → barrier +
  flag, bridge site → small deck. Everything is a couple of primitives in the palette; `InstancedMesh` per shape.
- **Labels**: a sprite (canvas text, Baloo, ink on white pill) above each cluster, shown when the camera is within
  ~45 units or the place has just been reached; always for the 8 largest by unknown.
- The click card stays; the sr-only list stays.

### 2.3 The disaster's scale
- **Collapse**: the rock is bigger, trails a dust puff (30 grey sprites), the lake heaves, shake tier 3.
- **Breach**: the pond's surface rises visibly (it does), then a "lip" of foam where it spills; a low rumble is
  represented by continuous micro-shake (amplitude ∝ front speed) while the front is in the gorge.
- **The front**: a tall dark face with a white crest (the crest highlight is in; make it a band 2 cells deep),
  spray (in; bigger, more), **debris** — 120 pooled dark boxes/logs riding the surface with the velocity field,
  spinning; they collect at bends.
- **Aftermath**: the stain darkens with depth; broken pieces of swept objects remain lodged on the banks
  (pieces stop when depth < 0.2 instead of vanishing); place labels turn amber as reached.
- **Scale bar** "1 km" bottom-right, updated with zoom; the clock chip gains "T+ 23 min".

## 3. Objects and physics (Phase 3)

### 3.1 Catalogue (chips)
house · lodge (2-storey) · bridge · bus · jeep · truck · excavator · tent camp · hydropower dam · boulder · tree.
Each = 2–6 primitives in the palette, a mass class (light / medium / heavy / anchored), a sweep threshold
(depth × speed), and a break pattern (which primitives detach).

### 3.2 Placement UX ("it must be obvious where it is")
1. Tap a chip → an object is **placed immediately in the path**: if a run is on, 8 units downstream of the front on
   the channel line; if idle/done, at km 4 (Timure) on the channel. A pulsing **ground ring** + a bobbing **arrow**
   + a label pill ("House · in the flood's path") mark it for 2.5 s; the camera nudges to keep it in frame.
2. The chip stays armed: tapping the terrain **moves** that object (snap-to-path within 5 units as today); Escape,
   the chip again, or ▶ disarms. A second tap of the same chip adds another.
3. When the wave hits: the object **breaks** — pieces get impulse from the flow (shear from the velocity field →
   angular velocity), gravity, terrain contact with a bounce (restitution 0.3) and friction, and ride the surface;
   a splash (foam sprites) at impact; a "SWEPT 09:03" pop over it; the counter chip flashes amber and bumps.
4. Desktop only: a 0.7 s **impact cam** (camera punches 40 % closer to the object, then eases back) — the
   Turbo-Dismount beat. Off on phones and under reduced motion.

### 3.3 Integrator (pure, tested in `lib/flood-physics.ts`)
```
  per piece: p, v, ω, q            per step (dt ≤ 1/60, substep 2):
    surface = bed + depth·VIS_AMP;   inWater = p.y < surface
    a = g + (inWater ? drag·(u − v) + buoyancy·(surface − p.y)·up : 0)   u = flow velocity at p (capped)
    v += a·dt; p += v·dt
    if p.y < bed + r: p.y = bed + r; v.y = −v.y·0.3; v.xz *= 0.6 (friction)   ← bounce/settle
    ω += shear(u around p)·k·dt − ω·damp·dt; q ← q + ω·dt
    asleep when |v| < 0.05 and !inWater for 0.5 s  → stays as wreckage
```
Deterministic given the sim; no allocation per frame (typed arrays, pooled meshes). Unit tests: falls and settles
on flat ground; a piece in a flow moves downstream and does not tunnel through the bed; spin decays.

## 4. Performance budget
- Terrain: one 20 k-vertex mesh (as today) with a colour attribute (once).
- Water: as today (wet-only index).
- Markers: ≤ 6 `InstancedMesh` (houses, rings, tents, cubes, pads, dams) — one draw call each.
- Particles: spray 700 + debris 120 + dust 60 + splash 100 — all pooled `Points`/instances.
- Objects: ≤ 24 visitor objects × ≤ 6 pieces = 144 small meshes worst case (fine).
- Labels: sprites with a shared canvas atlas, at most 24 visible.
- Low-quality mode (existing trigger): halve particles, skip debris, no impact cam.

## 5. Phases, order, and what "done" means

| phase | scope | done when |
|---|---|---|
| **1 · layout & camera** (first) | story feed below the canvas on phones; armed hint in the control bar; `fitCamera`; pan (mouse/touch/keys); Frame button; ride ends on the fit; object placed in the path on chip tap with ring/arrow/label; "SWEPT" pop + counter flash | 390 px: nothing covers the scene, the whole corridor is in frame on load; desktop: no empty half; chip tap → object visibly in the path; e2e covers chip → object → replay → swept |
| **2 · the look** | terrain ramp + sky/fog/lights; river ribbon; extent band; water tones + turbulence; settlement clusters + kind shapes + rings + labels; scale bar; regenerated fallback PNG | side-by-side screenshots before/after at 390/1280; markers legible; legend unchanged in meaning |
| **3 · objects & physics** | catalogue ×11; `lib/flood-physics.ts` + tests; break patterns; splash/debris/dust; impact cam (desktop); shake tiers | a house dropped at Timure is hit at ≈ 08:45, breaks into pieces that tumble downstream and lodge on a bank; 60 fps desktop, no frame > 20 ms on the SwiftShader profile |
| **4 · polish** | tuning pass with the owner's eyes (screenshots), perf pass, i18n for new chips/labels (en/ne/hi), docs (14 → v2), decisions-log | owner sign-off |

Estimated effort: P1 ≈ 1.5 h, P2 ≈ 2.5 h, P3 ≈ 2.5 h, P4 ≈ 1 h. Each phase deploys.

## 5b. Decisions taken with the owner (09:45)
- Object catalogue (14, no sensitive buildings): house · lodge · office building · bridge · bus · jeep · truck ·
  fuel tanker · excavator · tent camp · shipping container · radio mast · boulder · tree (`lib/object-catalogue.ts`).
- Portrait framing: corridor diagonal. Impact cam: on (desktop, not reduced-motion).
- **X-ray terrain** (owner's idea, from the side view): terrain opacity eases from solid (top-down) to ≈ 40 %
  (side view) with the ridgeline kept as a faint outline, plus an "X-RAY VIEW" chip — so looking *through* the
  mountain at the channel is a feature, not a glitch (`horizontality(pol)` in `lib/corridor-camera.ts` drives it).
- **Robustness contract**: every mesh, object, piece and the camera sample the same bilinear ground
  (`makeGroundSampler`), pieces are integrated by `lib/flood-physics.ts` whose invariant (never below ground + r)
  is unit-tested; objects sit on foundation pads aligned to the ground normal.

## 6. Out of scope (deliberately)
Sound; a DEM; real hydraulics; multiplayer/leaderboards; saving scenarios; WebGPU.

## 7. Open questions for the owner (defaults in bold)
1. Portrait framing on phones: **corridor diagonal** vs vertical scroll-along? (diagonal fits more in one screen)
2. Impact cam on desktop: **on** (0.7 s) — or off if it feels gimmicky?
3. Object catalogue: the 11 above, or add "school" and "temple" for local resonance? (**add both**, cheap)
