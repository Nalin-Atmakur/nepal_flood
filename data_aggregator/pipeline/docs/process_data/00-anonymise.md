# 00 — ⓪ archive boundary + OPMCM projection (`processing/anonymise.py`)

Family questionnaire processing is **off by default and fail-closed**.

```text
reports_archive                     FAMILY_REPORT_PROCESSING_ENABLED=false
      │                                           │
      └───────────────────────────────────────────┴── no SELECT, no projection,
                                                      no model call, no derived write

raw_pulls (public OPMCM source) ── minimise/project ──► public-source figures
```

## Archive-only contract

`process_data.py` resolves `FAMILY_REPORT_PROCESSING_ENABLED` after loading `pipeline/.env` and
stores it on `ProcCtx`. Missing, empty and unknown values resolve to `false`; only an explicit
`1`, `true`, `yes` or `on` enables the dormant path.

With the default `false` value, step ⓪:

- never selects `reports_archive`, including withdrawn rows;
- never constructs `build_user_prompt` or calls `complete_json("anonymise", …)`;
- never creates or updates `reports_anon`;
- never writes `summary_public`, `anonymised_at` or a processing status;
- reports `reports.mode = "archive_only"`, `read = 0`, `written = 0` in the run summary;
- still projects the separate public OPMCM source through `project_opmcm`.

A newly submitted questionnaire row therefore remains `status = 'received'`, with
`anonymised_at = null` and `summary_public = null`. A browser withdrawal changes it to
`status = 'withdrawn'`; the original row and files remain private. This is expected state,
not an OpenAI outage or processing backlog.

## Downstream enforcement

The same context flag blocks every later family path: report place resolution, form records in
deduplication, report inputs to the ledger and place summaries, archive-backed site statistics,
`report_counts`, and the final status updater. The browser's `submissions_log` is deliberately
separate: it records only that a submission occurred for the public activity counter.

## Public OPMCM projection

`project_opmcm` reads the newest unprojected `raw_pulls` body for the public OPMCM
person-reports API. The puller's `prestore()` step must already have removed `fullName` and
`images`; a row that still contains either is rejected and logged as
`anonymise.opmcm_unstripped_row`. Only place/type/status counts become `figures`, and the pull is
marked `projected_at` after a successful write.

## Dormant legacy path

The legacy extraction/redaction helpers remain in the module solely so a future authorised
programme does not require a schema rebuild. When explicitly enabled they retain their previous
behaviour: raw report text is sent to the configured model, a structured/redacted
`reports_anon` row is written, and archive bookkeeping advances.

Enabling this is not routine configuration. It requires a named controller and receiver,
recorded consent, accurate user copy, retention/withdrawal design, disclosure controls,
end-to-end tests and a new security review. The web experience must be changed in the same
release; it currently promises archive-only handling.

## Verification

`pipeline/tests/test_archive_only.py` uses a database double that raises on any access to
`reports_archive`, `reports_anon` or `report_counts`, plus an LLM double that raises on any call.
It verifies the default family entrypoints and downstream derived steps remain isolated while
the OPMCM/public-source path continues.

Attachments are never opened by the pipeline in either mode. They remain in the private
`report-media` bucket under the submitting user's folder.
