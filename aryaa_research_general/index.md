# aryaa_research_general — index

Research compiled by Aryaa on **2026-08-29** (event day 3–4) into the 26 Aug 2026 Bhotekoshi/Trishuli flood, with the question: *how could a small ML team help rescuers find people who are alive but stranded?*

Published version of the synthesis (HTML brief, same content as sections 00–09): <https://claude.ai/code/artifact/dafc9836-01c5-446b-bbf1-b0a70cc4e2eb>

**Conventions.** Every number is a snapshot `as of 2026-08-29` from a named source; where sources conflict, the conflict is shown, not averaged. Per this repo's D2 rule, this folder contains **no personal data**: survivors, missing officials, rescuers and company staff are referred to by role, not name; personal mobile numbers, private emails and vehicle registrations quoted in press have been removed. Institutional hotlines and organisational emails remain.

## The one-paragraph answer

This is not a detection problem; it is a coverage, logistics and reconciliation problem, and the metric is survivors rescued per helicopter sortie. The living are concentrated in known place-types — hydropower tunnels (hours matter), cut-off-but-intact pockets along the gorge (days), and side-valley trekkers (safe, uncontactable). The highest-leverage ML work is unglamorous: reconcile the four conflicting missing lists into per-settlement expected-vs-confirmed counts; build the settlement/camp "island" triage that ranks each morning's sorties; get last-cell-attach data for missing phones from the operators; give the drone pilots already flying an offline triage kit; and turn the 35–58 cm Vantor/Maxar imagery into building/bridge status. Aerial person-detection CV is a supporting tool, not the product. Nepal has declined foreign SAR teams and is asking for technical help; the entry point is the Nepal-led hackathon on Sun 30 Aug 09:00 NPT, and output must reach the Army ops cell through a Nepali intermediary as a ranked list in Nepali — not a public dashboard.

## Structure

| File | What it holds |
|---|---|
| [00-summary.md](00-summary.md) | The thesis and the ranked recommendation in one page |
| [01-event-and-corridor.md](01-event-and-corridor.md) | What happened; the corridor upstream→downstream with status per stop; the 2025 precedent |
| [02-numbers.md](02-numbers.md) | Dead/missing/rescued/infrastructure figures, with the disagreements between sources |
| [03-where-the-living-are.md](03-where-the-living-are.md) | Tunnels, cut-off pockets, side-valley trekkers, border pilgrim groups; survival-window reasoning |
| [04-what-blocks-rescue.md](04-what-blocks-rescue.md) | Weather, LZs/fuel, roads, comms/power, barrier lakes, tunnels, coordination, list fragmentation |
| [05-already-running.md](05-already-running.md) | Every satellite/aerial/crowdsourced/volunteer activation as of 29 Aug — what not to duplicate |
| [06-ml-approaches-ranked.md](06-ml-approaches-ranked.md) | Five ranked products with evidence, data needs and time-to-ship; the skip list; failure modes |
| [07-data-map.md](07-data-map.md) | Open vs gated data assets with access methods and caveats |
| [08-decision-chain-and-plug-in.md](08-decision-chain-and-plug-in.md) | Who tasks helicopters; entry points in order; constraints (drones, border, language, PII) |
| [09-72-hour-plan.md](09-72-hour-plan.md) | Day-by-day plan for four people, Sat 29 → Tue 1 Sep |
| [10-discussion-log.md](10-discussion-log.md) | Sketch-vs-platform reasoning, PII explanation, "what can we even do", alignment with `docs/DECISIONS.md` D3, answers to open questions #2 and #10 |
| [11-data-catalogue-2026-08-29.md](11-data-catalogue-2026-08-29.md) | **Every publicly available data source found in a five-domain internet sweep (evening 29 Aug), as tables**: person/status registries incl. the open OPMCM and NDRRMA APIs, official bulletins, place-status signals, geospatial layers, imagery, hazard/hydrology/weather, text/social corpus, dead ends, access matrix, asks |
| [sources.md](sources.md) | All sources used, grouped |
| [agent-reports/](agent-reports/) | Raw parallel research reports: the afternoon synthesis pass (rescue ops; geospatial data; ML methods; Nepal ecosystem — only rescue-ops is committed) and the evening data-sweep pass (`deepdive-*`: official, crowd, geospatial, signals, text) — denser and more sourced than the sections above |
| [sketch/](sketch/) | Aryaa's notebook sketch of the priority-map pipeline and how it maps onto what already exists |

## How this maps onto the rest of the repo

- `research/00-event/` ↔ sections 01–02
- `research/10-actors/` ↔ section 08 and `agent-reports/nepal-ecosystem-2026-08-29.md`
- `research/20-existing-systems/active-channels-2026-08-29.md` ↔ section 05 and `agent-reports/geospatial-data-2026-08-29.md`
- `research/30-user-needs/priority-map-concept.md` ↔ section 06 (#1, #5) and `sketch/`
- `research/60-ai-and-satellite-approaches/` ↔ section 06 and `agent-reports/ml-methods-2026-08-29.md`
- `docs/DECISIONS.md` D3 — this research reaches the same verdict independently: reject the standalone missing-persons platform; do the fusion/triage product through Nepali channels; the invite-only reconciliation service is the highest-value variant *if* invited. Two additions proposed here: geolocating hydropower adits/portals from pre-event imagery (cheap, time-critical, not in D3), and replacing HRSL population priors with roster-based headcounts (IPPAN, TIMS) in the triage product.
- `docs/OPEN_QUESTIONS.md` — #2 and #10 are addressed in [10-discussion-log.md](10-discussion-log.md).
