# Validation report

## Strict 32 m bundle

| Check | Result |
|---|---:|
| Direct measured cells | 1,252 |
| Direct support | 1.282 km² |
| Stable-terrain NMAD | 4.324 m |
| Median per-cell uncertainty | 6.882 m |
| Median change | +1.746 m |
| P10 / P90 change | −5.487 m / +13.337 m |
| Two-sigma significant cells | 132 of 1,252 (10.5%) |
| Significant positive / negative | 115 / 17 |
| Significant area | 0.135 km² |
| Raster grids identical | Pass |
| Change/uncertainty/support masks identical | Pass |
| Uncertainty positive | Pass |
| `post = pre + change` | Pass; maximum numerical error 0 m |

## GeoPera benchmark

Pinned upstream: `geo-pera/bhotekoshi-2026-reconstruction@43c22e0f9a3777d071c2f181302ca2daad384a53`.

| Comparison | Result |
|---|---:|
| Dense shared-point correlation | 0.906 (`R²=0.820`) |
| Dense median absolute difference | 3.476 m |
| Sparse centerline correlation | 0.991 (`R²=0.983`) |
| Sparse centerline median absolute difference | 0.780 m |
| GLO-30 vs GeoPera/HMA centerline correlation | 0.9998 |
| GLO-30 vs HMA centerline median absolute difference | 1.375 m |
| `>+4 m` deposition precision against upstream wedge | 82.9% |
| Deposition-wedge recall | 15.1% |

GeoPera is a same-source reproducibility benchmark, not independent ground truth. High precision and low recall mean the strict layer agrees where it makes a claim but deliberately leaves most of the broader upstream wedge unsupported.

## Experimental 10 m bundle

| Check | Result |
|---|---:|
| Direct measured cells | 6,882 |
| Direct support | 0.688 km² |
| Stable-terrain NMAD | 4.034 m |
| Median per-cell uncertainty | 6.573 m |
| Median change | +1.080 m |
| P10 / P90 change | −5.916 m / +8.804 m |
| Two-sigma significant cells | 284 of 6,882 (4.1%) |
| Significant positive / negative | 230 / 54 |
| Directly measured UNOSAT area | 0.248 km² (0.664% of full mask) |
| GeoPera shared-point correlation | 0.894 (`R²=0.800`) |
| Raster bundle invariants | Pass |
| Automated promotion gate | Pass as `RESEARCH_ONLY` |

The 10 m grid gives finer localization, not 10 m vertical accuracy. It covers
less direct area than the default 32 m layer because the finer cells require a
direct match rather than inheriting support from a coarser aggregate cell.

## Cross-machine reproducibility

Independent relaxed-layer runs used Apple Silicon/Python 3.13 and Intel/Python 3.9:

| Metric | Result |
|---|---:|
| Overlapping measured cells | 1,486 |
| Change correlation | 0.9936 (`R²=0.9872`) |
| Median absolute change difference | 0.247 m |
| Median bias | −0.132 m |
| Support-mask IoU | 0.729 |

## Rejected second pair

The automatically selected 28 August pair
`B030001100CF1310 + B110001101165110` produced 2,997 supported 32 m cells
(3.069 km²) and passed all internal raster invariants. It was nevertheless
rejected because stable-terrain NMAD was 6.289 m, exceeding the fixed 6.0 m
promotion ceiling; median uncertainty was 9.906 m. None of those cells enters
the mosaic or viewer.

The automatically selected 27 August pair
`B040001100881410 + B040001100882F10` also passed raster invariants but was
rejected: 7,708 supported cells (7.893 km²), stable NMAD 6.613 m, and median
uncertainty 9.784 m. Its larger footprint does not compensate for failure of
the stable-terrain accuracy gate.

## Affected-area coverage

The strict layer directly measures 0.520 km² of UNOSAT’s 37.415 km² affected mask: 1.39% of the full authoritative extent and 9.54% of the affected area inside the current processing rectangle. Additional Vantor pairs and the 10 m experimental layer are tracked separately and must not be conflated with the default strict coverage.

## Buildings

| Classification | Records |
|---|---:|
| Significant positive change | 2 |
| Significant negative change | 2 |
| Measured but not significant | 305 |
| Unsupported | 3,951 |

Only four building records intersect a two-sigma significant cell. This is not enough evidence to label any building buried; the building layer is a screening overlay only.

## Interpretation boundary

The output supports broad surface-change screening. It does not currently support precise debris depth, individual-building burial depth, or operational rescue decisions.

The unknown orthorectification reference DEM is an additional systematic
uncertainty not captured by the per-cell match uncertainty. `post_surface_estimate`
must therefore remain contextual until an original camera-bearing product or a
documented orthorectification reference is obtained.
