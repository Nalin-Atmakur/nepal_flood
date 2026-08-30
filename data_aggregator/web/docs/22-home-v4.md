# 22 · The home page redesign (preview at `/[lang]/v2`)

Owner's brief (30 Aug): *"maximise understanding for a first-time viewer, especially on a cramped mobile screen,
and maximise the chance that they send the page around."* An outside reviewer put first-time comprehension at
6/10 and action clarity at 6.5/10 — the information is excellent, the **order** is wrong.

## Who actually lands here

Two people, not the four the form asks about:

| | who they are | what they need, in order | share of traffic |
|---|---|---|---|
| **The carrier** | not affected; opened a forwarded link | what happened → how bad → something worth watching → a reason to pass it on | the large majority |
| **The affected** | looking for someone, or knows something | the numbers, the places, the form, and what happens to a submission | small, but the reason the site exists |

"Looking for someone" and "I know something" are the *same* person at different moments, so they share one
entry. The carrier is the one the first screen must be designed for — they are the distribution.

## The order (v2)

```
  HeroEvent    what happened, where, when, how bad          ← answers the stranger's first three questions
  Corridor     the real clips, then the replay of the path  ← the thing worth watching (and forwarding)
  SpreadCard   "know anyone with family in Rasuwa…?"        ← names the recipient, not just "share"
  YourPart     the ask + what happens to what you send      ← for the affected; the carrier scrolls past
  (tabs)       Numbers · Places · Latest news · More        ← everything deeper, unchanged
```

Against the live page, this moves the event and the numbers **above** the explanation of what the site does, and
turns the share ask from a good deed into an address-book search.

## What each block does

- **HeroEvent** (`components/blocks/HeroEvent.tsx`) — eyebrow (date · Rasuwa → Chitwan), the flood's name, one
  sentence of what happened, the three NDRRMA figures with source and "as of", a link to *why agencies report
  different numbers*, and a live line: "2,498 people are still out of contact · 4 d 14 h since the wave · Every
  hour matters." The count is the real figure, so the page never says "hundreds" beside "2,498".
- **Corridor** with `heading` — retitled "Follow the flood's path"; "the corridor" means nothing to a stranger.
- **SpreadCard** (`components/blocks/SpreadCard.tsx`) — the carrier's ask, with the big amber share button.
- **YourPart** — unchanged, but now below the story rather than above it.

## Still open (not in the preview)

- The **LIVE** chip promises real time; the data is four-hourly. "UPDATED 20:04" is the honest version.
- The live counters ("0 added in 10 min") read as dashboard telemetry and can look dead — show them only above a
  threshold, and keep one quiet "updated · every 4 h" line.
- "Out of contact" needs a one-line definition where it first appears.
- The official-channels bar is a wall of numbers; "Need urgent help? Police 1155 · Red Cross 1130 · 1234 · more"
  would carry it on a phone.

## Preview

`/[lang]/v2` in all four languages, `noindex`, not linked from anywhere. It reuses the real components and live
data, so what you see is what shipping it would look like — the only difference is the route.
