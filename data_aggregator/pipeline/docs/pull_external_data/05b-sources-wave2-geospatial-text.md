# 05b — wave 2 (geospatial + text): 14 more normalisers

Companion to [05-sources.md](05-sources.md) (wave 1) — same conventions: one section per
`normalisers/<id>.py`, endpoint(s), response shape, quirks, what it emits, the fixture used by
`tests/test_normalisers_w2b.py`. Every figure carries `publisher / metric / scope / as_of / url`; every
`articles` row passes the relevance gate (04-normalising.md §relevance) inside the normaliser **and**
again in the puller. HTML helpers for this lane live in `lib/htmlx.py` (`lib/html.py` belongs to the
official-sources lane, 05a).

```
   sources.yaml id            family    normaliser                     emits
   ────────────────────────── ───────── ────────────────────────────── ────────────────────────────────────────────
   nesra_bucket               gcs       nesra_bucket.py                figures 'NESRA FloodWatch' (+ per-bridge), place_hints
   emsr927_dashboard          json_api  emsr927_dashboard.py           figures 'Copernicus EMS' per AOI + activation totals
   hot_tasking_manager        json_api  hot_tasking_manager.py         figures 'HOT' scope project:<id>
   geofon_fdsn                fdsn      geofon_fdsn.py                 figures 'GFZ GEOFON' seismic_event
   dhm_riverwatch_post        post_api  dhm_riverwatch_post.py         gauges 'dhm:<id>', figures 'DHM'
   google_news_site_queries   rss       google_news_site_queries.py    articles (11 site: queries)
   ekantipur_live             html      ekantipur_live.py              articles (ne) with places
   live_blogs                 html      live_blogs.py                  articles, one per live-blog post
   china_search_apis          post_api  china_search_apis.py           articles (zh), figures 'Xinhua/People’s Daily'
   wikipedia_revisions        mediawiki wikipedia_revisions.py         figures 'Wikipedia (unattributed)', articles (citations)
   ntc_restoration_articles   derived   ntc_restoration_articles.py    figures 'NTC/Ncell via press' (run by process_data ③)
   hdx_search                 json_api  hdx_search.py                  'dataset availability' articles, publisher HDX
   hot_s3_listing             s3        hot_s3_listing.py              'dataset availability' articles, publisher HOT
   oam_bbox                   json_api  oam_bbox.py                    'dataset availability' articles, publisher OpenAerialMap
```

---

## nesra_bucket — `GET https://storage.googleapis.com/npl-flood-front/{summary.json|bridges_to_inspect.geojson|buildings_in_extent.geojson}`

NESRA FloodWatch's public GCS bucket (the EO dashboard's backend; URLs "do not expire"). Cadence 6h;
three envelope parts. `summary.json` = `{version, event_date, imagery_date, reach_km 101.6, floodway_km2,
normal_river_km2, buildings_floodway 3216, buildings_footprint_ha, buildings_osm_confirmed 2293,
major_road_flooded_km, pasang_lhamu_flooded_km, bridges_intersecting 62, channel_measured_km,
channel_interpolated_km, channel_no_evidence_km, recall_heldout_pct, precision null, notes{}, cems{…}}`;
`bridges_to_inspect.geojson` = 62 LineStrings `properties{kind:"bridge", class, name (48 null), note,
bridge_id}`; `buildings_in_extent.geojson` = 3,216 polygons `properties{source, h_gba, footprint_m2,
osm_sees, confirmed_status (Destroyed|Damaged|Possibly damaged|null), confirmation_source}`.

Emits (publisher `NESRA FloodWatch`, **`as_of = imagery_date` 00:00 UTC** for every row so a re-pull
of the same release is a no-op): the summary counters above as national metrics of the same name;
`bridge_to_inspect` per line, value 1, note `"<name|unnamed bridge #id> · <class> · <note> · <how resolved>"`,
scope **`place:<id>|bridge:<bridge_id>`** (several bridges share a place and figures are unique on
publisher/metric/scope/as_of/value; the ledger reads the id before the `|`), `<id>` resolved **from the bridge name via the gazetteer** (rejected when that place has
coordinates more than 10 km away — "Trishuli River Old Bridge" must not land on Trishuli Bazar from
Rasuwa), else the nearest gazetteer place within 3 km of the line midpoint (every CSV place has
coordinates), else `unresolved:<slug(name)|bridge_<id>>`; `bridges_to_inspect` per `place:<id>` and national;
`buildings_in_extent` and `buildings_<confirmed_status>` (`buildings_destroyed`, `buildings_damaged`,
`buildings_possibly_damaged`, `buildings_unconfirmed`). A `place_hint` per named bridge. The `cems`
block is not re-emitted (emsr927_dashboard is the primary source). Fixture `w2b_nesra_bucket.json`
(summary + all 62 bridges + 40 buildings).

## emsr927_dashboard — `GET https://mapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR927`

Shape: `{count, next, previous, results[{code, name, reason, activationTime, closed, gdacsId, stats{
"Identified buildings [No.]", "Roads [km]", "Population [No.]", "Built-up area [ha]", max_extent},
reportLink, productsPath, aois[{name, number, extent, products[{id, type:"GRA", images[{sensorName,
acquisitionTime}], stats{"Built-up"{<class>{unit,total,affected}}, "Transportation"{… "Bridges and
elevated highways"}, "Estimated population"{None{total,affected}}, "Landslide"{None{affected ha}}, "Land
use", "Facilities"} | null, downloadPath, expectedDelivery, version{number, deliveryTime, statusCode
F|W}}]}]}]}`. Cadence 60m.

Emits (publisher `Copernicus EMS`): per AOI × product with stats, scope `place:<aoi>` — Syapru
Besi → `syabrubesi`, Timure → `timure`, Bidur → `bidur`, Bharatpur → `bharatpur` (explicit map, then
`ctx.resolve`, then slug), **`as_of = version.deliveryTime`**, url = `downloadPath`: `buildings_affected`
/ `buildings_total` (Σ Built-up), `roads_affected_km` / `roads_total_km` (Transportation rows in km),
`bridges_affected` / `bridges_total`, `population_affected` / `population_total`, `flow_area_ha`;
`aoi_delivered` 1|0 for every AOI (as_of = deliveryTime or fetched_at, note carries the expected time —
the AOI04 Bharatpur watch). National, `as_of` = newest delivery: `identified_buildings`, `roads_km`,
`population`, `builtup_ha`, `max_extent_ha` (delivered AOIs only). Fixture `w2b_emsr927_dashboard.json`
(29 Aug: AOI01 v1, AOI02 v2, AOI03 v1 delivered; AOI04 waiting).

## hot_tasking_manager — `GET https://tasking-manager-production-api.hotosm.org/api/v2/projects/?campaign=2026%20Nepal%20Floods` (+ `/projects/{id}/statistics/`)

Shape: `{mapResults, results[{projectId, name, status, percentMapped, percentValidated, lastUpdated,
totalContributors, …}], pagination}`; the statistics sub-fetch (`ctx.fetch`, ≤ 8 projects) returns
`{totalMappers, totalTasks, percentMapped, percentValidated, …}`. Cadence 60m.

Emits (publisher `HOT`, scope `project:<id>`, `as_of = lastUpdated`, url `https://tasks.hotosm.org/projects/<id>`,
note = project name): `mapped_pct`, `validated_pct`, `contributors`, and `mappers`, `tasks_total` when
the sub-fetch succeeds (a failed sub-fetch just loses those two); national `projects_active`. Fixture
`w2b_hot_tasking_manager.json` (+ `w2b_hot_tm_stats_63069.json` served by the test's fake fetch).

## geofon_fdsn — `GET https://geofon.gfz.de/fdsnws/event/1/query?format=text&starttime=2026-08-25&latitude=28.3&longitude=85.5&maxradius=1&minmagnitude=3`

Pipe-delimited text with a `#` header (`EventID|Time|Latitude|Longitude|Depth/km|…|MagType|Magnitude|
…|EventLocationName|EventType`). Cadence 60m. Emits (publisher `GFZ GEOFON`): `seismic_event` per
row, value = magnitude, `as_of` = origin time, url = `https://geofon.gfz.de/eqinfo/event.php?id=<id>`,
note `"<id> · <type> · depth <z> km · <place> · <MagType>"` (`gfz2026qrfy` Mw 5.69 landslide 02:52:23 UTC);
`seismic_events_since_25aug`. Fixture `w2b_geofon_fdsn.txt`.

## dhm_riverwatch_post — `POST https://dhm.gov.np/site/riverWatchTableViewData` (no body)

Shape: `{status, data[{id, name, basin, district, stationIndex, waterLevel: {datetime (UTC ISO), value} |
" ", warning_level, danger_level, steady, status, maxvalue, minvalue}]}` — 332 stations, the same table
the river-watch page renders; **no coordinates**, and a silent station has `waterLevel: " "` (no
timestamp at all). Cadence 10m. The `family: post_api` entry makes the puller POST with `json=None`.

Emits: `gauges` for every station with a reading — `station_id = "dhm:<id>"` (**DHM ids, not BIPAD
ids**: 5705 Galchi, 4657 Dhunche, 4913 Rasuwagadi …), `station_name`, `river = basin`, `lat/lon = null`,
`level`, `warning`, `danger`, `observed_at = waterLevel.datetime`, `alive` within `GAUGE_ALIVE_HOURS`; the
dead corridor gauges have no timestamp and therefore no row (BIPAD keeps their last reading). Figures
(publisher `DHM`): `water_level_m` scoped `place:<corridor id>` by the same title match as
`bipad_river_stations` (`config.CORRIDOR_GAUGES`), `gauges_alive_corridor` (note = dead or silent),
`stations_reporting` (note = silent count). The ledger's nearest-gauge logic reads both feeds through
`v_gauges_latest`. Fixture `w2b_dhm_riverwatch_post.json` (corridor + 12 other stations).

## google_news_site_queries — 11 `GET https://news.google.com/rss/search?q=site:<domain>+…+when:2d&hl=en&gl=US&ceid=US:en`

Domains without a usable feed: kathmandupost.com, thehimalayantimes.com, myrepublica.nagariknetwork.com,
ekantipur.com / setopati.com / nagariknews.nagariknetwork.com (`q=बाढी`), english.news.cn, globaltimes.cn,
apnews.com, theguardian.com, aljazeera.com (list in `sources.yaml`; the old `{domain}` template was never
expanded by the puller). RSS 2.0, ≤ 100 items per query: `title = "<headline> - <outlet>"`, `link` =
`news.google.com/rss/articles/<id>?oc=5`, `pubDate`, `<source url=…>outlet</source>`. Cadence 60m.

Quirks: the redirector ids are the new `AU_yqL…` form, which needs a JS/POST round-trip — a HEAD
does not resolve them — so the redirector is stored as the article url (unique per article, so
`articles(url)` still dedupes); legacy base64 ids are decoded offline (`decode_redirector`). Google
**renders Devanagari headlines in English** even in the `hl=ne` edition, so ekantipur/Setopati/Nagarik
rows arrive as `lang=en` machine translations (the Nepali originals come from `ekantipur_live` and
`outlet_rss_set`).

Emits `articles`: title with the outlet suffix removed, publisher from `<source>` via `_rss.PUBLISHERS`
(`Kathmandu Post`, `Kantipur`, `The Guardian` …), `published_at` = pubDate, no body, relevance gate per
item, dedupe on url across queries; a failed query is a note, the others still land. Fixture
`w2b_google_news_site_queries.json` (3 feeds × 12 + one 503 part).

## ekantipur_live — `GET https://ekantipur.com/news/2026/08/26/17877170054081721.html` + `GET https://ekantipur.com/`

The live page carries 360+ posts: `<div class="live-news" data-story="<slug>"> … <p class="inter"
data-date="2026-08-29 22:47:18"> (NPT) … <h3>headline</h3> … <div class="live-news-collapse …">body
(<p>, an image, a `<strong>- reporter</strong>` byline)</div>`. The homepage lists dated links
`https://ekantipur.com/<section>/2026/MM/DD/<slug>.html`. Cadence 30m; two envelope parts.

Emits `articles` (publisher `Kantipur`, lang `ne`): one per live post — url = live page + `#<slug>`,
`published_at` = `data-date` in NPT → UTC, body ≤ 2000 chars **with the byline removed**, `places` =
gazetteer ids matched **exactly** in headline + body after cutting Nepali postpositions (`टिमुरेमा` →
`टिमुरे`; skeleton hits such as शनिबार → Shanti Bazar are not taken); one per homepage link dated ≥ 26 Aug
(`published_at` = that date 00:00 NPT). Relevance gate per row. Fixture `w2b_ekantipur_live.json`
(25 posts, bylines → `EXAMPLE-PERSON-n`; 80 homepage anchors).

## live_blogs — BBC `cr0qxd1y219kt`, CNN, NBC, Guardian, ABC (AU) live pages

Every page embeds schema.org `LiveBlogPosting` with `liveBlogUpdate[{@type: BlogPosting, headline?,
articleBody, datePublished, dateModified, @id | url | mainEntityOfPage, publisher, author}]` —
`lib/htmlx.live_blog_posts` flattens `@graph`, never reads `author`. Cadence 60m.

Emits `articles` (lang `en`): one per post — title = the headline (BBC, ABC) or the first sentence of
the body ≤ 140 chars (CNN, NBC, Guardian); url = the post permalink (`?post=asset:` BBC, `?post-id=`
CNN, `#live-blog-post-` ABC, `?page=with:block-<id>#block-<id>` built from the Guardian's bare block
id) or `<page>#post-<hash>` when the outlet only gives the page url (NBC); publisher from the JSON-LD
(`BBC News`, `CNN`, `NBC News`, `The Guardian`, `ABC News (Australia)`); `published_at` = datePublished;
body ≤ 2000. Only posts passing the relevance gate. Quirk: the Guardian's `BlogPosting` entries repeat the
page headline and the page `datePublished` on every post (only `articleBody` and the block id differ), so
Guardian rows get the first-sentence title and the page time. Fixture `w2b_live_blogs.json` (5 pages
reduced to their JSON-LD, 12 posts each, authors → `EXAMPLE-PERSON-n`).

## china_search_apis — `POST https://api.thepaper.cn/search/web/news` · `POST http://search.people.cn/search-platform/front/search`

Bodies come from `pull_external_data.POST_BODIES` (`{"word":"吉隆口岸","pageNum":1,"pageSize":20}` and
`{"key":"吉隆口岸","page":1,"limit":20}` — the minimal People's Daily body works). Shapes: People's Daily
`{code, data{records[{title (<em> highlights), content, displayTime (ms), url, originName, domain,
editor, author}], total}}`; The Paper `{code, data{list[{contId, name (<font> highlights), summary,
publishTime "YYYY-MM-DD HH:MM:SS" (CST), pubTimeLong}]}}`. Cadence 2h.

Emits `articles` (lang `zh`) dated ≥ 26 Aug 2026 00:00 CST: People's Daily — url, title/content with
highlight tags stripped, publisher `"<originName> via People's Daily"` (`新华社 via People's Daily`) or
`People's Daily`; The Paper — url `https://www.thepaper.cn/newsDetail_forward_<contId>`, publisher
`The Paper`, summary as body. `editor` / `author` are never read (the fixture replaces them anyway).
Figures: when a **People's Daily headline** states a count — `已致7人死亡 554人失联`, `死亡人数升至7人` (either
word order: 死亡/遇难 → `dead`, 失联/失踪 → `missing`, 受伤 → `injured`) — publisher `Xinhua/People’s Daily`,
scope `country:china`, `as_of` = article time, url = article, note = headline. Fixture
`w2b_china_search_apis.json` (10 + 10 records, one synthetic count headline).

## wikipedia_revisions — two `GET https://en.wikipedia.org/w/api.php?action=query&titles=2026_Nepal_floods&…`

(a) `prop=revisions|extlinks&rvlimit=50&rvprop=ids|timestamp|size&ellimit=500` — the 50 newest
revisions (no user names) and every external link; (b) `prop=revisions&rvslots=main&rvprop=ids|
timestamp|content&rvlimit=1` — the latest wikitext (~80 KB). Cadence 60m.

Emits figures (publisher `Wikipedia (unattributed)`, reliability C, **note starts `do not cite`**,
`as_of` = revision timestamp, url = the article): `revision_id`, `revisions_last_24h`, and from the
infobox `| deaths = 682+{{efn|675+ in Nepal, 7+ in China}}` / `| injuries = 1,473+` / `| missing =
2,980+{{efn|2,426 in Nepal, 554 in China}}` → `dead` / `injured` / `missing` — the **Nepal share as
`national`** when the footnote gives one (else the headline number) and the China share as
`country:china`. Metric names match the NDRRMA vocabulary on purpose: figures_latest keeps publishers
apart and the digest/stat pickers select NDRRMA/MoFA/OPMCM explicitly, so these only show up on the
per-publisher comparison. Articles: every `{{cite web|news …|url=|title=|work=|date=}}` in the wikitext
whose url is also an extlink (archive copies skipped) → url, title, publisher = work/newspaper/website/
publisher (else domain), `published_at` = the cite date; relevance gate per row (≈ 120 rows the first
time, then only new citations survive the `articles(url)` upsert). Fixture `w2b_wikipedia_revisions.json`.

## ntc_restoration_articles — derived (no URL; `pull.skip_no_url`)

`sources.yaml` keeps `url: (derived …)`, so the puller never fetches it (`tests/test_pull.py` pins
`requests_for(...) == []`). The work is `scan_articles(articles, gaz, now, since)`:

- an article whose title+body matches `TELECOM_RE` (NTC, Ncell, Nepal Telecom, tower, BTS, telecom,
  mobile network, टावर, सञ्चार, मोबाइल, दूरसञ्चार, एनसेल, टेलिकम) **and** `RESTORED_RE` (restor, resum, back up/on,
  reconnect, operational, मर्मत, सञ्चालनमा, पुनः, पुनर्स्थापना, सुचारु, फर्क) → `telecom_restored` value 1 for every
  settlement-level place it mentions (`article.places` from ①, else exact gazetteer matches; districts
  and the generic cities skipped), publisher `NTC/Ncell via press`, `as_of` = `published_at`, url =
  the article, note = headline;
- `OUTAGE_RE` without restoration wording → `telecom_outage` value 1 the same way;
- "80 of 120 sites restored" → national `telecom_sites_restored` / `telecom_sites_affected`.

Who runs it: **process_data ③** (`processing/ledger.py`) on the place-resolved articles of the last
3 days, upserting the figures and using them for `place_status.telecom_restored/phones`
(docs/process_data/03-ledger.md §phones); or standalone `python -m normalisers.ntc_restoration_articles`
(same scan against the database). `normalise()` accepts a JSON list of article rows for the contract
and the tests. The three regexes are defined here and imported by the ledger. Fixture
`w2b_ntc_restoration_articles.json` (hand-written rows, no names).

## hdx_search — `GET https://data.humdata.org/api/3/action/package_search?q=nepal&sort=metadata_modified%20desc&rows=50`

CKAN: `{result{count, results[{name, title, notes, organization{title}, metadata_modified, dataset_date,
resources[{name, format, last_modified, url}], maintainer, …}]}}`. Cadence 60m. Emits one **"dataset
availability"** article per dataset modified since the event whose name/title/notes match
`EVENT_RE` (flood, rasuwa, nuwakot, bhote koshi, trishuli, emsr927, glide, mudflow, unosat …): url
`https://data.humdata.org/dataset/<name>`, title = dataset title, publisher `HDX`, `published_at` =
`metadata_modified`, body = `"<org> · N resource(s): … · <notes>"` — so `/sources` and Latest show new
drops (hot_flood_npl, npl-flood-emsr927, UNOSAT products, GLIDE); "Nepal - CERF Allocations" is not
an event dataset and is left out. Figure `datasets_updated_since_event`. Fixture `w2b_hdx_search.json`
(14 datasets, maintainer fields removed).

## hot_s3_listing — `GET https://production-raw-data-api.s3.amazonaws.com/?list-type=2&prefix=ISO3/NPL/`

S3 `ListBucketResult` (396 keys, not truncated): `<Contents><Key/><LastModified/><Size/>`. Cadence 60m.
Emits one "dataset availability" article per **layer** modified since the event — the `_gpkg|_shp|
_kml|_geojson.zip` format variants of one layer collapse into a single row (url = the geojson variant,
else the newest; body lists every format with its size), `_layers/` (internal parquet), `meta.json` and
`dbdump.zip` are skipped; title = the file name, publisher `HOT`, `published_at` = newest LastModified.
Figure `objects_updated_since_event` (note = layer count). Fixture `w2b_hot_s3_listing.xml` (90 keys).

## oam_bbox — `GET https://api.openaerialmap.org/meta?bbox=84.3,27.5,85.9,28.6&order_by=uploaded_at&sort=desc`

`{meta{found}, results[{_id, uuid (the COG url), title, provider, platform, gsd, acquisition_start,
uploaded_at, contact, user, …}]}` — 199 items over the corridor bbox. Cadence 6h. Emits one "dataset
availability" article per upload since the event: url = the image url, title, publisher
`OpenAerialMap`, `published_at` = `uploaded_at`, body = provider · platform · GSD · acquisition date ·
bbox. **`contact` / `user` hold a person's name and e-mail and are never read** (the fixture drops
them). Figures `uploads_since_event` and `post_event_uav_uploads` (drone orthomosaics acquired on/after
26 Aug — the D8 "first post-event drone ortho" watch, 0 so far). Fixture `w2b_oam_bbox.json`.
