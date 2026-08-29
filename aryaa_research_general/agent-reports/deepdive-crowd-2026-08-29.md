# Deep-dive: crowdsourced / social / community / bottom-up "who was where" sources
## Bhotekoshi–Trishuli flood, 26 Aug 2026 — sweep as of 2026-08-29 ~17:30 UTC (23:15 NPT)

**Method.** 200 WebSearch queries (budget exhausted), ~90 WebFetch/curl fetches, GitHub REST API, Reddit RSS, X syndication endpoint, Telegram web preview. Nothing behind a login was accessed. **No names, phone numbers or photos were copied**; where a source holds PII only its existence, publisher, URL, format, row count and date are recorded.

**Legend.** Reliability A official · B established org/media of record · C other media/community · D social/blog/unattributed · E unverifiable. Fetch: [C] confirmed-fetched · [R] reported by another source · [U] unconfirmed. PII: Y = holds names/phones/photos of victims.

---

## 0. Headline: the three machine-readable person registries nobody has catalogued yet

| # | Source | What it is | Rows (as of 29 Aug) | Access | PII |
|---|---|---|---|---|---|
| 1 | **rescue.opmcm.gov.np** — OPMCM "Rasuwa Flood Rescue Portal" | Official PM's Office portal with an **unauthenticated JSON API** (`/api/stats`, `/api/person-reports`, `/api/help-requests`, `/api/help-offers`, `/api/emergency-contacts`, `/api/government-efforts`) | **10,792 open "lost" reports, 2,447 found, 1,716 rescued (13,353 person records; 4,723 added in last 24 h; 564 children, 362 elderly; 6,050 without contact; 707 without photo; 14 % resolution rate)** | API, no key, paginated `?limit=&page=` (4 MB/500 rows because photos are inlined) | **Y — fullName, images, locationText** |
| 2 | **ndrrma.gov.np/api/v1/rescues/** — NDRRMA rescued-persons register (the "DAO Rasuwa rescued list" everyone cites) | DRF-style REST API behind ndrrma.gov.np/np/rescue: `rescued-persons/`, `status-counts/`, `rescued-statistics/`, `rescued-locations/`, `stationed-locations/`, `statuses/`, `messages/` | **2,189 rescued persons (2,034 Nepali / 155 foreign); rescued_count 6,633 in statistics endpoint; 21 rescue locations, 11 stationing locations** | API, no key, `?limit=&offset=` | **Y — name, name_ne, age, gender, nationality, rescued_location, stationed_location, status, rescued_date** |
| 3 | **github.com/nirajbhusal/rasuwa-flood-bulletin** (+ GitHub Pages) | Individual volunteer's live compiled bulletin; 716 commits since 26 Aug 05:10 UTC; feeds found.kachhuwa.com | `ndrrma-rescue.csv/json` 2,189 rows · `army-heli-rescue.csv` 654 · `rasuwa-foreign-rescued.csv` 152 · `rasuwa-hospital-dhunche.csv` 81 · `family.json` **1,423 missing + 42 found (from two Google Sheets + Google Forms)** · `indian-crossed-2026-08-28.json` 149 · `foreign-rescued-2026-08-29.json` 54 (49 CN, 5 IN) · `dhm-rivers.json` 5 gauges · `ems927-grading.csv` | raw.githubusercontent.com, no key, CSV+JSON | **Y** |

These three, plus Setu Rapid (§1.3) and the Nepal Police Facebook lists (§1.4), are the actual substrate that every private list (eTurboNews, kachhuwa, trekking-agency blogs) is copying from.

---

## 1. Official portals that families use directly (bottom-up intake)

### 1.1 OPMCM Rasuwa Flood Rescue Portal — rescue.opmcm.gov.np  [C]  Reliability A  PII Y
- **Runs:** Office of the Prime Minister and Council of Ministers. Vite/React SPA; Google Maps; API at `https://rescue.opmcm.gov.np/api`.
- **Public routes:** `/person-lost-found`, `/help-requests`, `/help-offers`, `/emergency-contacts`, `/government-efforts`, `/donations`; admin routes exist (`/admin/person-reports` etc.).
- **`/api/stats` (29 Aug 17:20 UTC):** requests 224 (169 open, 138 critical, 48 in progress, 3 resolved) — problem types FLOOD 194, MISSING_PERSON 23; offers 105 (all available); persons: total 13,353 / lost 10,787 / found 2,447 / rescued 1,716 / open 11,399 / resolved 1,835 / pinned 2,890 / last24h 4,723 / openOver48h 6,557 / withoutContact 6,050 / withoutPhoto 707 / avgResolveHours 15.4 / topLocation "नखुलेको" (unspecified) 680.
- **`/api/person-reports` schema:** `_id, importRef, approximateAge, createdAt, daoOffice, daoStatus, description, fullName, gender, images[], locationText, source, status, type, updatedAt`. Filters `?type=lost|found|rescued`, `?limit=`, `?page=`. Total 10,787 → 10,792 within ~15 min (live).
- **Provenance signal (100-row sample, page 3):** `source` = "dao" 64 % (importRef `dao:…`, daoOffice "DAO Sindhupalchok" 62, "DAO Dhanusha" 2) vs untagged 36 %; gender MALE 81 / FEMALE 13; 31 % with photo; all created 29 Aug. **Location texts in the DAO-imported block are Sindhupalchok wards (Bahrabise, Bhotekoshi RM wards 2–5) plus "Gyirong Port"/"Kerung border"** — i.e. District Administration Offices are bulk-uploading their own missing-resident lists (traders/drivers who work the Kerung route), and there is a name-collision risk between *Bhotekoshi River (Rasuwa)* and *Bhotekoshi Rural Municipality (Sindhupalchok)*. Flag for any reconciliation work.
- **`/api/help-requests`** (220 total): `referenceId REQ-000xxx, reporterName, phone, reportingFor, problemType, helpTypes, title, description, affectedCount, urgency, status, province, district, municipality, ward, placeName, location{Point}`; 159/200 geocoded; 178/200 have blank district. **PII Y.**
- **`/api/help-offers`** (105): providerType, providerName, contactPerson, phone, resourceTypes, capacity, serviceRadiusKm, location. **PII Y.**
- **`/api/government-efforts`** (90 items): official notices mirrored from nepal.gov.np incl. "रसुवा भोटेकोशी बाढी: सम्पर्कबिहीन नागरिकहरूको विवरण" (29 Aug 10:59) and "त्रिशूली ३ए सुरुङबाट उद्धार सम्बन्धि सूचना" (29 Aug 15:38). No PII.
- **`/api/emergency-contacts`** (17): Police ×2, ambulance ×2, fire, NDRRMA, MoFA foreign-national coordination cell, NRCS, Women/Children ministry, NCRC, SWC, Bir Hospital. No PII.
- **Languages:** Nepali + English. **Cadence:** live. **Ethics:** the entire missing-persons dataset with photos is world-readable without auth — exactly the exposure DO_NO_HARM.md warns about; do not mirror, and consider a responsible-disclosure note to OPMCM/NDRRMA.

### 1.2 NDRRMA rescued-persons register — ndrrma.gov.np/np/rescue  [C]  A  PII Y
- Front-end is a Vite SPA over `https://ndrrma.gov.np/api/v1` (and `bipadportal.gov.np/api/v1` for other data). Discovered endpoints (all 200, no auth):
  - `/api/v1/rescues/` index → `rescued-persons/`, `rescued-locations/`, `stationed-locations/`, `statuses/`, `rescued-statistics/`, `messages/`, `status-counts/`.
  - `status-counts/` → `{"total_count":2189,"nepali_count":2034,"foreign_count":155,"status_counts":[Safe 0, Under Medical Care 8, "Obtained Rescued Name List" 2181]}`.
  - `rescued-statistics/` → `{"rescued_count":6633,"active":true}` (the headline figure; the 2,189 is the *named* subset).
  - `rescued-persons/?limit=&offset=` → count 2,189; fields `id, name, name_ne, age, rescued_location, stationed_location, status, rescued_date, nationality, country, gender, remarks`.
  - `rescued-locations/` 21 named places with centroids; `stationed-locations/` 11 (where rescued people are being held — a clean "who is where now" layer, no PII).
- Republished as: Ratopati 27 Aug "DAO publishes list of rescued individuals" [R, 403 to fetch]; The Tourism Times 28 Aug (serials 659–771, 114 rows, ~91 Indian/14 Chinese/8 Korean/2 US/2 Italian) [C]; educatenepal blog 28 Aug pointing to ndrrma.gov.np/np/rescue [C]; rishabh-jain/nepal-2026-floods-data `rescued_people_list_dao_list.csv` 241 rows (fields serial_number,name,age,gender,remarks) + an NDRRMA notice PDF dated 27 Aug 12:42 [C].

### 1.3 Setu Rapid — setu.ndrrma.gov.np  [C]  A  PII Y
- "DOR Duty Coordination & NDRRMA Command Center" (PHP). NDRRMA launched it 28 Aug for relatives to file missing-person forms; OnlineKhabar 28 Aug: **~1,500 forms received**, acknowledged duplicates; 977 confirmed missing at that time. [C]
- Public pages: `admin/help.php` "Request Help – Rasuwa Flood" (fields: name, phone, address, lat/lng, others_count, per-person `pl_name[]/pl_age[]/pl_gender[]/situation[]`); `admin/rescue.php` "Relief Needs" (qty[food|water|tent|tarpaulin|blanket|clothing|medical|rescue], people_affected, urgency, ward); `admin/recordlist.php` "Rescued & Missing Persons – Rasuwa Flood" (public card list: ~193 Missing / 8 Found / 8 Safe / 2 Rescued at 29 Aug 17:30 UTC). Store buttons present but no app-store links resolved. Donations route to pmdrf.nchl.com.np.
- Access: scrapeable HTML, no API found, no auth on record list.

### 1.4 Nepal Police — Facebook lists + Unidentified-Bodies DB  [R]/[C]  A  PII Y
- **Missing-persons list on Facebook page `NepalPolicePHQ`** (post `facebook.com/share/p/1DENN4cCXZ/` → resolves to `/NepalPolicePHQ/posts/pfbid0zzBpHFZ7d9…`), published 27 Aug: names, birth year/date, nationality. Republished: NEPYORK (65 US citizens, 27 Aug) [C]; NST/Malay Mail/The Star (23 Malaysians, then 51, 28 Aug) [R]; Pardafas (27 police personnel by name, 29 Aug) [R]. **Facebook is login-walled to scrapers (fetch returned 1.5 KB redirect); republications are the practical route.**
- **QR code → unidentified-bodies list** with face photos + physical description (OnlineKhabar 27 Aug) [C]. QR target not printed in text; hospitals display the same QR. The standing portal `udb.nepalpolice.gov.np` is reachable from outside Nepal at check time (HTTP 200, Laravel app, "नेपाल प्रहरी | गृहपृष्ठ") — contrary to the earlier "unreachable" note in active-channels-2026-08-29.md.
- OnlineKhabar 28 Aug: 489 bodies recovered, 393 unidentified [R].

### 1.5 Nepal Tourism Board — @nepaltourismb on X, ntb.gov.np  [C]  A  PII (situation-update images list agencies, nationalities; the signed 27 Aug 12:00 record lists individuals) 
- X post 2092538936929419337 (26 Aug 09:05 UTC): "Bhotekoshi Flash Flood SITUATION UPDATE-2 … Preliminary Details of Missing Tourists" + image. Retrieved via `cdn.syndication.twimg.com/tweet-result?id=…&token=a` (no auth). 62 likes.
- Agency-wise preliminary counts (26 Aug, 10 agencies): Trekkers Society 92, Samrat Tours & Travels 71, Leaf Holiday 55, Himalayan Glacier 52, Kailash Journey 31, Fishtail 27, Alpine Eco Trek 20, Kathmandu Holiday Tours 17, Richa Tours 12, Explore Vacation 7 (Tribune/Himalayan Times) [R].
- Series: 384 (26 Aug) → 644 (27 Aug 12:00; 517 foreign, 127 Nepali) → 668 from 34 countries (Dept of Tourism, 27 Aug) → 420 still out of contact, 184 rescued, 3 re-contacted (NTB 29 Aug via NxtImagine). ntb.gov.np/en/latest-travel-updates does **not** carry the lists (page shows old notices) [C].

### 1.6 MoFA Nepal Emergency Control Room  [C]  A
- Notice 27 Aug "ECR for Assistance regarding Foreign Nationals Affected by the Bhote Koshi Flash Flood": info@mofa.gov.np, +977-1-4200182/3/4/5. No web form, no published list. Announced via Nepal Embassy India on X (@EONIndia status 2092990545446760621).

### 1.7 District-level collection  [R]  A
- Dhading DAO "बेपत्ताको विवरण संकलन" ongoing 26 Aug (NepalFace) — mechanism not stated. Rasuwa DAO rescued list → §1.2. Nuwakot DAO feeds NDRRMA list (Tourism Times).

---

## 2. Independent trackers, dashboards and registries

| Source | URL | Runs | Holds | Format / access | Volume | Lang | Cadence | Rel | Fetch | PII |
|---|---|---|---|---|---|---|---|---|---|---|
| **Rasuwa Flood Bulletin** | nirajbhusal.github.io/rasuwa-flood-bulletin/ ; repo nirajbhusal/rasuwa-flood-bulletin | one individual (GitHub user nirajbhusal) | Compiled NDRRMA/Army/DAO/hospital lists, DHM gauges, EMSR927 grading, family missing/found registry, a names index (`names-index.js`, 34 KB), i18n | GitHub Pages + raw CSV/JSON, no key | see §0; 1.8 MB index.html; 716 commits | NE (primary), EN | continuous (latest 29 Aug 21:56 NPT) | C (compiles A-sources) | [C] | **Y** |
| **Missing & Found — found.kachhuwa.com** | found.kachhuwa.com (`/`, `/visualization/`, `/information/`, `/tool/`); repo b1nay/missing-found-rasuwa-flood | anonymous volunteer (GitHub b1nay), Vercel | Search UI over **the same `family.json`** (fetches raw.githubusercontent.com/nirajbhusal/…/family.json); embeds a Google Sheet preview; Report Missing / Add Found / Mark Safe / Ask for Rescue buttons **go to WhatsApp** (wa.me) | static site; data = bulletin's JSON; `api/` dir in repo | 1,423 missing / 42 found | NE, EN, HI, ZH, RU, ES, FR | with bulletin | C | [C] | **Y** |
| **Nepal Flood Live** | nepaldisasterupdatelive.nxtimaginelabs.com (+ `/ne/`, `/feed.xml`, `/nepal-flood/emergency-numbers/`) | NxtImagine Labs (volunteer, "not a government site") | Sourced timeline, district body counts, NTB/NDRRMA figures, hydropower damage, links to govt portals | HTML + RSS; no API | multiple bulletins/day | EN, NE, HI, ZH | live | C | [C] | N (no victim names) |
| **Rescue Nepal registry** | rescuenepal.info (`/find`) | "LabHexa" — on 29 Aug the front page now reads "Dead Body Mapping System … Rapid disaster & public safety reporting" (GPS + photo reports of human/animal remains) | 3 reports (1 human, 2 progressed); earlier 5 public cases | web forms; no API; `/find` 404 | 3–5 | EN, NE | dormant | E | [C] | low |
| **rasuwaflood.org** | rasuwaflood.org; repo apilkc/rasuwaflood | student researcher (APIL K.C.) | Source-based record; automated news index every 3 h (`data/archive.json` 154 items; top feeds myRepublica 25, KP 23, Khabarhub 22) | GitHub Pages JSON | 154 | EN | 3-hourly | C | [C] | N |
| **2026 Nepal Floods routing tool** | 2026-nepal-floods.vercel.app; repo iyersamridhi/2026-nepal-floods | volunteer | Wizard routing families to official channels; `data/records.json`, `helplines.json`, `sources.json`, `twitter_bulletin.json` (6 items; scraper needs X bearer token + Grok summariser; configurable list of authority handles) | static + JSON | small | EN | GitHub Action | C | [C] | N (explicitly refuses to hold names/photos) |
| **Nepal Flood 2026 SAR Coordination Board** | nepal-flood-2026-board.vercel.app; repo kritagya93/Nepal-Flood-2026-Board | Kritagya Raj Upadhyay (Asst Prof CS, MTSU), personal | Community-submitted missing persons, incident reports, shelter/resources, AI helpdesk; Firestore **in test mode (publicly readable/writable)**; "all data unverified" | SPA; Firestore | unknown (page JS-only) | EN/NE | live | D | [C] repo, [U] data | **Y (by design)** |
| **Central Missing-Person Resolution System** | repo mayhem82/central-missing-person-resolution | individual | Schema/engine for reconciling *claims about persons* across sources; seeded with a Makwanpur family-appeal vs DAO-record conflict; explicit conflict taxonomy | code + docs | 1 seed case | EN | 29 Aug | D | [C] | minimal |
| **Rasuwa Flood Map (eyewitness videos)** | flood.thimitech.com | Thimi Tech (private) | Map of eyewitness videos (per iamtekson/links.md) | React SPA, no discoverable JSON | unknown | — | — | D | [C] shell only | N |
| **Nepal Flood 2026 map** | nepal-flood-map.pages.dev | HOT/HDX-derived (author unnamed) | Flood extent 31.7 km², bridges, fAIr damage, BIPAD incidents, barrier-lake zones; 4.1 MB PMTiles, rebuilt daily | static | — | EN | daily | C | [C] | N |
| **Rasuwa flood data portal** | iamtekson.github.io/rasuwa-flood/ (+ `links.md`) | GIS developer | MapLibre layers; links.md is a curated source list incl. an NGES/HOT crowdsourced building-mapping Facebook post (`facebook.com/share/p/184FWJHTD3/`) and Zenodo ICIMOD record 22111526 | static | — | EN | 28 Aug | C | [C] | N |
| **ReadyMapper (CrisisReady/AIDMI)** | aidmi-datahub.github.io/readymapper-aidmi/#/disaster?disasterId=2026-nepal-floods | AIDMI | damage/mobility layers + a "News Sources" layer of source-attributed facts | static Vue | — | EN | 29 Aug | C | [C] repo | N |
| **Gyirong/Rasuwa COP** | open-sar-cop.github.io/np-rasuwa-landslide-2026/ | "open-sar-cop" (Chinese-language OSINT) | 3-D COP with forces/shelters/barrier lake; `sources.md` cites gov.cn & news.cn | static | — | ZH/EN | 29 Aug | D | [C] | N |
| **mappr.co** | mappr.co/nepal-flash-flood-rasuwagadhi/ | commercial map blog | nationality/occupation breakdowns, no lists | HTML | — | EN | 29 Aug | C | [C] | N |
| **Wikipedia 2026 Nepal floods** | en.wikipedia.org/wiki/2026_Nepal_floods (also ne.wikipedia २०८३ रसुवा बाढी, zh.wikipedia 2026年中尼边境泥石流灾害, and a separate "2026 Nuwakot Flood" article) | community | consolidated counts, no lists | wikitext API | — | EN/NE/ZH | hourly | C | [C] | N |

**Google Sheets / Forms found (metadata only):** (a) source sheet + (b) Google-Form responses sheet referenced in `family.json` fields `sheet` / `responses_sheet` (1,423 missing, 42 found, matched 0, updated 29 Aug 17:23 NPT); (c) a third sheet embedded as `/preview` iframe in found.kachhuwa.com `script.js`. Provenance of the sheets is not documented anywhere (E). Airtable/Notion pages: none found. Ushahidi/Sahana/Google Person Finder: none found (confirmed again).

**eTurboNews private table (metadata only):** eturbonews.com/nepal-flood-disaster-updated-list-of-missing-foreign-tourists-and-visitors/ — published 27 Aug by eTurboNews, attributed to "a private initiative"; **655 rows**; columns: seq, name, age, address/origin, last-contact location, last-contact date/time, phone(s); links onward to found.kachhuwa.com. Companion live page eturbonews.com/nepal-tibet-flash-flood-tourists-missing/ (26–29 Aug) carries nationality tables only. Reliability E for the table. Do not link/mirror.

---

## 3. GitHub repositories (search `nepal flood 2026`, `rasuwa|bhotekoshi|trishuli pushed:>2026-08-25`; 22 + 28 hits, deduped)

| Repo | Pushed | What | Person-level data? |
|---|---|---|---|
| nirajbhusal/rasuwa-flood-bulletin | 29 Aug | §0/§2 — the richest | **Y** |
| b1nay/missing-found-rasuwa-flood | 29 Aug | found.kachhuwa.com source; `api/`, `sources/`, `tool/` dirs | via bulletin |
| rishabh-jain/nepal-2026-floods-data | 28 Aug | DAO rescued list CSV (241 rows) + NDRRMA notice PDF | **Y** |
| kritagya93/Nepal-Flood-2026-Board | 28 Aug | community SAR board (Firestore) | Y (user-submitted) |
| mayhem82/central-missing-person-resolution | 29 Aug | reconciliation engine + schema | seed only |
| iyersamridhi/2026-nepal-floods | 28 Aug | routing tool, X scraper, helplines JSON | N |
| apilkc/rasuwaflood | 29 Aug | rasuwaflood.org news index | N |
| geo-pera/bhotekoshi-2026-reconstruction | 29 Aug | flood physics reconstruction, 13-layer GPKG (MIT / CC-BY-NC) | N |
| iamtekson/rasuwa-flood | 28 Aug | GIS portal + curated links | N |
| AIDMI-DataHub/readymapper-aidmi | 29 Aug | ReadyMapper build | N |
| open-sar-cop/np-rasuwa-landslide-2026 | 29 Aug | Chinese OSINT COP | N |
| aviskarrr/rasuwa-flood | 29 Aug | "FIELDNOTE NEPAL/01" satellite dossier (rasuwa-flood.vercel.app) | N |
| cgiovando/disaster-imagery-viewer | 29 Aug | imagery viewer (already catalogued) | N |
| dulcetberg/nepal-flood-response-map, khalilurrrahmanridoykhan/nepal-flash-flood-dashboard, nrahaman1/rasuwa-cascade-3d-map, Surendra1204/trishuli-flood-2026, DBishal13/fflood-nep, gor-ub/nepal-2006-flood, asoto59g/Nepal, YasuhiroMurakami/NEPAL_20260826_FLOOD, Nichalaks/NPL_FL_Rasuwa2026, studio-public-demos/nepal-flash-flood-digital-twin | 27–29 Aug | imagery/maps/before-after | N |
| Zunkireelabs/nepal-emergency-response | 26 Aug | Next.js + Supabase scaffold ("real disaster-response app"), no content | N |
| rmsnea2082-alt/nea-response-system | 27 Aug | Flask "NEA Disaster Response System" (unofficial-looking) | unknown |
| mapsaashish/nepal-flood-portal, ashmitajimba755-cpu/rasuwa-flood-bulletin, PadamKafleNepGOV/RasuwaFloodRelief, sushilbhattarai45/rasuwa, Ashish-Dutta007/* | 27–28 Aug | empty or placeholder | N |
| dbaskota27/stand-with-nepal, GurkhaShieldForce/nepal-flood-relief, surajkumarnavodya/…solidarity, amahara-builds/…, rajdigitals629/nepalfloods, malchiraj-dotcom/nepal(i)floods, Crystal-Bell/Global-Disaster-Event-Report | 27–29 Aug | donation hubs / SEO pages | N |

Access: `api.github.com` unauthenticated = 10 req/min (hit the limit mid-sweep); `raw.githubusercontent.com` unlimited for public files.

---

## 4. Social platforms

### 4.1 X / Twitter  [C via syndication]  D–A depending on account
- **Hashtags in use:** #NepalFloods, #NepalFlood, #Nepal, #Rasuwa, #FlashFlood, #RasuwaFlood, #BhotekoshiFlood, #Kailash; HOT's changeset tag #nepal-flood-2026-trisuli-bhotekoshi.
- **Key accounts observed posting event data:** @nepaltourismb (NTB situation updates with lists as images — A), @EONIndia (Nepal Embassy India: MoFA ERT notice — A), @ANI (video + PM Modi call), @DropSiteNews, @InsiderGeo, @WeatherMonitors (early counts, 26 Aug 08:xx UTC), @ankitsharmauk ("Nepal Floods Missing List … 403 … 133 Indians, 62 Nepalis, 47 US, 33 UK, 34 AU, 24 CA" — D, republishes NTB list), @ravipandey2643, @SaffronSunita, @Saimakomal129 (D, engagement accounts). Sadhguru (@SadhguruJV) posted the 77-pilgrim statement 26 Aug [R]. Nepal Police (@NepalPoliceHQ) and NDRRMA X accounts not verified this sweep [U].
- **Access:** X search/API is paid-tier; but `https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a` returns full tweet JSON (text, media URLs, counts) without auth — good for known IDs. `publish.x.com/oembed` returned HTTP 402. Volume: WebSearch surfaced ~10 distinct data-bearing posts; true volume likely thousands/day (unmeasured).

### 4.2 Facebook  [R] mostly; login-walled  A–D
- **Pages carrying primary lists:** Nepal Police HQ `facebook.com/NepalPolicePHQ` (missing lists 27 Aug; QR to unidentified bodies) — A; NDRRMA official page (linked from NxtImagine) — A; NGES/HOT crowdsourced building-mapping post `facebook.com/share/p/184FWJHTD3/` — C; Trekking In Nepal `facebook.com/trekkinginnepalofficial` (posts 26–27 Aug "sudden massive flood… damage in Syabrubesi", "Syabrubesi before the flood") — C; @nepalhackathon page — C; an anonymous page (id 61571489162415) "MASSIVE FLASH FLOOD IN RASUWA…" — D.
- **Groups:** no public Rasuwa/Tamang/Langtang missing-persons *group* surfaced in 200 searches (Facebook group content is not indexed). Reported in press only as "social media appeals" (CNN, ABC). [U]
- **Access:** every fetch of a post/page URL returned a login redirect (1.5 KB). Practical route = republications (NEPYORK, NST, Pardafas, OnlineKhabar) or a logged-in browser session; Graph API needs app review. Do not scrape.

### 4.3 Reddit  [C via RSS]  D
- **r/Nepal** (25 hits, week): "ISO Translator for Missing Poster" (28 Aug, a family seeking Nepali translation of a missing poster) · "Need update on missing people from Devighat Hydropower" (27 Aug) · "Upper Trishuli 3B hydropower update?" (27 Aug) · "narrow escape from the recent flood" (27 Aug, first-person) · "Kailash Yatra / Nepal Floods" (27 Aug) · "In loving memory of the departed soul of Rasuwa_10-05-2083" · "Why are uncensored photos of flood victims being published?" (29 Aug, ethics of body-photo lists) · "Where to contact for volunteer?" · "Nepal disaster payment server down" (r/NepalSocial, PMDRF gateway).
- **r/india** (7): "If someone you know is trapped in Nepal" (27 Aug, helpline compilation) · "287 Indians still missing … 120 crossed over" (29 Aug) · "Over 100 Indian Pilgrims Among the Missing" (26 Aug).
- **r/NepalSocial** (25): mostly opinion; "Press briefing and QA from Foreign minister" (29 Aug). r/trekking, r/malaysia, r/singapore, r/australia: 0 hits for the query.
- **Access:** `www.reddit.com/r/<sub>/search.rss?q=…&restrict_sr=1&sort=new&t=week` works with a browser UA (JSON endpoints and old.reddit are blocked from this environment; per-thread `.rss` returned only the OP for one thread and empty for others — rate-limited/blocked). Reddit's official API needs OAuth; public RSS is the practical route (throttle ~1 req/2 s).

### 4.4 Telegram  [C]  D
- **t.me/poshuknepal — "ПОШУК 🇺🇦 Непал"** (Search Ukraine Nepal): created by relatives of the ~55 missing Ukrainians (two retreat/pilgrimage groups of 47 and 7, tour 11–26 Aug, last contact 26 Aug 09:00; Blik.ua 27 Aug). **≈4,359 members, 2,174 online at fetch (29 Aug).** Posts not retrievable via `t.me/s/` from this environment (302 to app), but WebFetch returned the header. Ukrainian MFA figure: 56 missing (29 Aug), no casualties; MFA is tracing via an undisclosed GPS-tracker vendor through Interpol (Kyiv Independent).
- No Nepali-, Hindi- or English-language event channel found via search. [U]
- **Access:** `t.me/s/<channel>` public preview normally scrapeable (HTML, ~20 posts/page, `?before=` pagination); blocked here by 302 — retry from a residential IP or use Telethon with a user account (no API key cost).

### 4.5 YouTube  [R]  C–D
- Found via site: search: N18G/News18 ("EYEWITNESS VIDEO…", "Exact Moment…"), a Nepali live stream "Rasuwa Flood live | rasuwa badhi…" (BuAe6phJbUo), "RASUWA FLOOD LIVE: 4 PM LATEST UPDATE" (dc7VSPoZUNE), explainers (IC5ntuSYd0w, k82WvJcpnLE), shorts (XWzDPfAEQgk, XLLnAhmC5rQ, ii-m3lORm-Q, AEIC1ujp3CU). CNN video "'Like a tsunami': US survivor describes Nepal flooding" (28 Aug). Nepal Army tunnel-rescue footage (Fox/ANI).
- Access: Data API v3 (free key, 10k units/day) for search + comments; results page is JS-only to curl. Survivor vlogs: none confirmed yet; Nepali-language live streams are the likelier "who was where" carriers.

### 4.6 TikTok / Instagram  [U]
- TikTok discover page returned only a title (JS); site: search surfaced nothing indexed. Instagram: hashtag pages login-walled; press reports Instagram video appeals by a Singaporean family (Mothership 28 Aug) and AI-fake before/after posts (Lead Stories). Isha/Sadhguru Instagram presence likely but unverified. **Access:** both require logged-in sessions or paid scrapers; treat as [U].

### 4.7 Chinese platforms (Weibo/WeChat/Douyin/Xiaohongshu/Zhihu)  [R]  C
- Epoch Times / NTD (27 Aug): disaster posts and videos being deleted or set "visible only to self"; leaked directive to route coverage through state outlets and downplay Tibet-side casualties; ~200 families gathered at a checkpoint ~26 km from Gyirong. ifeng.com first-person feature ("亲历西藏吉隆口岸泥石流") describes several hundred people queuing at customs on 23 Aug, dozens of Chinese seeking vehicles, tourists from US/UK/Malaysia, a construction crew of 10+; state figure 558 missing Tibet side (260 foreign). Chinese Embassy Kathmandu: 6 Chinese + 8 Nepali workers missing from a Chinese-assisted border-facility project. `s.weibo.com` returns 302 (login) from here. **Access:** effectively closed; rely on ifeng/Caixin/state media and diaspora reposts.

### 4.8 Bluesky / Threads / Mastodon / Discord / Slack  [U]
- Not checked (search budget exhausted); no Discord/Slack for this event surfaced in any of ~10 volunteer-hub queries. HOT coordination is via Tasking Manager + email (bernard.heng@hotosm.org), no chat channel listed on the OSM wiki.

---

## 5. Trekking / travel operators (status pages and stated client counts)

| Operator | Statement / page | Counts & locations (date) | Channel for families | Rel | Fetch |
|---|---|---|---|---|---|
| Himalayan Glacier (US) | himalayanglacier.com/rasuwagadhi-nepal-china-border-flood-incident-2026/ | 47 (40 pilgrims + 7 Nepali staff; AU 15, CA 10, US 8, SG 2, UK 2, NP 2, RU/US 1) at Rasuwagadhi 25–26 Aug; "all unaccounted" (27 Aug); Mothership gives 46 | **dedicated family WhatsApp group** via +1 860-593-1567 / +977-9702081300; "only verified info" | B | [C] |
| Leaf Holiday(s) Treks & Expeditions | via The National 28 Aug, FMT | 55 missing (46 clients + 9 staff; MY, SG, UA, IT, US, UK, NP) at border immigration ~08:30 26 Aug; 23 Malaysians | not stated | B | [C] |
| The Trekkers' Society (Isha partner) | via The National / Tribune | 89 (77 foreign pilgrims + 12 Nepali staff); returning from Tibet, reached immigration ~08:00 | names submitted to authorities | B | [C] |
| Samrat Tours & Travels | via NTB list | 71 listed (59 Indians) | — | A (NTB) | [R] |
| Kailash Journeys | via ABC/BusinessToday | 6 Australians + Britons + 9 Malaysians (per NST) | — | B | [R] |
| Fishtail Tours & Travels | via BusinessToday/MASFIH | 27 travellers (incl. 17 Malaysians) | — | B | [R] |
| Alpine Eco Trek | via BusinessToday/The National | 12 Britons + 4 South Africans + 4 Nepali guides, Kailash tour | — | B | [R] |
| Kathmandu Holiday Tours & Travels | via The National/ABC | 17 (3 staff), near immigration 07–08:00; 1 Australian | working with families/army | B | [C] |
| Dream Tibet Travel & Tours | via MASFIH | 8–9 Malaysians | — | C | [R] |
| Richa Tours & Travels / Explore Vacation | NTB list | 12 / 7 | — | A | [R] |
| Kumbakonam (TN) private agency | via ThePrint/SouthFirst | 57-member group, 37 missing | TN helplines | B | [R] |
| Intrepid Travel, World Expeditions, G Adventures | via ABC | all clients/staff safe | — | B | [R] |
| A Malaysian tour group | via Malay Mail | 56 (39 MY, 4 SG, 3 CA) safe in Tibet, continuing to Kailash | — | B | [R] |
| **Langtang/Gosaikunda operator advisories (no client lists, but trail-segment status):** treklangtang.com (27 Aug; +977 WhatsApp), magicalnepal.com (27 Aug), nepaltrekhub.com "live updates", basecamphike.com, bigskytreks.com, havenholidaysnepal.com ×2, trekkingtopnepal.com, travelhimalayanepal.com ×2, theeverestholiday.com (helplines page; offers to phone Nepali contacts for foreign families), marveltreks.com, majestictrailsnepal.com, himalayan-masters.com, annapurnatrekking.com, greenvalleynepaltreks.com, boldhimalaya.com, mountainroutes.com, outshineadventure.com, indexadventure.com, happymountainnepal.com, himalayanvista.com, silvermoonadventure.com, nomadlawyer.org, nepaltourismhub.com, himalayaguidenepal.com | consistent claim: Kyanjin/Langtang village/Lama Hotel untouched; Syabrubesi/Timure/Betrawati destroyed; Dhunche route reopened for light vehicles via Tokha–Chhahare; Thulo Syabru hosting descending trekkers | mostly SEO blogs; C–D | [C] several |
| TAAN | taan.org.np; Yentra forum thread (yentra.com, XenForo, 1 post, no replies) | safety notice/route status; TAAN urged diplomacy on Kailash route (Tribune) | — | B | [C] |
| Nepalkhabar 28 Aug | en.nepalkhabar.com/news/detail/15633/ | "12 trekkers stranded in Langtang rescued; search on for 4 missing using drone" | — | B | [R] |

---

## 6. Pilgrimage organisations and group-level "who was where"

- **Isha Foundation / Sacred Walks (Tennessee-registered nonprofit; Sadhguru on X, 26 Aug):** 77 pilgrims + 3 volunteers at the **Gyirong immigration building** minutes before the wave; 46 women/34 men from 19 countries (US 22, CA 12, AU 11, UK 9, DE 4, FR 3, NP 3, NL/NZ/SG/ES 2 each, FI/HU/IL/LT/PH/PT/RU/ZA 1). No contact as of 29 Aug; Chinese team reached the site 29 Aug and found ruins (BusinessToday). A separate Isha-associated group of 28 from Visakhapatnam was 50–100 m behind the wave and is safe (Tribune 28 Aug). Isha statements via ANI/press; no public list or web form found; TN helplines 1800 309 3793 / +91 80 6900 9900. [R/C]
- **Kolkata 32-member Kailash group** (30 pilgrims + 2 managers; left 21 Aug; at Rasuwagadhi immigration ~08:30 26 Aug) — West Bengal helpline 033-24793311 / 9147890181 (Bhabani Bhavan). [R]
- **Bhopal: 29 relatives missing after Gosaikunda trip** (Dainik Jagran MP 28 Aug; 403 to fetch). [R]
- **Gosaikunda/Janai Purnima crowd:** ≥62 missing Nepali citizens were locals trekking to Gosaikunda for the festival (PBS/AP 26 Aug). [R]
- **Malaysia — MASFIH ("Malaysia Solidarity: Families in Hope")** family network for 49 missing (Leaf 23, Fishtail 17, Dream Tibet 9); demands a single daily channel and liaison officers; 72 Malaysians confirmed safe in Darchen; Wisma Putra family briefing 30 Aug. [C]
- **Indian state control rooms compiling lists:** Karnataka SEOC "compiling a list of Karnataka residents stranded in Nepal/TAR"; TN 37 missing; WB 32; Kerala NORKA (36 reported safe); UP 1070; Maharashtra 1070/+91-9321587143; Sikkim, Odisha, Uttarakhand, Chhattisgarh; Gurugram DC helpline (ANI 28 Aug). MEA: 84 Indians rescued, ~320 uncontactable (29 Aug); 149 crossed China→Nepal on 28 Aug (list in bulletin repo). [C]

---

## 7. Hydropower companies and contractors (worker counts by source)

| Project | Source of count | Count (date) |
|---|---|---|
| Upper Trishuli-1 (216 MW; NWEDC; Doosan Enerbility EPC, KOEN equity, Andritz Hydro E&M) | IPPAN (27 Aug): 76 Andritz + 11 NWEDC out of contact; 12 at headworks + 200+ at powerhouse awaiting rescue · Nepali Army (28–29 Aug): 350 then 254 rescued, "100+" still in tunnel · Korea Herald/JoongAng/Yonhap (27–29 Aug): **9 Koreans missing (6 Doosan, 3 KOEN)** of 16 on site; 10 Doosan staff evacuated with ~200 others; Doosan CEO + 8 and KOEN 6 flew in; 2 chartered helicopters 29 Aug · Gulte: 63 Indians among ~350 evacuated | |
| Rasuwagadhi (111 MW) | company info officer 49 (KP 29 Aug) / IPPAN 51 (27 Aug) / Ratopati 93 [R]; 4 rescued (Rising Nepal) | |
| Chilime (22.1 MW) | Chilime Hydropower Co.: 8 missing, 6 in mud-filled tunnel (KP 29 Aug); earlier 15–20 | |
| Langtang Khola (20 MW) | promoter: 60 trapped in tunnel (25 staff + 35 workers) 27 Aug → 42 missing, 18 rescued 29 Aug | |
| Upper Trishuli-3 / 3A / 3B (NEA) | Trishuli Hydropower Co.: 128 unaccounted after 85 rescued; NEA employee appeal 35+ at 3A; NEA 20–25 at 3B; OPMCM notice "त्रिशूली ३ए सुरुङबाट उद्धार" 29 Aug | |
| Mailung Khola (5 MW) | IPPAN: 8 at powerhouse + 2 Sinohydro missing; 5 sheltering in village | |
| Devighat | Reddit r/Nepal family appeal 27 Aug, no official figure found | |
| **All projects** | **IPPAN: 934 people across 11 projects unaccounted (Ratopati "with list", 29 Aug — list format not verified, 403)**; Ministry: ~350 rescued by 29 Aug; earlier IPPAN 215 out of contact / 212 awaiting rescue across 5 projects (27 Aug) | |
Chinese contractors (customs-building project): 6 Chinese + 8 Nepali missing (Chinese Embassy). No company-run public lists found; IPPAN (ippan.org.np) statement page not located.

---

## 8. Diaspora networks

| Network | Evidence | Rel/Fetch |
|---|---|---|
| NRNA UK | GoFundMe "Stand With Nepal" (created 26 Aug; **£17,965 of £50,000, 288 donors** at 29 Aug); relief only, no lists | B [C] |
| NEPYORK (US Nepali outlet) | republished police list of 65 US citizens (27 Aug) | C [C] |
| Nepali Cultural Center, Atlanta | vigil Sunday; 5,000-strong community (CBS) | C [R] |
| Ukrainian relatives | Telegram poshuknepal (§4.4), 4.3k members | D [C] |
| MASFIH (Malaysia) | §6 | C [C] |
| US families | WhatsApp group of families of missing US citizens (CNN 27 Aug, already catalogued) | B [R] |
| NRNA global / NSAs | no lists or appeals found beyond UK fundraiser | [U] |

---

## 9. Embassies / consulates — citizen counts and intake channels (as of dates shown)

| Country | Channel | Count |
|---|---|---|
| India | Embassy WhatsApp/phone +977-9851316807, +977-9709107500, +977-9810326117; MEA control room; state rooms (§6) | 105→133→178→~287–320 missing; 84 rescued (29 Aug) |
| USA | KathmanduACS@state.gov (name, location, status, tour company); 1-888-407-4747 / +1-202-501-4444; embassy alert pages np.usembassy.gov (26 Aug + "Continuing Flood Risk") | 47→65→90 missing, 5 rescued (CBS 29 Aug) |
| Australia | DFAT CEC 1300 555 135 / +61 2 6261 3305; Embassy +977 1 437 1678; Smartraveller | 34→35→39 missing; 43 consular cases (Wong) |
| UK | FCDO crisis centre "around the clock"; families flying to Nepal; £5 m aid | 33 missing (incl. a 13-year-old) |
| Canada | GAC EWRC +1 613-996-8885, SMS +1 613-686-3658, **WhatsApp +1 613-909-8881, Signal +1-613-909-8087**, sos@international.gc.ca; ROCA shows 820 registered in Nepal, 5 in TAR | 24→25→30 citizens/PRs |
| South Korea | MOFA rapid-response team; Doosan/KOEN family liaison | 9 missing, 10 safe |
| China | Embassy statement; Chinese MFA "100 Chinese nationals missing in Nepal"; Tibet side 558 missing (260 foreign) | |
| Malaysia | Wisma Putra; embassy Kathmandu/Beijing; family briefing 30 Aug | 11→17→55→49 (2 safe) |
| Singapore | MFA statement 27 Aug; Crisis Response Team deployed from High Commission New Delhi | 9 missing |
| Ukraine | MFA; embassies Delhi/Beijing; honorary consul Nepal | 53→55→56 |
| Russia / Germany | embassy statements | 8 / 8 |
| Nepal (for foreigners) | MoFA ECR (§1.6) | 517 foreign of 644 (27 Aug) |

---

## 10. Hospital / morgue public boards (physical, with some digital bridges)

- **TUTH/Maharajgunj + National Trauma Center, Kathmandu:** A4 photos of missing (families) and of unidentified dead (police) on walls; lists of survivors/injured on noticeboards; **police desk registered >1,000 relatives' details by 27 Aug 17:00 (Kathmandu Post)**; QR codes to police UDB (ABC 29 Aug; Dhaka Tribune). [C]
- **Bharatpur temporary body centre** (Industrial Enterprise Development Institute building, Bharatpur-10): photos of bodies shown on TV screens; 137→~200 bodies; 24 freezers (BusinessToday/ReviewNepal 28 Aug). [C]
- **Pokhara Academy of Health Sciences:** 93 bodies (41 Nawalpur, 11 Gorkha, 14 Tanahun, 27 Dhading), photos displayed near lab; Manipal 9 (OnlineKhabar 29 Aug). [C]
- **Rasuwa District Hospital, Dhunche:** 21 injured; a patient/status list of 81 rows is in the bulletin repo (`rasuwa-hospital-dhunche.csv`). [C]
- **Army help desk, Nepali Army Training Centre, Maithali (Nuwakot):** physical-description intake at gate (KP 27 Aug). [C]
- Police DVI: photographing, fingerprinting, DNA; unidentified to be buried with tag numbers + coordinates within 1–2 weeks (already catalogued).

---

## 11. Survivor first-person accounts (catalogue — locations, not names)

| Where published | Accounts | Location / "who was where" content |
|---|---|---|
| Kathmandu Post 29 Aug "Moments from death" | 7 | Trishuli Bazar sweet-shop worker (3 coworkers missing); Syabrubesi jeweller's assistant (uncle's family of 3 missing); container driver Betrawati (≈9 trucks + drivers swept); UT-1 worker at Mailung (settlement buried); 2 × Timure (customs agent; resident — houses collapsing, bodies in water); labourer thrown to hillside |
| OnlineKhabar "Survivors recall…" (27 Aug); The Federal; Kashmir Observer | 3–4 | Timure customs agents (08:45 shaking, black cloud); Makwanpur driver who heard loudspeaker "flood is coming" at Betrawati |
| ThePrint 28 Aug | 1+ | UT-1 workers got an **SMS alert ~30 s before** the wave |
| Ratopati 26 Aug | 2 (video) | Timure residents who ran uphill |
| The National 28 Aug "It took everyone" | 2 brothers | village with 11 missing; helicopter evacuation; TUTH ward |
| CNN video 28 Aug | 1 | US survivor "like a tsunami" |
| Tribune 28 Aug | group | 28 Vizag pilgrims 50–100 m behind wave near border bridge; two buses ahead swept |
| ifeng.com (ZH) 27 Aug | 4–5 | Gyirong port queue of several hundred on 23 Aug; construction crew; Sichuan rescuers |
| ABC/AP 27 Aug | several | Trishuli school-bus escape; Bidur balcony video; bus passenger video (NBC) |
| Reddit r/Nepal 27 Aug "narrow escape" | 1 | unverified |
| Al Jazeera 27 Aug "Swept away" | families | Trauma Center searches |
Roughly 25–30 distinct published accounts so far; none yet in long-form blog/vlog form from foreign trekkers (Langtang valley trekkers were cut off, not hit).

---

## 12. Volunteer coordination hubs

- **HOT / Open Mapping Hub AP / NAXA / NDRRMA** — tasks.hotosm.org campaign; OSM wiki page lists focal points (Bernard Heng, Kshitij Sharma – HOT; Uttam Pudasaini, Nishon Tandukar – NAXA; Rabi Shrestha – community; tech lead Dinar Adiatma) and products; no chat channel listed. Also a HOT uMap "nepal-floods-2026-focus-area-and-tasking-manager". (already catalogued) [C]
- **nepalhackathon.org** — kickoff 30 Aug 09:00 NPT; hello@/corrections@ emails; LinkedIn/Instagram/Facebook @nepalhackathon; no Discord/Slack/dataset/problem statements published on site as of 29 Aug. (already catalogued) [C]
- **Kritagya SAR board, iyersamridhi routing tool, mayhem82 resolver, nirajbhusal bulletin, b1nay kachhuwa** — the five active individual-volunteer builds (§2). None has an org behind it.
- **NGES + HOT crowdsourced building mapping** Facebook post (via iamtekson links) [R].
- **Kathmandu Living Labs, Standby Task Force, DHN, Ushahidi, Sahana, Google Person Finder** — re-checked: no 2026 activation found. [C]
- **Drone Association Nepal / NDRRMA drone form** — already catalogued.

---

## 13. Crowdfunding (location/group signals)

- GoFundMe: NRNA UK (§8). GoFundMe search page is JS-rendered (1.7 MB, no campaign slugs for Nepal in raw HTML) — use `gofundme.com/s?q=` in a browser or the internal `/discover` API. MetalForNepal emergency appeal; GurkhaShieldForce "verified donation hub" repo; digitalsolutionnepal.com and nepalnext.com/rahat mirror PMDRF QR; Kathmandu Post warns of unverified fundraisers (catalogued). Milaap/Ketto: nothing indexed. INGO appeals (IFRC CHF 25 M, Oxfam, Save the Children, CARE, Direct Relief→Mountain Heart Nepal, All Hands & Hearts in Nuwakot, Convoy of Hope, Send Relief, Project HOPE, UNICEF, Action Against Hunger) — no person data.

---

## 14. Missing-poster aggregation

- No dedicated poster aggregator exists; posters circulate as (a) A4 sheets on hospital walls, (b) Facebook posts (unindexed), (c) Reddit requests for translation help, (d) the eTurboNews table and found.kachhuwa.com (text, not images). OPMCM `/api/person-reports` includes uploaded photos (31 % of sampled rows) — effectively the de-facto poster database.

---

## 15. Fact-check desks (fakes tracked)

| Desk | Items | Date |
|---|---|---|
| Lead Stories | F-16/dam AI video (online since May 2026, AI watermark); AI before/after of Trishuli Bazaar (OpenAI SynthID); AI "Nepal flooding" video | 27–28 Aug |
| AAP FactCheck | AI before/after (FB, dozens of reposts); AI YouTube video; AI X rescue image; 2021 Atami (Japan) landslide video (FB, 360k+ views); 2025 Uttarakhand cloudburst video (X); HAARP conspiracy | 27 Aug |
| BOOM | Uttarkashi/Dharali 5 Aug 2025 video (FB); Alaska Columbia Glacier GLOF video (X, 22 Aug 2026); Niti Valley Chamoli 10 Aug 2026 bridge video (X) | 28 Aug |
| Factly | "none of these visuals are related" roundup | 27–28 Aug |
| AFP | AI clips via Google SynthID; Newsflare Uttarakhand 10 Aug footage misattributed | 27–28 Aug |
| VERA Files (PH) | AI "dam collapse" clip | 28 Aug |
| Fact Crescendo (SL/EN) | AI "people swept away" video (online since 9 Aug); Assam 9 Aug clip; elephant-rescue clip; 2024 Buddha-statue video | 27–28 Aug |
| Nepal Fact Check / SouthAsiaCheck / DFRAC / Alt News | nothing surfaced in 200 searches | [U] |

---

## 16. NEW vs already-catalogued

**Already in repo (active-channels-2026-08-29.md, 05-already-running.md, missing-lists-fragmentation.md):** HOT campaign, nepalhackathon, NDRRMA drone form, NESRA FloodWatch, Copernicus/Charter, Police UDB (noted as unreachable — now reachable), NRCS/IFRC RFL, KLL/Ushahidi/GPF negatives, rescuenepal.info (5 cases), eTurboNews 655-row table (metadata), "flood-nepal (JSON API)" (not located under that name — the JSON-API tracker is almost certainly **nirajbhusal's bulletin** or **OPMCM**), NxtImagine dashboard, "Rasuwa DAO rescued list", hospital QR boards, families' WhatsApp group (US), NTB register not updated after 26 Aug (contradicted: NTB posted Situation Update-3 on 27 Aug 12:00 and a 29 Aug tally).

**NEW in this sweep (not in those three files):**
1. **rescue.opmcm.gov.np + open `/api`** (13,353 person records, 10,792 lost) — the biggest single find.
2. **ndrrma.gov.np/api/v1/rescues/** REST endpoints (2,189 named rescued; 21 rescue + 11 stationing locations with centroids; rescued_count 6,633).
3. **Setu Rapid (setu.ndrrma.gov.np)** — NDRRMA intake app, ~1,500 forms, public record list.
4. **nirajbhusal/rasuwa-flood-bulletin** — CSV/JSON compilation incl. the two Google Sheets + Forms family registry (1,423/42) and Dhunche hospital list.
5. **found.kachhuwa.com = b1nay repo**, multilingual, WhatsApp intake, consumes the bulletin.
6. **Telegram t.me/poshuknepal** (4.3k Ukrainian relatives).
7. **MASFIH** Malaysian family network; Karnataka/TN/WB/… state control rooms compiling lists.
8. **Himalayan Glacier family WhatsApp group** and operator-level counts for 12 agencies.
9. Isha group-location detail (immigration building), Vizag 28 safe, Kolkata 32, Bhopal 29, TN 57-member group.
10. Hydropower per-project counts incl. 9 Koreans (Doosan/KOEN) and Andritz 76.
11. Reddit thread inventory + working RSS route; X syndication route; ~30 GitHub repos incl. Kritagya board (open Firestore), iyersamridhi, mayhem82, rishabh-jain DAO CSV.
12. Nepal Police Facebook list post URL (metadata) and its republications (NEPYORK 65 US, NST 23/51 MY, Pardafas 27 police).
13. Canada GAC WhatsApp/Signal intake; ROCA 820 registered.
14. Bharatpur TV-screen body display; Pokhara PAHS 93 bodies; TUTH >1,000 family registrations.
15. Chinese-platform censorship evidence and ifeng first-person Gyirong account.
16. Nine fact-check desks' item lists.
17. Corrections: udb.nepalpolice.gov.np reachable; rescuenepal.info has pivoted to a "Dead Body Mapping System" (LabHexa); nepal-flood-map.pages.dev; thimitech video map; rasuwaflood.org.

---

## 17. Ranked shortlist — richest bottom-up "who was where" sources

1. **OPMCM `/api/person-reports`** — 10.8k lost / 2.4k found / 1.7k rescued with free-text location, DAO provenance, photos; live; official-yet-crowd-fed. (PII-heavy; consume counts/locations only.)
2. **NDRRMA `/api/v1/rescues/rescued-persons/` + `rescued-locations/` + `stationed-locations/`** — 2,189 named rescued with *where rescued* and *where now*; the cleanest "safe and where" layer.
3. **nirajbhusal bulletin repo** — one-stop CSV/JSON of NDRRMA, Army-heli (654), foreign-rescued (152+54), Indians-crossed (149), Dhunche hospital (81), family registry (1,423/42) — already normalised, git-versioned (716 commits = full history of list changes).
4. **Setu Rapid** — NDRRMA's own family intake (~1,500 forms) with per-person situation fields; public record list.
5. **Nepal Police Facebook lists** (missing by nationality; unidentified-body photo list via QR/UDB) — republications are the route.
6. **Operator statements** (Himalayan Glacier, Leaf, Trekkers Society, Alpine Eco, Kathmandu Holiday, Fishtail, Kailash Journeys, Samrat, Dream Tibet, Kumbakonam agency) — precise group sizes + timestamps at Rasuwagadhi/Gyirong immigration 07:00–09:15 on 26 Aug.
7. **Hydropower operators/IPPAN** — per-tunnel/per-site headcounts (UT-1, UT-3/3A/3B, Rasuwagadhi, Chilime, Langtang Khola, Mailung).
8. **Embassy counts** (India, US, AU, UK, CA, KR, MY, SG, UA, RU, DE, CN) — nationality-level denominators; Canada ROCA and Karnataka SEOC actively compiling.
9. **t.me/poshuknepal** — only family-run open channel found; 4.3k members; needs Telegram client access.
10. **Reddit r/Nepal + r/india** — low volume but specific (Devighat, UT-3B, Kailash groups, missing-poster translation).
11. **found.kachhuwa.com / Google Sheets** — derivative of (3); its value is the WhatsApp intake and 7-language search, not new data.
12. **Survivor accounts** (~25–30) — micro-location detail (Timure market, Betrawati truck queue, Mailung UT-1 camp, Trishuli Bazar, Gyirong queue).
13. eTurboNews table — E-grade, PII leak; use only to understand what the private initiative collected (last-contact place/time columns).

---

## 18. Scraping / access matrix

| Platform | Practical route | Auth | Rate / limits | Status here |
|---|---|---|---|---|
| rescue.opmcm.gov.np `/api/*` | HTTPS JSON, `?limit=&page=` | none | ~4 MB per 500 rows (inline images); 1000-row pages time out >60 s — use limit ≤200 | **open** [C] |
| ndrrma.gov.np `/api/v1/rescues/*` | DRF JSON, `?limit=&offset=` | none | small | **open** [C] |
| setu.ndrrma.gov.np | HTML (PHP), forms with CSRF | none for read | — | open [C] |
| nirajbhusal bulletin / any GitHub raw | raw.githubusercontent.com | none | unlimited; api.github.com 10 req/min unauth (use `gh`/token for 5k/h) | open [C] |
| found.kachhuwa.com | static + upstream JSON | none | — | open [C] |
| NxtImagine | HTML + `/feed.xml` | none | — | open [C] |
| Nepal Police UDB udb.nepalpolice.gov.np | Laravel app, HTML | none (200 from UK IP) | unknown | reachable [C]; do not scrape (policy) |
| Facebook pages/groups/posts | none without login; Graph API needs app review | login | — | **blocked** (302→login) |
| X / Twitter | `cdn.syndication.twimg.com/tweet-result?id=&token=a` per tweet; search needs paid API (Basic $100/mo, 10k tweets) or a logged-in browser; `publish.x.com/oembed` → 402 | none for syndication | unknown, modest | partial [C] |
| Reddit | `…/search.rss` and `/r/<sub>/new.rss` with browser UA; `.json` and old.reddit blocked; OAuth API 100 req/min | none for RSS | ~1 req/2 s | works [C] |
| Telegram | `t.me/s/<channel>` HTML preview (blocked here: 302); Telethon/MTProto with a user account | user account for MTProto | generous | header only [C] |
| YouTube | Data API v3 (search/commentThreads) | API key (free, 10k units/day) | 100 units/search | not used |
| TikTok / Instagram | login-walled; third-party scrapers only | login | — | blocked [U] |
| Weibo/WeChat/Douyin | login + censorship; not viable | login | — | blocked [U] |
| Google Sheets (family registry) | `…/export?format=csv` works only if link-shared; IDs sit in family.json | link-share | — | not attempted (PII) |
| GoFundMe | JS search; per-campaign JSON in page (`amount`, donor counts) | none | — | partial [C] |
| News sites | KP, OnlineKhabar, NST, The National, ABC, CNN fetch fine; **Ratopati, ThePrint, Tribune (some), NBC, BusinessToday (some), mothership OK, IndiaTV OK, Dainik Jagran, KTM Post OK, kyivindependent OK; 403s: Ratopati, ANI, ThePrint, NBC, Factly, FactCrescendo, Reuters-syndicated** | — | — | mixed |

---

## 19. Caveats and data-quality flags

- **Count divergence persists:** NDRRMA missing 2,426 (29 Aug 14:00) vs bulletin 2,498 (29 Aug 18:30) vs OPMCM open lost 10,792 (29 Aug 17:20, includes DAO bulk imports and probable duplicates) vs Setu ~1,500 forms vs Police 977 confirmed (28 Aug) vs NTB 420 tourists out of contact. OPMCM's `last24h 4,723` means most of its volume arrived on 29 Aug.
- **Cross-district contamination risk** in OPMCM: DAO Sindhupalchok/Dhanusha imports with Sindhupalchok ward addresses ("Bhotekoshi RM") — either legitimately displaced Kerung-route workers or a Bhotekoshi name collision; must be checked before any reconciliation.
- **Provenance unknown** for the Google Sheets behind family.json/kachhuwa and for the eTurboNews "private initiative" (probably the same sheet lineage — kachhuwa is the onward link eTurboNews gives).
- **Openly writable community stores** (Kritagya Firestore test mode; Setu forms without auth; OPMCM report forms) are spam/duplicate-prone; all three say "unverified".
- **WebSearch budget (200) was exhausted**; Bluesky/Threads/Mastodon, Nepali Facebook groups, Instagram hashtags, Korean/Hindi-language community channels and Nepal Fact Check were not reached and are marked [U].
