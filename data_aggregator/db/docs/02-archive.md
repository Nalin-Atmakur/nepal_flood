# 02 · ARCHIVE zone — `001_archive.sql`

Verbatim data that may contain personal information. The website writes a visitor's own questionnaire rows/files; `pull_external_data` writes separate raw response bodies. Owners read minimum metadata for their own rows. Although the service role can bypass RLS, archive-only `process_data` never selects questionnaire rows.

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

   process_data.py ──X──► reports_archive
   rows remain status='received', anonymised_at=null, summary_public=null
```

The website never calls OpenAI and has no privileged path. Model availability is irrelevant to questionnaire intake because the row is permanently archive-only.

## `users`

One row per auth user, upserted on first visit. `id` is `auth.uid()`. `lang` is the last chosen language, `fingerprint` a hashed device hint, `contact` optional and user-supplied (so the folder can be recovered elsewhere). Owner may insert, select and update own row (`users_self_*`).

## `reports_archive`

One row per submission; the box text verbatim plus the two optional fields (`place_id`, `contact`) and an optional `photo_path`.

Current status trail, as shown on `/me`:

```
   received ──► withdrawn   (set by the owner via the trigger)
```

The other enum values remain for dormant legacy compatibility. Corrections and "add more" are new rows with `supersedes = <old id>`; automated code does not interpret the chain. There is no delete for users.

The owner's only permitted update is a withdrawal: `update reports_archive set withdrawn_at = now() where id = …`. The trigger discards every other change and stamps `status = 'withdrawn'`. The row/files remain private; withdrawal means they must not be reviewed, processed or handed off later and is not deletion.

`summary_public` and `anonymised_at` are reserved legacy columns and remain null in archive-only mode.

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
| `reports_archive_pending_idx (created_at) where anonymised_at is null` | reserved legacy index; all active archive-only rows intentionally qualify |
| `raw_pulls_source_idx (source_id, fetched_at desc)` | "previous pull for this source" hash comparison |
| `submissions_log_created_idx (created_at desc)` | the 10-minute and today windows |

Next: `03-raw.md`.
