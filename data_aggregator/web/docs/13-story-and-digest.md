# 13 · Story and digest — "The first hours" and "What changed today"

Two DERIVED tables from `db/migrations/006_story_and_digest.sql`, both public (anon select), feed two home blocks:
the reconstructed event timeline of 26 August (section 03) and the pipeline's daily "what changed" bullets
(an un-numbered dark card right under the scoreboard).

```
  db/seed (17 rows) ─▶ event_timeline ─┐                                   ┌─▶ blocks/FirstHours.tsx   03 The first hours
  process_data (append) ─▶            ─┤  lib/queries.ts                   │      splitTimeline()  → event day · later
                                       │   getEventTimeline()  ⋈ places ───┤      eventKindColors   → dot per kind
                                       │   getDigest(lang)     lang, en ───┤
  process_data ⑦ (per day × lang) ─▶ digest ─┘                             └─▶ blocks/Digest.tsx       What changed today
                                            normaliseBullets() · pickDigest()      hidden when there is no row
                                                        lib/story.ts (pure, vitest)
```

## 1. Contract

### `event_timeline` → `EventTimelineRow`

| Column | Used as |
|---|---|
| `id` | React key, `data-event` attribute |
| `at` (UTC) | sort key; the Nepal-time day (`nptDay`) decides "first" vs "later" — rows on or before `EVENT_DATE_ISO` are the first hours, anything after sits under the "Later" divider |
| `at_label` | the time chip, verbatim, Press Start 2P (Latin only: `08:37`, `28 Aug`) |
| `place_id` ⋈ `places` | place name via `localised(row, "place_name", lang)`; nothing when null |
| `what_en/ne/hi` | the sentence, current language with EN fallback |
| `kind` | dot colour and the accessible name (`event.kind.*`): trigger = live red · wave = flood red `#ec3013` · gauge = ink · warning = amber · impact = amber fill · response = confirmed green; anything else = dead-dot grey. `trigger` and `warning` also flip the time chip to amber-on-dark |
| `source`, `source_url` | tiny link labelled `source` (else the hostname); plain text when there is no URL |
| `km` | not rendered yet (reserved for placing dots on the corridor strip) |

Layout: one DOM, two layouts. Mobile = vertical ledger with a left rail; desktop (`md:`) = horizontal strip with a
top rail that scrolls sideways (`scroll-x`). Empty table → `EmptyState` with the retry rule.

### `digest` → `DigestRow`

| Column | Used as |
|---|---|
| `day` | the small date next to the label; only the **latest day** in the table is ever shown |
| `lang` | the row for the current language wins; else that day's `en` row (the card then carries `lang="en"` and "in English for now"); else the block renders nothing |
| `headline` | Baloo 800, 20/26 px |
| `bullets` jsonb | `normaliseBullets`: keeps `{text, kind, source_url}` objects with non-empty text, coerces unknown kinds to `news`, drops non-http URLs. Badge colours: figure = amber fill · place = ultramarine · gauge = confirmed fill · news = white |
| `computed_at` | "as of {t} NPT" |

There is deliberately **no empty state**: carriers must never read "nothing changed today".

## 2. Where the reads live

- `lib/queries.ts` → `getEventTimeline()` (one select with `places(name_en, name_ne, name_hi)` embedded, flattened to
  `place_name_*`), `getDigest(lang)` (fetches only `lang` + `en`, newest day first, and hands the rows to `pickDigest`).
- `lib/story.ts` → `splitTimeline`, `isEventKind`, `isAlarmKind`, `normaliseBullets`, `pickDigest` — pure, covered by
  `tests/story.test.ts`.
- `lib/tokens.ts` → `eventKindColors`, `digestKindColors`.
- Copy: `sec.first_hours*`, `event.kind.*`, `digest.*` in `messages/*.json` (`digest.label` is a Latin-only arcade label).

## 3. Adding an event (numbered)

1. Insert a row into `event_timeline` (service role; the anon key cannot write):
   `id` = slug (`t0837_collapse`), `at` in UTC, `at_label` as it should read in NPT (`08:37`, or `28 Aug` for later days),
   `place_id` from `places.id` or null, `kind` one of `trigger | wave | gauge | warning | impact | response`,
   `what_en` (required) plus `what_ne`/`what_hi`, `source` and `source_url`.
2. Keep numbers in `what_*` as Latin digits (site rule) and one sentence long — the cards are 236 px wide on desktop.
3. Nothing to deploy: the home page re-reads within `revalidate = 300` s. A row dated after 26 Aug (Nepal time) lands
   under "Later" automatically.
4. Check `npm run e2e` — the smoke test asserts ≥ 10 events with valid kinds in every language.

## 4. Writing a digest (pipeline side)

1. Upsert one row per `(day, lang)` with `bullets` as a JSON array of `{text, kind, source_url}` and a one-line `headline`.
2. Write EN first — it is the fallback for NE/HI until their rows exist.
3. An empty array with an empty headline hides the card for that language (and falls back to EN for that day).
