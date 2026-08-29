# Derived topographic-change products

These are aggregate, non-personal research products derived from public Vantor imagery and Copernicus GLO-30. Source imagery is not redistributed.

## Default product

`ortho-change-v3-strict/` is the default 32 m research layer. It uses the strong public Vantor pair `B040001100881410 + B040001100881710`, a 25% peak-sharpness reliability threshold, stable-terrain bias-plane correction, and direct-support-only output.

| File | Meaning |
|---|---|
| `surface_change_32m.tif` | Estimated post-event surface change; positive is higher, negative is lower |
| `uncertainty_32m.tif` | Per-cell uncertainty derived from stable-terrain residual scatter and match reliability |
| `support_count_32m.tif` | Number of direct tie-point observations entering each cell |
| `coverage_32m.tif` | `1` only where direct measurement support exists |
| `significant_change_32m.tif` | `−1` significant loss, `0` measured but not significant, `+1` significant gain, `−128` nodata; two-sigma threshold |
| `pre_glo30_32m.tif` | Coarse pre-event contextual surface |
| `post_surface_estimate_32m.tif` | Pre-event context plus measured change, only at supported cells |
| `measured-support.geojson` | WGS84 polygons of direct measurement support |
| `mapped-tiles-1km.geojson` | 1 km reporting grid; not analysis resolution |
| `MAPPED_TILES.md` | Latitude/longitude table for reporting tiles |
| `summary.json` | Method and aggregate statistics |
| `validation.json` | Mandatory raster-bundle invariants and upstream diagnostic |
| `geopera-comparison.json` | Detailed benchmark against pinned GeoPera products |
| `affected-coverage.json` | Direct support intersected with the UNOSAT affected mask |

## Alternate layer

`ortho-change-v2/` uses a relaxed 12% match threshold. It has broader support but slightly higher stable-terrain error. It remains available for sensitivity analysis and is not the viewer default.

## Buildings

- `building-change-summary-strict.geojson` is the default building overlay.
- `building-change-summary.geojson` is the relaxed-layer alternative.

A measured surface change is not automatically debris depth or burial depth. Unsupported buildings have null measurements and the explicit status `UNSUPPORTED`.

## Scientific classification

All current products are `RESEARCH_ONLY`. The public orthos lack original camera models, angles are treated as locally constant, and the baseline is too coarse for building-scale burial estimates.
