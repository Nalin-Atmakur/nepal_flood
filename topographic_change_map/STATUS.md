# Project status

Last updated: 2026-08-29 20:00 BST

## Goal

Active: complete the Nepal flood topographic change map end to end. Do not mark complete after signup, catalogue creation, or a visually plausible DSM.

## Current milestone

**M3 — DSM-readiness and public parallax pilot**

Completed:

- M0 durable foundation committed and pushed as `78d0013`.
- M1 TypeScript harness implemented and verified.
- Breeze `Profile 12` cloned into the ignored automation directory without modifying the source.
- Headed Google Chrome smoke test passed on display 1 at CDP bounds `(2590, 542, 1380 x 860)`.
- The browser smoke test confirmed the system mouse position was unchanged.
- Six unit tests pass and TypeScript compilation is clean.
- M1 automation harness committed and pushed as `6fe8ec4`.
- M2 live STAC catalogue generated from 13 Vantor and 24 Planet public scenes.
- Four explicit 1 km AOIs created for Syabrubesi, Timure, Rasuwagadhi, and preliminary Bidur screening.
- 244 same-epoch/AOI pair records generated with exact polygon overlap.
- Named Vantor pair covers 100% of the Syabrubesi pilot with approximately 35.64 degrees separation.
- Named SkySat-Pelican pair covers 35.1% of the explicit Syabrubesi pilot with approximately 30.25 degrees separation.
- None of the 37 public STAC items exposes a rigorous camera-model asset.
- Nine tests pass and TypeScript compilation is clean.

In progress:

- Implement local AOI crop and usability-mask acquisition for public COGs.
- Run reproducible sparse correspondence/parallax experiments on the named public pairs.
- Add matching-support and residual-displacement reports without claiming absolute height.

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

1. Commit and push milestone M2.
2. Fetch small Syabrubesi crops from the public COGs.
3. Implement sparse feature matching and spatial-support metrics.
4. Evaluate Vantor and SkySat-Pelican public parallax reproducibly.

## Active blockers

- The populated local env file is not yet available; public-source work can continue without it.
- Gmail may require a one-time reauthentication in the cloned profile.
- CAPTCHA remains an explicit user handoff.
- Institutional or paid camera-bearing imagery may remain inaccessible; free alternatives must be exhausted first.
- All current public Vantor/Planet products lack rigorous camera models; absolute-height reconstruction remains blocked until a camera-bearing product is obtained.

## Worktree safety

Unrelated modified and untracked files exist under `aryaa_research_general/`. They belong to the user and must never be staged or changed by this project.
