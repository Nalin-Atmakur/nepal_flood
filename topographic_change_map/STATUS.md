# Project status

Last updated: 2026-08-29 21:03 BST

## Goal

Active: complete the Nepal flood topographic change map end to end. Do not mark complete after signup, catalogue creation, or a visually plausible DSM.

## Current milestone

**M4 — Account-backed camera products and ASP readiness**

Completed:

- M0 durable foundation committed and pushed as `78d0013`.
- M1 TypeScript harness implemented and verified.
- Breeze `Profile 12` cloned into the ignored automation directory without modifying the source.
- Headed Google Chrome smoke test passed on display 1 at CDP bounds `(2590, 542, 1380 x 860)`.
- The browser smoke test confirmed the system mouse position was unchanged.
- Browser policy updated: headless by default; headed display-1 mode only for user handoff or debugging.
- Six unit tests pass and TypeScript compilation is clean.
- M1 automation harness committed and pushed as `6fe8ec4`.
- M2 live STAC catalogue generated from 13 Vantor and 24 Planet public scenes.
- Four explicit 1 km AOIs created for Syabrubesi, Timure, Rasuwagadhi, and preliminary Bidur screening.
- 244 same-epoch/AOI pair records generated with exact polygon overlap.
- Named Vantor pair covers 100% of the Syabrubesi pilot with approximately 35.64 degrees separation.
- Named SkySat-Pelican pair covers 35.1% of the explicit Syabrubesi pilot with approximately 30.25 degrees separation.
- None of the 37 public STAC items exposes a rigorous camera-model asset.
- Nine tests pass and TypeScript compilation is clean.
- M2 public catalogue committed and pushed as `0f314c5`.
- Public COG crops acquired reproducibly without downloading full source images.
- Vantor public pilot: 200 reciprocal matches, 100 RANSAC inliers, 50% inlier rate, 23% spatial support, 3.44 m median uncalibrated residual.
- Vantor residual/elevation correlation against GLO-30 is weak (0.229; R² approximately 0.052), so terrain dependence is not strongly validated by this pilot.
- SkySat-Pelican public pilot: 65 reciprocal matches, 4 RANSAC inliers, 4% support; failed sparse correspondence.
- Both public pilots correctly report `absoluteHeightRecoverable=false`.
- Local env safety preflight passes; secret file is ignored, untracked, and mode `0600`.
- Sandbox storage preflight passes with approximately 86.6 GiB free.
- Browser mode changed to headless by default, with headed mode reserved for user handoff or debugging.
- Gmail authenticated successfully in ordinary Chrome on the isolated sandbox.
- Planet free account created and email-verified; no payment or marketing opt-in.
- Planet trial exposes Sandbox Data and open APIs but reports no active imagery products; SkySat/Pelican Basic+RPC is not entitled.
- NASA ASP 3.7.0 installed user-scoped on the sandbox and its official ASTER RPC fixture completed end to end.
- ASTER validation produced point cloud, DEM, orthoimage, and intersection-error rasters with 72.9% valid DEM pixels.
- ASTER comparison to the historical bundled reference shows a systematic vertical/version offset of approximately 29 m and residual spread near 4.9 m, confirming datum/version alignment must be explicit.
- Strong Vantor pair corrected to `B040001100881410` + `B040001100881710` (approximately 48-degree geometry).
- Independent dense phase-correlation engine implemented; four Python tests pass locally and on sandbox Python 3.9.
- Full correct-pair Vantor COGs downloaded and checksum-verified; common upper corridor warped to identical 1 m UTM grids.
- Dense upper-corridor surface-change/uncertainty/support reconstruction is running on 12 sandbox cores.

In progress:

- Complete and validate the dense upper-corridor change products.
- Compare independent outputs against the pinned upstream reconstruction.
- Export web-ready terrain/change data and implement the interactive viewer.
- Expand authoritative coverage/gap reporting downstream.

## Verified environment

| Item | Status |
|---|---|
| Repository branch | `main` |
| Git remote | `origin` configured |
| Breeze Chrome profile | `Profile 12` found |
| Secondary built-in display | index 1, CoreGraphics origin `(2560, 508)`, logical `1440 x 932` |
| Chrome | installed |
| Peekaboo permissions | Screen Recording and Accessibility granted |
| Sandbox SSH | `zoral@100.99.74.22` reachable with key authentication |
| Sandbox free space | 87 GiB at milestone start |
| SMS helper | not installed yet; not needed for public-source milestone |
| NASA ASP | not yet verified/installed |

## Existing research

The `research/` directory contains the goal, source inventory, acquisition plan, stereo feasibility gates, ASP workflow, change-map method, validation rules, automation architecture, roadmap, and open questions.

## Immediate next actions

1. Finish dense ortho-change reconstruction and validation.
2. Publish supported surface-change, uncertainty, coverage, pre-GLO30, and post-surface products.
3. Build the interactive 3D viewer and affected-area gap map.
4. Commit and push milestone M4.

## Active blockers

- CAPTCHA remains an explicit user handoff.
- Institutional or paid camera-bearing imagery may remain inaccessible; free alternatives must be exhausted first.
- All current public Vantor/Planet products lack rigorous camera models; absolute-height reconstruction remains blocked until a camera-bearing product is obtained.
- Planet exact products are entitlement-blocked; public-ortho surface change is necessarily research-only.

## Worktree safety

Unrelated modified and untracked files exist under `aryaa_research_general/`. They belong to the user and must never be staged or changed by this project.
