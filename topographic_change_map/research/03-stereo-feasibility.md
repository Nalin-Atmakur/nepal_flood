# Automated stereo-feasibility evaluation

## Objective

Determine whether a candidate image pair can recover height accurately enough for the intended change categories. Detecting visible parallax alone is not enough.

Evaluation proceeds through increasingly expensive gates so unsuitable pairs fail early.

## Gate A — Product completeness

Pass requirements:

- both images are available;
- both camera models are available and readable;
- the products are suitable for rigorous triangulation;
- acquisition timestamps are known;
- the licence permits processing;
- the exact AOI is declared.

Common rejection reasons:

- orthorectified-only product with no usable original camera model;
- missing or invalid RPC coefficients;
- footprint misses the AOI;
- incompatible or restricted asset.

## Gate B — Common visible terrain

Calculate:

- footprint intersection;
- fraction of the AOI covered by both images;
- cloud and shadow coverage within the overlap, not just scene-wide cloud percentage;
- water and deep-shadow masks;
- predicted terrain occlusion from the two viewing directions.

The overlap must include the target terrain, not merely some part of the same satellite strip.

## Gate C — Camera geometry

Use each camera model to cast viewing rays across an AOI grid. Calculate:

- convergence angle at each sample;
- median and low/high percentiles of convergence;
- spatial variability in geometry;
- effective ground sampling distance;
- expected height sensitivity to matching error;
- areas with weak or degenerate triangulation.

Do not infer pair quality from scene-level off-nadir angles alone. The actual ray geometry over the AOI is the relevant measurement.

## Gate D — Sparse correspondence

Run on small overlapping crops before dense stereo:

1. Select comparable bands, normally panchromatic.
2. normalize resolution and contrast without destroying geometry.
3. Mask clouds, water, saturation, and deep shadows.
4. Detect and describe features.
5. Perform reciprocal matching.
6. Apply ratio tests.
7. Filter with camera-predicted geometry and RANSAC.
8. Measure the spatial distribution of accepted matches.

Possible methods:

- SIFT or AKAZE as transparent baselines;
- ORB for speed experiments;
- learned feature matching only if classical methods fail and results can still be validated.

Metrics:

```text
raw match count
accepted match count
inlier fraction
median matching residual
coverage fraction
matches per grid cell
cloud/water/shadow exclusion fraction
```

Matches concentrated on one road or settlement should not count as full AOI support.

## Gate E — Sparse triangulation

Triangulate accepted matches with the camera models and measure:

- reprojection residual;
- viewing-ray intersection error;
- vertical uncertainty estimate;
- implausible elevations;
- systematic bias or tilt relative to a reference DEM;
- consistency over stable terrain.

This is the first gate that tests whether parallax becomes credible height.

## Gate F — Dense pilot reconstruction

Process several representative patches:

- built-up terrain;
- debris-covered terrain;
- stable steep slope;
- river or road corridor;
- stable control area outside the principal change zone.

Produce a pilot DSM, point cloud, orthoimage, ray-intersection error, and support mask. Do not run the whole corridor until these patches pass.

## Machine verdicts

Every pair receives one result:

```text
REJECT_CAMERA_MODEL
REJECT_NO_OVERLAP
REJECT_CLOUD_OR_OCCLUSION
REJECT_WEAK_GEOMETRY
REJECT_MATCHING
REJECT_TRIANGULATION
REJECT_PRECISION
BLOCKED_AUTH
BLOCKED_ENTITLEMENT
PASS_PILOT
```

The report must include the measurements that caused the verdict.
