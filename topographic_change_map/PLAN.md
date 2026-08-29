# Nepal flood topographic change map — execution plan

## Objective

Generate the best scientifically defensible post-flood digital surface model (DSM) and topographic-change map obtainable from free data across the affected Bhote Koshi/Trishuli corridor in Rasuwa and Nuwakot.

Success is measured by affected-area coverage with:

- validated post-flood surface elevation;
- validated pre-flood surface elevation where obtainable;
- defensible `post - pre` surface change;
- uncertainty, stereo support, provenance, and explicit gaps;
- a reproducible pipeline and interactive viewer.

Account creation, provider access, and catalogue breadth support this goal. They are not substitutes for a validated surface product.

## Completion criteria

The project is complete only when all of the following exist or have been exhausted and documented:

1. A versioned affected-area AOI and processing tile index.
2. Truthful self-service provider access automation and a redacted account register.
3. A normalized catalogue of free pre/post imagery, products, camera models, licences, and access status.
4. Automated overlap, camera, ray-geometry, correspondence, and sparse-triangulation evaluation.
5. NASA Ames Stereo Pipeline pilot reconstruction for every promoted pair.
6. Validated post-flood DSM tiles over the maximum supportable affected area.
7. Validated pre-flood DSM tiles wherever suitable data can be obtained.
8. Aligned surface-change, uncertainty, support, and gap products wherever both epochs pass.
9. An interactive viewer that distinguishes valid change, zero change, uncertainty, and nodata.
10. Reproducible setup, run, validation, recovery, and publication documentation.
11. Coherent milestones committed and pushed directly to `origin/main` without unrelated worktree changes.

## Architecture

### Main Mac

- Headed Chrome account/provider automation.
- Gmail and SMS verification.
- Metadata, RPC, footprint, licence, and preview collection.
- Geometry scoring and small image crops.
- Project dashboard and a maximum 20 GiB local working cache.

### Headed Chrome invariant

All provider and Gmail browser automation runs visibly on the main Mac's secondary built-in display:

```text
Display index: 1
Logical resolution: 1440 x 932
Desktop origin: x=2560, y=0
Chrome bounds: x=2590, y=30, width=1380, height=860
```

- Clone the existing Breeze Chrome `Profile 12` into a persistent custom automation directory.
- Never modify the original Breeze profile.
- Use installed Google Chrome, `headless: false`, controlled with Playwright/CDP.
- Never use the system mouse or global keyboard input.
- Keep Gmail, the active provider, and the local dashboard visible in tabs.
- Do not fall back to headless execution.
- CAPTCHA challenges pause visibly for user completion.

### Sandbox Mac

Use only:

```text
SSH: zoral@100.99.74.22
Root: /Users/zoral/topographic-change-map
```

It stores full imagery, point clouds, DSMs, and ASP intermediates and performs bulk processing. Never touch the remote primary account.

Storage guards:

- require at least 80 GiB free before new bulk downloads;
- warn below 30 GiB;
- stop below 15 GiB;
- fetch bulk assets directly on the sandbox when possible.

## Execution phases

### Phase 0 — Durable foundation

- Persist this plan, status, decisions, runbook, and redacted account register.
- Harden Git exclusions for secrets, browser data, caches, and imagery.
- Establish milestone commit/push discipline.

### Phase 1 — Account and provider harness

- Build the headed Chrome clone/launcher and secondary-display assertions.
- Load secrets from a mode-`0600`, ignored `.env.topographic.local`.
- Implement Gmail verification, scoped SMS OTP reading, CAPTCHA handoff, account state, and audit logging.
- Implement provider adapters in this order: Planet, Satellogic, Copernicus Data Space, NASA Earthdata/ASF, Esri, Bhoonidhi, Source Cooperative, Vantor Open Data, public Charter inventory, Google Earth/Wayback metadata.
- Never purchase data, start an auto-renewing trial, or claim institutional authority.

### Phase 2 — Affected-area catalogue

- Build the master affected AOI from Copernicus EMSR927, UNOSAT, HOT/NAXA, and corridor reference layers.
- Divide it into overlapping approximately 1 km tiles.
- Prioritize Syabrubesi, Timure-Rasuwagadhi, remaining Rasuwa, Nuwakot/Bidur, then remaining authoritative affected polygons.
- Catalogue maximum metadata, RPCs, previews, footprints, product levels, access states, and licences.
- Generate same-epoch pre/pre and post/post pair candidates per tile.

### Phase 3 — DSM-readiness engine

- Reject or demote missing-camera, orthorectified-only, non-overlapping, weak-geometry, and locally cloud-blocked candidates.
- Calculate viewing-ray convergence and height sensitivity from camera models.
- Fetch common AOI crops.
- Mask cloud, water, shadow, and saturation.
- Run classical sparse matching, reciprocal/ratio filtering, RANSAC, RPC filtering, and sparse triangulation.
- Promote only spatially distributed, physically consistent matches.

### Phase 4 — Dense reconstruction

- Download full free products for promoted pairs directly to the sandbox.
- Run `bundle_adjust`, `mapproject`, `parallel_stereo`, and `point2dem`.
- Generate DSM, orthoimage, ray-intersection error, and support rasters.
- Validate stable terrain and retain unsupported areas as nodata.
- Prove the complete pipeline on Syabrubesi before corridor expansion.

### Phase 5 — Change map and viewer

- Normalize horizontal and vertical datums.
- Align pre/post surfaces using unchanged stable terrain.
- Validate against withheld stable areas.
- Calculate `post - pre` and propagate reconstruction/alignment uncertainty.
- Mosaic only validated tiles.
- Publish post-only DSM tiles where a defensible pre-event surface is unavailable.
- Build the CesiumJS viewer with topography, change, uncertainty, support, buildings, provenance, and gaps.

## Accuracy classes

| Class | Empirical stable-terrain performance | Use |
|---|---:|---|
| Building-scale candidate | approximately <=1 m | Candidate for building aggregation after further interpretation validation |
| Broad-change candidate | approximately <=3 m | Broad deposition/erosion mapping |
| Research-only | larger or incompletely validated | Exploration only |
| Failed | unstable or unsupported | No elevation claim |

Resolution alone never assigns an accuracy class.

## GitHub checkpoints

Commit and push directly to `origin/main` after every coherent milestone. Stage only `topographic_change_map/` and explicitly related ignore rules. Never stage unrelated dirty research files.

Before each push:

1. Update `STATUS.md`.
2. Fetch `origin` and inspect divergence.
3. Stage exact paths.
4. Inspect the staged diff and secret scan.
5. Commit with a milestone-specific message.
6. Push to `origin/main`.
7. Record the commit in the next status update.

If remote integration cannot be done safely in the dirty worktree, use a clean temporary worktree from `origin/main` and copy only project paths into it. Never stash, reset, or sweep in user-owned changes.

## Non-negotiable scientific rules

- A visually convincing surface is not evidence of accurate elevation.
- Public orthorectified imagery without original camera geometry cannot yield rigorous absolute height.
- GLO-30 may seed map projection or broad comparison; it is not a building-scale baseline.
- Pre/post images are not treated as a stereo pair.
- Unsupported regions remain nodata.
- Positive surface change is not automatically debris depth or building burial.
- Every published change value carries uncertainty, support, and provenance.
