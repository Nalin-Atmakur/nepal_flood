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

## Cross-machine reproducibility

Independent relaxed-layer runs used Apple Silicon/Python 3.13 and Intel/Python 3.9:

| Metric | Result |
|---|---:|
| Overlapping measured cells | 1,486 |
| Change correlation | 0.9936 (`R²=0.9872`) |
| Median absolute change difference | 0.247 m |
| Median bias | −0.132 m |
| Support-mask IoU | 0.729 |

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
