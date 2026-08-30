# 23 · Distribution

The site is built to be forwarded. This is the list of first stones, the copy to throw them with, and what to watch
while they land. Written 30 Aug 2026, the evening the QA pass came back clean.

## Before anything goes out

1. **Start the pipeline loop** so the numbers keep moving: `cd data_aggregator/pipeline && make schedule` (every
   4 h; `--once` for a single tick). A shared page whose "since last update" climbs past 8 h looks abandoned, and
   the stale banner appears at 6 h.
2. Check the front page yourself on a phone, in Nepali: <https://www.nepalfloodtracker.com/ne>.
3. Have `/admin/reports` open in a tab. If a real family report arrives, someone has to read it *today* — that is
   the promise the form makes.

## Timing (NPT is UTC+5:45)

| Audience | Best window | Why |
|---|---|---|
| Nepal (families, local media, responders) | **07:00–10:00 and 18:00–21:00 NPT** | before work and after dinner; phone-first |
| India (state control rooms, pilgrim families) | 09:00–12:00 IST | the desks are staffed |
| Diaspora (US, UK, AU, Gulf) | their evening | they are the carriers who forward into Nepal |
| International press / humanitarian | 09:00–11:00 CET | ReliefWeb, OCHA, ICIMOD work hours |

Posting at 00:30 NPT reaches nobody in Nepal. If it is the middle of the night there, seed the diaspora and the
press first and hold the Nepal-facing push for the morning.

## Channels, in the order I would do them

**1. The people already searching** (highest value, smallest audience, do these by hand and personally)
- `t.me/poshuknepal` — ~4,400 relatives of the missing Ukrainian groups. They are searching hourly.
- MASFIH (Malaysia, 49 missing), The Trekkers' Society / Isha families (77 pilgrims at Gyirong), the Kolkata
  32-member Kailash group's WhatsApp, Indian state control rooms (Karnataka SEOC, TN, WB, Kerala NORKA, UP,
  Maharashtra 1070).
- What they need to hear: *every agency's number side by side, every place on the corridor, and a private way to
  add what you know*. Not "check out our site".

**2. Nepali media and journalists covering the flood**
Kantipur, Setopati, Onlinekhabar, Nepali Times, The Kathmandu Post, Ratopati, NepalWatch, Shilapatra.
Pitch: a free, sourced aggregation of five agencies' figures with provenance per cell, plus a corridor
reconstruction they can embed a screenshot of. Offer the CSV.

**3. Diaspora networks** (the carriers)
NRNA chapters, Nepali student societies (UK/US/AU), r/Nepal, Nepali Facebook groups, WhatsApp family groups.
This is where "know anyone with family in Rasuwa, Nuwakot or Dhading?" does its work.

**4. Humanitarian and technical**
ReliefWeb (submit as a report), OCHA Nepal, ICIMOD, HOT OSM community, Nepal Red Cross. They cite sources; being
cited by them is what makes the site findable next week.

**5. Wider attention** (secondary; only once the above is done)
X with #RasuwaFlood #BhoteKoshi, tagging @nepaltourismb and reporters on the story; Hacker News for the
simulation itself. Traffic here is shallow but it feeds 3.

## The copy

**WhatsApp / Telegram / Signal (EN)** — the app's own share button produces exactly this:

    🌊 Nepal's Bhote Koshi flood: 675 dead · 2,498 still out of contact · 7,514 rescued.
Watch the sheer power of the wave in an interactive simulation, village by village.
Please look, and share. Someone who sees this may know where a missing person is.

    https://www.nepalfloodtracker.com/en?utm_source=whatsapp&utm_medium=seed&utm_campaign=launch

**WhatsApp / Telegram (NE)**

    🌊 नेपालको भोटेकोशी बाढी: 675 मृत · 2,498 अझै सम्पर्कविहीन · 7,514 उद्धार।
अन्तरक्रियात्मक सिमुलेसनमा बाढीको भयानक शक्ति गाउँ-गाउँ हेर्नुहोस्।
कृपया हेर्नुहोस् र सेयर गर्नुहोस्। यो देख्ने कसैलाई हराएको मान्छे कहाँ छ भन्ने थाहा हुनसक्छ।

    https://www.nepalfloodtracker.com/ne?utm_source=whatsapp&utm_medium=seed&utm_campaign=launch

**X / Twitter**

    Nepal's Bhote Koshi flood, five days on: 675 dead, 2,498 still out of contact, 7,514 rescued.
    One page follows every village on the corridor, with each agency's numbers side by side and where they
    disagree. Watch the wave run 72 km, village by village.
    https://www.nepalfloodtracker.com/en?utm_source=x&utm_medium=seed&utm_campaign=launch

**To a journalist or an agency (email)**

    Subject: Bhote Koshi flood — every agency's figures in one place, with sources

    We run nepalfloodtracker.com, a volunteer aggregation of the 26 August flood: NDRRMA, Nepal Police, MoFA,
    the Department of Tourism and the PM's portal side by side, each figure carrying its source and an "as of"
    time, plus place-level status along the corridor and a reconstruction of the wave.

    Everything is exportable as CSV/JSON with attribution per cell, free, no credit required. If a figure of ours
    is wrong, tell us and we will fix it the same day.

    https://www.nepalfloodtracker.com/en?utm_source=press&utm_medium=seed&utm_campaign=launch

**To a family network / searching group**

    If you are looking for someone on the Bhote Koshi or Trishuli corridor, this page keeps every official
    number in one place and shows, village by village, how many people are still unaccounted for.

    If you know anything about anyone who was there, a call, a plan, a photo, you can add it privately. It is not
    published; it is kept for the volunteer team and the official channel.

    https://www.nepalfloodtracker.com/en?utm_source=families&utm_medium=seed&utm_campaign=launch

## Tracking

Every link above carries `utm_source` / `utm_medium=seed` / `utm_campaign=launch`. Vercel Analytics shows which
seed actually moved. The share buttons on the site tag themselves (`utm_medium=share`), so organic forwarding is
distinguishable from seeding.

## What to watch, and what breaks first

| Signal | Where | If it moves |
|---|---|---|
| Submissions arriving | `/admin/reports` | read them the same day; that is the promise |
| Anonymous sign-in 429s | Supabase → Auth → Rate limits (now 500/h/IP) | raise again; carrier NAT puts thousands behind one address |
| Realtime connections | Supabase free tier caps concurrent connections | the "people here now" counter hides itself; nothing else breaks |
| Database size / egress | Supabase free tier (500 MB / 5 GB) | attachments are the growth; watch the bucket |
| Data age on the page | the "since last update" line | the pipeline loop stopped |
| A wrong figure | anywhere | fix it the same day and say so; credibility is the whole asset |

## What not to do

- No mass-DMing individuals, no scraped lists, no posting into memorial or family groups without asking a
  moderator first. This is a disaster, not a growth funnel; one complaint from a grieving family costs more than
  any traffic gained.
- Do not claim official status, do not promise anyone will be found, and do not repost the AI fakes circulating
  (the fact-check list is in `docs/18-flood-videos.md`).
