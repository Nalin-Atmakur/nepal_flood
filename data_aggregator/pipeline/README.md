# pipeline — the two scripts that make the database the single source of truth

Everything the site shows comes out of these two scripts. They run on a plain serial loop you start in a terminal (`scheduler.py`, every 4 h; see `docs/runbook.md` §1), talk only
to the Supabase project (PostgREST + Storage + Auth admin over HTTPS) and never to the website.

```
                 sources.yaml (60 registered: 55 with normalisers — waves 1–4 — and 5 probed candidates marked verified: false)
                        │
                        ▼
   ┌──────────────────────────────────────────────────────────────────────────────┐
   │  pull_external_data.py                                                      │
   │  (02) due by cadence? ─▶ (03) fetch: browser UA · 20 s · 2 retries          │
   │        ETag / If-Modified-Since · sha256 · url lists · {a|b} · {n} pages    │
   │        prestore(): photos/names out, person_key hashes in                   │
   │  ─▶ raw_pulls (ARCHIVE; unchanged=true + no body when hash == last)        │
   │  ─▶ pulls (log row, every attempt)                                          │
   │  ─▶ (04) normalisers/<id>.normalise() ─▶ figures · gauges · articles (RAW)  │
   └──────────────────────────────────────────────────────────────────────────────┘
                        │           the website's form writes reports_archive (ARCHIVE)
                        ▼
   ┌──────────────────────────────────────────────────────────────────────────────┐
   │  process_data.py                                                            │
   │  ⓪ anonymise      reports_archive ─▶ reports_anon (LLM, PII-free) + OPMCM   │
   │  ① resolve_places articles.places · reports_anon.place_id                   │
   │  ② dedup          entities · entity_events · dedup_queue                    │
   │  ③ ledger         place_status · place_timeline                             │
   │  ③b press_figures Police / Tourism counts quoted in articles ─▶ figures     │
   │  ④ figures_latest latest per publisher × metric × scope                     │
   │  ⑤ stats          stats · report_counts                                     │
   │  ⑥ findings       findings                                                  │
   │  ⑦ digest         digest (day × en/ne/hi)                                   │
   │  ⑧ timeline       event_timeline (dated milestones)                         │
   │  ⑨ trends         figure_series (publisher × metric × day)                  │
   └──────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
              DERIVED tables + public views ─▶ nepalfloodtracker.com (Next.js, ISR)
```

`run.sh` = pull, then process. `_state.json` remembers per-source ETag / hash / last fetch and
the OpenAI cost ledger. `run.log` is the structured log (no PII, secrets redacted).

## Steps

1. **Install**
   ```
   cd data_aggregator/pipeline
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```
2. **Environment** — copy `.env.example` to `.env` and fill in
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `OPENAI_API_KEY`,
   `OPENAI_BUDGET_USD=20`. `.env` is gitignored; never commit it and never print it
   (`lib/log.py` redacts anything that looks like a key). Optional: `PULL_INTERVAL_MINUTES`
   (default 240) — the same number drives the site's "AUTO-REFRESH EVERY N MIN" copy and the
   stale banner threshold (`STALE_AFTER_MINUTES = PULL_INTERVAL_MINUTES + 45`).
3. **First run**
   ```
   .venv/bin/python pull_external_data.py --force      # all pollable sources, ignore cadence/hashes (~5 min)
   .venv/bin/python process_data.py                    # steps ⓪–⑨
   ```
   Expect: a `pulls` row per source, `raw_pulls` bodies, ≥ 5 publishers in `figures`, ~280 gauge
   stations, > 50 articles, then `figures_latest`, `place_status`, `place_timeline`, `stats`
   populated. Both scripts print a JSON summary to stdout and log to `run.log`. Wave-2 sources
   (no normaliser) still get `raw_pulls` + `pulls` rows.
   Without `SUPABASE_URL` the puller runs in **local-only mode**: raw bodies go to
   `snapshots/<id>/<ts>.<ext>` and normalised rows to `<ts>.normalised.json`;
   `process_data.py` exits 2 (the DERIVED zone lives only in the database).
4. **Cron** — tonight, every 4 hours:
   ```
   0 */4 * * * cd /path/to/data_aggregator/pipeline && ./run.sh >> run.log 2>&1
   ```
   For the live phase change the schedule to `*/15 * * * *` **and** set
   `PULL_INTERVAL_MINUTES=15` in `.env` (the per-source cadences in `sources.yaml` still apply;
   the cron line only decides how often the script wakes up). `run.sh` exits non-zero only when
   a script crashes; per-source and per-step failures are logged and do not stop the run.
5. **Tests**
   ```
   .venv/bin/python -m pytest tests -q
   ```
   Fixture-backed tests for every normaliser plus text, places, dedup, ledger, anonymise,
   the LLM budget guard and URL expansion. No network, no database, no OpenAI key needed.
6. **When something breaks**
   - `run.log` — grep the event names: `pull.source`, `pull.note`, `http.failed`,
     `pull.source_crashed`, `process.step`, `*.failed`, `llm.refused`.
   - `_state.json` — `sources.<id>` (last_fetch_at, last_ok_at, etag, body_hash, seen ids),
     `llm` (cost ledger), `runs`.
   - In the database: `select * from v_sources_status` (last fetch, ok, error per source),
     `select * from pulls order by fetched_at desc`, `select * from v_live_counts`.
   - `snapshots/place_hints.jsonl` — location strings no gazetteer alias matched
     (feed them to `gazetteer/places.csv`).
   - Docs: [docs/pull_external_data/07-failure-modes.md](docs/pull_external_data/07-failure-modes.md),
     [docs/process_data/09-failure-modes.md](docs/process_data/09-failure-modes.md).

## Two things worth knowing before you debug

- **IPv4 is forced** (`lib/net.py`). This laptop resolves `*.supabase.co` to DNS64 addresses
  (`64:ff9b::…`) that never connect; Python prefers IPv6 and hangs until timeout. The patch is
  applied on import by `lib/http.py` and `lib/db.py`. `lib/db.py` is a thin `requests`
  PostgREST wrapper for the same reason (supabase-py goes through httpx and hung).
- **The PII rule.** Names, phones, passport numbers, photos and free text from reports exist
  only in the ARCHIVE zone (`reports_archive`, `raw_pulls`) and in Storage bucket `raw`. Nothing
  under RAW/DERIVED, no log line, no fixture may carry them. PII sources are projected to hashed
  keys *before* storage (`prestore()`), reports are anonymised by ⓪ with code-side redaction as
  a second net, fixtures are scrubbed (`EXAMPLE-PERSON-n`, `98XXXXXXXX`).

## Layout

```
pipeline/
├── pull_external_data.py  process_data.py  run.sh  requirements.txt  .env(.example)
├── lib/          config · net · http · db · state · log · text · places · llm      (lib/README.md)
├── normalisers/  one module per source (51) + _common, _rss, _geo, _stac               (normalisers/README.md)
├── processing/   anonymise · resolve_places · dedup · ledger · press_figures · figures_latest · stats · report_counts · findings · digest · timeline · trends
├── tests/        pytest + fixtures/ (anonymised captures) + build_fixtures.py
├── docs/         README.md · pull_external_data/01–07 · process_data/00–08
├── snapshots/    gitignored (local-only mode, place_hints.jsonl)
└── _state.json · run.log   (gitignored)
```

## Docs

- [docs/README.md](docs/README.md) — index, hand-off through the DB, zones
- pull_external_data: [01-overview](docs/pull_external_data/01-overview.md) ·
  [02-scheduling](docs/pull_external_data/02-scheduling.md) ·
  [03-fetching](docs/pull_external_data/03-fetching.md) ·
  [04-normalising](docs/pull_external_data/04-normalising.md) ·
  [05-sources](docs/pull_external_data/05-sources.md) ·
  [06-adding-a-source](docs/pull_external_data/06-adding-a-source.md) ·
  [07-failure-modes](docs/pull_external_data/07-failure-modes.md)
- process_data: [00-anonymise](docs/process_data/00-anonymise.md) ·
  [01-resolve-places](docs/process_data/01-resolve-places.md) ·
  [02-dedup](docs/process_data/02-dedup.md) · [03-ledger](docs/process_data/03-ledger.md) ·
  [04-figures-latest](docs/process_data/04-figures-latest.md) ·
  [05-stats](docs/process_data/05-stats.md) · [06-findings](docs/process_data/06-findings.md) ·
  [07-digest](docs/process_data/07-digest.md) ·
  [08-llm-budget](docs/process_data/08-llm-budget.md) ·
  [09-failure-modes](docs/process_data/09-failure-modes.md) ·
  [10-timeline-and-trends](docs/process_data/10-timeline-and-trends.md) ·
  [11-place-now](docs/process_data/11-place-now.md) ·
  [03b-press-figures](docs/process_data/03b-press-figures.md)
- [lib/README.md](lib/README.md) · [normalisers/README.md](normalisers/README.md) ·
  [processing/README.md](processing/README.md)

## Maintenance flags

- `process_data.py --purge-irrelevant` — one-off removal of stored articles that fail the relevance
  gate (docs/pull_external_data/04-normalising.md); every new pull is gated automatically.
