# 03 — ③ per-place ledger (`processing/ledger.py`)

```
   places (known ids)      reports_anon      entities        figures scope place:*      articles.places      v_gauges_latest
        │                       │                │            (last 14 d)                 (last 14 d)               │
        └───────────────────────┴────────────────┴─────────────────┴──────────────────────────┴──────────────────────┘
                                                        │ signal_places = every known place with any of these
                                                        ▼
        place_status (one row per place, as_of = run time)          place_timeline (place_id, day, what_en/ne/hi, dot)
```

## Formulas (pure functions, `tests/test_ledger.py`)

```
expected          = max( #entities whose probable_place_id or last_place_id is here,
                         Σ max(subject_count, 1) over reports_anon rows placed here )
confirmed_reached = latest NDRRMA `rescued` + latest NDRRMA `stationed` figures scoped place:<id>
                    + Σ subject_count of rescuer/agency reports here with status rescued | reported_safe
unknown           = max(expected − confirmed_reached, 0)
reports_count     = number of reports_anon rows placed here (withdrawn reports never reach reports_anon)
status_label      = no_data (expected = confirmed = 0) | mostly_unknown (unknown > expected / 2) | mostly_reached
```

Why `max` and not a sum: entities already include OPMCM/NDRRMA-derived people and form
reports with a key; form reports without a key are only in `reports_anon`. Taking the larger of
the two avoids counting the same person twice while never dropping unkeyed reports.

| column | rule |
|---|---|
| `last_contact_at` | max of: entity `last_contact_at`, report `event_time`, `as_of` of place-scoped figures (Open-Meteo excluded), `published_at` of articles mentioning the place, and the gauge `observed_at` when alive; futures > now + 1 h dropped |
| `telecom_restored` / `phones` | articles mentioning the place that match `TELECOM_RE` (NTC, Ncell, tower, BTS, telecom, टावर, सञ्चार, मोबाइल, …), newest first: `RESTORED_RE` (restor, resum, मर्मत, सञ्चालनमा, सुचारु, …) → `true`, `"yes (since <d Mon>)"`; `OUTAGE_RE` (still down, cut off, सञ्चारविहीन, सम्पर्कविहीन, बन्द, …) → `false`, `"no"`; else null |
| `access` | `ACCESS_OBSERVED` (Sitrep #8, 29 Aug 18:30 NPT road bullets + HOT survey): dhunche `road_partial`; galchhi, malekhu, mugling, benighat, gajuri `road`; bidur, trishuli_bazar, battar, betrawati `road_partial`; syabrubesi, timure, mailung, ut1_mailung_camp, rasuwagadhi `helicopter_only`; langtang_village, kyanjin_gompa, lama_hotel, thulo_syabru `foot`. Otherwise: `helipad` kind → `helicopter_only`; a HOT `bridge_status` note "Washed out"/"Damaged" here → `road_partial`; then `access_from_bridges()` over the bridge inventories (NESRA / DoR figures `bridges_washed_out` > 0 or `bridges_damaged` > 0 → `road_partial`; only `bridges_intact` > 0 → `road`); else `unknown` |
| `hazard` | `places.below_barrier_lakes` → `below_barrier_lakes`, else `places.in_channel` → `in_channel`, else null (observed flags only) |
| `nearest_gauge` | corridor gauge nearest by km chainage (`GAUGE_KM`: rasuwagadhi 0, syabrubesi 16, dhunche 30, betrawati 46, galchhi 75, malekhu 90, bhorle 95, kali_khola 100, devghat 125): `"Galchhi — alive"` or `"Rasuwagadhi — dead since 26 Aug 08:40"` |
| `shelter` | latest NDRRMA `stationed` figure at a `shelter`/`hospital`-kind place in the same district → `"<name>: N people"`; else the sitrep `shelter_people`/`shelter_sites` for the district → `"<District>: N people in M sites (NDRRMA)"` |
| `km` | `places.km` |
| `note` | `help_note()`: `"12 open help request(s) (3 critical), 40 people reported affected (PM portal)"` from OPMCM `help_requests_open` / `help_requests_critical` / `people_affected_reported` scoped here · `"N bridge(s) washed out/damaged (HOT survey)"` · `bridge_note()`: `"3 bridge(s) damaged, 2 washed out (DoR RIMES)"` · first clause of `places.notes` — joined with " · " |

No new `place_status` columns were added for help requests / bridge inventories (P4, 30 Aug): the counts are already
public per place as `figures` rows (`scope = place:<id>`, metrics `help_requests_open`, `help_requests_critical`,
`people_affected_reported`, `bridges_damaged`, `bridges_washed_out`, `bridges_intact`) and the ledger folds them into
`access` and `note`; a dedicated column only becomes worth a migration if the site wants to sort places by them.

## Timeline (`place_timeline`, key `place_id, day, what_en`)

| what | dot | template key |
|---|---|---|
| reports added that day | neutral | `reports` |
| reports with status missing/unknown | unknown | `reports_missing` |
| NDRRMA rescued / stationed figure | confirmed | `ndrrma_rescued`, `ndrrma_stationed` |
| OPMCM `lost_reports` at the place | unknown | `opmcm_lost` |
| Open-Meteo flying window good / poor | neutral | `flying_good`, `flying_poor` |
| HOT bridges washed out/damaged | unknown | `bridge` |
| gauge alive (today) / dead since | live / unknown | `gauge_alive`, `gauge_dead` |
| NTC/Ncell figure restored / outage | live / unknown | `telecom_restored`, `telecom_outage` |
| Setu registered missing here | unknown | `setu_missing` |
| DAO Nuwakot / DAO Rasuwa rescued | confirmed | `dao_rescued` |
| volunteer bulletin rescued | confirmed | `volunteer_rescued` |
| NESRA bridges to inspect | neutral | `bridges_to_inspect` |
| bridge inventory damaged + washed out (same day) | unknown | `bridges_damaged` |
| Copernicus EMS buildings affected of total | unknown | `ems_buildings` |
| OPMCM open help requests (critical) · people affected | unknown | `help_requests`, `people_affected` |
| article headline mentioning the place (≤ 15) | live | title in its own language for all three |

The last seven come from `figure_lines()` (`PLACE_FIGURE_LINES` maps `(publisher, metric)` → template; the multi-metric
families are combined per publisher × day). Rule: **every place-scoped figure family the pull emits gets a line**, so a
corridor place with any dated figure never shows an empty "Status, day by day". Coverage on 30 Aug 02:40 UTC: 59 → 63 of
74 corridor places; the 11 still empty (shelters, camps, helipads such as `dhunche_army_camp`, `galchhi_relief_camp`) have
no figure, article or report at all — the page shows the dashed empty state with "Add what you know".

`T` holds the EN / NE / HI templates (numbers stay Latin in all languages); days are NPT dates.

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| `places`, `reports_anon`, `entities`, `figures` (`scope like 'place:%'`, last 14 d), `articles` (`places <> '{}'`, last 14 d), `v_gauges_latest`, NDRRMA shelter figures | `place_status` (upsert on `place_id, as_of`), `place_timeline` (upsert on `place_id, day, what_en`) | `ledger.done` (places, timeline) |

Only ids present in `places` are written (foreign keys); scopes with a slug that is not a
gazetteer id are ignored until the gazetteer grows.

## Failure behaviour

One try/except (`ledger.failed`); the site keeps showing the previous `place_status` rows
(`v_place_status_latest` takes the newest `as_of` per place).

## phones (the telecom hook) and "last observed contact"

```
   articles (① places, last 3 d) ─▶ normalisers/ntc_restoration_articles.scan_articles ─▶ figures 'NTC/Ncell via press'
                                                                                         telecom_restored / telecom_outage
                                                                                         scope place:<id> · as_of = article date
                                                  ┌──────────────────────────────────────────────┘ (upserted, then read back)
                                                  ▼
   phones_status(telecom figures for the place, telecom articles mentioning the place)
        newest dated signal wins (a figure beats an article on the same instant):
        restored → telecom_restored = true,  phones = "yes (since <d Mon>)"     e.g. Betrawati 29 Aug
        outage   → telecom_restored = false, phones = "no"
        nothing  → null / null   (undated restoration articles still give "yes")
```

- `TELECOM_RE`, `RESTORED_RE`, `OUTAGE_RE` are defined once in `normalisers/ntc_restoration_articles.py`
  (docs/pull_external_data/05b-sources-wave2-geospatial-text.md §ntc_restoration_articles) and imported
  here; `phones_from_articles()` is kept as the fallback for undated articles.
- Timeline dots: `telecom_restored` (live) / `telecom_outage` (unknown) per dated figure, templates in `T`.
- `last_contact_at` is the **last observed contact from the place** — `last_contact()` takes the max of
  `reports_anon.event_time` placed here, NDRRMA `rescued`/`stationed` figure `as_of` here (skipped when `as_of` is
  just the fetch time — `is_observed()`), the
  `telecom_restored` instant, and `event_timeline` rows of kind `gauge` / `wave` / `impact` for the place
  (Timure 26 Aug 08:45 NPT); futures (> now + 1 h) are dropped and **nothing is ever filled from a fetch
  or compute time** — the column is NULL when no observation exists and the site shows "—".
- `status_label = 'district'` for `places.kind = 'district'` and the `DISTRICT_LIKE` ids (`kathmandu`,
  `bhotekoshi_rm_sindhupalchok`): their counts are still computed (the OPMCM projection lands there) but
  the label lets the web split them out of the per-place table.

Tests: `tests/test_ledger_phones.py`.
