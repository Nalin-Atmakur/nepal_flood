# 01 · Architecture

The site is a thin, mostly static reader of the database plus three client islands (scoreboard, 3D corridor,
report box). Nothing is computed on the server that the pipeline has not already written.

```
  browser ──GET /ne/places/timure──▶ proxy.ts (no-op: already /{lang})
                                        │
                                        ▼
                     app/[lang]/layout.tsx  ── getLiveCounts() ──▶ v_live_counts   (stale banner, footer stamp)
                                        │
                                        ▼
                     app/[lang]/places/[id]/page.tsx (ISR 300 s)
                        ├─ getPlace(id)            ──▶ places
                        ├─ getPlaceStatus(id)      ──▶ v_place_status_latest
                        ├─ getPlaceTimeline(id)    ──▶ place_timeline
                        ├─ getArticlesForPlace(id) ──▶ v_articles_recent
                        └─ getPlaces()             ──▶ places (neighbours by km)
                                        │
                                        ▼
                     HTML + tiny client islands (LangToggle, AuthBootstrap, Scoreboard, CorridorIsland …)
                                        │
   client ◀────────────────────────────┘
     ├─ AuthBootstrap: signInAnonymously → users upsert          (docs/04)
     ├─ Scoreboard:   presence "site" + INSERT on submissions_log (docs/09)
     └─ TheBox:       insert reports_archive + submissions_log    (docs/06)
```

## Zones the browser can see

| Zone | Tables / views the anon key may read | Writes allowed |
|---|---|---|
| Reference | `places`, `sources`, `v_sources_status` | none |
| DERIVED (public) | `figures_latest`, `place_status` / `v_place_status_latest`, `place_timeline`, `stats`, `report_counts`, `v_gauges_latest`, `v_articles_recent`, `v_live_counts`, `event_timeline`, `digest` | none |
| ARCHIVE (own rows) | `users` (own), `reports_archive` (own) | insert own report; set `withdrawn_at`; update own `users.lang/contact`; insert `submissions_log` |

Everything else (raw pulls, `reports_anon`, `entities`, `figures`, `articles` bodies) is service-role only and is
never queried from `web/` — `lib/queries.ts` is the complete list of reads.

## Rendering model

1. **Server components** (`app/[lang]/**/page.tsx`) call `lib/queries.ts` and render with `revalidate = 300`
   (ISR). `generateStaticParams` prebuilds the three languages and every place page at build time; new places
   render on demand and are then cached.
2. **Layout** (`app/[lang]/layout.tsx`) loads fonts via `next/font/google`, reads `v_live_counts` once for the stale
   banner and footer stamp, and mounts `AuthBootstrap` + Vercel Analytics.
3. **Client islands** are the only places `browserClient()` is used: `Scoreboard`, `CorridorIsland` (→ `CorridorScene`),
   `PlacesTable` (search only), `ShareBar` (clipboard), `LangToggle`, the report flow and `MyFolder`.
4. **Unconfigured mode**: when `NEXT_PUBLIC_SUPABASE_*` are missing every query returns `null` and every block renders
   its `EmptyState`; `npm run build` must pass in that mode.

## Adding a block (numbered)

1. Add the read to `lib/queries.ts` with a typed row (never query a table that is not in the list above).
2. Create `components/blocks/<Name>.tsx` — a server component unless it needs the browser; give its root
   `data-block="<name>"` and, for home sections, `data-n="0N"`.
3. Render `EmptyState` when the read returns `null` or `[]`, with the one action that fills it.
4. Add copy keys to `messages/en.json`, `ne.json`, `hi.json`; run `npm run i18n:check`.
5. Compose it in `app/[lang]/page.tsx` in design order; add the block to `tests/e2e/smoke.spec.ts`.
6. Document it in `docs/05-home-blocks.md`.

## Files

- `proxy.ts` — locale redirect (Next 16 name for middleware).
- `app/[lang]/layout.tsx` · `page.tsx` · `report/` · `me/` · `places/` · `places/[id]/` · `sources/` · `about/` · `not-found.tsx`.
- `app/api/og/route.tsx` — share card.
- `lib/` — see README table.
