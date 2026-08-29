# Automation architecture

## Goal

Create a repeatable system that discovers candidate imagery, evaluates pair feasibility, reconstructs pilot DSMs, validates them, and generates change products with minimal manual repetition.

Humans remain responsible for account creation, licences, access requests, accuracy requirements, and scientific acceptance.

## Proposed components

```text
AOI registry
    |
Provider adapters ---- Secret manager
    |
Candidate catalogue
    |
Metadata and geometry scorer
    |
Pilot asset manager
    |
Sparse matcher and triangulation tester
    |
ASP runner
    |
DSM validator and aligner
    |
Change-map generator
    |
JSON/HTML report and web-export builder
```

## Proposed commands

```text
flood3d aoi validate syabrubesi.geojson
flood3d discover --aoi syabrubesi-pilot-v1
flood3d access-check --provider planet
flood3d score-pairs
flood3d fetch-pilot --pair PAIR_ID
flood3d test-matching --pair PAIR_ID
flood3d pilot-stereo --pair PAIR_ID
flood3d validate-dsm --run RUN_ID
flood3d align --pre PRE_RUN --post POST_RUN
flood3d difference --pre PRE_RUN --post POST_RUN
flood3d report --run RUN_ID
```

## Storage classes

### Version-controlled

- AOI definitions that contain no sensitive information;
- schemas and configurations;
- provider adapter code;
- run manifests without secrets;
- aggregate quality reports;
- documentation and decision records.

### Local/object storage, not Git

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

The system may automatically reject poor candidates. It should not automatically publish a scientifically accepted change layer.

Human approval is required at these gates:

1. licence/access acceptance;
2. target-accuracy definition;
3. pilot reconstruction acceptance;
4. pre/post alignment acceptance;
5. debris/burial interpretation acceptance;
6. external publication or operational use.

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
