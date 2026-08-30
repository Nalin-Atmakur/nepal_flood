# 07 — failure modes: what happens, how to see it

```
   symptom                      where it shows                       what the puller does
   ──────────────────────────── ──────────────────────────────────── ─────────────────────────────────
   source down / timeout        run.log http.failed, pull.source     2 retries (1.5 s, 3 s) → part error
                                ok=False error=ReadTimeout            → pulls.ok=false, no raw_pulls row,
                                v_sources_status.last_ok=false        state.last_error_at, next try at cadence
   304 Not Modified             pull.source unchanged=True            pulls {ok, unchanged, http_status=304};
                                                                      nothing normalised
   same body as last time       pull.source unchanged=True            raw_pulls {unchanged=true, body=null};
                                normaliser=skipped (unchanged)        pulls.unchanged; skipped unless --force
   shape changed                pull.note "…: no data object" /       normaliser returns fewer rows + notes;
                                rows={"figures":0,…}                   raw_pulls still stored for a later re-parse
   blocked / 403 / placeholder  pull.source error=http 403            as "source down"; try auth: browser_ua
   400 on one url of several    pull.note "<url>: http 400"           other parts normalised (opmcm rescued)
   huge body (> 2 MiB)          raw_pulls.storage_path set            body uploaded to Storage raw/<id>/…
   body > 25 MiB                error="body too large"                refused, part error
   DB unreachable               pull.db_unreachable, mode=local       snapshots/<id>/<ts>.<ext>, no pulls rows
   normaliser exception         pull.source_crashed error=…           raw_pulls + pulls(ok=false) written; next source runs
   PII slipped into output      tests/test_normalisers PII sweep      fix prestore(); rows already written must be
                                                                      deleted by hand (figures/articles have no names by design)
   unknown source id in pulls   pull.log_failed (FK violation)        seed the sources table (06 step 5)
   unresolved place strings     pull.unresolved_places n=…            appended to snapshots/place_hints.jsonl
                                                                      (scope falls back to place:<slug>)
```

## How to see it

- `run.log` — grep by event: `pull.start`, `pull.not_due` (verbose), `pull.skip_no_url`,
  `pull.source` (one per source: ok, unchanged, parts, error, bytes, rows, seconds),
  `pull.note` (normaliser diagnostics), `pull.written` (rows upserted), `pull.unresolved_places`,
  `pull.log_failed`, `pull.source_crashed`, `pull.db_unreachable`, `pull.done`, `http.failed`,
  `places.loaded` / `places.empty_table` / `places.db_failed` / `places.csv_failed`.
  Values are passed through `lib.log.redact()` (phones, e-mails, passport-like ids, keys →
  `[phone]`, `[email]`, `[id]`, `[secret]`).
- stdout — the JSON summary printed at the end of every run (`run.sh >> run.log` keeps it).
- Database — `select * from v_sources_status` (last_fetched_at, last_ok, last_unchanged,
  last_error per source); `select source_id, ok, error, fetched_at from pulls order by
  fetched_at desc limit 50`; `select source_id, fetched_at, unchanged, bytes, storage_path from
  raw_pulls order by fetched_at desc`.
- `_state.json` — `sources.<id>` for the last hash/etag; delete the key to force a full
  re-fetch of one source.
- `--only <id> --dry-run --verbose` reproduces one source without writing anything.

## What is deliberately *not* retried

A failed source waits for its cadence (no hot loop); a 304 or unchanged hash is not
re-normalised (use `--force`); a PDF that failed to download is retried next run because its
id is only marked seen after success; pre-event NDRRMA publications (before 26 Aug 2026) are
never downloaded.

## Exit codes

`pull_external_data.py` exits 0 after any number of per-source failures. Non-zero only for a
crash outside the per-source loop (unreadable `sources.yaml`, missing `.venv` packages). `run.sh`
propagates that.
