# 00 — ⓪ anonymise (`processing/anonymise.py`)

```
   reports_archive                                   raw_pulls (source_id = opmcm_person_reports)
   where anonymised_at is null                       where projected_at is null and unchanged = false
     and withdrawn_at is null                        (newest 5; the newest is projected)
     and status = 'received'                                   │
   order by created_at, limit 200                              │
        │                                                      ▼
        ▼                                            locationText ─▶ gazetteer.resolve()
   build_user_prompt(row, gazetteer)                            │
   (respondent_type, lang, submitted_at, form place,            ▼
    "contact field given: yes|no", GAZETTEER IDS,     figures 'OPMCM portal' <type>_reports
    REPORT TEXT)                                        scope place:<id>          (per place)
        │                                               scope place:<id>|status:<s>
        ▼                                               as_of = fetched_at of the pull
   lib.llm.complete_json("anonymise", …)                note "process_data ⓪ projection"
   gpt-4o-mini · strict json schema · max 1200 tokens           │
        │                                                       ▼
        ├─ dict ─▶ to_anon_row()                      raw_pulls.projected_at = now (all 5)
        ├─ None + budget left  ─▶ skip (retry next run)
        └─ None + budget gone  ─▶ fallback_extraction()  (no free text at all)
        ▼
   reports_anon (upsert on id)                reports_archive ← anonymised_at = now,
                                                              status = 'anonymised',
                                                              summary_public = <one line>
```

## The extraction schema (`RESPONSE_FORMAT`, strict, every key required)

| public field | type | note |
|---|---|---|
| `subject_count` | int \| null | how many people the report is about |
| `place_text` | string \| null | place as written/translated, no names |
| `place_id` | string \| null | one of the gazetteer ids listed in the prompt |
| `event_time` | ISO 8601 \| null | last contact / presence (`+05:45` for Nepal) |
| `status` | enum | `missing` `reported_safe` `rescued` `seen` `deceased` `unknown` |
| `nationality`, `sex`, `purpose`, `travel_mode`, `operator`, `employer_project` | string \| null | |
| `age_band` | enum \| null | `0-17` `18-39` `40-64` `65+` |
| `reported_to` | string[] | authorities already contacted |
| `text_redacted` | string | original with `[name]` `[phone]` `[id]` `[email]` placeholders |
| `text_en` | string | English translation of `text_redacted` |
| `summary_public` | string | ONE line, e.g. `1 person · last at Timure · 26 Aug ~08:00 · group of 12 with an agency · phone number given` |
| **`private`** | `{names[], phones[], passports[], emails[]}` | **used only for hashing, then dropped** |

## Private object → hashes → dropped (`to_anon_row`)

1. `person_key` = first of: `sha256("phone:" + E.164 phone)` from `private.phones`;
   `sha256("passport:" + …)` from `private.passports`; `sha256("name:" + name_key + "|" + age_band + "|" + nationality)`
   from `private.names[0]` (+ `age_band` mapped to a representative age); for a `survivor`
   report with no other key, the form's `contact` phone.
2. `group_key` = `lib.text.group_key(operator, employer_project)`.
3. `place_id` = model's id if it exists in the gazetteer, else the form's picked place, else
   `gazetteer.resolve(place_text)`.
4. Every free-text field (`place_text`, `text_redacted`, `text_en`, `summary_public`,
   `operator`, `employer_project`, and the same keys inside `extracted`) passes through
   `lib.text.redact_pii(text, names)` — phones, e-mails, passport-like ids and every name the
   model listed (and each ≥ 4-char token of it) become placeholders. The raw text is **never**
   copied into `reports_anon`, even when the model returns no `text_redacted`.
5. `private` is not stored anywhere; `extracted` = the model output minus `private`.

Written row: `id = archive_id = reports_archive.id`, `created_at`, `lang`, `respondent_type`,
`supersedes`, `person_key`, `group_key`, `place_id`, `place_text`, `event_time`, `status`,
`subject_count`, `nationality`, `age_band`, `sex`, `purpose`, `travel_mode`, `operator`,
`employer_project`, `reported_to`, `extracted`, `text_redacted`, `text_en`,
`model = "gpt-4o-mini/anon-v1"` (or `"fallback"`). `summary_public` goes to `reports_archive`
only (the owner's "We understood" line).

## Fallback and skip

- `llm.can_call()` false (budget exhausted or per-run cap) → `fallback_extraction`: `place_id`
  from the form or aliases, `status = unknown`, **`text_redacted = text_en = None`** (regexes
  cannot find names, so no free text leaves ⓪), `summary_public = "Report received · <place> ·
  <day> · awaiting extraction"`, `model = "fallback"`. The row is still marked anonymised so the
  folder shows progress.
- model call fails while budget remains (API/network) → `skip`; the row stays `received` and is
  retried next run.

## OPMCM projection

`project_opmcm` reads the newest un-projected `raw_pulls` body (inline or from Storage via
`storage_download`), which already is the keyed projection produced by `prestore()`; a row
that still carried `fullName`/`images` would be logged `anonymise.opmcm_unstripped_row` and
ignored. Counts per resolved place go to `figures` with scopes `place:<id>` and
`place:<id>|status:<s>`; unresolved rows are counted in the summary only. Items are cached in
`ctx.cache["opmcm_items"]` for ② and ⑥.

## Inputs → tables → outputs

| inputs | writes | log events |
|---|---|---|
| `reports_archive`, `places` (gazetteer), OpenAI | `reports_anon` (insert/upsert), `reports_archive` (bookkeeping + `summary_public`) | `anonymise.report` (report id, how, place, status — never text) |
| `raw_pulls` (OPMCM) | `figures`, `raw_pulls.projected_at` | `anonymise.opmcm_projected` |

## Failure behaviour

`run()` wraps the two halves separately (`anonymise.reports_failed`, `anonymise.opmcm_failed`);
either returns `{"error": …}` and ① still runs. A Storage download failure logs
`anonymise.storage_download_failed` and leaves `projected_at` null for a retry. `--dry-run`
logs `anonymise.dry_run` per report and writes nothing (the LLM is still called — use it
sparingly).

## Withdrawn reports

`retract_withdrawn()` runs first in ⓪: every `reports_archive` row with `withdrawn_at` set has its
`reports_anon` row deleted (batches of 50 ids), so a withdrawal made after processing leaves RAW on the
next run and the ledger/stats follow. The archive row itself is never deleted (soft withdraw).


## Attachments (since 30 Aug)

Reports may carry files (`report_files` → bucket `report-media`). Step ⓪ never opens them: only the text is sent to
the model; the number of files per report may be projected as a count later. Files stay in ARCHIVE with the report.
