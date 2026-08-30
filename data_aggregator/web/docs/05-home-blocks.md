# 05 · Home blocks — what each one reads

`app/[lang]/page.tsx` runs all reads in one `Promise.all` and composes the blocks in design order. Every block
is a server component except the ones marked client. `revalidate = 300`.

```
  page.tsx ──┬─ getLiveCounts()        v_live_counts            ─▶ Scoreboard (client island)     ┐ live
             ├─ getDigest(lang)        digest (latest day)      ─▶ Digest (dark card, or nothing) │
             ├─ getPlaceStatuses()     v_place_status_latest    ─▶ 01 Corridor · 05 PlacesTable   │
             ├─ getPlaces()            places                   ─▶ 01 (km, aliases) · 05 (search) │
             ├─ getStats()             stats                    ─▶ 02 StrikingStats               │ ISR
             ├─ getEventTimeline()     event_timeline ⋈ places  ─▶ 03 FirstHours                  │ 300 s
             ├─ getNationalFigures()   figures_latest (national)─▶ 04 SideBySide                  │
             ├─ getGauges()            v_gauges_latest          ─▶ 07 RiverWeather                │
             ├─ getFlyingWindows()     figures_latest (flying_*)─▶ 07 RiverWeather                │
             └─ getArticles(12)        v_articles_recent        ─▶ 08 Latest                      ┘
                                                                  06 AddCtas (static) · ShareBar (client)
```

Each block root carries `data-block="…"` (and `data-n="0N"` for numbered sections) — the e2e smoke test asserts them.

| # | Block | File | Reads | Empty state |
|---|---|---|---|---|
| — | Scoreboard | `blocks/Scoreboard.tsx` (client) | `v_live_counts` initial; presence + realtime + 60 s poll (docs/09) | "—" digits; the "people here now" cell hides itself if presence fails |
| — | Digest | `blocks/Digest.tsx` | `digest` — latest day, current lang else EN (docs/13) | **none** — the block renders nothing without a row |
| 01 | Corridor | `blocks/Corridor.tsx` → `CorridorIsland` (client) | `v_place_status_latest` ⋈ `places.km/in_channel/aliases` via `lib/corridor.ts` | dashed panel "No places in the ledger yet…" inside the frame |
| 02 | StrikingStats | `blocks/StrikingStats.tsx` | `stats` ids `wave_time_to_port, wave_speed, galchhi_rise, bodies_downstream_km, missing_counts_divergence, reports_total` | "No headline numbers yet… retrying every 4 hours" |
| 03 | FirstHours | `blocks/FirstHours.tsx` | `event_timeline` ⋈ `places` (docs/13) | "The first hours have not been reconstructed yet… retrying every 4 hours" |
| 04 | SideBySide | `blocks/SideBySide.tsx` | `figures_latest` where `scope='national'`, pivoted with `AGENCIES` (lib/config.ts) | "No official figures yet. Last attempt {t}…" |
| 05 | PlacesTable | `blocks/PlacesTable.tsx` (client search) | same rows as 01 | "No places in the ledger yet. Add the first report…" |
| 06 | AddCtas | `blocks/AddCtas.tsx` | — | — |
| 07 | RiverWeather | `blocks/RiverWeather.tsx` | `v_gauges_latest` (7 stations by name substring), `figures_latest` `flying_window_quality*` | tiles show "no data yet"; bars show "No flying-window forecast yet" |
| 08 | Latest | `blocks/Latest.tsx` | `v_articles_recent` limit 12 | "No headlines yet. Last attempt {t}…" |
| — | ShareBar | `blocks/ShareBar.tsx` (client) | — | — |

## Contracts per block

### 02 StrikingStats
- Card order and tilt come from `STAT_CARDS`; rows missing in `stats` are skipped (the grid just has fewer cards).
- Caption = `caption_{lang}` with EN fallback. Link label = hostname of `source_url` + ` · ` + `fmtDay(as_of)`;
  for `reports_total` without a URL the label is "Live · this site".

### — Digest
- `pickDigest`: latest `day` in the table; the current language's row, else EN (card gets `lang="en"` + "in English
  for now"), else nothing. Bullets pass through `normaliseBullets` (unknown kind → news, non-http URL → dropped).
- Badge = kind label (`digest.kind.*`) on `digestKindColors`; link = hostname of `source_url`; footer "as of {computed_at} NPT".

### 03 FirstHours
- `splitTimeline`: rows sorted by `at`; Nepal-time day ≤ `EVENT_DATE_ISO` → the strip, later → under "Later".
- Card = time chip (`at_label`, Press Start 2P; amber-on-dark for trigger/warning) + place name (`place_name_{lang}`,
  EN fallback, blank when no place) + `what_{lang}` (EN fallback) + source link (`source` else hostname).
- Dot = `eventKindColors[kind]`, with the kind as its accessible name.

### 04 SideBySide
- Columns = `AGENCIES`: publisher strings `NDRRMA`, `Nepal Police`, `MoFA`, `DoT`, `OPMCM` (case-insensitive).
- Rows try metric candidates in order, e.g. missing: `missing → out_of_contact` (NDRRMA/Police),
  `foreigners_missing → …` (MoFA), `tourists_out_of_contact → …` (DoT), `lost_open → …` (OPMCM).
- Cell = `fmtInt(value)` + `note` (row's `note`, else the agency's `noteKey`: "foreigners ·", "tourists ·",
  "open reports ·") + `as of {as_of}` linking to `url`. Column header links to the first row URL for that publisher,
  else the agency's site.
- Mobile: `min-width 640px` table inside `scroll-x`, first column sticky.

### 05 PlacesTable
- Rows sorted by `unknown` desc. Search keys = `name_en/ne/hi/zh`, `aliases`, id — normalised with `normaliseKey`
  (NFD, diacritics stripped, Devanagari nukta/accents stripped, lower-cased), substring match.
- `phones` is a display string from the ledger; the leading yes/no/partial token is translated.
  `access` is translated through `access.*` keys when it is one of `road | road_partial | foot | helicopter_only | unknown`.
- Unknown badge = `UnknownBadge` (amber fill, amber text).

### 07 RiverWeather
- Gauge tile: alive when `alive !== false` and `level !== null` → green dot, `level.toFixed(2) m`, "alive · HH:MM";
  otherwise grey dot, "—", "dead since {observed_at}"; no row → "no data yet".
- Flying windows: rows whose `metric` starts with `flying_window_quality` and `scope` starts with `place:dhunche` /
  `place:langtang_village`, sorted by `as_of`, first three. Bar height = 8 + 32 × quality where quality = `value`
  (0–1, or 0–100 scaled). Label = `note` containing good/fair/poor, else thresholds 0.66 / 0.33.
  Source line = hostname of `url` (or `publisher`) + `computed_at`.

### 08 Latest
- Time shows `HH:MM` if published today (Nepal time) else `D Mon`. Rows link to the article; titles carry `lang`.

## Adding a block — see docs/01 step list.

### District rows are split out (added 30 Aug)

`v_place_status_latest` also returns rows whose `places.kind = 'district'` (Rasuwa, Nuwakot, Sindhupalchok, Kathmandu …) because the OPMCM registry projects many reports at district resolution. `lib/places-split.ts` → `splitDistricts()` removes them from the corridor table (§05) and from the 3D corridor's compact list; `/places` shows them in a second "By district" table. Pure helper, tested in `tests/places-split.test.ts`.
