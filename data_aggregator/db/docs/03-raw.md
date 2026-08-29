# 03 · RAW zone — `002_raw.sql`

Normalised rows with the PII already removed, plus two reference tables. Written by `pull_external_data` (every run) and `process_data` ⓪/① (anonymised reports, resolved places). Read by `process_data`; the public sees only `sources`, `places`, `gauges` and the views.

Tables: `sources` · `places` · `pulls` · `figures` · `gauges` · `articles` · `reports_anon`. Columns: `docs/data-model.md` §3.

## How rows get here

```
   sources.yaml ──seed──► sources                   gazetteer/places.csv ──seed──► places
                                                                                    ▲
   pull_external_data.py (every cadence)                                            │ FK
        │  for each due source                                                      │
        ▼                                                                           │
   fetch (ETag / If-Modified-Since / body hash)                                     │
        │                                                                           │
        ├── unchanged ──► pulls (ok=true, unchanged=true)                            │
        │                                                                           │
        └── changed ───► raw_pulls (ARCHIVE) ──► pulls (raw_pull_id)                │
                              │                                                     │
                              ▼                                                     │
                   normalisers/<source_id>.py                                       │
                              │                                                     │
                              ├──► figures    (publisher, metric, scope, as_of, value)
                              ├──► gauges     (station_id, observed_at)             │
                              └──► articles   (url)                                 │
                                                                                    │
   process_data.py                                                                  │
        ⓪ reports_archive ──anonymise──► reports_anon ──── place_id ────────────────┤
        ⓪ raw_pulls of PII sources ──project──► figures rows (counts by place/status/nationality)
        ① articles.places, articles.extracted ◄── resolve_places (aliases, then model) ┘
```

## Upsert keys

| Table | Key | Effect of a repeat |
|---|---|---|
| `figures` | unique `(publisher, metric, scope, as_of, value)` | identical number re-read → no new row |
| `gauges` | PK `(station_id, observed_at)` | same observation re-fetched → no new row |
| `articles` | unique `url` | same article from two feeds → one row |
| `reports_anon` | PK `id` = `reports_archive.id`, unique `archive_id` | re-running ⓪ is a no-op |
| `pulls` | none — one row per attempt | the log grows by one row per source per run |

## The reference tables (public)

`sources` is regenerated from `sources.yaml` by `db/seed/gen_sources.py`; `grp` and `reliability` come from prefix rules and overrides inside that script, and `docs/gen_sources_md.py` reuses the same functions so `/sources` and `docs/sources.md` agree. `pii` is true only when the registry says `true` or `mixed`; a free-text note such as "some headlines name individuals" seeds as false — the note is still visible in `docs/sources.md`.

`places` is the corridor gazetteer: `id` slugs, names in four scripts, `aliases` for matching, `kind`, coordinates, `km` chainage for the 3D scene and the place page, and the two observed hazard flags `in_channel` / `below_barrier_lakes`. `reports_archive.place_id` and every DERIVED `place_id` reference it.

## `figures`

Every official number with its label — never a bare figure. `publisher` is who said it, `metric` what it counts, `scope` where (`national`, `district:Rasuwa`, `nationality:CN`, `place:timure`, `project:UT-1`), `as_of` when they said it applied, `url` where it was read. Seven publishers disagree on "missing" on the same day because they define it differently; keeping the publisher on every row is what makes the side-by-side block honest.

## `gauges`

One row per station per observation from BIPAD / DHM RiverWatch. `alive` is computed at fetch: observed within 2 h. Public, because a gauge reading is not personal data and the River & weather block reads `v_gauges_latest`.

## `articles`

Headline, publisher, language, time, body. The body is service-only (models read it; the public sees `v_articles_recent` without it). `places` and `extracted` are filled by `process_data` ① — the one case where `process_data` writes to a table `pull_external_data` owns, limited to those two columns.

## `reports_anon`

What ⓪ keeps from a submission:

```
   drop     names · phones · passport · photo · reporter contact · anything the model flags
   keep     respondent_type · lang · created_at · supersedes
   derive   person_key  = sha256(normalised phone)  else sha256(normalised name + age + nationality)
            group_key   = normalised operator / project / pilgrim group
   extract  place_id (via gazetteer) · place_text (redacted) · event_time · status · subject_count
            nationality · age_band (never exact age) · sex · purpose · travel_mode · operator
            employer_project · reported_to[] · extracted (json) · text_redacted · text_en · model
```

`person_key` is what lets dedup (`process_data` ②) match a form row to an OPMCM or NDRRMA row without a name in RAW. Where a match genuinely needs the name, ② reads ARCHIVE with the service key and emits only entity ids and counts.

Next: `04-derived.md`.
