# 04 · Auth and identity — "this device · no account"

Every visitor gets a stable anonymous identity so their reports and folder belong to them, without a login.

```
  first page load
      │
      ▼
  AuthBootstrap (client, in layout)
      ├─ sb.auth.getSession()            session in localStorage?  ──yes──▶ user id
      ├─ sb.auth.signInAnonymously()     no → new auth.users row (anonymous)
      └─ users.upsert({ id, lang })      own row (RLS: id = auth.uid())
      │
      ▼
  later: TheBox → ensureSession() again (cheap) → insert reports_archive { user_id = auth.uid() … }
         MyFolder → ensureSession() → select reports_archive where user_id = auth.uid()  (RLS)
```

## 1. What the browser holds

- A Supabase anonymous session (JWT + refresh token) in `localStorage`, managed by `@supabase/supabase-js`
  (`lib/supabase.ts` → `browserClient()` with `persistSession: true`).
- `nft_sends` — send timestamps for the rate limiter (docs/06).
- `nft_fp` — a random id used as a fingerprint only when `crypto.subtle` is unavailable.
- `nft_presence_key` (sessionStorage) — the presence key for "people here now" (docs/09).

No cookies are set by the site itself.

## 2. `ensureSession(sb, lang)` (`lib/supabase.ts`)

1. Read the current session; if none, `signInAnonymously()`.
2. Upsert `users { id, lang }` (`onConflict: "id"`) — this also keeps `users.lang` current when the visitor switches language.
3. Return the user id, or `null` when Supabase is unconfigured or anonymous sign-ins are disabled in the project.
   Callers show `report.err_unconfigured` / `me.unconfigured` in that case.

## 3. What the anonymous role may do (from `db/migrations/004_rls.sql`)

| Table | select | insert | update |
|---|---|---|---|
| `users` | own row | own row | own row (`lang`, `contact`) |
| `reports_archive` | own rows | own rows, `status='received'`, `anonymised_at is null` | own rows — the trigger allows **only** `withdrawn_at` to change and sets `status='withdrawn'` |
| `submissions_log` | all (counts only) | any signed-in user | — |
| public DERIVED + reference | all | — | — |

The browser never sees another visitor's report, and `reports_anon` / `entities` are invisible to the anon key.

## 4. "Keep this folder"

`MyFolder` → `saveContact(sb, userId, contact)` updates `users.contact`. Recovery on another device is a manual
process for the team (match `contact` + `fingerprint`); the site never displays contacts anywhere.

## 5. Failure behaviour

- Anonymous sign-in disabled → `ensureSession` returns null → report box shows the unconfigured error and points to
  the official channels bar; the folder shows `me.unconfigured`.
- Session expired → supabase-js refreshes silently; if refresh fails the next `ensureSession` creates a fresh anonymous
  user (old reports remain in the archive, tied to the old id — the team can rejoin them via fingerprint/contact).
