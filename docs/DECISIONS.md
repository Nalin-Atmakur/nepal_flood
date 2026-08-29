# Decision log

*ADR-style, newest first. A decision here is a commitment until superseded by a newer entry.*

---

## 2026-08-29 — D4: Demote the heatmap; validate a narrow operations sidecar before code

**Question:** After refreshing the day-four operational evidence, what should replace the collaborative heatmap as the default product direction?

**Context.** The response already has a strong shared-map surface: HOT/NAXA tasking and data exports, a multi-source imagery viewer, CEMS/UNOSAT products and AI-assisted damage work. HOT/NAXA also already have drone- and field-tasking products. Meanwhile, direct reporting shows physical rescue bottlenecks at mud-filled tunnel worksites, very limited landing options, rapidly changing road/telecom access, a newly centralised drone intake and a severe official DVI record backlog (→ research/30-user-needs/gap-analysis-2026-08-29.md).

**Decision.** Do not build a public/shared heatmap or another destination dashboard. Run the 72-hour validation sprint in the gap analysis. The ranked discovery targets are:

1. a private, operator-verified **Tunnel Rescue Worksite Pack**;
2. an **NDRRMA/HOT/NAXA drone-intake QA and packaging adapter**;
3. an **offline access-status delta pack** with an accountable refresh owner.

No candidate proceeds past a manual example without a named owner, representative non-sensitive sample and daily user. HOT validation/data QA remains the default contribution while validation runs. Person reconciliation and DVI tooling remain official-invitation-only.

**Supersedes:** D3's fusion heatmap (wedge 2) and volunteer barrier-lake watcher (wedge 3) as default builds. Either may return only if an operational owner explicitly requests it.

---

## 2026-08-29 — D3: The candidate wedges (answer to bootstrap §8.3)

**Question:** Given what already exists, what is the strongest gap a small team could fill in days — and what would make it not worth filling?

**Context.** The map lane is more occupied than the team assumed when the "priority map" idea formed: Copernicus EMSR927 human-graded damage, HOT/NAXA fAIr AI damage, UNOSAT extents, NESRA FloodWatch (a Nepali-run fused EO dashboard with YIL — BIPAD's builders — inside), and an official NDRRMA drone pipeline all exist as of day 4 (→ research/20-existing-systems/active-channels-2026-08-29.md). The missing-persons lane is demonstrably fragmented — but that is precisely the lane history and ethics say outsiders must not enter with a new platform (→ research/30-user-needs/historical-lessons.md, research/sources/2026-08-29--multiple--missing-lists-fragmentation.md).

### Wedge 1 — Plug into the channels that asked (do this regardless)

Join the HOT campaign where the deficit actually is — **validation (upper corridor 8–25% validated) and lower-corridor mapping (3–4% mapped)** — and show up at the 30 Aug hackathon to acquire a Nepal-side problem owner; email HOT's coordination contact with a concrete offer.

- **Argument against:** remote building-tracing on day 4 rarely changes life-safety outcomes for *this* event; if nobody on the team has >250 OSM changesets, we can't validate; the hackathon's organisers are unnamed (provenance unverified) and hackathon output has a high abandonment rate. **Net:** low ceiling, but near-zero risk, immediate start, and it builds exactly the relationships every historical success ran on. Verdict: **do now**.

### Wedge 2 — The fusion product: population-weighted triage grid + reachability layer

The one *technical* gap with evidence: nobody has published EMSR927 + fAIr damage + UNOSAT extent joined with building footprints, population rasters, and road/bridge grading into one ranked, dated, per-settlement product (the team's three-layer concept, honestly labelled — → research/30-user-needs/priority-map-concept.md, research/60-ai-and-satellite-approaches/approaches.md). Deliver *through* HOT/NAXA/NESRA, not as our own destination site.

- **Argument against:** NESRA FloodWatch or NAXA may ship exactly this at any moment — they are closer to the data and the government; our population inputs are honest-but-weak (2016-vintage HRSL, blind to the tourist-heavy missing population); and without a validated user (Open Question #1) it risks being a portfolio piece. **Kill condition:** if NESRA/NAXA publish a fused priority layer, fold into their effort same day. Verdict: **do, with the kill condition checked daily**.

### Wedge 3 — Barrier-lake watch script

Small, safe, real: automated Sentinel-2/Landsat/Planet pull over the two impoundments, NDWI/area time series, Sentinel-1 fallback, change alerts relayed privately to responder-adjacent contacts (ICIMOD/NESRA). The 28 Aug breach already paused rescue once; cloud + 6–12-day SAR revisit guarantee official monitoring has observation gaps.

- **Argument against:** China is instrumenting the lake directly (LiDAR, drones, on-site simulation) — our satellite cadence cannot compete with that, only complement it; and the output is worthless-to-dangerous if it leaks as a public "warning feed" (DO_NO_HARM Harm 2/4). Verdict: **do, private-relay only**.

### Rejected wedge — A missing-persons platform ("social media platform for disasters")

The need is real and evidenced (divergent counts; NTB list stale since 26 Aug; families physically walking hospital noticeboards; PII leaking through private lists). Rejected anyway, per the bootstrap §2 test: the canonical actors exist (Nepal Police udb + DVI, ICRC/NRCS RFL with a CHF 25M appeal covering family links), an unadopted parallel registry built for this event has ~5 cases, and every historical precedent says outsider registries fragment rather than fix. **Narrow surviving variants:** (a) an invite-only reconciliation *service offered TO* an official list-holder through a Nepali intermediary (NAXA/YIL/NRCS) — only if invited, under their data authority; (b) contributing accurate official-channel signposting to surfaces families already visit (existing pages, embassy pages) rather than a new site.

**Decision:** Wedges 1+3 start immediately; wedge 2 runs with its kill condition; the rejected wedge stays rejected until an official invitation changes the facts.

---

## 2026-08-29 — D2: No personal data in this repo, ever

Adopted verbatim from bootstrap §6; implemented in `.gitignore`, `data/README.md`, `research/50-ethics-and-legal/`. The eTurboNews 655-row PII table circulating for this event is the standing exhibit of what we refuse to become.

---

## 2026-08-29 — D1: Research-first repo; no application code yet

Per bootstrap brief. The repo's output is verified context, source discipline, and the wedge decision above. Code starts only when a wedge has a named consumer.
