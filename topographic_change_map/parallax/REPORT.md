# Public orthorectified-image parallax pilots

Generated: 2026-08-29T19:09:51.444Z

## Results

| Pilot | Reciprocal matches | RANSAC inliers | Spatial support | Median residual | Residual/elevation correlation | Verdict |
|---|---:|---:|---:|---:|---:|---|
| vantor-opposite-look-syabrubesi | 200 | 100 | 23.0% | 3.44 m | 0.229 | PASS_LIMITED_PARALLAX |
| skysat-pelican-syabrubesi | 65 | 4 | 4.0% | 3.91 m | n/a | FAIL_SPARSE_CORRESPONDENCE |

## Interpretation

- The Vantor opposite-look pair passes the limited sparse-parallax gate. Its residual displacement remains spatially sparse and cannot be converted to absolute height without the original camera models.
- The public SkySat-Pelican orthorectified pair fails sparse correspondence on the explicit Syabrubesi pilot. Camera-bearing Basic products may still be tested if acquired, but the public orthos do not currently support a reliable reconstruction.
- The elevation correlation uses coarse Copernicus GLO-30 only as a diagnostic for terrain dependence. It is not a calibration from residual pixels or metres to elevation.
- The Vantor residual/elevation correlation is weak (0.229; R² approximately 0.052), so this pilot does not independently establish a strong height relationship.
- All crops, match visualizations, and point-level residuals remain under the ignored local work directory. Only aggregate non-imagery results are published.
