# Building integration and interactive viewer

## Sequence

The viewer comes after the surface products pass validation:

```text
Validated DSMs and change map
              |
Building footprints and existing damage data
              |
Per-building zonal statistics
              |
Interpretation and confidence rules
              |
Three.js terrain viewer + OpenStreetMap context panel
```

## Building inputs

Potential inputs:

- HOT/OpenStreetMap building footprints;
- Copernicus EMS or other authoritative damage assessments;
- fAIr-derived building or damage layers, with their validation status retained.

All source licences, timestamps, and provenance must be preserved.

## Safe initial building fields

```text
building_id
source
source_damage_class
valid_change_fraction
median_surface_change_m
p10_surface_change_m
p90_surface_change_m
surface_change_uncertainty_m
reconstruction_confidence
```

Using a distribution and valid-pixel fraction is safer than sampling one pixel at the building centroid.

## Fields requiring additional scientific validation

```text
estimated_debris_depth
burial_class
debris_confidence
```

These require a model of the pre-event ground and building surface. A DSM measures the top visible surface, which may be a roof, vegetation, rubble, or debris. It does not automatically measure ground-level burial.

## Implemented viewer capabilities

The current viewer provides:

- pan, zoom, rotate, and tilt;
- strict 32 m and lazy experimental 10 m product selection;
- contextual pre-event terrain plus supported post-event surface cells;
- surface-change, elevation, uncertainty, and support color modes;
- uncertainty and support layers;
- building footprints and source damage classes;
- click inspection for elevation, change, uncertainty, and support;
- an OpenStreetMap panel with authoritative affected polygons, acquisition
  overlap, direct support, reporting bins, settlements, and live coordinates;
- colour-identical settlement and selected-location pins shared by the map and
  3D terrain, with bidirectional focus;
- same-coordinate RGB crops from both post-event opposite-look acquisitions,
  including acquisition time and look geometry;
- an explicit `RESEARCH ONLY` classification and nodata warning.

## Communication rules

- Always show units and sign convention.
- Make nodata visually distinct from no change.
- Default to showing confidence/support with the change layer.
- Do not imply precision beyond the validation results.
- Avoid alarming labels such as “buried” until independently supported.
- Never expose individual-level personal data.
