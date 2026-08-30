# 07 · My Info — the private device archive

`/[lang]/me` is an owner-only management view over the anonymous browser session.

```text
ensureSession()
    ├─ getOwnReports() → minimum reports_archive metadata under RLS
    ├─ listReportFiles() → owner-only report_files
    └─ getOwnUser() → optional folder contact
```

## What is shown

- respondent type, selected place label and submission time;
- a fixed statement that the original is stored privately and not analysed/published/shared;
- attachment names/sizes with owner-authorised signed URLs;
- correction/add-more links;
- lifecycle: `Received`, or `Received → Withdrawn`.

The query intentionally does not retrieve raw report text, report contact, `summary_public` or
`anonymised_at`. Legacy processing status values remain in the TypeScript union because the schema
is unchanged, but archive-only UI never presents Anonymised/Processed/Matched states.

## Withdrawal

The owner can set `withdrawn_at`; the database trigger forces `status='withdrawn'` and rejects any
other report edit. The row and files remain private. The confirmation and status line explicitly
say that withdrawal blocks future review/processing/handoff and is not deletion.

## Other retained behavior

- “Add more detail” and “Correct this” create a new report linked with `supersedes`.
- “Keep this folder” continues to store optional contact on the owner `users` row.
- The home-page “Your part” count reads the owner's rows and excludes withdrawn records.
- A lost/cleared anonymous session still loses access to the folder under the existing auth model.

## States

| State | UI |
|---|---|
| loading | “Opening your folder…” |
| no rows | empty state + Add action |
| active | Received |
| withdrawn | Received → Withdrawn; actions hidden |
| unavailable | configuration/session error state |
