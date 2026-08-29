# Nepal flood topographic change map

Research reconstruction of post-flood surface change in the upper Bhote Koshi corridor after the August 2026 Nepal flood.

## Current deliverable

- Strict 32 m surface-change, uncertainty, support, coverage, pre-reference, and post-surface rasters.
- Separately validated 10 m experimental surface-change bundle and building overlay.
- Relaxed 32 m sensitivity layer.
- Support-aware HOT/Copernicus building summaries.
- Exact WGS84 processing extent and 1 km reporting-grid table.
- Interactive Three.js terrain viewer with an OpenStreetMap geographic context panel.
- Reproducible public imagery catalogue, sparse/dense matching, validation, and cross-machine tests.
- Official 61-scene Sentinel-2 temporal-context catalogue with exact affected-area overlap and explicit DSM rejection.

The default layer is classified **RESEARCH_ONLY**. It is not a building-burial product or an operational rescue assessment.

## View locally

```bash
cd topographic_change_map
npm ci
npm run viewer:build
npx vite preview --config vite.config.ts --host 127.0.0.1 --port 4174
```

Open <http://127.0.0.1:4174/>. Use **Product grid** to switch between the strict
32 m default and the lazily loaded experimental 10 m product. Use **Map context**
to see the processing footprint, affected polygons, direct support, reporting
grid, settlement markers, and live latitude/longitude over OpenStreetMap.

## Key locations and scales

| Item | Value |
|---|---|
| Current processing bounds | `28.139691–28.283023°N`, `85.310212–85.393888°E` |
| Principal settlements | Syabrubesi, Timure, Rasuwagadhi |
| Source image GSD | approximately 0.3–0.4 m |
| Co-registration grid | 1 m |
| Matching window | 96 m for the strict 32 m layer |
| Default measurement spacing | 32 m |
| Reporting grid | 1 km; indexing only |

## Start here

- [PLAN.md](PLAN.md) — complete objective and execution contract
- [SCALES_AND_AOI.md](SCALES_AND_AOI.md) — exact distinction between source pixels, measurements, and 1 km reporting bins
- [STATUS.md](STATUS.md) — current evidence, work, and blockers
- [products/README.md](products/README.md) — raster and building product guide
- [products/VALIDATION.md](products/VALIDATION.md) — numerical validation
- [products/ortho-change-v3-strict/MAPPED_TILES.md](products/ortho-change-v3-strict/MAPPED_TILES.md) — exact tile coordinates
- [UPSTREAM.md](UPSTREAM.md) — GeoPera audit and attribution
- [RUNBOOK.md](RUNBOOK.md) — operation and recovery
- [PUBLICATION.md](PUBLICATION.md) — live viewer URL, Pages activation, and local build
- [products/release-audit.json](products/release-audit.json) — machine-readable release-completeness evidence and external gates
- [research/README.md](research/README.md) — detailed research package

## Test everything

```bash
npm run check
npm test
npm run test:python
npm run viewer:build
npm run viewer:test
npm run audit:release
```

Raw satellite imagery, credentials, browser profiles, caches, and large intermediates are deliberately excluded from Git.
