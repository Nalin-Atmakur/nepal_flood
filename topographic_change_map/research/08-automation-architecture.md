# Automation architecture

## Goal

Create a repeatable system that discovers candidate imagery, evaluates pair feasibility, reconstructs pilot DSMs, validates them, and generates change products with minimal manual repetition.

Ordinary free individual signups, verification mail, entitlement checks,
catalogue discovery, evaluation, reconstruction, validation, and publication
are automated. Humans remain responsible for CAPTCHA/MFA, payment, institutional
claims, non-standard licences, operational accuracy requirements, and any debris
or burial interpretation.

## Implemented components

```text
AOI registry
    |
Provider/browser harness ---- ignored mode-0600 secret file
    |
Candidate catalogue
    |
Metadata and geometry scorer
    |
Pilot asset manager
    |
Sparse matcher and triangulation tester
    |
ASP runner + verified official RPC fixture
    |
DSM validator and aligner
    |
Change/uncertainty/significance generator
    |
Quality gate + lower-uncertainty mosaic
    |
Three.js/OpenStreetMap viewer + static publication bundle
```

## Principal commands

```text
npm run catalogue:public
npm run coverage:build
npm run parallax:public
python/ortho_change.py ...
python/validate_products.py ...
python/quality_gate.py ...
python/mosaic_products.py ...
python/export_viewer.py ...
npm run viewer:build
npm run viewer:test
```

## Storage classes

### Version-controlled

- AOI definitions that contain no sensitive information;
- schemas and configurations;
- provider adapter code;
- run manifests without secrets;
- aggregate quality reports;
- documentation and decision records.

### Sandbox/object storage, not Git

- original imagery;
- large RPC/product bundles if licensing restricts redistribution;
- point clouds;
- DSMs and rasters;
- temporary crops and caches;
- licence-restricted provider metadata.

The repository already ignores common large raster and data formats. Do not override those protections casually.

## Reproducible execution

Use a pinned container or environment containing:

- NASA Ames Stereo Pipeline;
- GDAL/PROJ;
- image-matching dependencies;
- provider API clients;
- report-generation tools.

Every run receives an immutable identifier and manifest. A resumed run should reuse verified artifacts rather than repeat large downloads.

## Automation boundaries

The system automatically rejects poor candidates and may publish a clearly
labelled research layer after all mandatory gates pass. It may never promote a
public-ortho product to rigorous absolute DSM, debris depth, burial depth, or
operational status without the corresponding evidence and human acceptance.

Human approval is required at these gates:

1. licence/access acceptance;
2. target-accuracy definition;
3. promotion beyond `RESEARCH_ONLY`;
4. debris/burial interpretation acceptance;
5. operational use.

## Reporting

Each candidate-pair report should contain:

- scene and product IDs;
- AOI overlap;
- camera-model status;
- access status;
- convergence geometry;
- cloud/support coverage;
- matching statistics;
- triangulation statistics;
- predicted and observed vertical uncertainty;
- machine verdict;
- reviewer decision and rationale.
