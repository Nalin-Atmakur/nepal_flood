# Live data sources — working catalogue

*The team's operational link list. Merged from the field data-sources table (→ ../sources/2026-08-29--field--data-sources-table.md) and 2026-08-29 research. ✅ = confirmed active for this event.*

## Event-specific products (check daily)

| Source | What | Access | Cadence / notes |
|---|---|---|---|
| ✅ Copernicus EMS **EMSR927** | Human-graded damage vectors per AOI (Syabrubesi, Timure, Bidur, Bharatpur pending) | No-auth zips: `rapidmapping.emergency.copernicus.eu/backend/EMSR927/EMSR927_products.zip`; status API: `mapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR927` | New AOIs/versions daily-ish while open |
| ✅ HOT **fAIr damage** (HDX) | AI damage class per building, ~18 km² | data.humdata.org/dataset/hot_flood_npl_buildings_damage (GeoJSON, CC-BY) | "As needed"; companions `hot_flood_npl`, `hot_flood_npl_corridor` update daily |
| ✅ **UNOSAT** mudflow/rockflow extents | Rasuwa + Nuwakot V1 (26–27 Aug imagery) | via ReliefWeb disaster page / unosat.org (product 4257) | Event-driven |
| ✅ **Vantor Open Data** | 13 VHR pre/post scenes (0.31–0.58 m), COGs | STAC: `vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json` (CC-BY-NC) | Poll collection.json; post scenes 71–81% cloud |
| ✅ **Planet open release** | 24 scenes: PlanetScope 3.8 m, SkySat 0.8 m, Pelican 0.55 m; pre-baseline 2026-05-27 | source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26 (CC-BY-NC) | Actively adding scenes |
| ✅ **Sentinel Asia / Charter 1052** | EOS-RS Sentinel-1 damage proxies (KMZ), IWM Planet analysis | sentinel-asia.org/EO/2026/article20260826NP.html | VAPs added as agencies deliver |
| ✅ **OpenAerialMap** | Drone + Vantor mirrors, tiled | openaerialmap.org | As uploads land (govt appealed for drone footage) |
| ✅ **NESRA FloodWatch** | Nepali space-agency event page, Sentinel-2 analyses, drone field assessments | nesraspace.org/floodwatch/rasuwa-2026/ | Active |
| ✅ **Disaster imagery viewer** | Federated triage screen for all of the above | cgiovando.github.io/disaster-imagery-viewer/nepal-floods-2026/ | Self-updating layers |
| ✅ **HOT Tasking Manager** | Mapping campaign "2026 Nepal Floods" (#63069/#63102/#63235/#63236) | TM API: `tasking-manager-production-api.hotosm.org/api/v2/projects/?campaign=2026%20Nepal%20Floods` | Live |

## Nepal operational feeds (standing)

| Source | What | Access | Cadence |
|---|---|---|---|
| **DHM river watch** | Gauge levels vs warning/danger thresholds; flood bulletins | dhm.gov.np/hydrology/river-watch | Near-real-time; bulletins ~08:00 daily in monsoon |
| **BIPAD API** | Incidents, losses, alerts, real-time feeds | bipadportal.gov.np/api/ | Near-real-time sensors; incidents as reported |
| **NDRRMA bulletins** | Official daily figures | ndrrma.gov.np (daily ~10:00) | Daily — the canonical number refresh |
| **DoR Navigate** | Road open/closed/partial | navigate.dor.gov.np/dashboard | Event-driven |
| **ICIMOD/SERVIR FIMT** | Sentinel-1 flood extent/depth for Nepal | servir.icimod.org | Hours after suitable acquisition |
| **ReliefWeb API** | Sitreps, flash updates (GLIDE FF-2026-000162-NPL) | apidoc.reliefweb.int | Several/day during emergency |

## Forecast & environment

| Source | What | Notes |
|---|---|---|
| **GloFAS** | Probabilistic river-flow forecast, 15-day | Daily; riverine only |
| **Google Flood Hub** | LSTM riverine forecast, Nepal covered | NOT a landslide-dam-breach monitor; daily glance only |
| **NASA GPM IMERG** | Satellite rainfall, half-hourly | Early run ~4 h latency; free Earthdata account |
| **Copernicus Data Space** | Sentinel-1/-2 raw + APIs | For the barrier-lake watch script |
| **Microsoft Planetary Computer** | Sentinel/Landsat STAC | Powers the imagery viewer |

## Reference layers (static)

| Source | What | Notes |
|---|---|---|
| **OCHA CODs** | Admin boundaries + P-codes, population stats | data.humdata.org/dataset/cod-ab-npl, cod-ps-npl |
| **WorldPop / Meta HRSL / Kontur** | Population rasters (100 m / 30 m / 400 m H3) | HRSL unmaintained since 2024, 2016 imagery base — label the bias |
| **OSM Geofabrik Nepal** | Roads, buildings, helipads, hospitals | Daily extracts; corridor being actively remapped |
| **Building footprints** | OSM / Microsoft / Google Open Buildings / HOT fAIr event footprints | See approaches.md §2 for quality notes |
| **DEMs** | Copernicus GLO-30, NASADEM (OpenTopography API), JAXA AW3D30 | For flow-path weighting + elevation differencing |
| **healthsites.io / LogIE** | Health facilities, logistics | Indexed on activation wiki |
