# Archive-only family intake remediation

**Date:** 30 August 2026

**Related assessment:** `docs/SECURITY_ASSESSMENT.md` (historical, pinned to `9763f5c`)

**Schema migrations:** none

## Decision

Before public distribution, family questionnaire submissions were changed from an automated
anonymise/reconcile/publish input into a private archive only. The form still stores the original
row and attachments under owner RLS and writes the deliberately retained content-free activity
event. The automated pipeline must not select, transform, model, match, summarise, count or publish
questionnaire data.

`FAMILY_REPORT_PROCESSING_ENABLED` defaults to false; missing, empty and invalid values fail closed.
Every family entrypoint and downstream consumer checks the resolved context value. Reports remain
`received` with null `anonymised_at`/`summary_public`; withdrawal retains the private row/files but
bars future review, processing and handoff.

## Assessment mapping

| Finding | Effect of this change | Residual work |
|---|---|---|
| NF-01 family-derived public place/time combinations | Prospectively removed: family rows do not reach place status, timelines, report buckets, digests or place summaries | Public-source disclosure still requires its own review; reserved public schema must remain unwritten |
| NF-03 stale family derivatives after withdrawal | Prospectively removed before distribution because no family derivative is created | Raw reports/files are deliberately retained after soft withdrawal; UI now says withdrawal is not deletion |
| NF-04 raw reports sent to OpenAI | Prospectively removed: no family row is selected and no family prompt is constructed | OpenAI remains in use for public articles and public-source prose |
| NF-05 family anonymisation failure | Avoided in current mode because anonymisation does not run | Dormant legacy code must not be enabled without a new review |
| NF-09 family identity keys | No new family key is created by the pipeline | Browser fingerprint collection remains by explicit product decision |
| NF-11 inaccurate processing copy | Corrected in EN/NE/HI to describe private storage, no automated analysis/publication/sharing, and soft withdrawal | Provider/storage encryption terminology must remain accurate |

This change does **not** resolve the assessment's missing controller/receiver/consent finding,
upload quarantine, client-only abuse controls, shared-device session exposure, external-source PII
handling, TLS, headers/analytics or build/release governance. It must not be represented as a full
security approval.

## Enforced paths

- Step ⓪ skips active and withdrawn questionnaire queries and the `anonymise` model purpose while
  continuing the separate public OPMCM projection.
- Report place resolution, form deduplication, ledger report input, family statistics,
  `report_counts`, place-summary report input and final archive statuses all stop before a family
  table query.
- Website stat cards exclude `reports_total`; public activity counters continue to use only
  `submissions_log` type/language/timestamp data.
- The receipt does not poll for a summary. My Info requests minimum metadata and presents only
  Received or Received → Withdrawn.

## Verification

The focused archive-only tests use a database double that raises on any access to
`reports_archive`, `reports_anon` or `report_counts`, and an LLM double that raises on any family
model call. They cover the entrypoint, downstream public-derived steps, fail-closed configuration,
and owner lifecycle. Full Python/web/i18n/lint/build gates remain required before deployment.

Before distribution, read-only production verification must confirm there are no real
questionnaire projections or nonzero family report buckets. A normal pipeline run must log
`family_report_processing=false`, return `family_reports.mode=archive_only`, and contain no new
`purpose=anonymise` call.

### Live pre-distribution verification (30 August 2026)

The audit found 12 withdrawn synthetic/test archive rows, zero `reports_anon` rows and zero public
submission activity. It also found legacy synthetic derived residue from pre-assessment testing:
two report-count buckets, one report timeline row, one form entity/event, three obsolete site-stat
rows and 15 affected place-status snapshots. Those exact derived rows were removed transactionally;
the raw archive rows/files were retained.

A complete public-source rebuild then ran with `family_report_processing=false`. Step ⓪ reported
`read=0`, `written=0`; report place resolution/report counts were skipped as archive-only;
finalisation processed zero archive rows; all model calls were public purposes. The post-run health
tripwire reported `reports_anon=0`, `report_counts=0`, 20 public-source stats, 11,189 external-source
entities and overall `OK`.

## Re-enablement rule

Turning the flag on is not an operational rollback. It is a new programme requiring a named data
controller and authorised receiver, recorded consent, processor/retention/withdrawal design,
private operator workflow, disclosure controls, corrected UI, staging tests and an independent
security/privacy review. Code structure is retained only to avoid a premature schema migration.
