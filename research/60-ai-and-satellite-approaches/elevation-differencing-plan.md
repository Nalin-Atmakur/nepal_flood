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

1. ⚠️ **Stereo availability unconfirmed** — nobody has verified that any open Vantor/Planet scene for this event is a true stereo pair rather than mono. If none are, this plan needs tasked stereo (Charter/authority request) or dies. *Check before any other work.*
2. Post-event cloud (71–81% on Vantor) may block stereo matching exactly where we need it.
3. Vantor/Planet licences are CC-BY-NC — fine for humanitarian use, flag for anything commercial.
4. Output is an **estimate for triage, not a survey** — never present it as engineering or legal fact.

## Status

Not started. First action: enumerate `view:sun_azimuth`/off-nadir metadata across the 13 Vantor items + 24 Planet scenes and answer blocker 1. `[OWNER: unassigned]`
