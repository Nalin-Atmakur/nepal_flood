# 05 — the 13 wave-1 normalisers

One section per `normalisers/<id>.py`: endpoint(s), response shape, quirks, what it emits, and
the fixture used by `tests/test_normalisers.py`. Publisher strings are what the site shows.

```
   sources.yaml id           family    normaliser                    emits
   ───────────────────────── ───────── ───────────────────────────── ─────────────────────────────
   opmcm_stats               json_api  opmcm_stats.py                figures 'OPMCM portal'
   opmcm_person_reports      json_api  opmcm_person_reports.py       figures (+ keyed projection in raw_pulls)
   ndrrma_rescues            json_api  ndrrma_rescues.py             figures 'NDRRMA', place_hints
   ndrrma_publications       json_api  ndrrma_publications.py        articles, figures 'NDRRMA', PDFs → Storage
   bipad_river_stations      json_api  bipad_river_stations.py       gauges, figures 'DHM via BIPAD'
   mofa_flashflood           html      mofa_flashflood.py            figures 'MoFA', articles
   dhm_weather               json_api  dhm_weather.py                articles, figures 'DHM'
   openmeteo_corridor        json_api  openmeteo_corridor.py         figures 'Open-Meteo (ECMWF)'
   usgs_fdsn                 fdsn      usgs_fdsn.py                  figures 'USGS'
   gdacs_event               json_api  gdacs_event.py                figures 'GDACS'
   hot_bridge_damage         s3        hot_bridge_damage.py          figures 'HOT OSM', place_hints
   reliefweb_rss             rss       reliefweb_rss.py              articles
   outlet_rss_set            rss       outlet_rss_set.py             articles
```

---

## opmcm_stats — `GET https://rescue.opmcm.gov.np/api/stats`

Shape: `{success, data: {requests{total,open,critical,helpFound,inProgress,resolved,cancelled},
offers{total,available,…}, persons{total,lost,found,rescued,lostOpen,foundOpen,open,resolved,pinned,
last24h,childrenMissing,elderlyMissing,openOver48h,withoutContact,withoutPhoto,resolutionRate,
avgResolveHours,topLocation{name,count}}, breakdown{requestsByProblemType[],requestsByDistrict[],
requestsByHelpType[],offersByResourceType[],offersByDistrict[],personsByGender[],personsByDay[]}}}`.
No PII. Cadence 30m.

Emits (publisher `OPMCM portal`, `as_of = fetched_at` — the portal states no validity time):
`total lost found rescued lost_open found_open open resolved pinned last24h children_missing
elderly_missing open_over_48h without_contact without_photo resolution_rate_pct avg_resolve_hours
top_location_count help_requests help_requests_open help_requests_critical help_requests_in_progress
help_requests_resolved help_offers help_offers_available` (national); `help_requests` scoped
`district:<slug>` and `problem:<slug>`; `lost`/`found` scoped `gender:<key>` and `day:<date>`
(last 14 days). Fixture `opmcm_stats.json`.

## opmcm_person_reports — `GET …/api/person-reports?type={lost|found|rescued}&limit=200&page={n}`

Shape: `{success, data: {items[], total, page, limit}}`; each item `_id, type, fullName,
approximateAge, gender, locationText, location{Point}, eventAt, description (may contain
"Passport no. - …", "Nationality - …"), images[], imageUrl, thumbnail (base64 JPEG), status,
verified, createdAt, updatedAt` plus `daoOffice, daoStatus, source="dao", importRef` on
bulk-imported rows. Cadence 60m.

Quirks: `type=found` is **restricted** — the portal returns `items: []` with a `total` (`restricted:
"found"`); `type=rescued` answers **HTTP 400**. Only `lost` is listable (~55 pages of 200; the
puller caps at `MAX_PAGES = 60`). `prestore()` runs before storage: photos out, `fullName` +
`description` out, `person_key` in (passport → `key_strength="passport"`, else name + age band +
nationality → `"name"`), parsed `nationality`, `has_photo`, `age_band`.

Emits (publisher `OPMCM portal`, `as_of = fetched_at`): `<type>_reports_total` (from `total`),
`<type>_reports_listed` (rows actually retrieved), `<type>_reports` scoped `status:<s>`,
`district:<dao slug>` (from `daoOffice = "DAO Sindhupalchok"`), `source:dao|public`,
`gender:<g>`, `nationality:<n>`, `place:<gazetteer id>` (locationText resolved) and
`place:unresolved`. Every distinct `locationText` becomes a `place_hint` (text + resolved id).
Fixture `opmcm_person_reports.json` (envelope of 3 parts after `prestore`, 25 keyed rows).

## ndrrma_rescues — `GET https://ndrrma.gov.np/api/v1/rescues/{rescued-persons/?limit=500&offset={n} | status-counts/ | rescued-statistics → `rescued_portal`/ | rescued-locations/ | stationed-locations/}`

Shapes (DRF): `rescued-persons` `{count, next, previous, results[{id, name, name_ne, age,
rescued_location, stationed_location, status{id,title,title_ne}, rescued_date, nationality,
country, gender, remarks}]}`; `status-counts` `{total_count, nepali_count, foreign_count,
status_counts[{id,title,title_ne,count}]}`; `rescued-statistics` `{rescued_count, active}`;
`rescued-locations` / `stationed-locations` `{results[{id, title, title_ne, centroid}]}` (21 and 11
entries; centroids only on stationed). Cadence 30m.

Quirks: `prestore()` replaces `name`/`name_ne` with `person_key` (name + age band +
country/nationality) and reduces `remarks` to a redacted `remarks_place`; `rescued_location` is
often null in the register even though 21 sites are published.

Emits (publisher `NDRRMA`, `as_of = fetched_at`, url `https://ndrrma.gov.np/np/rescue`):
`rescued` (headline `rescued_count`), `rescued_named`, `rescued_named_nepali`,
`rescued_named_foreign`, `rescued_named_listed`; `rescued_named` scoped `status:<s>`,
`nationality:<c>`, `gender:<g>`; `rescued` and `stationed` scoped `place:<gazetteer id or slug>`
with `note="NDRRMA: <title>"` counted from the persons' `rescued_location` /
`stationed_location`. A `place_hint` per location title (`kind` = `rescued_location` |
`stationed_location`). Fixture `ndrrma_rescues.json` (5 parts, 30 keyed persons).

## ndrrma_publications — `GET https://ndrrma.gov.np/api/v1/publication/publications/?ordering=-id&limit=40`

Shape: `{count, next, previous, results[{id, publication_type{pub_type,…}, publication_author,
title, title_ne, description, summary, date, pdffile, image, is_published}]}`. Cadence 30m.

Flow: every publication → an `articles` row (url = `pdffile`, publisher `NDRRMA`, `published_at`
= `date` in NPT). For ids not yet in `_state.json` `sources.ndrrma_publications.publications`
and dated ≥ 26 Aug 2026: `ctx.fetch(pdffile)` → `ctx.upload("ndrrma_publications/<id>.pdf")`
into bucket `raw`; then
- **PII list** (`id ∈ {373, 377, 380, 381, 383, 384}` or title matches `/list|विवरण|नामावली/i`) →
  stored only, never extracted (`note: "PII list — stored PDF only"`);
- **Situation Report** (`pub_type` contains "situation" or title contains "स्थिति") → pypdf text
  → `parse_sitrep_text()`; < 200 chars of text = scanned image, skipped with a note;
- anything else → stored only.
Ids are added to the seen list only after success, so a failed download is retried next run.

Sitrep parsing: Canva PDFs lose matras and emit NUL bytes ("उ ार" for "उद्धार"); the text is
NFC-normalised with `\x00 → space` and matched with deliberately loose patterns. `as_of` comes
from the BS date + time in the title or header (`२०८३ भदौ १३ गते साँझ ६ः३० बजे` → 2026-08-29
18:30 NPT) via `_common.parse_bs_datetime`: **2083 BS month starts** — Shrawan 1 = 2026-07-17,
Bhadra 1 = 2026-08-17 (verified: "13 Bhadra" = 29 Aug), Asoj 1 = 2026-09-17 (assumed 31-day
Bhadra), Kartik 1 = 2026-10-17; periods बिहान/दिउँसो/साँझ/राति shift the hour.

Emits (publisher `NDRRMA`, note `Sitrep #N · publication <id>`): national `dead` (शव फेला
परेको), `missing` (सम्पर्कविहीन), `rescued` (कुल उद्धार), `injured`, `personnel`,
`foreigners_missing`, `foreigners_rescued_air`, `telecom_towers_damaged`,
`telecom_towers_restored`, `heli_flights_total`, `dead_sum_of_districts`; `dead` scoped
`district:{rasuwa,nuwakot,dhading,gorkha,nawalparasi_east,nawalparasi_west,tanahun,chitwan,makwanpur}`;
`missing` scoped `category:{security_forces_police,security_forces_army,customs,immigration,
hydropower_projects,nepalis_with_foreign_tourists,langtang_national_park}` and
`district:{rasuwa,nuwakot,makwanpur}`; `shelter_sites` / `shelter_people` scoped
`district:nuwakot|rasuwa`; from the health table `injured_treated_total`,
`injured_under_treatment`, `injured_referred`, `injured_discharged`, `deaths_in_care`.
Fixtures `ndrrma_publications.json` (list) and `ndrrma_publications_sitrep8.txt` (extracted text
of Sitrep #8, phone-like digits scrubbed).

## bipad_river_stations — `GET https://bipadportal.gov.np/api/v1/river-stations/?limit=1000`

Shape: `{count, next, previous, results[{id, title, basin, point{coordinates[lon,lat]},
waterLevel, dangerLevel, warningLevel, waterLevelOn, status, steady, elevation, stationSeriesId,
image, affectedDemography, district, …}]}` — 281 stations, live mirror of DHM. Cadence 10m.

Quirks: `count` is int64-max on every list, so the puller pages on `next` (stops at an empty
page, max 10); **BIPAD ids are not DHM ids** (BIPAD 191 is Karnali at Benighat), so corridor
stations are matched on `title` against `config.CORRIDOR_GAUGES`:
Bhotekoshi at Rasuwagadi · Bhote Koshi at Shyaprubesi · Langtang Khola at Shyaprubesi ·
Trishuli at Betrawati · Phalakhu Khola at Betrawati · Trishuli Khola at Dhunche · Trishuli at
Galchi · Trishuli at Furke Khola(Malekhu) · Trishuli River at Kali Khola · Narayani at Devghat ·
Trishuli River at Bhorle.

Emits: one `gauges` row per station — `station_id = "bipad-<id>"`, `station_name = title`,
`river = basin`, lat/lon, `level`, `warning`, `danger`, `observed_at = waterLevelOn` (NPT →
UTC), `alive = observed_at ≥ fetched_at − GAUGE_ALIVE_HOURS (2 h)`. Figures (publisher
`DHM via BIPAD`): `water_level_m` scoped `place:<corridor place id>` (`as_of = observed_at`,
note `"<label> · <title> · alive|dead · status=…"`) and national `gauges_alive_corridor`
(note = number dead). Fixture `bipad_river_stations.json` (corridor stations + a few others,
images and demography removed).

## mofa_flashflood — `GET https://mofa.gov.np/category/flashflood/` (+ linked pages)

Shape: category HTML listing `/content/<id>/…` links ("Latest Updates on Flash Floods- 28
August 2026", "Press Briefing Note by Hon. Minister … on Bhote Koshi Flood"). Cadence daily.

Flow: `find_update_links()` keeps links whose text matches `flash flood | bhote koshi | flood`
(not "procedure"), newest 3 by content id; each is fetched with `ctx.fetch` and parsed by
`parse_update_page()`. `as_of` from "(As of 15:30 hrs NST on 28 August 2026)" or
"2:00 PM, 29 August 2026", else the date in the title at 17:00 NPT. A day whose update is a PNG
(29 Aug) yields only the article row — there is no OCR.

Emits (publisher `MoFA`): `dead` ("N bodies have been recovered"), `foreigners_total`,
`foreigners_found`, `foreigners_missing` ("out of N people from K countries, F … found and M …
missing" and the 3-row summary table), `missing` ("about N people are still unaccounted for",
note approx.), `rescued` ("Over N people have been rescued"); the nationality table (`COUNTRY ·
NO. OF PERSON · FOUND · STILL MISSING`) → the three `foreigners_*` metrics scoped
`nationality:<slug>`; one `articles` row per update page. Fixtures `mofa_flashflood.html`
(category), `mofa_flashflood_1864.html` (28 Aug table), `mofa_flashflood_1866.html` (29 Aug
briefing); scripts/styles stripped.

## dhm_weather — `GET https://dhm.gov.np/mfd/api/{three-days-forecast-latest|country-forecast|weather|mountain/all-info}`

Shapes: `three-days-forecast-latest` = list of bulletins `{id, title, issue_date, description,
images[]}`; `country-forecast` = `{id, issue_date, analysis_np, analysis_en, np_text_1,
np_text_2, en_text_1, en_text_2, user{name,…}}`; `weather` = `{id, datetime, stations[{name,
manual_forecast[{day, rain_probability, weather{name}}], …}]}`; `mountain/all-info` = reference
lists. Cadence "2/day" (720 min).

Emits: `articles` — one per three-day bulletin (url `<endpoint>#<id>`, lang from the Nepali
title) and one for the country forecast (EN + NP text as body); figures (publisher `DHM`):
`weather_warning_level` national, `as_of = issue_date` — 0 none · 1 "moderate" · 2 "heavy" ·
3 "very heavy" found in the English text, note = first sentence; `rain_probability_pct`
scoped `station:<slug>` for day 1 of each synoptic station. The forecaster's name in
`user.name` is never emitted (fixture replaces it with `EXAMPLE-PERSON-1`). Fixture
`dhm_weather.json` (4 parts).

## openmeteo_corridor — `GET https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&hourly=precipitation,cloud_cover_low&models=ecmwf_ifs025&timezone=Asia%2FKathmandu&forecast_days=4`

The puller builds one url per site in `config.OPENMETEO_SITES`: `dhunche` (28.11, 85.30) and
`langtang_village` (28.21, 85.51). Shape: `{latitude, longitude, utc_offset_seconds, hourly{time[],
precipitation[], cloud_cover_low[]}}`. Cadence 6h.

Emits (publisher `Open-Meteo (ECMWF)`, scope `place:<site>`): `precip_mm` and `low_cloud_pct`
per hour, `as_of` = the hour in UTC, only hours within `fetched_at − 1 h … + OPENMETEO_HOURS (72)`;
`flying_window_quality:<day>` per local day (day in the metric so `figures_latest` keeps all three days), value 1 = good / 0 = poor, `as_of` = 06:00 NPT that day,
note `"good|poor · 06–11 NPT · low cloud NN% · rain N.N mm"`. **Rule:** the morning window is
06:00–11:00 NPT (`FLYING_WINDOW_HOURS_LOCAL`); good when mean low cloud ≤ 40 %
(`FLYING_GOOD_MAX_LOW_CLOUD_PCT`) and total rain ≤ 3 mm (`FLYING_GOOD_MAX_PRECIP_MM`). Fixture
`openmeteo_corridor.json` (2 parts).

## usgs_fdsn — `GET https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-08-25&latitude=28.3&longitude=85.5&maxradiuskm=100&minmagnitude=2.5`

Shape: GeoJSON `FeatureCollection` — `properties{mag, place, time (ms), type, magType, url, …}`,
`geometry.coordinates[lon, lat, depth]`, `id`. Cadence 60m.

Emits (publisher `USGS`): `seismic_event` per feature — `value = mag`, `as_of = time`, url =
event page, note `"<id> · <type> · depth <z> km · <place> · <magType>"` (the two known events are
`us7000tbwb` M 5.2 landslide 02:52 UTC and `us7000tc90` M 4.2 06:00 UTC on 26 Aug); national
`seismic_events_since_25aug` = feature count. Fixture `usgs_fdsn.json`.

## gdacs_event — `GET https://www.gdacs.org/gdacsapi/api/events/geteventdata?eventtype=FL&eventid=1104124`

Shape: GeoJSON Feature, `properties{eventid, glide, alertlevel, alertscore, episodealertscore,
datemodified, url{report,…}, sendai[{sendaitype, sendainame, sendaivalue, dateinsert,
description, latest}], …}`. Cadence 6h.

Emits (publisher `GDACS`, url = report page): `alert_score` (`episodealertscore`, `as_of =
datemodified`, note `"<alertlevel> · GLIDE <glide> · <htmldescription>"`); one
`sendai_<slug(sendainame)>` per Sendai row (e.g. `sendai_death`, `sendai_affected`,
`sendai_injured`, `sendai_rescued`, `sendai_transport_damaged`), `value = sendaivalue`, `as_of
= dateinsert` (NPT), note `"GLIDE FL-2026-000167-NPL · Sendai <type> · <description>"` (+
"superseded" when `latest` is false). Fixture `gdacs_event.json`.

## hot_bridge_damage — `GET https://production-raw-data-api.s3.amazonaws.com/ISO3/NPL/combined/hot_flood_npl_bridge_damage.geojson`

Shape: `FeatureCollection` of 59 points, `properties{name, status ("Washed out" | "Damaged" |
"Intact"), status_original, location, length_m, adm0…adm3_pcode/name}`. Cadence 60m.

Emits (publisher `HOT OSM`, `as_of` = S3 `Last-Modified` when the part carries it, else
`fetched_at`): `bridge_status` per feature, `value = 1`, scope `place:<gazetteer id>` resolved
from `location`, then `name`, then `adm3_name`, else `place:<slug(name)>`, note
`"<status> · <name> · <adm3>"`; national `bridges_washed_out`, `bridges_damaged` (washed out +
damaged), `bridges_intact`, `bridges_surveyed`. A `place_hint` per feature (`kind="bridge"`).
Fixture `hot_bridge_damage.geojson`.

## reliefweb_rss — `GET https://reliefweb.int/updates/rss.xml?search=rasuwa` (browser UA required)

Shape: RSS 2.0, 20 items, `author` = publishing organisation, summary = tag divs + one paragraph.
Cadence 60m. Shared code in `normalisers/_rss.py`.

Emits `articles`: url = item link, title, publisher `"<author> (via ReliefWeb)"` (else
`ReliefWeb`), lang by script detection, `published_at` from `published_parsed` (UTC), `body` =
the summary paragraph only (boilerplate `Country:` / `Source:` / `Format:` lines dropped, ≤ 2000
chars). No body fetch. Fixture `reliefweb_rss.xml`.

## outlet_rss_set — 13 feeds (list in `sources.yaml`)

onlinekhabar.com (NE) · english.onlinekhabar.com · kathmandupost.com · english.khabarhub.com ·
risingnepaldaily.com · english.nepalnews.com · radionepalonline.com · english.ratopati.com ·
annapurnapost.com · gorkhapatraonline.com · newsofnepal.com · feeds.bbci.co.uk/nepali ·
nepalitimes.com. Cadence 30m. One envelope part per feed.

Emits `articles`: publisher from the link domain via `_rss.PUBLISHERS` (e.g. `Onlinekhabar`,
`Kathmandu Post`, `BBC Nepali`, `Nepali Times`), falling back to the feed title, then the host;
`lang` = `ne` for Devanagari, `hi` when Hindi markers dominate or the domain is in
`HINDI_DOMAINS`, `en` for Latin, `zh` for CJK (`lib.text.lang_of`); `published_at` UTC; `body` =
feed summary (tags stripped, ≤ 2000 chars). `FETCH_BODIES = False` — article pages are never
fetched. Items without a title or link are skipped; nothing else is filtered (① decides which
articles mention corridor places). Fixture `outlet_rss_set.json` (13 parts × 8 items, bylines
replaced by `EXAMPLE-PERSON-n`).

Wave-2 official/government sources (setu_recordlist, police_udb, volunteer_bulletin_repo, heoc_sitreps, dao_nuwakot_rescued, dao_rasuwa_hub, ifrc_go, china_mwr, china_mfa_pressers, us_embassy_alerts, ndrrma_newsinfo, ndrrma_bulletins) are documented in [05a-sources-wave2-official.md](05a-sources-wave2-official.md).

---

Wave 2 (geospatial + text — NESRA, EMSR927, HOT TM, GEOFON, DHM river watch, Google News site queries, ekantipur live, live blogs, China search APIs, Wikipedia, NTC restoration, HDX / HOT S3 / OpenAerialMap availability): [05b-sources-wave2-geospatial-text.md](05b-sources-wave2-geospatial-text.md).

Wave 3 (the last 12 registry ids — OPMCM help requests + government notices, BIPAD hydrograph, NESRA/DoR bridges, UNOSAT extent, outlet tag pages, GDELT, Vantor / Planet / Copernicus / Hugging Face catalogues): [05c-sources-wave3.md](05c-sources-wave3.md). After it every id in `sources.yaml` has a normaliser.
