# Validation and confidence

## Why validation is central

The main failure mode is a 3D product that looks realistic but contains biased or unstable elevations. Validation is part of the product, not a final cosmetic check.

## Error sources

- RPC or camera-position bias;
- weak convergence geometry;
- feature-matching error;
- cross-sensor radiometric differences;
- rolling/line-scanner timing or jitter effects;
- cloud and shadow edges;
- water and moving sediment;
- occlusion in steep terrain;
- vegetation and building-surface differences;
- horizontal and vertical misregistration;
- pre/post resolution mismatch;
- geoid or vertical-datum mismatch;
- interpolation and rasterization.

## Validation levels

### Level 1 — Internal stereo consistency

Measure:

- number and distribution of matches;
- reprojection residuals;
- ray-intersection error;
- left/right disparity consistency;
- dense support fraction;
- local roughness and outliers.

This can reject bad reconstructions but cannot prove absolute accuracy.

### Level 2 — Stable-terrain repeatability

After alignment, compare pre/post surfaces over withheld stable terrain. Measure bias, spread, slope/aspect dependence, and spatial trends.

### Level 3 — Independent elevation control

Where available, compare with:

- surveyed ground-control points;
- independently generated high-quality DSMs;
- reliable airborne or drone products;
- multiple independent stereo pairs;
- stable infrastructure with known elevation.

### Level 4 — Interpretation validation

Before calling positive change debris or burial, compare it with:

- optical evidence of deposition;
- field or drone observations;
- mapped flood/landslide extent;
- building geometry and pre-event height;
- independent expert review.

## Defining “precise enough”

Accuracy requirements must be set from the smallest intended claim.

Examples:

- detecting only very large changes permits relatively coarse error;
- separating broad `0–2`, `2–5`, and `>5 m` classes needs tighter error;
- reporting a specific building as buried by approximately 1 m needs much stronger vertical and horizontal validation.

The uncertainty should be comfortably smaller than the smallest reported change class.

## Confidence classes

Initial surface-change output can use:

```text
NO_DATA
UNSUPPORTED
LOW_CONFIDENCE
POSSIBLE_CHANGE
CONFIDENT_POSITIVE_CHANGE
CONFIDENT_NEGATIVE_CHANGE
NO_DETECTABLE_CHANGE
```

Confidence must be calculated from transparent measurements rather than visual judgment alone.

## Pilot acceptance checklist

- Camera models load without warnings that invalidate use.
- Convergence geometry meets the declared requirement across enough AOI.
- Matches are spatially distributed.
- Dense support covers useful terrain types.
- Ray-intersection errors are acceptable relative to image GSD and target accuracy.
- No major slope/aspect bias remains on stable terrain.
- Independent checks agree within the declared uncertainty.
- Unsupported regions remain nodata.
- The full run is reproducible from recorded inputs and commands.
