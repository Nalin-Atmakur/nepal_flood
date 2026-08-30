# web/ — nepalfloodtracker.com

The public Next.js site for the 26 August 2026 Bhote Koshi / Trishuli flood. It reads the DERIVED zone of the
Supabase database (filled by `pipeline/`), shows every official number next to its source, draws the corridor,
and takes "what you know" reports into the ARCHIVE zone through one box. Three languages (EN · नेपाली · हिन्दी),
no accounts, no names of affected people anywhere.

```
                       ┌──────────────────────────── Vercel ────────────────────────────┐
  visitor ───────────▶ │  proxy.ts  → /{lang}/…  (Accept-Language redirect)              │
                       │                                                                 │
                       │  app/[lang]/layout.tsx   fonts · Header · OfficialChannels ·    │
                       │                          StaleBanner · Footer · AuthBootstrap   │
                       │      ├─ page.tsx          home: Scoreboard · digest · 01 … 08   │
                       │      ├─ report/           WhoAreYou → TheBox → Understood       │
                       │      ├─ me/               My folder (own rows)                  │
                       │      ├─ places/ [id]/     table · place page                    │
                       │      ├─ sources/ about/   registry · about                      │
                       │  app/api/og/route.tsx     1200×630 share card (live numbers)    │
                       │                                                                 │
                       │  lib/queries.ts  ── every read ──▶  Supabase (anon key, RLS)    │
                       │  lib/reports.ts  ── own writes ──▶  reports_archive, submissions_log, users
                       │  lib/presence.ts ── Realtime ────▶  presence "site", INSERT on submissions_log
                       └─────────────────────────────────────────────────────────────────┘
                                          ▲ ISR 300 s                ▲ live (client islands)
                       DERIVED + reference tables ◀── pipeline/ (pull_external_data → process_data)
```

## 1. Run locally

1. `cd data_aggregator/web && npm install`
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (the anon key can only read public tables/views and write the visitor's own rows — see `db/migrations/004_rls.sql`).
   Without them every block renders its dashed empty state; nothing crashes.
3. `npm run dev` → http://localhost:3000 redirects to `/en`, `/ne` or `/hi` by Accept-Language.
4. `npx playwright install chromium` once, for the smoke tests.

## 2. Build and check

1. `npm run lint` — ESLint (eslint-config-next, strict React hooks rules).
2. `npm run i18n:check` — fails if `messages/{en,ne,hi}.json` differ in keys, placeholders or contain Devanagari digits.
3. `npm test` — Vitest: i18n fallback, share links, message parity, config, formatting, story helpers.
4. `npm run build` — must be green with and without `.env.local`.
5. `npm run e2e` — Playwright (chromium) against `npm run start`: home blocks in three languages, report flow,
   sources/about/places, `/api/og?lang=ne` → PNG, Accept-Language redirect.
6. `npm run fallback` — regenerates `public/corridor-fallback.png` (< 60 KB) if the scene changes.

## 3. Deploy

1. Commit (never `.env*`).
2. `vercel --prod` from `web/` (the project is linked; env vars are set in Vercel).
3. `curl -I https://nepalfloodtracker.com/en` → 200; `curl -s -o /dev/null -w "%{content_type}" https://nepalfloodtracker.com/api/og?lang=ne` → image/png.

## 4. Where things are

| Path | What |
|---|---|
| `app/[lang]/…` | one file per page, all server components, `revalidate = 300` |
| `app/api/og/route.tsx` | share card (`next/og`), numbers from `figures_latest` + `v_live_counts` |
| `components/ui/` | one file per primitive: Button · Pill · Chip · Card · Badge · LiveChip · SectionHead · StaleBanner · EmptyState · Table · Logo · DarkCard |
| `components/blocks/` | one file per home block + header/footer/share/scoreboard |
| `components/form/` | WhoAreYou · TheBox · PlacePicker · Understood · ReportFlow |
| `components/me/` | MyFolder |
| `components/three/` | `corridor-3d.ts` (design script ported to three r160) · `CorridorScene.tsx` |
| `lib/` | `queries.ts` (every read) · `reports.ts` (own writes) · `presence.ts` · `share.ts` · `i18n.ts` · `format.ts` · `config.ts` · `tokens.ts` · `corridor.ts` · `story.ts` · `places-search.ts` · `metadata.ts` · `supabase.ts` |
| `messages/` | `en.json` · `ne.json` · `hi.json` — identical keys, checked by `scripts/i18n-check.mjs` |
| `tests/` | Vitest unit tests · `tests/e2e/` Playwright smoke |
| `docs/` | numbered docs, one per concern (below) |

## 5. Docs

| # | File | Covers |
|---|---|---|
| 01 | [docs/01-architecture.md](docs/01-architecture.md) | request path, zones, ISR vs live islands, what reads what |
| 02 | [docs/02-design-system.md](docs/02-design-system.md) | tokens, Tailwind theme, type, shapes, states |
| 03 | [docs/03-i18n.md](docs/03-i18n.md) | routes, messages, fallback, the check script, Devanagari rules |
| 04 | [docs/04-auth-and-identity.md](docs/04-auth-and-identity.md) | anonymous sessions, `users`, RLS from the browser's side |
| 05 | [docs/05-home-blocks.md](docs/05-home-blocks.md) | every block: table/view it reads, empty state |
| 06 | [docs/06-report-flow.md](docs/06-report-flow.md) | who → box → listening → understood; writes; rate limit |
| 07 | [docs/07-my-folder.md](docs/07-my-folder.md) | own rows, status trail, withdraw, keep folder |
| 08 | [docs/08-places.md](docs/08-places.md) | /places, /places/[id], search, static params |
| 09 | [docs/09-live-scoreboard.md](docs/09-live-scoreboard.md) | presence, realtime inserts, polling, degradation |
| 10 | [docs/10-3d-corridor.md](docs/10-3d-corridor.md) | the port, data shaping, fallback PNG |
| 11 | [docs/11-og-and-share.md](docs/11-og-and-share.md) | OG route, fonts, share links, utm |
| 12 | [docs/12-deploy.md](docs/12-deploy.md) | Vercel, env, domain, local gotchas |
| 13 | [docs/13-story-and-digest.md](docs/13-story-and-digest.md) | "The first hours" timeline, "What changed today" digest, adding an event |
| 14 | [docs/14-flood-sim.md](docs/14-flood-sim.md) | the corridor flood simulation: sim maths, water mesh, objects, ride camera, clock, real bridges, tuning knobs |

## 6. Rules that hold everywhere

- Every number renders with its `as_of` and a source link. No blended figures.
- No names, phones or photos of affected people — the browser can only read PII-free tables and the visitor's own rows.
- Stale = amber banner; empty = dashed border with the one action that fills it; numbers are Latin digits in all languages.
- The pipeline cadence is one constant (`lib/config.ts` → `PULL_INTERVAL_MINUTES`) that drives copy and thresholds.
