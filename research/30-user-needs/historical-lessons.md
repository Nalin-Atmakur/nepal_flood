# Historical lessons — volunteer tech in disasters

*What the record says about when efforts like ours help vs. harm. Full sources in the gap-analysis sweep (→ ../sources/LINKS_INDEX.md).*

## Ushahidi, Haiti 2010

- Proof of concept for crowdsourced crisis mapping; but the independent evaluation found responder uptake patchy and hard to evidence.
- Its #1 recommendation: cultivate champions inside responder orgs *before* the crisis — **adoption is a relationship problem, not a software problem**.
- Reports not "actionable to a specific responder with a specific mandate" are noise; volunteer surge capacity decays in weeks.

## QuakeMap (Kathmandu Living Labs), Nepal 2015

- The numbers: 2,031 reports → 1,289 actionable → ~350 acted on. Even a locally rooted, famous deployment converted ~1 in 6 reports into action.
- What made it work: a capable **local** team phone-verifying every report, plus distribution into 50+ responder orgs including the Nepal Army. The value was the *human triage and routing layer*, not the map.
- Only ~10% of reports arrived by SMS — reporting populations skew connected/urban/diaspora.
- The 2015 OSM surge was useful because Kathmandu had been mapped since 2013 (Open Cities). Pre-work, again.

## deprem.io / afetharita / ahbap, Turkey 2023

- Speed is achievable: deprem.io shipped in hours, 70k help requests in 4 days. But dedup/verification was manual and brutal; a 12-hour Twitter throttle mid-rescue showed single-platform fragility.
- 200+ debunked false reports in two weeks — misinformation is a parallel disaster (matching what we already see here, → ../sources/2026-08-28--fact-checkers--ai-fake-videos.md).
- Trust concentrated on brands people already knew (ahbap); the state eventually took over deprem.io's domain. Unofficial platforms get displaced once the state moves.

## keralarescue.in, Kerala 2018 — the success case

- Built by IEEE Kerala volunteers in ~14 hours; **the state government adopted and promoted it within two days**, making it the single canonical intake; 10k+ requests routed to authorities who had boats.
- Big tech piled on *after* it was canonical. Canonical status attracts data partners, not vice versa.
- It assumed working networks and high smartphone penetration — which held in Kerala and only partially holds in Rasuwa 2026.

## The adoption predictors (consistent across all four)

1. **Fast official endorsement** (Kerala: 2 days).
2. **Pre-existing relationships and local rootedness** (KLL's 2013–15 groundwork; here: NAXA/YIL embedded with NDRRMA; Nepal Drone Association's July 2026 agreement).
3. **One canonical platform per function** — this event already has ≥4 missing-persons surfaces (Police udb, NTB list, rescuenepal.info, private tables); adding a fifth helps no one.
4. **A named consumer whose job the tool does.**

## Formal doctrine

OCHA interfaces with digital volunteers through the **Digital Humanitarian Network**; its guidance exists because uncoordinated volunteer tech created friction — and it explicitly leaves verification/reliability/privacy risk with the volunteers. Translation: the burden of proof is on us, and the safe posture on day 4 is **augmenting a channel that already has responder pull**, not launching a destination and hoping.
