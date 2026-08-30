# 04 · DERIVED zone — `003_derived.sql`, `006_story_and_digest.sql`, `007_series.sql`

What the website shows. Every table here is recomputed by `process_data`; nothing else writes it. Public tables are readable with the anon key; private tables are service-only. Columns: `docs/data-model.md` §4.

## Which step writes what

```
   process_data.py
        ⓪ anonymise        → reports_anon (RAW)                 [pipeline/docs/process_data/00-anonymise.md]
        ① resolve places   → articles.places, reports_anon.place_id (RAW)          [01-resolve-places.md]
        ② dedup            → entities · entity_events · dedup_queue   (PRIVATE)     [02-dedup.md]
        ③ ledger           → place_status · place_timeline            (public)      [03-ledger.md]
        ③b press_figures   → figures (RAW; publishers "… (via press)")              [03b-press-figures.md]
        ④ figures_latest   → figures_latest                           (public)      [04-figures-latest.md]
        ⑤ stats            → stats · report_counts                    (public)      [05-stats.md]
        ⑥ findings         → findings                                 (PRIVATE)     [06-findings.md]
        ⑦ digest           → digest                                   (public)      [07-digest.md]
        ⑧ timeline         → event_timeline (append) · place_timeline (public)      [10-timeline-and-trends.md]
        ⑨ trends           → figure_series                            (public)      [10-timeline-and-trends.md]
        ...and sets reports_archive.status → processed | matched      (ARCHIVE)
```

## Public tables

| Table | Grain | Read by |
|---|---|---|
| `figures_latest` | one row per publisher × metric × scope, latest `as_of` | side-by-side block (§03), OG card, `v_live_counts.last_processed_at` |
| `place_status` | one row per place per run (`as_of`); latest via `v_place_status_latest` | Places table (§04), place pages, 3D corridor, mobile place list |
| `place_timeline` | one line per place per day | place page "Status, day by day" |
| `stats` | one row per striking number, keyed by `id` | What happened, in numbers (§02); River & weather counts |
| `report_counts` | contributions per hour × respondent type × place | "N people have added what they know", `submissions_by_utm`-style analyses |
| `event_timeline` | one dated milestone per row (seeded first hours + appended) | home block "The first hours" (§03), OG card context |
| `digest` | one row per NPT day × language, `bullets` jsonb | "What changed today" card under the scoreboard |
| `figure_series` | one value per publisher × metric × scope × NPT day | sparklines and "since yesterday" deltas |

`place_status` keeps history on purpose: each run appends a row, so the ledger's arithmetic (`expected`, `confirmed_reached`, `unknown`) can be audited over time. `v_place_status_latest` picks the newest row per place and joins the gazetteer names so the site needs one query.

## Private tables (service role only)

| Table | Why private |
|---|---|
| `entities` | resolved people: `person_key`, nationality, age band, status, probable place, `merged_from` provenance. No names — but a row per person is still too identifying to publish; counts flow to `place_status` instead |
| `entity_events` | status timeline per entity |
| `dedup_queue` | candidate merges scored 0.6–0.9 waiting for a human decision (`decision`, `decided_by`, `decided_at`); `model_view` holds the optional LLM adjudication |
| `findings` | name collisions (Bhotekoshi RM vs Bhote Koshi river), entries absent from Setu, duplicate rate, publisher divergence, unreached-by-record — handed to list-holders (`handed_to`, `handed_at`), never shown on the site |

## Views

| View | What it projects | Why a view |
|---|---|---|
| `v_live_counts` | five scalar counters: `submissions_10m`, `submissions_today` (Kathmandu day), `submissions_total`, `last_pull_at`, `last_processed_at` | one round-trip for the scoreboard's initial state and the stale banner |
| `v_articles_recent` | newest 100 headlines without `body` | `articles` is service-only; the body must not leak |
| `v_place_status_latest` | latest `place_status` per place + gazetteer names/coords | `distinct on` in SQL, not in the app |
| `v_sources_status` | `sources` + the latest `pulls` row | `/sources` shows last-fetched and ok/error without exposing `pulls` |
| `v_gauges_latest` | latest reading per station | River & weather tiles |

All five run as the view owner (`postgres`), which is what lets them read service-only tables — see the caution in `05-rls.md`.

## Contract with the website

Every read the site makes is a function in `web/lib/queries.ts` against one of the public tables or views above, plus `places` and `sources`. Adding a column here means: migration → this file and `docs/data-model.md` → the writer in `pipeline/processing/` → the reader in `web/lib/queries.ts`. Nothing else needs to know.

Next: `05-rls.md`.

## 012 — per-source extract views

`v_source_counts`, `v_source_figures_recent` (≤ 40 per source), `v_source_articles_recent` (≤ 8 per source) back the
"▸" disclosure on `/sources`. Plain views owned by postgres over RAW; `grant select … to anon, authenticated`.
