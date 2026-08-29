# 12 · Deploy

```
  git push ──▶ (no CI yet)        vercel --prod ──▶ Vercel project "nepalfloodtracker" ──▶ https://nepalfloodtracker.com
                                       │                                                    https://nepalfloodtracker.vercel.app
                                       ├─ env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel dashboard)
                                       ├─ build: npm run build (Next 16, Turbopack) — ISR pages + /api/og (Node)
                                       └─ analytics: @vercel/analytics (<Analytics/> in the layout)
```

## 1. Before deploying (numbered, all must be green)

1. `npm run lint`
2. `npm run i18n:check`
3. `npm test`
4. `npm run build` — with `.env.local` present
5. `NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run build` — without env (every block must fall back to its empty state)
6. `npm run e2e` — after step 4 (Playwright starts `npm run start` itself)

## 2. Deploy (numbered)

1. Commit code and docs; never `.env*`, `.next/`, `node_modules/`, `test-results/`.
2. From `web/`: `vercel --prod --yes` (the folder is linked; `.vercel/project.json` is git-ignored).
3. Verify: `curl -I https://nepalfloodtracker.com/en` → 200; `/ne`, `/hi` → 200; `/` → 307 to a language;
   `curl -s -o /dev/null -w "%{content_type}" "https://nepalfloodtracker.com/api/og?lang=ne"` → `image/png`.
4. Open the home page on a phone: scoreboard ticks, corridor renders (or the fallback on a slow connection),
   the stale banner reflects the last processed run.

## 3. Environment

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Vercel | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Vercel | anon key — public by design; RLS limits it (docs/04) |

Nothing else is needed. The pipeline cadence lives in code (`lib/config.ts` → `PULL_INTERVAL_MINUTES`): change it
together with the crontab, rebuild, redeploy — copy ("AUTO-REFRESH EVERY 4 H", "within 4 hours") and the stale
threshold follow automatically.

## 4. Caching

- Pages: ISR `revalidate = 300` (about: 3600). Place pages are prebuilt for every gazetteer id; new ids render on demand.
- `/api/og`: `Cache-Control: max-age=300, s-maxage=300` — previews refresh within five minutes.
- Live counters bypass ISR (client island, docs/09).

## 5. Local gotchas

- On some macOS/Node 24 setups IPv6 DNS resolution to Supabase stalls; the npm scripts set
  `NODE_OPTIONS=--dns-result-order=ipv4first` for dev/build/start/e2e. Harmless on Vercel.
- `npx playwright install chromium` once before `npm run e2e`.
- Next 16 renamed `middleware.ts` to `proxy.ts` (export `proxy`) and deprecated the Edge runtime — both are already
  reflected in this tree; do not reintroduce `middleware.ts`.
- Supabase Realtime on the free tier caps concurrent connections; the "people here now" cell hides itself when that
  happens (docs/09) — not a deploy error.

## 6. Rollback

`vercel rollback` to the previous deployment, or redeploy the previous commit. Data is never touched by a deploy.
