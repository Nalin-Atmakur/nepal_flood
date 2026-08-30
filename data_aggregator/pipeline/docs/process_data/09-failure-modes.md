# 08 — failure modes and test data

```
   process_data.py
     db ping fails / SUPABASE_URL unset ──▶ exit 2 (process.no_db / db.ping_failed); nothing runs
     step raises inside run()           ──▶ logged <step>.failed, returns {"error"}, next step runs
     step raises outside its guard      ──▶ process.step_crashed, same
     finaliser: anonymised → processed  ──▶ only when all steps (or --step ≥ 6) ran
     exit code                          ──▶ 0 (run.sh only fails on a crash)
```

| step | typical failure | effect | how to see it |
|---|---|---|---|
| ⓪ | OpenAI down / key missing | rows stay `received`, retried next run (`skip`) | `llm.call_failed`, `llm.unavailable`, summary `skipped` |
| ⓪ | budget exhausted | `fallback` rows: place via aliases, no free text, `model="fallback"` | `llm.refused`, summary `fallback` |
| ⓪ | model leaks a name into a text field | caught by `redact_pii` using the model's own `private.names`; belt-and-braces regexes for phones/e-mails/ids | `tests/test_anonymise.py::test_model_slip_is_caught_by_code` |
| ⓪ | OPMCM body in Storage unreadable | `projected_at` stays null, retried | `anonymise.storage_download_failed` |
| ① | gazetteer empty | built-in list is used; ids still match the CSV builder | `places.loaded source=builtin` |
| ① | article never matches | `extracted.method = "none"`; reset `extracted` to re-scan | `resolve_places.articles matched=…` |
| ② | huge blocks (nationality+age band) | pairwise scoring skipped for blocks > 400 records | `dedup.clustered` |
| ② | FK error on a place id | the whole step fails; check `places` has the id | `dedup.failed` |
| ③ | place id from a normaliser not in `places` | ignored (no `place_status` row) until the gazetteer grows | `snapshots/place_hints.jsonl` |
| ④ | none expected | previous rows stay | `figures_latest.failed` |
| ⑤ | a view missing (`v_place_status_latest`, `v_gauges_latest`, `v_live_counts`) | stats half fails, report_counts still runs | `stats.failed` |
| ⑥ | none expected | | `findings.failed` |

Idempotency: every run may be repeated — bookkeeping columns (`anonymised_at`, `projected_at`,
`extracted`) and the DERIVED primary keys make re-runs no-ops or refreshes. `--step N` runs a
single step (e.g. `--step 5` after a withdrawal to refresh counts); `--dry-run` computes without
writing (⓪ still calls the model for pending rows).

## Withdrawals

A user setting `reports_archive.withdrawn_at` (the only update the RLS trigger allows) removes
the report from `reports_total` on the next ⑤; a row withdrawn before ⓪ ran is never
anonymised (`withdrawn_at is null` filter). A row already projected into `reports_anon` is
deleted from it by `anonymise.retract_withdrawn()` at the start of the next ⓪ (the archive row
is retained — soft withdraw), so ③ and ⑤ stop counting it within one run.

## Test data

To verify the round trip end-to-end the pipeline created one synthetic user and one report:

- auth user `test-pipeline@example.com` (created with the service key via
  `POST /auth/v1/admin/users`, `email_confirm: true`) and its row in `users`;
- one `reports_archive` row for that user (respondent_type `family`, a fictional text naming
  `EXAMPLE-PERSON-1` at Timure with a `98XXXXXXXX` phone), which ⓪ turned into a `reports_anon`
  row with a `summary_public`, and which was then withdrawn (`withdrawn_at` set,
  `status = 'withdrawn'`), so it no longer counts anywhere.

It is harmless: withdrawn rows are excluded from `reports_total`, the anonymised row holds no
PII, and the user cannot log in (no password). To remove it entirely:

```sql
delete from reports_anon     where archive_id in (select id from reports_archive where user_id = '<uuid>');
delete from reports_archive  where user_id = '<uuid>';
delete from users            where id = '<uuid>';
-- then delete the auth user: DELETE /auth/v1/admin/users/<uuid> with the service key
```

where `<uuid>` = `select id from auth.users where email = 'test-pipeline@example.com'`.

## Off-topic articles (one-off purge)

Before the relevance gate (docs/pull_external_data/04-normalising.md) existed, general-feed items
("China's record robotic strides…", pre-event NDRRMA catalogue PDFs) reached `articles` and the
site's Latest block. They are removed with:

```
.venv/bin/python process_data.py --purge-irrelevant      # add --dry-run to only count
```

`processing/purge_irrelevant.py` deletes every `articles` row failing `is_relevant(title, body)` and
the `place_timeline` rows whose `source_url` was one of those articles; it is idempotent. Run on
2026-08-30: 360 scanned, 77 removed. Every later pull is gated, so this should not be needed again
unless the keyword list is tightened.

## ⑦ digest

`digest.failed` in run.log means the day's rows were not (re)written; the previous rows stay. A
`model = 'fallback'` row means the translation call was refused (see 08-llm-budget.md) — the next run
retries. `event_timeline` only gains a response row on days NDRRMA publishes headline totals.
