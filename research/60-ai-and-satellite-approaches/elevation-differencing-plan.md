# Elevation differencing at the Rasuwagadhi border post

*The team's one genuinely novel specced technical task, from the field tooling doc (→ ../sources/2026-08-29--field--tooling-and-elevation-plan.md). Goal: estimate debris-deposition depth at the destroyed border post — useful for prioritisation and for understanding what search there entails.*

**Target:** Gyirong Port / Rasuwagadhi crossing, ≈ 28.279672°N, 85.377744°E. Event cutoff: 2026-08-26 08:37 NPT (02:52 UTC) — "before" = anything earlier showing the site intact; "after" = anything later.

## Pipeline (as specced)

1. **Find "before" stereo candidates** — Planet archive (disaster + routine catalogs), Vantor/Maxar general archive (border areas get tasked for trade/mapping reasons), Sentinel-2 (10 m fallback), JAXA ALOS PRISM archive. A pair must have convergent viewing angles — single nadir frames don't produce elevation.
2. **Find "after" stereo candidates** — Vantor open collection (check per-scene `view:` STAC metadata for stereo pairing, not just dates), Planet post scenes, Sentinel-2 fallback. Both providers are still adding scenes.
3. **Generate DSMs** — NASA Ames Stereo Pipeline (free, open source; uses RPC camera metadata for georeferencing).
4. **Baseline cross-check** — Copernicus GLO-30 / NASADEM via OpenTopography API; JAXA AW3D30; point lookups via open-elevation for spot checks.
5. **Align & difference** — same CRS + vertical datum (mismatched datums silently produce wrong results); co-register with `pc_align`; after − before = deposition (+) / scour (−).
6. **Extract at the border post** — sample the difference surface at the post coordinates + surrounding building footprints (HOT dataset).

## Validation

- Sanity-check against a stable reference point *near but outside* the debris field.
- Compare trend against the low-res DEM baseline and visual inspection of after-imagery.
- Compare against any published debris-depth estimates (USGS, CEMS, sitreps) as they appear.

## Known blockers (check FIRST, in this order)

1. ✅ **Stereo availability — checked 2026-08-29**, see [stereo-availability-findings.md](stereo-availability-findings.md). **No genuine pre-event stereo pair found** in any open catalog (Vantor, Planet, Sentinel-2 all single-angle pre-event; JAXA ALOS PRISM ruled out by mission dates). Post-event *does* have real stereo (Vantor, two same-pass multi-angle sets) but see blocker 2. A candidate cross-source heterogeneous pair (Vantor 2021-10-16 + Planet PlanetScope 2026-05-27) was identified but not yet tested. Two Planet post-event PlanetScope collections and Esri Wayback remain unchecked.
2. Post-event cloud (71–81% on Vantor) may block stereo matching exactly where we need it.
3. Vantor/Planet licences are CC-BY-NC — fine for humanitarian use, flag for anything commercial.
4. Output is an **estimate for triage, not a survey** — never present it as engineering or legal fact.
5. **No true "before" stereo means step 1 of the pipeline as specced doesn't currently have an input.** Until the cross-source candidate is tested or tasked stereo is requested, "before" elevation is only available via the 30m global DEM baseline (Copernicus GLO-30: 1822.6m at the post; Open-Meteo: 1819.0m) — a coarse stand-in, not a photogrammetric surface, and its own acquisition-date vs. the Dec 2014 border-post construction is unresolved.

## Status

Blocker 1 answered 2026-08-29 — see [stereo-availability-findings.md](stereo-availability-findings.md) for full per-source findings, [gyirong-imagery-inventory.json](gyirong-imagery-inventory.json) for per-scene data. Outcome: pipeline as specced (steps 1–2) cannot currently produce a true before/after stereo DSM pair — no pre-event stereo exists in any open catalog checked so far. Next: test the cross-source candidate, finish the two unchecked Planet collections and Esri Wayback, then decide between tasked-stereo request vs. DEM-baseline fallback. `[OWNER: unassigned]`
