# Deep-dive: OFFICIAL / GOVERNMENT / INSTITUTIONAL data sources — Bhote Koshi–Trishuli flood (26 Aug 2026)

*Sweep date: 2026-08-29 (evening NPT). Method: ~45 web searches (session cap of 200 searches was hit mid-sweep, so later work is fetch/curl only), ~90 direct fetches/curl probes. Legend — Reliability A–F; Fetch status [C] confirmed-fetched by me, [R] reported by a secondary source, [U] unconfirmed. Access: open API / open download / scrapeable HTML / gated / manual-request. No personal data recorded: for name lists only publisher, URL, format, row count, columns and date are noted.*

*Repo files read first: `research/60-ai-and-satellite-approaches/live-data-sources.md`, `aryaa_research_general/07-data-map.md`, `research/10-actors/contact-directory.md`. "NEW" below means not in any of those three.*

---

## 0. Headline findings (read this first)

1. **NDRRMA has a working, open, undocumented REST API behind its React site.** `https://ndrrma.gov.np/api/v1/publication/publications/` returns every sitrep and every rescued/missing/injured list as JSON with a direct PDF URL; `…/api/v1/rescues/rescued-persons/` returns the **verified rescued-persons register as JSON (2,189 records as of 29 Aug ~18:00 NPT)**; `…/api/v1/pressnotenews/newsinfo/` gives dated news cards. This is the canonical official feed and it is machine-readable. **NEW.**
2. **NDRRMA sitrep cadence/format:** two parallel series — (a) numbered "स्थिति प्रतिवेदन #N" (Canva PDFs, 2–8 pp, Nepali, text-extractable, #4–#8 so far, #8 = 29 Aug 18:30 NPT) and (b) short "Situation update" one-pagers (scanned images, no text) at ~08:30/10:00/11:00 NPT. **NEW detail.**
3. **Nepal Police Unidentified Bodies DB (udb.nepalpolice.gov.np) is live and filterable** (province/district/date, 20 rows/page, photo + 5 fields). Since 26 Aug it holds **558 dead-body records nationally** (baseline 1–25 Aug: 26), of which 211 Nawalparasi East, 67 Tanahun, 45 Nawalparasi West, 43 Gorkha, 38 Nuwakot, 25 Dhading, 5 Rasuwa (Chitwan lookup failed — see §1.4). It is the only official per-body register found. **NEW.**
4. **DHM river data is machine-readable via an undocumented POST** (`POST https://dhm.gov.np/site/riverWatchTableViewData` → JSON for 332 stations) and via the 5 MB embedded JSON in the river-watch page. Rasuwa-corridor gauges (Rasuwagadhi, Bhote Koshi @ Syabrubesi, Langtang Khola @ Syabrubesi, Trishuli @ Betrawati, Phalakhu @ Betrawati) **froze at 08:40–09:20 NPT on 26 Aug**; Dhunche, Galchhi, Kali Khola, Devghat still live. **BIPAD's mirror `/api/v1/river-stations/` carries the same live values** (modified 29 Aug 22:45 NPT) but BIPAD `/api/v1/river/` (time-series) and `/rain/` are stale (Jul-2025 / Jan-2025). **NEW detail.**
5. **BIPAD incident API still does not contain the event** (as of 29 Aug 22:00 NPT: only Dhading/Gorkha peripheral flood points + one "High Altitude" incident at Gosaikunda-4). BIPAD `citizen-report` endpoint has ~10 duplicate public "missing guide" posts from 27 Aug **containing names/phones — treat as PII, do not ingest raw**. Confirms repo caveat.
6. **Official figure chain (date-stamped)** — see §11 table. Latest: NDRRMA Sitrep #8 (29 Aug 18:30 NPT) and Xinhua quoting NDRRMA 18:30: **675 bodies, 2,498 missing**; Dept of Tourism 17:30: 753 tourists out of contact incl. 589 foreigners. Earlier NDRRMA 10:00 update: 626 / 2,426 / 4,451 rescued. UN Flash Update #3 (28 Aug) quotes **NEOC/MoHA** (539 dead / 977 missing / 73 injured / 3,742 rescued / 12,249 personnel / 15 helicopters) — note NEOC and NDRRMA "missing" definitions diverge by >1,000.
7. **Two GLIDE numbers are in circulation**: `FF-2026-000162-NPL` (ReliefWeb, IFRC GO) and `FL-2026-000167-NPL` (GDACS, GloFAS-triggered Orange alert, event 1104124). Also `EQ-2026-000168-CHN` / `FL-2026-000166-CHN` on the GDACS feed for the Tibet side. Ingest both.
8. **USGS lists two landslide-type seismic events**, not one: M5.2 ms_vx 02:52:10 UTC (08:37 NPT) and **M4.2 ms_vx 06:00:35 UTC (11:45 NPT)** at the same coordinates (85.515E 28.27N) — a second collapse/dam-break signal ~3 h later. Open GeoJSON API. **NEW.**
9. **China MWR publishes rolling barrier-lake bulletins** (27 Aug 22:57 and 30 Aug 00:54 CST) naming the lake "普热普强藏布堰塞湖" (Purepu Tsangpo) and a new upstream "错坚河冲击坑链式风险" (chain risk of impact craters on the Cuojian river). Level-IV flood-defence response for Xizang. **NEW.**
10. **Dead/blocked:** neoc.gov.np unreachable from outside; ndrrma.yilab.org.np mirror 401; ReliefWeb API v1 returns 410 Gone and v2 requires an approved `appname`; UNICEF/IOM/IFRC pages Cloudflare-block bots; smartraveller timed out; CWC ffs.india-water.gov.in, ndma.gov.in, bsdma.org unreachable; US Embassy pages serve "Technical difficulties" to the fetcher (curl with browser UA works).

---

## 1. Nepal — federal institutions

### 1.1 NDRRMA (राष्ट्रिय विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन प्राधिकरण) — Reliability A

Site is a Vite/React SPA (`ndrrma.gov.np/en`, `/np`); HTML shows only "NDRRMA" to scrapers. Bundle `/assets/index.2eb91e69.js` reveals backend base `https://ndrrma.gov.np/api/v1` (DRF), plus `https://vms.ndrrma.gov.np/` and `https://bipadportal.gov.np/api/v1`. Twitter handle embedded: `@NDRRMA_Nepal`; YouTube `@NDRRMA`.

| Endpoint / page | What it holds | Format | Access | Cadence | Fetch |
|---|---|---|---|---|---|
| `https://ndrrma.gov.np/api/v1/publication/publications/?ordering=-id&limit=80` | All publications (326 total). Fields: `id, publication_type{pub_type,pub_type_ne}, publication_author, title, title_ne, description, summary, date, pdffile, image, is_published`. 17 event records (ids 370–388) since 27 Aug. | JSON → PDF | open API, no auth | Multiple per day during event | [C] |
| `…/api/v1/publication/publicationtypes/` | 28 types incl. "Situation Report", "Notice/Information", "Miscellaneous Report", "Command Post Decisions" | JSON | open | static | [C] |
| `…/api/v1/rescues/rescued-persons/?limit=5000` | **Verified rescued-persons register** behind `ndrrma.gov.np/np/rescue`. Fields: `id, name, name_ne, age, rescued_location, stationed_location, status{title}, rescued_date, nationality, country, gender, remarks`. Count 2,189 (29 Aug): gender 1,771 M / 413 F / 5 other; nationality 2,034 Nepali / 155 foreign (India 103, China 26, South Korea 9, Italy 4, Malta 4, USA 3, Turkey 2…); status 2,181 "Obtained Rescued Name List", 8 "Under Medical Care". **Contains names/ages — PII; ingest aggregates only.** | JSON | open API, no auth, paginated | Growing daily | [C] |
| `…/api/v1/pressnotenews/press-note/` | 64 press notes (latest 18 Jul 2026 heavy-rain alert). **No event press note yet** — event comms go via publications + newsinfo. | JSON → PDF | open | event-driven | [C] |
| `…/api/v1/pressnotenews/newsinfo/?ordering=-id` | 235 news cards; event items 27–29 Aug: #235 NPR 67.5M to 15 local levels; #234 Army tunnel-rescue team; #233 continued flood-risk warning; #232 three relief collection points; #231 private helicopters under govt coordination | JSON (title + JPG) | open | daily | [C] |
| `https://vms.ndrrma.gov.np/api/` | Volunteer Management System (DRF). `statistics` open: 1,717 volunteers (1,382 active; 1,710 national / 7 intl; blood-group breakdown). `volunteer`, `job_report` → 401. `incident` open but historic (46,348 records 2011-04 → 2024-11-20; none for this event). `district/province/municipality/ward` open with polygons. | JSON | partly open | not updated for event | [C] |
| `https://ndrrma.yilab.org.np/` | Mirror/staging (YIL-hosted) | — | 401 | — | [C] dead |
| `https://ndrrma.gov.np/np/rescue` | Human UI of rescued register (SPA) | HTML/JS | open | live | [C] |

**Event publications (all Reliability A, open download, `https://ndrrma.gov.np/mediafiles/publications/…`):**

| id | Date | Type | Title (translated) | PDF | Format notes |
|---|---|---|---|---|---|
| 388 | 29 Aug | Situation Report | **Rasuwa Bhotekoshi Flood Situation Report #8** (as of 2083-05-13 18:30) | `Rasuwa_Bhotekoshi_Flood_Situation__Report_2083.05.13.pdf` | Canva, 7 pp, Nepali, text-extractable (44 KB text). Contains: key bullets; health-facility table (16 facilities: Total/Under/Referred/Discharged/Deaths — total 242/75/29/135/3); shelters (Nuwakot 15 sites 2,318 people; Rasuwa 12 sites 1,270); NPR 92.5M to 15 local levels; relief-stock tables (e.g., 500 body bags); hunting lines at Rasuwa/Nuwakot DEOCs; road-status bullets (Prithvi Hwy Mugling–Malekhu both lanes, Malekhu–Galchhi one lane, Dhunche reachable by small vehicles); AEPC 498 solar power banks; 14 thematic coordination teams |
| 386 | 29 Aug | Situation Report | Search/rescue/relief update, 13 Bhadra 10:00 | `Situation_updates_bhadra13_10_AM.pdf` | **1-page scanned image, no text** |
| 387 | 29 Aug | Notice | Notice on support for search, rescue and relief materials | `रहत_सचन.pdf` | 3 pp HP-Scan image, no text |
| 385 | 28 Aug | Situation Report | **Sitrep #7** (as of 12 Bhadra 19:00) | `Rasuwa_Flood_Situation_Report_7.pdf` | Canva 8 pp, text. District-wise bodies table (Rasuwa 12, Nuwakot 37, Dhading 40, Gorkha 46, Nawalparasi E 154, Nawalparasi W 27, Tanahun 30, Chitwan 233 = 579); missing sub-tables (foreigners 517; overseas-resident Nepalis 127; customs 15; Army 45; APF 13; Rasuwa DEOC 161; Makwanpur 66; Langtang NP 3); rescued 4,451 (191 from hydropower tunnels); 16 helicopters (Army + private); Nepal Police 4,473 personnel; barrier-lake note (satellite image 27 Aug 11:44, ~18 km upstream of Rasuwagadhi, ~0.11 km² lake); **"SETU app" used for tracking out-of-contact persons**; health-facility damage list; Dhading DSC decisions; relief tables by district |
| 383 | 28 Aug | Misc. Report | List of Nepalis evacuated by air, 12 Bhadra | `हवई_उदधर_गरएक_…pdf` | 20 pp, text; columns: SN, rescue date, rescued-from, name, age (**PII**) |
| 381 | 28 Aug | Misc. Report | Full list of persons rescued in Rasuwa (from DAO Rasuwa, 2083-5-12) | `Rescued_info_from_DAO_rasuwa_2083-5-12_.pdf` | 18 pp **scanned**, no text (**PII**) |
| 380 | 28 Aug | Misc. Report | Persons rescued so far, received from DAO Nuwakot | `uddar_garieka_byakti.pdf` | 24 pp Excel-print, text; columns: SN, date, name, address, approx. age, gender, place rescued (**PII**) |
| 384 | 28 Aug | Notice | List of Rescued Foreign citizens, August 28 | `List_of_rescued_foreign_citizens.pdf` | 4 pp Word, text; columns: SN, Rescue Date, Country, Name, Age, Gender (**PII**) |
| 378 | 28 Aug | Situation Report | Situation update 12 Bhadra 08:30 | `Situation_report2083_Bhadra_12_8-30_AM.pdf` | 1-page scanned image |
| 377 | 28 Aug | Misc. Report | Injured brought to Kathmandu for treatment | `रसव_बढ_-_घइत_ववरण_.pdf` | 4 pp, text; columns: SN, name, age, address, occupation, contact no., rescued-from, hospital, health status, discharged?, remarks (**PII incl. phone numbers**) |
| 376 | 27 Aug | Situation Report | Sitrep #6 | `रसव_बढक_सथत_परतवदन__०६.pdf` | Canva 7 pp text (130 injured; 67 in hospital) |
| 372 | 27 Aug | Situation Report | Situation update 11 Bhadra 11:00 | `Situation_update_2083_Bhadra_11_11-00_AM.pdf` | 1-page scanned image |
| 374 | 27 Aug | Misc. Report | Rasuwa flood response mobilization committee (thematic team leads) | `Mobilization_Team_updated.pdf` | 5 pp Word text; columns: SN, Team name, contact person & number, ToR (institutional contacts) |
| 373 | 27 Aug | Misc. Report | **Details of Nepali and Foreign Nationals Missing in the Flood in Rasuwa, 26 Aug** | `Rasuwa_Flood_missing_people.pdf` | 16 pp, text; ~100 rows/2 pp → est. 700–800 rows; columns: SN, NAME, DOB, PPN (passport), SEX, COUNTRY, Agency (**high-sensitivity PII — passport numbers**) |
| 370 / 371 | 27 Aug | Situation Report | Sitrep #5 / #4 | `सथत_परतवदन__०५.pdf`, `…०४.pdf` | Canva 2 pp text each (event narrative: 08:40 NPT, ~20 km NE of Rasuwagadhi, ~1 km² ice-rock collapse) |

Notes: Sitrep #8 states the verified rescued list is published at `ndrrma.gov.np/np/rescue` (→ API above). Nepali digits mixed with ASCII digits in Canva PDFs; pdftotext loses some matras (e.g. "ववरण" for "विवरण") — use layout mode + fuzzy matching. NDRRMA figures at "10:00" and "18:30/19:00" are the two daily anchor times.

### 1.2 BIPAD portal (bipadportal.gov.np) — Reliability A (system of record), but event coverage poor

| Endpoint | Result (29 Aug ~22:00 NPT) | Notes | Fetch |
|---|---|---|---|
| `/api/v1/` | 120+ endpoints (incident, loss, loss-people, alert, river, river-stations, rain, rain-stations, citizen-report, event, document, relief-flow, inventory…) | `count` field returns int64-max (9223372036854775807) on every list — bug; use `next` for paging | [C] |
| `/api/v1/incident/?incident_on__gt=2026-08-26T00:00:00&limit=1000` | 96 records nationally; hazard 11 (flood) = 12, none in Rasuwa/Nuwakot/Chitwan/Nawalparasi/Tanahun. Event-adjacent: 93669/93684 Gajuri-5/-7 (Dhading), 93670–72 Netrawati Dabjong-1 (Dhading), 93699 Dharche-5 (Gorkha), **93768 "High Altitude at Gosaikunda-4" 28 Aug (hazard 16)** | Mass-casualty records not entered; losses on these = single injuries | [C] |
| `/api/v1/loss/`, `/loss-people/` | Latest 100 loss-people are all "injured", unverified, names null | Confirms no event casualty entry | [C] |
| `/api/v1/alert/?ordering=-started_on` | DHM/DoE alerts; only event-relevant: id 45649 "Flood warning at Uttargaya-5, Rasuwa" 25 Aug (pre-event, Narayani basin warning level 2.6) | No barrier-lake alert object | [C] |
| `/api/v1/river-stations/?limit=1000` | 281 stations, **live** (modifiedOn 29 Aug 22:45). Trishuli corridor values: Rasuwagadhi 1.62 m @ 26 Aug 08:40 (frozen); Bhote Koshi@Syabrubesi 3.80 m @ 08:50 (frozen); Langtang Khola@Syabrubesi 2.81 @ 08:50 (frozen); Trishuli@Betrawati 3.549 @ 09:20 (frozen); Phalakhu@Betrawati 1.93 @ 09:20 (frozen); Furke Khola (Malekhu) **10.48 m ABOVE DANGER (7/8) RISING @ 26 Aug 11:40** then dead; Dhunche 2.79 @ 29 Aug 22:30 live; Galchhi 361.03 (stage datum) live; Kali Khola 6.59 live; Devghat 4.53 live; Bhorle last 24 Aug | Best single JSON for corridor gauge status; includes `affectedDemography`, `image` (daq.hydrology.gov.np camera), `stationSeriesId` | [C] |
| `/api/v1/river/?water_level_on__gt=2026-08-26` | 10-min time-series exists (ids 24944xxx) for 26 Aug 00:00 onward incl. Rasuwagadhi/Syabrubesi/Betrawati — **the pre-collapse hydrograph is retrievable here** | Default ordering ascending; paginate | [C] |
| `/api/v1/rain/`, `/rain-stations/` | rain time-series stale (Jan 2025); rain-stations partly live (Kakani 71.6 mm/24 h @ 29 Aug 22:45; Nuwakot 22 Aug; Trishuli@Betrawati rain 28 Aug nulls) | | [C] |
| `/api/v1/citizen-report/` | ~10 duplicate public posts 27 Aug 10:00 ("MISSING GUIDE …", point 85.507E 28.212N, hazard 11) | **PII (name, phone) in free text** — do not ingest raw | [C] |
| `/api/v1/event/` | Named events; latest "Monsoon 2083" (22 Jun). No Rasuwa event object | | [C] |
| `/api/v1/document/` | Policy PDFs only | | [C] |

### 1.3 NEOC / Ministry of Home Affairs — Reliability A

| Source | Status | Fetch |
|---|---|---|
| `neoc.gov.np` | **Unreachable** (WebFetch socket closed ×2; curl `000`) — presumed blocked outside Nepal or down | [C] dead |
| `moha.gov.np/en` | One event item: "Official Disaster Relief Appeal" post `https://moha.gov.np/en/post/ha-ra-tha-ka-apa-l-11` with PDF `https://moha.gov.np/assets/2/PMO_Notice_Final_27_08_2026.pdf/file` (27 Aug, English; states 26 Aug 08:40, districts Rasuwa/Nuwakot/Dhading/Gorkha). No sitreps on the site | [C] |
| NEOC figures | Reach the public only via UN RCO Flash Update #3 ("NEOC reports 539 dead, 977 missing, 73 injured as of 28 Aug; bodies by district incl. 27 Nuwakot, 12 Rasuwa; 105 personnel among missing; 644 foreign/overseas-resident nationals; 3,742 rescued; 12,249 personnel") | [C] via ReliefWeb |
| MoHA toll-free 1234 (NEOC/NDRRMA hotline) | already catalogued | — |

### 1.4 Nepal Police — Reliability A

| Source | What | Format/Access | Fetch |
|---|---|---|---|
| `nepalpolice.gov.np` (home, `/news/`, `/notices/`, `/flash-updates/`) | **No flood bulletins on the website**; only a BP-Highway road notice (2083-05-13). The 06:00 / 14:00 "Nepal Police bulletins" cited by KP/Himalayan Times/CNN are distributed via police social media and press WhatsApp, not the site | scrapeable HTML | [C] absent; bulletins [R] |
| **`https://udb.nepalpolice.gov.np/`** — Unidentified Bodies DB | Sections `/dead-bodies-lists`, `/missing`, `/found`, `/disaster` (disaster route 000). Filters: `province_id`, `district_id` (via `GET /get-district/{province_id}` JSON), `gender`, `value` (text), `date_from`/`date_to` (AD) + BS pickers. 20 rows/page; Nepali/English toggle `/lang/en`. Record fields: photo (`/deadbody/image/{id}`), name (usually blank for unidentified), gender, place found, date/time found, current body location; detail page `/dead-bodies/{id}`. | scrapeable HTML (GET form), no API; self-signed/mismatched TLS cert (use `-k`) | [C] |
| UDB counts (26–30 Aug filter) | dead-bodies: **558 national** (vs 26 for 1–25 Aug); Nawalparasi East 211, Tanahun 67, West Nawalparasi 45, Gorkha 43, Nuwakot 38, Dhading 25, Rasuwa 5, Kaski 4, Kathmandu 1 (Chitwan district id not returned by `/get-district/3` — Chitwan bodies presumably under a different id; Bagmati total 10 pages ≈190). Missing register: 44 since 26 Aug (baseline 232 for 1–25 Aug) — police missing-person notices are NOT being funnelled here. Found: ~1 | counts only | [C] |
| Police forensic process | photos, fingerprints, DNA (NAST + Police Central Forensic Lab), unidentified bodies to be buried in 1–2 weeks (KP 28 Aug) | | [R] |
| Malaysian police list of 23 missing Malaysians (NST 28 Aug) | released via Royal Malaysia Police, format unknown | | [R] — not fetched (403) |

### 1.5 Ministry of Foreign Affairs — Reliability A

| URL | Date | Content | Format | Fetch |
|---|---|---|---|---|
| `https://mofa.gov.np/category/flashflood/` | index | 5 items | HTML | [C] |
| `/content/1865/latest-updates-on-flash-floods--26-august/` | 26 Aug 17:00 | 72 bodies; 403 missing from 25 countries (62 Nepali, 341 foreign; 203 M / 200 F) | HTML | [C] |
| `/content/1862/notice--emergency-control-room--ecr--for-assistance/` | 27 Aug | ECR notice: hotline/WhatsApp +977-9744441227/28 (07–22h), emergency@mofa.gov.np; asks missions/families to submit details | HTML | [C] |
| `/content/1863/latest-updates-on-flash-floods-27-august-2026/` | 27 Aug 20:00 | 359 bodies; foreigners 627 affected: 31 found / 596 missing, 33 countries (India 167, China 100, Ukraine 53, Australia 35…) | HTML + table | [C] |
| `/content/1864/latest-updates-on-flash-floods--28-august/` | 28 Aug 15:30 | 538 bodies; **nationality table (33 rows): total 632 / found 121 / missing 511** — India 178/85/93, China 100/16/84, USA 68/2/66, Ukraine 53/0/53, Malaysia 51/0/51, Australia 35/0/35, UK 33/0/33, Canada 25/0/25, South Korea 9/9/0, Singapore 9, Germany 8, Russia 8/2/6, Latvia 6, South Africa 6, Japan 5, NZ 5, France 4, Belgium 3/1/2, Portugal 3, Spain 3, Italy 2/2/0, Ireland 2, Kazakhstan 2, Netherlands 2, plus 1 each Belarus/Finland/Hungary/Israel/Lithuania/Philippines/Serbia/Sweden/Switzerland(1/1/0), 3 unconfirmed | HTML table (machine-readable) | [C] |
| `/content/1866/press-briefing-note-by-hon--minister-for/` | 29 Aug 14:00 | 626 bodies, ~2,400 unaccounted, 4,450+ rescued, 187+ foreigners rescued; needs: tunnel rescue, locating tech, DNA/forensics, morgues; India 57 t relief; PMDRF link | HTML + **nationality table only as PNG image** | [C] |
| `mofa.gov.np/content/1862/` | canonical "further updates" pointer | | |

Cadence: one update per day ~15:30–20:00 NPT plus briefings. Counting basis = foreigners *reported to MoFA*, not DoT/NTB register.

### 1.6 Ministry of Health / HEOC — Reliability A — **NEW**

| URL | Title | Date |
|---|---|---|
| `https://heoc.mohp.gov.np/news/sitrep/detail` | SitRep 01 – Health Sector Response to Flash Flood in Rasuwa | 27 Aug |
| `…/news/sitrep%2002/detail` | SitRep 02 | 27 Aug |
| `…/news/sitrep-03/detail` and `…/news/sitrep-04/detail` (both titled SitRep 03) | SitRep 03 | 28 Aug |
| `…/news/sitrep-00/detail` | **SitRep 04** | 29 Aug |
| `…/news/TREATMENT/detail` | Referral directive: injured to be referred to designated hospitals | 28 Aug |

Format: **body is a base64-embedded JPEG (image-only)** — needs OCR. Daily cadence. WHO Nepal statement 26 Aug (`who.int/nepal/news/detail/26-08-2026-who-nepal-statement-on-rasuwa-floods`) and WHO emergency page (`who.int/nepal/emergencies/2026-rasuwa-flash-floods`: ~10,000 HH need relief; 3 health posts destroyed, 1 hospital partially damaged, 2 access-cut; US$150k) — [C].

### 1.7 DHM (Department of Hydrology and Meteorology) — Reliability A

| Endpoint | What | Access | Fetch |
|---|---|---|---|
| `https://www.dhm.gov.np/hydrology/river-watch` | Page embeds full station JSON (5 MB): `name, basin, district, latitude, longitude, series_id, waterLevel{datetime,value}, warning_level, danger_level, steady, status` — 29 Aug 16:55–17:15 UTC values present | scrapeable (regex the JSON) | [C] |
| **`POST https://dhm.gov.np/site/riverWatchTableViewData`** (no body needed) | JSON `{status, data:[332 stations: basin,id,stationIndex,name,district,waterLevel{datetime,value},warning_level,danger_level,steady,status,maxvalue,minvalue]}` | open (undocumented; GET → 404; plain POST works; adding X-Requested-With header made it hang once) | [C] |
| `https://dhm.gov.np/hydrology/hms-Single/{station_id}` | Per-station page with latest reading + Highcharts; ids: Trishuli Khola@Dhunche 4657 (series 19926), Trishuli@Betrawati 52 (943), Trishuli River@Betrawati 4657/4783 (19916), Phalakhu@Betrawati 4658 (4140), Bhote Koshi@Shyaprubesi 191 (2810), Bhotekoshi@Rasuwagadi 4913 (23251), Langtang Khola@Shyaprubesi 190 (2788), Langtang@Kyangjin 4898 (22349), Langtang@Syaprubesi velocity 4824 (20129), Trishuli@Galchi 5705 (36628), Trishuli@Kali Khola 4781 (19583), Narayani@Devghat 265/1004 | scrapeable | [C] |
| `POST https://dhm.gov.np/site/getRiverWatchBySeriesId_Single` (fields `csrf_test_name, date, period, seriesid`) | Time-series table+chart per series | **blocked**: returns "No direct script access allowed" / "Undefined variable $riverwatch" even with CSRF cookie — needs browser session; use BIPAD `/river/` for history instead | [C] failed |
| `https://dhm.gov.np/bulletins` → `dhm.gov.np/bhasa/bulletins/en`, `/mfd/#/weather/pages/special-weather`, `/mfd/#/weather/three-days-bulletin` | Weather/special bulletins (SPA) | scrapeable | [C] (no event-specific flood bulletin page found; flood warnings went out as SMS blasts + BIPAD alerts) |
| `hydrology.gov.np` (flood forecasting SPA, Google-Maps key exposed) | probes `/gss/api/*`, `/api/v1/stations` → 404 | — | [C] |
| Gauge status summary (29 Aug) | Dead/frozen since 26 Aug 08:40–09:20: Rasuwagadhi, Bhote Koshi@Syabrubesi, Langtang Khola@Syabrubesi, Trishuli@Betrawati, Phalakhu@Betrawati; Furke Khola/Malekhu last 26 Aug 11:40 at 10.48 m (above danger); Bhorle last 24 Aug. Live: Dhunche, Galchhi (rising), Kali Khola (rising), Devghat (rising), Marsyangdi set. ICIMOD cites Galchhi +9 m in 30 min, Malekhu +7 m | | [C] |

### 1.8 Department of Roads — Navigate — Reliability A — **NEW detail**

`navigate.dor.gov.np/dashboard` is an Angular SPA; backend is **RIMES-hosted** `https://navigate-dor-api.rimes.int` (CodeIgniter). Discovered endpoints (all open GET, JSON):
- `Bridge_api/getAllBridges` — **2,135 bridges**: `id, bridge_id_code, bridge_name, road_name, district_name, river, chainage_in_km, length_in_m, width_in_m, latitude, longitude, span_length_in_m` (26 in Rasuwa/Nuwakot; useful for the "32–40 bridges lost" reconciliation) [C]
- `Road_safety_api/rs_rf_adv_dt`, `rf_ds_adv_gt`, `ecmwf_fc_dates_lt`, `ecmwf_rf_lt`, `ecmwf_district_bagmati_adv` — ECMWF-rainfall road-safety advisories by district id (29 Aug: ids 17, 26, 27 "very_high") [C]
- `Road_blackspot_api/*`, `Equipments_api/getEquipments`, `Dhm_ffgs_api/*` (flash-flood guidance; `ffgs_dmh_all` → 404), `Road_closure_import_api/uploadAndProcessExcelFile` (**closures are imported from Excel; no public read endpoint found** — road-closure status is not exposed as a feed) [C]
- Also embeds `geoserver.rimes.int:8443/geoserver/rimes/wms` and `navigate-dor-api.rimes.int/dor_files/rp_100/…` flood return-period tiles. iOS app id 6743069596.
- `dor.gov.np` homepage: no event notices [C].

### 1.9 Tourism / Immigration — Reliability A (institution) but no web publication

| Institution | Finding | Fetch |
|---|---|---|
| Nepal Tourism Board `ntb.gov.np` | No notice/statement on site (`/press-release`, `/notices`, `/media-center` → 404). NTB counts (384 → 403 → 420 out of contact; 291 foreign / 93 Nepali on 26 Aug) exist only via media (nepalnews, ABC). "List" compiled with TAAN/Tourist Police from agency manifests — not published | [C] absent; figures [R] |
| Department of Tourism `tourism.gov.np` | No event content; Xinhua 29 Aug quotes DoT: **753 tourists out of contact as of 17:30 incl. 589 foreign** | [C] absent; [R] |
| Department of Immigration `immigration.gov.np` | TLS cert error for fetcher; curl shows only a staffing notice for Immigration Office Timure, Rasuwa; no flood list | [C] |
| e-TIMS / Langtang NP permits | gated (already catalogued) | — |
| Tourist Police hotline 1144 | cited by UK/Canada advisories | [C] |

### 1.10 Energy: NEA / IPPAN / hydropower — Reliability A/B

| Source | Finding | Fetch |
|---|---|---|
| `nea.org.np` | Homepage notices 26–28 Aug are administrative only; `/news`, `/notices` timed out. **No official tunnel/worker statement on the web.** NEA figures reach public via KP 29 Aug (Chilime 15–20, Rasuwagadhi >100, UT-3A 40–45, UT-3B 20–25 unaccounted; "431 MW off grid") and Onlinekhabar (40–45 NEA staff trapped at UT-3A) | [C] absent; [R] |
| `ippan.org.np` | No statement on site; IPPAN's "934 unaccounted across 11 projects" (KP 29 Aug) | [C] absent; [R] |
| Project companies (KP 29 Aug) | UT-1 (216 MW) 254 rescued; Langtang Khola (20 MW) 18 rescued / 42 unaccounted; Chilime 8 out of contact; Rasuwagadhi 49 unaccounted; UT-3 (37 MW) 213 initially missing / 85 rescued | [R] |
| NDRRMA Sitrep #7 | 191 rescued from hydropower tunnels (of 4,451) | [C] |
| IRDR rapid analysis (ReliefWeb 28 Aug) | ~748 MW capacity affected; >30 bridges | [C] |

### 1.11 Telecom: NTA / NTC / Ncell — Reliability A/B

| Source | Finding | Fetch |
|---|---|---|
| `nta.gov.np/en` | No outage/restoration notice | [C] absent |
| `ntc.net.np/news` | Loaded; no flood item in English link text (may be Nepali) | [C] |
| Ncell press page | unreachable (000) | [C] dead |
| Media-reported operator figures (Onlinekhabar 27 Aug; Khabarhub/ICT Frame 29 Aug) | NTC: 152 sites down initially; 60 still down on 27 Aug (Chitwan 5, Dhading 13/36, Nuwakot 31/79, Rasuwa 13/32); later "80 of 120 restored"; UT-3A site and Tupche BTS restored 29 Aug. Ncell: 27 down → 18 restored (14 in Rasuwa/Nuwakot/Dhading per np.ictframe); free voice/data/SMS extended 7 days | [R] |

### 1.12 Nepal Army — Reliability A

| Source | Finding | Fetch |
|---|---|---|
| `nepalarmy.mil.np/viewnews/667` | "Search, Rescue and Relief Distribution by NA" (27 Aug): evacuations from Timure, Dhunche, Mailung; field medical centre at Trishuli; no numbers | [C] |
| `nepalarmy.mil.np/press-release`, `/news` | Pages load; no flood-titled items in link text | [C] |
| `disaster.nepalarmy.mil.np` | Directorate of Disaster Management site; nothing since 2025 | [C] |
| Army figures via media | 88 heli-rescued (Onlinekhabar 26 Aug); 350 from UT tunnel (Nepal Press 28 Aug); water rise 0.6 m at overtopping (Al Jazeera 28 Aug); 4,200 Army personnel (HT 28 Aug) | [R] |
| Helicopter fleet | 16 (Army + private) per NDRRMA #7; 15 per NEOC; 14 per Heli Rescue Nepal; "99 rescue flights" per Al Jazeera 28 Aug | [C]/[R] |

### 1.13 CAAN / aviation — nothing official found on `caanepal.gov.np` (notices route 404). NDRRMA newsinfo #231 (27 Aug): private helicopters to operate under government coordination. [C]/[R]

### 1.14 Prime Minister's Office / relief funds — Reliability A
- `opmcm.gov.np/content/586/heartfelt-appeal/` (26 Aug): appeal to PM Disaster Relief Fund; portals `pmdrf.nchl.com.np` and `pmrelieffund.himalayanbank.com` [C]
- Kathmandu DAO urgent notice 29 Aug calling for relief donations (Xinhua) [R]

### 1.15 District Administration Offices / DEOCs — Reliability A — **NEW**

| Office | URL | Content | Format | Fetch |
|---|---|---|---|---|
| **DAO Rasuwa** hub | `https://daorasuwa.moha.gov.np/page/bha-ta-ka-sha-b-dha-bha-tha-ra` ("भोटेकोशी बाढी (भाद्र २०८३)") | Sub-pages: office notices (`/page/ka-ra-ya-lyab-ta-ja-ra-sa-cana-3`, 2083-05-11) and treatment details (`/page/b-dha-pa-rabha-va-tahara-ka-rasa-va-asa-pata-lma-bhaeka-upaca-ra-va-varanae`, 2083-05-13) | HTML hub | [C] |
| DAO Rasuwa notice PDFs | `…/assets/120/सूचना_भोटेकोशी_बाढी_२०८३_०५_११.pdf/file` (13 MB, scanned); posts `/post/sa-cana-bha-ta-ka-sha-b-dha-gata` and `-2` → `सूचना_२_विपद्(बाढी)_रसुवा_.pdf` (12 Bhadra) | scanned PDF, no text | [C] |
| DAO Rasuwa treatment list | `उपचार.pdf` (4 pp, iLovePDF, scanned) also on port 8087 and a Google Drive link | scanned (**PII**) | [C] metadata only |
| **DAO Nuwakot** rescued list | `https://daonuwakot.moha.gov.np/post/ma-ta-bha-tha-ra-gata-sama-ma-utha-tha-ra-gara-eka-va-yaka-ta-hara-ka-va-varanae` (posted 13 Bhadra): PDF (999 KB) + **XLSX (107 KB)** `…/upload/ef505dd19c1bea460f21e7826a49439a/files/विपद्_बाट_उद्दार_गरेको_व्यक्तिहरूको_विवरण_12_सम्मको_विवरण.xlsx`. Sheet 1 "rescued persons" ≈1,436 rows: SN, date, name, gender, approx. age, address, rescue location. Sheet 2 "rescued foreign nationals" ≈170 rows: SN, date, name, address, age, gender, contact no., rescue place, hospital, returned home, relative's contact, remarks | XLSX/PDF (**PII incl. phones**) | [C] metadata only |
| DAO Nuwakot notice/press pages | `/page/notice` unreachable; `/page/press-release`, `/page/news` no flood items | | [C] |
| Rasuwa/Nuwakot DEOC hunting lines | 2 lines Rasuwa DEOC, 1 Nuwakot DEOC (NDRRMA #8) | | [C] |
| Gosaikunda RM `gosaikundamun.gov.np`, Uttargaya RM `uttargayamun.gov.np` | No flood content | | [C] |
| Bidur Municipality `bidurmun.gov.np` | TLS cert belongs to another municipality (aanbookhairenimun) — misconfigured | | [C] dead |
| DAO Rasuwa toll-free 1234 | 24 h disaster line | | [C] |

### 1.16 Bagmati Province (OCMCM, Hetauda) — Reliability A — **NEW**
`https://ocmcm.bagamati.gov.np/` items: #371 statement on the flood via Rasuwa; **#372 relief/rescue/rehabilitation communiqué (11 Bhadra)**; #373 office-continuity notice for provincial offices in Rasuwa/Nuwakot; **#375 press statement (13 Bhadra)**; plus staff-deployment notice. Body text is not in HTML (image/attachment) — needs manual read. Contacts: ocmcm@bagamati.gov.np, toll-free 1660-575-2961. `peoc.bagamati.gov.np` unreachable. [C]

### 1.17 Independent trackers (already catalogued) — `nepaldisasterupdatelive.nxtimaginelabs.com` (Reliability C): volunteer briefing citing NDRRMA 10:00 and Police 14:00 bulletins; no API; no names. [C]

---

## 2. China — Reliability A (state) / B (state media)

| Source | URL | Content | Fetch |
|---|---|---|---|
| **Ministry of Water Resources 水利部** bulletins (Chinese) | `http://www.mwr.gov.cn/xw/slyw/202608/t20260826_2140480.html` (26 Aug: emergency deployment for Gyirong mudslide); `t20260826_2140487.html` (Xi instruction); `t20260827_2140582.html` (**Level-IV flood-defence response for Xizang**); `t20260827_2140605.html` (27 Aug 22:57: rolling consultation on **普热普强藏布堰塞湖** Purepu Tsangpo barrier lake); `t20260830_2140823.html` (29 Aug evening: continued deployment; **new "错坚河冲击坑链式风险"** upstream Cuojian-river impact-crater chain risk; risk-hazard survey ordered) | Minister-chaired consultations, ~daily; HTML Chinese; scrapeable | [C] |
| MWR figures via CCTV/Global Times 27 Aug | Lake ~2 M m³ Thursday morning, already overtopping; +3 M m³ inflow expected over 3 days; "high breach risk"; near confluence of Chhochen Khola and Purepu Tsangpo; flood simulations under way | | [C] via GT |
| Ministry of Emergency Management 应急管理部 | Site `mem.gov.cn/xw/yjglbgzdt/` is JS-rendered (no anchors) — not scrapeable with curl; statements via CGTN: mudslide struck Gyirong ~10:30 CST 26 Aug; national Level-II response; 141-member MEM team; Xizang emergency 152 vehicles/792 personnel; fire & rescue 72 vehicles/431 rescuers; NFRA 681 firefighters/13 dogs/113 vehicles/47 drones (SCMP) | | [C] site; [R] figures |
| China Geological Survey | Determined trigger = high-altitude glacier collapse in Nepal → debris flow via "East Linyi River" (Lhende) to Gyirong Port; teams deployed to source/channel | | [R] (Outlook/Wikipedia) |
| **MFA spokesperson pressers** | `https://www.mfa.gov.cn/eng/xw/fyrbt/lxjzh/202608/t20260826_12010897.html`, `…t20260827_12011637.html`, `…t20260828_12012299.html` — 28 Aug: "heavy casualties, many missing" at Gyirong Port; PLA, armed police, fire & rescue, China Anneng deployed; will provide emergency assistance to Nepal and "international rescue cooperation"; barrier-lake stability watch; both countries' experts attribute to glacier collapse in Nepal; reporter cited 555 stranded tourists evacuated (not confirmed). 26–27 Aug: "nearly 100" Chinese nationals missing on Nepal side (Lin Jian) | HTML English | [C] |
| CGTN explainer 27 Aug | `news.cgtn.com/news/2026-08-27/…-1PXqukuia7m/p.html` — Chinese side as of Thursday: 3 dead, **558 missing (260 foreign nationals)**, 2 rescued | | [C] |
| Xinhua English | `english.news.cn/asiapacific/20260828/5fe2d58e59394537a8985ec632cb5cdd/c.html` (NDRRMA 579/1,924 as of 19:00 28 Aug); `…/20260829/07f961366c954e4ba94b0c806dc0813e/c.html` (**NDRRMA 675 bodies / 2,498 missing as of 18:30 29 Aug; DoT 753 tourists incl. 589 foreign as of 17:30**); also `20260828/f6c20eb9…` (538) and a survivor feature. Note: URLs are under `/asiapacific/`; the bare `/2026…` paths 404 | HTML | [C] |
| Xizang AR government `xizang.gov.cn` | JS-rendered; no anchors captured | | [C] not scrapeable |
| Chinese Embassy Nepal `np.china-embassy.gov.cn/eng/` | No flood notice as of 28 Aug | | [C] absent |
| Wikipedia (2026 Nepal floods) | Tibet side 7 dead / 554 missing; Gyirong Port destroyed | Reliability C | [C] |

---

## 3. India — Reliability A/B

| Source | Finding | Fetch |
|---|---|---|
| MEA `mea.gov.in/press-releases.htm` | Listing is JS-loaded; no items captured. MEA statements via Outlook (embassy coordinating rescue) | [C] page; [R] |
| **Embassy of India, Kathmandu** `indembkathmandu.gov.in` | Emergency advisory (dated 29 Aug on homepage; first issued 26 Aug): helplines +977 985 131 6807 / 970 910 7500 / 981 032 6117 (WhatsApp). No counts published | [C] |
| Indian nationals | MoFA Nepal 28 Aug: 178 reported / 85 found / 93 missing; NTB 26 Aug ">100 of 384"; media "133 Indians missing" (27 Aug) | [C]/[R] |
| India relief | 57+ t relief (MoFA briefing 29 Aug); specialized tunnel-rescue team arrived (KP 29 Aug) | [C]/[R] |
| CWC flood forecasting `ffs.india-water.gov.in`, `cwc.gov.in` (401), NDMA `ndma.gov.in` (000), Bihar BSDMA (503) | **All unreachable/blocked** from this vantage; no Gandak/Valmikinagar bulletin obtained. Skymet (28 Aug) flags Gandak basin of north Bihar as downstream concern | [C] dead; [R] |
| IFRC GO also lists "IND: Flood - 08-2026 - Bihar Floods" (event 8074, start 26 Aug) — separate but co-incident | [C] |

---

## 4. Other governments / consular — Reliability A

| Country | Source | Finding | Fetch |
|---|---|---|---|
| USA | `np.usembassy.gov/category/alert/` → alerts: `…/natural-disaster-alert-u-s-embassy-kathmandu-nepal-august-26-2026/` (26 Aug: districts, road restrictions, move to high ground); `…/rasuwa-flooding-and-major-road-closures/`; `…/natural-disaster-alert-continuing-flood-risk-and-travel-disruptions/`; `…/natural-disaster-alert-continued-flood-risk-and-travel-disruptions/` (**29 Aug**: barrier lake overflowing since 28 Aug; Prithvi Hwy reopened; Kathmandu–Dhunche limited small-vehicle access); `…/united-states-expresses-condolences-…`. Citizens: email KathmanduACS@state.gov; families 1-888-407-4747. State Dept (media): 90 Americans missing, 5 rescued (28 Aug); $500k via CRS; disaster response advisor deployed. WebFetch gets a "Technical difficulties" page — use curl | [C] |
| UK | `gov.uk/foreign-travel-advice/nepal` updated 28 Aug: hotlines 1234/1144; no British count (MoFA Nepal: 33 missing) | [C] |
| Canada | `travel.gc.ca/destinations/nepal` revised 27 Aug 13:46 ET; no count (MoFA: 25) | [C] |
| Australia | `smartraveller.gov.au` timed out; DFAT assistance mentioned in MoFA briefing (MoFA: 35 missing) | [C] failed |
| Japan | `mofa.go.jp/press/release/pressite_000001_01548.html` → 403 (MoFA: 5 missing) | [C] blocked |
| Ukraine | MFA: 56 missing (two groups 47+7, +1) — Kyiv Post 27 Aug; `mfa.gov.ua` 403 | [R] |
| Malaysia | Wisma Putra: 55 uncontactable (local10/Inquirer 27 Aug); police list of 23 names (NST 28 Aug) | [R] |
| South Korea | MOFA: 9 hydropower workers out of contact → all 9 found (MoFA Nepal 28 Aug); response team + US$1 M | [R]/[C] |
| Germany | `auswaertiges-amt.de/en/newsroom` no item captured (MoFA: 8) | [C] absent |

---

## 5. UN / humanitarian system

| Source | URL / access | Content | Reliability | Fetch |
|---|---|---|---|---|
| **ReliefWeb disaster page** | `https://reliefweb.int/disaster/ff-2026-000162-npl` ("Nepal: Flash Floods – Aug 2026", Ongoing) | 11 items as of 29 Aug: UN RCO Flash Update #3 (28 Aug, infographic); IRDR rapid analysis; Save the Children; UNOSAT Rasuwa + Nuwakot mudflow maps (imagery 26–27 Aug, pub 27 Aug); IOM sitrep #1; IFRC/NRCS field report (26 Aug) | A/B | [C] via curl with browser UA (WebFetch 403) |
| ReliefWeb `/updates?search=…` | Also: WFP Nepal External Sitrep 27 Aug; DFS Rapid Situation Overview 27 Aug; PDC sitrep 28 Aug; CORUS sitrep No.1; Qatar Charity ERP; World Vision Cat-I declaration; Oxfam, Plan, MSF, Islamic Relief, CARE, UNICEF (EN/FR/ES) releases | | [C] |
| **ReliefWeb API** | v1 `api.reliefweb.int/v1/…` → **410 Gone**; v2 `api.reliefweb.int/v2/reports?appname=…` → **403 "not using an approved appname"** — register an appname at apidoc.reliefweb.int/parameters#appname before building on it | | [C] blocked |
| **UN RCO Nepal – Rasuwa Flood Flash Update #3** (28 Aug) | `https://reliefweb.int/report/nepal/nepal-rasuwa-flood-flash-update-3` → PDF `…/attachments/f978f17b-8fe0-43ec-9911-4c0ff9feadd3/Nepal_Rasuwa_Flood_Flash_Update_3_28_August_2026.pdf` (9 pp, text) | Quotes **NEOC/MoHA**: 539 dead, 977 missing, 73 injured (Rasuwa 43, Nuwakot 27, Dhading 3); 3,742 rescued; 12,249 personnel; 15 helicopters; 5 Nuwakot sites sheltering >1,000 vs capacity 1,350; 450 body bags distributed; IOM DTM Emergency Tracking Tool planned; sector needs. #1 and #2 not found on ReliefWeb (URL guesses 404; likely e-mail-only). `un.org.np/resources/2081` has no 2026 items | A | [C] |
| IOM Nepal Flood Response Sitrep #1 (27 Aug) | `…/report/nepal/nepal-flood-response-situation-report-1-27-august-2026` → `…/attachments/2f940e20-…/iom-nepal-flood-response-sitrep-1.pdf` (5.8 MB): 165 dead, 826 missing incl. 579 tourists; ~40 km road; NDRRMA estimate of affected pop | B | [C] |
| IRDR Rapid Analysis (28 Aug) | `…/report/nepal/irdr-rapid-analysis-report-scientific-anatomy-26-august-2026-bhotekoshi-flash-flood` (PDF 737 KB): mechanism, ~748 MW affected, >30 bridges | B | [C] |
| **IFRC GO API** | `https://goadmin.ifrc.org/api/v2/event/8073/` — "Nepal: Rasuwa Flash Flood, 2026", GLIDE FF-2026-000162-NPL, dtype 12; **Appeal MDRNP022 Emergency Appeal, amount_requested 18,000,000 (CHF), 28,000 beneficiaries**; field report 18558 (26 Aug, actions NTLS/FDRN, no casualty numbers); `appeal_document`: `https://go-api.ifrc.org/api/DownloadFile/96511/MDRNP022EA` (28 Aug); `situation_report/?event=8073` → 0 | A | [C] |
| IFRC web | `ifrc.org/emergency/nepal-flash-floods-2026` (403 to fetcher); press release 27 Aug: DREF ~CHF 1 M then **Emergency Appeal CHF 25 M** (press) vs 18 M in GO; ~93,000 people affected | A | [R]/[C] partial |
| **Nepal Red Cross** | `nrcs.org/resources/news-and-events/rasuwa-flood` → press release PDF `https://website-api.nrcs.org/media/news/Press_release_2083-5-10.pdf` (**legacy Preeti font, non-Unicode — needs font conversion**); `…/rasuwa-flood-situation-update-26-august-2026/` → `https://website-api.nrcs.org/media/news/Rasuwa_Flood_Situation_Update.pdf` (5 pp, Word/Unicode, 26 Aug: 8–10 m flood wave; USGS M4.4 at 08:37; 5 camps); NRCS information desk in Rasuwa; NRCS hotline 1130 | B | [C] |
| WHO | see §1.6 | A | [C] |
| UNICEF | `unicef.org/nepal/press-releases/…17000-children…` and `/emergencies/nepal-flood` — **Cloudflare-blocked** to fetcher; figures via UN News / UNICEF USA: ≥50,000 affected, 17,000 children | B | [R] |
| WFP | External sitrep 27 Aug (ReliefWeb); `wfp.org/countries/nepal` | B | [C] listing |
| CERF | `cerf.un.org/what-we-do/allocation-by-country/2026` → 404; no allocation found | — | [C] |
| INSARAG / VOSOCC | `vosocc.unocha.org` login-gated; `insarag.org` has only generic flood-response WG pages; no USAR classification deployment evidence | — | [C] gated |
| **GDACS** | Event `FL 1104124` Orange, 26–28 Aug, source GLOFAS, **GLIDE FL-2026-000167-NPL**; JSON `https://www.gdacs.org/gdacsapi/api/events/geteventdata?eventtype=FL&eventid=1104124`; geometry `…/api/polygons/getgeometry?eventtype=FL&eventid=1104124&episodeid=1`; media `…/api/emm/getemmnewsbykey?eventtype=FL&eventid=1104124`; RSS `gdacs.org/xml/rss.xml` (also carries EQ-2026-000168-CHN and FL-2026-000166-CHN); report page lists Copernicus EMSR927, 36 EC-JRC docs, 3 NASA, UNOSAT; "deaths 527 (media)" | A | [C] |
| **USGS** | `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-08-25&endtime=2026-08-28&latitude=28.4&longitude=85.4&maxradiuskm=200&minmagnitude=2` → `us7000tbwb` **M5.2 ms_vx landslide 2026-08-26T02:52:10Z** and `us7000tc90` **M4.2 ms_vx landslide 06:00:35Z**, both 85.515E 28.271N ("55 km NW of Kodari") | A | [C] |
| HDX | `package_search?q=nepal flood 2026`: HOT `hot_flood_npl` (updated 29 Aug) + GLIDE country datasets; **no OCHA/NEOC casualty dataset** on HDX yet | A | [C] |
| ICIMOD | `icimod.org/press-release/major-flash-flood-sweeps-through-nepals-rasuwa-district-raising-fears-of-further-downstream-flooding/` (26 Aug): Lende Khola source ~12 km from Jilong seismic station; Galchhi +9 m/30 min; RDS `rds.icimod.org`, SERVIR-HKH; also `…/directorate/standing-in-solidarity-with-the-tragic-kyirong-rasuwa-flash-flood-victims/` and a HKH-parliamentarians release; failure at ~5,200 m falling ~1,200 m (media) | B | [C] |
| PDC (Pacific Disaster Center) sitrep 28 Aug | on ReliefWeb | B | [C] listing |

---

## 6. Official / semi-official intake forms

| Form | Owner | Status | Fetch |
|---|---|---|---|
| Drone footage submission Google Form | "the government" (Khabarhub 29 Aug: data verified then shared with NDRRMA) | **URL not published in the article**; not found — [U] |
| `https://forms.gle/KQEBsYLUFukThZhx9` ("VOLUNTEER REGISTRATION FORM") | unattributed; fields Name/Email/Organization only; no Nepal/flood text | Not verifiably official — treat as D | [C] |
| NDRRMA VMS `vms.ndrrma.gov.np` | official volunteer registration (1,717 registered) | open UI; API write requires token | [C] |
| MoFA ECR intake | email/WhatsApp (no web form) | | [C] |
| NDRRMA "SETU" app | named in Sitrep #7 for tracking out-of-contact persons; no public endpoint found | [U] |
| Relief collection points | TIA emergency warehouse, Maithali Barracks (Nuwakot), Police Disaster Response & Training Centre (Samakhusi) — NDRRMA #7 / newsinfo #232 | [C] |

---

## 7. Dead links / blocked / not scrapeable (record)

- `neoc.gov.np` — connection fails (000) from outside Nepal.
- `ndrrma.gov.np/en` HTML — SPA shell only; use API.
- `ndrrma.yilab.org.np` — 401.
- `udb.nepalpolice.gov.np` — TLS "unable to verify first certificate" (works with `curl -k`); `/disaster` route 000.
- `immigration.gov.np`, `daorasuwa…:8087` — cert/port oddities; `bidurmun.gov.np` — wrong certificate.
- `api.reliefweb.int/v1` — 410 Gone; `/v2` — needs approved appname. `reliefweb.int` pages — 403 to WebFetch, OK with browser UA.
- `unicef.org`, `iom.int`, `ifrc.org/emergency/…`, `nepalnews.com`, `mofa.go.jp`, `mfa.gov.ua`, `cnn.com` (451), `chinaglobalsouth.com` (paywall) — blocked to the fetcher.
- `mem.gov.cn`, `xizang.gov.cn`, `mea.gov.in` press list — JS-rendered lists; curl captures nothing.
- `ffs.india-water.gov.in`, `ndma.gov.in`, `bsdma.org`, `peoc.bagamati.gov.np`, `nea.org.np/news`, `ncell.axiata.com` — unreachable/5xx.
- `dhm.gov.np/site/getRiverWatchBySeriesId_Single` — server-side "No direct script access" / undefined variable; per-series history not obtainable headlessly.
- `smartraveller.gov.au` — timeout. `np.usembassy.gov` — serves "Technical difficulties" placeholder to non-browser fetchers.
- Wikipedia infobox (29 Aug): 682+ dead, 2,980+ missing, 1,473+ injured — unattributed mix; do not use as a source.

---

## 8. Reliability / access matrix (compact)

| Source | Rel. | Access | Machine-readable | Cadence | Status |
|---|---|---|---|---|---|
| NDRRMA API publications | A | open API | JSON + PDF (mixed text/scan) | 2–4/day | [C] |
| NDRRMA rescued-persons API | A | open API | JSON (PII) | continuous | [C] |
| NDRRMA newsinfo API | A | open API | JSON + JPG | daily | [C] |
| BIPAD incident/loss | A | open API | JSON | as entered (event absent) | [C] |
| BIPAD river-stations | A | open API | JSON | 10-min | [C] |
| DHM riverWatchTableViewData | A | open (POST) | JSON | 5–10 min | [C] |
| DHM river-watch page JSON | A | scrape | JSON-in-HTML | 5–10 min | [C] |
| Police UDB | A | scrape HTML (filters) | no | continuous | [C] |
| MoFA flashflood category | A | scrape | HTML tables (28 Aug); PNG (29 Aug) | daily | [C] |
| HEOC sitreps | A | scrape | image-only | daily | [C] |
| MoHA appeal | A | download | PDF | once | [C] |
| DAO Nuwakot XLSX | A | download | XLSX (PII) | ad hoc | [C] |
| DAO Rasuwa hub | A | download | scanned PDF | ad hoc | [C] |
| Bagmati OCMCM | A | scrape | image/attachment | ad hoc | [C] |
| DoR RIMES bridge API | A | open API | JSON | static | [C] |
| MWR bulletins | A | scrape | HTML zh | ~daily | [C] |
| China MFA pressers | A | scrape | HTML en | daily | [C] |
| Xinhua English | B | scrape | HTML | multiple/day | [C] |
| US Embassy alerts | A | curl | HTML | ~daily | [C] |
| UK/Canada advice | A | fetch | HTML | as updated | [C] |
| UN RCO Flash Update #3 | A | download | PDF text | ~daily (#1–2 not online) | [C] |
| IOM sitrep #1 | B | download | PDF | ad hoc | [C] |
| IFRC GO API | A | open API | JSON | as updated | [C] |
| NRCS PDFs | B | download | PDF (one non-Unicode) | ad hoc | [C] |
| GDACS API/RSS | A | open API | JSON/RSS | continuous | [C] |
| USGS FDSN | A | open API | GeoJSON | continuous | [C] |
| ReliefWeb site | A/B | scrape (browser UA) | HTML | continuous | [C] |
| ReliefWeb API | A | gated (appname) | JSON | — | blocked |
| NTB/DoT/NEA/IPPAN/NTA/CAAN | A | — | none published | — | absent |
| Nepal Police bulletins | A | social/press only | no | 06:00 & 14:00 | [R] |

---

## 9. NEW vs already-catalogued

**Already catalogued (in the three repo files):** BIPAD incident API + its "event absent" caveat; DHM river-watch page + hydrology.gov.np; NDRRMA bulletins "daily ~10:00" (site only); DoR Navigate dashboard (no API); ReliefWeb API + GLIDE FF-2026-000162-NPL; MoFA ECR contacts; e-TIMS/NTB/Police lists as gated; NTC/Ncell CDR route; Copernicus/UNOSAT/Planet/Vantor/HOT/NESRA imagery stack; contact directory entries for NDRRMA/NEOC, MoFA ECR, DHM, NRCS/IFRC, WHO, WFP, ICRC.

**NEW in this sweep:**
1. NDRRMA REST API (`/api/v1/publication/publications/`, `/rescues/rescued-persons/`, `/pressnotenews/newsinfo/`, `/press-note/`) and the full list of 17 event PDFs with URLs/formats; two sitrep series and their timestamps; SETU app mention; VMS API + volunteer stats.
2. Nepal Police UDB structure, filters, `get-district` lookup, and per-district body counts since 26 Aug.
3. DHM `POST /site/riverWatchTableViewData` JSON feed; station/series id map; frozen-gauge timestamps; BIPAD `river-stations` live mirror + `/river/` 10-min history for the pre-collapse window; BIPAD rain staleness.
4. HEOC/MoHP SitReps 01–04 (image-only) and referral directive.
5. DAO Rasuwa flood hub + DAO Nuwakot rescued XLSX (metadata); Bagmati OCMCM statements; OPMCM/PMDRF appeal.
6. DoR Navigate's RIMES backend (bridge inventory, road-safety advisories, Excel-imported closures with no read endpoint).
7. MoFA daily nationality tables (machine-readable on 28 Aug; image on 29 Aug) and the 26/27/28/29 Aug figure chain.
8. China MWR rolling barrier-lake bulletins (5 URLs), MFA presser URLs, CGTN/Xinhua official-figure articles, second GLIDE and Tibet-side GDACS entries.
9. USGS twin landslide seismic events (02:52Z M5.2 and 06:00Z M4.2).
10. UN RCO Flash Update #3 PDF with NEOC figures; IOM sitrep #1; IRDR analysis; IFRC GO event/appeal/appeal-doc endpoints (MDRNP022); NRCS PDFs (one Preeti-encoded).
11. Consular alert URL set (US ×5, UK, Canada) and foreign-ministry counts (UA/MY/KR) with dates.
12. Dead/blocked inventory (§7) incl. ReliefWeb API v1 retirement and v2 appname gate.

---

## 10. Most valuable for an LLM aggregation corpus (ranked)

1. **NDRRMA publications API → Sitrep PDFs #4–#8** (text-extractable Canva PDFs; the only official multi-sector narrative + tables: bodies by district, missing sub-categories, rescued, shelters, health, relief, roads, barrier lake). Poll `?ordering=-id&limit=20` every 30 min; OCR the 1-page "Situation update" images.
2. **NDRRMA rescued-persons API** — for *aggregates only* (counts by nationality/country/status/rescued_location); strip names before ingestion.
3. **UN RCO Flash Update series (ReliefWeb)** — carries NEOC/MoHA numbers and sector needs in English; reconcile against NDRRMA.
4. **MoFA daily flash-flood updates** — foreigner nationality tables (parse 28 Aug HTML table; OCR 29 Aug PNG).
5. **DHM `riverWatchTableViewData` + BIPAD `river-stations`/`river`** — gauge status/hydrograph for the barrier-lake watch; label frozen stations explicitly.
6. **Nepal Police UDB** — per-district counts of recovered bodies and identification status (aggregate scrape; never store photos/names).
7. **Xinhua/CGTN + China MWR/MFA** — the only channel for Tibet-side casualties and barrier-lake volumes/risk language.
8. **USGS + GDACS + IFRC GO** — machine-readable anchors for timing (two collapse signals), GLIDE cross-walk, appeal amounts.
9. **HEOC SitReps** (after OCR) — injured/treated/referred/deaths in care, facility damage.
10. **DAO Nuwakot XLSX / DAO Rasuwa PDFs** — row counts and rescue-location distributions only; useful as ground-truth checks on NDRRMA "rescued" totals.
11. **DoR RIMES bridge inventory** — join key for "bridges destroyed" claims; US Embassy alerts as an English road-status proxy.
12. **NRCS/IFRC/IOM/WFP sitreps** — secondary confirmation and needs framing.

---

## 11. Official figure chain (all Nepal-side unless stated; as reported at the stated time)

| Date/time (NPT) | Source | Dead/bodies | Missing / out of contact | Rescued | Other |
|---|---|---|---|---|---|
| 26 Aug 17:00 | MoFA update | 72 | 403 (62 NP + 341 foreign; 25 countries) | — | — |
| 26 Aug | NTB (media) | — | 384 tourists (291 foreign, 93 NP) → 403 → 420 | — | — |
| 27 Aug | NDRRMA sitrep-5 (via NRCS/nepalnews) | 157 | 826 | — | — |
| 27 Aug | IOM sitrep #1 | 165 | 826 (579 tourists) | — | ~40 km road |
| 27 Aug 18:20 | NDRRMA (mappr) | 359 | 910 | — | — |
| 27 Aug 20:00 | MoFA | 359 | foreigners 627: 31 found / 596 missing (33 countries) | — | — |
| 27 Aug (Thu) | China (CGTN) | 3 (Tibet) | 558 (Tibet; 260 foreign) | 2 | barrier lake 2 M m³ |
| 28 Aug 07:00 | Nepal Police (HT) | 469 | 2,381 (644 foreign, 127 overseas NP) | 1,545 injured/rescued | 13,295 personnel, 15 heli |
| 28 Aug | NEOC/MoHA (UN FU#3) | 539 (538 bodies) | 977 | 3,742 | 73 injured; 12,249 personnel |
| 28 Aug 15:30 | MoFA | 538 | foreigners 632: 121 found / 511 missing | — | — |
| 28 Aug 19:00 | NDRRMA (Sitrep #7 / Xinhua) | 579 | 1,924 | 4,451 (191 from tunnels) | 16 heli; Chitwan 233, Nawalparasi E 154 |
| 29 Aug 06:00 | Nepal Police (CNN/mappr) | 616 | — | — | — |
| 29 Aug 10:00 | NDRRMA update (nxtimagine/KP) | 626 | 2,426 | 4,451 | 101 injured in hospital |
| 29 Aug 14:00 | Nepal Police bulletin (KP) | 626 (Chitwan 233, Naw E 158, Gorkha 54, Dhading 49, Naw W 47, Nuwakot 41, Tanahun 31) | 2,426 | — | — |
| 29 Aug 14:00 | MoFA briefing | 626 | ~2,400 | 4,450+ (187+ foreign) | — |
| 29 Aug 17:30 | Dept of Tourism (Xinhua) | — | 753 tourists (589 foreign) | — | — |
| **29 Aug 18:30** | **NDRRMA Sitrep #8 / Xinhua** | **675** | **2,498** | — | 242 treated (3 died in care); shelters 2,318 + 1,270 |
| 29 Aug (Fri, US) | US State Dept (media) | — | 90 Americans (5 rescued) | — | — |
| 29 Aug 22:00 | Police UDB (scrape) | 558 body records since 26 Aug | 44 missing notices | — | — |

*Definitions differ: NEOC "missing" (977) vs NDRRMA "out of contact" (2,426–2,498) vs MoFA "foreigners still missing" (511) vs DoT "tourists out of contact" (753). Any corpus must keep the source label on each number.*
