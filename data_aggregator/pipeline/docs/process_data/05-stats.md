# 05 — ⑤ public-source statistics (`processing/stats.py`)

Step ⑤ materialises the public site's striking statistics from public-source tables. Family
questionnaire contents and archive counts are excluded in the default archive-only mode.

```text
public figures / latest figures / gauges / public-source place ledger
                              │
                              ▼
                            stats

reports_archive ──X──► reports_total / reports_last_hour
reports_anon    ──X──► report_counts
```

## Current inputs

- seeded, sourced event facts such as wave time/speed and downstream distance;
- NDRRMA figures and day-over-day changes;
- publisher divergence across public agencies;
- public-source place ledger, gauge and flying-window state;
- external-register deduplication measurements;
- `v_live_counts.last_pull_at` for the public pipeline freshness statistic.

The browser-facing submission-activity counters remain separate. The form writes one
PII-free `submissions_log` row and the website reads `v_live_counts` directly. Step ⑤ does not
copy `submissions_today` into `stats`, and it never reads report contents, locations or contacts.

## Disabled legacy outputs

When `FAMILY_REPORT_PROCESSING_ENABLED=false`:

- `reports_total` and `reports_last_hour` are not computed or upserted;
- `report_counts.run()` returns `{buckets: 0, skipped: "archive_only"}` before a database query;
- the website's stat-card allowlist excludes `reports_total` even if a stale/reserved row exists;
- no withdrawal can leave a stale family-derived public bucket because no bucket is created.

The `report_counts` table and legacy builders remain reserved for a future separately reviewed
programme. They are not part of the current publication contract.

## Failure behaviour and tests

Each public-source block is guarded independently; one missing view logs `stats.part_failed`
without erasing other last-good statistics. `report_counts` reports its disabled state
separately. `pipeline/tests/test_archive_only.py` proves step ⑤ does not access
`reports_archive`, `reports_anon` or `report_counts` in archive-only mode.
