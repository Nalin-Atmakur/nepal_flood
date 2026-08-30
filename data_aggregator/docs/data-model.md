# Data model

Every table and view in the Supabase project, read from `db/migrations/001…007` and checked against the live schema (`information_schema`, 30 Aug 2026 03:40 BST). The migrations are the truth; when they change, change this file in the same commit (see `CONTRIBUTING.md`, "Change the schema").

Related: `db/README.md` (how to apply) · `db/docs/01-zones.md` … `07-applying-migrations.md` (one topic per file) · `runbook.md` (health checks).

## 1. The three zones

```
                 website (anon key)                      pull_external_data (service key)
                 insert own row, verbatim                every source on its cadence
                          │                                            │
                          ▼                                            ▼
   ╔═══════════════════ ARCHIVE ═══════════════════╗   ╔═══════════════ RAW ═══════════════════╗
   ║ PII, verbatim, service role + owner only       ║   ║ normalised, anonymised, service only   ║
   ║                                                ║   ║ (reference tables are public)          ║
   ║  users            reports_archive              ║   ║  sources*  places*  pulls              ║
   ║  raw_pulls        submissions_log (public log) ║   ║  figures   gauges*  articles           ║
   ║  _migrations      (ledger, apply.py)           ║   ║  reports_anon                          ║
   ╚═══════════════════════╤════════════════════════╝   ╚═══════════════════╤═══════════════════╝
                           │ ⓪ anonymise new rows ─────────────────────────►│
                           │                                                │
                           └──────────────── process_data (service key) ◄───┘
                                 ① resolve ② dedup ③ ledger ③b press ④ latest ⑤ stats ⑥ findings
                                 ⑦ digest ⑧ timeline ⑨ trends
                                                          │
                                                          ▼
                       ╔═════════════════════════ DERIVED ═════════════════════════╗
                       ║ PUBLIC: figures_latest  place_status  place_timeline  stats ║
                       ║         report_counts  event_timeline  digest  figure_series ║
                       ║ PRIVATE: entities  entity_events  dedup_queue  findings     ║
                       ╚══════════════════════════════╤══════════════════════════════╝
                                                      │
        views (public, read-only projections):        ▼
        v_live_counts  v_articles_recent  v_place_status_latest  v_sources_status  v_gauges_latest
                                                      │
                                                      ▼
                                        website (Next.js, anon key, ISR)

   * = public select (reference data / safe raw)
```

| Zone | Contains | Who writes | Who reads | Key used |
|---|---|---|---|---|
| ARCHIVE | verbatim submissions and raw pulls; may contain names, phones, photos | website (own rows) · `pull_external_data` (`raw_pulls`) · `process_data` (bookkeeping columns) | the owner (own `reports_archive`/`users` rows) · `process_data` | anon key (owner) · service key |
| RAW | normalised rows with no PII; reference tables | `pull_external_data` · `process_data` ⓪ (`reports_anon`), ① (`articles.places`) · `db/apply.py` seeds | `process_data` · website only for `sources`, `places`, `gauges` and the views | service key · Management API |
| DERIVED | what the site shows; computed each run | `process_data` | website (public tables) · `process_data` (private tables) | anon key · service key |

Three principals exist:

| Principal | Postgres role | Where the credential lives | What RLS lets it do |
|---|---|---|---|
| a visitor before/after anonymous sign-in | `anon` / `authenticated` | the browser (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) | only what the policies in `004_rls.sql` allow |
| the two pipeline scripts | `service_role` | `pipeline/.env` on the machine running the scheduler | everything (bypasses RLS) |
| `db/apply.py`, `db/tests` | `postgres` via the Management API | `SUPABASE_ACCESS_TOKEN` or the Supabase CLI keychain | everything |

Anonymous sign-in produces a JWT with role `authenticated` (and `is_anonymous: true`), so every policy written `to authenticated` applies to anonymous visitors once `signInAnonymously()` has run.

## 2. ARCHIVE zone (`001_archive.sql`)

### `users`

One row per Supabase auth user. Written by the website on first visit (`AuthBootstrap` → `signInAnonymously()` → upsert).

| Column | Type | Meaning |
|---|---|---|
| `id` | uuid PK → `auth.users(id)` on delete cascade | the visitor's UUID; equals `auth.uid()` |
| `created_at` | timestamptz, default now() | first visit |
| `lang` | text, default `'en'`, check in (`en`,`ne`,`hi`) | last chosen language |
| `fingerprint` | text | sha256(UA + screen + timezone + language); a recovery/dedup hint, not authentication |
| `contact` | text | optional; user-added so they can recover their folder on another device |

Writes: owner (insert, update own row). Reads: owner. RLS: `users_self_insert`, `users_self_select`, `users_self_update` — all `id = auth.uid()`.

### `reports_archive`

The questionnaire, verbatim. One row per submission; corrections are new rows pointing at the old one via `supersedes`.

| Column | Type | Meaning |
|---|---|---|
| `id` | uuid PK, default `gen_random_uuid()` | submission id; the same id is used in `reports_anon` |
| `user_id` | uuid → `users(id)` cascade | the submitter |
| `created_at` | timestamptz, default now() | submission time |
| `lang` | text, default `'en'` | UI language at submission |
| `respondent_type` | text, check in (`family`,`survivor`,`rescuer`,`agency`) | the "Who are you?" card |
| `text` | text, check length 1–20000 | the box — the only required field |
| `place_id` | text → `places(id)` (constraint added in 002) | optional gazetteer pick |
| `contact` | text | optional reporter phone / WhatsApp / email |
| `photo_path` | text | Storage path `report-photos/<user_id>/<id>.jpg` |
| `supersedes` | uuid → `reports_archive(id)` | set on a correction or "add more" row |
| `fingerprint` | text | copy of the device fingerprint at submission |
| `withdrawn_at` | timestamptz | soft withdraw; excluded from processing and counts; row retained |
| `summary_public` | text | PII-free one-line "We understood: …", written by `process_data` ⓪; readable by the owner |
| `anonymised_at` | timestamptz | null = not yet projected into `reports_anon` |
| `status` | text, default `'received'`, check in (`received`,`anonymised`,`processed`,`matched`,`withdrawn`,`spam`) | the status trail shown on `/me` |

Indexes: `(user_id, created_at desc)`; partial `(created_at) where anonymised_at is null` (the processing queue).

Writes: owner inserts (policy requires `user_id = auth.uid()`, `status = 'received'`, `anonymised_at is null`); owner updates are reduced to a withdrawal by the trigger (section 6); `process_data` sets `anonymised_at`, `status`, `summary_public`. Reads: owner (own rows); `process_data`. No delete for users.

### `raw_pulls`

Verbatim external responses. Bodies of registry sources (OPMCM person reports, NDRRMA rescued persons, DAO lists) contain names, so this table is ARCHIVE-grade.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `source_id` | text | `sources.id` (no FK: `sources` is created in 002) |
| `fetched_at` | timestamptz, default now() | |
| `http_status` | int | |
| `bytes` | int | body size |
| `unchanged` | boolean, default false | same `body_hash` as the previous pull |
| `body_hash` | text | sha256 of the body |
| `body` | text | raw response (json/xml/html/text); binaries go to Storage |
| `storage_path` | text | Storage `raw/<source_id>/<date>/<time>.<ext>` for PDFs and images |
| `error` | text | fetch error, if any |
| `projected_at` | timestamptz | null = `process_data` ⓪ has not yet projected PII rows into RAW |

Index: `(source_id, fetched_at desc)`. Writes: `pull_external_data`. Reads: `process_data`. RLS: enabled, no policies, privileges revoked from `anon`/`authenticated` → service role only.

### `submissions_log`

Public, PII-free event log; one row per submission, written by the form alongside the archive row. Feeds the live scoreboard through Realtime.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `created_at` | timestamptz, default now() | |
| `respondent_type` | text | |
| `lang` | text | |

Index: `(created_at desc)`. Writes: any signed-in visitor (`submissions_log_insert`, with check true). Reads: everyone (`submissions_log_select` to `anon`, `authenticated`). Published on `supabase_realtime`.

### `_migrations`

The applied-migration ledger used by `db/apply.py` (section 5).

| Column | Type | Meaning |
|---|---|---|
| `filename` | text PK | e.g. `003_derived.sql`, `sources.sql`; live ledger on 30 Aug: `001`–`005`, `006_pipeline_additions.sql`, `006_story_and_digest.sql`, `007_series.sql`, `sources.sql`, `places.sql`, `event_timeline.sql` |
| `applied_at` | timestamptz, default now() | last time the file was run |
| `checksum` | text | first 16 hex chars of sha256(file bytes) at the time it was run |

Writes/reads: `apply.py` only (Management API, role `postgres`). RLS enabled, no policies, privileges revoked.

## 3. RAW zone (`002_raw.sql`)

### `sources` (reference, public)

The registry, seeded from `sources.yaml` by `db/seed/gen_sources.py` → `seed/sources.sql`.

| Column | Type | Meaning |
|---|---|---|
| `id` | text PK | slug from `sources.yaml` |
| `name` | text | display name for `/sources` (id title-cased by the generator) |
| `grp` | text | `government` · `humanitarian` · `geospatial` · `news` · `community` · `signals` |
| `family` | text, not null | `json_api` · `post_api` · `rss` · `html` · `s3` · `gcs` · `stac` · `pdf` · `fdsn` · `mediawiki` |
| `url` | text | first URL when the registry lists several |
| `reliability` | char(1) | A–E grade shown on `/sources` |
| `pii` | boolean, default false | true when the registry says `true` or `mixed` |
| `cadence` | text | poll interval, verbatim from the registry |
| `holds` | text | one-line description |
| `catalogue` | text | row in the research catalogue |

Writes: seed. Reads: public (`sources_public_select`); `v_sources_status`.

### `places` (reference, public)

The corridor gazetteer, seeded from `gazetteer/places.csv` → `seed/places.sql`.

| Column | Type | Meaning |
|---|---|---|
| `id` | text PK | slug: `timure`, `syabrubesi`, `ut1_mailung_camp` … |
| `name_en` | text, not null | |
| `name_ne`, `name_hi`, `name_zh` | text | localised names (site falls back to `name_en`) |
| `aliases` | text[], default `{}` | spellings in any script for `resolve_places` |
| `kind` | text, not null | `settlement` · `camp` · `tunnel_portal` · `checkpost` · `helipad` · `lodge_cluster` · `hospital` · `shelter` · `border` · `district` |
| `district`, `municipality` | text | |
| `ward` | int | |
| `lat`, `lon` | double precision | WGS84 |
| `elev_m` | int | |
| `km` | double precision | corridor chainage: Gyirong ≈ −3, Timure 4, Syabrubesi 16 … Bharatpur ≈ 110; null = off-corridor |
| `side` | text, default `'NP'`, check in (`NP`,`CN`) | |
| `in_channel` | boolean, default false | settlement sits in the flood channel |
| `below_barrier_lakes` | boolean, default false | downstream of the two barrier lakes |
| `notes` | text | |

Writes: seed. Reads: public (`places_public_select`) — form picker, place pages, the 3D corridor.

### `pulls`

One row per fetch attempt, including skipped/unchanged ones.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `source_id` | text → `sources(id)` | |
| `fetched_at` | timestamptz, default now() | |
| `ok` | boolean, not null | fetch succeeded |
| `unchanged` | boolean, default false | body hash matched the previous pull |
| `http_status` | int | |
| `bytes` | int | |
| `raw_pull_id` | bigint → `raw_pulls(id)` | the stored body, when one was stored |
| `error` | text | |

Index: `(source_id, fetched_at desc)`. Writes: `pull_external_data`. Reads: `process_data`; `v_live_counts.last_pull_at`; `v_sources_status`. RLS: service only.

### `figures`

Every official or public number with its label. Never a bare figure.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `source_id` | text → `sources(id)` | |
| `publisher` | text, not null | exact spellings matter — live values include `NDRRMA`, `MoFA`, `OPMCM portal`, `Setu (NDRRMA)`, `Nepal Police (UDB)`, `Nepal Police (via press)`, `NTB (via press)`, `DAO Nuwakot`, `IFRC`, `GDACS`, `HOT OSM`, `DHM`, `DHM via BIPAD`, `USGS`, `Volunteer bulletin (nirajbhusal)`; the site maps several spellings onto one column (`web/lib/config.ts` `AGENCIES[].publishers`) |
| `metric` | text, not null | `dead` · `missing` · `out_of_contact` · `rescued` · `injured` · `tourists_out_of_contact` · `foreigners_missing` · `foreigners_found` · `lost_open` · `found` · `stationed` · `shelter_people` · `precip_mm` · `low_cloud_pct` · `seismic_event` · `bridge_status` … |
| `scope` | text, default `'national'` | `national` · `district:<name>` · `nationality:<iso>` · `place:<place_id>` · `project:<name>`; forecast metrics are named per day (`flying_window_quality:<YYYY-MM-DD>`) so `figures_latest` keeps one row per day |
| `value` | numeric, not null | |
| `as_of` | timestamptz | validity time stated by the publisher |
| `fetched_at` | timestamptz, default now() | |
| `url` | text | where the number was read |
| `note` | text | |

Unique `(publisher, metric, scope, as_of, value)` — the normaliser upsert key. Index `(publisher, metric, scope, as_of desc)`. Writes: normalisers in `pull_external_data`; `process_data` ③b (`press_figures.py`, publishers `… (via press)`). Reads: `process_data` ④ → `figures_latest`, ⑨ → `figure_series`. RLS: service only.

### `gauges` (public)

DHM/BIPAD river gauge observations.

| Column | Type | Meaning |
|---|---|---|
| `station_id` | text | BIPAD/DHM station id (Rasuwagadhi 4913, Galchhi 5705 …) |
| `station_name`, `river` | text | |
| `lat`, `lon` | double precision | |
| `level`, `warning`, `danger` | numeric | metres |
| `observed_at` | timestamptz, not null | |
| `fetched_at` | timestamptz, default now() | |
| `alive` | boolean | `observed_at` within 2 h of the fetch |

PK `(station_id, observed_at)`. Writes: `pull_external_data`. Reads: public (`gauges_public_select`); `v_gauges_latest`.

### `articles`

Headlines and bodies from RSS, tag pages, live blogs and search APIs.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `source_id` | text → `sources(id)` | |
| `url` | text, not null, unique | the dedupe key |
| `title`, `publisher`, `lang` | text | |
| `published_at` | timestamptz | |
| `fetched_at` | timestamptz, default now() | |
| `body` | text | article text; never exposed publicly |
| `places` | text[], default `{}` | resolved place ids, written by `process_data` ① |
| `extracted` | jsonb | `[{place_id, count, status, subject, time}]` from prose (`process_data` ①) |

Index `(published_at desc)`. Writes: `pull_external_data` (rows; news normalisers pass every item through the flood-relevance gate `normalisers/_rss.is_relevant` — keyword + corridor-place match, with district names and generic places such as Kathmandu not counting on their own), `process_data` ① (`places`, `extracted`). Reads: `process_data`; public only through `v_articles_recent`. RLS: table service only. `process_data.py --purge-irrelevant` is the one-off maintenance that drops stored rows failing the gate.

### `reports_anon`

The anonymised projection of `reports_archive`, written by `process_data` ⓪. No names, phones, passports, photos, contact.

| Column | Type | Meaning |
|---|---|---|
| `id` | uuid PK | = `reports_archive.id` |
| `archive_id` | uuid, not null, unique | same value; kept explicit for joins |
| `created_at` | timestamptz, not null | copied |
| `lang` | text | |
| `respondent_type` | text, not null | |
| `supersedes` | uuid | copied |
| `person_key` | text | sha256(normalised phone) or sha256(normalised name + age + nationality) |
| `group_key` | text | normalised operator / project / pilgrim group |
| `place_id` | text → `places(id)` | resolved place |
| `place_text` | text | redacted free-text place |
| `event_time` | timestamptz | last-communication / was-there time |
| `status` | text | `missing` · `reported_safe` · `rescued` · `seen` · `unknown` … |
| `subject_count` | int | how many people the row is about |
| `nationality` | text | |
| `age_band` | text, check in (`0-17`,`18-39`,`40-64`,`65+`) or null | never an exact age |
| `sex` | text | |
| `purpose`, `travel_mode`, `operator`, `employer_project` | text | |
| `reported_to` | text[], default `{}` | official channels the reporter already used |
| `extracted` | jsonb | full structured extraction, redacted |
| `text_redacted` | text | free text with PII removed |
| `text_en` | text | English translation |
| `model` | text | model / prompt version that produced the row |
| `anonymised_at` | timestamptz, default now() | |

Indexes on `place_id`, `person_key`. Writes: `process_data` ⓪. Reads: `process_data` ①–③. RLS: service only.

## 4. DERIVED zone (`003_derived.sql`)

### Public tables

**`figures_latest`** — one row per publisher × metric × scope, latest `as_of` (`process_data` ④). Read by the side-by-side block and the OG card.

| Column | Type | Meaning |
|---|---|---|
| `publisher`, `metric`, `scope` | text (PK; `scope` default `'national'`) | as in `figures` |
| `value` | numeric, not null | |
| `as_of` | timestamptz | |
| `url`, `note` | text | |
| `computed_at` | timestamptz, default now() | also drives `v_live_counts.last_processed_at` |

**`place_status`** — the per-place ledger, one row per place per run (`process_data` ③). The site reads the latest via `v_place_status_latest`.

| Column | Type | Meaning |
|---|---|---|
| `place_id` | text → `places(id)` | PK part |
| `as_of` | timestamptz, default now() | PK part; the run time |
| `expected` | int, default 0 | entities whose last-known / probable place is here, plus reports |
| `confirmed_reached` | int, default 0 | NDRRMA rescued-/stationed-locations, rescuer reports |
| `unknown` | int, default 0 | `expected − confirmed_reached` |
| `reports_count` | int, default 0 | contributions resolved to this place |
| `last_contact_at` | timestamptz | last **observed** contact from the place (entity contact, report `event_time`, place-scoped figure `as_of`, article mentioning the place, live gauge reading); null when nothing dated exists — never the run time |
| `telecom_restored` | boolean | from telecom figures/articles for the place (`ledger.py` phones hook) |
| `phones` | text | display: `yes (since 28 Aug)` · `no` · null when unknown |
| `access` | text | `road` · `road_partial` · `foot` · `helicopter_only` · `unknown` |
| `hazard` | text | observed only: `in_channel` · `below_barrier_lakes` · null |
| `nearest_gauge` | text | e.g. `Galchhi — alive` |
| `shelter` | text | |
| `km` | double precision | copied from `places.km` |
| `status_label` | text | `mostly_unknown` · `mostly_reached` · `no_data` · `district` (for `places.kind = 'district'` and district-like ids; the site lists these under "By district", not as places) |
| `note` | text | |

Index `(place_id, as_of desc)`.

**`place_timeline`** — "Status, day by day" on the place page (`process_data` ③, extended by ⑧/`timeline.py` from dated figures and articles).

| Column | Type | Meaning |
|---|---|---|
| `place_id` | text → `places(id)` | PK part |
| `day` | date | PK part |
| `what_en` | text, not null | PK part; the line |
| `what_ne`, `what_hi` | text | |
| `dot` | text, default `'neutral'` | `live` · `unknown` · `confirmed` · `neutral` |
| `source_url` | text | |
| `computed_at` | timestamptz, default now() | |

**`stats`** — the striking numbers (`process_data` ⑤), keyed so the site picks by id.

| Column | Type | Meaning |
|---|---|---|
| `id` | text PK | 22 rows live: `wave_time_to_port` · `wave_speed` · `galchhi_rise` · `bodies_downstream_km` · `missing_counts_divergence` · `missing_hydropower` · `bodies_by_district_top` · `rescued_total_ndrrma` · `rescued_per_day` · `heli_flights` · `personnel_deployed` · `towers_restored` · `places_reached` · `places_with_unknown` · `gauges_alive` · `next_flying_window` · `days_since_event` · `duplicates_merged` · `reports_total` · `reports_last_hour` · `submissions_today` · `last_pull`. The site ranks them with minimum thresholds (`web/lib/config.ts` `STAT_CARDS`) |
| `value` | text, not null | display string: `7 min`, `~193 km/h` |
| `numeric` | numeric | the number behind it, when there is one |
| `caption_en`, `caption_ne`, `caption_hi` | text | |
| `source_url` | text | |
| `as_of` | timestamptz | |
| `computed_at` | timestamptz, default now() | |

**`report_counts`** — contributions by hour × type × place. Counts only; no other columns, ever.

| Column | Type | Meaning |
|---|---|---|
| `bucket` | timestamptz | the hour (PK part) |
| `respondent_type` | text | PK part |
| `place_id` | text, default `'unresolved'` | PK part; `unresolved` when no place could be resolved |
| `n` | int, not null | |
| `computed_at` | timestamptz, default now() | |

**`event_timeline`** (`006_story_and_digest.sql`) — the reconstructed first hours of 26 Aug, home block "The first hours". Seeded (17 rows, `db/seed/event_timeline.sql`, Latin digits) and appended by `process_data` ⑧ (`timeline.py`, 25 rows live).

| Column | Type | Meaning |
|---|---|---|
| `id` | text PK | slug, e.g. `t0837_collapse` |
| `at` | timestamptz, not null | UTC |
| `at_label` | text, not null | display in NPT, e.g. `08:37` |
| `place_id` | text → `places(id)` | |
| `km` | double precision | corridor chainage for the strip |
| `what_en`, `what_ne`, `what_hi` | text (`what_en` not null) | |
| `kind` | text, default `'event'` | live values: `trigger` · `wave` · `gauge` · `warning` · `impact` · `response` |
| `source`, `source_url` | text | publisher and link |
| `computed_at` | timestamptz, default now() | |

**`digest`** (`006_story_and_digest.sql`) — per NPT day × language "what changed" bullets, home card under the scoreboard (`process_data` ⑦).

| Column | Type | Meaning |
|---|---|---|
| `day` | date | PK part, Kathmandu calendar day |
| `lang` | text, check in (`en`,`ne`,`hi`) | PK part |
| `bullets` | jsonb, not null | `[{text, kind: figure|place|gauge|news, source_url}]` |
| `headline` | text | one line |
| `computed_at` | timestamptz, default now() | |
| `model` | text | model / prompt version |

**`figure_series`** (`007_series.sql`) — one value per publisher × metric × scope × NPT day, the last value stated that day (`process_data` ⑨, `trends.py`; 649 rows live). Sparklines and "since yesterday" read this instead of the private `figures` table.

| Column | Type | Meaning |
|---|---|---|
| `publisher`, `metric`, `scope` | text (PK part; `scope` default `'national'`) | as in `figures` |
| `day` | date | PK part |
| `value` | numeric, not null | |
| `as_of` | timestamptz | when that value was stated |
| `url` | text | |
| `computed_at` | timestamptz, default now() | |

RLS: `figures_latest_public`, `place_status_public`, `place_timeline_public`, `stats_public`, `report_counts_public`, `event_timeline_public`, `digest_public`, `figure_series_public` — select for `anon`, `authenticated`. Writes: `process_data` only (plus the `event_timeline` seed).

### Private tables (service role only)

**`entities`** — resolved people (`process_data` ②). Keys and provenance; names live only in ARCHIVE.

| Column | Type | Meaning |
|---|---|---|
| `id` | uuid PK, default `gen_random_uuid()` | |
| `person_key`, `group_key` | text | as in `reports_anon` |
| `nationality`, `age_band`, `sex` | text | |
| `status` | text | `missing` · `reported_safe` · `rescued` · `stationed` · `deceased` · `unknown` |
| `status_as_of` | timestamptz | |
| `status_source` | text | |
| `probable_place_id` | text → `places(id)` | |
| `probable_confidence` | real | |
| `last_place_id` | text → `places(id)` | |
| `last_contact_at` | timestamptz | |
| `merged_from` | jsonb, default `[]` | `[{source, external_id, score}]` |
| `updated_at` | timestamptz, default now() | |

Indexes on `person_key`, `probable_place_id`.

**`entity_events`** — status timeline per entity.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `entity_id` | uuid → `entities(id)` cascade | |
| `at` | timestamptz | |
| `status` | text | |
| `place_id` | text → `places(id)` | |
| `source`, `note` | text | |

**`dedup_queue`** — ambiguous merges (score 0.6–0.9) awaiting a human.

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `created_at` | timestamptz, default now() | |
| `a_ref`, `b_ref` | jsonb, not null | `{source, external_id}` |
| `score` | real, not null | |
| `reason` | text | |
| `model_view` | text | optional LLM adjudication + reason |
| `decision` | text, check in (`merge`,`distinct`) or null | |
| `decided_by`, `decided_at` | text, timestamptz | |

**`findings`** — data-quality findings for list-holders (`process_data` ⑥).

| Column | Type | Meaning |
|---|---|---|
| `id` | bigserial PK | |
| `created_at` | timestamptz, default now() | |
| `kind` | text, not null | live values: `name_collision` · `absent_from_setu` · `duplicate_rate` · `publisher_divergence` · `unreached_by_record` (each `detail` carries a one-line `summary`) |
| `detail` | jsonb, not null | |
| `handed_to`, `handed_at` | text, timestamptz | |

### Views (public projections)

Views are created without `security_invoker`, so they run with the owner's (`postgres`) privileges. Granting `select` on a view therefore exposes exactly the view's columns, regardless of the underlying table's RLS. That is how the public reads from service-only tables; it is also why a new view must project only safe columns.

| View | Columns | Built from | Used by |
|---|---|---|---|
| `v_live_counts` | `submissions_10m`, `submissions_today` (Asia/Kathmandu day), `submissions_total`, `last_pull_at` (max `pulls.fetched_at` where `ok`), `last_processed_at` (max `figures_latest.computed_at`) | `submissions_log`, `pulls`, `figures_latest` | scoreboard initial values, stale banner, OG card |
| `v_articles_recent` | `id`, `source_id`, `url`, `title`, `publisher`, `lang`, `published_at`, `places` — newest 100 by `coalesce(published_at, fetched_at)` | `articles` (no `body`) | Latest block, place page headlines |
| `v_place_status_latest` | `place_status.*` for the latest `as_of` per place + `name_en`, `name_ne`, `name_hi`, `kind`, `district`, `lat`, `lon`, `side` | `place_status` ⋈ `places` | Places table, place pages, 3D corridor |
| `v_sources_status` | `id`, `name`, `grp`, `family`, `url`, `reliability`, `holds`, `pii`, `cadence`, `last_fetched_at`, `last_ok`, `last_unchanged`, `last_error` | `sources` ⋈ lateral latest `pulls` row | `/sources` |
| `v_gauges_latest` | `gauges.*` for the latest `observed_at` per station | `gauges` | River & weather block, place page nearest gauge |

Grant: `select` on all five to `anon`, `authenticated`.

## 5. The `_migrations` ledger

`db/apply.py` runs every `db/migrations/*.sql` (`001_archive` · `002_raw` · `003_derived` · `004_rls` · `005_realtime_storage` · `006_pipeline_additions` · `006_story_and_digest` · `007_series`) then every `db/seed/*.sql` (`event_timeline` · `places` · `sources`), in filename order, through the Management API query endpoint, and records each file:

```
   file on disk ──► sha256(bytes)[:16] ──► compare with _migrations.checksum
        │
        ├── equal              → "already applied", skip
        ├── absent             → run the SQL, then upsert (filename, checksum, applied_at = now())
        ├── differs, migration → refuse: "edit a new migration or pass --force"
        └── differs, seed      → run again (seeds are upserts, safe to repeat)
```

Consequences: a migration file is immutable once applied — fix forward with `006_…sql`; a regenerated seed is picked up automatically; `--dry-run` prints without running or recording. Full walkthrough: `db/docs/07-applying-migrations.md`.

## 6. The withdraw trigger

`reports_archive` has a `for update` policy for the owner (`reports_own_withdraw`), but the only update a user may make is a withdrawal. The trigger `reports_archive_guard` (`004_rls.sql`; function replaced by `006_pipeline_additions.sql`) enforces that:

```
   UPDATE reports_archive … (as the owner, through the anon key)
        │
        ▼
   reports_archive_guard_update()  before update, for each row
        │
        ├── jwt role = service_role (read from `request.jwt.claims` json, or the legacy
        │   `request.jwt.claim.role` GUC), or current_user in (postgres, service_role)
        │                                                          → allow the update as written
        │
        ├── new.withdrawn_at is distinct from old.withdrawn_at    → new := old
        │                                                          new.withdrawn_at := coalesce(new.withdrawn_at, now())
        │                                                          new.status := 'withdrawn'
        │                                                          → row saved with only those two changes
        │
        └── anything else changed                                 → raise 'only withdrawal is permitted'
```

So from the browser: `update reports_archive set withdrawn_at = now() where id = …` works and stamps `status = 'withdrawn'`; any attempt to edit `text`, `place_id`, `status` or `summary_public` is rejected; and setting `withdrawn_at` back to null re-stamps `now()`, so a user cannot un-withdraw (they submit a new row instead). `process_data` skips withdrawn rows and excludes them from counts on its next run (≤ one cadence). The archive row is retained.

## 7. Realtime and Storage (`005_realtime_storage.sql`)

| Object | Definition | Purpose |
|---|---|---|
| publication `supabase_realtime` + `submissions_log` | `alter publication … add table submissions_log` | the browser subscribes to `INSERT` for the 10-min / today counters; RLS (`submissions_log_select`) governs what it sees |
| Presence channel `site` | no table; client-only | "people here now"; hides itself if the free-tier connection cap is hit |
| bucket `raw` (private) | no policies → service only | binaries from pulls (`raw_pulls.storage_path`) |
| bucket `report-photos` (private) | `report_photos_own_insert`: `authenticated` may insert into `report-photos/<auth.uid()>/…` | photos attached to a submission; nobody but the service role reads them, including the uploader |

More: `db/docs/06-realtime-and-storage.md`.
