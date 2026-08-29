# Current status

## Project phase

The project is in **data feasibility and photogrammetry validation**, not final product development.

The immediate go/no-go question is whether we can obtain image pairs with enough overlap, angular separation, image quality, and original camera information to reconstruct defensible elevation.

## Vantor / WorldView-3

The supplied project summary reports that the post-event scenes below were tested:

```text
B040001100881610
B040001100881710
```

Reported findings:

- acquisitions were approximately 61 seconds apart;
- viewing azimuths were approximately 17.5 and 190.5 degrees;
- hundreds of image features were matched;
- a global registration difference was removed;
- coherent terrain-dependent residual displacement remained;
- sparse support covered approximately 16% of the particular test AOI.

Interpretation: the public images appear to retain real parallax, but their public orthorectified COG products do not include the original RPCs or physical camera model needed to convert that signal into trustworthy absolute height.

Status:

| Requirement | Status |
|---|---|
| Opposite-look acquisition | Reported pass |
| Useful overlap for the tested area | Reported pass |
| Sparse feature matching | Reported pass |
| Terrain-dependent residual parallax | Reported pass |
| Public RPC/physical camera model | Fail |
| Trustworthy absolute elevation | Blocked |

The matching artifacts, AOI, parameters, plots, and residual measurements are not yet committed to this repository. Until they are, these findings should be treated as project-summary claims awaiting reproducible artifacts.

## Planet SkySat and Pelican

Leading post-event candidates from 27 August 2026:

```text
SkySat:  20260827_020055_ssc1_u0001
Pelican: 20260827_060959_65_3009
```

The supplied summary reports that they appear to cover the Syabrubesi pilot AOI and may have roughly 30 degrees of viewing-ray separation. That value has not been verified from the actual RPC-bearing products.

Status:

| Requirement | Status |
|---|---|
| Candidate acquisitions exist | Pass |
| Syabrubesi overlap | Needs exact AOI/footprint verification |
| Different viewing directions | Likely; must recompute from RPCs |
| Basic/RPC products exist as Planet product types | Yes in principle |
| Public disaster copies have useful RPCs | No |
| Exact camera-bearing products exist | Unknown |
| Account entitlement | Unknown |
| Authenticated API test | Blocked until `PL_API_KEY` is available |

## Pre-flood baseline

No suitably recent, high-resolution pre-flood DSM has been confirmed.

Available broad references include:

- Copernicus GLO-30, approximately 30 m;
- NASADEM, approximately 30 m;
- a manually observed July 2026 Google Earth frame for visual context only;
- possible historical Cartosat-1 stereo from 2014.

The existing point check found approximately 1822.6 m from GLO-30 and 1819 m from Open-Meteo near the border target. This confirms only broad elevation plausibility, not building-scale accuracy.

## Other candidates

Approximate fallback order:

1. Airbus Pléiades Neo plus Pléiades with Primary/DIMAP camera metadata.
2. International Charter multi-sensor products through an authorized partner.
3. Original commercial Vantor/WorldView products with RPC or exact camera models.
4. Historical Cartosat-1 stereo as a contextual pre-event surface.
5. SAR as a separate change-detection experiment, not the primary optical DSM route.

## What is not yet demonstrated

- A scientifically reliable post-flood DSM.
- A comparable high-resolution pre-flood DSM.
- Accurate SkySat–Pelican cross-sensor triangulation.
- Building-level surface-change accuracy.
- A defensible conversion from surface change to debris or burial depth.
