# Final candidate-imagery ranking

Updated 2026-08-30 after account/entitlement checks, exact-footprint analysis,
public correspondence pilots, three dense public-Vantor reconstructions, and
the final accuracy gate.

## Interpretation boundary

The current coloured viewer layer is **not a direct pre-event DSM subtracted
from a post-event DSM**. It is a post-event opposite-look ortho-parallax height
residual, calibrated to stable terrain and displayed over coarse GLO-30 context.
Because the public orthos do not disclose their camera models or the DEM used
for orthorectification, the defensible label is:

> relative post-event ortho-parallax height residual — `RESEARCH_ONLY`

A true topographic-change map still requires both a documented pre-event
surface and a rigorously triangulated post-event surface in compatible datums.

## Ranked candidates

| Rank | Source / candidate imagery | Verified inventory and geometry | Current evidence / assessment | Exact blocker or next action |
|---:|---|---|---|---|
| **1** | **Original Vantor WorldView-3 products:** `B040001100881410 + B040001100881710` | Same sensor, 27 Aug, **81.799 s apart**; off-nadir `21.72° / 26.56°`, azimuth `14.29° / 190.45°`; approximate ray separation **48.251°**. This corrects the earlier, weaker `881610 + 881710` claim. | **Best evidenced rigorous-post-DSM candidate.** The public orthos match densely; the strict public fallback obtained 1,252 supported 32 m cells, stable NMAD **4.324 m**, and 1.282 km² support. Same-sensor, near-simultaneous imagery makes correspondence substantially safer than cross-sensor alternatives. | Obtain the original Basic/System-Ready imagery and its exact RPC/physical camera package from Vantor or an authorised Charter delivery. Public COGs contain neither. |
| **2** | **Airbus Pléiades Neo 3 + Pléiades-1B**, 28 Aug, through [Charter 1052](https://download.disasterscharter.org/activations/flood-in-nepal-activation-1052-) | Reported PNEO3 near 04:53 UTC at 0.3 m and PHR1B near 05:00–05:02 at 0.5 m; the Charter publishes a Timure–Syabrubesi impact product. [NASA ASP supports Pléiades/Neo DIM and RPC camera files](https://stereopipeline.readthedocs.io/en/stable/examples/pleiades.html). | **Potentially the highest-quality untested solution.** Near-simultaneous resolution and similar optical characteristics are excellent, but useful convergence for these exact acquisitions has not been established. | Obtain Primary/DIMAP source packages, then compute exact overlap and ray convergence from the `DIM*.XML` / `RPC*.XML`. Public impact-map imagery is processed evidence, not a camera-bearing delivery. |
| **3** | **[Planet SkySat + Pelican](https://data.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/):** `20260827_020055_ssc1_u0001 + 20260827_060959_65_3009` | Approximate published-look separation **30.25°**, but captures are about **4 h 09 m apart**. Exact public footprints jointly cover only **35.1%** of `syabrubesi-pilot-v1`, not 100%. [SkySat Basic](https://learn.planet.com/rs/997-CHH-265/images/combined-imagery-product-spec-final-august-2019.pdf) and [Pelican Basic](https://docs.planet.com/data/imagery/pelican/) products carry RPCs. | **Best clearly specified commercial cross-sensor route, but weaker than first reported.** Public-ortho pilot: 65 reciprocal matches, only 4 RANSAC inliers and 4% spatial support. Basic products could behave better, but the public copies do not validate the pair. | The verified Planet free account has **no active imagery products**. Need Pelican Basic+RPC plus the underlying SkySatScene/All-Frames Basic assets and RPC/pinhole model. High cloud and temporal/cross-sensor differences remain material risks. |
| **4** | **Pléiades-1A + GeoEye-1 + PNEO3**, 29 Aug, through [Charter 1052](https://download.disasterscharter.org/activations/flood-in-nepal-activation-1052-) | Reported acquisitions near 04:53, 05:04 and 05:11–05:12 UTC. Appropriate Primary/Basic products can contain physical/RPC models. | **Promising possible three-view stack**, but presently a catalogue hypothesis. Three independent satellites could strengthen geometry or instead fail on overlap, clouds or cross-sensor matching. | Obtain raw camera-bearing packages and calculate exact footprints, local cloud-free overlap, convergence and epipolar consistency. Charter public products do not expose these values. |
| **5** | **Pelican + original WV3**, 27 Aug | Pelican near 06:09 and WV3 near 05:05 overlap portions of the corridor; several published directions are meaningfully different. | **Conditional mixed-sensor fallback.** Useful only if one Planet Basic RPC product and one original Vantor camera-bearing product become available. | Both gated products are missing. Cross-sensor radiometry, clouds and the ~1 h acquisition gap require a sparse triangulation pilot before any dense run. |
| **6** | **Public Vantor WV3:** `B040001100881410 + B040001100881710` | RGB orthorectified COGs are open and checksum-pinned. Only constant scene look metadata is exposed; no RPC/RPB/IMD/attitude/ephemeris asset was found. | **Delivered research fallback, not a rigorous DSM or true change map.** It supports correspondence and relative ortho-parallax residual mapping. Strict layer: stable NMAD 4.324 m; experimental 10 m layer: stable NMAD 4.034 m. | Unknown camera model and unknown orthorectification reference DEM prevent defensible absolute elevation and pre/post attribution. Keep `RESEARCH_ONLY`. |
| **7** | **Additional 27 Aug public WV3:** `B040001100881410 + B040001100882F10` | 43.899 s apart; approximate separation **33.934°**; 7,708 supported 32 m cells / 7.893 km² raw support. | **Empirically rejected.** Raster invariants passed, but stable NMAD was **6.613 m** and median uncertainty 9.784 m. | Failed the fixed 6.0 m stable-terrain ceiling; excluded from mosaics and viewer. Original camera-bearing products could still justify a separate rigorous test. |
| **8** | **28 Aug WV2 + Legion:** `B030001100CF1310 + B110001101165110` | 910.422 s apart; approximate separation **33.741°**; 2,997 supported cells / 3.069 km² raw support. | **Empirically rejected.** Raster invariants passed, but stable NMAD was **6.289 m** and median uncertainty 9.906 m. | Failed the same fixed 6.0 m gate. Public files lack cameras; originals remain an access-only possibility, not a promoted result. |
| **9** | **[Satellogic NewSat L1C](https://developers.satellogic.com/data/processing-levels/ortho-ready.html)** | Charter inventory reports one NewSat acquisition on 27 Aug around 04:22 UTC. Official L1C is 0.7–1.0 m, non-orthorectified/ortho-ready, and includes embedded plus text RPCs. | **Useful auxiliary view in principle**, not an identified stereo pair. The Charter record is L1B multispectral rather than the required L1C package. | Obtain the exact L1C anchor frames/RPCs and find a compatible camera-bearing partner with sufficient overlap and convergence. |
| **10** | **BlackSky**, through Charter/Copernicus products | Multiple 27 Aug times are reported, and Copernicus EMS used BlackSky with Satellogic for downstream grading. No exact RPC-bearing product inventory is public. | **Archive-search lead only.** Multiple times may yield useful angular diversity, but neither product geometry nor source-image licence/access has been established. | Authenticated archive/product-spec check; determine exact footprint, clouds, product level, camera metadata and redistribution terms. BlackSky access is order/contract gated. |
| **11** | **ISRO Cartosat-3/2S**, via [Bhoonidhi](https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html) / Charter | Post-event PAN and multispectral records exist. The currently associated PAN/MX records appear to be products from the same look, not fore/aft views. | **Low for the listed post-event records.** Spectral companions are not a stereo pair. | Need a separately tasked/acquired stereo product with geometric support. Sub-5 m Bhoonidhi data is priced for non-government users and registration remains gated by address/EULA/CAPTCHA. |
| **12** | **[Cartosat-1 Fore/Aft](https://sentinel-asia.org/EO/2026/article20260826NP.html)**, 18 May 2014 | Sentinel Asia confirms `PAN_FORE` at 05:02:45 and `PAN_AFT` at 05:03:37, same path/row. Genuine stereo-designed ~2.5 m imagery. | **Real pre-event stereo reference candidate**, but historical rather than event-adjacent. Better than GLO-30 spatially if the RPC-bearing source package is accessible and validates. | Twelve-year temporal gap; landform/infrastructure changes must be treated as baseline uncertainty. Download entitlement/product contents still need verification. |
| **13** | **PlanetScope** | Multiple public pre/post orthos at ~3–4 m; primarily same-direction strip segments. | **Temporal/flood context only.** No opposing high-resolution pair was identified and public SkySat–Pelican matching was already weak. | Resolution and convergence are inadequate for detailed residual/DSM reconstruction. |
| **14** | **Sentinel-2 / Copernicus** | Project catalogue contains **61** exact-UNOSAT-overlap L2A products (57 pre-cutoff, 4 post); only two have scene cloud below 20%, and all four post products are highly cloudy. | **Flood/cloud/temporal context only.** 10 m GSD and near-nadir geometry cannot support the intended DSM. | Fundamental resolution and convergence limit, not an account or processing problem. |
| **15** | **SAR: EOS-04, Sentinel-1, NISAR, ALOS-2; commercial TerraSAR-X/RCM** | [Sentinel Asia](https://sentinel-asia.org/EO/2026/article20260826NP.html) confirms pre-event ALOS-2 and post-event EOS-04 products; Sentinel-1 damage-proxy products also exist. | **Separate change-detection/interferometry experiment**, not optical stereo. Potentially valuable through cloud, but not a direct substitute for the optical surface workflow. | Himalayan layover/shadow, flood decorrelation, coherent SLC-pair availability, orbit geometry and effective resolution. |
| **16** | **Google Earth historical imagery / Esri Wayback** | Useful dated visual history and basemap context. No exposed camera model. | **Visual verification only.** It may help interpret whether a feature predated the flood, but cannot provide rigorous triangulation or a distributable photogrammetric baseline. | No RPC/physical camera; extraction and redistribution licences may be restrictive. |
| **Rejected** | **2021 Vantor + May 2026 PlanetScope** | Nominal off-nadir difference does not overcome the 4.5-year epoch separation, resolution mismatch and absent common cameras. | **Scientifically indefensible as stereo.** | Changed terrain/vegetation, incompatible resolution, orthorectified products and missing Vantor RPCs. |

## Final decision

1. **For a rigorous post-event DSM:** request original WV3
   `881410 + 881710` first; request the 28 Aug Airbus Primary/DIMAP pair in
   parallel; pursue Planet Basic only if entitlement is granted.
2. **For a true change map:** also obtain a documented pre-event DSM. Near-term
   options are the pinned HMA 8 m mosaic (Earthdata activation required), the
   2014 Cartosat-1 stereo pair with a large temporal-error warning, or a newly
   discovered recent pre-event commercial stereo acquisition.
3. **Current viewer output:** publish only as a relative ortho-parallax residual.
   Do not call positive cells deposition/debris solely from this layer, and do
   not treat `GLO-30 + residual` as an independently triangulated post-event DSM.

## Evidence files in this repository

- [`catalogue/COVERAGE.md`](../catalogue/COVERAGE.md) — exact affected-footprint ranking.
- [`catalogue/REPORT.md`](../catalogue/REPORT.md) — public scene/pair inventory.
- [`products/VALIDATION.md`](../products/VALIDATION.md) — promoted and rejected dense-run metrics.
- [`products/release-manifest.json`](../products/release-manifest.json) — final release decision.
- [`ACCOUNTS_REDACTED.md`](../ACCOUNTS_REDACTED.md) — verified entitlement/access states.
