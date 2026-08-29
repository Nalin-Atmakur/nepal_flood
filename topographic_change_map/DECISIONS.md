# Decision log

## 2026-08-29 — D1: Coverage-first scientific objective

The objective is validated post-flood topography and surface change over the maximum supportable affected area, not maximum downloaded bytes or account count.

## 2026-08-29 — D2: Metadata-max, imagery-gated collection

Catalogue every discoverable free candidate and camera/product record. Download full imagery only when needed for a pilot or after metadata/geometry gates pass.

## 2026-08-29 — D3: Free data only

Never make purchases, submit priced orders, or start auto-renewing trials. Record prices and access blockers without committing financially.

## 2026-08-29 — D4: Breeze Chrome clone with headless default

Clone the existing Breeze `Profile 12` into a custom persistent automation directory. Run installed Google Chrome headlessly by default using Playwright/CDP so it does not steal focus. Escalate the same persistent clone to a headed window on the secondary built-in display only for CAPTCHA/MFA, visual review, or debugging. Preserve the original profile and never use system mouse/keyboard automation.

## 2026-08-29 — D5: Gmail and scoped SMS verification

Use Gmail Web in the headed browser. Read only verification messages associated with the active provider and time window. Use a local read-only SMS helper for matching recent OTPs. CAPTCHA is a visible user handoff.

## 2026-08-29 — D6: Truthful identity only

“Cambridge Helpers” may be used only as an informal independent volunteer research project. Never claim registered-organization, government, humanitarian, or authorized-responder status.

## 2026-08-29 — D7: Sandbox scope

Use only `/Users/zoral/topographic-change-map` on the remote Mac. The remote primary account is outside scope. Enforce free-space thresholds.

## 2026-08-29 — D8: Direct-to-main milestone pushes

Push coherent path-scoped milestones to `origin/main`. Inspect every staged diff and exclude unrelated dirty worktree content.

## 2026-08-29 — D9: Surface change before debris interpretation

The first scientific product is surface-elevation change. Debris depth or building burial requires separate validation and must not be inferred automatically.

## 2026-08-29 — D10: Explicit AOI polygons replace point flags

Coverage decisions use versioned polygons. Against `syabrubesi-pilot-v1`, the public Vantor pair covers 100%, while the named SkySat-Pelican combination covers approximately 35.1%. Earlier “covers site” flags referred to the Rasuwagadhi point and cannot support Syabrubesi pair claims.

## 2026-08-29 — D11: Public STAC products remain parallax-only

The live catalogue contains 37 public Vantor/Planet scenes and zero rigorous camera-model assets. Approximate ray geometry may prioritize correspondence experiments, but these public orthorectified products are not promoted to absolute-height DSM reconstruction.

## 2026-08-29 — D12: Public-pilot evidence is limited

The reproducible Vantor pilot finds 200 reciprocal SIFT matches, 100 RANSAC inliers, 23% spatial support, and a 3.44 m median residual after global alignment. Its GLO-30 residual/elevation correlation is weak (0.229), so the pilot supports correspondence and uncalibrated residual displacement but does not independently establish a strong height relationship. The public SkySat-Pelican pair fails sparse correspondence with only four RANSAC inliers.

## 2026-08-29 — D13: Headless browser default

Routine provider and Gmail automation runs headlessly to avoid focus interruption. The persistent Breeze clone is reopened headed on secondary display 1 only for CAPTCHA/MFA handoff, explicit visual inspection, or debugging. Headless screenshots and DOM/network diagnostics remain available.

## 2026-08-29 — D14: Sandbox owns the browser identity boundary

Gmail, provider cookies, SMS verification, browser downloads, and GUI handoffs run on the isolated `zoral` sandbox Mac. The user can observe headed flows over VNC without interrupting the main Mac. Main-Mac automation remains headless.

## 2026-08-29 — D15: Planet is entitlement-blocked

A truthful free Planet account was created and email-verified. It exposes Planet Sandbox Data plus Catalog, Statistical, and Process APIs, but its product page reports no active products. The exact SkySat/Pelican Basic+RPC products therefore remain inaccessible under this account.

## 2026-08-29 — D16: Independently reproduce the public-ortho method

An upstream open reconstruction at commit `43c22e0f9a3777d071c2f181302ca2daad384a53` identifies the stronger Vantor pair `B040001100881410` plus `B040001100881710` and a constant-look-angle ortho-parallax conversion. Its dense tie-point engine is omitted, so this project implements and tests an independent engine and reruns the source COGs before adopting results.

## 2026-08-29 — D17: 24-hour delivery deadline

The project has a hard 24-hour delivery window. Account setup and access decisions are time-boxed; provider entitlement blockers trigger immediate fallback rather than waiting. Scientific caveats remain non-negotiable.

## 2026-08-29 — D18: Completion quality bar

Finish permanent paths, tests, documentation, recovery behavior, and end-to-end verification when they are within reach. Do not present scaffolding, a workaround, or an unvalidated pilot as the finished map.

## 2026-08-29 — D19: Separate acquisition, measurement, and reporting scales

Source imagery is 0.3–0.5 m, co-registration uses a 1 m working grid, phase-correlation windows span 64–96 m, validated change is currently published on 32 m cells, and 1 km tiles are post-analysis reporting bins only. The initial Syabrubesi 1 km AOI was a manually declared feasibility pilot; production coverage is derived from authoritative affected polygons, common acquisition footprints, and stable-terrain calibration buffers.

## 2026-08-29 — D20: Commit small aggregate raster deliverables

The repository normally ignores GeoTIFFs to prevent raw imagery, personal data, and bulky products entering Git. The final derived change, uncertainty, support, coverage, and cropped baseline rasters are aggregate, non-personal, licence-compatible, and collectively small. They may be force-added at named product paths after secret/licence review; source satellite imagery remains excluded.
