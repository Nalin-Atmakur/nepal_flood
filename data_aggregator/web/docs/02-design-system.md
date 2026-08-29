# 02 · Design system — "Arcade ledger"

Source of truth: `design/Design form preferences/Component Sheet.dc.html` and `CLAUDE.md`. The inline styles in
the artboards are the spec; this document maps them to code.

```
  Component Sheet.dc.html ──▶ lib/tokens.ts (JS: OG image, three.js, fallback script)
                          ──▶ app/globals.css  @theme  (Tailwind v4 utilities: bg-ultra, shadow-hard-4 …)
                                             @utility (b-ink, press-4, arcade, lh-tight …)
                          ──▶ components/ui/*  (one primitive per file)
```

## 1. Tokens

| Token | Value | Tailwind class | Use |
|---|---|---|---|
| ink | `#1a1a1a` | `text-ink` `bg-ink` `border-ink` | text, borders, shadows |
| ground | `#f2f3f6` | `bg-ground` | page background |
| card | `#ffffff` | `bg-card` | all surfaces |
| ultramarine | `#2438e8` | `bg-ultra` `text-ultra` | CTAs, section badges, active toggle |
| amber | `#ffb800` | `text-amber` | scoreboard digits, accents |
| amber fill / text | `#ffe294` / `#8a3f06` | `bg-amber-fill` `text-amber-text` | unknown badges, stale banner |
| confirmed | `#148a4e` (`#0f7a42` text, `#b9f0c9` fill) | `bg-confirmed` `text-confirmed-text` `bg-confirmed-fill` | reached counts, alive gauges, grade A/B |
| scoreboard | `#141419` | `bg-board` | live strip, dark cards |
| live red | `#e5484d` | `bg-live` `border-live` | LED dot + mic only |
| dead | `#8a8a8a` (`#bdbdbd` dot) | `text-dead` | dead gauges |
| rule / thead | `#e7e9f0` / `#e2e7ff` | `b-rule` `bg-thead` | dividers, table head |
| muted | `#6b6f7c` (`#4a4e59`, `#3f434e`, `#8a8e99`) | `text-muted` `text-muted-2` `text-muted-3` `text-hint` | captions |

Default Tailwind colours are disabled (`--color-*: initial`) so nothing off-palette can slip in.

## 2. Type

- **Baloo 2** 400–800, Latin + Devanagari subsets, via `next/font/google` → `--font-baloo` → `font-baloo` (body default).
- **Press Start 2P** only through the `arcade` utility: LIVE chip, scoreboard digits, section numbers, tiny dark-card
  labels. Never Devanagari, never translated (`live.right_now`, `report.how_label` … stay English in every language).
- Scale (from the sheet): display 800 44–92px · section head 800 28px (20px mobile) · card title 800 17px · body 500 14px · caption 500 11–12px.
- **Devanagari line-height ≥ 1.6**: tight leadings are CSS variables (`--lh-tight`, `--lh-snug`, `--lh-body`) that
  `html:lang(ne)`/`html:lang(hi)` raise to 1.6–1.8; use `lh-tight` / `lh-snug` / `lh-body` instead of `leading-none`
  on any text that can be Devanagari. Numbers are always Latin and tabular (`num` class, `fmtInt`).

## 3. Shape and shadow

| Utility | Meaning |
|---|---|
| `b-ink` / `b-ink-2` / `b-ink-1` | 2.5px / 2px / 1.5px solid ink border |
| `rounded-r2` / `rounded-r4` / `rounded-pill` | 2px rectangles, 4px frames, pills |
| `shadow-hard-6/4/3/2` | hard offset shadows, never blurred |
| `press-4/3/2/0` | hover translate(1px,1px) + shadow −1; active translate(4px,4px) + shadow 0 |
| `amber-quarter` | the quarter-circle amber overlay on dark cards |
| `b-dashed` | 2px dashed `#b8bcc7` — empty states and "Keep this folder" |

Stat cards tilt ±0.6deg (`Card tilt={…}`, values in `lib/config.ts` `STAT_CARDS`).

## 4. Primitives (`components/ui/`)

| File | Exports |
|---|---|
| `Button.tsx` | `Button` primary / dark / secondary / outline, sizes sm/md/lg, press shadows |
| `Pill.tsx` | `Pill` share / done / wait / matched / unknown / plain / dark / withdrawn; `UnknownBadge` |
| `Chip.tsx` | `Chip` (tap-to-add, amber when inserted) |
| `Card.tsx` | `Card` (tone card/amber/dark/ground/dashed, shadow, tilt, press, href); `Frame` |
| `Badge.tsx` | `NumberBadge` 01…07, `GradeCircle` A–E, `ItemBadge`, `Dot`, `CheckCircle`, `ArrowCircle`, `StatusPill` |
| `LiveChip.tsx` | `LiveChip`, `Led` |
| `SectionHead.tsx` | numbered head with subtitle and right slot |
| `StaleBanner.tsx` | amber banner |
| `EmptyState.tsx` | dashed box with one action |
| `Table.tsx` | `TableBox`, `Table`, `THead`, `Th`, `Td` (sticky first column support) |
| `Logo.tsx` | the logo circle |
| `DarkCard.tsx` | dark card with arcade label + amber quarter |

## 5. States

- **Stale** — `StaleBanner` in the layout when `v_live_counts.last_processed_at` is older than `STALE_AFTER_MINUTES`
  (= `PULL_INTERVAL_MINUTES × 1.5`), or when there has never been a processed run.
- **Empty** — `EmptyState` with the retry rule ("retrying every 4 hours") or the action that fills it.
- **Listening** — red border + red hard shadow + LED + `LISTENING` (docs/06).
- **Press** — every button/card link uses `press-*`.

## 6. Adding a primitive (numbered)

1. Copy the exact inline style from the artboard into token classes; keep paddings like `pt-[7px] pb-[5px]` — Baloo 2 sits high, the asymmetric padding centres it optically.
2. Export one component per file from `components/ui/`; no colour literals except through `lib/tokens.ts`.
3. Give every interactive element ≥ 44px tap height on mobile and an accessible name.
