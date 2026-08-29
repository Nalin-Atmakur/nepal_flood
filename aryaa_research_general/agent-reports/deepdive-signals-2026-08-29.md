# Deep-dive: non-imagery signals — Rasuwa / Bhote Koshi–Trishuli flood (26 Aug 2026)

*Sweep run 2026-08-29 ~17:00–18:00 UTC (22:45–23:45 NPT). All timestamps NPT unless marked UTC (NPT = UTC+5:45).*
*Tags: **[C]** confirmed by a fetch in this session · **[R]** reported by a named source · **[U]** unconfirmed / could not reach. Reliability A (authoritative, machine-readable) → F (rumour).*
*No individual device IDs, names or phone numbers recorded; institutional hotlines only.*

Baseline reviewed: `aryaa_research_general/07-data-map.md` (rows for DHM River Watch, NTC/Ncell CDR, Garmin, OpenCelliD, TIMS, teahouse registers). This document supersedes those rows where it says so.

---

## 0. Headline findings (what changed vs. the baseline)

1. **DHM River Watch has a scrapeable machine-readable snapshot and a station catalogue endpoint** [C]. `https://hydrology.gov.np/gss/api/station` returns all 1,187 DHM stations as JSON (id, index, lat/lon, elevation, tags, data source). Observations behind `/gss/api/observation` are API-key gated, **but** `https://dhm.gov.np/hydrology/river-watch` embeds a JS array of all 332 river-watch stations with the latest reading, timestamp, warning/danger levels and a short time series. Saved to `scratchpad/riverwatch_snapshot_2026-08-29.json`. This gives an exact alive/dead list for the corridor (section 4).
2. **Helicopter tracking: open ADS-B does *not* see the rescue fleet in real time** [C]. Live queries of OpenSky, adsb.lol and adsb.fi at 23:20 NPT returned only an inbound Nepal Airlines A330 and a Thai A320; airplanes.live blocks unauthenticated calls. Nepal has no ADS-B mandate (CAAN AIC 2021: "optional within Kathmandu FIR"); Army Mi-17s/Dhruvs do not broadcast; private H125s mostly carry Mode-S only. Historical test on the full adsb.lol 28-Aug archive (all 48 half-hour heatmap slices, 56 M positions): 21 Nepal-registered aircraft seen, all airliners; **zero helicopters, zero points below 9,000 ft in the Rasuwa corridor**; the only corridor targets were a transiting ATR-72 at 12,300 ft and an unidentified high-altitude orbit (26.6–27.9 kft, all night, at the border — possibly the Chinese relay UAV). **Sortie counts must come from the Army/NDRRMA, not from trackers.**
3. **Seismic event IDs are confirmed** [C]: USGS `us7000tbwb` (M 5.2 ms_vx, *type: landslide*, 2026-08-26 02:52:10 UTC = 08:37:10 NPT, 28.271 N 85.515 E, depth 0) and `us7000tc90` (M 4.2, 06:00:35 UTC = 11:45 NPT, same location). GEOFON `gfz2026qrfy` Mw 5.69 at 02:52:23 UTC. Chinese Ministry of Water Resources says it pre-positioned **3 seismometers** at the barrier lake [R].
4. **Telecom restoration is being published site-by-site by NTC** (Goljung/Bahundanda tower → Syabrubesi + parts of Parbatikunda & Gosaikunda RMs; Gerkhu → Bidur/Suryagadhi; Trishuli-3A tower → Betrawati/Kalikasthan; Tupche BTS on 29 Aug; "tower above Timure" still down) [R, A/B]. These are the best proxy for "where a phone can now register". The **NDRRMA emergency-communication team** (MoIC, MoHA, NA, Police, NTA, NTC, Ncell) is the formal owner.
5. **Nepal Police runs a live public portal** (`udb.nepalpolice.gov.np`) with a Rasuwa-flood section for unidentified bodies, missing and found persons (20 rows/page, photo + place found) [C]. Contains personal data — use counts and "place found" only.
6. **Presence/mobility datasets are not activated for this event** [C]: Meta Movement Distribution (HDX) last covers 13–16 Jul 2026 (biweekly, 90-day retention); Movement Range Maps ended 2022; IOM DTM Nepal API dataset last updated 24 Aug (pre-event); no Flowminder/CDR product announced. NASA Black Marble VNP46A1 (raw radiance) exists nightly through 28 Aug but the corrected VNP46A2 lags ~8 days (latest 21 Aug).
7. **Apple Emergency SOS via satellite does not cover Nepal**; Starlink is unlicensed in Nepal (NTA has warned against illegal use) [C]. Garmin inReach / Zoleo / SPOT activations: no public statement found [U]. China flew a Wing Loong UAV carrying base stations of all three Chinese operators over the Gyirong side at 02:00 on 27 Aug and restored signal to 3 km from the Gyirong gate by 16:00 on 27 Aug [R].
8. **Weather**: DHM MFD has a public JSON API (`dhm.gov.np/mfd/api/…`) [C]; 29 Aug 18:00 bulletin says monsoon trough near normal, heavy rain "at one or two places" in Bagmati hills/mountains for the next 2 days. ECMWF (via Open-Meteo) for Dhunche gives 11–23 mm/day through 4 Sep with the clearest low cloud 05:00–07:00; for Langtang village (3,548 m grid) 29–30 Aug and 3–4 Sep mornings have low cloud <40 % from 06:00–11:00, 31 Aug–1 Sep none.

---

## 1. Telecom

### 1.1 Outage / restoration facts (dated)

| Date (NPT) | Statement | Source | Rel. |
|---|---|---|---|
| 27 Aug | 87 towers down: NTC 60 (Rasuwa 13/32 sites, Nuwakot 31/79, Dhading 13/36, Chitwan 5), Ncell 27. Already restored: Kispang (Kaule), Thulegaun, Tadi, Fikuri, Kalikasthan, Grang, Dadagaun, Mailung, Pangsang Danda, **Langtang, Kyangjin**. In progress: Dhunche (generators flown in), Madanpur, Battar, Bidur Bus Park, Baireni, Thamel Danda, Nyaupanechaur & Ramche repeaters. | OnlineKhabar `english.onlinekhabar.com/ntc-ncell-telecom-flood-disrupt.html` | B [R] |
| 28 Aug | NTC: 80 of 120 affected sites restored. Named: Dhunche (Gosaikunda-6), Goljung tower (Bahundanda, Gosaikunda-5) → Syabrubesi + parts of Parbatikunda & Gosaikunda RMs + sections of Syabrubesi–Timure road; Gerkhu (Suryagadhi-3) → Bidur/Suryagadhi. Pending: Tupche (Bidur-8), "Timure hill" (Gosaikunda-2). Gear moved by helicopter. Spokesperson quoted. | ICTFrame `ictframe.com/ntc-restores-mobile-network/`; NepalNews `…/nepal-telecom-restores-services-at-80-of-120-flood-affected-sites/` | B [R] |
| 28 Aug | Ncell: 18 of 27 towers restored, 9 pending; free voice/data/SMS extended 7 days; teams moved by road + helicopter. | ICTFrame `ictframe.com/ncell-extends-free-services/`; TechnologyKhabar | B [R] |
| 29 Aug | NTC restored tower near Trishuli-3A HPP (generator carried ~1 h on foot) → Trishuli-3B area, Betrawati, parts of Kalikasthan; Tupche BTS resumed Sat 29 Aug via helicopter-delivered generator from Trishuli. | Khabarhub `english.khabarhub.com/2026/29/565536/` | B [R] |
| 26–27 Aug | NTC free 50 SMS + 2 GB/day for 2 days in Rasuwa, Nuwakot, Dhading, Gorkha, Chitwan; Ncell 3 days free (later +7). NOC sent an aviation-fuel tanker to Trishuli for helicopters. | NepalNews `…/nepal-telecom-ncell-provide-free-services-in-5-flood-affected-districts/` | B [R] |
| 26 Aug 09:15–09:16 | DHM warning SMS to **679,295** subscribers via NTC + Ncell (Rasuwa, Nuwakot, Dhading, Chitwan). | DHM technical report via OnlineKhabar / NESRA | A [R] |
| 26 Aug | NDRRMA formed 12 thematic teams incl. an *emergency communication restoration team* (MoIC, MoHA, NA, Police, NTA, NTC, Ncell). | Desh Sanchar (13,295 personnel / 15 helicopters article) | B [R] |
| 27 Aug 16:00 (CST) | Tibet side: 5 base stations destroyed on the Gyirong corridor; 1 restored + 2 new added, 5G cross-network roaming enabled; signal reaches Resuo village, 3 km from the port gate. Wing Loong UAV from Sichuan overhead from 02:00 27 Aug carrying mobile base stations of the three operators + satellite backhaul. | ChinaDaily `cn.chinadaily.com.cn/a/202608/27/WS6a9020d2e4b09a165c7867ad.html`; ChinaNews; Xinhua 四大关切 | B [R] |

**Interpretation for reached/unreached:** the NTC list is the only public, place-resolved "coverage is back" signal. Note Langtang and Kyangjin were *restored by 27 Aug* (likely solar/microwave sites with generators flown in), so upper-valley trekkers with NTC SIMs should have been able to text by 27 Aug; Timure remains uncovered as of 28 Aug. NTA has issued **no event-specific public directive** (nta.gov.np fetched; only routine notices) [C].

### 1.2 Source table — telecom

| Source | What | Format | Access | Cadence | Rel. | Status |
|---|---|---|---|---|---|---|
| NTC press/spokesperson via ICTFrame, NepalNews, Khabarhub, OnlineKhabar | Site-level restoration list | prose | open | ~daily | B | [C] fetched 27, 28, 29 Aug items |
| Ncell via ICTFrame/TechnologyKhabar | Tower counts, free services | prose | open | ~daily | B | [C] |
| nta.gov.np | Regulator notices, licensee list, MIS reports | HTML/PDF (Nepali) | open | monthly MIS | A | [C] fetched; no flood directive posted |
| ntc.net.np notice board | Corporate notices | HTML | open | ad hoc | A | [C] fetched; no flood-specific site list on site (press goes via media) |
| **OpenCelliD** `opencellid.org/stats.php` | Nepal: **23,298 cells** (GSM 11,365 / UMTS 9,125 / LTE 2,808 / NR 0). CSV export needs free API key; exports only include cells seen in last 18 months | CSV / API | key (free) | continuous | C (crowd-sourced; rural Rasuwa thin) | [C] stats fetched; corridor count **not** computed (API key required) |
| Mozilla Location Service | shut down 2024 | — | — | — | — | [C] n/a; successor beaconDB has **no public dumps yet** (privacy obfuscation pending) |
| cellmapper.net | crowd tower map | JS map | open (no API) | continuous | C | [U] not fetchable headless |
| **Ookla Open Data** `s3://ookla-open-data` | Mobile/fixed speed tiles (~610 m z16), quarterly, CC BY-NC-SA | Parquet/SHP | open | **quarterly** | B | [C] registry page fetched — too coarse in time to show outages |
| CDR / Flowminder-style | No 2026 activation found. 2015 precedent: Ncell–Flowminder MoU pre-signed, data within 6 days | — | legal request via NDRRMA→NTA→operators | — | — | [U] nothing public |
| Starlink | **Not licensed in Nepal** (100 % foreign-ownership dispute; Bangladesh cross-border bandwidth deal Jul 2026); NTA has warned against illegal terminals | — | — | — | A | [C] Kathmandu Post 10 Jul & 2 Jun 2026 via search summary; nepalrepublic tracker |
| Thuraya / Inmarsat BGAN / VSAT | No public deployment statement for Nepal side; China used portable satellite stations (China Anneng team, 28 Aug) | — | — | — | — | [U] Nepal; [R] China |
| Amateur radio (NARL / 9N1 nets, IARU R3) | No mention in any fetched source | — | — | — | — | [U] |
| Nepal Police / Army radio nets | Not public. 28 police + 9 APF personnel missing at Timure (26 Aug) implies the Timure police post net went down with the post | — | — | — | — | [R] Khabarhub |

---

## 2. Satellite messengers, phones and devices

| Item | Finding | Rel. | Status |
|---|---|---|---|
| Garmin inReach / Garmin Response (IERCC) | No statement, no press mention for this event across ~10 trekking-industry updates, CBS, CNN, MoFA. Garmin routed SOS to Nepal in 2015; assume some devices active but the channel is **provider → embassy/MoFA**, not public. | — | [U] |
| Zoleo / SPOT (Globalstar) | Nothing public. | — | [U] |
| Apple Emergency SOS via satellite | Supported-country list (as of Jul 2026 expansion to Andorra/Iceland) **does not include Nepal** — feature is geofenced, so a US/UK iPhone in Langtang cannot use it. | A | [C] MacRumors/Apple support via search |
| Find My / Google location sharing | No press mention. | — | [U] |
| Trekking-agency "GPS tracker" claims | Agencies (Marvel Treks, Big Sky, Haven, etc.) describe contacting groups "via any available means" and note lodges have "sporadic mobile signal"; no agency claims live GPS tracking. | C | [R] |
| Strava / Komoot / AllTrails | Strava global heatmap aggregates ~1 year and needs login; it cannot show "recent" presence. AllTrails lists the Langtang Valley Trek (3 reviews). No route to recent-activity data without vendor cooperation. | — | [U] |
| MoFA foreigner intake | Emergency Control Room: `emergency@mofa.gov.np`, WhatsApp/hotline +977-9744441227 / -228 (07:00–22:00). 27 Aug 20:00 update: 627 foreign nationals affected, 596 missing, 31 found; data from NDRRMA + NTB. | A | [C] mofa.gov.np/content/1863 |
| NTB / Tourist Police | 29 Aug 18:00: **261 foreign nationals rescued, 320 out of contact** (167 IN, 40 CN, 8 UA, 21 unidentified, 4 DE, 4 MT, 3 US…). Hotlines 1234 / 1144 / Tourist Police 9851289445. Compiled from agencies, guides, local authorities, security agencies. Earlier: 27 Aug 384 (291 foreign + 93 Nepali) → 403 → 484 → 570; 29 Aug 14:44 "184 rescued, 420 out of contact". | A | [C] nepalnews 29 Aug; eturbonews timeline |
| US Embassy | ~90 Americans unaccounted (incl. 22 from an 80-person Isha Foundation pilgrim group); 5 confirmed safe (CBS, 29 Aug). Embassy page not parseable (PDF blob). | B | [R] |

---

## 3. Flight tracking — "does helicopter tracking work for Nepal?"

### 3.1 Evidence

| Test | Result | Status |
|---|---|---|
| OpenSky `states/all` bbox 27.6–28.6 N / 84.8–85.8 E at 17:42 UTC (23:27 NPT) | 1 aircraft: `70afb7` RNA410 (Nepal Airlines, descending into KTM). Nepal-wide box: 6 aircraft, all airliners. | [C] |
| OpenSky `tracks/all?icao24=70afb7&time=0` | Works anonymously for the *current* flight (152 waypoints HKG→KTM). OpenSky historical flights/tracks need a registered account; bulk history via Trino for researchers. | [C] |
| adsb.lol `v2/point/28.11/85.30/120` | 1 aircraft (THA309 A320). `v2/reg/9N-AOO`, `v2/reg/9N-AJJ` → empty `ac:[]` (night; helicopters not flying). | [C] |
| adsb.fi `v2/lat/28.11/lon/85.30/dist/120` | Same single A320. | [C] |
| airplanes.live | HTTP 403 without key. | [C] |
| Flightradar24 aircraft pages (9N-AOO, 9N-AJJ, 9N-AMI) and planespotters fleet pages | Cloudflare 403 headless. FR24 blog confirms Nepal coverage is receiver-limited (Dhangadhi receiver added Mar 2025 raised regional positions 17 → 714 per 48 h). | [C] blocked / [R] |
| **adsb.lol daily history** `github.com/adsblol/globe_history_2026` | Releases exist for 26, 27, 28 Aug (prod, ~4.1 GB/day split .tar.aa/.ab/.ac, ODbL/CC0, readsb `traces/<xx>/trace_full_<hex>.json`). Streaming extraction of Nepal-allocated hex (`70Axxx`/`70Bxxx`) for 28 Aug launched at 17:18 UTC — **result: see §3.3**. | [C] |
| CAAN ADS-B policy | AIC (May 2021): ADS-B OUT optional in Kathmandu FIR; priority only in ADS-B-only areas (Bhairahawa CTR low levels, L626 west of SUKET). No helicopter mandate found. | [C] e-aip PDF via search |
| NOTAMs | FAA DINS / notamSearch and notaminfo all 403/404 headless; CAAN e-AIP portal lists "Lists of Valid NOTAM" and "PIB" (menu present, links not exposed to the crawler). Nothing in press about a TFR; PMO simply ordered all helicopter companies on standby on 26 Aug. | [U] |

### 3.2 Fleet / operators (registrations from public press; no ADS-B seen)

- Nepal Army: 2× Mi-17 to Trishuli on 26 Aug (Rising Nepal); 5 helicopters on 27 Aug (OnlineKhabar); **6 Army + 9 private = 15** by 28 Aug (Desh Sanchar/NDRRMA). Army airframes carry NA- serials and are not on civil trackers.
- Private operators named in coverage: Altitude Air (first to Timure 26 Aug, could not land — helipad gone), Kailash Helicopter Services, Simrik Air, Annapurna Helicopters (AirMed&Rescue). Example civil regs from press: Simrik 9N-AOO (H125), Kailash 9N-AJJ (AS350 B2), Air Dynasty 9N-AMI (H125), Prabhu 9N-ANT (H125). Registry list: `helis.com/database/serials/9N`.
- Bases/hubs: Kathmandu (TIA), **Dhunche** (Army barracks camp), **Trishuli/Bidur** (Army camp + NOC avgas tanker), Gajuri (Brigade 6). Syabrubesi helipad destroyed (delays), Timure helipad washed away.
- Published sortie/people counts (Army): 26 Aug 7 injured; 27 Aug 17 airlifted (Mailung tunnel 3, Timure 14) + 63 ground; 28 Aug 12:20 449 airlifted; 28 Aug 15:00 706 rescued (Timure, Syabrubesi, Mailung; 40 foreigners); 28 Aug (cum.) **2,101 evacuated by helicopter incl. 163 foreigners**; earlier per-route breakdown 85 Timure→Dhunche / 13 Timure→Trishuli / 5 Mailung / 4 Betrawati / 3 Trishuli→KTM. NDRRMA 29 Aug: 4,451 rescued total, 2,265 airlifted vs ~200 by road. Weather grounded helicopters Sat 29 Aug morning in Nuwakot (CBS).

### 3.3 adsb.lol 28-Aug history extraction — result [C]

Method: streamed the full `v2026.08.28-planes-readsb-prod-0` archive (4.15 GB; day = 28 Aug UTC, i.e. 05:45 NPT 28 Aug → 05:45 NPT 29 Aug, the peak rescue day with 15 helicopters tasked) and (a) extracted every trace for a Nepal-allocated ICAO hex (`70Axxx`), (b) decoded all 48 half-hour readsb `heatmap/*.bin.ttf` position files (gzip, 16-byte records) covering **every** aircraft the network saw worldwide that day. Scripts: `scratchpad/adsb/analyze.py`, `heat2.py`.

| Check | Result |
|---|---|
| Nepal-hex traces present | **21 aircraft, all fixed-wing airliners/turboprops** (A320/A319/A330 ×6, ATR-72 ×13, Dash-8 ×2: 9N-ANH, -ALV, -ALY, -ALW, -AJL, -ANI, -ANP, -ANZ, -AKX, -ANW, -AKW, -ANQ, -AJK, -AMN, -AOL, -AOG, -AOC, -AMZ, -AMD, -AMU, -AOK). **Zero helicopters** (no H125/AS350/B407/B505/Mi-17/Dhruv). |
| Heatmap totals | 56.2 M position records worldwide; 353 distinct hexes inside a Nepal bbox; 51 distinct hexes inside a Kathmandu-valley box (27.55–27.80 N, 85.20–85.45 E). |
| Corridor bbox 27.85–28.35 N / 85.05–85.60 E (Betrawati → Rasuwagadhi, Dhunche, Syabrubesi, Langtang) | **Only 2 targets all day**: `70a9a5` 9N-ANH ATR-72 clipping the SW corner at 12,300–12,650 ft (14:45–15:15 NPT, en-route traffic); and `0c2238` (non-Nepal, non-standard block) holding at **26,600–27,900 ft, ~160 kt, 28.315–28.350 N from 17:15 NPT 28 Aug to 03:15 NPT 29 Aug** — i.e. an all-night orbit at the border north of Rasuwagadhi. Consistent with the Chinese Wing Loong comms-relay UAV reported over Gyirong (§1.1), but unverified [U]. |
| Points below 9,000 ft in the corridor | **None.** |

Caveat: the heatmap is a decimated sample (one point per aircraft per interval), but any Mode-S/ADS-B-equipped helicopter within receiver range would still leave records; the KTM box shows 51 aircraft, so valley coverage exists. The absence is therefore real: **no rescue helicopter was tracked by the open ADS-B network on 28 Aug.** OpenSky was not bulk-tested (account needed) but its live feed showed the same airliner-only picture.
### 3.4 Verdict

Open ADS-B is **not** a viable "which LZ was visited" sensor for this event: receivers are few (KTM valley + a handful), helicopters fly low in steep terrain, the Army does not broadcast, and there is no mandate. The usable substitutes are (a) NA/NDRRMA daily sortie summaries, (b) NTC tower-restoration lists (helicopters deliver the generators), and (c) asking operators for their own GPS/SkyTrac-type logs through NDRRMA. The 28-Aug archive test (§3.3) confirms this empirically.

---

## 4. Hydrology

### 4.1 DHM endpoints [C]

| Endpoint | What | Format | Access | Cadence | Rel. |
|---|---|---|---|---|---|
| `https://hydrology.gov.np/gss/api/station` | **All 1,187 DHM stations**: id, identifier, name, folder/basin, lat/lon, elevation, tags (HS/RF/AWS/SNOW…), data_source (RTDL/Cellcom/Manual/NVE), images. 46 MB. `?type=hydrology` filter works. `/gss/api/station/<id>` per station. | JSON | open, no key | static | A |
| `https://hydrology.gov.np/gss/api/observation` | Observations — **"Permission denied or Api Keys required"** | JSON | key (ask DHM Flood Forecasting Division) | 5–15 min | A |
| `https://hydrology.gov.np/gss/socket.io` | Live push used by the SPA (river/rainfall watch, siren) | socket.io | open (undocumented) | live | A |
| `https://dhm.gov.np/hydrology/river-watch` | Page embeds JS array of **332 river-watch stations** with latest `waterLevel{datetime,value}`, status, warning/danger, short `timeSeries`. Snapshot saved: `riverwatch_snapshot_2026-08-29.json`. | HTML→JSON | open | page regenerates ~5 min | A |
| `https://dhm.gov.np/hydrology/hms-Single/<id>` | Station page (point/hourly/daily/7-day); data via POST `dhm.gov.np/site/getRiverWatchBySeriesId_Single` (CSRF-protected: "No direct script access allowed") | HTML/AJAX | open via browser | live | A |
| `https://dhm.gov.np/hydrology/rainfall-watch-map` | 1/3/6/12/24-h rainfall map; same backend | HTML | open | hourly | A |
| `https://hydrology.gov.np/#/current_forecast` | Flood forecast page (SPA) | HTML | open | daily | A |

### 4.2 Corridor gauge status (from the 29 Aug 17:15 UTC snapshot) [C]

| Station (DHM id / index) | Lat, Lon (elev) | Last data (UTC → NPT) | Last value | Warn / danger | Status |
|---|---|---|---|---|---|
| Bhotekoshi at Rasuwagadi (4913 / 446.22, Cellcom telemetry) | 28.2713, 85.3776 | 26 Aug 02:55Z → **08:40** | 1.62 m | 6.0 / 7.0 | **dead** (destroyed) |
| Bhote Koshi at Shyaprubesi (191 / 446.25) | 28.1707, 85.3426 (1,440 m) | 26 Aug 03:05Z → **08:50** | 3.80 m | 5.5 / – | **dead** |
| Langtang Khola at Shyaprubesi (190 / 446.2) | 28.1622, 85.3461 (1,484 m) | 26 Aug 03:05Z → 08:50 | 2.81 m | 3.75 / – | **dead** |
| Trishuli at Betrawati (52 / 447, auto + SMS) | 27.97, 85.18 | 26 Aug 03:35Z → **09:20** | 3.549 m | 4.1 / 5.0 | **dead** |
| Phalakhu Khola at Betrawati (4658 / 446.8) | 27.9743, 85.1858 (630 m) | 26 Aug 03:35Z → 09:20 | 1.93 m | 2.6 / 3.1 | **dead** |
| Trishuli at Furke Khola / Malekhu (5611, CDCP 2025) | 27.8024, 84.8441 | not in river-watch list | – | – | **washed away** (bridge gone 11:43) |
| **Trishuli Khola at Dhunche (4657 / 446.3)** | 28.0982, 85.3186 | 29 Aug 17:05Z | 2.756 m | 3.2 / – | **alive** — upstream tributary reference for local rain |
| **Trishuli at Galchi (5705)** | 27.8023, 85.0031 (378 m) | 29 Aug 17:15Z | 361.04 (stage datum) | – | **alive** |
| **Trishuli River at Kali Khola (4781 / 449.91)** | 27.833, 84.546 | 29 Aug 17:15Z | 6.69 m | 10.8 / 12.1 (peaked 12.3 m at 14:14 on 26 Aug) | **alive** |
| **Narayani at Devghat (265 / 450)** | 27.71, 84.43 | 29 Aug 16:55Z | 4.58 m | 7.3 / 9.0 (peak 6.57 m 16:00 26 Aug; ~5,850 m³/s; +20 M m³) | **alive** |
| Tadi Khola at Rautar (4659), Tadi at Belkot (66), Likhu at Pattawari (4660) — Nuwakot side tributaries | – | 29 Aug 14:35–17:15Z | – | – | alive |
| Langtang Khola at Kyangjin (4898), Langtang River at Ghodatalbela (5581, 3,022 m), Ganja La & Langtang-Lower snow stations (NVE 5512/5514) | upper valley | no data in river-watch | – | – | exist in catalogue; not reporting |
| Rainfall/climate: Dhunche (391, manual, 2,005 m), Timure (339, manual, 1,725 m), Kyangjin (369), Nuwakot AWS (342), Trisuli (341) | – | manual stations — no telemetry | – | – | [C] catalogue only |

**Reading:** everything between the border and Betrawati is blind; the first live stage is Dhunche (side valley) and then Galchhi, ~60 km below the impact zone. A second surge from the barrier lake would be seen first at Galchhi (~1.5–2 h after Betrawati), unless DHM re-installs a Cellcom logger at Syabrubesi/Betrawati (Narayani AMC 2026 contract stations are tagged in the catalogue).

### 4.3 Event hydrograph facts (DHM Flood Forecasting Division technical report, 27 Aug) [R, A]

08:20 M2.6 tremor near Rasuwagadhi (reported) · 08:37 collapse signal · 08:40 Rasuwagadhi 1.62 m (last) · 08:50 Syabrubesi offline · 09:00 phone alert from Rasuwa DAO + Betrawati gauge-keeper · 09:05 FFD notified · 09:15–16 SMS blast 679,295 · 09:20 Betrawati 3.55 m (last) · 10:28 Galchhi alert, Prithvi Hwy/Muglin–Narayanghat high alert · 11:26 Furke/Malekhu crosses warning · 11:43 Furke bridge destroyed · 11:50 Malekhu · 13:00 passed Muglin, Devghat evacuation · 13:30 Devghat 4.76 m · 14:14 Kali Khola peak 12.3 m · 15:20 flood at Devghat · 16:00 Devghat peak 6.57 m · 18:30 Devghat ~4 m. Four stations destroyed: Rasuwagadhi, Syabrubesi, Betrawati, Malekhu. Sources: Kathmandu Post 10-hour timeline (27 Aug), OnlineKhabar technical-report article, Spotlight "warning came by telephone" (28 Aug).

### 4.4 Other hydrology sources

| Source | Finding | Rel. | Status |
|---|---|---|---|
| Google Flood Hub / Flood Forecasting API | Site is JS-only; API needs Google Cloud key via waitlist (CC BY 4.0). Gauge IDs for Trishuli/Narayani not enumerable without key. Google's model is riverine-rainfall driven and would not have forecast this event. | B | [C] docs fetched; [U] gauge IDs |
| GloFAS (CEMS) | 2,903 fixed reporting points (Jun 2025); RIMES–ECMWF collaboration covers Nepal; no event-specific reporting-point output found; not useful for a GLOF-type surge. | B | [C] wiki fetched; [U] Narayani point ID |
| ICIMOD | 26/27 Aug advisory cites seismic records from **Jilong (~12 km) and Zhangmu** stations, DHM levels (Galchhi +9 m in 30 min; Malekhu +7 m). No lake time series published. | A | [C] |
| Chinese side gauges | MWR: hydrological emergency monitoring teams measuring level/discharge at the lake; 3 seismometers; satellite remote sensing; "digital twin" simulation. No public numeric feed. | B | [R] |
| NESRA FloodWatch | Mirrors DHM report; EO dashboard at `npl-flood-dash-356251209726.europe-west1.run.app`; no gauge feed. | C | [C] |

---

## 5. Weather / forecast

| Source | What | Format | Access | Cadence | Rel. | Status |
|---|---|---|---|---|---|---|
| **DHM MFD API** `https://dhm.gov.np/mfd/api/three-days-forecast-latest` | Latest 3-day bulletin: issue time + 5–6 PNG maps (`forecast-images/2026/08/29/day_1_….png`) | JSON | open | 08:00 & 18:00 NPT | A | [C] 29 Aug 18:00 bulletin id 1524 |
| `…/mfd/api/country-forecast` | Analysis + day-1/day-2 text (NP/EN). 29 Aug 18:00: monsoon trough slightly N of normal in the west, near normal in the east; generally cloudy; moderate rain/snow at many places in Himalayan Koshi/Bagmati/Gandaki; **heavy rain likely at one or two places in Himalayan & hilly Bagmati/Gandaki** both days. | JSON | open | 2×/day | A | [C] |
| `…/mfd/api/weather` | 19 synoptic-station 3-day forecasts (Kathmandu day-2/3: 60 % rain prob, moderate rain w/ thunder). No Dhunche point. | JSON | open | 2×/day | A | [C] |
| `…/mfd/api/mountain/all-info` | Mountain forecast framework (wind/temp at 3,000/5,500/7,000/9,000 m by province) — Bagmati enabled | JSON | open | daily | A | [C] |
| DHM SPA pages `dhm.gov.np/mfd/#/weather/pages/weather-warning`, `special-weather` | Warnings (JS-rendered) | HTML | open | ad hoc | A | [C] shell only |
| DHM seasonal outlook | 2026 monsoon forecast below-normal rain, above-normal temps (issued pre-season) | PDF/news | open | seasonal | A | [R] |
| **Open-Meteo (ECMWF IFS 0.25°)** Dhunche 28.11/85.30 (grid 1,997 m) | 29 Aug 11.1 mm, 30 Aug 19.2, 31 Aug 12.9, 1 Sep 11.7, 2 Sep 22.8, 3 Sep 8.3, 4 Sep 12.2; lowest low-cloud 05:00–07:00 daily (9–39 %) | JSON | open | hourly, 4×/day runs | B | [C] |
| Open-Meteo ECMWF+GFS Langtang 28.21/85.51 (grid 3,548 m) | ECMWF/GFS mm: 29 Aug 11.2/9.8 · 30 Aug 15.8/6.2 · 31 Aug 18.8/22.7 · 1 Sep 20.5/7.2 · 2 Sep 20.6/8.4 · 3 Sep 14.5/12.9 · 4 Sep 14.4/3.6. Low cloud <40 % 06–11 h on 29–30 Aug and 3–4 Sep; **none on 31 Aug–1 Sep** (worst flying days). | JSON | open | hourly | B | [C] |
| VNKT METAR (aviationweather.gov) | 29 Aug: CB all quadrants from 06:30 Z, TSRA 12:30–13:00 Z, +RA 16:30 Z, vis 4–8 km, BKN100. Morning 00–06 Z: FEW008 SCT030 BKN100, 6–7 km. | text | open | 30 min | A | [C] |
| ECMWF open data (0.25° HRES/ENS) | Available via `data.ecmwf.int` / open-meteo; not separately fetched | GRIB | open | 4×/day | A | [R] |
| Dhunche AWS | No telemetered AWS at Dhunche in DHM catalogue (Dhunche 391 is a manual climate station); nearest AWS: Nuwakot (342, MicroStep). | — | — | — | — | [C] |

Flying-window implication: mornings 06:00–10:00 NPT remain the reliable window; 31 Aug–1 Sep look worst for the upper valley; heavy-rain risk continues to be flagged by DHM for Bagmati mountains, which also feeds barrier-lake inflow.

---

## 6. Seismic / geophysical

| Source | Event | Detail | Access | Rel. | Status |
|---|---|---|---|---|---|
| **USGS ComCat** `earthquake.usgs.gov/fdsnws/event/1/query?eventid=us7000tbwb&format=geojson` | **M 5.2 ms_vx, event type "landslide"**, 2026-08-26 02:52:10.000 UTC (08:37:10 NPT), 28.271 N 85.515 E, depth 0, mag err ±0.09; products: origin, phase-data, dyfi, significance; updated 28 Aug 08:58 UTC. Originally released as M 4.4 earthquake; reclassified. | open | A | [C] |
| USGS `us7000tc90` | M 4.2 ms_vx landslide, 06:00:35 UTC (11:45 NPT), same coords; origin + phase-data. | open | A | [C] |
| USGS bbox search (27.5–29 N, 84.5–86.5 E, ≥M3, 25–29 Aug) | Only these two events. | open | A | [C] |
| **GEOFON** `geofon.gfz.de/fdsnws/event/1/query` | `gfz2026qrfy` Mw 5.69, 02:52:23.17 UTC, 28.3 N 85.5 E, 0 km, "Nepal | landslide" | open | A | [C] |
| IRIS/EarthScope FDSN event | `service.iris.edu` returns 410 Gone; `service.earthscope.org/fdsnws/event` 410 — event service retired; use USGS/GEOFON; waveforms via EarthScope dataselect | open | A | [C] |
| NEMRC/DMG `seismonepal.gov.np` | Site last updated 19 Aug; latest listed event 18 Aug (M4.4 Kaski). **No entry for the 26 Aug signal** as of 29 Aug. Publishes strong-motion data pages and event list. | open | B | [C] |
| China CENC / State Key Lab (地灾国重实验室, 29 Aug) | Seismic network recorded signal "equivalent to M 5.1"; ice-rock collapse phase ~**88 s**; Chinese press also cites a M4.4–4.5 event the same day (treated as USGS initial). MWR pre-positioned 3 seismometers at the lake. | prose | B | [R] Tencent/QQ 29 Aug; Sina 27 Aug |
| ICIMOD | Cites Jilong (~12 km) and Zhangmu station records; ~2 h of ground vibration seen at a Nepali station ~60 km away (EGU HS blog, Hetényi & Subedi, 28 Aug). | prose | A | [R] |
| EGU blog | Mass-movement volume 0.5–10 M m³ first estimate; second lake "already sinking". | prose | B | [C] |
| Infrasound | No IMS/other infrasound analysis found. | — | — | [U] |

---

## 7. Barrier-lake monitoring (Chinese side; Lhende/Chhochen–Purepu Tsangpo confluence, ~10 km above Gyirong port, ~2,950 m)

| Date/time | Reading | Source | Rel. |
|---|---|---|---|
| 27 Aug morning (CST) | Volume ≈ **2.0 M m³**, already overflowing; +3 M m³ inflow expected over 3 days; peak expected **1 Sep**; "high breach risk within 72 h" | MWR via Global Times / Tencent; Li Guoying meeting 27 Aug evening | B [R] |
| 28 Aug | Volume **>2.5 M m³** (Chinese press); Wikipedia EN cites level fallen by **10 m** on 28 Aug (unverified provenance) | Sohu / zh-wiki / en-wiki | C [R] |
| 27–28 Aug | Xinhua: lake "dwindling" per MWR analysis; ICIMOD: "gradually draining, burst risk eased" (29 Aug) | Xinhua / NESRA | B [R] |
| 29 Aug morning | Surface area **120,000 m² (Thu) → 99,000 m² (Sat)** by satellite; second, larger water body at the collapse site **>120,000 m², depth unknown** (Chen Hongqi, MNR Geological Disaster Technical Guidance Center); 15-person China Anneng team with recon drones, portable satellite stations, cameras deployed Fri 28 Aug | AP via Yahoo (29 Aug) | B [R] |
| 29 Aug | Chinese MFA: China shared "disaster-area imagery, satellite and hydrological data, and early warnings about upstream barrier lakes" with Nepal | AP | B [R] |

No numeric time series (level/discharge) is public on either side. Ask-for list: MWR digital-twin outputs; the 3 seismometer streams; ICIMOD's lake-area series.

---

## 8. Presence / mobility / displacement

| Source | Finding | Format/access | Cadence | Rel. | Status |
|---|---|---|---|---|---|
| **Meta Data for Good — Movement Distribution** (HDX `movement-distribution`) | Latest resource 13–16 Jul 2026; biweekly, 90-day retention; Nepal included in country list. **Not event-activated.** | CSV, open | biweekly | B | [C] package_show |
| Meta Movement Range Maps | Discontinued 22 May 2022 | — | — | — | [C] |
| Meta HRSL Nepal (`nepal-high-resolution-population-density-maps…`) | Baseline population, updated Nov 2025 | GeoTIFF/CSV | static | A | [C] |
| Meta crisis "Population during crisis / Displacement maps" | Not on HDX for this event; would require Meta partner access | — | — | — | [U] |
| **IOM DTM** (`npl-iom-dtm-from-api`, `dtm.iom.int/nepal`) | Nepal dataset last modified 24 Aug 2026 (pre-event). DTM API `IdpAdmin0Data` 404. No 2026 Rasuwa round yet. | API/CSV | ad hoc | A | [C] |
| Google mobility / Mapbox movement / Cuebiq / Unacast | Google Community Mobility ended 2022; nothing found for others | — | — | — | [U] |
| **IFRC GO** `goadmin.ifrc.org/api/v2/event/8073/` | Event "Nepal: Rasuwa Flash Flood, 2026"; Emergency Appeal **MDRNP022**, 28,000 beneficiaries, CHF 18 M; field report 18558 (26 Aug, no numbers yet). NRCS: 5 emergency camps set up (locations not listed). | JSON, open | as updated | A | [C] |
| CARE (29 Aug) | >10,000 households along the Trishuli corridor need emergency shelter; 250-household 2015-resettlement community swept away; 290 volunteers | prose | — | B | [C] |
| Nepal Police (evening 29 Aug) | 669 bodies (Chitwan 248, Nawalpur 158, Parasi 75, Gorkha 54, Dhading 49, Nuwakot 41, Tanahun 31, Rasuwa 13); 2,301 injured/rescued (Nuwakot 1,622, Rasuwa 676, Dhading 3); 140 discharged in KTM; 4,854 police deployed; 27 police out of contact | prose | daily | A | [C] nepalnews briefing |
| **Nepal Police UDB portal** `udb.nepalpolice.gov.np` (`/disaster`, `/missing`, `/found`, `/dead-bodies-lists`) | Rasuwa-flood section: unidentified bodies with photo, sex, *place found*; missing persons; found persons. 20 rows/page. **Personal data — use only aggregate counts and place-found geography.** | HTML | live | A | [C] |
| Hospital counts | Dhunche & Trishuli field hospitals treated 1,706 by 28 Aug (Rozana Spokesman); 101 in hospital 29 Aug (NDRRMA) | prose | daily | B | [R] |
| ReliefWeb API | v1 returns 410, v2 403 headless; use the web listing `reliefweb.int/report/nepal/npl-flood-08-2026-rasuwa-flood-2026-08-26` (GDACS/IFRC entry) | — | — | — | [C] blocked |
| HDX search "nepal flood 2026" | Only HOT/NAXA flood-area and OSM/Overture extracts (29 Aug 16:08 update); no mobility/telecom/displacement datasets | — | — | — | [C] |
| BIPAD incident API | (baseline) still only peripheral points | JSON | — | — | (baseline) |

---

## 9. Power / lights

| Source | Finding | Rel. | Status |
|---|---|---|---|
| NEA statements (OnlineKhabar 26 Aug; NepalNews; Khabarhub) | 220 kV Trishuli-3B hub substation destroyed; Chilime 220 kV hub down (tower damaged); lines down: Samundratar–Trishuli 132 kV, Chilime–Trishuli 66 kV, Chilime hub–Trishuli 3B hub–Matatirtha 220 kV, Trishuli–Balaju 66 kV. **431 MW** off grid + 470 MW under construction damaged (Wikipedia); 14 projects ~748 MW affected (live tracker). Rasuwa fully dark; Nuwakot/Dhading/Gorkha partial. Restored: Samundratar→Sindhupalchok; Chaughoda substation and Gajuri–Galchhi (via Dhadingbesi) in progress; "power restoration underway in five Nuwakot areas" (29 Aug). | A/B | [R] |
| NEA Load Dispatch Centre | No public feed found; ask NEA LDC for feeder-level restoration log (the corridor is fed radially from Trishuli/Devighat). | — | [U] |
| **NASA Black Marble** (CMR query, tile h26v06) | VNP46A1 (raw DNB radiance, daily) granules exist for 23–28 Aug (`VNP46A1.A2026240.h26v06.002.2026241090333.h5` = 28 Aug, produced 29 Aug 09:03 UTC); **VNP46A2** (cloud/lunar-corrected) latest is **21 Aug** (~8-day lag); NOAA-20 VJ146A2 none in window. Earthdata login required for download. Monsoon cloud will blank most nights; use A1 with the cloud mask, per-village pixels (500 m) around Dhunche/Syabrubesi/Betrawati/Bidur only. | B | [C] |

---

## 10. TIMS / permits / checkposts

| Source | Finding | Rel. | Status |
|---|---|---|---|
| `tims.ntb.gov.np` | React SPA ("You need to enable JavaScript"); agency login only; no public statistics or API. | A | [C] |
| NTB | No flood notice on ntb.gov.np homepage; counts released via press/Tourist Police (see §2). NTB compiles from agencies, guides, local authorities, security agencies — TIMS is one input, checkpost stamps are patchy (paper fallback). | A | [C] |
| Langtang NP entry (Dhunche gate) / Army checkposts | No public counts; Langtang permits are agency-only with mandatory guide since Feb 2025, so the **agency manifest** is the best single roster; NTB/TAAN hold it. | — | [U] |
| MoFA | 627 foreigners affected (27 Aug 20:00) → totals converge with NTB list; intake via WhatsApp/email. | A | [C] |
| Trekker locations reported | Upper Langtang trail "largely intact"; trekkers advised to descend to Thulo Syabru and wait; Langtang & Kyangjin NTC sites back by 27 Aug (see §1). | C | [R] agency blogs |

---

## 11. Which of these reveal reached / unreached places — ranked

1. **NTC/Ncell site-by-site restoration lists** (§1.1) — place-resolved, dated, updated daily; a restored site means a helicopter or ground team physically reached it and that phones there can register. Best available proxy. [B]
2. **DHM river-watch snapshot** (§4.2) — exact alive/dead gauge list; "alive" stations are reached/observed points; also the only live secondary-surge sensor (Galchhi first). [A]
3. **Nepal Army / NDRRMA evacuation breakdown by pickup site** (Timure, Syabrubesi, Mailung, Dhunche, Betrawati, Trishuli; §3.2) — proves LZs used; no negative evidence for unreached places. [B]
4. **Nepal Police UDB "place found" field + district body counts** — shows where searchers have worked (mostly downstream: Chitwan/Nawalparasi); silence for a place ≠ unreached. Aggregate only. [A, sensitive]
5. **NTB/MoFA out-of-contact counts by nationality** — global count only, no geography; falls as places are reached (420 → 320 during 29 Aug). [A]
6. **Chinese MWR/MNR lake numbers + comms restoration on the Gyirong side** — tells you the upstream hazard clock and that the Tibet corridor beyond 3 km from the gate was still unreached on 27 Aug. [B]
7. **NEA feeder/substation restoration** — weak proxy (grid can be dark while people are fine). [B]
8. **Black Marble VNP46A1** — nightly but cloud-limited; only useful as a "lights back on" check for Bidur/Dhunche-size towns. [C]
9. **Open ADS-B** — proven blind for helicopters in this corridor on 28 Aug (§3.3); only use is spotting high-altitude relay/ISR orbits. [D for this purpose]
10. **Meta/IOM/Ookla/Strava/Garmin** — not activated or not accessible; zero place-level signal as of 29 Aug. [—]

---

## 12. Immediate asks (who holds what)

- DHM Flood Forecasting Division: `/gss/api/observation` API key; plan/timing for replacement Cellcom loggers at Syabrubesi & Betrawati (both tagged "Narayani_AMC 2026").
- NDRRMA emergency-communication team / NTA: consolidated site-restoration table (site, ward, timestamp, backhaul) — NTC already publishes fragments.
- Nepal Army Directorate of Public Relations: daily sortie log (LZ, time, pax) — press only has totals.
- Operators (Simrik, Altitude, Kailash, Annapurna, Manang, Air Dynasty, Heli Everest, Prabhu): own GPS flight logs via NDRRMA.
- NEA LDC: feeder restoration log for Trishuli/Devighat radials.
- ICIMOD / MWR (via MoFA channel): lake level/area series and the 3-seismometer feed.
- NTB/TAAN: agency manifests for Langtang/Gosaikunda departures 20–26 Aug (group counts by lodge/village).
- Garmin Response / Zoleo / Globalstar via embassies: aggregate count of active devices in a Rasuwa bbox since 26 Aug (no IDs).
