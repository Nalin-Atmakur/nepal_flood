# Creating the surface-elevation change map

## Required inputs

The preferred inputs are:

- a validated pre-flood DSM;
- a validated post-flood DSM;
- uncertainty/error rasters for both;
- support and exclusion masks;
- stable-terrain mask;
- common horizontal and vertical datums.

## Step 1 — Normalize coordinate systems

Both DSMs must use:

- the same projected coordinate reference system;
- metres as horizontal and vertical units;
- the same ellipsoidal or orthometric height convention;
- compatible grids and nodata definitions.

A vertical-datum mismatch can create a broad false offset. Record every conversion.

## Step 2 — Build a stable-terrain mask

Alignment must use terrain believed not to have changed:

- stable exposed rock;
- unaffected slopes;
- terrain outside mapped flood and landslide areas;
- other independently verified control surfaces.

Exclude:

- river channels and water;
- debris deposits;
- landslides and eroded banks;
- buildings and vegetation where possible;
- clouds, shadows, and unsupported stereo;
- areas already suspected to have changed.

If changing terrain is used for alignment, the algorithm may remove part of the real event signal.

## Step 3 — Co-register the DSMs

Use ASP `pc_align` or an equivalent robust DEM-alignment method. Estimate horizontal translation, vertical bias, and any justified rotation using only stable terrain.

For example, a Nuth–Kääb translation model can be tested when its assumptions hold. More general alignment may be needed first if the initial offset is large.

After estimating the transform, apply it to the original post-flood point cloud and regenerate the post DSM on the required common grid.

## Step 4 — Diagnose residual alignment error

On withheld stable terrain, measure:

- median elevation difference;
- normalized median absolute deviation;
- RMSE where appropriate;
- residual difference versus slope and aspect;
- spatial trends or tilt;
- horizontal shift sensitivity.

A residual relationship with slope or aspect is evidence that horizontal misregistration remains.

## Step 5 — Subtract

With ASP:

```bash
geodiff aligned_post_dem.tif pre_dem.tif -o surface_change
```

This computes:

\[
\Delta h = h_{post} - h_{pre}
\]

Interpretation:

- `Delta h > 0`: surface-height gain;
- `Delta h < 0`: surface-height loss;
- `Delta h` close to zero relative to uncertainty: no detected change.

## Step 6 — Combine uncertainty

An initial per-pixel model is:

\[
\sigma_{\Delta h} =
\sqrt{\sigma_{pre}^{2} + \sigma_{post}^{2} + \sigma_{align}^{2}}
\]

The components must be estimated from actual reconstruction and validation results. Ray-intersection error is useful but is not the whole vertical-error budget.

Create a significance mask using a justified threshold such as a multiple of `sigma_Delta_h`, plus minimum stereo-support requirements.

## Step 7 — Publish multiple layers

Do not publish only a colored difference image. Publish:

```text
surface_change.tif
surface_change_uncertainty.tif
significant_change_mask.tif
valid_measurement_mask.tif
stable_terrain_alignment_residuals.tif
```

## If GLO-30 is the only pre-flood reference

Do not subtract a high-resolution post DSM from an upsampled 30 m DEM and call it building-scale change.

Instead:

1. aggregate the post DSM to a comparable coarse scale;
2. align it carefully over stable terrain;
3. calculate broad regional surface change;
4. report large uncertainty;
5. exclude building-level debris claims.
