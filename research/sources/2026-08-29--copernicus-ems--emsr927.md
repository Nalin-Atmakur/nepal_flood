---
url: https://mapping.emergency.copernicus.eu/activations/EMSR927/
publisher: Copernicus EMS (European Commission)
author: CEMS Rapid Mapping
published: 2026-08-26
accessed: 2026-08-29
type: government
reliability: A
topics: [damage-grading, flood-extent, geodata]
status: extracted
---

# Copernicus EMS Rapid Mapping activation EMSR927 "Flood in Nepal"

## Summary

Official EU rapid-mapping activation, triggered 2026-08-26 09:53 UTC (7 m water-level rise recorded). Produces human-graded damage-assessment (GRA) vector products per settlement AOI. Open activation, still delivering. Linked: International Charter activation 1052, GDACS FL1104124, ArcGIS StoryMap situational reporting.

## Extracted claims

- as of 2026-08-29: AOI01 Syabrubesi GRA v1 (27 Aug 19:04 UTC; WorldView-3): 559 structures assessed, 433 affected; ~111 ha landslide; 5.4 km primary road affected; power plant affected. AOI02 Timure GRA v2 (28 Aug): 441 structures, 431 affected. AOI03 Bidur GRA v1 (29 Aug 02:57 UTC; BlackSky+Satellogic): ~11,400 structures in AOI, ~2,343 affected. AOI04 Bharatpur pending (delivery expected 29 Aug ~17:00 UTC).
- Activation totals: ~5,300 population in AOIs, 46 km roads, 3,207 identified buildings.
- Downloads no-auth: per-AOI zips `…/backend/EMSR927/AOI01/GRA_PRODUCT/EMSR927_AOI01_GRA_PRODUCT_v1.zip`; whole bundle `…/backend/EMSR927/EMSR927_products.zip`; COG orthos + vector tiles on `rapidmapping-viewer.s3.eu-west-1.amazonaws.com`. Machine-readable status: `…/backend/dashboard-api/public-activations/?code=EMSR927`.
- Trigger described as "reportedly triggered by a Glacial Lake Outburst Flood" — coarser than the collapse-driven reconstruction (→ 2026-08-28--kathmandu-post--trigger-reconstruction.md).

## Contradictions

- Trigger wording (GLOF) vs. scientific reconstruction (ice-rock avalanche → landslide-dam failure). Not operationally material.

## Relevance

- 60: authoritative human-graded complement to the fAIr AI layer; Bidur AOI extends coverage downstream where the AI layer has none; affected-roads layers feed access planning.
