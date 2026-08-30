# 01 · Architecture

Family intake is archive-only. The form stores the original row/files under owner RLS and writes
a separate activity counter row, but the web app never waits for or presents a processing result.
`process_data` does not read questionnaire rows, so every public place/status/digest value comes
from public sources. `reports_anon` and `report_counts` remain reserved schema, not live inputs.

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
| DERIVED (public) | `figures_latest`, public-source `place_status` / `place_timeline`, `stats`, `v_gauges_latest`, `v_articles_recent`, `v_live_counts`, `event_timeline`, `digest` | none |
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

## About & Sources copy (30 Aug)

`/about` gained a card "The corridor animation" (keys `about.sim_*`) stating that the flood simulation is illustrative,
that its clock follows the recorded front, that the lake volume and the bridges come from published figures
(China MWR, HOT OSM survey) and that nothing is a forecast; "Data handling" has six checks (5: 60 sources across six
groups, quoted figures never headline; 6: the per-place "now" line is built from counts/publishers/titles only —
both verified against `pipeline/processing/place_now.py` and `pipeline/docs/process_data/04-figures-latest.md`).
`sources.sub` names the 60 registered sources and explains "derived" rows.


## Navigation (30 Aug, docs/17)

```
  Header: logo · LIVE · language · Share (desktop) / More (phones: Sources · About · My folder · share pills)
  TabBar "top" (≥ md): Home · Numbers · Places · Latest ……… Sources · About · My folder
  TabBar "bottom" (< md, fixed): Home · Numbers · [＋ Add] · Places · Latest   (safe-area padding, 56 px rows)
  Pages: /  /numbers  /places  /places/{id}  /latest  /sources  /about  /report  /me  /run
```
