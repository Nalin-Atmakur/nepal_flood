# 01 · The three zones

Everything in the project sits in one of three zones. The zone decides who may write, who may read, and which key is used. `docs/data-model.md` lists every column; this file is the map.

```
                       people (browser, anon key)              external sources (cron, service key)
                         /report  →  insert verbatim              pull_external_data.py
                                 │                                        │
                                 ▼                                        ▼
   ┌──────────────────────── ARCHIVE ─────────────────────┐  ┌──────────────── RAW ────────────────────┐
   │ verbatim; may hold names/phones/photos                │  │ normalised; PII already removed          │
   │ owner reads own rows; otherwise service role only     │  │ service role only, except reference data │
   │                                                       │  │                                          │
   │ users · reports_archive · raw_pulls                   │  │ sources · places · gauges     (public)   │
   │ submissions_log (public, PII-free)                    │  │ pulls · figures · articles · reports_anon│
   │ _migrations (apply.py ledger)                         │  │                                          │
   └───────────────────────────┬───────────────────────────┘  └────────────────────┬─────────────────────┘
                               │            process_data.py ⓪ anonymise            │
                               └───────────────────────────►────────────────────────┤
                                                                                    │ ①②③④⑤⑥
                                                                                    ▼
                       ┌────────────────────────────── DERIVED ──────────────────────────────┐
                       │ computed every run; the website reads the public part               │
                       │ public:  figures_latest · place_status · place_timeline · stats     │
                       │          report_counts                                              │
                       │ private: entities · entity_events · dedup_queue · findings          │
                       └──────────────────────────────────┬──────────────────────────────────┘
                                                          │ + views: v_live_counts v_articles_recent
                                                          │          v_place_status_latest v_sources_status
                                                          │          v_gauges_latest
                                                          ▼
                                                 website (Next.js on Vercel, anon key)
```

## Who writes, who reads

| Zone | Writes | Reads | Detail |
|---|---|---|---|
| ARCHIVE | website (own rows) · `pull_external_data` (`raw_pulls`) · `process_data` (bookkeeping) | owner (own rows) · `process_data` | `02-archive.md` |
| RAW | `pull_external_data` · `process_data` ⓪① · seeds | `process_data` · website (`sources`, `places`, `gauges`, views) | `03-raw.md` |
| DERIVED | `process_data` | website (public tables + views) · `process_data` (private) | `04-derived.md` |

Rules that follow from the zones:

1. No cross-zone write except by the designated script. The website writes ARCHIVE only; `pull_external_data` writes RAW and `raw_pulls`; `process_data` writes RAW (`reports_anon`, `articles.places`) and DERIVED.
2. PII enters ARCHIVE and stops there. RAW and DERIVED hold hashes (`person_key`), bands (`age_band`) and counts, never names, phones, passports or photos.
3. The public reads DERIVED, the three reference/safe RAW tables, and views. Nothing else is granted to `anon`/`authenticated` (`05-rls.md`).
4. Every number carries its `as_of` and a `url`. `figures` and `figures_latest` have no column for a figure without a publisher.

## Keys and roles

| Principal | Role | Credential | Lives in |
|---|---|---|---|
| visitor | `anon` → `authenticated` after `signInAnonymously()` | anon key | the browser (`web/.env.local`, Vercel env) |
| `pull_external_data`, `process_data` | `service_role` (bypasses RLS) | service-role key | `pipeline/.env` on the cron machine only |
| `db/apply.py`, `db/tests` | `postgres` via Management API | `SUPABASE_ACCESS_TOKEN` or Supabase CLI keychain | the operator's shell |

Supabase is used as a database only: Postgres, RLS, one Realtime publication, two Storage buckets. No edge functions, no Supabase cron, one trigger (`reports_archive_guard`, which exists to make RLS expressible). All logic lives in `../pipeline/` and `../web/`.

Next: `02-archive.md`.
