# 09 — processing failure modes and archive-only invariants

```text
process_data.py
  DB unavailable             → exit 2; nothing runs
  one guarded step fails     → log error; later public-source steps continue
  archive-only family branch → explicit skipped summary; never a retry/backlog
```

## Family intake

`FAMILY_REPORT_PROCESSING_ENABLED=false` is the default and the safe failure state. Missing,
empty or invalid configuration values also resolve to false.

| condition | behaviour | evidence |
|---|---|---|
| archive-only mode | no `reports_archive`/`reports_anon` query, no family prompt, no family-derived write | `anonymise.family_reports_disabled`; run summary `family_reports.mode=archive_only` |
| questionnaire row remains `received` | expected permanent archive state | `anonymised_at` and `summary_public` remain null |
| user withdraws | database trigger sets `withdrawn_at` and `status='withdrawn'`; raw row/files remain private | My Info shows Received → Withdrawn |
| OpenAI missing/down | family intake unaffected; only public-source model-assisted work falls back/skips | `llm.unavailable` / caller summaries |

Received rows older than the pipeline cadence are not unhealthy and must not trigger a backlog
alert. Withdrawn rows must be excluded from any future manual review/handoff. Withdrawal is not
deletion and the UI states that explicitly.

## Public-source steps

| step | typical failure | effect |
|---|---|---|
| ⓪ OPMCM | body unavailable or still contains forbidden fields | projection remains pending or row is rejected; family archive is untouched |
| ① article places | gazetteer/model unavailable | deterministic alias result or no match; family branch stays disabled |
| ② public dedup | malformed public-register record | step logs and returns an error; no family archive access |
| ③ ledger | unknown place id | signal is ignored until the gazetteer is updated |
| ③b/⑦/⑩ model-assisted public text | budget/API/shape failure | deterministic public-source fallback or skipped polish |
| ④/⑤/⑥/⑧/⑨ | one source/view unavailable | guarded step keeps other last-good public outputs |

## Idempotency

Public-source runs remain repeatable through pull hashes/bookkeeping and derived-table keys.
Family rows have no processing bookkeeping in archive-only mode because they are never selected.
`--dry-run` respects the same boundary and cannot call the family anonymisation purpose.

## Verification

- `pipeline/tests/test_archive_only.py` supplies a DB double that raises on any family-table access
  and an LLM double that raises on any family-model call.
- Legacy anonymisation tests explicitly exercise the dormant helpers without changing the default.
- A rollout check should confirm `purpose=anonymise` never appears in new logs and the process JSON
  always contains `family_reports: {mode: "archive_only"}`.
