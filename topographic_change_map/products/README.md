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
| `promotion.json` | Automated quality-gate decision governing mosaic inclusion |
| `geopera-comparison.json` | Detailed benchmark against pinned GeoPera products |
| `affected-coverage.json` | Direct support intersected with the UNOSAT affected mask |

## Alternate layer

`ortho-change-v2/` uses a relaxed 12% match threshold. It has broader support but slightly higher stable-terrain error. It remains available for sensitivity analysis and is not the viewer default.

`ortho-change-10m-experimental/` is a separately validated finer-grid
experiment from the same strong pair. It contains 6,882 directly supported 10 m
cells (0.688 km²), stable-terrain NMAD 4.034 m, median uncertainty 6.573 m, and
284 two-sigma significant cells. Its smaller cell spacing does not improve its
vertical accuracy class: it remains `RESEARCH_ONLY`. The interactive viewer
loads it lazily through **Product grid → Experimental 10 m**.

The viewer's `imagery/` assets are 2 m RGB previews of the two post-event
opposite-look inputs. They are aligned for clicked-point comparison but are not
additional elevation products and are not described as pre/post imagery. They
retain Vantor attribution and the Open Data CC BY-NC 4.0 licence.

## Buildings

- `building-change-summary-strict.geojson` is the default building overlay.
- `building-change-summary.geojson` is the relaxed-layer alternative.
- `building-change-summary-10m-experimental.geojson` is the experimental 10 m overlay.

A measured surface change is not automatically debris depth or burial depth. Unsupported buildings have null measurements and the explicit status `UNSUPPORTED`.

## Scientific classification

All current products are `RESEARCH_ONLY`. The public orthos lack original camera
models, their orthorectification reference DEM is not supplied, angles are
treated as locally constant, and GLO-30 is too coarse for building-scale burial
estimates. Consequently, `post_surface_estimate` is contextual GLO-30 plus the
measured residual-derived change; it is not an independently triangulated
absolute DSM.

Additional pairs must pass `python/quality_gate.py` before entering a mosaic.
The mandatory default gates are: valid bundle invariants, stable-terrain NMAD no
greater than 6 m, at least 100 stable calibration ties, at least 100 corridor
ties, and at least 0.05 km² of direct support. Passing a gate without rigorous
camera models can produce only `RESEARCH_ONLY`, never a higher accuracy class.

## Rejected products

`rejected-pair2-diagnostic/` preserves the gate evidence for
`B030001100CF1310 + B110001101165110`. It is excluded from all mosaics and the
viewer because stable NMAD was 6.289 m, above the fixed 6.0 m ceiling. Only
diagnostic JSON is retained; rejected rasters are not published.

`rejected-pair3-diagnostic/` records the same outcome for
`B040001100881410 + B040001100882F10`: 7.893 km² raw support but 6.613 m stable
NMAD and 9.784 m median uncertainty. It is likewise excluded.
