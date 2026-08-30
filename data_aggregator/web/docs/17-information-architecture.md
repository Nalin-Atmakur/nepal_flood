# 17 · Information architecture — a site a first-time visitor can hold in one hand (30 Aug)

Owner's brief: the home page had become one enormous scroll (scoreboard, digest, corridor, six stat cards, a
five-agency table, the first-hours timeline, a places table, four CTAs, seven gauge tiles, headlines, share bar).
A non-technical first-time visitor was overwhelmed. Three goals decide everything: **go viral**, **be the aggregated
source of truth/updates**, **collect as much data as possible**.

## 1. The rules applied

| rule | how it shows up here |
|---|---|
| First viewport must answer *what is this · what happened · what do I do* | header (what) → Right now strip (what happened) → Your part / the corridor (what do I do) |
| One primary action per screen | Home: **Add what you know**. Numbers/Places/Latest: read. `/report`: Send. |
| Progressive disclosure | Home shows the headline; every deeper view is one tap away in its own tab |
| 5 ± 2 navigation items | Home · Numbers · Places · Latest · More (More = Sources, About, My folder, Share, language) |
| Recognition over recall | tabs are nouns people already use ("Numbers", "Places", "Latest"), in the glossary's words (`03-i18n.md`) |
| No jargon on Home | "ledger", "sitrep", "publisher" never appear on Home; the strip says "out of contact", "rescued", "as of" |
| Thumb reach on phones | a fixed bottom tab bar (44 px targets, safe-area padding), the primary action in the strip's first viewport |
| Consistency | every page keeps the same header, official-channels bar, footer; the corridor block is unchanged |

## 2. Sitemap

```
  /{lang}                  HOME — three things, nothing else
  │   1 Right now          NDRRMA dead · out of contact · rescued (as of) + today's headline + tiny live counters
  │   2 The corridor       the simulation (unchanged)
  │   3 Your part          this device's contribution + [Add what you know →]
  │
  ├── /numbers             NUMBERS — the numbers, side by side (+ sparklines) · what happened, in numbers · the first hours
  ├── /places              PLACES — the ledger table with search · by district · /places/{id}
  ├── /latest              LATEST — what changed today (full digest) · headlines · river & weather · live counters
  └── More
      ├── /sources         every source we pull (+ what was extracted)
      ├── /about
      ├── /me              my folder
      ├── Share            (native sheet / pills)
      └── language         EN · नेपाली · हिन्दी
  /report                  the one-box form (reached from Your part, the bottom bar's centre button, place pages)
```

Old URLs all still work (`/places`, `/sources`, `/about`, `/report`, `/me`, `/run`); two pages are new (`/numbers`,
`/latest`). Nothing was deleted — every block moved to the tab where a person would look for it.

## 3. First visit, storyboard (phone, 390 px)

```
 ┌──────────────────────────────┐
 │ ◎ Nepal Flood Tracker  LIVE  │  what is this (name, "volunteer-run · not an official source")
 │ EN नेपाली हिन्दी    Sources… │
 │ Police 1155 · … (official)   │
 ├──────────────────────────────┤
 │ RIGHT NOW · 30 Aug           │  what happened — three numbers a carrier can repeat, with their source and time
 │ 675 dead · 2,498 out of      │
 │ contact · 7,514 rescued      │
 │ NDRRMA · as of 29 Aug 18:30  │
 │ "Day 4 after the flood — …"  │  today's one-line headline (from the digest) → tap for Latest
 ├──────────────────────────────┤
 │ 01 THE CORRIDOR              │  the hook: the breach auto-plays, the visitor watches, drops a house, shares
 │ ▶ ……… (60 vh) ………            │
 ├──────────────────────────────┤
 │ YOUR PART                    │  what do I do — the ask, big button
 │ You haven't added anything.  │
 │ [ Add what you know → ]      │
 └──────────────────────────────┘
 ▌ Home · Numbers · Places · Latest · More ▐   fixed bottom bar
```

Why Your part sits **below** the corridor, not above it: the corridor is the viral hook and the first scroll must
land on it; the strip already carries a one-line "add what you know" link, and the full amber card arrives exactly
when the visitor has seen what happened and is most likely to answer the ask. Desktop shows all three without
scrolling at 1280 × 900.

## 4. What moved where

| block | was | now |
|---|---|---|
| Scoreboard (people here now · contributions · since last pull) | Home top | Latest (top) · a two-number miniature in the Right-now strip |
| What changed today (digest card) | Home | Latest (full) · its headline in the Right-now strip |
| The corridor | Home 01 | Home 2 (unchanged) |
| What happened, in numbers (stat cards) | Home 02 | Numbers |
| The first hours (timeline) | Home 03 | Numbers |
| The numbers, side by side (+ sparklines) | Home 04 | Numbers (first) |
| Places table (top 12) | Home 05 | Places (all, with search) |
| Add what you know (4 CTA cards) | Home 06 | dropped — the ask is Your part; the four respondent cards live on `/report` |
| River & weather | Home 07 | Latest |
| Latest headlines | Home 08 | Latest |
| Share bar | Home bottom | header Share (native sheet on phones) |
| Your part | Home top | Home 3 |

## 5. Components

- `components/blocks/RightNow.tsx` (server): the strip — three figures via `pickFigure(figures, AGENCIES[0].publishers, …)`,
  as-of, the digest headline (link to `/latest`), two live counters from `v_live_counts`, and a text link to `/report`.
  Empty data → the dashed empty state with "retrying every {cadence}".
- `components/blocks/TabBar.tsx` (client): the five tabs; desktop = a row under the header (`≥ md`), phones = fixed
  bottom bar with `env(safe-area-inset-bottom)`; active tab from `usePathname()`; the centre "Add" button on phones is
  the primary action (ultramarine). `aria-current="page"` on the active tab.
- `app/[lang]/numbers/page.tsx`, `app/[lang]/latest/page.tsx`: server pages composing the existing blocks.
- Header: desktop nav = the tab row (Home · Numbers · Places · Latest) + More (Sources · About · My folder · Share);
  phone header keeps logo + LIVE + language; Sources/About move into More.
- `layout.tsx`: `pb-[72px] md:pb-0` on the page wrapper so the bottom bar never covers content.

## 6. Verify

`npm run e2e`: Home renders exactly `[data-block="right-now"]`, `[data-block="corridor"]`, `[data-block="yours"]` and
no other `data-block`; `/numbers` renders side · stats · first-hours; `/latest` renders scoreboard · digest · latest · river;
the tab bar has five links with one `aria-current`. Screenshots at 390/1280 in the report.
