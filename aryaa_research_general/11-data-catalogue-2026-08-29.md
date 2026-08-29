# 11 — Data catalogue: everything publicly available, as of 29 Aug 2026 (~23:30 NPT)

*Five parallel internet sweeps (crowd/bottom-up · geospatial · signals · official · text corpora), ~525 web searches and ~800 direct fetches/API calls, 17:00–19:00 UTC. Built on top of [07-data-map.md](07-data-map.md) and `research/60-ai-and-satellite-approaches/live-data-sources.md`; rows here are either NEW or carry new access detail. Raw sweep reports (denser, with every URL) are in [agent-reports/](agent-reports/).*

**Legend.** Rel = reliability A official/space agency/wire · B established org or media of record · C other media/community · D social/blog · E unverifiable. Fetch = **[C]** confirmed by a direct fetch in the sweep (counts are real) · **[R]** reported by a secondary source · **[U]** unconfirmed. PII = holds names/phones/photos of affected people — **consume counts and places only; never mirror rows into this repo** (D2).

**Read this first.** The single most important finding: the Nepali government *is* aggregating person records at scale, on three surfaces, and two of them have open JSON APIs. Every private list circulating (eTurboNews, found.kachhuwa, agency blogs) is downstream of these. The aggregation problem is not "collect"; it is "reconcile and surface".

---

## A. Person / status registries (who is lost, found, rescued, and where)

| # | Source | Holds | Access | Cadence | Size (as of 29 Aug) | Rel / Fetch | PII |
|---|---|---|---|---|---|---|---|
| A1 | **OPMCM Rasuwa Flood Rescue Portal** — `rescue.opmcm.gov.np` | Person reports (lost/found/rescued) with free-text location, photo, DAO provenance; help requests (geocoded); help offers; govt notices; emergency contacts | **Open JSON API, no key**: `/api/stats`, `/api/person-reports?type=lost\|found\|rescued&limit=&page=` (≤200/page — photos inlined), `/api/help-requests`, `/api/help-offers`, `/api/government-efforts`, `/api/emergency-contacts` | Live (count moved 10,787→10,792 in 15 min) | **13,353 persons: 10,792 lost / 2,447 found / 1,716 rescued**; 4,723 added last 24 h; 6,050 without contact; 224 help requests; 105 offers | A [C] | **Y** |
| A2 | **NDRRMA rescued-persons register** — `ndrrma.gov.np/np/rescue` | Named rescued with `rescued_location` + `stationed_location`; 21 rescue sites and 11 stationing sites **with centroids** (no PII) | **Open DRF REST, no key**: `ndrrma.gov.np/api/v1/rescues/{rescued-persons/,rescued-locations/,stationed-locations/,status-counts/,rescued-statistics/,statuses/,messages/}` `?limit=&offset=` | Live | 2,189 named (2,034 NP / 155 foreign); headline `rescued_count` 6,633 | A [C] | Y (persons); **N** (locations) |
| A3 | **Setu Rapid** — `setu.ndrrma.gov.np` | NDRRMA's family intake (missing-person forms, relief needs, per-person situation fields); public record list | Scrapeable PHP HTML (`admin/recordlist.php`); no API; no auth on read | Live | ~1,500 forms by 28 Aug (OnlineKhabar); public list ~193 missing / 8 found / 8 safe | A [C] | Y |
| A4 | **Nepal Police UDB** — `udb.nepalpolice.gov.np/{disaster,missing,found,dead-bodies-lists}` | Unidentified bodies (photo, sex, *place found*), missing, found — Rasuwa section | HTML, 20 rows/page, **reachable from outside Nepal** (corrects earlier note) | Live | Police 29 Aug evening: 669 bodies; 393 unidentified (28 Aug) | A [C] | **Y** — aggregate + place-found only |
| A5 | Nepal Police HQ Facebook lists — `facebook.com/NepalPolicePHQ` | Missing-persons lists by nationality (27 Aug); QR → UDB | **Login-walled**; use republications (NEPYORK 65 US; NST 23→51 MY; Pardafas 27 police) | Ad hoc | — | A [R] | Y |
| A6 | **Nepal Tourism Board** — `@nepaltourismb` on X; tallies via Tourist Police | Missing-tourist situation updates (agency-wise counts as images) | Per-tweet JSON via `cdn.syndication.twimg.com/tweet-result?id=<id>&token=a` (no auth); ntb.gov.np does **not** carry lists | ~daily | 384 (26 Aug) → 668/34 countries (27 Aug) → **261 rescued / 320 out of contact** (29 Aug 18:00) | A [C] | images list individuals |
| A7 | MoFA Emergency Control Room — `mofa.gov.np/content/1863` | Foreigner intake via email/WhatsApp; no web form, no list | Notice only; `emergency@mofa.gov.np`, +977-9744441227/-228 | Daily-ish | 27 Aug 20:00: 627 foreigners affected, 596 missing, 31 found | A [C] | — |
| A8 | **Volunteer bulletin repo** — `github.com/nirajbhusal/rasuwa-flood-bulletin` (+ GitHub Pages) | Normalised CSV/JSON of NDRRMA list, Army-heli rescues, foreign rescued, Indians crossed, Dhunche hospital list, DHM gauges, EMSR927 grading, and a family registry fed by two Google Sheets + Forms; **716 commits = full history of list changes** | `raw.githubusercontent.com` (unlimited, no key) | Continuous (latest 29 Aug 21:56 NPT) | ndrrma 2,189 · heli 654 · foreign 152+54 · Indians-crossed 149 · hospital 81 · family.json 1,423 missing / 42 found | C (compiles A) [C] | **Y** |
| A9 | found.kachhuwa.com — repo `b1nay/missing-found-rasuwa-flood` | 7-language search over A8's `family.json`; report/found/safe buttons → WhatsApp | Static; data = A8 | With A8 | Same as A8 | C [C] | Y |
| A10 | Trekking/pilgrimage operator statements (12 operators) | Group size, composition, **exact place + time on 26 Aug** (Rasuwagadhi/Gyirong immigration 07:00–09:15) | Company pages + press (Himalayan Glacier, Leaf, Trekkers' Society/Isha, Samrat, Kailash Journeys, Fishtail, Alpine Eco, Kathmandu Holiday, Dream Tibet, Richa, Explore Vacation, Kumbakonam agency) | One-off | e.g. 89 / 71 / 55 / 47 / 27 / 17 per group; Isha 80 in Gyirong immigration building; 28 Vizag safe | B [C]/[R] | group-level |
| A11 | Hydropower operators / IPPAN / NEA | Per-project headcounts (UT-1, UT-3/3A/3B, Rasuwagadhi, Chilime, Langtang Khola, Mailung) | Press statements; IPPAN "list" (29 Aug, Ratopati, 403) | Daily | IPPAN 934 across 11 projects; UT-1 9 Koreans + 76 Andritz; UT-3 128 unaccounted after 85 rescued; Rasuwagadhi 49; Chilime 8; Langtang Khola 42 | B [R] | — |
| A12 | Embassy / consular counts (IN, US, AU, UK, CA, KR, CN, MY, SG, UA, RU, DE) | Nationality-level denominators + intake channels (Canada WhatsApp/Signal; India state control rooms; Karnataka SEOC compiling) | Statements/press | Daily | IN ~287–320 / US ~90 / UK 33 / AU 39 / CA 30 / MY 49 / UA 56 / KR 9 / SG 9 | A/B [C]/[R] | — |
| A13 | Telegram `t.me/poshuknepal` (Ukrainian relatives) | Family-run channel for 56 missing (groups of 47 + 7) | `t.me/s/` preview blocked here; use Telethon with a user account | Live | ~4,359 members | D [C] | Y |
| A14 | Hospital/morgue boards (TUTH, Trauma Center, Bharatpur, Pokhara PAHS, Dhunche) | Physical photo boards; police desk registered >1,000 relatives by 27 Aug; Bharatpur 137→~200 bodies; Pokhara 93 | Physical; QR → A4 | — | — | B [C] | Y (physical) |
| A15 | ⚠️ eTurboNews private table; Kritagya SAR board (open Firestore, test mode); rescuenepal.info (pivoted to "Dead Body Mapping") | Cautionary exhibits — E-grade, PII leaks, unadopted | Do not link, mirror, or amplify | — | 655 rows / unknown / 3 | E | Y |

### A′. Official bulletins, lists and documents (the canonical figure sources)

| # | Source | Holds | Access | Cadence | State (as of 29 Aug) | Rel / Fetch | PII |
|---|---|---|---|---|---|---|---|
| A16 | **NDRRMA publications API** — `ndrrma.gov.np/api/v1/publication/publications/?ordering=-id&limit=80` | Every sitrep / list / notice as JSON with direct PDF URL (`ndrrma.gov.np/mediafiles/publications/…`). Two sitrep series: numbered **Sitrep #4–#8** (Canva PDFs, Nepali, **text-extractable**: bodies by district, missing sub-categories, rescued, 16-facility health table, shelters, relief stocks, road status, barrier-lake note) and 1-page morning "Situation updates" (**scanned images — OCR**) | Open JSON, no key; poll every 30 min | 2–4/day (anchors ~10:00 and ~18:30 NPT) | 17 event records (ids 370–388) since 27 Aug; **Sitrep #8 (29 Aug 18:30): 675 bodies, 2,498 out of contact; shelters Nuwakot 15 sites/2,318, Rasuwa 12/1,270** | A [C] | lists are PII (see A17) |
| A17 | NDRRMA event list PDFs (via A16) | Missing Nepali + foreign nationals 26 Aug (id 373, ~700–800 rows, **passport numbers**); air-evacuated Nepalis (383, 20 pp); DAO Rasuwa rescued (381, scanned); DAO Nuwakot rescued (380, 24 pp); rescued foreigners (384); injured to Kathmandu (377, **phones**); mobilisation-team roster (374, institutional) | Open PDF | Ad hoc | — | A [C] | **Y — metadata only** |
| A18 | NDRRMA newsinfo — `…/api/v1/pressnotenews/newsinfo/?ordering=-id` | Dated news cards (relief allocations, Army tunnel team, flood-risk warning, relief collection points, private-heli coordination) | Open JSON | Daily | 235 cards; event items #231–235 | A [C] | N |
| A19 | NDRRMA VMS — `vms.ndrrma.gov.np/api/` | Volunteer statistics (open); volunteer/job endpoints 401; historic incident DB (46k, to Nov 2024) | Partly open | Not updated for event | 1,717 volunteers | A [C] | N |
| A20 | **Nepal Police UDB counts** (A4, filter 26–30 Aug via `GET /get-district/{province}`) | Per-district body records | HTML scrape (`curl -k`, self-signed cert) | Continuous | **558 body records since 26 Aug** (baseline 26 in prior 25 days): Nawalparasi E 211, Tanahun 67, Nawalparasi W 45, Gorkha 43, Nuwakot 38, Dhading 25, Rasuwa 5; only 44 missing notices — police missing lists are **not** funnelled here | A [C] | counts only |
| A21 | **MoFA daily flash-flood updates** — `mofa.gov.np/category/flashflood/` | Bodies + foreigner nationality table (found/missing per country) | HTML (28 Aug: **machine-readable table**; 29 Aug: PNG image) | Daily 15:30–20:00 | 28 Aug 15:30: 632 foreigners / 121 found / 511 missing (IN 178/85/93, CN 100/16/84, US 68/2/66, UA 53, MY 51, AU 35, UK 33, CA 25, KR 9/9/0…) | A [C] | N |
| A22 | **DAO Nuwakot rescued XLSX** — `daonuwakot.moha.gov.np/post/…` | Sheet 1 rescued persons (~1,436 rows: date, name, gender, age, address, rescue location); sheet 2 rescued foreigners (~170 rows, incl. phones) | Open XLSX + PDF | Ad hoc | Posted 13 Bhadra | A [C] | **Y — metadata only** |
| A23 | DAO Rasuwa flood hub — `daorasuwa.moha.gov.np/page/bha-ta-ka-sha-b-dha-bha-tha-ra` | Notices (scanned PDFs), treatment list (scanned, PII) | Open | Ad hoc | — | A [C] | Y |
| A24 | HEOC / MoHP SitReps 01–04 — `heoc.mohp.gov.np/news/sitrep…/detail` | Health-sector sitreps: treated/referred/deaths in care, facility damage | **Body is a base64 JPEG — OCR required** | Daily | 4 sitreps 27–29 Aug | A [C] | N |
| A25 | UN RCO Nepal Flash Update #3 (ReliefWeb PDF, 9 pp text) | **NEOC/MoHA** figures (539 dead / 977 missing / 3,742 rescued / 12,249 personnel / 15 heli, 28 Aug); shelter capacities; sector needs | Open PDF (site needs browser UA; API blocked) | ~daily (#1–2 not online) | — | A [C] | N |
| A26 | Bagmati Province OCMCM — `ocmcm.bagamati.gov.np` items #371–375 | Provincial statements/communiqués | Image/attachment — manual read | Ad hoc | 4 items | A [C] | N |
| A27 | China: **MWR rolling barrier-lake bulletins** (`mwr.gov.cn/xw/slyw/202608/t20260827_2140605.html`, `t20260830_2140823.html`…) + MFA pressers (`mfa.gov.cn/eng/xw/fyrbt/lxjzh/…`) + CGTN/Xinhua official-figure articles | Lake name (Purepu Tsangpo 普热普强藏布), Level-IV response, **new upstream "Cuojian river impact-crater chain risk"** (29 Aug); Tibet-side 3 dead / 558 missing / 2 rescued (27 Aug) | HTML zh/en, scrapeable | ~daily | — | A/B [C] | N |
| A28 | IFRC GO — `goadmin.ifrc.org/api/v2/event/8073/` | Event, **Appeal MDRNP022** (CHF 18 M in GO vs 25 M in press; 28,000 beneficiaries), field report 18558 | Open JSON | As updated | — | A [C] | N |
| A29 | Consular alert pages: US Embassy `np.usembassy.gov/category/alert/` (×5, incl. 29 Aug road/lake status — use curl, not fetch), UK `gov.uk/foreign-travel-advice/nepal` (28 Aug), Canada `travel.gc.ca` (27 Aug) | English road/hazard status; citizen guidance | HTML | ~daily | — | A [C] | N |

**Official figure chain (keep the source label on every number — definitions differ):** MoFA 26 Aug 17:00 72 dead / 403 missing → NDRRMA #5 27 Aug 157 / 826 → NEOC via UN FU#3 28 Aug **539 / 977 / 3,742 rescued** → NDRRMA #7 28 Aug 19:00 579 / 1,924 / 4,451 → Police 29 Aug 14:00 626 / 2,426 → **NDRRMA #8 29 Aug 18:30 675 / 2,498** → DoT 29 Aug 17:30 753 tourists (589 foreign). NEOC "missing" (977) ≠ NDRRMA "out of contact" (2,498) ≠ MoFA "foreigners missing" (511) ≠ DoT "tourists out of contact" (753) ≠ OPMCM "open lost" (10,792).

**Reconciliation flags found in the data (this is where LLM work pays):** OPMCM `last24h 4,723` — most volume arrived 29 Aug via DAO bulk imports; a 100-row sample was 64 % `source=dao`, 62 % **DAO Sindhupalchok** with addresses in *Bhotekoshi Rural Municipality* wards 2–5 — a name collision with the *Bhote Koshi river* (Rasuwa) or legitimately displaced Kerung-route workers; must be resolved before any count. Divergent headline counts on the same day: NDRRMA missing 2,426 (14:00) · bulletin 2,498 (18:30) · OPMCM open-lost 10,792 (17:20) · Setu ~1,500 forms · Police confirmed 977 (28 Aug) · NTB tourists out of contact 320.

---

## B. Place-status signals (which places have been reached / can be reached)

| # | Source | Holds | Access | Cadence | State (as of 29 Aug) | Rel / Fetch | Use |
|---|---|---|---|---|---|---|---|
| B1 | **NTC / Ncell site-by-site restoration** (via ICTFrame, NepalNews, Khabarhub, OnlineKhabar) | Named towers restored with ward + date; a restored site = physically reached + phones can register | Prose; scrape daily | Daily | NTC 80/120 sites; Ncell 18/27; **restored:** Langtang, Kyanjin (27 Aug), Goljung→Syabrubesi, Gerkhu→Bidur, Trishuli-3A→Betrawati, Tupche (29 Aug); **still down:** "Timure hill" | B [R] | **Best reached/unreached proxy** |
| B2 | **DHM River Watch** — three machine-readable routes: (i) `POST dhm.gov.np/site/riverWatchTableViewData` (no body) → JSON for 332 stations; (ii) JS-embedded array in `dhm.gov.np/hydrology/river-watch`; (iii) **BIPAD live mirror `bipadportal.gov.np/api/v1/river-stations/?limit=1000`** (281 stations, modified 29 Aug 22:45, incl. camera image URLs). Station catalogue `hydrology.gov.np/gss/api/station` (1,187 stations); observations endpoint needs API key; per-series history POST is blocked headless → use **BIPAD `/api/v1/river/?water_level_on__gt=2026-08-26`** (10-min series; **pre-collapse hydrograph retrievable**) | Open, no key; snapshot saved `agent-reports/riverwatch_snapshot_2026-08-29.json` | 5–10 min | **Dead** (last 26 Aug 08:40–09:20): Rasuwagadhi 1.62 m, Bhote Koshi@Syabrubesi 3.80 m, Langtang Khola@Syabrubesi, Trishuli@Betrawati 3.549 m, Phalakhu@Betrawati; **Malekhu 10.48 m above danger at 11:40 then dead**. **Alive:** Dhunche (Trishuli Khola), **Galchhi**, Kali Khola, Devghat — all rising 29 Aug | A [C] | Galchhi is the first live sensor for any second surge (~1.5–2 h after Betrawati) |
| B3 | NDRRMA `stationed-locations/` + `rescued-locations/` (A2) | Where rescued people are held now; where they were picked up — with centroids | Open JSON | Live | 11 stationing / 21 rescue sites | A [C] | Clean "safe and where" layer, no PII |
| B4 | Nepal Army / NDRRMA evacuation breakdowns by pickup site | Timure, Syabrubesi, Mailung, Dhunche, Betrawati, Trishuli counts | Press | Daily | 2,101 airlifted incl. 163 foreigners (28 Aug cum.); NDRRMA 29 Aug: 4,451 rescued, 2,265 by air | B [R] | Proves LZs used; no negative evidence |
| B5 | Police UDB "place found" + district body counts (A4) | Where search/recovery has worked | HTML | Daily | Chitwan 248 · Nawalpur 158 · Parasi 75 · Gorkha 54 · Dhading 49 · Nuwakot 41 · Tanahun 31 · Rasuwa 13 | A [C] | Aggregate only |
| B6 | **HOT bridge-damage GeoJSON** — `production-raw-data-api.s3.amazonaws.com/ISO3/NPL/combined/hot_flood_npl_bridge_damage.geojson` | 59 bridge points with status ("Washed out"…), name, length, P-codes | Open S3, no key | Daily | 59 pts (29 Aug 12:48 UTC) | B [C] | Reachability graph cuts |
| B7 | **NESRA `bridges_to_inspect.geojson`** (see C7) | 62 bridge lines intersecting the flood path | Open GCS | Event | 62 | B [C] | Reachability |
| B8 | DoR Navigate — backend is **RIMES `navigate-dor-api.rimes.int`** (open GET JSON): `Bridge_api/getAllBridges` (**2,135-bridge inventory** with coords, 26 in Rasuwa/Nuwakot — join key for "bridges lost" claims); `Road_safety_api/*` ECMWF rainfall advisories by district (29 Aug: Bagmati ids 17/26/27 "very_high"); **road closures are Excel-imported with no public read endpoint** | Open JSON | Static / daily | Road status only via NDRRMA #8 text (Prithvi Hwy Mugling–Malekhu both lanes; Malekhu–Galchhi one lane; Dhunche small vehicles) and US Embassy alerts | A [C] | Bridge inventory; closures not machine-readable |
| B9 | Open ADS-B (OpenSky, adsb.lol, adsb.fi) | Helicopter tracks | Open | Live | **Dead end — proven:** full 28-Aug adsb.lol archive (4.15 GB, 56 M positions): 21 Nepal aircraft, all fixed-wing; **zero helicopters, zero points <9,000 ft in the corridor**. No CAAN mandate; Army doesn't broadcast | A [C] | Do not use; ask operators for GPS logs via NDRRMA |

---

## C. Geospatial damage / exposure layers

| # | Source | Holds | Access | Last update | Size | Rel / Fetch | New? |
|---|---|---|---|---|---|---|---|
| C1 | **Copernicus EMSR927** — dashboard API `mapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR927`; `rapidmapping.emergency.copernicus.eu/backend/EMSR927/EMSR927_products.zip` | Human-graded buildings/roads/bridges per AOI (GPKG/SHP/XLSX/PDF); VHR orthos served as COGs + vector tiles in the viewer bucket | Open, no auth (GET; HEAD 405) | AOI01 v1 · **AOI02 v2** · AOI03 v1 (29 Aug 02:57 UTC) · **AOI04 Bharatpur in work** (Legion 29 Aug 04:01, undelivered at 17:19 UTC) | zip 36.1 MB; totals 3,207 buildings / 46 km roads / 5,300 pop; Bidur 2,309/11,373 residential, 20/20 bridges | A [C] | AOI04 pending; COG paths new |
| C2 | HOT `hot_flood_npl` (HDX) + S3 `ISO3/NPL/…` | OSM+Overture layers, flood extent (27 Aug), bridge damage, **Destroyed & Damaged Features (new)**, **PMTiles all-layers (new)**, helipads, health, police, TM boundaries, Vantor mosaic 1.73 GB | Open S3 listing (`list-type=2`), no key | 29 Aug 16:08 UTC (daily) | 203 resources | B [C] | Yes |
| C3 | HOT `hot_flood_npl_corridor` (HDX) | Same layers, 1 km corridor Rasuwagadhi→Devghat | Open | 29 Aug 14:01 | 89 resources | B [C] | Refresh |
| C4 | HOT fAIr damage (HDX `hot_flood_npl_buildings_damage`) | AI damage class per building, ~18 km² | Open | 28 Aug 09:45 | 366 KB | B [C] | — |
| C5 | **fAIr footprints — Hugging Face `hotosm/nepal_flood_2026`** | 13,663 footprints (HDX copy `hot_flood_npl_buildings_fair` is **403**) | Open, CC-BY | 27 Aug | GeoJSON/Parquet | B [C] | Missed by baseline |
| C6 | UNOSAT FL20260826NPL (products 4256–4259) | Mudflow extents Rasuwa/Nuwakot; impact GDB (~37 km², ~120 km roads, ~5,000 buildings); pop exposure XLSX | `unosat.org/static/unosat_filesystem/<id>/`; ArcGIS web map `acd4770e1f9943cfbcfdd11d6b60ccf2` | 29 Aug 09:47 | GDB 187 KB… | A [C] | — |
| C7 | **NESRA FloodWatch — public GCS bucket `gs://npl-flood-front`** (`storage.googleapis.com/npl-flood-front/<key>`) | `flood_zones.geojson` (772 polys), `buildings_in_extent.geojson` (**3,216**), `bridges_to_inspect` (62), `roads_bridges_in_extent` (416), `cems_buildings/roads/areas`, `station_widths.csv`, S2 pre/post/SWIR COGs + XYZ tiles, `summary.json` | Open, URLs "do not expire" — **contradicts page's "data on request"** | 29 Aug 12:12 UTC | 2.4 MB / 1.4 MB / 17 KB / COGs 22–28 MB | B [C] | **Missed by baseline** |
| C8 | Microsoft AI for Good (HDX `2026-nepal-flash-flood`; `opendata.aiforgood.ai`) | Overture footprints × IHME pop inside UNOSAT extent; UNOSAT polygon mirror; S2 post tiles | Open | 28 Aug 06:24 | 4,977 buildings / ~10,204 people; GPKG 165 MB | B [C] | — |
| C9 | **geo-pera reconstruction** — `github.com/geo-pera/bhotekoshi-2026-reconstruction` release v1.0 | Trimlines (217 bank positions, flow heights ~70 m), velocities 37–52 m/s, **stereo-parallax deposit thickness 10–18 m (~12 Mm³)**, 8 m DEM, 2-D peak-stage rasters, 5 Mm³ breach scenario | Open zip 352 MB (+32 GB Drive); MIT/CC-BY-NC | 28 Aug | — | C [C] | Missed — largely answers the elevation-differencing plan |
| C10 | **Zenodo 22147118** (Berthier, CNES) | Pléiades 2019 tri-stereo pre-event DEMs of the source area, 2/4/20 m | Open, CC-BY | 28 Aug | 93–134 MB | A [C] | Missed |
| C11 | HeiGIT GAIA risk indicators (HDX) | ADM2 flood exposure, evacuability, access, facilities — regenerated 26–27 Aug | Open CSV | 28 Aug | ×8 | B [C] | Missed |
| C12 | Microsoft Global ML Buildings (Nepal 2026-02-03) | Quadkeys **123131221** (corridor, 35 MB), 123131220 (Galchhi), 123131222 (Bharatpur) | Open csv.gz | Feb 2026 | — | B [C] | Tile IDs new |
| C13 | Reference: OCHA COD-AB v02 (775 ADM3), COD-PS 2023, WorldPop 2020 constrained (2.3 MB), Meta HRSL 2018–19, Kontur 400 m, GLIDE events, healthsites | Static | Open | — | — | A/B [C] | — |
| C14 | Census 2021 ward data — `censusnepal.cbs.gov.np` | Ward population | **Broken** (bad TLS cert, 404) as of 29 Aug | — | — | [C]-negative | Use COD-PS / bulletin mirror |

---

## D. Imagery

| # | Source | Scenes | Access | Newest | Cloud | Rel / Fetch | New? |
|---|---|---|---|---|---|---|---|
| D1 | Vantor open data — `vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json` | 13 (9 post 27–28 Aug WV-3/WV-2/Legion 0.35–0.58 m; 4 pre incl. **0 %-cloud Legion 5 Feb 2026**) | STAC + COG, CC-BY-NC; no stereo metadata beyond `view:off_nadir` (27 Aug WV-3 at 9.1° vs 21.7°/26.6° used as pseudo-stereo by C9) | 28 Aug 05:22 UTC | 71–81 % post | A [C] | Unchanged |
| D2 | Planet — `data.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/catalog.json` | 24 (PlanetScope 26/28 Aug; SkySat 0.8 m 27 Aug ×2; Pelican 0.55 m ×3; pre 27 May) | STAC + GeoParquet index; S3 `--no-sign-request`; CC-BY-NC | 28 Aug 05:01 | 50–93 %; Pelican `clear_percent` unreliable | A [C] | Unchanged |
| D3 | **Sentinel-2C 29 Aug 04:47 UTC** (R076, T45RUM + T45RUL) | Third post-event optical pass | CDSE L1C + L2A (free account); not yet on Planetary Computer | 29 Aug | not read | A [C] | **New** |
| D4 | Sentinel-2 earlier: 27 Aug S2B (54–86 % cloud); pre 24 Aug R076 T45RUM **38.6 %** (best recent pre) | — | CDSE / PC | — | — | A [C] | Pre-scene new |
| D5 | Sentinel-1: `S1D_IW_GRDH_1SDV_20260828T122141…` asc orbit 85 (GRD, SLC, RTC on PC); pre 24 Aug desc orbit 19 | First post-event S1 | CDSE / PC | 28 Aug 12:21 | n/a | A [C] | Next desc ~31 Aug / 5 Sep |
| D6 | Landsat-9 26 Aug 04:47 (paths 141/40–41, 47–68 % cloud) | ~2 h after collapse | PC | 26 Aug | — | A [C] | — |
| D7 | **OpenAerialMap pre-event drone orthos — NEA Engineering** ("Rasuwagadhi–Timure" 3.5 cm, 1 Sep 2025; "Simle–Betrawati" 6 cm, 3 Sep 2025) | Best pre-event baseline for those reaches | `api.openaerialmap.org/meta?bbox=…`; CC-BY | Sept 2025 | 0 | A [C] | **Missed by baseline** |
| D8 | OpenAerialMap post-event drone orthomosaics | **None uploaded** as of 17:20 UTC; YIL orthos "pending NESRA review" | — | — | — | [C]-negative | Watch |
| D9 | International Charter 1052 | 8 products (PDF/JPG): Pléiades Neo 3 **28 Aug** Timure–Syabrubesi; Satellogic NewSat 27 Aug ×4; ResourceSat 26 Aug | Products open; imagery gated to DHM/NDRRMA | 28 Aug 13:38 | — | A [C] | Sensor detail new |
| D10 | Sentinel Asia SA-00658 | EOS-04 SAR 26 Aug; EOS-RS S1 damage-proxy KMZ; pre ALOS-2, **Cartosat-1 2014 stereo** (DEM source); Rissho/U-Tokyo products via ADRC | Public VAPs; web-GIS requester-only | 28 Aug | — | A [C] | — |
| D11 | Chinese: PowerChina-1 X-band SAR 3 m (27 Aug), CNSA 5 pre + 10 post scenes | Closed (delivered to NDRCC/MWR) | — | — | — | B [R] | — |
| D12 | Federated viewer — `cgiovando.github.io/disaster-imagery-viewer/nepal-floods-2026/` (`data/nepal-floods-2026.catalog.json`) | 129 scenes indexed; regenerated 29 Aug 17:08 UTC | Open | Live | — | C [C] | — |

---

## E. Hazard, hydrology, weather, seismic

| # | Source | Holds | Access | Cadence | State (as of 29 Aug) | Rel / Fetch |
|---|---|---|---|---|---|---|
| E1 | **DHM MFD weather API** — `dhm.gov.np/mfd/api/{three-days-forecast-latest,country-forecast,weather,mountain/all-info}` | 3-day bulletin + maps; country text; 19 synoptic stations; mountain-level winds/temps | Open JSON, no key | 08:00 & 18:00 NPT | 29 Aug 18:00: heavy rain "at one or two places" Bagmati/Gandaki hills & mountains, both days | A [C] |
| E2 | Open-Meteo (ECMWF 0.25°) Dhunche 28.11/85.30; Langtang 28.21/85.51 | Hourly precip / low cloud | Open JSON | 4×/day | Dhunche 11–23 mm/day to 4 Sep; clearest 05–07 NPT; Langtang low cloud <40 % 06–11 h on 29–30 Aug and 3–4 Sep, **none 31 Aug–1 Sep** (worst flying days) | B [C] |
| E3 | VNKT METAR (aviationweather.gov) | Kathmandu obs | Open | 30 min | 29 Aug: CB all quadrants from 06:30 Z, TSRA 12:30 Z | A [C] |
| E4 | BIPAD `bipadportal.gov.np/api/v1/` (120+ endpoints; `count` field is buggy int64-max — page via `next`) | `river-stations/` **live** (see B2); `river/` 10-min history; `rain-stations/` partly live (Kakani 71.6 mm/24 h @ 29 Aug); `rain/` stale (Jan 2025); `incident/` **still lacks the event** (96 records nationally since 26 Aug; only peripheral Dhading/Gorkha points + one "High Altitude" at Gosaikunda-4); `alert/` has no barrier-lake object; `citizen-report/` has ~10 duplicate "missing guide" posts **with names/phones — do not ingest raw** | Open | 10 min | — | A [C] |
| E5 | **USGS ComCat** `us7000tbwb` (M 5.2, *type landslide*, 02:52:10 UTC, 28.271 N 85.515 E) · `us7000tc90` (M 4.2, **06:00:35 UTC** — second mass movement ~3 h later) · GEOFON `gfz2026qrfy` Mw 5.69 | Event records, phase data | Open FDSN JSON | — | NEMRC seismonepal.gov.np has **no entry** | A [C] |
| E6 | Barrier lake (Chinese side) — MWR bulletins (A27) + MNR/AP | Volume/area/risk statements only — **no numeric time series public anywhere** | MWR HTML (zh) + press | ~daily | 27 Aug ~2.0 Mm³ overflowing, peak expected 1 Sep; 28 Aug >2.5 Mm³, level −10 m; 29 Aug area 120,000→99,000 m²; **second larger body >120,000 m² at collapse site, depth unknown**; MWR 29 Aug names a new upstream "impact-crater chain risk"; 3 seismometers + 15-person team on site. Nepal side: NDRRMA #7 lake ~0.11 km² ~18 km above Rasuwagadhi (27 Aug 11:44 imagery) | A/B [C]/[R] |
| E7 | GDACS FL **1104124** (Orange) — `gdacs.org/gdacsapi/api/events/geteventdata?eventtype=FL&eventid=1104124` | Event metadata, polygons, Sendai fields (stale) | Open | — | **Two GLIDE numbers in circulation:** GDACS `FL-2026-000167-NPL` vs ReliefWeb/Sentinel Asia `FF-2026-000162-NPL` | A [C] |
| E8 | Google Flood Hub / GloFAS | Riverine forecasts | Key/waitlist; JS-only | Daily | Not useful for a dam-breach surge; gauge IDs not enumerable without key | B [U] |
| E9 | NASA Black Marble (tile h26v06) | VNP46A1 nightly radiance exists to 28 Aug; corrected VNP46A2 lags ~8 days (latest 21 Aug) | Earthdata login | Nightly | Cloud-limited; only useful for Bidur/Dhunche-size "lights back on" | B [C] |
| E10 | NEA grid status | Substation/line damage and restoration (Trishuli-3B hub destroyed; 431 MW off; Nuwakot partial restoration 29 Aug) | Press; no LDC feed | Daily | Weak proxy | B [R] |

---

## F. Text, social, crowd (for an LLM extraction corpus)

| # | Source | Holds | Access route | Volume | Lang | Rel / Fetch | PII |
|---|---|---|---|---|---|---|---|
| F1 | Survivor first-person accounts in press (KP "Moments from death" 29 Aug ×7; OnlineKhabar 27 Aug; The National; ThePrint; Tribune; CNN; ifeng ZH; ABC/AP) | Micro-location detail: Timure market, Betrawati truck queue, Mailung UT-1 camp, Trishuli Bazar, Gyirong queue; **UT-1 workers got an SMS ~30 s before the wave** | Fetchable HTML (KP, OnlineKhabar, The National, ABC, CNN OK; Ratopati, ANI, ThePrint, NBC **403**) | ~25–30 accounts | EN/NE/ZH | B [C] | some name victims — extract place/count only |
| F2 | X / Twitter | NTB updates, embassy notices, republished lists, engagement accounts; hashtags #NepalFloods #RasuwaFlood #BhotekoshiFlood #Kailash | Per-tweet: `cdn.syndication.twimg.com/tweet-result?id=&token=a` (no auth). Search: paid API (Basic $100/mo, 10k tweets) or logged-in browser; oembed → 402 | Thousands/day (unmeasured) | EN/NE/HI | A–D [C] | mixed |
| F3 | Reddit r/Nepal, r/NepalSocial, r/india | Specific threads: Devighat HPP families, UT-3B update, missing-poster translation, "narrow escape", helpline compilations, ethics of body photos | `reddit.com/r/<sub>/search.rss?q=…&sort=new&t=week` with browser UA (~1 req/2 s); `.json` and old.reddit blocked | ~60 threads/week | EN | D [C] | some |
| F4 | Facebook (Police HQ, NDRRMA, Trekking In Nepal, NGES/HOT mapping post, community pages) | Primary lists + appeals | **Blocked** (302→login); Graph API needs app review → use republications | Unknown (unindexed) | NE/EN | A–D [R] | Y |
| F5 | Telegram (A13) | Ukrainian families | Telethon user account | 4.3k members | UK/RU | D [C] | Y |
| F6 | YouTube (News18, Nepali live streams, CNN survivor video, Army tunnel footage) | Survivor interviews, press briefings | Data API v3 (free key, 10k units/day) | ~10 known IDs | NE/EN/HI | C [R] | — |
| F7 | Instagram / TikTok / Weibo / WeChat / Douyin | Appeals; AI fakes; Tibet-side content being deleted | Login-walled / censored → **not viable** | — | — | [U] | — |
| F8 | Independent trackers: NxtImagine `nepaldisasterupdatelive.nxtimaginelabs.com` (+`/feed.xml`); rasuwaflood.org (`data/archive.json`, 154 news items, 3-hourly); nepal-flood-map.pages.dev (PMTiles daily); ReadyMapper AIDMI; `khalilurrrahmanridoykhan/nepal-flash-flood-dashboard` (`/api/v1/events` GeoJSON) | Sourced timelines, counts, news index | HTML/RSS/JSON, open | — | EN/NE/HI/ZH | C [C] | N |
| F9 | Wikipedia EN `2026_Nepal_floods` (+ NE, ZH, separate "2026 Nuwakot Flood") | Consolidated counts + revision history | MediaWiki API | Hourly edits | EN/NE/ZH | C [C] | N |
| F10 | GitHub — ~30 repos pushed 27–29 Aug (search `nepal flood 2026`, `rasuwa`, `bhotekoshi`) | Bulletins, maps, S1 pipelines, HAND inundation estimate (asoto59g), reconciliation schema (mayhem82), routing tool (iyersamridhi) | `api.github.com` 10 req/min unauth (use token); raw unlimited | — | — | C–D [C] | several hold names — flagged |
| F11 | Fact-check desks (Lead Stories, AAP, BOOM, Factly, AFP, VERA, Fact Crescendo) | ~15 debunked items: AI videos (SynthID), recycled Atami 2021 / Uttarakhand 2025 / Alaska GLOF / Chamoli footage; HAARP conspiracy | Open | — | EN | B [C] | — |
| F12 | **Kathmandu Post** — tags `/tags/rasuwa-flood`, `/tags/bhotekoshi-flood` (`?page=N`); `kathmandupost.com/rss` (40 items) | Richest English settlement narratives; per-project tunnel counts; per-hospital | Plain HTML, no paywall; Google News `site:` → 100 | ~50–60 articles | EN | A- [C] · place-detail **5/5** | some named survivors |
| F13 | **Onlinekhabar Nepali + English** — `onlinekhabar.com/feed` (**55 items, 44 event — highest-volume feed found**), `english.onlinekhabar.com/feed` (20); tag pages `/tag/rasuwa-flood` | Ward-level Betrawati/Timure pieces; shed head-counts at Timure (100–200 / 150–200 / 50–60); 898 missing by hydropower project; home-district missing counts | WordPress, plain HTML | ~120–150 NP + 60–80 EN | NE/EN | B [C] · **5/5** | some |
| F14 | **ekantipur (Kantipur)** — live page `ekantipur.com/news/2026/08/26/17877170054081721.html` (364 timestamped sub-headlines: Timure 48×, Dhunche 27×, Rasuwagadhi 17×, Syabrubesi 13×, Mailung 13×) + homepage | District-reporter datelines (Timure, Dhunche, Haku, Mailung, Gosaikunda, Galchhi, Betrawati) | Plain HTML; **no RSS** → Google News `site:ekantipur.com बाढी` (100) or GDELT | ~80–120 | NE | A-/B+ [C] · **5/5** | headlines sometimes name individuals |
| F15 | Other Nepali-language outlets — Setopati (homepage 67 links), Nagarik (71), Ratopati (94; `english.ratopati.com/rss` 30), Annapurna Post (`/rss` 20), Gorkhapatra (**category page `/categories/bhotekoshi-fast-flood`** + `/rss`), newsofnepal (`/feed`), Nepalpress (`?s=रसुवा` → 186), Nepalkhabar, Thahakhabar, Imagekhabar, Kantipur TV, BBC Nepali (`feeds.bbci.co.uk/nepali/rss.xml`, 33 items; explainer on why counts conflict `articles/ce302w7e889o`), Ujyaalo (body JS-only) | **Missing people by home district** (Rolpa, Sindhupalchok 234, Morang 15, Madhesh 22, Kailali 23, Makwanpur 65) — a "who" dimension no international source has; tunnel-op status; mass-burial reporting | HTML (browser UA); several without RSS | ~40–100 each | NE | B [C] · 3–4/5 | some (DAO lists → PII) |
| F16 | **INSEC Online** — `inseconline.org/?s=भोटेकोशी` (19-item running series) | Careful per-home-district and per-hospital counts | HTML | 19+ | NE | B [C] · 4/5 | DAO list link |
| F17 | Other Nepali EN outlets — Himalayan Times (tags, 25/page; no RSS), Republica (pages OK; feed 403), Setopati EN, Khabarhub (`/feed/`), Rising Nepal (`/rss`), Nepalnews (`/rss`), Radio Nepal (`?s=` + `/feed/`), Nepali Times (`/feed`; Reporter's Diary from Betrawati), Record, Himal | Security-force missing breakdown; tunnel ops; NTC restorations; Army tallies | HTML/RSS | ~15–60 each | EN | B [C] · 3/5 | — |
| F18 | Local outlets — Bidur Khabar (Nuwakot), Dhading Post; Rasuwa-level sites (rasuwakhabar, langtangkhabar…) **did not resolve** | Devighat/Bidur settlement detail | HTML | ~5–8 | NE | C [C]/[U] | — |
| F19 | **Live blogs (all curl-fetchable; WebFetch blocked on several)** — BBC `bbc.com/news/live/cr0qxd1y219kt` (27–29 Aug, 123 paras); CNN ×2 (`/2026/08/26/world/live-news/nepal-flash-flooding-floods-intl`, `/2026/08/28/world/live-news/nepal-china-flood`); NBC ×2 (`rcna594643`, `rcna594833`); Guardian 28 + 29 Aug live + Bidur/Mailung interactive; ABC AU 28 + 29 Aug (~67 timestamped posts); Amar Ujala Hindi live | Timestamped official quotes | HTML | 9 live pages | EN/HI | A/B+ [C] · 2–3/5 | — |
| F20 | Wires/international — AP hub `apnews.com/hub/nepal` (22; Nuwakot/Devighat/Gyirong detail); Al Jazeera `/where/nepal/` (18; Bidur/Betrawati/TUTH); CBS (Timure/Gyirong/UT-1, 48 paras); SCMP; UN News ×4; Korea JoongAng (**UT-1 head-counts: Doosan 20/15/5, KOEN 7/3, ~200 evacuated**); Yonhap; Malay Mail/The Star/FMT (Malaysian lists — PII); Daily Star BD nationality table | Nationality-specific head-counts | HTML | ~15–25 each | EN | A/B [C] · 2–3/5 | MY lists name people |
| F21 | **Bot-blocked**: Reuters (401), AFP/France24 (403), NDTV (403), Hindustan Times, NYT (403 + paywall), Time (406), NHK (JS) → use syndication copies (Yahoo, Straits Times, Korea Times, Cyprus Mail, Business Standard, The Federal, Kashmir Observer) | — | — | — | EN | A [R] | — |
| F22 | India — ToI `/topic/nepal-floods` (JSON-LD `articleBody`), Indian Express `/about/nepal-floods/` (15), The Hindu live-updates, Tribune (Isha survivor piece), ANI `/topic/nepal-flood/` (21; fastest NDRRMA relay), Amar Ujala tag (77), Jagran/Bhaskar/Aaj Tak via Google News HI; Indian Embassy Kathmandu (14 event links) | Indian pilgrim groups by origin city/state; Gandak downstream; helplines | HTML; PTI/MEA JS-only | ~40 EN + ~100 HI | EN/HI | B/C+ [C] · 2/5 | — |
| F23 | **China/Tibet** — Xinhua ZH (`news.cn/politics/20260828/3223c142…` "四大关切"; site search 405) + EN (`english.news.cn/asiapacific/`); **People's Daily search API** (`POST search.people.cn/search-platform/front/search` {"key":"吉隆口岸"}); **The Paper search API** (`POST api.thepaper.cn/search/web/news` → 239 hits; HTML 403, API only); Global Times `/china/society/`; tibet.cn 【吉隆平安】 series; China News Service; CCTV/CGTN JS-only; Weibo login-walled; RFA Tibetan ×3; cn.nytimes (info-control pieces); NTD/Epoch (D — partisan) | **Only Tibet-side counts** (Gyirong Port, Resuo village; 3→7 dead, 558→554 missing; 555 tourists evacuated, 499 sheltered; 88 s collapse duration per 地灾国重实验室) | HTML + 2 JSON APIs | ~60 Xinhua, 240 The Paper | ZH/EN | B (state) [C] · 3/5 | The Paper headlines name officers |
| F24 | **Aggregator/API tests** — Google News RSS `news.google.com/rss/search?q=…` (**best free enumerator**: 92–100/query; `site:` and `when:` work; EN/HI/ZH editions; **no Devanagari-Nepali edition** → use outlet RSS); GDELT DOC 2.0 (`Rasuwa` 4 d → 250 cap, 140 EN/109 NE; indexes onlinekhabar/ratopati/ekantipur but **almost no KP/THT**; flaky 404s/timeouts → monitor only); Bing News RSS (12); Guardian Open Platform (needs free key; `test` key 429); NewsAPI/MediaCloud (key); CC-NEWS (49 WARCs dated 26–29 Aug — bulk replay only); Wayback CDX (unreachable from sandbox) | Discovery and volume monitoring | RSS/JSON | — | EN/HI/ZH | [C] | — |
| F25 | **Wikipedia** en `2026_Nepal_floods` (**1,062 revisions / 280 editors in 4 days; 174 external links** — a ready-made crawl seed list: KP 22, BBC 15, news.cn 12…), Talk (324 revs), `Timeline of the 2026 Nepal floods`, zh (277 revs), ne, hi; **Wikidata Q141182413** (46 sitelinks); Commons `Category:2026 Nepal and Tibet floods` | Curated cross-source timeline; revision stream as change detector | MediaWiki API | Pageviews 74k/233k/175k (26/27/28 Aug) | EN/ZH/NE/HI | C [C] | N |
| F26 | **Survivor / per-place article index** — ~40 articles grouped by cluster (Timure–Rasuwadhi–Ghattekhola; Syabrubesi–Dhunche–Chilime; Mailung/UT-1 + tunnels; Betrawati–Trishuli Bazar–Bidur–Devighat; downstream; Tibet side) with URL → places, in `agent-reports/deepdive-text-2026-08-29.md` §9 | Micro-location + head-count + time (e.g. Timure timber shed 100–200 people for 24–25 h; school group 40–50 safe / 15 awaiting; Isha 28 pilgrims 50–100 m from bridge; UT-1 flood ≈09:00) | HTML | ~40 | EN/NE/ZH | A–B [C] · **5/5** | most name individuals — extract place/count/time only |
| F27 | YouTube — Nepali channels (Kantipur TV HD, Nepal Television, AP1, Image Channel, News24, SidhaKura, Nepal Raibar), Indian (India Today, WION, CNN-News18), Chinese (中国新闻社, 8world); press conferences (AP, Reuters, UN, ANI) | Briefings, survivor interviews | Data API v3 key or `yt-dlp --write-auto-sub` (not installed); captions on 1 of 4 sampled pages | ~10 channels | NE/HI/EN/ZH | C [R] | — |
| F28 | Expert analysis — The Conversation ×9 (CC-BY; Tielidze satellite sequence, Anand on Tibet info control), Landslide Blog (Petley, 26 Aug), EGU HS blog (28 Aug), AntarcticGlaciers, SANDRP (hydropower table; advocacy — verify), ICIMOD, Nepali Times | Cause, hazard, warning-gap, hydropower context (not who/where) | HTML/RSS | ~20 | EN | A-/B [C] | N |
| F29 | Fact-check desks — **Nepal Fact Check** (IFCN; 5 event checks: Alaska GLOF video, AI before/after, AI Trishuli Bazar video, Uttarakhand "minister in tunnel"), Snopes (Gyirong CCTV genuine), VERA, AFP, Lead Stories, AAP, BOOM, Factly, Fact Crescendo, Vishvas/Newschecker (HI) | ~20 debunked items | HTML | — | EN/NE/HI | A-/B [C] | N |

**Pattern worth exploiting:** Nepali headlines routinely encode *(place) + (count) + (status)* — "रसुवामा हराएका कैलालीका २३ जना सम्पर्कमा", "मोरङका १५ सम्पर्कविहीन, तीन जनाको उद्धार". A headline-only extractor over the RSS/homepage streams already yields most who/where/status facts.

---

## G. Dead ends and not-activated (don't spend time here)

| What | Finding |
|---|---|
| Helicopter ADS-B | Proven blind (B9) |
| Meta Data for Good movement / displacement | Last resource 13–16 Jul 2026; not event-activated. Movement Range Maps ended 2022 |
| IOM DTM | Nepal dataset last 24 Aug (pre-event); API 404 |
| Flowminder / CDR | No 2026 activation; needs NDRRMA → NTA → operators with a pre-signed MoU (2015 precedent: 6 days) |
| Starlink | Not licensed in Nepal; NTA warned against illegal terminals |
| Apple Emergency SOS via satellite | Nepal not in supported-country list — geofenced off |
| Garmin inReach / Zoleo / SPOT / Strava | No public statements; channel is provider → embassy, not public |
| TIMS `tims.ntb.gov.np` | Agency-login SPA; no public stats; agency manifests (NTB/TAAN) are the roster |
| OpenTopography corridor LiDAR | 0 datasets; Survey Dept NSDI unverified |
| Google Open Buildings tile URLs | Documented `tiles.geojson` path gone; resolve via site picker |
| NASA Disasters / ARIA | No activation, no DPM for this event |
| HOT Field-TM / DroneTM | No public instance for this event |
| Kaggle / WFP ADAM / Kontur event products | None |
| KLL, Ushahidi, Sahana, Google Person Finder | Re-confirmed: no 2026 activation |
| ReliefWeb API | v1 **410 Gone** (retired); v2 needs an approved `appname` (register at apidoc.reliefweb.int) — pages fetch fine with a browser UA |
| Chinese social platforms | Login + active deletion of disaster posts |
| `neoc.gov.np` | Unreachable from outside Nepal; NEOC figures only reach the public via UN RCO flash updates |
| NTB / DoT / NEA / IPPAN / NTA / CAAN websites | Nothing published on-site; all figures reach the public via press (NTB "list" compiled from agency manifests is not published) |
| Nepal Police website | No bulletins; the 06:00/14:00 police bulletins go out via social media + press WhatsApp |
| BIPAD incident registry | Event still absent as of 29 Aug 22:00 NPT |
| NDRRMA drone-footage Google Form | URL not published in the Khabarhub article; not found |
| India CWC / NDMA / BSDMA; China MEM / Xizang govt; MEA press list | Unreachable or JS-only |
| Wikipedia infobox (682+ dead / 2,980+ missing) | Unattributed mix — don't source from it |

---

## H. Access matrix (what actually works from a script)

| Platform / host | Route | Auth | Limits |
|---|---|---|---|
| `rescue.opmcm.gov.np/api/*` | HTTPS JSON | none | ≤200 rows/page (photos inline; 1,000-row pages time out) |
| `ndrrma.gov.np/api/v1/{rescues,publication,pressnotenews}/*` | DRF JSON (+ PDF/JPG links) | none | small; poll publications every 30 min |
| `navigate-dor-api.rimes.int/*_api/*` | JSON | none | static inventory |
| `goadmin.ifrc.org/api/v2/` · `gdacs.org/gdacsapi/api/` | JSON | none | — |
| `mofa.gov.np/category/flashflood/` · `heoc.mohp.gov.np` · DAO sites | HTML / image | none | tables → HTML one day, PNG the next; HEOC is image-only (OCR) |
| `setu.ndrrma.gov.np` | HTML | none (read) | — |
| `udb.nepalpolice.gov.np` | HTML | none | reachable; **policy: don't scrape rows** |
| `hydrology.gov.np/gss/api/station` · `dhm.gov.np/hydrology/river-watch` · `dhm.gov.np/mfd/api/*` | JSON / JS-embedded JSON / JSON | none (observations endpoint needs key) | ~5-min page regen |
| `bipadportal.gov.np/api/v1/*` | JSON | none | check freshness |
| HOT S3 `production-raw-data-api.s3.amazonaws.com/ISO3/NPL/` | S3 listing + files | none | unlimited |
| HDX CKAN `data.humdata.org/api/3/action/package_search` | JSON | none | — |
| Copernicus dashboard API + products.zip | JSON / zip | none | GET only |
| NESRA `storage.googleapis.com/npl-flood-front/` | GCS objects | none | — |
| Vantor / Planet STAC | JSON + COG | none | CC-BY-NC |
| CDSE OData catalogue | JSON | none for search; free account for download | — |
| Planetary Computer STAC | JSON | none for search; SAS for assets | — |
| USGS / GEOFON FDSN | JSON | none | — |
| GitHub raw | files | none | unlimited; `api.github.com` 10/min unauth |
| Reddit | `search.rss` / `new.rss` with browser UA | none | ~1 req/2 s |
| X | syndication endpoint per tweet ID | none | search needs paid API |
| Telegram | Telethon (MTProto) | user account | generous |
| YouTube | Data API v3 | free key | 10k units/day |
| Facebook / Instagram / TikTok / Weibo | — | login | **blocked** |
| Google News RSS `news.google.com/rss/search?q=<q>&hl=en&gl=US&ceid=US:en` | RSS | none | 100/query; `site:` + `when:` work; EN/HI/ZH only |
| GDELT DOC 2.0 `api.gdeltproject.org/api/v2/doc/doc?query=…&mode=artlist&format=json` | JSON | none | 250 cap; flaky; monitor only |
| People's Daily / The Paper search | POST JSON | none | — |
| Nepali outlet RSS (Onlinekhabar NP/EN, KP, Khabarhub, Rising Nepal, Nepalnews, Radio Nepal, Ratopati EN, Annapurna, Gorkhapatra, newsofnepal, BBC Nepali, Nepali Times) | RSS | none | poll every 30–60 min |
| News sites (scrape) | plain HTML with browser UA | none | KP/THT/Republica/Setopati/Nagarik/ekantipur/Gorkhapatra/INSEC/live blogs OK; **403/JS:** Reuters, AFP, NDTV, HT, NYT, Time, Ratopati NP feed, ANI, ThePrint, NBC (fetch tool), Factly, Fact Crescendo, Ujyaalo bodies, Xinhua search, CCTV/CGTN, MEA |

**Pipeline cheat-sheet:** poll the RSS set + NDRRMA API + ReliefWeb RSS + Google News `site:` per non-RSS outlet every 30–60 min; scrape tag/homepage/live pages with a browser UA; POST to the two Chinese search APIs; register for ReliefWeb v2 appname + Guardian key; install `yt-dlp` for transcripts; **quarantine** every PII stream (NDRRMA name-list PDFs and `/np/rescue`, Police UDB rows, DAO lists, OPMCM person-reports, Malay Mail/FMT/Pardafas name lists, the volunteer bulletin's names index) — extract counts/places/times only.

---

## I. Immediate asks (data that exists but is held)

| Holder | Ask |
|---|---|
| DHM Flood Forecasting Division | `/gss/api/observation` key; timing of replacement loggers at Syabrubesi/Betrawati (tagged "Narayani AMC 2026" in catalogue) |
| NDRRMA emergency-comms team / NTA | Consolidated site-restoration table (site, ward, timestamp) — NTC publishes fragments |
| Nepal Army Directorate of Public Relations | Daily sortie log (LZ, time, pax) — press has totals only |
| Helicopter operators via NDRRMA | Own GPS flight logs |
| NEA Load Dispatch Centre | Feeder restoration log for Trishuli/Devighat radials |
| ICIMOD / MWR (via MoFA) | Lake level/area series; 3-seismometer feed |
| NTB / TAAN | Agency manifests for Langtang/Gosaikunda departures 20–26 Aug (group counts by lodge) |
| Garmin Response / Zoleo / Globalstar via embassies | Aggregate count of active devices in a Rasuwa bbox since 26 Aug (no IDs) |
| NTC / Ncell via NDRRMA → NTA | Last-attach / first-re-attach aggregates per tower (Flowminder-style MoU) |
