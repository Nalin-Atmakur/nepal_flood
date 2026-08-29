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
