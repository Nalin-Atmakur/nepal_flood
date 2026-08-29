# Affected-area source layers

| File | Source | Role | Licence/provenance |
|---|---|---|---|
| `unosat_damage_area.geojson` | UNOSAT FL20260826NPL mirror hosted by Microsoft AI for Good | Primary authoritative affected-area mask (~37 km²) | UNOSAT product, CC BY-SA; mirrored at `opendata.aiforgood.ai` |
| `hot_flood_extent.geojson` | HOT/NAXA Nepal flood activation | Observed 27 August flood extent | Open HOT disaster-response data |
| `nesra_flood_zones.geojson` | NESRA FloodWatch public bucket | Supplementary flood-zone polygons | Public event-response layer |

These aggregate polygons contain no personal data. The build preserves each source separately and reports overlap rather than silently treating disagreement as error.
