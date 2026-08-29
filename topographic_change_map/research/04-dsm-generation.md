# DSM generation with NASA Ames Stereo Pipeline

## Purpose

NASA Ames Stereo Pipeline (ASP) is the primary proposed engine for converting suitable satellite images and camera models into a point cloud and digital surface model (DSM).

The exact commands depend on provider packaging and sensor type. The commands below are a workflow skeleton, not yet a reproducible run configuration.

## Inputs for one epoch

```text
left image
right image
left camera/RPC
right camera/RPC
seed DEM for map projection
AOI polygon
cloud/water/shadow masks
```

The complete process must be run separately for the pre-flood and post-flood epochs.

## Step 1 — Inspect and normalize

Verify:

- image dimensions and bit depth;
- bands and panchromatic availability;
- RPC readability;
- coordinate reference information;
- nodata values;
- capture time;
- AOI overlap;
- consistent height datum assumptions.

Crop to a buffered AOI only after preserving or correctly adjusting the camera metadata.

## Step 2 — Bundle adjustment

Use `bundle_adjust` to improve camera self-consistency:

```bash
bundle_adjust -t rpc \
  left.tif right.tif \
  left.xml right.xml \
  -o epoch_ba/run
```

Ground-control points may improve absolute accuracy when reliable control exists. Bundle adjustment without ground control improves internal consistency but does not guarantee absolute geolocation.

## Step 3 — Map projection

Steep terrain benefits from map projection onto a seed DEM such as GLO-30:

```bash
mapproject -t rpc \
  --bundle-adjust-prefix epoch_ba/run \
  seed_dem.tif left.tif left.xml left_map.tif

mapproject -t rpc \
  --bundle-adjust-prefix epoch_ba/run \
  --ref-map left_map.tif \
  seed_dem.tif right.tif right.xml right_map.tif
```

The seed DEM simplifies correspondence. It is not the final reconstructed surface.

## Step 4 — Dense stereo

Initial ASP experiment:

```bash
parallel_stereo \
  -t rpcmaprpc \
  --bundle-adjust-prefix epoch_ba/run \
  --stereo-algorithm asp_mgm \
  --subpixel-mode 9 \
  left_map.tif right_map.tif \
  left.xml right.xml \
  epoch_stereo/run \
  seed_dem.tif
```

Expected primary outputs include disparity products and `epoch_stereo/run-PC.tif`, the triangulated point cloud.

Cross-sensor SkySat–Pelican matching may require additional normalization and parameter tuning. Parameters must be selected from pilot results, not copied blindly from another sensor example.

## Step 5 — Point cloud to DSM

```bash
point2dem \
  --auto-proj-center \
  --tr TARGET_GRID_SIZE_METRES \
  --errorimage \
  --orthoimage epoch_stereo/run-L.tif \
  epoch_stereo/run-PC.tif
```

Expected products:

```text
run-DEM.tif
run-DRG.tif
run-IntersectionErr.tif
```

The output grid size should reflect actual image resolution, stereo geometry, and validated precision. A small pixel size does not by itself imply fine accuracy.

## Step 6 — Quality masking

Mask or reject:

- pixels without stereo support;
- excessive triangulation error;
- clouds and cloud edges;
- water;
- deep shadows;
- correlation blunders;
- isolated spikes and pits;
- implausible elevations.

Do not fill large gaps in the scientific DSM. A separate visualization-only surface may be filled if it is unmistakably labelled and never used for measurement.

## Step 7 — Reproducibility record

Each run must store:

- input asset IDs and checksums;
- camera-file checksums;
- AOI version;
- ASP version;
- full command lines and configuration;
- environment/container version;
- masks used;
- output checksums;
- summary quality metrics;
- pass/fail verdict.
