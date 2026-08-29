# Stereo availability findings — Rasuwagadhi border post

*Answers blocker 1 from [elevation-differencing-plan.md](elevation-differencing-plan.md): "nobody has verified that any open Vantor/Planet scene for this event is a true stereo pair." Checked 2026-08-29. Full per-scene data: [gyirong-imagery-inventory.json](gyirong-imagery-inventory.json).*

**Target:** 28.279672°N, 85.377744°E. Cutoff: 2026-08-26 08:37 NPT (02:52 UTC).

## Verdict

**No genuine pre-event stereo pair exists** in any open catalog checked. Every pre-event scene that covers the site is a single viewing angle. **Post-event stereo does exist** (Vantor, two same-pass multi-angle sets) but is heavily cloud-affected.

## Per-source findings

| Source | Verdict | Basis |
|---|---|---|
| **Vantor Open Data** (13 items, all checked) | Pre: no stereo. Post: 2 genuine same-pass multi-angle sets (2026-08-27, 2026-08-28) covering the site, but 71–81% cloud cover tile-wide | Direct STAC `view:off_nadir`/`view:azimuth` comparison across all items |
| **Planet — PlanetScope pre-event** (5 items, checked) | No stereo — near-identical ~4.8–4.9° off-nadir, ~277° azimuth across the whole strip | Direct STAC metadata |
| **Planet — Pelican post-event** (3 items, checked) | No stereo — same-strip, near-identical angle | Direct STAC metadata |
| **Planet — SkySat post-event** (2 items, checked) | Too weak — only 0.7° convergence between the pair | Direct STAC metadata |
| **Planet — PlanetScope post-event**, 2026-08-26 (9 scenes) and 2026-08-28 (5 scenes) | **Unchecked** — collection-level only, item angles not yet pulled | Not yet queried |
| **Sentinel-2** | Not stereo-capable for this purpose — nearest two covering orbits (119, 76) are only ~1.5° apart; single post-event scene is 78.5% cloud tile-wide | Queried STAC directly (`stac.dataspace.copernicus.eu`), not assumed |
| **JAXA ALOS PRISM** | Ruled out by mission dates — PRISM operated 2006–2011; current border-post structures date from the Dec 2014 inauguration, so PRISM predates the thing we're measuring | Logic only, never queried (G-Portal registration required) |
| **Maxar/Vantor general commercial archive** | Not checked — no confirmed free-tier access | Blocked, not investigated further |
| **Google Earth historical imagery** | Not stereo-usable by design — no RPC/angle metadata exposed, mono visual cross-check only. User found a 2026-07-01 frame manually (automated browser check failed on WebGL); provider unconfirmed | Manual, one frame |
| **Esri World Imagery Wayback** | API pattern and Feb-2014 coverage confirmed, but **never actually queried** for this coordinate | Identified, not executed |

## A candidate nobody had considered: cross-source heterogeneous stereo

Vantor's 2021-10-16 scene and Planet's 2026-05-27 PlanetScope scene share near-identical azimuth (~274.5° vs ~277°) but differ ~22.7° in off-nadir — enough convergence to attempt as a **heterogeneous stereo pair**, despite being different providers/sensors 4.5 years apart with an 8–10x resolution mismatch (sub-meter Vantor vs 3.7m PlanetScope). Untested. Real risks: unrelated ground change over 4.5 years would corrupt the result, and nobody has visually diffed the two scenes yet.

## Elevation baseline cross-check (stands in for pre-event stereo where none exists)

| Source | Value at target coordinate | Note |
|---|---|---|
| Open-Meteo elevation API | 1819.0 m | Coarse global-DEM-derived point value; Open-Elevation timed out on the same query |
| Copernicus GLO-30 (AWS Open Data, `Copernicus_DSM_COG_10_N28_00_E085_00_DEM`) | 1822.6 m | Cross-validates against Open-Meteo (~3.5m apart). Local 2km window: 1738–2737m (steep gorge). **No embedded acquisition date** — source TanDEM-X passes were collected circa 2010–2015, straddling the Dec 2014 border-post inauguration, so it's unresolved whether this tile predates current structures |

NASADEM and JAXA AW3D30 — the other two baselines named in the original plan — have not yet been pulled.

## Updated next actions

1. Pull item-level angles for the two unchecked Planet PlanetScope post-event collections (08-26, 08-28).
2. Query Esri Wayback for this coordinate directly (pattern already known).
3. Pull thumbnails for the Vantor 2021-10-16 / Planet 2026-05-27 pair and visually check for unrelated ground change before treating it as viable.
4. Pull NASADEM and AW3D30 as a third/fourth baseline cross-check.
5. Determine whether the Copernicus GLO-30 tile's TanDEM-X acquisition predates Dec 2014.
6. `[OWNER: unassigned]` — if 1–3 don't produce a usable pre-event stereo pair, this plan needs tasked stereo (Charter/authority request) per the plan's own blocker 1 fallback, or falls back to the DEM baseline as the best available "before" surface.
