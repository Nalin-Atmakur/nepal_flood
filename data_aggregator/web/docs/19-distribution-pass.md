# 19 · Distribution pass — plan (30 Aug 13:50 BST)

Owner's brief (12:26–12:42, screenshots): the site serves three purposes — **collect** as much as possible from
people, be the **central source** of aggregated data and news, be **engaging enough to go viral** so it reaches
more people to collect from. Today's work is the third leg, which feeds the first. Phones are the channel.

## The asks, in the order they will be done

| # | Ask | What changes | Where | Verify |
|---|---|---|---|---|
| 1 | Breach default **slow** | UI initial scenario = slow (12 s); the sim's own default constant stays (tests, fallback) | `CorridorScene.tsx` | e2e: slow chip is `aria-checked` on load |
| 2 | Controls layout | Row 1: volume slider. Row 2: **Breach** and **Drop in the path** on the same line (wrap on phones). | `CorridorScene.tsx` | screenshot 1280 + 390 |
| 3 | "Lake volume" → what caused it | The slider number **is** the barrier-lake volume China's MWR published — the avalanche is what breached it, its own volume is not the number that drives the wave. Label becomes **"Flood volume"** with the unit and a hover/sub "the lake the avalanche breached". Not "avalanche volume": that would be wrong. | `messages/*.json` `corridor.lake_volume` + new `corridor.lake_volume_sub` | copy reads right in en/ne/hi |
| 4 | **Mobile resolution** | Bug, not performance: `setPixelRatio(min(dpr, mobile ? 1.5 : 2))` renders a 3× phone at half its pixels, and the low-quality fallback halves the water again. Fix: pixel ratio = min(dpr, 3) everywhere; low-quality mode may drop spray/substeps but **never resolution**; the canvas keeps `image-rendering: auto`. | `corridor-3d.ts` | `renderer.getPixelRatio()` in `debug()`; screenshot at 390 × dpr 3 |
| 5 | **Overview** + **Cinematic** | Rename Frame → Overview. New **Cinematic** button: the run restarts, the camera opens on the lake, chases the front along the channel (the ride that was built and switched off in D-054), sways azimuth slowly, eases back to the overview when the run ends. Any drag/pinch takes over; Overview cancels. | `scene/camera.ts` (`setCinematic`), `corridor-3d.ts` (`cinematic(on)`), `CorridorScene.tsx` | e2e: click → `debug().cameraMode === "ride"` while running |
| 6 | Footage **under the panel, 3 clips** | The nine-tile section 02 goes; three featured clips (`featured: true` in `lib/videos.ts`: CCTV at the border, NDTV's Trishuli Bazar, CNA's bridge) render as a slim row directly under the corridor's controls, with "Have footage? → form". The other six stay in the file for the place pages later. | `Corridor.tsx`, `FloodVideos.tsx` (row mode), `lib/videos.ts`, `page.tsx`, e2e count 3 | e2e: 3 `[data-video]` inside `[data-block="corridor"]` |
| 7 | "My folder" → **"My info"** | `nav.me`, `me.title`, and the three sentences that mention it, en/ne/hi | `messages/*.json`, docs | i18n check |
| 8 | **Three goals on the front page** | A strip inside **Your part** (heads every tab): *This page does three things — 1 collects what people know, 2 puts every official number and headline in one place, 3 spreads, so it reaches more people who know something.* The third line ends in the share button: "**#3 is you → Share**". | `YourPart.tsx`, `messages` | visible at 390 |
| 9 | **Share message** | Rewrite `share.text` en/ne/hi as a hook with the live headline numbers (dead · out of contact · rescued, from the same `getOgNumbers`) and one ask; keep the link last. The corridor's "Share this run" gets the same treatment. | `lib/share.ts` (`shareText(lang, numbers)`), `ShareBar`/`ShareMenu` props, `YourPart` | unit test on the text |
| 10 | **Preview not rendering from the phone share sheet** | Cause: on iOS, `navigator.share({text, url})` is delivered to WhatsApp as *text*, and WhatsApp only builds a link preview for a URL item or for text typed into its composer. The pasted link (desktop) previewed; the share-sheet one did not. Fix: on phones the WhatsApp pill and the native sheet both go through **`wa.me/?text=`** (opens WhatsApp's composer with the message → preview is generated); `navigator.share` is used only with `{title, url}` (a URL item → preview) when the visitor picks another app. | `ShareMenu.tsx`, `ShareBar.tsx` | manual on the owner's phone; OG tags asserted on `/en?utm_source=whatsapp` in the live smoke |
| 11 | **OG card as the engaging graphic** | The card gets the corridor itself: the pre-rendered `corridor-fallback.png` as the right panel (with the numbers on the left), the "▶ watch the flood run 72 km" line, and the ask. Cached per language like today. | `app/api/og/route.tsx` | `curl /api/og?lang=ne` is a PNG; visual check |
| 12 | **Mobile-perfect** | Playwright pass at 390 px over `/`, `/numbers`, `/places`, `/places/timure`, `/latest`, `/report`, `/me`, `/sources`, `/about` in en/ne/hi: no horizontal overflow (`scrollWidth ≤ innerWidth`), every tap target ≥ 40 px, no text under the bottom tab bar. Becomes a permanent e2e test. Fix whatever it finds. | `tests/e2e/mobile.spec.ts` + fixes | the test |

Order: 1–3 and 7 (minutes) → 4 → 6 → 5 → 8 → 9–11 → 12 → deploy after each group, `PROGRESS.md` line per group.

## Decisions recorded as we go
- D-062 breach default slow; controls two-row layout; "Flood volume" wording.
- D-063 mobile pixel ratio = device (cap 3); low-quality never touches resolution.
- D-064 Overview/Cinematic; footage under the panel (3).
- D-065 share text with live numbers; wa.me for WhatsApp everywhere; OG card with the corridor.
- D-066 three goals on Your part.

## Status
- 15:00 · rows 8–11 built: three goals on Your part (home, with the Share button on #3); `share.hook` with the live NDRRMA numbers via `/api/share-numbers` (fetched only when a share UI mounts); WhatsApp always through `wa.me` (composer → preview), the device sheet as "More…" with the URL alone; phone share popover is a bottom sheet; OG card carries the corridor strip. Row 12: `tests/e2e/mobile.spec.ts` — 13 pages at 390 × 844: no sideways scroll anywhere; two undersized taps found and fixed (Names toggle 32 → 40 px, "Have footage?" link → pill).
- 14:20 · rows 1–7 built: slow default, two-row controls, "Flood volume · the barrier lake the avalanche breached", device pixel ratio (cap 3), Overview + Cinematic (`setCinematic`, sway + bob, eases back at the end), three featured clips under the panel, "My info".
