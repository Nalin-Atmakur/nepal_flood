# 05c — wave 3: the last 12 registry ids (help requests, hydrographs, bridges, extents, listings, catalogues)

Companion to [05-sources.md](05-sources.md) (wave 1), [05a](05a-sources-wave2-official.md) and
[05b](05b-sources-wave2-geospatial-text.md) — same conventions: one section per `normalisers/<id>.py`,
endpoint(s), response shape, quirks, what it emits, the fixture used by `tests/test_normalisers_w3.py`.
After this wave every id in `sources.yaml` has a normaliser. Shared helpers for this lane:
`normalisers/_geo.py` (haversine · centroid · nearest gazetteer place · bbox test) and
`normalisers/_stac.py` (bounded STAC link walking).

```
   sources.yaml id            family    normaliser                     emits
   ────────────────────────── ───────── ────────────────────────────── ────────────────────────────────────────────
   opmcm_help_requests        json_api  opmcm_help_requests.py         figures 'OPMCM portal' per place/district/problem/help-type (PII projected at the door)
   opmcm_government_efforts   json_api  opmcm_government_efforts.py    articles (ne) + government_notices_total
   bipad_river_series         json_api  bipad_river_series.py          gauges bipad-<station> · 10-min hydrograph, 11 corridor stations
   nesra_bridges              gcs       nesra_bridges.py               → nesra_bucket._bridges (bridges_to_inspect per place)
   dor_rimes_bridges          json_api  dor_rimes_bridges.py           figures 'DoR (RIMES bridge inventory)' road_bridges_inventory per place
   microsoft_unosat_extent    s3        microsoft_unosat_extent.py     figure flood_extent_km2
   outlet_tag_pages           html      outlet_tag_pages.py            articles from 6 listing pages (KP ×2, THT, Onlinekhabar EN, Gorkhapatra, INSEC)
   gdelt_monitor              json_api  gdelt_monitor.py               articles + gdelt_articles_24h
   vantor_stac                stac      vantor_stac.py                 figures 'Vantor Open Data' imagery_scenes_total / _post_event
   planet_stac                stac      planet_stac.py                 figures 'Planet' imagery_collections / imagery_scenes_total / _post_event
   cdse_catalogue             json_api  cdse_catalogue.py              figures 'Copernicus Data Space' s2_products_since_event / s2_acquisition_dates
   hf_fair_footprints         s3        hf_fair_footprints.py          figures 'HOT fAIr (Hugging Face)' dataset_files / dataset_downloads
```

First live run (30 Aug 02:47 UTC, 12/12 ok in 60 s with 4 workers): help requests 163 figures (people_affected
12,697 · open by place: Timure 33, Trishuli Bazar 21, Rasuwagadhi 15, Bamboo 15, Mailung 15, Betrawati 10,
Dhunche 9 · 48 unresolved), 600 hydrograph readings for 10 stations, 149 + 99 + 82 articles, 13 Vantor /
24 Planet scenes, 12 S2 products, 37.4 km² extent.

---

## Shared helpers — `normalisers/_geo.py`, `normalisers/_stac.py`

```
   GeoJSON geometry ──centroid()──► (lat, lon) ──nearest_place(gaz, …, max_km=8)──► (place_id, km) | None
                                                  skips kind=district and the generic cities (Kathmandu, …)
   STAC doc ──links(doc, rel, base)──► absolute hrefs ──fetch_json(ctx, href)──► dict | None   (bounded by the caller)
```

`nearest_place` is the fallback whenever a source gives coordinates but no usable place words. 8 km is wide
enough to land a request in the valley on the right settlement and narrow enough not to cross ridges into the
next valley; districts are skipped because a district centroid is meaningless as "nearest".

---

## opmcm_help_requests — `GET https://rescue.opmcm.gov.np/api/help-requests?page={n}&limit=200`

The rescue portal's help-request register (227 rows on 30 Aug, 2 pages; `{"success", "data": {total, page,
limit, items[]}}`). Item: `_id, referenceId, reporterName, phone, reportingFor (SELF|FAMILY|OTHER_PERSON|COMMUNITY),
problemType (FLOOD 169 · MISSING_PERSON 24 · MEDICAL_EMERGENCY · ROAD_BLOCK · OTHER), helpTypes[] (RESCUE, FOOD,
DRINKING_WATER, SHELTER, MEDICAL, OTHER), title, description, affectedCount, urgency (CRITICAL 140 · HIGH · NORMAL),
status (OPEN 170 · IN_PROGRESS 27 · RESOLVED 3), province/district/municipality/ward (mostly empty), placeName
(a Plus-code address), location (GeoJSON Point), thumbnail (base64 photo), source, createdAt, updatedAt`.

```
   raw item ──prestore()──► projection {KEEP…, place_ids}      raw_pulls holds only this
      drop: reporterName · phone · thumbnail · title · description   (free text carries names + phone numbers)
      keep: referenceId · reportingFor · problemType · helpTypes · affectedCount · urgency · status
            · province/district/municipality/ward · placeName[:120] · location · source · createdAt · updatedAt
      add : place_ids = gazetteer.resolve_ids(title + description + placeName + municipality + district)
   projection ──normalise()──► per open request (OPEN | IN_PROGRESS):
      place    = first non-district, non-generic id in place_ids
               ∥ nearest gazetteer place ≤ 8 km of the Point
               ∥ none  → counted under place:unresolved
      district = a district id in place_ids ∥ resolve(district text)
      scopes   = problem:<type> · help:<type>… · place:<id> · district:<id>
      metrics  = help_requests_open (+1) · help_requests_critical (+urgency==CRITICAL) · people_affected_reported (+affectedCount)
   national: people_affected_reported only — opmcm_stats already publishes the portal's own open/critical/resolved totals
```

Quirks: the Point is the *reporter's* position for many MISSING_PERSON rows (Kathmandu relatives), which is why
text wins over geometry and why the generic cities are never a nearest-place answer. `affectedCount` includes
a few implausible values (500) — they are summed as published and the note says so. Publisher 'OPMCM portal'
so the site keeps one column for the portal. Fixture `w3_opmcm_help_requests.json`: the prestore projection of
66 rows, ids renumbered, placeName blanked unless the gazetteer knows it, coordinates rounded to 0.01°.

## opmcm_government_efforts — `GET https://rescue.opmcm.gov.np/api/government-efforts`

94 notices mirrored from nepal.gov.np: `{title, agency, link, description, priority, isActive, source, nepalRef,
createdAt}`. `link` is the bare portal domain, so the article url is `…/government-efforts#<nepalRef>` (stable
per notice). Nepali titles go through the relevance gate (7 of 94 dropped: generic ministry notices); body =
first sentence of description; places from the gazetteer over title + description; publisher
'Nepal Govt portal (via OPMCM)'; plus `government_notices_total` for 'OPMCM portal'. Fixture: 12 items.

## bipad_river_series — `GET https://bipadportal.gov.np/api/v1/river/?station=<id>&water_level_on__gt=2026-08-25&ordering=-water_level_on&limit=60` × 11

The 10-minute hydrograph behind the live snapshot (bipad_river_stations). The unfiltered endpoint pages from
26 Aug forwards and never reaches "now", so the registry lists one URL per corridor station (BIPAD `station`
ids 171 Rasuwagadi · 74 Bhote Koshi@Syabrubesi · 49 Langtang@Syabrubesi · 137 Betrawati · 79 Phalakhu ·
105 Dhunche · 281 Galchi · 261 Malekhu · 67 Kali Khola · 25 Devghat · 35 Bhorle) with `ordering=-water_level_on`
→ the newest 60 readings each (≈10 h). Rows `{id, station, stationSeriesId, title, basin, point, waterLevel,
warningLevel, dangerLevel, waterLevelOn, status, steady, …}` become gauges keyed `bipad-<station>` /
`waterLevelOn` — the same key space as the snapshot, so the series simply fills in behind it. No figures.
A dead station (Rasuwagadhi since the surge) returns readings only up to its last transmission. Fixture: 4
stations × ≤7 readings from the 26 Aug capture + one failed part.

## nesra_bridges — `GET https://storage.googleapis.com/npl-flood-front/bridges_to_inspect.geojson`

The same 62-bridge layer that is part 2 of nesra_bucket's envelope, kept as its own id so the bridge layer can
be refreshed on its own cadence. The module delegates to `nesra_bucket.normalise` (dispatch by
`properties.kind == "bridge"`) and re-stamps `source_id`; there is exactly one implementation of
bridge → place resolution (05b §nesra_bucket). Fixture: the live file (bridge names are infrastructure).

## dor_rimes_bridges — `GET https://navigate-dor-api.rimes.int/Bridge_api/getAllBridges`

Department of Roads inventory: a 2,135-row list `{id, bridge_id_code, bridge_name, road_name, district_name,
river, chainage_in_km, length_in_m, width_in_m, latitude, longitude, span_length_in_m}` (strings). Cadence
static. We keep bridges inside the corridor bbox (84.35–85.75 E, 27.55–28.45 N) whose river is a corridor river
(Trishuli/Trisuli, Bhote…, Narayani, Langtang, Tadi, Phalankhu, Mailung) or whose district is Rasuwa/Nuwakot
— 30 bridges — and count them per nearest gazetteer place (≤ 8 km) as `road_bridges_inventory`, plus the
national corridor total; bridge names go into the note. This is the denominator for "N bridges destroyed"
claims and a join key for later damage lists. Fixture: the 30 corridor rows + 5 others.

## microsoft_unosat_extent — `GET https://opendata.aiforgood.ai/damage-assessment/data/unosat_damage_area.geojson`

One FeatureCollection (bbox 85.013–85.533 E, 27.814–28.340 N) with a single polygon; `properties.Shape_Area`
is in m². Emits `flood_extent_km2` = Σ Shape_Area / 1e6 = 37.4 for 'UNOSAT (via Microsoft AI for Good)'.
No acquisition date in the file → as_of = fetch time, note = polygon count + bbox. Fixture: properties + a
4-vertex stand-in ring (the real ring is 1 MB).

## outlet_tag_pages — six HTML listing pages, `{n}` paged (HTML_MAX_PAGES = 3)

```
   host                        article path pattern                         date
   kathmandupost.com           /<section>/YYYY/MM/DD/<slug>                 from the path
   thehimalayantimes.com       /<section>/<slug ≥ 10>                       —
   english.onlinekhabar.com    /<slug ≥ 8>.html                             —
   gorkhapatraonline.com       /news/<id>                                   —
   inseconline.org             /main_news/<id>/  (and other WP categories)  —
   other                       /<a>/<slug ≥ 10>                             —
```

Every same-host anchor whose path matches becomes a candidate; the longest anchor text per url is the title
(listing pages link the same story from the image and the headline). Titles pass the relevance gate (44 of ~190
listing links dropped on the first run: navigation, unrelated stories). published_at is set only when the path
carries a date — never guessed. Publisher via `_rss.publisher_for`. Fixture: the six pages reduced to their
anchors (the normaliser reads nothing else).

## gdelt_monitor — `GET https://api.gdeltproject.org/api/v2/doc/doc?query=Rasuwa%20flood&mode=artlist&maxrecords=100&timespan=1d&format=json`

`{"articles": [{url, url_mobile, title, seendate "YYYYMMDDThhmmssZ", socialimage, domain, language, sourcecountry}]}`.
Slow (45–70 s answers; one timeout in two tries) — the puller's timeout and per-source backoff absorb that, and
a failed run costs nothing but that run. Articles pass the relevance gate; `lang` from GDELT's `language`
(English/Nepali/Hindi/Chinese) else detected; `gdelt_articles_24h` for 'GDELT' records the window volume
(capped by maxrecords). Fixture: 40 rows without socialimage.

## vantor_stac — `GET https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json`

STAC collection with `odp:event_date` and 13 `item` links. Up to 24 items are sub-fetched
(`properties.datetime, title "[PRE]|[POST] Vantor WV02 Image …", vehicle_name, pan_gsd, ingestion_datetime`).
Figures for 'Vantor Open Data': `imagery_scenes_total` = item links, `imagery_scenes_post_event` = items with
datetime ≥ event date (9 on 30 Aug), as_of = newest post-event acquisition, note names it. Without a fetcher
(tests, dry runs) only the total is emitted. Fixture: the collection + one pre and one post item (assets trimmed).

## planet_stac — `GET https://data.source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/catalog.json`

Root catalog → `child` catalogs `pre-event/`, `post-event/` → `child` collections (`post-event-pelican-2026-08-27`,
`…-planetscope-2026-08-26`, `…-skysat-…`, `pre-event-planetscope-2026-05-27`) → `item` links. ≤ 16 sub-fetches.
Figures for 'Planet': `imagery_collections` (5), `imagery_scenes_total` (24), `imagery_scenes_post_event` (19,
note = post-event collection ids with counts), as_of = newest post-event temporal extent. Fixture: root, both
child catalogs and one collection (the fake fetcher answers every collection with it, so the test asserts ≥).

## cdse_catalogue — Copernicus Data Space OData `Products?$filter=Collection/Name eq 'SENTINEL-2' and Intersects(corridor polygon) and ContentDate/Start gt 2026-08-26`

`{"value": [{Id, Name "S2C_MSIL2A_20260829T044701_…", ContentDate{Start, End}, Online, PublicationDate,
ContentLength, S3Path, Footprint…}]}` — 12 products on 30 Aug (L1C + L2A of two overpasses). Figures for
'Copernicus Data Space': `s2_products_since_event` (note: latest product name + how many are Online),
`s2_acquisition_dates` (distinct days, listed in the note); as_of = latest ContentDate.Start; url = the
Copernicus Browser. Fixture: the response without footprints/checksums.

## hf_fair_footprints — `GET https://huggingface.co/api/datasets/hotosm/nepal_flood_2026`

The dataset API (the registry url was the HTML page; the parquet/geojson under `upperstream/` are not pulled —
13,663 footprints are a GIS input, not a number for the site). `{id, lastModified, downloads, likes,
siblings[{rfilename}], cardData{pretty_name, license, tags}}`. Figures for 'HOT fAIr (Hugging Face)':
`dataset_files` (parquet + geojson count, note = pretty_name · file count · license), `dataset_downloads`;
as_of = lastModified. Fixture: the live response.

---

## Failure behaviour (all twelve)

| what | effect |
|---|---|
| a part fails (status ≠ 2xx, timeout) | note `…: <error>`; the other parts still normalise; the puller records the failure for backoff |
| STAC sub-fetch fails | that node is skipped; totals come from the links that were readable |
| no gazetteer in ctx | help requests fall to `place:unresolved`; bridges emit only the national count |
| a help request carries a phone number in `title` | never stored: `prestore()` drops title/description before hashing (tested) |
