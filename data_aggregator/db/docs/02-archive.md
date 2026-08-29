# 02 · ARCHIVE zone — `001_archive.sql`

Verbatim data that may contain personal information. Two writers: the website (a visitor's own rows) and `pull_external_data` (raw response bodies). Two readers: the owner of a row, and `process_data` with the service key.

Tables: `users` · `reports_archive` · `raw_pulls` · `submissions_log` · `_migrations`. Columns: `docs/data-model.md` §2.

## The submission path

```
   browser, signed in anonymously (auth.uid() = the visitor's UUID)
        │
        │  supabase.from('reports_archive').insert({ user_id, lang, respondent_type, text,
        │                                             place_id?, contact?, fingerprint, supersedes? })
        ├──────────────────────────────────► reports_archive   status='received', anonymised_at=null
        │
        │  supabase.from('submissions_log').insert({ respondent_type, lang })
        └──────────────────────────────────► submissions_log   (public; Realtime → scoreboard)

   …next process_data run (≤ one cadence):

   reports_archive where anonymised_at is null and withdrawn_at is null
        │
        ▼
   ⓪ anonymise → reports_anon (RAW)          [03-raw.md]
        │
        └─► reports_archive.anonymised_at = now(), status = 'anonymised', summary_public = "We understood: …"
            later: status = 'processed' | 'matched'
```

The website never calls OpenAI and has no privileged path. If the model is down, the row waits in the archive for the next run; nothing is lost.

## `users`

One row per auth user, upserted on first visit. `id` is `auth.uid()`. `lang` is the last chosen language, `fingerprint` a hashed device hint, `contact` optional and user-supplied (so the folder can be recovered elsewhere). Owner may insert, select and update own row (`users_self_*`).

## `reports_archive`

One row per submission; the box text verbatim plus the two optional fields (`place_id`, `contact`) and an optional `photo_path`.

Status trail (`status` column), as shown on `/me`:

```
   received ──► anonymised ──► processed ──► matched          (set by process_data)
       │
       └──► withdrawn   (set by the owner via the trigger)      spam (set by process_data)
```

Corrections and "add more" are new rows with `supersedes = <old id>`; the anonymiser copies the flag and the ledger takes the latest. There is no delete for users.

The owner's only permitted update is a withdrawal: `update reports_archive set withdrawn_at = now() where id = …`. The trigger `reports_archive_guard` discards every other change and stamps `status = 'withdrawn'` (`05-rls.md`). Withdrawn rows are skipped by `process_data` and drop out of counts at the next run; the row is retained.

`summary_public` is the one PII-free column written back into this zone: the "We understood: …" line the success screen and `/me` show. `process_data` writes it; the owner reads it through `reports_own_select`.

## `raw_pulls`

The stored response body of every changed fetch. Registry sources (`sources.pii = true`) return names, so the whole table is service-only. Text bodies go in `body`; PDFs and images go to the `raw` bucket with the path in `storage_path`. `body_hash` lets the next pull detect "unchanged" without a normaliser run. `projected_at` marks that `process_data` ⓪ has projected the PII rows of that pull into anonymised RAW rows (counts by place/status/nationality, `person_key` hashes).

`raw_pulls` is created before `sources` (002), so `source_id` is a plain text column; `pulls.raw_pull_id` (RAW) points back at it.

## `submissions_log`

Deliberately tiny — `created_at`, `respondent_type`, `lang` — so it can be public and published on Realtime. It is the only ARCHIVE-zone table the public can read, and the only one anyone signed in may append to without ownership.

## `_migrations`

`filename`, `applied_at`, `checksum`. Written by `db/apply.py` after each successful file; read at the start of every run. RLS on, no policies, privileges revoked: only the Management API (role `postgres`) touches it. Details in `07-applying-migrations.md`.

## Indexes

| Index | Why |
|---|---|
| `reports_archive_user_idx (user_id, created_at desc)` | `/me` lists own rows newest first |
| `reports_archive_pending_idx (created_at) where anonymised_at is null` | the ⓪ queue is a partial index, so it stays small |
| `raw_pulls_source_idx (source_id, fetched_at desc)` | "previous pull for this source" hash comparison |
| `submissions_log_created_idx (created_at desc)` | the 10-minute and today windows |

Next: `03-raw.md`.
