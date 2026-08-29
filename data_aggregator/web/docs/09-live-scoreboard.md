# 09 · Live scoreboard

people here now · contributions last 10 min · contributions today · minutes since last data pull · AUTO-REFRESH EVERY 4 H.

```
  server (ISR)   getLiveCounts() → v_live_counts { submissions_10m, submissions_today, submissions_total, last_pull_at, last_processed_at }
        │ initial props
        ▼
  <Scoreboard> (client, components/blocks/Scoreboard.tsx)
        ├─ joinPresence(sb, onCount, onError)      Realtime Presence channel "site"   → people here now
        │      onError (CHANNEL_ERROR / TIMED_OUT / CLOSED / free-tier cap) → the cell hides itself
        ├─ watchSubmissions(sb, onInsert)          Realtime postgres_changes INSERT on submissions_log → +1 to 10m/today/total
        ├─ setInterval 60 s  getLiveCounts(sb)    v_live_counts re-read → authoritative values, resets local increments
        └─ setInterval 30 s  now                  re-renders "N MIN" since last_pull_at
```

## 1. Cells

| Cell | Source | Format |
|---|---|---|
| people here now | presence key count on `site` | Press Start 2P, amber; hidden on presence error or when Supabase is unconfigured |
| contributions · last 10 min | `submissions_10m` + local inserts | amber |
| contributions today | `submissions_today` + local inserts (Nepal-day boundary is the view's) | amber |
| since last data pull | `fmtSinceArcade(last_pull_at)` → `4 MIN` / `2 H 14 MIN` | green (`#7ee2a8`); amber when older than `STALE_AFTER_MINUTES`; "—" + "no pull yet" when null |
| AUTO-REFRESH | `refreshLabel(PULL_INTERVAL_MINUTES)` → `EVERY 4 H` / `EVERY 15 MIN` | Latin only, dim |

Digits and the "MIN"/"H" suffixes are Latin in every language (the arcade font has no Devanagari).

## 2. Presence (`lib/presence.ts`)

- Key per browser tab from `sessionStorage` (`nft_presence_key`), so one person with two tabs counts twice at most
  and a reload keeps the same key.
- `track({ at })` after `SUBSCRIBED`; `presenceState()` keys are counted on every `sync`.
- Supabase free tier caps concurrent Realtime connections; when the cap is hit the channel errors and the cell
  disappears — the contribution counters keep working from the 60 s poll (confirmed design decision).

## 3. Realtime inserts

`submissions_log` is in the `supabase_realtime` publication (`db/migrations/005_realtime_storage.sql`) and is
public-select, PII-free (`respondent_type`, `lang`, `created_at` only). Each INSERT event bumps the counters locally;
the next poll replaces them with the view's numbers.

## 4. Degradation matrix

| Situation | Result |
|---|---|
| no env | all cells "—", "people here now" hidden, AUTO-REFRESH still shown |
| Realtime blocked (corporate proxy) | counters update every 60 s only |
| presence cap | "people here now" hidden |
| pipeline down | "since last data pull" turns amber past 6 h; the layout's StaleBanner appears |
