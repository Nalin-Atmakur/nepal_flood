# Contributing

How to run the system locally and how to extend each part without breaking the shape. Read `README.md` first for the one-screen picture. Every procedure here is numbered; every folder you touch has a README and a `docs/` folder of numbered files that go deeper.

## 1. Run locally

1. Clone; `cd nepal_flood/data_aggregator`.
2. Database: nothing to run locally — the Supabase project is the database. Ask for `pipeline/.env` values (service key) and `web/.env.local` values (anon key); copy from the `.env.example` files and fill them in. Never commit either.
3. Pipeline:
   ```
   cd pipeline
   python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
   .venv/bin/python pull_external_data.py      # external → RAW   (local-only mode if SUPABASE_URL is unset: writes snapshots/, no DB)
   .venv/bin/python pull_external_data.py --only <id> --force --dry-run   # one source, ignore cadence, write nothing
   .venv/bin/python process_data.py            # RAW + ARCHIVE → DERIVED   (--step N runs one step; 3.5 = press figures)
   .venv/bin/python -m pytest -q
   ```
4. Website:
   ```
   cd web
   npm install
   npm run dev                                 # http://localhost:3000 → redirects to /en, /ne or /hi
   npm run lint && npm run i18n:check && npm test && npm run build && npm run e2e
   ```
   `npm run build` must pass with and without `.env.local`; with it absent every block renders its empty state. Use `NODE_OPTIONS=--dns-result-order=ipv4first` if the Supabase host does not connect from your network (IPv6/DNS64).
5. Schema tools need a Management API token: `supabase login` on a Mac, or `export SUPABASE_ACCESS_TOKEN=sbp_…`. Then `pipeline/.venv/bin/python db/apply.py --dry-run` (`db/README.md`).

## 2. Add a source

```
   sources.yaml ─► normalisers/<id>.py ─► tests/fixtures/<id>.* + test ─► db seed ─► docs/sources.md ─► pipeline docs
```

1. Add an entry to `sources.yaml`: `id` (slug, becomes the filename), `family`, `url`, `auth`, `cadence`, `format`, `holds`, `pii`, `parser`, `catalogue`, `verified`. If rows contain names/phones/photos set `pii: true` and describe in `parser` what is kept (counts, place distributions) — never rows.
2. Write `pipeline/normalisers/<id>.py` with `normalise(raw, fetched_at, source) -> {figures: [...], gauges: [...], articles: [...], place_hints: [...]}`. Contract and template: `pipeline/normalisers/README.md`; upsert keys: `db/docs/03-raw.md`. Strip PII inside the normaliser, before anything is returned.
3. Save one real response as `pipeline/tests/fixtures/<wave>_<id>.<ext>`, anonymised (replace names/phones with placeholders; keep the shape). Fixture prefixes and test files by wave: wave 1 `<id>.*` → `tests/test_normalisers.py`; wave 2A `w2a_*` → `test_normalisers_w2a.py`; wave 2B `w2b_*` → `test_normalisers_w2b.py`; wave 3 `w3_*` → `test_normalisers_w3.py`. JSON/XML/HTML/text only: `*.xlsx` and `*.csv` are gitignored by design (personal-data firewall), so a spreadsheet fixture stays local and its test must skip when the file is absent. Assert row counts and a couple of values.
4. `pipeline/.venv/bin/python -m pytest -q`.
5. Seed the registry row: `pipeline/.venv/bin/python db/seed/gen_sources.py && pipeline/.venv/bin/python db/apply.py --only seed`. Check the auto-assigned group/grade in `db/seed/gen_sources.py` (`GROUP_BY_PREFIX`, `OVERRIDES`); add a prefix or override if the new id would fall into `community`.
6. Regenerate the docs table: `pipeline/.venv/bin/python docs/gen_sources_md.py`.
7. Add a section to the wave file — `pipeline/docs/pull_external_data/05-sources.md` (wave 1), `05a-sources-wave2-official.md`, `05b-sources-wave2-geospatial-text.md`, `05c-sources-wave3.md` (wave 3, once it lands) — with endpoint, shape, quirks, what it emits. Full walkthrough with the same numbering: `06-adding-a-source.md`.
8. Run `pull_external_data.py --only <id> --force` once by hand; confirm a `pulls` row with `ok = true` and rows in the target table; check `/sources` shows it. News-type sources must go through the relevance gate (`normalisers/_rss.is_relevant`) before emitting `articles`.

## 3. Add a processing step

Steps are numbered in the code, the docs and the DERIVED tables they write (`db/docs/04-derived.md`).

1. Create `pipeline/processing/<name>.py` and register it in the `STEPS` list in `process_data.py` at its number (fractional numbers are allowed for sub-steps: `press_figures` is 3.5 = ③b), exposing `run(ctx) -> dict` that is idempotent: re-running with no new input must be a no-op. Catch your own errors and return `{"error": …}`; the next step must still run.
2. If it writes a new table or column: schema change first (section 6), DERIVED only. Never write ARCHIVE except the documented bookkeeping columns of `reports_archive`.
3. If it calls the model, go through `pipeline/lib/llm.py` only (budget guard, structured outputs, model name in one place). Never send names or phones to the model from RAW — they are not there; from ARCHIVE only inside ⓪ with redaction as the purpose.
4. Add `pipeline/tests/test_<name>.py` with a fixture-driven input and the expected rows.
5. Write `pipeline/docs/process_data/<nn>-<name>.md`: stage diagram, inputs → tables → outputs, failure behaviour. Numbers match the code (`03-ledger.md` ↔ `processing/ledger.py` ↔ step ③; `03b-press-figures.md` ↔ 3.5; `10-timeline-and-trends.md` ↔ ⑧ ⑨). `08-llm-budget.md` and `09-failure-modes.md` are cross-cutting.
6. If the site should show the result: a query function in `web/lib/queries.ts`, a block or field in `web/components/`, entries in all three `web/messages/*.json`.

## 4. Add a language

1. Add the code to `LANGS` in `web/lib/i18n.ts` and a label to `LANG_LABELS`.
2. Create `web/messages/<code>.json` with **every** key from `en.json`; `npm run i18n:check` and the parity test in `web/tests` fail on a missing key. Numbers stay Latin in all languages; Devanagari-script languages need `line-height ≥ 1.6` (already in the design tokens).
3. `web/proxy.ts` (Next 16's name for middleware): the Accept-Language redirect picks the new code up from `LANGS`; check the fallback order.
4. Database: `users.lang` has a check constraint `in ('en','ne','hi')` — add a migration extending it (section 6). `places.name_<code>` and `place_timeline.what_<code>`/`stats.caption_<code>` are optional columns; add them in the same migration if the language should have localised names, and teach `pipeline/processing/ledger.py` and `stats.py` to fill them.
5. Share text and the OG card: `web/lib/share.ts` and `web/app/api/og/route.tsx` have a per-language string each.
6. Fonts: confirm `next/font/google` loads a subset that covers the script (`web/docs/02-design-system.md`, `03-i18n.md`).
7. Playwright smoke: add the new route to the "home renders all blocks" test.

## 5. Add a home block

One file per block; the home page composes them in the design's order.

1. Create `web/components/blocks/<Name>.tsx`. Server component by default; a client island (`"use client"`, `dynamic(…, {ssr:false})` if heavy) only when it needs the browser.
2. Read data through one new function in `web/lib/queries.ts` against a public table or view (`db/docs/04-derived.md`). It must return `null` on error or when Supabase is unconfigured; the block renders the design's empty state (dashed border + one action) in that case.
3. Add the block to `web/app/[lang]/page.tsx` with a `SectionHead` number; renumber later sections' docs if you insert rather than append.
4. Strings in `web/messages/{en,ne,hi}.json`, same keys in all three.
5. Every number rendered shows `as_of` and links to its source. Stale (`last_processed_at` older than the threshold) is handled by the page-level `StaleBanner`, not per block.
6. `web/docs/05-home-blocks.md`: add the block with its query and empty state.
7. `npm run build && npm test`; Playwright's "home renders all N blocks in 3 languages" count goes up by one.

## 6. Change the schema

1. New file `db/migrations/008_<topic>.sql` (next free number; `001`–`007` are applied). **Never edit an applied file** — `db/apply.py` refuses a changed applied file and would otherwise leave the ledger lying (`db/docs/07-applying-migrations.md`).
2. Idempotent statements: `create table if not exists`, `alter table … add column if not exists`, `create or replace view`, `drop policy if exists …; create policy …`.
3. Every new table: `enable row level security` plus either a `_public` select policy, owner policies, or a `revoke all … from anon, authenticated` in the same file. Every new public view: `grant select … to anon, authenticated`, projecting only safe columns.
4. `pipeline/.venv/bin/python db/apply.py --dry-run`, then without `--dry-run`.
5. Update `docs/data-model.md` and the zone file `db/docs/02|03|04-*.md`; update the writer (`pipeline/processing/`) and reader (`web/lib/queries.ts`); add the RLS test in `db/tests/test_rls.py`.
6. Commit migration + docs + tests together. Note the change in `docs/decisions-log.md` if it embodies a decision.

## 7. Commit and push

1. Branch from `main` for anything larger than a doc fix; otherwise commit on `main` at a phase boundary.
2. Before pushing: `pipeline` → `pytest` green; `web` → `npm run lint && npm run build && npm test` green; `db` → `pytest db/tests` if the schema changed.
3. Never commit: `.env`, `.env.*`, `pipeline/snapshots/`, `pipeline/_state.json`, `pipeline/run.log`, `pipeline/.scheduler.pid`, `node_modules/`, `.next/`, `.vercel/`, build output, database dumps. The repo-wide `.gitignore` also blocks `*.csv`, `*.xlsx`, `*.parquet`, `data/**/*.json` and imagery as a personal-data firewall; the gazetteer's `places.csv` is the deliberate exception — force-add it only after confirming it contains no personal data. Stage explicit paths and check `git diff --cached --name-only` before committing.
4. Commit messages name the phase or the part: `db: 006 add users.lang zh`, `pipeline: ndrrma_bulletins normaliser`, `web: places block empty state`, `docs: runbook cadence switch`.
5. `git pull --rebase --autostash origin main`, then push to `origin/main`; deploy only if `web/` changed, and only from `web/` (`docs/runbook.md` §7).

## 8. The PII rule

Names, phone numbers, passport numbers, photos and reporter contact details exist in exactly one zone: ARCHIVE (`reports_archive`, `raw_pulls`, the two private buckets). They never appear in:

- RAW or DERIVED tables (hashes, bands and counts instead: `person_key`, `age_band`, `subject_count`);
- test fixtures (anonymise before saving; keep the shape, replace the values; spreadsheets — `*.xlsx`, `*.csv` — are gitignored on purpose and stay local);
- log lines (`run.log`, Vercel logs, browser console) — log ids and counts, not text (`pipeline/lib/log.py` masks 9–14-digit numbers as `[phone]` as a last line of defence);
- the website, the OG card, share text, `docs/`;
- commits (see the `.gitignore` firewall) or chat messages.

If you are unsure whether a value is personal data, treat it as if it is. Suspected leak: stop, note the rows, tell the maintainer (`nepalfloodrescuers@gmail.com`), fix forward with a migration or a code change, and record it in `docs/decisions-log.md`.

The site is volunteer-run and not an official source. Every page carries the official channels (Police 1155 · Tourist Police 1144 · MoFA ECR · Red Cross 1130 · Disaster hotline 1234 (NEOC)); nothing we build replaces reporting to them.

## 9. Where docs live

```
   README.md                       the whole system on one screen, links down
   CONTRIBUTING.md                 this file
   PLAN.md                         architecture narrative + decisions (edit when reality changes)
   docs/                           cross-cutting: data-model · runbook · decisions-log · sources (generated)
   PROGRESS.md                     overnight build log: status by phase, cycle log, queue
   db/README.md + db/docs/01–07    schema, zones, RLS, applying migrations
   pipeline/README.md + pipeline/docs/
       pull_external_data/01–07    one numbered file per stage of the pull script (+05a, 05b, 05c per source wave)
       process_data/00–10          one numbered file per processing step, numbers match the code (+03b)
   web/README.md + web/docs/01–14  app architecture, design system, i18n, each route, deploy, story/digest, flood-sim spec
   gazetteer/README.md             the corridor places and how to add one
   scripts/README.md               health check and scheduler installer
```

Rules: every folder has a README (purpose, diagram, numbered steps, contract); every script has a docs folder with one numbered file per stage; module docstrings cite their doc file; ASCII diagrams in fenced blocks; tables for reference lists; no marketing language. When you change behaviour, change the doc in the same commit.
