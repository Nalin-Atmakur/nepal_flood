---
url: https://data.humdata.org/dataset/hot_flood_npl_buildings_damage
publisher: HOT / HDX
author: Humanitarian OpenStreetMap Team
published: 2026-08-28
accessed: 2026-08-29
type: dataset
reliability: B
topics: [building-damage, ai-mapping, geodata]
status: extracted
---

# HDX: Nepal Flood 2026 fAIr Damage Assessment (Upper Trishuli & Bhote Koshi)

## Summary

AI-scored building-damage layer produced with HOT's fAIr tooling: every OSM building footprint within the ~18 km² covered by open Vantor post-event imagery gets a damage class from pre/post comparison. Direct S3 download, no auth, CC-BY.

## Extracted claims

- as of 2026-08-28 02:53 UTC (last modified): 1,053 buildings scored — destroyed 677, major 105, minor 155, no-damage 113, no-data 3 (verified by download).
- Schema: `osm_id`, `damage`, `damage_class`, `damage_confidence`. Formats: GeoJSON (366 KB), KML, analyzed-AOI polygon GeoJSON.
- Stated caveats: AI predictions only; sensor mixing + post-event cloud can inflate "destroyed"; coverage limited to analyzed AOI; "intact" = nothing visible from nadir optical.
- API: `https://data.humdata.org/api/3/action/package_show?id=hot_flood_npl_buildings_damage` (browser UA required). Companion daily OSM extracts: `hot_flood_npl`, `hot_flood_npl_corridor`.

## Contradictions

- None; note its "destroyed" counts should be cross-checked against human-graded CEMS products (→ 2026-08-29--copernicus-ems--emsr927.md).

## Relevance

- 60-ai-and-satellite-approaches: the ready-made damage layer any prioritisation work starts from; join on `osm_id` for building attributes; always display the coverage polygon.
