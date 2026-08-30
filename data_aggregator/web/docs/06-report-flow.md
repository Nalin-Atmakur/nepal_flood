# 06 · Report flow — /report, the one box

No multi-step form. One tap picks the chip set, then one textarea (plus mic) is the whole report.

```
  /[lang]/report?type=&place=&supersedes=&mode=      app/[lang]/report/page.tsx (server: validates params, loads places)
          │
          ▼
  ReportFlow (client state machine)
     "who" ──tap──▶ "box" ──Send──▶ "sent"
      WhoAreYou      TheBox            Understood
      4 cards        textarea+mic      check · "Thank you." · We understood: chips
                     chips             Correct something / Add more ──▶ "box" again (supersedes = last id)
                     PlacePicker       share pills · "See what you've added →" /me
                     contact · Send
          │
          ▼ on Send
  ensureSession() → insertReport() ─▶ reports_archive { user_id, lang, respondent_type, text, place_id, contact, fingerprint, supersedes }
                    logSubmission() ─▶ submissions_log { respondent_type, lang }      (→ scoreboard, docs/09)
                    recordSend()    ─▶ localStorage nft_sends                          (rate limit)
          │
          ▼ Understood polls
  getOwnReport(id) every 5 s for 90 s → summary_public (written by process_data ⓪) → split " · " → amber chips
```

## 1. Screens (`components/form/`)

| File | Screen | Notes |
|---|---|---|
| `WhoAreYou.tsx` | 1 · "Who are you?" — inline selector on the SAME page as the box | four `button[role="radio"][data-testid="who-card"]`; "I'm looking for someone" is preselected; picking another only swaps the chip set (`RESPONDENT_TYPES`) |
| `TheBox.tsx` | 2 · the box, 3 · listening | textarea `data-testid="the-box"`, mic, BS hint, chips, Where, contact, Send, footnote; desktop grid `1fr 380px` with the HOW IT WORKS dark card |
| `PlacePicker.tsx` | Where? | listbox over `buildPlaceIndex(places)`; last option "other — describe in the box" (`place_id = null`); selected place → amber pill + 44px clear |
| `Understood.tsx` | 4 · success | `data-testid="understood"`; chips or the received line; Correct / Add more; ShareBar compact; link to /me |
| `ReportFlow.tsx` | orchestrator | keeps `type`, `placeId`, `lastId`; reopening sets `supersedes = lastId` and prefills "Correction: " / "Also: " |

## 2. Behaviour details

1. **Chips** insert `"<label>: "` at the caret (a newline first if the caret is mid-line), refocus the textarea, and turn
   amber while the text still contains `"<label>:"`. Sets per type live in `TheBox.tsx` → `CHIPS`
   (family · survivor · rescuer · agency, from the Report v2 artboard).
2. **Mic** = Web Speech API with `lang = SPEECH_LANG[lang]` (`ne-NP`, `hi-IN`, `en-US`), `continuous`, `interimResults`.
   Final transcripts are appended with a space; the interim transcript is shown greyed after the text. Listening state:
   red 2.5px border + red hard shadow on the box, red pulsing mic button (`animate-micring`), LED + `LISTENING`
   (Latin, arcade font) + "· नेपाली · tap to stop". No API → mic disabled + `report.mic_unsupported`; permission
   refused → `report.mic_denied`.
3. **Validation**: trimmed text ≥ 3 characters (`report.err_empty`); honeypot `input[name=website]` filled → fake
   success, nothing stored; rate limit (`lib/ratelimit.ts`): 20 s between sends, 20 per hour, in `localStorage`.
4. **Writes** (`lib/reports.ts`): `insertReport` (returns `{id}`; the DB forces `status='received'`),
   `logSubmission` (best effort), `fingerprint()` = sha256(UA + screen + timezone + language).
5. **Understood**: polls `reports_archive.summary_public` for the own row (`UNDERSTOOD_POLL` = 5 s × 90 s). Until it
   arrives: "Received — the picture updates within 4 hours…"; after the window: "Processing runs every 4 hours —
   check My folder later". An empty id (honeypot) never polls.
6. **Corrections are new rows**: "Correct something" / "Add more" and the buttons on /me open the box with
   `supersedes=<id>`; the pipeline treats the newest row in a chain as authoritative.

## 3. URL parameters (all validated server-side)

| Param | Accepts | Effect |
|---|---|---|
| `type` | `family \| survivor \| rescuer \| agency` | preselects the "Who are you?" card (default `family`) |
| `place` | an existing `places.id` | preselects the place |
| `supersedes` | a UUID | new row supersedes it; the box shows "Adding to / Correcting your earlier report" |
| `mode` | `add \| correct` | prefix "Also: " / "Correction: " |

## 4. Testing

- `tests/e2e/smoke.spec.ts` opens `/report`, expects four cards, taps one and expects the textarea.
- Manual: send a report → `/me` shows it as Received; run `process_data` → the chips appear on the success screen
  (if still open) and the trail on `/me` advances.

> Picker ranking (30 Aug, lane W5): `searchPlaces` ranks exact name → name prefix → word prefix → substring, shorter label first, so "Dhunche" precedes "Dhunche Army relief camp" and "Timure" precedes "Timure health post" (`tests/places-search.test.ts`). NE/HI phone walkthrough of the whole flow (cards, chips per type, picker in both scripts, send, understood, folder, withdraw) passed with no layout defects.
