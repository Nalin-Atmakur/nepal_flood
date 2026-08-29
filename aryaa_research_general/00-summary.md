# 00 — Summary

*As of Sat 29 Aug 2026, ~14:00 NPT (event day 3, T+72 h).*

## Thesis

**This is not a detection problem. It is a coverage, logistics and reconciliation problem — and the metric is survivors rescued per helicopter sortie.**

Three days in, the people still alive are concentrated in known *place-types*: hydropower tunnels and powerhouses (tens of people), cut-off-but-intact villages and camps along a 72 km gorge (hundreds), and trekkers up side-valleys the flood never entered (hundreds, mostly safe but uncontactable). Rescuers largely know these places exist; what they lack is a single, verified, prioritised list of *who is expected where, who has already been reached, and which landing zones are flyable in the morning weather window*.

## Ranked recommendation (details in 06)

1. **Settlement/camp "island" triage → daily sortie priority list.** Expected headcount × survivability × reachability × contact status, per place. Exactly what Kathmandu Living Labs' QuakeMap did in 2015 (the Army tasked helicopters from its verified list). Quick win inside it: geolocate every hydropower adit/portal from pre-event imagery — rescuers reportedly don't know where some are under the mud.
2. **Missing-list entity resolution.** Merge MoFA / NTB / police / IPPAN rosters / trackers / family posts into one deduplicated register with per-settlement expected-vs-confirmed counts. The missing figure jumped 977 → 2,426 overnight purely from list merging.
3. **Phone last-cell / re-attach analytics** with NTC and Ncell — SQL, not ML; access must be requested via NDRRMA → NTA *today*.
4. **Offline drone-image triage kit** for Drone Association Nepal (50+ pilots already flying). Person-detection CV is a *supporting* tool: Texas Hill Country 2025 — 27,000 thermal frames → 12 candidates → one sheep, two deer.
5. **Building & bridge status** from Vantor/Maxar 35–39 cm pre/post pairs (SKAI / fine-tuned xBD with ~300 local labels).

**Skip this week:** Sentinel-1 flood-water segmentation (wrong terrain), landslide deep learning, drone RF/IMSI detectors, acoustic drones, anything requiring internet at the forward base, lost-person-behaviour rings (people are stranded at known places, not lost).

## Posture

Nepal has **declined foreign search-and-rescue teams** (citing 2015 coordination chaos) and asked specifically for tunnel rescue, transport/comms restoration, body ID/DNA, storage and Bailey bridges. The acceptable posture for an outside team is remote, Nepal-led, handed over. The entry point is the **Nepal Hackathon, Sun 30 Aug 09:00 NPT** (organisers unverified — see 10). Output must reach the Army operations cell (NEOC → NDRRMA → Dhunche camp) via a Nepali intermediary (NAXA, HOT AP Hub, NESRA/YIL) as a ranked list in Nepali — not a public dashboard.

## What "done" looks like

A Nepali-language ranked list in the hands of the Army cell at Dhunche every morning before the weather window, updated from the previous day's sorties, with a shrinking and trustworthy count of who is still unaccounted for and where. Not a dashboard, not a demo, not a paper.
