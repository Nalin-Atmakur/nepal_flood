# The three-layer priority map — concept under test

*Origin: team discussion (→ ../sources/2026-08-29--field--team-formation-message.md). Status: HYPOTHESIS — promising, with named risks. Decision context: docs/DECISIONS.md.*

## The concept

Rank search locations by:

1. **Likely people present** — pre-event population presence × building damage ("how many people were probably in the structures that were hit")
2. **Reachability** — route status + debris to clear ("can a team actually get there, and how")
3. **Spot risk** — exposure to a secondary outburst flood path ("is it safe to be there")

## What the data can honestly support (per `../60-ai-and-satellite-approaches/approaches.md`)

| Layer | Feasible now? | Honest label |
|---|---|---|
| 1 — people | YES (days): EMSR927 + fAIr damage × footprints × HRSL/Kontur | "Estimated *pre-event resident* occupants of damaged structures" — NOT "survivors likely here". Blind to tourists/workers (a huge share of this event's missing). |
| 2 — reachability | YES (days): OSM graph + CEMS road/bridge grading + 0.55–0.8 m scene checks | "Assessed access status per settlement, dated" — needs continuous refresh; wrong = dangerous |
| 3 — spot risk | PARTIAL: DEM flow-path proximity weighting + barrier-lake watch feed | "In/near modelled flow path" — NOT a prediction of a burst; DHM/NDRRMA own warnings |

## Arguments for

- The fusion product genuinely doesn't exist publicly for this event; all inputs do.
- Serves the EOC-level need (H3.1) without touching personal data — clean of the registry fragmentation trap.
- Layer 3 addresses the one thing that has already paused rescue (the 28 Aug breach).

## Arguments against (must be answered before/while building)

1. **No validated user.** No confirmed channel to Army/NDRRMA/EOC (→ ../10-actors/our-channels.md). A map nobody operational uses is a portfolio piece. Mitigation: build *through* HOT's open door; their coordination contact explicitly asked for organisations' geospatial needs.
2. **Interpretation risk.** "Priority" scores read as authoritative. Mitigation: provenance + confidence on every cell; coverage polygons always visible; unofficial-volunteer-work labelling.
3. **Staleness risk.** Wrong reachability info could route someone into a washed-out crossing. Mitigation: every feature carries an as-of date; refresh cadence documented; corrections via HOT validators.
4. **Duplication watch.** If NAXA/HOT/UNOSAT publish a fused priority product themselves, our lane collapses to contributing — check before each build day.
