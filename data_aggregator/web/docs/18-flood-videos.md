# 18 · Real footage under the simulation

Owner's brief (30 Aug 13:15): *"add some actual videos of the flood; place them below the flood simulation — this
increases the viral potential."* The simulation says what happened at scale; the footage says it was real.

```
  lib/videos.ts  (FLOOD_VIDEOS — curated, reviewed, in the repo)
        │
        ▼
  blocks/FloodVideos.tsx  (server)  ── section 02 under the corridor on Home
        │   nine tiles: phones = scroll-snap row · desktop = 3 × 3 grid
        ▼
  blocks/VideoTile.tsx  (client)
        poster = https://i.ytimg.com/vi/<id>/hqdefault.jpg  + ▶  + kind badge (+ "in Nepali")
        tap ──▶ <iframe src="https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&playsinline=1">
        under it: our caption (en/ne/hi) · 📍 place chip → /places/<id> · credit → channel · "on YouTube"
  then: the fact-check note · "Have footage from the corridor?" → /report (attachments, docs/06)
```

## Why the list is a file, not a table

AI-generated and recycled clips have been circulating since the first hours (Lead Stories, AAP FactCheck, Nepal
Fact Check, BOOM, VERA Files, Fact Crescendo all published debunks 27–29 Aug). A wrong clip on this site would
travel with the site's credibility. So a clip is added by a reviewed change to `lib/videos.ts`, not by a form or a
pipeline — the same rule as the gazetteer. Visitors' own footage still comes in through the report form's
attachments (private bucket, docs/06) and is looked at by a person before anything is published.

## Add a clip — numbered

1. Find it on YouTube (an outlet's channel, or the eyewitness's own upload). Copy the 11-character id.
2. Verify title + channel without an API key: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`.
3. Run the fake checklist below. If any line fails, stop.
4. Add an entry to `FLOOD_VIDEOS` (`lib/videos.ts`): `id`, `kind` (`cctv` · `eyewitness` · `aerial` · `news`),
   `caption` in **en, ne and hi** (say what the uploader's title says — no more), `credit` + `creditUrl` (the
   channel), `title` verbatim, `placeId` from `gazetteer/places.csv` only when the clip is clearly of one place
   (else `null`), `lang`, `short: true` for a vertical Short, `checked` = today.
5. `npm run i18n:check && npx vitest run tests/videos.test.ts` — ids unique and well-formed, captions present,
   place ids exist in the gazetteer.
6. `npm run build && npm run e2e` (the smoke test expects nine tiles: update the count when the list grows).
7. Deploy (docs/12) and note it in `PROGRESS.md`.

## The fake checklist (all must pass)

- The channel is an outlet, a known local channel, or the person who filmed it — not an "AI", "news update" or
  weather-clickbait channel (the AI channel `@mindforgne_ai` surfaced in search for this event; excluded).
- The clip is not one of the known fakes/recycles: the F-16 / "missile hits dam" AI clip (online since May 2026,
  AI watermark); the AI bridge-collapse clip (figures motionless, 100 % AI score); the AI village-street clip
  (97 % AI score, red boxes appear); AI before/after of Trishuli Bazar (SynthID); the 2021 Atami (Japan)
  landslide; the 5 Aug 2025 Uttarkashi/Dharali clip; the Alaska Columbia Glacier GLOF clip; the 10 Aug 2026 Niti
  Valley (Chamoli) bridge clip; the 9 Aug Assam clip; the elephant-rescue clip; the 2024 Buddha-statue clip.
- Terrain, road, bridge type and script on signs match the corridor (gorge in Rasuwa; broad river at Trishuli
  Bazar / Bidur; the Rasuwagadhi border complex; Devanagari signage).
- The upload date is on or after 26 Aug 2026 (a Short's date shows on its page).
- The caption you write claims only what the title/upload says.

## The nine clips at launch (verified via oEmbed, 30 Aug)

| id | kind | credit | place |
|---|---|---|---|
| `KH94sIuFWuE` | CCTV | NepalWatch | Rasuwagadhi |
| `0bkCtUstxK8` | eyewitness | NDTV | Trishuli Bazar |
| `k5OUDfPfDSo` | eyewitness (Short) | Touch The Himalaya Treks & Expedition | Timure |
| `oewbgPqndPw` | eyewitness (Short) | CNA | — |
| `HR7WeYBmIZQ` | aerial (Short) | NewsX World | — |
| `SlyeTSk-pwk` | eyewitness | Shilapatra | — |
| `AEIC1ujp3CU` | news | CNN-News18 | — |
| `QbKWdCRPRP4` | news | The Straits Times | — |
| `BiAGpvb_JYo` | news | Kantipur TV HD | — |

Considered and left out: Times Now / Oneindia (sensational titles, same footage as NDTV), NDTV Profit (duplicate),
"IDH Weather News", "M-techent", "mind forgn" (AI channel).

## Performance and privacy

- No iframe, no YouTube script, no cookie until a tap; the posters are nine lazy `<img>`s (~15 KB each).
- `youtube-nocookie.com` embeds; the tap itself is the consent.
- The block adds nothing to the server render but nine URLs and the place names it already has.

## Copy keys

`sec.videos`, `sec.videos_sub`, `sec.videos_note`, `sec.videos_add`, `sec.videos_add_sub`, `sec.videos_add_cta`,
`sec.videos_play`, `sec.videos_source`, `video.kind.{cctv,eyewitness,aerial,news}`, `video.lang_ne` — en/ne/hi,
Latin digits (the i18n check enforces it).
