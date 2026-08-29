# Execution roadmap

## Milestone 0 — Define the experiment

Deliverables:

- exact Syabrubesi pilot AOI GeoJSON;
- separately named Rasuwagadhi AOI if still in scope;
- target change classes;
- maximum acceptable horizontal and vertical uncertainty;
- stable-terrain validation areas;
- run-manifest schema.

Exit condition: the system knows exactly where and how accurately it must measure.

## Milestone 1 — Planet access checkpoint

Query:

```text
20260827_020055_ssc1_u0001
20260827_060959_65_3009
```

Confirm:

- exact product IDs;
- Basic/non-orthorectified availability;
- RPC availability;
- entitlement;
- footprint overlap with the declared AOI;
- bands, GSD, and cloud conditions;
- licence terms.

Decision:

- both suitable products accessible: proceed;
- products exist but access denied: pursue Planet humanitarian/research access;
- products unsuitable or absent: stop this pair and move to alternatives.

## Milestone 2 — Automated geometry report

Deliver:

- RPC parser and validation;
- AOI overlap report;
- ray-derived convergence map;
- predicted precision estimate;
- geometry pass/fail verdict.

Exit condition: geometry is strong enough to justify imagery download and matching work.

## Milestone 3 — Sparse cross-sensor test

Deliver:

- representative image crops;
- masks;
- accepted feature matches;
- spatial-support plot;
- sparse triangulated points;
- reprojection and ray-intersection errors.

Exit condition: matching and triangulation are credible over multiple terrain types.

## Milestone 4 — Post-flood pilot DSM

Run ASP over small representative patches and deliver:

- point cloud;
- DSM;
- orthoimage;
- intersection-error raster;
- support mask;
- validation report.

Exit condition: observed precision supports a declared use case.

## Milestone 5 — Pre-flood surface

In parallel with post-flood work:

1. search for recent pre-flood RPC-bearing stereo;
2. investigate Airbus, Vantor commercial archive, and authorized Charter access;
3. evaluate historical Cartosat-1;
4. document the limited coarse fallback using GLO-30.

Exit condition: a comparable baseline exists, or the project explicitly narrows to a post-flood DSM/coarse-change product.

## Milestone 6 — Alignment and differencing

Deliver:

- stable-terrain mask;
- alignment transform and diagnostics;
- common-grid pre/post DSMs;
- surface-change raster;
- uncertainty raster;
- significant-change and valid-support masks.

Exit condition: residual error over withheld stable terrain is smaller than the declared change threshold.

## Milestone 7 — Building analysis

Deliver:

- licensed building footprints and provenance;
- per-building surface-change summaries;
- confidence and valid-coverage statistics;
- interpretation limits.

Do not add burial estimates unless separately validated.

## Milestone 8 — Viewer

Deliver:

- web-optimized terrain and raster tiles;
- CesiumJS interface;
- layer controls;
- click inspection;
- confidence and provenance display.

The viewer is complete only when it communicates uncertainty and nodata correctly.

## Fallback order

If Planet is not viable:

1. Airbus Pléiades Neo plus Pléiades Primary/DIMAP;
2. authorized International Charter products;
3. original commercial Vantor/WorldView products;
4. other verified optical stereo candidates;
5. SAR as a separate, lower-priority change experiment.
