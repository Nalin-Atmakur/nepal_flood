# 07 — Data map: open vs gated

*As of 2026-08-29. Note this repo's `.gitignore` blocks CSV/JSON/GeoTIFF/etc. — pull these into object storage or a local scratch dir, not into git.*

| Asset | Access | What it gives | Notes |
|---|---|---|---|
| Vantor/Maxar open data | open | 9 post-event scenes 27–28 Aug at 0.35–0.39 m (WV-3) and ~0.5 m (WV-2, Legion); 4 pre-event incl. 0%-cloud Feb 2026 Legion | STAC: `vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json`; also OpenAerialMap; CC-BY-NC. Post-event 71–81% cloud — use the gaps. Keep border-strip products in official channels. |
| Planet crisis STAC | open | 24 scenes: PlanetScope 26/28 Aug, SkySat 0.8 m 27 Aug (Rasuwagadhi, Syabrubesi), Pelican 0.55 m 27 Aug | `source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26`; CC-BY-NC. PlanetScope 62–93% cloud, SkySat ~50%. |
| EMSR927 grading (Copernicus) | open | Building-level grading GeoPackages AOI01–03; WV-3 27 Aug input | HDX `npl-flood-emsr927`, CC-BY. Syabrubesi AOI: 240+ destroyed, 32 damaged. AOI04 pending. |
| UNOSAT FL20260826NPL | open | Mudflow extent (Rasuwa, Nuwakot) + impact assessment GDB/XLSX; ~5,000 buildings exposed; ArcGIS webmap | HDX, CC-BY-SA. Exposure, not damage. Population from WorldPop. |
| Sentinel-1 / Sentinel Asia SAR | open / requester-only | S1D asc orbit 85, 28 Aug 12:21 UTC (first post-event S1); EOS-04 SAR 26 Aug 11:39 UTC and EOS-RS S1 damage-proxy map via Sentinel Asia | Copernicus Data Space / Planetary Computer RTC. Sentinel Asia web-GIS only via DHM. Cloud-proof; beware layover/shadow. |
| Charter activation 1052 | PDFs open, imagery gated | 8 map products (pre/post, mudflow extent, Timure–Syabrubesi impact) | Underlying tasked imagery restricted; DHM/NDRRMA can request access. |
| HDX (HOT/NAXA) | open | OSM + Overture extracts, 27 Aug flood extent (31.7 km²), bridge-damage GeoJSON, helipads, fAIr footprints, fAIr damage scores over ~18 km² | ODbL / CC-BY. Damage layer unvalidated. Direct: `production-raw-data-api.s3.amazonaws.com/ISO3/NPL/combined/hot_flood_npl_flood_extent.geojson`. |
| Microsoft AI for Good exposure | open | Overture footprints + IHME population inside UNOSAT extent: 4,977 buildings, ~10,204 people; GPKG + population GeoTIFF | HDX `2026-nepal-flash-flood`, CC-BY. Ready-made prior for the island model. |
| NESRA FloodWatch / EO dashboard | open (data on request) | Exposure tables (3,216 buildings, 62 bridges), cloud gaps, YIL drone orthomosaics (pending) | Ask NESRA/YIL directly. No drone imagery on OpenAerialMap yet. |
| BIPAD incident API | open | `bipadportal.gov.np/api/v1/incident/?incident_on__gt=2026-08-26T00:00:00&format=json&limit=300` → point, wards, hazard (11 = Flood, 26 = GLOF, 3 = Avalanche), loss, verified flag | Government incident system of record; bilingual. **Caveat:** as of 29 Aug it holds only peripheral Dhading/Gorkha points — the Rasuwa/Nuwakot mass-casualty records are not in it yet. `bipad.gov.np` now redirects to ndrrma.gov.np. |
| DHM River Watch | open | hydrology.gov.np — Trishuli at Galchhi, Devghat live | Syabrubesi and Betrawati gauges dead; Malekhu/Furke washed away. Flood hotline 1155. |
| Census 2021 ward data | open | Baseline population per ward (Rasuwa 46,689) | censusnepal.cbs.gov.np; microdata at microdata.nsonepal.gov.np. |
| DEMs | open | Copernicus GLO-30, ALOS AW3D30, SRTM | No open LiDAR for Rasuwa found. Survey Dept NSDI portal content unverified. |
| Corridor reference points | volunteer-derived, unverified | Source ~28.440 N 85.443 E (~5,000 m); blockage 28.305/85.402; Rasuwagadhi 28.276/85.377; Timure 28.235/85.373; Syabrubesi 28.162/85.334; Betrawati 27.966/85.183; Devighat 27.905/85.135 | From a volunteer site "from reporting and imagery" — verify against imagery before use. |
| Independent trackers | open | JSON APIs of dead/missing/rescued by district | Unverified; one input to #2, never truth. |
| IPPAN / NEA hydropower rosters | gated | Headcount per project and shift; contractor nationality lists | Via NDRRMA/Army tunnel-rescue cell or IPPAN. Portal/adit coordinates may only exist in project drawings. |
| e-TIMS + Langtang NP permits | gated | Trekker, guide, agency, route, emergency contact; checkpoint timestamps (patchy — paper fallback when power fails) | tims.ntb.gov.np; via NTB/TAAN/Tourist Police. Agencies' "real-time trekker tracking" claims are marketing. |
| MoFA ERT / NTB / Police lists | gated | Foreigner intake (WhatsApp), agency manifests, district intake forms | MoFA is the one-door for foreigners (emergency@mofa.gov.np); embassies go through it, not the Army. Hotlines: NTB 1234 / Tourist Police 1144 / NEOC 1149 / Police 1155. |
| NTC / Ncell cell records | legal request | Last attach before event, first re-attach since; SMS blast | NDRRMA → NTA → operators. Precedent: Flowminder–Ncell 2015 (aggregate only, pre-signed MoU). |
| Garmin inReach / Zoleo / iPhone SOS | via providers | Last position of any foreign trekker carrying one | Ask embassies/operators for device IDs; Garmin Response routed SOS to Nepal in 2015 (50+ devices active). High precision, low effort. |
| OpenCelliD | open | Tower locations | Rural Rasuwa density thin (untested). |
| Teahouse registers | paper | Who slept where on 25 Aug | Only recoverable by people on the ground. |
