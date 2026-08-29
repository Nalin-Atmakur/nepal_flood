# AI + satellite approaches, assessed honestly

*Compiled 2026-08-29. The four workflow families from the team's founding message, tested against what actually exists for THIS event. Verdicts per `README.md` scale.*

## The one-line summary

**Everything needed for a useful contribution is already downloadable, free, today.** The gap is not models — it is *fusion*: joining published damage, population, access, and hazard layers into one honestly-labelled prioritisation product, and keeping it current. Nothing below requires training a model.

## 1. SAR cloud-piercing flood mapping — FEASIBILITY: USE-OUTPUTS

- Real and load-bearing: monsoon cloud is blocking optical imagery right now (post-event Vantor scenes are 71–81% cloud; ~4 km of river solidly clouded in the 27 Aug Sentinel-2 scene).
- Already done by professionals for this event: UNOSAT satellite-detected mudflow/rockflow extents for Rasuwa + Nuwakot (published 27 Aug, → sources/2026-08-29--reliefweb--disaster-page.md); Sentinel Asia EOS-RS Sentinel-1 damage-proxy maps (28 Aug, KMZ, → sources/2026-08-26--sentinel-asia--emergency-observation.md); ICIMOD/SERVIR flood inundation tool.
- UNOSAT FloodAI: real pipeline (Sentinel-1 + deep learning + human review, WorldPop overlays), historically deployed for Nepal monsoons; a dedicated dashboard for this event is `[UNVERIFIED]`. Its own caveats: underestimates water in built-up/vegetated areas — and this event is a *sediment-laden debris flow in a steep gorge*, the regime SAR water classifiers are weakest in.
- **Do:** consume their extents. **Don't:** train our own SAR segmentation — it would arrive after the search window closes and perform worse than the professionals' human-reviewed product.
- Constraint to respect: Sentinel-1 revisit over Nepal is ~6–12 days per orbit direction — SAR is not a daily lake monitor.

## 2. Change detection & building-damage mapping — FEASIBILITY: BUILD-ON (the fusion, not the detection)

- Already done twice for this event, by different methods: HOT fAIr AI damage classes (1,053 buildings, ~18 km², → sources/2026-08-28--hot-hdx--fair-damage-dataset.md) and Copernicus EMSR927 human-graded assessments (Syabrubesi, Timure, Bidur; Bharatpur pending, → sources/2026-08-29--copernicus-ems--emsr927.md).
- What does NOT exist: those layers joined with population and access into one ranked product. That is the team's opening (see `../30-user-needs/priority-map-concept.md`).
- Population inputs, with their real biases: Meta HRSL Nepal (~30 m) is unmaintained since 2024 and rests on 2016 imagery; WorldPop 100 m constrained rasters; Kontur 400 m H3 pre-aggregation. **All estimate *pre-event resident* occupancy** — they cannot see the ~668 missing tourists (34 countries) or hydropower crews. Label accordingly.
- Building footprints: OSM (fresh — activation is mapping now), Microsoft (over-merges dense Nepali fabric), Google Open Buildings (geometrically better in Kathmandu tests), HOT's event-specific fAIr footprints on HDX.
- **The honest line that governs this whole family** (from the team's own tooling doc): *satellite imagery can prioritise likely affected populated locations; it cannot detect living survivors beneath debris.* Any "survivor heat map" is actually **pre-event people-presence × damage × cut-off-ness**, and must be labelled exactly that.

## 3. Hydrodynamic simulation / mudflow prediction — FEASIBILITY: RESEARCH-ONLY (with one USE-OUTPUTS edge)

- The team's own assessment ("will take too long") matches ours. Calibrated dam-break modelling needs the barrier geometry — which Chinese engineering teams are measuring on-site with LiDAR/drones and running simulations on already (→ sources/2026-08-28--scmp--china-response.md). A volunteer surrogate model cannot beat instrumented state teams, and publishing an uncalibrated flood-path prediction would be dangerous (see `../50-ethics-and-legal/DO_NO_HARM.md`).
- Google Flood Hub covers Nepal but is a *riverine rain-runoff* forecaster — landslide-dam breaches are outside its training distribution; it is not a secondary-outburst monitor. Worth a daily glance for compound monsoon risk downstream, nothing more.
- Zhang et al. 2026 (→ sources/2026-05--the-innovation--glof-prediction-commentary.md): GLOF prediction fails in general; static dangerous-lake inventories flagged neither the 2025 nor 2026 source on this corridor. Lesson: watch the *formed lakes*, not susceptibility maps.
- **USE-OUTPUTS edge that IS feasible (1 day + ongoing): a barrier-lake watch script.** Auto-pull every new Sentinel-2/Landsat/PlanetScope scene over the two impoundments (Copernicus Data Space + Planet open release), compute a simple NDWI/lake-area time series, fall back to Sentinel-1 amplitude when clouded, alert the team on change. Position strictly as supplementary situational awareness relayed to responders/ICIMOD — DHM/NDRRMA own public warnings. Never publish as a warning channel.

## 4. Drone-based visual reconnaissance + CV — FEASIBILITY: BUILD-ON, only through the existing channel

- The channel already exists and is official: Nepal Drone Association — 50+ pilots with thermal + LiDAR in Rasuwa/Nuwakot/Dhading under a pre-existing NDRRMA agreement; government publicly appealing for drone footage; imagery landing on OpenAerialMap; Youth Innovation Lab assessments feeding NESRA FloodWatch (→ sources/2026-08-26--kathmandu-post--drone-deployment.md).
- The WFP–Synthetaic/RAIC precedent is real (Mozambique) but commercial and not present here.
- **Do (stretch):** open-model detection (open-vocabulary detectors) over OpenAerialMap RGB/thermal frames to pre-screen for people/structures, results handed privately to NDA/NDRRMA. **Don't:** publish detections — coordinates implying possible casualties are sensitive; and don't fly anything.
- Sober note for expectations: The Conversation's "why drones and AI can't quickly find missing flood victims yet" is the honest counterweight to vendor claims.

## What is hype for this use case (say it plainly)

1. Training new flood-segmentation or damage CNNs during the response — outrun by UNOSAT/CEMS/fAIr before it starts.
2. "AI finds survivors from space" — nothing in orbit sees under mud. FINDER-style sub-surface radar is a ground USAR tool, not ours.
3. Volunteer dam-break prediction — see family 3.
4. Rebuilding Person Finder / a missing-persons AI — ecosystem dead (Person Finder repo archived 2025-09-17), lane belongs to ICRC RFL + Nepal Police, and it's a PII liability volunteers must not hold (→ `../20-existing-systems/`).

## The three concrete contributions that survive scrutiny

*(feeding docs/DECISIONS.md — each doable in days by 5–10 people)*

1. **Population-weighted triage grid** — intersect EMSR927 grading + UNOSAT extent + fAIr damage with footprints and HRSL/Kontur population → ranked per-settlement estimate of pre-event occupants in destroyed/cut-off structures. GeoJSON/PMTiles, per-layer provenance + confidence, coverage polygon always displayed.
2. **Reachability layer** — OSM road graph + CEMS road/bridge grading + manual checks against 0.55–0.8 m Planet scenes → which settlements are road-reachable / foot-reachable / heli-only, refreshed as validation lands; corrections routed through HOT Tasking Manager so validators adjudicate.
3. **Barrier-lake watch script** — as family 3 above.
