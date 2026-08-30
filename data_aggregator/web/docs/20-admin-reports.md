# 20 · The hidden raw-reports page — `/admin/reports`

Owner's brief (30 Aug 18:40): *"a password gated hidden page to see all the raw report data (store password on
server so it can't be accessed)"*. Since the archive-only intake (commit 0e93679) nothing reads submissions
automatically; this page is how the volunteer team looks at them and hands them on.

```
  browser ── GET /admin/reports ─────────────▶ page.tsx (server, force-dynamic, noindex)
                                                  │ cookie nft_admin valid?  ── no ──▶ password form (server action `login`)
                                                  │                                          │ ADMIN_PASSWORD matches (constant-time)
                                                  │                                          ▼ set httpOnly cookie = expiry.hmac(expiry, key(password))
                                                  ▼ yes
                                              data.ts  ── service-role client ──▶ reports_archive (all columns, newest 500)
                                                                                    report_files → signed URLs (1 h) from the private bucket
  browser ── GET /admin/reports/export ───────▶ route.ts: same cookie check → CSV of up to 5,000 rows
```

## What is where

| piece | file | notes |
|---|---|---|
| gate | `lib/admin-auth.ts` | `checkPassword` (sha256 both sides, `timingSafeEqual`), `signToken` / `verifyToken` (HMAC-SHA256 keyed by sha256 of the password; 12 h), refuses to sign when the password is under 12 characters |
| session | `app/admin/reports/actions.ts` | server actions `login` (400 ms fixed delay, cookie `nft_admin`: httpOnly · secure · SameSite strict · path `/admin`) and `logout` |
| data | `app/admin/reports/data.ts` | `fetchRawReports` via `adminClient()` (service role — `lib/supabase.ts`), `toCsv` |
| page | `app/admin/reports/page.tsx` | form ⇄ list; withdrawn rows marked, never hidden; contact and text verbatim |
| export | `app/admin/reports/export/route.ts` | `text/csv`, `Content-Disposition: attachment`, `no-store` |
| layout | `app/admin/layout.tsx` | its own root layout: no site chrome, `robots: noindex` |
| exclusions | `proxy.ts` matcher, `app/robots.ts` | not redirected to `/{lang}/…`, disallowed for crawlers |

## Secrets

- `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` live only in the Vercel project environment (Production) and in
  each developer's gitignored `web/.env.local`. Neither is ever in the repo, the client bundle, or a log.
- Rotating the password (`vercel env rm ADMIN_PASSWORD production && vercel env add …`) invalidates every session
  at once, because tokens are keyed by it.
- The page is not linked from anywhere. Obscurity is not the protection — the password is — but it keeps the
  route out of casual view.

## Tests

- `tests/admin-auth.test.ts`: exact-password only; tokens verify until expiry; a token dies when the password changes; no signing under 12 characters.
- `tests/e2e/admin.spec.ts`: the route is not locale-redirected; only the form is served; export is 401 without a session; a wrong password re-shows the form; the local `.env.local` password opens the archive and the CSV.

## Handing data on

CSV export → the official channel the team is arranging (About: Nepal Police / MoFA). Contacts are in the file:
treat it like the archive itself.
