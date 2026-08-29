# Goal and scope

## Goal in simple terms

Build a map showing how the ground surface changed after the flood:

- where material accumulated;
- where material was removed;
- which measurements are reliable;
- and, later, which damaged buildings overlap substantial measured change.

The core calculation is:

\[
\Delta h = h_{post} - h_{pre}
\]

where `h_post` is the reconstructed post-flood surface and `h_pre` is the comparable pre-flood surface.

## Correct terminology

This is a **topographic change** or **surface-elevation change** project. “Topology” concerns connectivity and is not the intended measurement.

The first defensible output is a surface-elevation change map. It becomes a debris-deposition or burial estimate only after other causes and measurement errors have been evaluated.

## Intended outputs

Minimum scientific outputs:

```text
pre_flood_dsm.tif
post_flood_dsm.tif
surface_change.tif
surface_change_uncertainty.tif
significant_change_mask.tif
stereo_support_mask.tif
pre_reconstruction_error.tif
post_reconstruction_error.tif
processing_report.json
```

Later product outputs may include:

- a web-ready terrain mesh or terrain tiles;
- an imagery layer;
- building footprints and existing damage classes;
- per-building summary statistics;
- a CesiumJS viewer.

## Initial geographic scope

The project discusses two different areas that must not be conflated:

1. **Rasuwagadhi/Gyirong border-post target** — the existing repository inventory uses the point `28.279672, 85.377744`.
2. **Syabrubesi pilot AOI** — the newer project summary describes an approximately 1 km by 1 km stereo test area.

Every experiment must store its exact AOI as GeoJSON and name the AOI in its run manifest. A scene that covers one AOI does not necessarily cover the other.

## Scientific questions

1. Can suitable images and camera models be obtained for both epochs?
2. Is their viewing geometry strong enough for the required vertical precision?
3. Can cross-sensor imagery be matched reliably over steep, cloudy terrain?
4. Can pre- and post-flood surfaces be aligned without erasing real change?
5. Is the uncertainty small enough for the intended change categories?
6. Can measured surface change be interpreted as debris deposition at buildings?

## Non-goals for the current phase

- Building the final viewer before the DSM is validated.
- Estimating individual survivors’ locations.
- Publishing individual-level data.
- Calling positive elevation change “debris depth” without validation.
- Upsampling a 30 m DEM and treating it as building-scale information.
- Filling unsupported stereo regions and reporting them as measured terrain.
