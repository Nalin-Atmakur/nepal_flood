# 06 · Report flow — private archive intake

`/[lang]/report` stores what the visitor submits and does not feed it into the automated/public
pipeline.

```text
WhoAreYou + TheBox + optional place/contact/files
                 │
                 ├─ reports_archive  original form under owner RLS
                 ├─ report-media     original files in private owner folder
                 └─ submissions_log  type/language activity event only
                                      │
                                      ▼
                         immediate private-storage receipt
```

## Submission

`TheBox.send()` keeps the existing validation, honeypot, client rate limit, microphone dictation,
anonymous Supabase session, fingerprint, correction link and upload behavior. It inserts:

- `reports_archive`: owner, language, respondent type, original text, optional selected place,
  optional contact, fingerprint and optional `supersedes` id;
- `report-media` + `report_files`: up to ten original files, owner-only;
- `submissions_log`: respondent type/language for the deliberately retained public activity count.

The activity row never contains report text, contact, selected place, file data or report id.

## Receipt

`Understood` does not poll `summary_public` and has no timeout. It immediately says that the
original was stored privately and is not analysed, summarised, published or automatically shared.
Attachment successes/failures, Correct, Add more, Share and My Info actions remain available.

Corrections/additions are new archive rows linked by `supersedes`; no automated code interprets
the chain. The selected place is stored as supplied and is not joined to the public map.

## Processing boundary

With `FAMILY_REPORT_PROCESSING_ENABLED=false`, `process_data` never selects questionnaire rows,
constructs a family prompt or writes a family-derived object. Reports remain `status='received'`,
`anonymised_at=null`, `summary_public=null`; this is the intended steady state.

OpenAI may still process public news/public-source summaries elsewhere in the pipeline. It never
receives form fields or attachments. Browser microphone behavior remains a browser/OS feature and
is not part of the application pipeline.

## Withdrawal and retention

Withdraw is a soft archive state. The owner update sets `withdrawn_at`; the database trigger sets
`status='withdrawn'`. Text and files remain privately stored. The UI states that withdrawal is not
deletion and means the record must not be reviewed, processed or handed off in the future.

## Tests

- Web archive-only tests cover Received/Withdrawn state.
- Message tests enforce EN/NE/HI key/placeholder parity.
- Pipeline archive-only tests prove no family table/model access and no family-derived writes.
- Upload tests continue to cover file classification, names, paths and limits.
