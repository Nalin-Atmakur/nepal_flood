# Sources

*Generated from `sources.yaml` (registry version 2026-08-29) by `docs/gen_sources_md.py` on 2026-08-30. Do not edit by hand — edit `sources.yaml` and re-run.*

60 sources. 10 carry personal data (`pii` true or mixed) and are processed in memory to counts and place distributions; their rows are never written to RAW or DERIVED tables. This site is volunteer-run and not an official source; every figure on it links back to the row below it came from.

## By group

| Group | Count | Default reliability |
|---|---|---|
| government | 25 | A |
| humanitarian | 4 | A |
| geospatial | 13 | B |
| signals | 5 | A |
| news | 8 | C |
| community | 5 | D |

Reliability grades: A official / machine-readable · B official or wire, hand-checked · C credible, unverified · D raw or duplicated. Per-source overrides live in `db/seed/gen_sources.py`.

## Columns

| Column | Meaning |
|---|---|
| id | stable slug; also the normaliser filename `pipeline/normalisers/<id>.py` and the `sources.id` row |
| group / grade | as seeded into `sources.grp` / `sources.reliability` |
| url | endpoint or page; `{…}` marks a templated part; lists are polled in turn |
| cadence | poll interval the scheduler honours (`pipeline/docs/pull_external_data/02-scheduling.md`) |
| pii | registry value verbatim: `true`, `false`, `mixed`, or a note |
| holds | what the source contains, one line |
| catalogue | row in `../aryaa_research_general/11-data-catalogue-2026-08-29.md` |
| verified | 2026-08-29 fetch status: C confirmed · R reported · U unconfirmed |

## JSON APIs (`json_api`) — 22

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `opmcm_stats` | government / A | `https://rescue.opmcm.gov.np/api/stats` | 30m | false | totals — persons lost/found/rescued, last24h, withoutContact, help requests/offers | A1 | C |
| `opmcm_person_reports` | government / D | `https://rescue.opmcm.gov.np/api/person-reports?type={lost\|found\|rescued}&limit=200&page={n}` | 60m | true | person reports with fullName, locationText, daoOffice, source, status, createdAt | A1 | C |
| `opmcm_help_requests` | government / A | `https://rescue.opmcm.gov.np/api/help-requests?page={n}&limit=200` | 60m | true | geocoded help requests (problemType, affectedCount, urgency, district/municipality/ward, Point) | A1 | 2026-08-30 (227 requests, 2 pages) |
| `opmcm_government_efforts` | government / A | `https://rescue.opmcm.gov.np/api/government-efforts` | 6h | false | official notices mirrored from nepal.gov.np | A1 | 2026-08-30 (94 notices) |
| `ndrrma_rescues` | government / A | `https://ndrrma.gov.np/api/v1/rescues/{rescued-persons/?limit=500&offset={n} \| status-counts/ \| rescued-statistics/ \| rescued-locations/ \| stationed-locations/}` | 30m | true | named rescued register; counts; 21 rescue sites + 11 stationing sites with centroids | A2 / B3 | C |
| `ndrrma_publications` | government / A | `https://ndrrma.gov.np/api/v1/publication/publications/?ordering=-id&limit=40` | 30m | mixed | numbered Situation Reports (Canva PDFs, text-extractable) + morning situation updates (scanned, OCR) + lists (PII) | A16 / A17 | C |
| `ndrrma_newsinfo` | government / A | `https://ndrrma.gov.np/api/v1/pressnotenews/newsinfo/?ordering=-id&limit=40` | 2h | false | dated official news cards | A18 | C |
| `ndrrma_bulletins` | government / A | `https://ndrrma.gov.np/api/v1/bulletin/bulletins/?ordering=-id&limit=5` | daily | false | Daily Disaster Bulletin (national incident table) | A16 | C |
| `ifrc_go` | humanitarian / A | `https://goadmin.ifrc.org/api/v2/event/8073/` | 6h | false | event, appeal MDRNP022, field reports | A28 | C |
| `gdacs_event` | humanitarian / A | `https://www.gdacs.org/gdacsapi/api/events/geteventdata?eventtype=FL&eventid=1104124` | 6h | false | event metadata, Sendai fields, GLIDE FL-2026-000167-NPL (note second GLIDE FF-2026-000162-NPL elsewhere) | E7 | C |
| `bipad_river_stations` | government / A | `https://bipadportal.gov.np/api/v1/river-stations/?limit=1000` | 10m | false | live DHM gauge mirror — level, warning/danger, timestamp, camera image URL | B2 | C |
| `bipad_river_series` | government / A | `https://bipadportal.gov.np/api/v1/river/?station=171&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=74&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=49&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=137&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=79&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=105&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=281&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=261&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=67&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=25&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60`<br>`https://bipadportal.gov.np/api/v1/river/?station=35&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60` | 60m | false | hydrograph per corridor station — BIPAD station ids 171 Rasuwagadi, 74 Bhote Koshi@Syabrubesi, 49 Langtang@Syabrubesi, 137 Betrawati, 79 Phalakhu, 105 Dhunche, 281 Galchi, 261 Malekhu, 67 Kali Khola, 25 Devghat, 35 Bhorle; newest 60 readings each | B2 | 2026-08-30 (station filter + ordering=-water_level_on work; the unfiltered endpoint is stuck on 26 Aug) |
| `dhm_weather` | government / A | `https://dhm.gov.np/mfd/api/{three-days-forecast-latest\|country-forecast\|weather\|mountain/all-info}` | 2/day (08:00, 18:00 NPT) | false | official 3-day forecast, heavy-rain warnings by province | E1 | C |
| `openmeteo_corridor` | signals / B | `https://api.open-meteo.com/v1/forecast?latitude=28.11&longitude=85.30&hourly=precipitation,cloud_cover_low&models=ecmwf_ifs025` | 6h | false | hourly precip + low cloud → flying windows | E2 | C |
| `dor_rimes_bridges` | government / A | `https://navigate-dor-api.rimes.int/Bridge_api/getAllBridges` | static (fetch once) | false | national bridge inventory — join key for "bridges lost" claims | B8 | 2026-08-30 (2,135 bridges) |
| `hdx_search` | geospatial / B | `https://data.humdata.org/api/3/action/package_search?q=nepal&sort=metadata_modified%20desc&rows=50` | 60m | false | every HDX dataset touching the event (HOT, UNOSAT, EMSR927, Microsoft, HeiGIT, GLIDE) | C1–C13 | C |
| `emsr927_dashboard` | geospatial / B | `https://mapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR927` | 60m | false | AOI list, product versions/status, stats; products zip at https://rapidmapping.emergency.copernicus.eu/backend/EMSR927/EMSR927_products.zip (GET only) | C1 | C |
| `oam_bbox` | geospatial / B | `https://api.openaerialmap.org/meta?bbox=84.3,27.5,85.9,28.6&order_by=uploaded_at&sort=desc` | 6h | contact/user fields hold a name + e-mail — never read | drone/satellite uploads — watch for first post-event drone orthomosaic | D7 / D8 | C |
| `cdse_catalogue` | geospatial / B | `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=Collection/Name eq 'SENTINEL-2' and OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((85.0 27.85,85.55 27.85,85.55 28.45,85.0 28.45,85.0 27.85))') and ContentDate/Start gt 2026-08-26T00:00:00.000Z` | 6h | false | new S1/S2 acquisitions over the corridor | D3–D5 | 2026-08-30 (12 S2 products) |
| `hot_tasking_manager` | geospatial / B | `https://tasking-manager-production-api.hotosm.org/api/v2/projects/?campaign=2026%20Nepal%20Floods` | 60m | false | mapping/validation progress per project (63069, 63102, 63235, 63236) | C2 | C |
| `gdelt_monitor` | news / D | `https://api.gdeltproject.org/api/v2/doc/doc?query=Rasuwa%20flood&mode=artlist&maxrecords=100&timespan=1d&format=json` | 2h | false | volume monitor + Nepali-outlet discovery (onlinekhabar/ratopati/ekantipur); misses KP/THT | F24 | 2026-08-30 (one 67 s answer, one timeout) |
| `bipad_incidents` | government / A | `https://bipadportal.gov.np/api/v1/incident/?incident_on__gt=2026-08-25T00:00:00&limit=500&expand=loss&ordering=-incident_on` | 60m | false | NEOC incident/loss records (dead/missing/injured/families/houses per ward) — the Bhote Koshi event is NOT entered yet (30 Aug); wired for when it is | W4-2 | 2026-08-30 |

## POST APIs (`post_api`) — 2

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `dhm_riverwatch_post` | government / A | `https://dhm.gov.np/site/riverWatchTableViewData` | 10m | false | same as river-stations, direct from DHM (no coordinates; silent stations have no timestamp) | B2 | C |
| `china_search_apis` | government / C | `https://api.thepaper.cn/search/web/news`<br>`http://search.people.cn/search-platform/front/search` | 2h | some headlines name officers | Tibet-side coverage (the only side with Gyirong counts) | F23 | C |

## RSS feeds (`rss`) — 5

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `reliefweb_rss` | humanitarian / A | `https://reliefweb.int/updates/rss.xml?search=rasuwa` | 60m | false | UN RCO flash updates, OCHA/IOM/WFP/IFRC/NRCS sitreps, UNOSAT maps | A25 | C |
| `ntc_restoration_articles` | signals / B | `(derived from outlet_rss_* sources)` | 60m | false | site-by-site telecom restoration — best reached/unreached proxy | B1 | R |
| `outlet_rss_set` | news / B | `https://www.onlinekhabar.com/feed`<br>`https://english.onlinekhabar.com/feed`<br>`https://kathmandupost.com/rss`<br>`https://english.khabarhub.com/feed/`<br>`https://risingnepaldaily.com/rss`<br>`https://english.nepalnews.com/rss`<br>`https://radionepalonline.com/en/feed/`<br>`https://english.ratopati.com/rss`<br>`https://annapurnapost.com/rss`<br>`https://gorkhapatraonline.com/rss`<br>`https://newsofnepal.com/feed/`<br>`https://feeds.bbci.co.uk/nepali/rss.xml`<br>`https://nepalitimes.com/feed` | 30m | some articles name individuals — extract place/count/status only | Nepali + English news stream; headlines encode place+count+status | F12–F17 | C |
| `google_news_site_queries` | news / C | `https://news.google.com/rss/search?q=site:kathmandupost.com+flood+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:thehimalayantimes.com+flood+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:myrepublica.nagariknetwork.com+flood+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:ekantipur.com+%E0%A4%AC%E0%A4%BE%E0%A4%A2%E0%A5%80+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:setopati.com+%E0%A4%AC%E0%A4%BE%E0%A4%A2%E0%A5%80+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:nagariknews.nagariknetwork.com+%E0%A4%AC%E0%A4%BE%E0%A4%A2%E0%A5%80+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:english.news.cn+Nepal+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:globaltimes.cn+Nepal+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:apnews.com+Nepal+flood+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:theguardian.com+Nepal+flood+when:2d&hl=en&gl=US&ceid=US:en`<br>`https://news.google.com/rss/search?q=site:aljazeera.com+Nepal+flood+when:2d&hl=en&gl=US&ceid=US:en` | 60m | false | enumerator for non-RSS outlets (KP, THT, Republica, ekantipur, Setopati, Nagarik, Xinhua EN, Global Times, AP, Guardian, AJ) | F24 | C |
| `outlet_rss_set_2` | news / C | `https://www.icimod.org/feed/`<br>`https://inseconline.org/en/feed`<br>`https://radionepalonline.com/feed/`<br>`https://www.khabarhub.com/feed/`<br>`https://www.setopati.com/feed`<br>`https://www.himalkhabar.com/feed`<br>`https://deshsanchar.com/feed` | 60m | false | ICIMOD (cause/warning), INSEC (rights monitor — missing by home district), Radio Nepal NE, Khabarhub NE, Setopati NE, Himal, Deshsanchar | W4-3 | 2026-08-30 |

## HTML pages (`html`) — 19

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `setu_recordlist` | government / B | `https://setu.ndrrma.gov.np/admin/recordlist.php` | 2h | true | NDRRMA family-intake records (missing/found/safe/rescued) | A3 | C |
| `police_udb` | government / A | `https://udb.nepalpolice.gov.np/{dead-bodies-lists\|missing\|found}?province_id=&district_id=&date_from=2026-08-26`<br>`https://udb.nepalpolice.gov.np/dead-bodies-lists?province_id=3&district_id={23\|27\|28\|29\|30\|31\|35}&date_from=2026-08-26`<br>`https://udb.nepalpolice.gov.np/dead-bodies-lists?province_id=4&district_id={36\|37\|38\|40\|77}&date_from=2026-08-26`<br>`https://udb.nepalpolice.gov.np/dead-bodies-lists?province_id=5&district_id={48}&date_from=2026-08-26` | daily | true | unidentified bodies (photo, sex, place found), missing, found | A4 / A20 | C |
| `mofa_flashflood` | government / A | `https://mofa.gov.np/category/flashflood/` | daily | false | bodies + foreigner nationality table (total/found/missing per country) | A21 | C |
| `heoc_sitreps` | government / A | `https://heoc.mohp.gov.np/news` | daily | false | health-sector sitrep (treated/referred/deaths in care, facility damage) | A24 | C |
| `dao_rasuwa_hub` | government / A | `https://daorasuwa.moha.gov.np/page/bha-ta-ka-sha-b-dha-bha-tha-ra` | daily | mixed | district notices, treatment list (PII) | A23 | C |
| `dao_nuwakot_rescued` | government / A | `https://daonuwakot.moha.gov.np/post/ma-ta-bha-tha-ra-gata-sama-ma-utha-tha-ra-gara-eka-va-yaka-ta-hara-ka-va-varanae` | daily | true | rescued persons (~1,436) + rescued foreigners (~170) with rescue location | A22 | C |
| `china_mwr` | government / A | `http://www.mwr.gov.cn/xw/slyw/` | 6h | false | barrier-lake consultations, response levels, new upstream risks | A27 / E6 | C |
| `china_mfa_pressers` | government / A | `https://www.mfa.gov.cn/eng/xw/fyrbt/lxjzh/` | daily | false | Tibet-side statements, Chinese nationals missing | A27 | C |
| `us_embassy_alerts` | government / A | `https://np.usembassy.gov/category/alert/` | daily | false | English road/hazard status, citizen guidance | A29 | C |
| `outlet_tag_pages` | news / C | `https://kathmandupost.com/tags/rasuwa-flood?page={n}`<br>`https://kathmandupost.com/tags/bhotekoshi-flood?page={n}`<br>`https://thehimalayantimes.com/tag/rasuwa-flood?page={n}`<br>`https://english.onlinekhabar.com/tag/rasuwa-flood/page/{n}`<br>`https://gorkhapatraonline.com/categories/bhotekoshi-fast-flood?page={n}`<br>`https://inseconline.org/?s=भोटेकोशी` | 60m | some | back-catalogue and outlets without feeds | F12, F15–F17 | 2026-08-30 (KP 2 tags, THT, Onlinekhabar EN, Gorkhapatra, INSEC) |
| `ekantipur_live` | news / C | `https://ekantipur.com/news/2026/08/26/17877170054081721.html`<br>`https://ekantipur.com/` | 30m | headlines sometimes name individuals | richest Nepali per-place stream (Timure 48×, Dhunche 27×…) | F14 | C |
| `live_blogs` | news / B | `https://www.bbc.com/news/live/cr0qxd1y219kt`<br>`https://www.cnn.com/2026/08/28/world/live-news/nepal-china-flood`<br>`https://www.nbcnews.com/world/live-blog/live-updates-massive-flash-flood-nepal-tibet-border-hundreds-missing-rcna594833`<br>`https://www.theguardian.com/world/live/2026/aug/29/nepal-tibet-floods-latest-updates-death-toll-missing-search-and-rescue`<br>`https://www.abc.net.au/news/2026-08-29/death-toll-rises-as-rescuers-work-through-flood-devastation/107092742` | 60m | false | timestamped official quotes | F19 | C |
| `nrcs_situation_updates` | community / D | `https://nrcs.org/` | 6h | false | Nepal Red Cross situation updates 1–3 + press release — relief, hospital beds, warehouses, personnel quoted from NDRRMA | W4-1 | 2026-08-30 |
| `reliefweb_reports` | humanitarian / A | `https://reliefweb.int/updates/rss.xml?search=rasuwa` | 60m | false | full text of OCHA flash updates, UN RC/HCT sitreps, WFP/IOM/WVI/NRCS updates (per-district and per-site numbers) | W4-4 | 2026-08-30 |
| `dao_downstream_hubs` | government / A | `https://daodhading.moha.gov.np/`<br>`https://daochitwan.moha.gov.np/`<br>`https://daogorkha.moha.gov.np/` | daily | mixed | DAO Dhading / Chitwan / Gorkha homepages — same CMS as DAO Rasuwa; no flood posts found on 30 Aug | W4-5 | false |
| `ntc_news` | signals / A | `https://ntc.net.np/news` | 6h | false | NTC tower-restoration notices (the primary source behind ntc_restoration_articles) | W4-6 | false |
| `moha_notices` | community / D | `https://moha.gov.np/` | daily | false | MoHA notices (only the unclaimed-bodies management directive is flood-related so far) | W4-7 | false |
| `nea_notices` | community / D | `https://www.nea.org.np/notices` | daily | false | NEA outage/restoration notices | W4-8 | false |
| `ippan_statements` | community / D | `https://www.ippan.org.np/` | daily | false | IPPAN (hydropower producers) — "934 unaccounted across 11 projects" reached the press, nothing published on the site | W4-9 | false |

## S3 buckets and raw file hosts (`s3`) — 5

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `volunteer_bulletin_repo` | community / C | `https://api.github.com/repos/nirajbhusal/rasuwa-flood-bulletin/contents/`<br>`https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/ndrrma-rescue.csv`<br>`https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/army-heli-rescue.csv`<br>`https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/rasuwa-foreign-rescued.csv`<br>`https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/rasuwa-hospital-dhunche.csv`<br>`https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/dhm-rivers.json` | 60m | true | normalised copies of official lists + family registry; 716-commit history of list changes | A8 | C |
| `hot_bridge_damage` | geospatial / B | `https://production-raw-data-api.s3.amazonaws.com/ISO3/NPL/combined/hot_flood_npl_bridge_damage.geojson` | 60m | false | 59 bridge points with status | B6 | C |
| `hot_s3_listing` | geospatial / B | `https://production-raw-data-api.s3.amazonaws.com/?list-type=2&prefix=ISO3/NPL/` | 60m | false | flood extent, destroyed features, helipads, health, police, admin, TM boundaries, Vantor mosaic | C2 | C |
| `microsoft_unosat_extent` | geospatial / B | `https://opendata.aiforgood.ai/damage-assessment/data/unosat_damage_area.geojson` | daily | false | UNOSAT impacted-area polygon (37 km²) | C6 / C8 | 2026-08-30 (1 polygon, 37.4 km²) |
| `hf_fair_footprints` | geospatial / B | `https://huggingface.co/api/datasets/hotosm/nepal_flood_2026` | daily | false | 13,663 fAIr footprints (HDX copy is 403) | C5 | 2026-08-30 |

## Google Cloud Storage buckets (`gcs`) — 2

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `nesra_bridges` | geospatial / B | `https://storage.googleapis.com/npl-flood-front/bridges_to_inspect.geojson` | 6h | false | 62 bridges intersecting flood path | B7 | 2026-08-30 |
| `nesra_bucket` | geospatial / B | `https://storage.googleapis.com/npl-flood-front/{summary.json\|bridges_to_inspect.geojson\|buildings_in_extent.geojson}` | 6h | false | NESRA FloodWatch analytical layers (3,216 buildings, 772 flood polygons) | C7 | C |

## STAC catalogues (`stac`) — 2

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `vantor_stac` | geospatial / B | `https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json` | 6h | false | 13 VHR scenes (0.35–0.58 m) | D1 | 2026-08-30 (13 items) |
| `planet_stac` | geospatial / B | `https://data.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/catalog.json` | 6h | false | 24 scenes (PlanetScope, SkySat 0.8 m, Pelican 0.55 m) | D2 | 2026-08-30 |

## FDSN seismic services (`fdsn`) — 2

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `usgs_fdsn` | signals / A | `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-08-25&latitude=28.3&longitude=85.5&maxradiuskm=100&minmagnitude=2.5` | 60m | false | landslide-type events (us7000tbwb M5.2 02:52Z; us7000tc90 M4.2 06:00Z) — a new one = a new collapse/breach | E5 | C |
| `geofon_fdsn` | signals / A | `https://geofon.gfz.de/fdsnws/event/1/query?format=text&starttime=2026-08-25&latitude=28.3&longitude=85.5&maxradius=1&minmagnitude=3` | 60m | false | independent confirmation of USGS events (gfz2026qrfy Mw 5.69 landslide) | E5 | C |

## MediaWiki APIs (`mediawiki`) — 1

| id | group / grade | url | cadence | pii | holds | catalogue | verified |
|---|---|---|---|---|---|---|---|
| `wikipedia_revisions` | news / C | `https://en.wikipedia.org/w/api.php?action=query&prop=revisions\|extlinks&titles=2026_Nepal_floods&rvlimit=50&rvprop=ids\|timestamp\|size&ellimit=500&format=json`<br>`https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=2026_Nepal_floods&rvslots=main&rvprop=ids\|timestamp\|content&rvlimit=1&format=json` | 60m | false | curated timeline; 174 external links as crawl seeds; revision stream as change detector | F25 | C |

## Held data (not pollable)

Listed in `sources.yaml` as a trailing comment and in the catalogue §I: DHM observation API key; NDRRMA/NTA consolidated tower-restoration table; Army daily sortie log; helicopter operators' GPS logs; NEA feeder restoration log; ICIMOD/MWR lake level series; NTB/TAAN agency manifests; Garmin/Zoleo aggregate device counts; NTC/Ncell last-attach aggregates per tower. Request through the government channel; when one arrives, add it to `sources.yaml` and re-run this script.
