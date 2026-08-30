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
| [Nepal_Flood_Topographic_Data_Source_Catalogue.xlsx](Nepal_Flood_Topographic_Data_Source_Catalogue.xlsx) | Team-shareable, filterable catalogue of 64 optical, SAR, DEM, historical, commercial, and institution-gated routes; includes authentication requirements, current state, next steps, evidence, and official references |
| [imagery-source-catalogue.csv](imagery-source-catalogue.csv) | Machine-readable version of the 64-row source catalogue |
| [source-catalogue-validation.json](source-catalogue-validation.json) | Automated workbook structure, completeness, hyperlink, and credential-safety checks |
| [sources.md](sources.md) | Primary technical references and related repository research |

## Rebuild the team workbook

The source records and authentication profiles are maintained in
`python/source_catalogue_data.py`. Rebuild the Excel, CSV, and validation report
without editing the binary workbook by hand:

```bash
python -m venv .work/venv
.work/venv/bin/pip install -r requirements-spreadsheet.txt
.work/venv/bin/python python/build_source_spreadsheet.py
.work/venv/bin/pytest -q test_python/test_source_catalogue.py
```

The generated workbook contains access requirements and generic authentication
mechanisms only. It must never contain usernames, passwords, phone numbers,
MFA codes, cookies, API keys, tokens, or client secrets.

## Hard rules

- No personal data belongs in this project.
- API keys and credentials must never be committed or printed in logs.
- Unsupported areas remain nodata; large gaps are not silently interpolated.
- A visually convincing 3D model is not evidence of accurate elevation.
- Every published change value must have an associated uncertainty and support status.
- Results must not be presented as operational rescue evidence until independently validated for that use.
