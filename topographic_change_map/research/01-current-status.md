# Current scientific status

## Product phase

The project now has reproducible **research-only surface-change products** and
an interactive viewer. It does not yet have a rigorous RPC-triangulated
post-flood DSM or a building-burial product.

## Public WorldView route

The strongest reproducible pair is:

```text
B040001100881410 + B040001100881710
```

It was acquired on 27 August 2026 about 82 seconds apart with approximately
48.25° separation from published constant-look metadata. Both public COGs are
orthorectified and contain no original RPC/physical camera model. The method
therefore measures opposing-look residual ortho-parallax, removes a stable-
terrain bias plane, and uses the published look vectors for an approximate
height conversion. This is not conventional absolute stereo triangulation.
The original orthorectification reference DEM is also unknown; adding the
derived change to GLO-30 produces contextual absolute heights rather than an
independently validated post-event DSM.

Current validated products:

| Product | Support | Stable NMAD | Median uncertainty | Classification |
|---|---:|---:|---:|---|
| Strict 32 m | 1.282 km² / 1,252 cells | 4.324 m | 6.882 m | Research only |
| Experimental 10 m | 0.688 km² / 6,882 cells | 4.034 m | 6.573 m | Research only |

The strict layer has 132 two-sigma significant cells. The 10 m experiment has
284. The smaller 10 m cell spacing improves localization but does not establish
better vertical accuracy.

Cross-machine reproduction of the relaxed 32 m layer achieved correlation
0.9936 and median absolute difference 0.247 m across 1,486 shared cells.
Comparison with the pinned GeoPera same-source reconstruction gives dense
correlation 0.906 and sparse centerline correlation 0.991. GeoPera is a
reproducibility benchmark, not independent ground truth.

## Coverage

The default processing rectangle spans approximately `28.139691–28.283023°N`
and `85.310212–85.393888°E`. Strict direct support measures 0.520 km² of the
37.415 km² UNOSAT affected mask (1.39%). Plausible public Vantor pair footprints
could cover up to 8.61 km² (23.0%) before cloud and matching losses. Additional
pairs were evaluated through the automated gate. The 28 August pair yielded
3.069 km² raw support but 6.289 m stable NMAD; the additional 27 August pair
yielded 7.893 km² raw support but 6.613 m stable NMAD. Both exceed the fixed
6.0 m ceiling and are excluded, so no multi-pair mosaic is published.

One-kilometre cells are reporting bins generated after matching. They are not
image pixels, processing tiles, correlation windows, or output resolution.

## Planet and camera-bearing imagery

The exact SkySat and Pelican acquisitions exist, but the public disaster copies
are orthorectified and cross-sensor matching fails on those copies. A truthful
Planet free account was created and email-verified. It exposes Sandbox Data and
APIs but reports no active imagery products, so the exact Basic/RPC products are
not entitled.

NASA Ames Stereo Pipeline 3.7.0 is installed on the isolated sandbox and passed
its official ASTER RPC end-to-end fixture. The Nepal public products cannot use
that rigorous route because they lack camera models; ASP is ready when a
camera-bearing product becomes accessible.

## Pre-event baseline

Copernicus GLO-30 is the current broad pre-event context and is too coarse for
building-scale burial analysis. Four exact High Mountain Asia 8 m mosaic
granules are catalogued. Earthdata registration is filled but awaits the user's
manual CAPTCHA; the protected request currently returns HTTP 401. GeoPera's HMA
profile agrees closely with GLO-30 along the centerline (correlation 0.9998,
median absolute difference 1.375 m), but that is not a substitute for obtaining
and validating the original baseline locally.

## Interpretation boundary

Demonstrated:

- reproducible relative surface-change signal;
- direct support, uncertainty, significance, coverage, and building overlays;
- stable-terrain and cross-machine diagnostics;
- a viewer that distinguishes measured, insignificant, significant, and nodata.

Not demonstrated:

- rigorous absolute post-flood elevation from the public products;
- sub-metre or building-scale vertical accuracy;
- debris depth or building burial depth;
- suitability for operational rescue decisions.
