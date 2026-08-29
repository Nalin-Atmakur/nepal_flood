# Deep-dive: geospatial, imagery, remote sensing and structured datasets — Bhote Koshi / Trishuli flood (26 Aug 2026)

*Sweep run 2026-08-29 ~16:50–17:25 UTC (22:35–23:10 NPT). Baseline = repo files `live-data-sources.md`, `05-already-running.md`, `07-data-map.md`, UT-1 SEIA source. "NEW" = appeared/changed after ~13:00 NPT (07:15 UTC) 29 Aug. "MISSED" = existed earlier but absent from the baseline.*

Fetch-status legend: **[C]** fetched directly (API/STAC/file, counts and timestamps are real) · **[R]** reported by a page/third party · **[U]** unconfirmed / not reachable. Reliability A–F.

Method note: ~60 direct API/STAC/S3 fetches (curl) + ~45 page fetches + 40 web searches (search budget then exhausted; remaining items were done by direct fetch only). Sub-second timestamps in this file are UTC unless marked NPT.

---

## 1. HDX (data.humdata.org) — every dataset touching the event  [C]

CKAN query `package_search?q=nepal&sort=metadata_modified desc` (362 results) plus keyword sweeps (rasuwa, nuwakot, bhotekoshi, EMSR927, FL20260826NPL, trishuli, kontur, dtm, wfp, fair). Event-specific datasets:

| Dataset (org) | What | Format | Licence | Last modified (UTC) | Size / count | Access | Status | NEW? |
|---|---|---|---|---|---|---|---|---|
| `hot_flood_npl` (HOT) | Flood-affected area, Rasuwagadhi→Narayani confluence: AOI = 27 Aug observed extent +200 m buffer. 203 resources: OSM + Overture layers (buildings, roads, bridges, waterways, helipads, health, education, POI, financial, police stations, open spaces, populated places), Bridge Damage Assessment, Destroyed & Damaged Features (OSM), Flood Extent, TM task boundaries, layer metadata JSON, PMTiles, data-quality HTML | GeoJSON/GPKG/KML/SHP/PMTiles | ODbL | **2026-08-29 16:08** (daily) | see §7 for per-file sizes | `https://data.humdata.org/dataset/hot_flood_npl`; files on `https://production-raw-data-api.s3.amazonaws.com/ISO3/NPL/…` (no auth) | [C] | NEW refresh (16:04–16:08 UTC); "Destroyed and Damaged Features" and PMTiles are new layers |
| `hot_flood_npl_corridor` (HOT) | Same layer set for the full 1 km river-corridor buffer Rasuwagadhi→Devghat (Rasuwa, Nuwakot, Dhading, Gorkha, Tanahu, Chitwan), 89 resources | as above | ODbL | **2026-08-29 14:01** | CKAN reports size 0 for most resources (S3 paths `ISO3/NPL_CORRIDOR/…`) | HDX / S3 | [C] | NEW refresh |
| `hot_flood_npl_buildings_damage` (HOT) | fAIr AI damage class per building over Vantor post imagery (~18 km²) | GeoJSON 366 KB, KML 779 KB, analysed-AOI GeoJSON 52 KB, compare HTML | CC-BY | 2026-08-28 09:45 | — | HDX; S3 `ISO3/NPL/buildings/hot_flood_npl_buildings_damage.geojson` | [C] | no |
| `hot_flood_npl_buildings_fair` (HOT) | fAIr footprints — **referenced by OSM wiki + imagery viewer but HDX returns 403 / "not found"** (private or unpublished). Public copy is on Hugging Face (see §12) | — | — | — | — | — | [C] negative | MISSED (gap) |
| `npl-flood-emsr927` (Copernicus) | EMSR927 grading products AOI01 v1, AOI02 **v2**, AOI03 v1 (GPKG, XLSX, SHP zip, PDF each) | GPKG/XLSX/SHP/PDF | CC-BY | **2026-08-29 10:46** | AOI01 zip 6.82 MB, AOI02 v2 6.91 MB, AOI03 15.52 MB | resources are `…GRA_PRODUCT_vN.zip?type=gpkg|xlsx|vectors|pdf` | [C] | NEW (AOI02 v2 + AOI03 added 10:45 UTC) |
| `mudflow-rockflow-extent-as-of-26-27-august-2026-in-rasuwa-district…` (UNOSAT) | Rasuwa extent, product 4257 | GDB zip 187 KB + XLSX 20 KB | CC-BY-SA | 2026-08-29 09:47 | — | HDX; `unosat.org/static/unosat_filesystem/4257/…` | [C] | re-touched 09:47 |
| `mudflow-rockflow-extent-…-in-nuwakot-district…` (UNOSAT) | Nuwakot extent (product 4258) | GDB + XLSX | CC-BY-SA | 2026-08-29 09:47 | — | HDX | [C] | re-touched |
| `mudflow-rockflow-impact-assessment-in-rasuwa-nuwakot-districts…` (UNOSAT) | Cumulative extent from S2 27 Aug + PlanetScope 26 Aug; 350 km² analysed, ~37 km² affected, ~120 km roads; product 4259 | `FL20260826NPL.gdb.zip` + `UNOSAT_PopulationExposure_20260826_20260827_Nepal_China.xlsx` | CC-BY-SA | 2026-08-29 09:47 (files 28 Aug 14:24) | — | `https://unosat.org/static/unosat_filesystem/4259/FL20260826NPL.gdb.zip` | [C] | re-touched |
| `unosat-live-web-map` (UNOSAT) | Live web map entry (product 4256) + GDB/XLSX | GDB, XLSX | CC-BY-SA | 2026-08-28 09:55 | — | `unosat.org/static/unosat_filesystem/4256/…`; ArcGIS Experience `experience.arcgis.com/experience/506e35256a654e0c97600f6adbaacbe3` | [C] | no |
| `2026-nepal-flash-flood` (Microsoft AI for Good Lab) | Overture footprints + IHME population inside UNOSAT extent | GeoTIFF 2.69 MB; GPKG 164.7 MB | CC-BY | 2026-08-28 06:24 | 4,977 buildings / ~10,204 people (baseline) | HDX | [C] | no |
| `npl-glide-events` (GLIDE) | GLIDE registry incl. this event | CSV 36 KB, GeoJSON 1.9 MB | CC-BY-IGO | **2026-08-29 14:46** | — | HDX | [C] | NEW refresh |
| `cerf-allocations-npl` (CERF) | Funding | CSV/JSON | CC-BY-IGO | 2026-08-29 14:02 | — | HDX | [C] | NEW refresh (not geospatial) |
| `nepal---risk-assessment-indicators` (HeiGIT GAIA) | ADM2 flood exposure, evacuability, access, facilities, demographics CSVs — **regenerated 26–27 Aug** (files dated 2026-08-26 14:30–2026-08-27 07:39) | CSV ×8 | CC-BY-SA | 2026-08-28 09:26 | 1.8–21 KB each | `hot.storage.heigit.org/heigit-hdx-public/risk_assessment_inputs/npl/…` | [C] | MISSED |
| `nepal-healthsites` (healthsites.io) | Health facilities | GeoJSON 6.1 MB, CSV, SHP | ODbL | 2026-08-28 18:23 | — | HDX | [C] | no |
| `official-figures-for-casualties-and-damage` (OCHA Nepal, inactive) | 2015 MoHA/NEOC Google Sheet — sheet touched 2026-08-28 08:44; dataset_date still 2015. Treat as **not** this event unless verified | Google Sheet | CC0 | 2026-08-28 09:49 | 291 KB | HDX | [C] | ambiguous |

Not event-specific but refreshed since 26 Aug: `hdx-hapi-npl` (29 Aug), `ifrc-appeals-data-for-nepal` (28 Aug), `npl-idmc-idu-events` (28 Aug), `nasa-firms-*` (daily), `asia-pacific-monitoring-on-diseases-disasters` (ReliefWeb sheet, 28 Aug), `cod-ps-global` (28 Aug).

**Absent on HDX (checked):** no WFP ADAM entry for this event (only `umi-storm-1001311`); IOM DTM `npl-iom-dtm-from-api` last 24 Aug (pre-event); Kontur (May 2026 boundary/population only); Meta (HRSL 2018–19 vintage only); ICIMOD nothing; no OCHA 3W/4W for this event.

Reference layers (static) — direct URLs verified [C]:
- `cod-ab-npl` v02 (ADM0–3; 775 ADM3), GDB 26 MB / SHP 54 MB / GeoJSON 60 MB, modified 2026-08-14.
- `cod-ps-npl` 2023 projections ADM0–2 (UNFPA), CSV/XLSX.
- `worldpop-population-counts-for-nepal`: `https://data.worldpop.org/GIS/Population/Global_2000_2020_Constrained/2020/BSGM/NPL/npl_ppp_2020_UNadj_constrained.tif` (2.3 MB) and unconstrained `…/2020/NPL/npl_ppp_2020_UNadj.tif` (82 MB).
- `nepal-high-resolution-population-density-maps-demographic-estimates` (Meta HRSL): `population_npl_2018-10-01_geotiff.zip` 16 MB + 6 demographic rasters (2019 vintage). Label the bias.
- `kontur-population-nepal`: `kontur_population_NP_20231101.gpkg.gz` 7.1 MB (400 m H3).
- `nepal-airport-and-humanitarian-staging-area-has` (UN Nepal): Airport.zip 285 KB, HSA.zip 26 KB (SHP, 2023).

---

## 2. Copernicus EMS — EMSR927  [C]

Dashboard API `https://mapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR927` fetched 16:53 and re-polled **17:19 UTC**. Activation open (`closed:false`), activated 26 Aug 09:53 UTC by DG ECHO, GDACS `FL1104124`, Charter number 1052 linked. Activation extent 84.405–85.381 E / 27.682–28.280 N. Activation-level stats: **3,207 identified buildings, 46 km roads, 11 ha built-up, 5,300 population, max_extent 830 (ha)**.

| AOI | Product | Version / status | Delivered (UTC) | Imagery | Key stats (affected/total) | Download |
|---|---|---|---|---|---|---|
| 01 Syapru Besi | GRA #2851 | v1, F (final) | 27 Aug 19:03 | WorldView-3 27 Aug 05:05 | Residential 392/517, other non-res 37/38, school 1/1, worship 2/2, institutional 1/1; primary road 5.4/5.4 km; bridges 5/5; landslide/flow 111.1 ha; power-plant construction 0.8 ha; pop 450/750 | `…/EMSR927/AOI01/GRA_PRODUCT/EMSR927_AOI01_GRA_PRODUCT_v1.zip` 6,822,625 B (last-mod 27 Aug 20:19) |
| 02 Timure | GRA #2852 | **v2**, F | 28 Aug 17:10 | Legion 27 Aug 05:05 | Residential 225/232, unclassified 133/136, other non-res 64/64, retail 6/6, worship 2/2; primary road 4.8/4.8 km; cart track 4.3/4.3; bridges 1/1; flow 129.4 ha; dams 0.2 ha; pop 450/500 | `…AOI02_GRA_PRODUCT_v2.zip` 6,910,842 B |
| 03 Bidur | GRA #2855 | v1, F | **29 Aug 02:57** | **BlackSky 27 Aug 12:09 + Satellogic 27 Aug 04:22** | Residential **2,309/11,373**, correctional 29/29; primary road 5.5/16.1 km, local 6.1/19.6, cart track 27.4/91.4; **bridges 20/20**; flow 589.1 ha; power-plant constructions 26.7/31.6 ha; heavy industry 0.5 ha; pop **4,400/25,000**; has `notAnalysedA` layer | `…AOI03_GRA_PRODUCT_v1.zip` 15,519,859 B (29 Aug 02:57) |
| 04 Bharatpur | GRA #2856 | v1, **W (in work)** | not delivered at 17:19 UTC (expected 17:01 UTC) | **Legion 29 Aug 04:01 UTC (flagged new)** | — | `…AOI04…v1.zip` → 404 |

- `EMSR927_products.zip` (all AOIs): **36,076,533 B, last-modified 29 Aug 02:57 UTC** — `https://rapidmapping.emergency.copernicus.eu/backend/EMSR927/EMSR927_products.zip` (302 → signed S3 URL; GET works, HEAD returns 405).
- Zip contents (AOI01 central directory read via range request): `…_v1.gpkg`, per-layer `.shp/.dbf/.json` for `areaOfInterestA`, `builtUpP`, `facilitiesA`, `imageFootprintA`, `observedEventA`, `transportationA/L/P`, `source`, `summaryTable_v1.xlsx`, `9000_map_v1.pdf`.
- Web layers (viewer bucket `rapidmapping-viewer.s3.eu-west-1.amazonaws.com`, listing denied but object paths given by API): COG orthos `EMSR927/AOI0N/GRA_PRODUCT/EMSR927_AOI0N_GRA_PRODUCT_<SENSOR>_<date>_ORTHO_cog.tif` (WV-3, Legion, BlackSky, Satellogic) and vector tiles `…_builtUpP_vN_VT` etc. with `.sld` + `.json` style files — i.e. **the VHR orthos used for grading are served as COGs** (licence: CEMS product terms, not the raw image licence; check before redistribution).
- Storymap report `storymaps.arcgis.com/stories/f76baefadfa74d6d9a18265875f48870` (JS; not readable by fetch).
- Sensitive flag false. Cadence: AOI04 due; watch `products.zip` last-modified.

Reliability A. NEW: AOI04 acquisition + status; AOI03 sensors and stats; per-file sizes; COG/VT paths (MISSED in baseline).

---

## 3. International Charter activation 1052  [C]

Page `https://disasterscharter.org/activations/flood-in-nepal-activation-1052-` (Next.js payload parsed). Activated 26 Aug 14:58 UTC+2, requester "ADRC on behalf of DHM", PM Samir Belabbes (UNITAR). **8 products** (4 hidden behind "Load more"):

| # | Product | Source imagery (acq. date) | Listed (UTC) | Notes |
|---|---|---|---|---|
| 1 | Satellite-detected mudflow/rockflow extent, Rasuwa | PlanetScope 26 Aug | 27 Aug 15:28 | = UNOSAT 4257 |
| 2 | Satellite-detected mudflow/rockflow extent, Nuwakot | Sentinel-2 14 Aug (pre) + PlanetScope 26 Aug | 27 Aug 15:36 | = UNOSAT 4258 |
| 3 | Pre/post images, flash-flood affected areas, Rasuwa | **ResourceSat (ISRO) 26 Aug** | 27 Aug 12:33 | ISRO/NRSC |
| 4 | Pre/post images, damages, "Newakot" District | **NewSat (Satellogic) 27 Aug** | 28 Aug 13:38 | |
| 5 | Nepal, Timure–Syabrubesi impact map | **Pléiades Neo 3 (28 Aug)** | 28 Aug 13:38 | 30 cm; value-adder not exposed (SERTIT likely) |
| 6 | Pre/post, Gerkhutar (Nuwakot) | NewSat 27 Aug | 28 Aug 11:38 | |
| 7 | Pre/post, Bidur (Nuwakot) | NewSat 27 Aug | 28 Aug 11:38 | |
| 8 | Pre/post, Bidur (Nuwakot) (second sheet) | NewSat 27 Aug | 28 Aug 11:39 | |

Products are PDFs/JPGs; underlying Pléiades Neo / ResourceSat / NewSat imagery is Charter-restricted (DHM/NDRRMA as authorised user can request). Nothing new since 28 Aug 13:38 UTC. Reliability A. MISSED: sensor-level detail (PNEO3 28 Aug is the newest VHR frame known over Timure–Syabrubesi).

---

## 4. UNOSAT — FL20260826NPL  [C partial]

- Products 4256 (live map), 4257 (Rasuwa extent), 4258 (Nuwakot extent), 4259 (impact assessment). `unosat.org/products/NNNN` is a JS app (no server-rendered content); files are under `https://unosat.org/static/unosat_filesystem/<id>/`.
- ArcGIS: Web Experience `506e35256a654e0c97600f6adbaacbe3` "Floods in Nepal, August 2026" (owner `umg_unosat`, public, created 26 Aug, modified **29 Aug 10:45 UTC**) → embeds Web Map item **`acd4770e1f9943cfbcfdd11d6b60ccf2` "Floods in Nepal - August 2026"** (modified 29 Aug). Feature-service URLs are not exposed in the item JSON (template still references a Pakistan MapServer); open the web map item at `https://www.arcgis.com/home/item.html?id=acd4770e1f9943cfbcfdd11d6b60ccf2` to read its operational layers.
- SMCS event page `https://smcs.unosat.org/event/421` (JS only; no REST found).
- Microsoft mirrors the UNOSAT impacted-area polygon: `https://opendata.aiforgood.ai/damage-assessment/data/unosat_damage_area.geojson` (996 KB, 1 MultiPolygon, 37 km²) — used by the disaster-imagery viewer. [C]
- UNITAR FloodAI dashboards for Nepal exist (Sentinel-1 automatic) — not verified for this event [U].

---

## 5. Vantor (Maxar) Open Data  [C]

`https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json` — **13 items (unchanged), temporal 2021-10-16 → 2026-08-28 05:22 UTC**, CC-BY-NC 4.0. Events catalog lists 10 events; Nepal is the newest. Items (assets = `visual` COG + `thumbnail` only; **no stereo / RPC / off-nadir-pair metadata beyond `view:off_nadir`**):

| Item | Datetime (UTC) | Sensor / GSD (from OAM) | Cloud % | Off-nadir | Phase / area |
|---|---|---|---|---|---|
| B040001100881410 | 27 Aug 05:04:50 | WV-3 0.37 m | 73 | 21.7 | post, Timure–Syabrubesi strip |
| B040001100881610 | 27 Aug 05:05:11 | WV-3 0.35 m | 71 | 9.1 | post, same corridor |
| B040001100882F10 | 27 Aug 05:05:34 | WV-3 0.35 m | 79 | 12.3 | post, long N–S strip 27.95–29.04 N |
| B040001100881710 | 27 Aug 05:06:12 | WV-3 0.39 m | 72 | 26.6 | post, Dhunche–Syabrubesi |
| B030001100CF1110 | 28 Aug 05:07:26 | WV-2 0.58 m | 81 | 25.1 | post, upper corridor |
| B030001100CF1310 | 28 Aug 05:07:36 | WV-2 0.56 m | 78 | 21.5 | post |
| B030001100CF1210 | 28 Aug 05:07:57 | WV-2 0.54 m | 74 | 15.4 | post, Betrawati–Bidur |
| B030001100CF1610 | 28 Aug 05:08:06 | WV-2 0.53 m | 79 | 12.2 | post |
| B110001101165110 | 28 Aug 05:22:46 | Legion (LG01) 0.40 m | 78 | 19.5 | post, 27.55–28.53 N strip |
| B160001100CDB210 | 5 Feb 2026 08:17 | Legion LG06 0.39 m | **0** | 15.6 | pre, Betrawati–Bidur |
| 10300100FCB83600 | 29 May 2024 | WV-2 0.65 m | 15 | 27.5 | pre, 26.92–28.06 N |
| 10500100364E8400 | 17 Sep 2023 | GE-1 0.47 m | 46 | 11.8 | pre, E–W 84.36–85.82 |
| 10300100C86CED00 | 16 Oct 2021 | WV-2 0.59 m | 22 | 27.5 | pre, 27.93–29.04 N |

Note: the two 27 Aug WV-3 frames at 9.1° and 21.7°/26.6° off-nadir were used as a pseudo-stereo pair by geo-pera (§12) for parallax-based deposit thickness. HOT hosts a mosaic `s3 ISO3/NPL/disasters/nepal-flood/2026-08-28/vantor_composite_v3.tif` (**1,727,599,720 B**, 28 Aug 14:08) [C]. OpenAerialMap now mirrors all 13 scenes; the LG06 pre scene was uploaded **29 Aug 14:45 UTC (NEW)**.

---

## 6. Planet Crisis Response (source.coop)  [C]

Root `https://data.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/catalog.json`; `collection.json` does not exist (it is a Catalog with `pre-event/` and `post-event/` child catalogs). **24 scenes, 5 collections, unchanged; newest acquisition 28 Aug 05:01 UTC.** CC-BY-NC 4.0. `llms.txt` and `README.md` present; GeoParquet indexes at `<phase>/items.parquet` and `<phase>/<collection>/items.parquet`. S3 mirror `s3://us-west-2.opendata.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/` (`--no-sign-request`).

| Collection | Scenes | Acquired (UTC) | GSD | Product | Cloud / reported clear |
|---|---|---|---|---|---|
| pre-event/planetscope-2026-05-27 | 5 (sat 254a) | 27 May 05:32 | 3.8 m | analytic_sr | 5–52 % / 35–93 % |
| post-event/planetscope-2026-08-26 | 9 (255f 05:01 ×5, 251f 05:45 ×4) | 26 Aug | 3.8 m | analytic (TOA) | 62–93 % / 2–14 % |
| post-event/skysat-2026-08-27 | 2 (SSC1) | 27 Aug 02:00 | 0.80 m | pansharpened, udm | 50 % / ~8 % |
| post-event/pelican-2026-08-27 | 3 (sat 3009) | 27 Aug 06:10 | 0.55 m | pansharpened, udm2 | 83–85 % / **0 % (unreliable)** |
| post-event/planetscope-2026-08-28 | 5 (2544 ×4 04:57, 2520 ×1 05:01) | 28 Aug | 3.9 m | analytic (TOA) | 64–90 % / 4–25 % |

Nothing added since 28 Aug. Planet scenes (26 Aug post, 27 May pre) are also mirrored on OAM.

---

## 7. HOT / OSM ecosystem  [C]

**Tasking Manager** (`tasking-manager-production-api.hotosm.org/api/v2/projects/?campaign=2026%20Nepal%20Floods`, campaign id 2100, org MapBuds, imagery EsriWorldImagery, hashtag `#nepal-flood-2026-trisuli-bhotekoshi`), polled 16:55 and 17:19 UTC:

| Project | Scope | Tasks | Mappers | Mapped / validated | Created | Last update |
|---|---|---|---|---|---|---|
| 63069 | Upper corridor BUILDINGS (132.9 km²) | 648 | 94 | 100 % / **28 %** | 27 Aug 09:52 | 29 Aug 17:18 |
| 63102 | Upper corridor ROADS | 200 | 57 | 100 % / 16 % | 27 Aug 10:05 | 29 Aug 15:57 |
| **63235** | Lower corridor ROADS (196.6 km², centroid 84.70 E 27.82 N) | 281 | 11 | 17 % / 0 % | **29 Aug 08:05** | 29 Aug 16:56 |
| **63236** | Lower corridor BUILDINGS | 910 | 21 | 17 % / 0 % | **29 Aug 08:07** | 29 Aug 17:17 |

(Projects 62970 and 62904 are cited by the OSM wiki / HF card but are not in the campaign listing — probably drafts/archived.) Stats endpoint `/api/v2/projects/<id>/statistics/` works without auth. Collation app: `jarmokivekas.github.io/hotosm-collate/app/?campaign=2026+Nepal+Floods`.

**raw-data-api S3** (`production-raw-data-api.s3.amazonaws.com`, prefix `ISO3/NPL/`, public listing with `list-type=2`), event files [C]:

| Key | Size | Last-mod (UTC) | Notes |
|---|---|---|---|
| `combined/hot_flood_npl_flood_extent.geojson` | 47,870 B | 29 Aug 13:29 | 1 polygon "Flood Extent, Observed 27 August 2026"; props `area_sq_km`, `buffer_meters` |
| `flood_extent/hot_flood_npl_flood_extent.geojson` | 341,826 B | 27 Aug 12:53 | earlier, more detailed version |
| `combined/hot_flood_npl_bridge_damage.geojson` | 28,342 B | 29 Aug 12:48 | **59 points**, props name/status/status_original/location/length_m/adm pcodes (e.g. Miteri Bridge, Timure 1–2, Ghatte Khola, Chilime, Syabrubesi — "Washed out") |
| `combined/hot_flood_npl_aoi.geojson` | 228,546 B | 29 Aug 16:04 | 1 polygon |
| `combined/hot_flood_npl.pmtiles` | 4,624,170 B | 29 Aug 16:03 | **NEW** vector tiles, all layers |
| `destroyed_features/hot_flood_npl_destroyed_features_osm_{geojson,gpkg,kml,shp}.zip` | 182–274 KB | **29 Aug 16:03** | **NEW** layer |
| `destroyed_buildings/…_osm_{geojson,gpkg,kml,shp}.zip` | 113–186 KB | 29 Aug 07:52 | |
| `tasking_manager/hot_flood_npl_tm_projects.geojson` | 429,686 B | 29 Aug 12:48 | TM task boundaries |
| `helipads/hot_flood_npl_helipads_osm.geojson` / `…_overture.geojson` | 12.5 KB / 3.6 KB | 27 Aug 13:46 (zips 29 Aug 16:04) | |
| `open_spaces/…`, `police_stations/…`, `admin/hot_flood_npl_admin_adm1..3.geojson` | — | 27–29 Aug | MISSED layers |
| `disasters/nepal-flood/2026-08-28/vantor_composite_v3.tif` | 1,727,599,720 B | 28 Aug 14:08 | Vantor mosaic |
| `overview/hot_flood_npl_overview.html`, `summary/hot_flood_npl_exposure_summary.png` | 219 KB / 201 KB | 29 Aug 16:05 | QA report |
| `_layers/osm/airports.parquet` | 88 KB | 27 Aug | |

(Older bare `combined/*_osm.geojson` names like `hot_flood_npl_helipads_osm.geojson` under `combined/` return 404 — use the per-layer folders.)

**OpenStreetMap live state** (Overpass, DB timestamp 29 Aug 17:04 UTC) [C]: Rasuwa+Nuwakot helipads/heliports **12** (4 nodes, 8 ways); health (hospital/clinic/doctors/healthcare) **24**; bridge ways **306**; features tagged `damage:event~2026` or `destroyed:building` **1,958**; buildings edited since 26 Aug — Rasuwa **1,873**, Nuwakot **7,393**; Rasuwa highways edited **306**. Geofabrik `asia/nepal-latest.osm.pbf` daily [U-static].

**uMap** `umap.hotosm.org/en/map/nepal-floods-2026-focus-area-and-tasking-manager-p_3989` [C]: layers = 13 Vantor scene footprints, "Disaster Area (from NAXA)", "HOT Tasking Manager Project Extents", "Observed Flood Extent 27 Aug 2026", pre/post Vantor groups.

**OSM wiki** `Organised_Editing/Activities/Nepal_Floods_2026` (last edited 29 Aug 14:48 UTC) [C] — adds: ohsomeNow dashboard `ohsome-now.heigit.org/dashboard#hashtag=nepal-flood-2026-trisuli-bhotekoshi` (REST `stats.now.ohsome.org/api/stats/hashtags/{hashtags}` — my calls returned 400/404, param format unverified [U]), UNOSAT Experience, PDC Hazard Brief `hazardbrief.pdc.org/PRODUCTION/ui/index.html?uuid=019565b9-16ef-40b9-a06a-882747664d45` (JS), GDACS SMCS event 421, LogIE `logie.logcluster.org/?op=npl`, healthsites emergency wiki (10 place-level map links, healthsites API v3 bbox queries; compiled 27 Aug).

**Disaster imagery viewer** (`cgiovando.github.io/disaster-imagery-viewer/nepal-floods-2026/`) catalog `data/nepal-floods-2026.catalog.json` regenerated **29 Aug 17:08 UTC** [C]: 129 scenes (Planet 27 post/10 pre, Vantor 10 post/5 pre, NEA drone 2 pre, DigitalGlobe 2015 archive 75), 4 TM projects, 3 HDX datasets; failure logged: "HDX hot_flood_npl_buildings_fair HTTP 403". Extra layers: UNOSAT extent (via Microsoft), Microsoft Sentinel-2 post-event XYZ tiles `opendata.aiforgood.ai/damage-assessment/tiles/nepal_flash_flood_2026_post_sentinel2_rgb/…`.

**Field-TM / DroneTM**: API probes (`api-fmtm.hotosm.org/projects?search=…`, `dronetm.org/api/…`) returned nothing usable; no public instance for this event found [U].

**fAIr**: see Hugging Face §12.

---

## 8. OpenAerialMap  [C]

`https://api.openaerialmap.org/meta?bbox=84.3,27.5,85.9,28.6&order_by=uploaded_at&sort=desc` → 199 items (176 in the narrower corridor bbox). Event-relevant uploads:

| Uploaded (UTC) | Title | Provider | Platform | GSD | Licence |
|---|---|---|---|---|---|
| **29 Aug 14:45** | [PRE] Vantor LG06 B160001100CDB210 (5 Feb 2026) | Vantor | satellite | 0.39 m | CC-BY-NC | 
| 28 Aug 12:27 → 10:43 | [POST] Vantor LG01 + 4× WV02 (28 Aug) | Vantor | satellite | 0.40–0.58 m | CC-BY-NC |
| 28 Aug 02:42 | "Post : Upper Flood Extent Nepal Flood 2026, Composite" | Vantor (HOT) | satellite | 0.37 m | CC-BY-NC |
| 27 Aug 18:17–22:57 | [POST] 4× WV03 27 Aug; [PRE] WV02 2021, GE01 2023, WV02 2024 | Vantor | satellite | | CC-BY-NC |
| 27 Aug 05:57–06:57 | 9 PlanetScope 26 Aug post; 5 PlanetScope 27 May pre | Planet | satellite | 3 m | CC-BY-NC |
| **27 Aug 03:00** | **"Rasuwagadhi-Timure"** (acq. 1 Sep 2025) | NEA Engineering Company Ltd | tagged satellite, is UAV | **3.5 cm** | CC-BY 4.0 |
| **27 Aug 02:25** | **"Simle to Betrawati (Trishuli)"** (acq. 3 Sep 2025) | NEA Engineering Company Ltd. | uav | **6 cm** | CC-BY 4.0 |
| 26 Aug 12:09 | "Nepal Flood 2026 - Land Use" | Naxa Pvt Ltd | raster | 10 m | CC-BY |

**No post-event drone orthomosaic has been uploaded** (confirmed at 17:20 UTC). The two NEA Engineering pre-event drone orthos (Sept 2025, 3.5–6 cm, covering Rasuwagadhi–Timure and Simle–Betrawati) are the best pre-event baseline for those reaches and were **MISSED** by the baseline.

---

## 9. Sentinel-1 / Sentinel-2 / Landsat / Sentinel-3 acquisitions  [C]

Copernicus Data Space OData catalogue + Planetary Computer STAC, bbox 85.0–85.55 E / 27.85–28.45 N.

**Sentinel-1** (no new pass since 28 Aug as of 17:10 UTC):
- `S1D_IW_GRDH_1SDV_20260828T122141_20260828T122206_004326_007FA4` ascending rel-orbit 85, 28 Aug 12:21 UTC — CDSE has RAW, 2× SLC (`…122115…5C8C`, `…122140…93F8`), GRDH `_01B4` and GRDH-COG `_C73B`; PC has GRD + RTC.
- Pre-event pair candidates: `S1D_IW_GRDH_1SDV_20260824T001844…004260_007D5D` descending rel-orbit 19, 24 Aug 00:18 UTC (PC GRD+RTC). Baseline's "16 Aug" pair = previous cycle of orbit 85.
- Next: descending ~31 Aug / 5 Sep (baseline); ascending 85 repeats 9 Sep (12-day, S1D only).

**Sentinel-2** (MGRS T45RUM = Rasuwa/upper corridor, T45RUL = Nuwakot/Bidur, T45RTM/T45RTL west):
- 27 Aug 04:56 UTC S2B R119: T45RUM 78.5 % cloud, T45RUL 54.3 %, T45RTM 85.9 %, T45RTL 85.0 % (L2A on CDSE + PC).
- **NEW: 29 Aug 04:47 UTC S2C R076 — T45RUM and T45RUL, L1C (`S2C_MSIL1C_20260829T044701_N0512_R076_T45RUM_20260829T081835`) and L2A (`…_20260829T095112`) on CDSE; not yet on PC; cloud % not read.** Third post-event optical pass — check immediately.
- Pre-event: 24 Aug S2B R076 T45RUM **38.6 % cloud** (best recent pre-event for the upper corridor), 24 Aug S2A R119 T45RUM 51 %, 22 Aug S2C R119, 12 Aug S2C (89 % clear per a volunteer repo).
- Next: R119 on 1 Sep 04:56, R076 on 3 Sep 04:47.

**Landsat**: L9 26 Aug 04:47/04:48 UTC path 141 rows 40 (47.5 % cloud) and 41 (67.8 %) — `LC09_L2SP_141040_20260826_02_T1`, `…141041…` (PC). Next: L8 path 141 on 3 Sep; L9 11 Sep.

**Sentinel-3**: OLCI/SLSTR/SYN products daily 25–27 Aug (100+ products listed; 300 m–1 km; only useful for the source-area snow/ice context) [C].

ASTER / PRISMA / EnMAP: not checked (search budget exhausted) [U].

Microsoft Planetary Computer STAC `planetarycomputer.microsoft.com/api/stac/v1/search` works anonymously for search; asset access needs SAS signing.

---

## 10. Sentinel Asia (EOR SA-00658, article20260826NP)  [C]

Requester DHM via ADRC; GLIDE **FF-2026-000162-NPL**. Public VAPs: (1) IWM (Bangladesh) — Planet 26 Aug analysis, released 28 Aug, JPG+ZIP; (2) EOS-RS — Sentinel-1 damage proxy map 28 Aug, PNG+KMZ. Imagery listed: post — ISRO EOS-04 C-SAR 26 Aug HH/HV; pre — JAXA ALOS-2 30 Jan 2026 (3 HH scenes), ISRO Cartosat-1 18 May 2014 PAN fore/aft (stereo — a DEM source), ISRO Resourcesat-2A 4 & 13 Apr 2026. Web-GIS requester-only. ADRC's Japanese disaster report (PDF, 28 Aug, `adrc.asia/publications/disaster_report/pdf/2026/ADRC_FL_NPL_Rasuwa_20260826_JA.pdf`) adds: JAXA planning ALOS-2 emergency observation; **Rissho University Landsat-9 analysis and University of Tokyo optical 3-D damage map shared through Sentinel Asia** (not on the public page); OCHA Bangkok supplied the two AOIs (Syabrubesi, Timure). [C] Reliability A.

---

## 11. NESRA FloodWatch  [C] — public bucket found

Page `nesraspace.org/floodwatch/rasuwa-2026/` updated **29 Aug 13:04 NPT**; Situation Brief #04 (28 Aug) EN/NE PDFs; "no downloadable GeoJSON/CSV/GeoTIFF listed; machine-readable data pending canonical artifact; contact EO desk". YIL drone orthomosaics: "post-processing underway, pending NESRA review" — **not released**.

However the EO dashboard (`npl-flood-dash-356251209726.europe-west1.run.app`) loads everything from a **public Google Cloud Storage bucket `gs://npl-flood-front`** (`https://storage.googleapis.com/npl-flood-front/<key>`, "URLs do not expire") [C]:

| Object | Size | Updated (UTC) | Content |
|---|---|---|---|
| `summary.json` | 6 KB | **29 Aug 12:12** | reach 101.6 km; floodway 11.61 km²; buildings_floodway **3,216** (2,293 OSM-confirmed); major road flooded 11.5 km (Pasang Lhamu Hwy 5.4 km); bridges intersecting **62**; channel measured 92.0 km / interpolated 5.6 / no-evidence 4.1 km; recall (held-out) 97 %, precision "not yet measured — upper bound"; fringe withdrawn; heights from GlobalBuildingAtlas |
| `flood_zones.geojson` (+ `_v1`) | 2.4 MB | 27 Aug 22:02 | **772 polygons**, props zone/area_m2 |
| `buildings_in_extent.geojson` | 1.4 MB | 29 Aug 12:12 | **3,216 polygons**: source, h_gba, footprint_m2, osm_sees, confirmed_status, confirmation_source |
| `bridges_to_inspect.geojson` | 17 KB | 27 Aug 22:30 | **62 lines** (footway 15, path 13, unclassified 13, primary 9…) with bridge_id/name/note |
| `roads_bridges_in_extent.geojson` | 231 KB | 27 Aug 22:30 | 416 lines |
| `cems_buildings.geojson` / `cems_roads.geojson` / `cems_areas.geojson` | 573 KB / 299 KB / 621 KB | 29 Aug 12:12 | EMSR927 graded buildings (3,207 pts, grade/aoi/matched_gba), 650 road segments, 7 AOI/event polygons |
| `station_widths.csv` | 113 KB | 27 Aug 22:02 | channel width per station |
| `cog/s2_pre.tif`, `cog/s2_post.tif`, `cog/s2_post_bright.tif`, `cog/s2_swir.tif` | 22–28 MB each | 28 Aug 00:03–00:06 | Sentinel-2 27 Aug (post) and pre COGs; XYZ tile sets `tiles/s2_{pre,post,post_bright,swir}[_annotated]/{z}/{x}/{y}.png` z8–14 |
| `flow_particles.json`, `constellation.json`, `basemap.json`, `index.html` | — | 28–29 Aug | dashboard config |

Licence not stated in the bucket (page credits Copernicus Sentinel-2 open policy; NESRA products "rapid analytical, not official"). Reliability B (methodology documented, precision unmeasured). **MISSED by baseline** (which recorded "data on request").

---

## 12. Code / data repositories (GitHub, Hugging Face, Zenodo, Kaggle)  [C]

**Hugging Face** — `hotosm/nepal_flood_2026` (CC-BY-4.0, modified 27 Aug 07:32): `upperstream/buildings.geojson|.parquet` **13,663 fAIr footprints** (dinov3l_upernet_hot on Esri imagery z18), H3 r8/r10 density layers, AOI (132.93 km², TM 62904). This is the public stand-in for the 403'd HDX `hot_flood_npl_buildings_fair`. Space `SujanBhattarai/nepal-flood-risk` (unverified). **MISSED.**

**Zenodo** — record **22147118** (Etienne Berthier, CNES/LEGOS, published **28 Aug 2026**, CC-BY-4.0): *"13 October 2019 Pléiades (CNES) pre-event DEMs for the rock-ice avalanche source area of the August 2026 Trishuli catastrophic flood"* — ASP/SGM DEMs at 2 m (93 MB, merged 93 MB, Cop30-filled 134 MB), 4 m (26 MB), 20 m (1.3 MB) + colourshade JPG. Pre-event reference surface for source-volume differencing. **MISSED.** No Kaggle dataset found.

**GitHub** (search `nepal flood 2026`, `rasuwa flood`, `trishuli flood`, `bhotekoshi`; pushed ≥ 27 Aug):

| Repo | What | Data / licence | Pushed |
|---|---|---|---|
| **geo-pera/bhotekoshi-2026-reconstruction** | Quantitative reconstruction: trimlines at 217 bank positions (flow heights median ~70 m, 40–134 m at border), superelevation velocities 37–52 m/s, stereo-parallax deposit thickness (10–18 m; ~12 Mm³), 1D/2D simulation calibrated on 611 sections, ~100 Mm³ (±40 %) trigger volume; blog `geopera.com/blog/bhote-koshi-flood-2026-satellite-analysis` (28 Aug) | Code MIT; data CC-BY-NC (inherited). Release **v1.0 zip 351.8 MB** (`…/releases/download/v1.0/bhotekoshi-2026-flood-data.zip`, 28 Aug 07:57): `dem/domain_8m_filled_ortho.tif`, `dem/dh_surface_32m.tif`, `masks/disturbance*.tif`, `measurements/{centerline_v3,trimline_profile*,superelevation_velocities,stereo_dh*}.csv`, `model/event_2d_8m_peak_eta.tif`, `scenario/breach_scenario_5Mm3_peak_{depth,eta}.tif`, `OBSERVATIONS.csv`, `COREGISTRATION.md`; 32 GB full archive on Google Drive | 29 Aug 09:41 |
| DBishal13/fflood-nep | Sentinel-1 change-detection pipeline (PC STAC plan + flood mask + exposure by municipality using `hot_flood_npl`) | Python, no licence | 28 Aug 20:55 |
| nirajbhusal/rasuwa-flood-bulletin | Live compiled bulletin; mirrors DHM Bhadra-10 sitrep, NDRRMA figures, EMSR927 stats, rescue lists (contains name-level lists — **do not extract**) | HTML | 29 Aug 17:05 |
| AIDMI-DataHub/readymapper-aidmi | CrisisReady ReadyMapper deployment "2026 Nepal Floods (Rasuwa & Nuwakot)": damage, flood extent, **mobility**, news-sources layer; bbox 84.9–85.85 E / 27.7–28.45 N; data bundled in `data/` (rate-limited, not listed) | Vue; live `aidmi-datahub.github.io/readymapper-aidmi/#/disaster?disasterId=2026-nepal-floods` | 29 Aug 13:37 |
| khalilurrrahmanridoykhan/nepal-flash-flood-dashboard | Evidence-led timeline map with public API (`/api/v1/events` GeoJSON/CSV, `/api/v1/sources/:id`, `/api/v1/versions`) | MIT | 29 Aug 08:39 |
| asoto59g/Nepal | HAND-based inundation estimate Rasuwagadhi→Bharatpur (181.4 km, ~17.4 km² valley + 11 km² run-up) and warning-time analysis (claims DHM SMS 38 min late at Betrawati/Trishuli/Devighat) — estimate, not delineation | HTML, embedded data | 29 Aug 13:33 |
| Surendra1204/trishuli-flood-2026 | Sentinel-2 before/after (12 Aug vs 27 Aug, 45RUL+45RUM) swipe | HTML | 28 Aug |
| iamtekson/rasuwa-flood | MapLibre portal with local GeoJSON layers (`iamtekson.github.io/rasuwa-flood/`) | JS | 28 Aug |
| aviskarrr/rasuwa-flood | "FIELDNOTE NEPAL/01" satellite dossier (Planet, Vantor, S2 COG decode in-browser) | JS; `rasuwa-flood.vercel.app` | 29 Aug 15:36 |
| studio-public-demos/nepal-flash-flood-digital-twin | CesiumJS 3-D replay using Planet STAC footprints and OSM centreline | JS | 29 Aug 15:33 |
| dulcetberg/nepal-flood-response-map | TM task grids + cloud-masked S2 composites | HTML | 29 Aug 04:20 |
| cgiovando/disaster-imagery-viewer | The federated viewer (catalog builder) | — | 29 Aug 16:08 |
| YasuhiroMurakami/NEPAL_20260826_FLOOD | JS, no README | — | 29 Aug 04:52 |
| others (stand-with-nepal, GurkhaShieldForce relief hub, kritagya93 board, b1nay missing-found, mayhem82 missing-person system, iyersamridhi routing, Zunkireelabs, rmsnea2082 NEA response system) | coordination / donation / missing-persons — outside this domain; several hold personal data | | 27–29 Aug |

---

## 13. Seismic record of the collapse  [C]

- USGS ComCat: **us7000tbwb** — M 5.2 (ms_vx) **Landslide**, 2026-08-26 **02:52:10 UTC** (08:37 NPT), 28.271 N 85.515 E, depth 0, "55 km NW of Kodari"; reviewed; products dyfi/origin/phase-data (no MT). **us7000tc90** — M 4.2 Landslide, **06:00:35 UTC** (11:45 NPT), same location — a second mass movement ~3 h later (matches the barrier-lake breach window).
- GFZ GEOFON: **gfz2026qrfy** Mw 5.69, 02:52:23 UTC, 28.3 N 85.5 E, type landslide.
- IRIS/EarthScope fdsnws was returning "Service Unavailable" at fetch time [U].
- USGS Landslide Hazards event page `usgs.gov/programs/landslide-hazards/science/2026-nepal-debris-avalanche-and-flash-flood` exists (JS-rendered; content [R]).
- Note the epicentre (85.515 E) vs ICIMOD/AntarcticGlaciers source coordinate 28.2853 N 85.5252 E (~1 km apart) and Soar Atlas view 28.2873 N 85.5250 E.

---

## 14. GDACS  [C]

Event **FL 1104124**, alert Orange (score 2), source GLOFAS, 26–28 Aug, modified 29 Aug 03:01 UTC, centroid 85.365 E 27.295 N (GloFAS reporting point, not the event). **GLIDE `FL-2026-000167-NPL`** — differs from `FF-2026-000162-NPL` used by ReliefWeb/Sentinel Asia/ADRC/NESRA: two GLIDE numbers are in circulation. APIs: `gdacs.org/gdacsapi/api/events/geteventdata?eventtype=FL&eventid=1104124`, polygon `…/polygons/getgeometry?…`, news/media feeds. Sendai fields (28 Aug 08:29): 165 deaths, 826 out of contact, 73 injured, 77 bridges destroyed, 1,552 rescued (stale). MISSED by baseline.

---

## 15. NASA / ESA / JRC / ICIMOD / SERVIR  

- NASA Disasters: no activation page found for this event; ARIA DPM: none found (the S1 DPM in circulation is EOS-RS via Sentinel Asia). NASA Earth Observatory image list through 28 Aug has no Nepal item [C]. NASA HMA 8 m DEM (2017) and Copernicus GLO-30 are used by third-party reconstructions [R]. GPM IMERG (half-hourly, Early run) and MODIS/VIIRS via Worldview — standard access, not event-specific [U-static].
- Copernicus/JRC: GloFAS is the GDACS source; EU Space "Image of the day" 27 Aug shows S2 12 Aug vs 27 Aug over Betrawati/Gerkhu [C].
- ICIMOD: still no downloadable 2026 layers. RDS datasets: "Glacial lakes in the Koshi, Gandaki and Karnali basins" (2015–16 Landsat, DOI 10.26066/RDS.1971946, CC-BY) and "Potentially dangerous glacial lakes" (RDS 1971950, CC-BY) — download via RDS login [C page/[U] download]. The 2025 Purepu-glacier supraglacial-lake outburst (8 Jul 2025, ~36 km upstream of Rasuwagadhi, ~5,150 m) was documented by DHM/ICIMOD [R].
- SERVIR/ICIMOD FIMT: no output seen for this event [U].

---

## 16. Chinese products  [R]

- CNSA emergency mechanism: first push 26 Aug 19:00 CST; by 27 Aug 17:00 CST **5 pre-event + 10 post-event scenes** delivered to NDRCC (MEM) and MWR Information Center. Not public.
- **PowerChina-1 (电建一号) X-band SAR**, 27 Aug 00:48 (CST), 3 m stripmap — first post-event radar over the Chinese side; interpretation: source ~10 km E of the port in Nepal's high snow/ice zone; "collapse → river blockage → dam break → debris flow" chain. Delivered to NDRCC; not open.
- MinoSpace "Dongpo" constellation optical+SAR emergency tasking [R].
- CASDC (National Cryosphere/Desert Data Center) ran an emergency data service for the **2025** Gyirong flood (24 datasets, 43 GB, `cms.casdc.cn/article/844`); no 2026 equivalent found [C-negative]. MNR 3-D model: not open. Baidu Baike event page 403.

---

## 17. Hydropower project GIS  [C partial]

- **nwrmap.info** (PEI/Ekbana) project pages with GIS portal `nwr-gis.ekbana.net`: Upper Trishuli-1 (216 MW, Dhunche/Haku; 9.8 km HRT, underground powerhouse), Upper Trishuli 3A (60 MW; 4,095 m tunnel), Upper Trishuli 3B (37 MW, Manakamana; 3.66 km HRT), Rasuwagadhi (111 MW, Thuman/Timure; 4,185 m HRT, COD 2020-02-19), Sanjen (42.5 MW, Chilime). Chilime and Langtang Khola pages error. No adit/portal coordinates exposed.
- **DoED** licence lists (`doed.gov.np/pages/clhydromorethan1`, `/powerplantsmorethan1`, survey licences) + Google-Sheet "License Performance Dashboard"; ArcGIS Experience hydropower licence map `experience.arcgis.com/experience/ce0d1f6b77214bc4b07a63e129757483` (licence rectangles). Environmental Study Report Database is internal.
- ADB UT-1 EIA/ESIA PDFs (`adb.org/sites/default/files/project-documents/49086/49086-001-eia-en.pdf`, `-esia-en.pdf`) complement the giwmscdntwo SEIA already catalogued.
- Verdict unchanged: portal/adit locations only in project drawings; no open GIS.

---

## 18. DEMs, LiDAR, building footprints, population, census

- **OpenTopography** catalogue API for the corridor bbox: **0 hosted datasets** (only global DEMs via the raster API) [C]. Survey Dept NSDI `nationalgeoportal.gov.np` — PDF local-unit maps; LiDAR availability unverified [U].
- Event-specific DEMs: Zenodo Pléiades 2019 (source area, §12); geo-pera `domain_8m_filled_ortho.tif` (HMA-based corridor DEM) and `dh_surface_32m.tif` [C]. Cartosat-1 2014 stereo exists in Sentinel Asia [R].
- **Microsoft Global ML Building Footprints** (Nepal release 2026-02-03, links dated 2026-02-23) [C]: level-9 quadkeys — **123131221** (34.9 MB) covers Rasuwagadhi→Syabrubesi→Dhunche→Betrawati→Bidur; **123131220** (24.2 MB) Galchhi; **123131222** (22.0 MB) Bharatpur. URL pattern `https://minedbuildings.z5.web.core.windows.net/global-buildings/2026-02-03/global-buildings.geojsonl/RegionName=Nepal/quadkey=<qk>/part-….csv.gz` (exact part filenames in `dataset-links.csv`).
- **Google Open Buildings v3**: computed S2 level-4 tokens **4c5** (corridor, incl. Kathmandu) and **4c3** (Bharatpur); `tiles.geojson` is no longer at the documented URL and guessed GCS object names returned 404 — resolve via the site's tile picker [U].
- **Overture**: via HOT exports (Overture layers in `hot_flood_npl`) and Microsoft AI for Good GPKG.
- **Population**: WorldPop, HRSL, Kontur, COD-PS (URLs §1); GHSL/LandScan not fetched [U].
- **Census 2021 ward data**: `censusnepal.cbs.gov.np` presents a TLS certificate for `hellosarkar-dev.bytepulseinnovation.com.np` and `/results/downloads/ward` returns 404 — the portal appears broken/moved as of 29 Aug [C-negative]. Microdata portal `microdata.nsonepal.gov.np` unverified [U].

---

## 19. Hydrology, weather, forecast  [C partial]

- **hydrology.gov.np station API is open**: `https://hydrology.gov.np/gss/api/station?type=river` returns 1,187 stations (46 MB JSON incl. parameter definitions). Corridor stations: **5611 "Trishuli at Furke Khola (Malekhu)"** 84.844 E 27.802 N (WL_I_10M); **66 "Tadi at Belkot"**; 339 Timure (manual met, 1,725 m); 391 Dhunche (climate); 341 Trisuli (climate); 342 Nuwakot AWS; 5514 Langtang-Lower snow station (85.570 E 28.192 N, 4,200 m: PCPN_1H/1D, snow depth, SWE) and 5512 GanjaLa snow (4,962 m); 369 Kyangjing. Observation endpoint `…/gss/api/observation?…` → "API keys required". DHM river-watch page lists Trishuli gauges Dhunche, Betrawati, Bhorle, Kali Khola, Galchi (data loaded client-side; baseline: Syabrubesi/Betrawati dead, Malekhu washed away).
- **BIPAD** open feeds: `bipadportal.gov.np/api/v1/river/?format=json` and `/api/v1/rain/?format=json` (per-station level vs warning/danger, `dataSource: hydrology.gov.np`) — sample records carried 2025 timestamps; check `waterLevelOn` freshness before use [C].
- MFD (`mfd.gov.np`) unreachable; DHM special-weather-bulletin page returned a stub. ECMWF open data (0.25°), Windy, Meteoblue for Dhunche/Langtang — standard, not verified [U].

---

## 20. ADS-B / helicopter tracking  [C snapshot]

OpenSky `states/all` over 84.3–85.9 E / 27.3–28.6 N at 17:03 and 17:08 UTC: only two airliners (RNA410 Nepal Airlines, THA309) on approach to Kathmandu; **no rotary traffic visible**. Nepal's helicopter fleet is largely not ADS-B-visible on community networks and evening sorties had ended; Flightradar24 blog on Nepal coverage returned 403; ADS-B Exchange historical needs a paid key. Verdict: **not usable to infer which settlements have been reached**; use Army/NDRRMA sortie logs instead.

---

## 21. Other pages checked

- ReliefWeb API (`api.reliefweb.int/v1/reports`) returned no `totalCount` for both POST and GET forms — request format issue, unresolved [U]; disaster page `reliefweb.int/disaster/ff-2026-000162-npl` fetch 403.
- PDC Hazard Brief (JS), SMCS 421 (JS), USGS page (JS), Copernicus storymap (JS), ADRC record page (cert error), Soar Atlas (403), nxtimagine Rasuwa map (7 points with coords, sources cited, no download, "last checked 29 Aug 22:35 NPT").
- CDSE note: OData `$filter` works without auth for catalogue search; product download needs a free account.

---

## NEW since baseline (after ~07:15 UTC / 13:00 NPT, 29 Aug)

1. **EMSR927 AOI04 Bharatpur**: Legion image acquired 29 Aug 04:01 UTC, product status "W" (in work), expected 17:01 UTC, **still not delivered at 17:19 UTC**; `EMSR927_products.zip` last-modified 29 Aug 02:57 (36.1 MB). HDX `npl-flood-emsr927` refreshed 10:46 UTC with AOI02 **v2** and AOI03.
2. **Sentinel-2C 29 Aug 04:47 UTC (R076, T45RUM + T45RUL)** — L1C and L2A on CDSE (processed 08:18 / 09:51 UTC). Third post-event optical pass; not yet on Planetary Computer.
3. **HOT TM lower-corridor projects 63235 (roads) and 63236 (buildings)** created 08:05–08:07 UTC, 17 % mapped by 17:17 UTC; upper buildings validation 27→28 %.
4. HOT S3/HDX refreshes: `hot_flood_npl` 16:08 UTC with new **Destroyed & Damaged Features** layer (16:03), **PMTiles** (16:03), TM boundaries (12:48), bridge-damage 59 pts (12:48), flood extent (13:29); destroyed_buildings (07:52); `hot_flood_npl_corridor` 14:01.
5. UNOSAT HDX datasets re-touched 09:47 UTC; UNOSAT ArcGIS web map modified 10:45 UTC.
6. OAM: Vantor LG06 pre-event scene uploaded 14:45 UTC (still no post-event drone orthos).
7. NESRA bucket `summary.json`, `buildings_in_extent`, `cems_*` refreshed 12:12 UTC; page 13:04 NPT.
8. Disaster-imagery-viewer catalog regenerated 17:08 UTC (129 scenes). GitHub activity 13:30–17:05 UTC (apilkc, nirajbhusal, dbaskota27, aviskarrr, studio-public-demos, AIDMI, asoto59g).
9. `npl-glide-events` (14:46) and `cerf-allocations-npl` (14:02) refreshed.
10. Live OSM counts (17:04 UTC): 1,873 Rasuwa / 7,393 Nuwakot buildings edited since 26 Aug; 1,958 damage-tagged features.

## MISSED by baseline (existed before the cutoff, not in the catalogue)

1. **NESRA's public GCS bucket `gs://npl-flood-front`** with flood_zones (772 polys), buildings_in_extent (3,216), bridges_to_inspect (62), roads_bridges_in_extent (416), EMSR-derived layers, station widths CSV, S2 pre/post/SWIR COGs + tiles, summary.json — baseline had "data on request".
2. **Pre-event drone orthomosaics on OAM** from NEA Engineering (Rasuwagadhi–Timure 3.5 cm, 1 Sep 2025; Simle–Betrawati 6 cm, 3 Sep 2025, CC-BY).
3. **Zenodo 22147118** — Pléiades tri-stereo 2019 DEMs (2/4/20 m) of the source area (Berthier, CC-BY, 28 Aug).
4. **geo-pera reconstruction dataset** (351.8 MB release: trimlines, velocities, stereo dh, 8 m DEM, 2-D peak-stage rasters, 5 Mm³ breach scenario) + 32 GB archive; CC-BY-NC.
5. **Hugging Face `hotosm/nepal_flood_2026`** — 13,663 fAIr footprints (the HDX `hot_flood_npl_buildings_fair` link is 403).
6. **Charter 1052 product-level detail**: 8 products; Pléiades Neo 3 (28 Aug) impact map Timure–Syabrubesi; Satellogic NewSat 27 Aug ×4 (Nuwakot/Bidur/Gerkhutar); ResourceSat 26 Aug; S2 14 Aug pre.
7. **EMSR927 internals**: AOI03 = BlackSky + Satellogic; AOI-level stats (Bidur 2,309/11,373 residential, 20/20 bridges, pop 4,400/25,000); activation totals 3,207 buildings / 46 km roads / 5,300 people; COG orthos + vector tiles in the viewer bucket; zip sizes and contents.
8. **Seismic catalogue IDs**: USGS us7000tbwb (M5.2, 02:52:10 UTC) and **second event us7000tc90 (M4.2, 06:00:35 UTC)**; GFZ gfz2026qrfy Mw 5.69.
9. **GDACS FL1104124** and the **dual GLIDE numbers** (FL-2026-000167-NPL vs FF-2026-000162-NPL).
10. **Sentinel Asia specifics**: EOR SA-00658; pre-event ALOS-2 (30 Jan 2026), Cartosat-1 2014 stereo, Resourcesat-2A Apr 2026; Rissho Univ Landsat-9 and U-Tokyo 3-D damage products shared via SA (ADRC report).
11. **DHM hydrology station API** (open station list with IDs/coords incl. Malekhu gauge 5611, Langtang snow station 5514) and **BIPAD river/rain feeds**.
12. Microsoft AI for Good's `opendata.aiforgood.ai` hosting the UNOSAT extent GeoJSON and S2 post tiles; HeiGIT ADM2 risk indicators regenerated 26–27 Aug.
13. Microsoft footprint quadkeys (123131221/220/222) and Open Buildings S2 tokens (4c5/4c3); HOT `vantor_composite_v3.tif` (1.73 GB), admin/open-space/police layers.
14. Chinese PowerChina-1 SAR (27 Aug 00:48, 3 m X-band) and CNSA 5+10 scene deliveries (all closed); CASDC 2025 precedent.
15. Pre-event S2 24 Aug R076 T45RUM at 38.6 % cloud (better than the 12 Aug baseline for the upper corridor).
16. Negative findings worth recording: OpenTopography has **no** corridor datasets; census portal is broken (bad TLS cert, 404); ADS-B shows no helicopters; no NASA activation/ARIA product; no Field-TM/DroneTM instance; no Kaggle dataset; no WFP ADAM/IOM DTM/Kontur event products.
