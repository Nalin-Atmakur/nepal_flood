# Topographic change map research

This directory is the working specification for reconstructing and validating
surface-elevation change after the August 2026 Nepal flood.

The intended product is an evidence-backed map of where the surface became higher or lower. It may later be combined with existing building-damage data to identify buildings that could be surrounded or buried by deposited material.

A true product may be described as a **surface-elevation change map** only after
a documented pre-event DSM is subtracted from a compatible, rigorously
triangulated post-event DSM. The current public-ortho fallback does not meet
that condition and must instead be described as a **relative post-event
ortho-parallax height residual**. Neither product is automatically debris depth
or burial depth.

## Project flow

```text
Define AOI and accuracy requirement
              |
Discover suitable pre/post imagery
              |
Confirm overlap, access, licence, and camera models
              |
Score stereo geometry and image matchability
              |
Generate and validate pre/post DSMs
              |
Align both DSMs using stable terrain
              |
Subtract post minus pre
              |
Publish change, uncertainty, and support layers
              |
Add buildings and an interactive viewer
```

## Documents

| Document | Purpose |
|---|---|
| [00-goal-and-scope.md](00-goal-and-scope.md) | Goal, terminology, intended users, and non-goals |
| [01-current-status.md](01-current-status.md) | What has and has not been demonstrated |
| [02-data-acquisition.md](02-data-acquisition.md) | Provider access and automated collection plan |
| [03-stereo-feasibility.md](03-stereo-feasibility.md) | Automated go/no-go evaluation for image pairs |
| [04-dsm-generation.md](04-dsm-generation.md) | NASA Ames Stereo Pipeline workflow |
| [05-change-map.md](05-change-map.md) | Co-registration, differencing, and final rasters |
| [06-validation-and-confidence.md](06-validation-and-confidence.md) | Accuracy, uncertainty, masking, and acceptance tests |
| [07-buildings-and-viewer.md](07-buildings-and-viewer.md) | Building aggregation and eventual Cesium viewer |
| [08-automation-architecture.md](08-automation-architecture.md) | Proposed automated system and data lifecycle |
| [09-roadmap.md](09-roadmap.md) | Ordered execution plan and decision gates |
| [10-open-questions.md](10-open-questions.md) | Questions that must be resolved explicitly |
| [11-candidate-imagery-ranking.md](11-candidate-imagery-ranking.md) | Final evidence-backed candidate ranking after access checks and dense experiments |
| [sources.md](sources.md) | Primary technical references and related repository research |

## Hard rules

- No personal data belongs in this project.
- API keys and credentials must never be committed or printed in logs.
- Unsupported areas remain nodata; large gaps are not silently interpolated.
- A visually convincing 3D model is not evidence of accurate elevation.
- Every published change value must have an associated uncertainty and support status.
- Results must not be presented as operational rescue evidence until independently validated for that use.
