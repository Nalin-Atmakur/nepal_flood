# 06 — ML that would help, ranked by survivors per sortie

*For a four-person team working remotely over 48–72 h. Each entry: what, evidence, needs, time. The skip list is as important as the ranking. Full literature detail in [agent-reports/ml-methods-2026-08-29.md](agent-reports/ml-methods-2026-08-29.md).*

## 1. Settlement & camp "island" triage → daily sortie priority list
**proven pattern · 24 h to v1 · GeoPackage + notebook**

For every settlement, lodge cluster, hydropower camp and tunnel portal along the 72 km corridor and the side valleys: expected headcount (IPPAN rosters, TIMS/park permits, teahouse capacity, 2021 census wards, WorldPop/HRSL) × survivability (elevation above the debris path, buildings intact from #5) × reachability (bridge/road/trail cuts, flyable LZ) × contact status (reached by heli? phone re-attached? reported safe?) × time since last contact. Output a ranked table each morning, in Nepali, with coordinates and LZ notes, to the Dhunche cell and NEOC.

**Why first:** this is what worked in Nepal in 2015 — Kathmandu Living Labs' QuakeMap took 2,035 reports, verified 978 by phone, and the Army tasked helicopters from the filtered list (434 acted on, ~650 were air-rescue requests). Helene 2024 used pre/post imagery to list cut-off neighbourhoods and run 6,586 systematic welfare checks. Compute is trivial; the work is data plumbing and the daily update loop with helicopter reports.

**Day-one quick win inside this:** geolocate every hydropower adit, portal and underground powerhouse from pre-event Vantor imagery and project drawings — rescuers reportedly do not know where some are under the mud.

## 2. Missing-list entity resolution and "found alive" reconciliation
**proven pattern · 24–36 h · transliteration + gazetteer-constrained LLM extraction**

Merge MoFA, NTB, police intake, hydropower rosters, independent trackers, hospital lists and family posts into one deduplicated register with group affiliation (agency, project, pilgrim group). Devanagari ↔ Latin name matching; age/nationality/last-location fuzzy joins; LLM extraction of *place + status* from Nepali/Hindi/English posts constrained to a gazetteer of a few dozen corridor placenames (which makes toponym extraction near-perfect, unlike generic geolocation, where "within 161 km" is meaningless for SAR). Output: per-settlement expected-vs-confirmed counts feeding #1, and a shrinking, trustworthy missing count.

**Why second:** the missing figure jumped 977 → 2,426 overnight from list merging; one tracker shows 3,742 rescued vs 977 missing; "out of contact" is being reported as "missing". Turkey 2023's afetharita pipeline is the precedent — its value was consolidating addresses for teams, not spotting survivors. Biggest reduction of search space per engineer-hour.

**PII:** must run on the Nepali side (NAXA / hackathon organisers / an official list-holder) with the team supplying code; fallback is hashed identifiers (weaker, because spelling variants break hashes — the very problem being solved). See 10.

## 3. Phone re-attach analytics with NTC and Ncell
**access-gated · 24–48 h if granted · SQL, not ML**

For each missing MSISDN (from #2): last tower attach before 26 Aug 07:00, and first re-attach since restoration — towers are coming back daily. Plus an SMS push to every IMSI last seen on Rasuwa/Nuwakot cells: "reply SAFE + village". A lawful operator query routed NDRRMA → NTA → operators; the 2015 Flowminder–Ncell agreement is the precedent (data at day 6, product day 9 — because the MoU was for aggregate displacement, not individual location, and had to be pre-signed).

**Why third:** highest information per byte, near-zero code, but useless if access isn't granted — so the ask goes in *today*. Drone-mounted phone detectors (Lifeseeker, Wolfhound-PRO, SARDO) work but cannot be built in 72 h; relevant only if a foreign USAR team brings one.

## 4. Offline drone-image triage kit for the pilots already flying
**supporting tool, not a finder · 24–48 h · ADIAT or YOLO11 + SAHI, laptop GPU**

Give Drone Association Nepal / NagarikAlert a laptop tool that ingests a flight's thousands of RGB + thermal frames offline, runs colour-anomaly, motion and a recall-tuned person detector (fine-tuned on HERIDAL + SARD + WiSARD + ForestPersons, SAHI slicing for tiny objects), corrects GPS for altitude/gimbal angle, and produces a top-N candidate list with thumbnails for a human reviewer. The job is to let one reviewer clear 10,000 images per flight, not to find people unaided.

**Honest evidence:** benchmark numbers are good (YOLOv5L on HERIDAL: P 0.90, R 0.89, mAP 0.83) but those are Mediterranean meadows at 40–65 m, ~2 cm GSD, upright unoccluded people. Texas Hill Country (July 2025): four thermal drones at 2 a.m. produced 27,000 images; Loc8 distilled them to 12 candidates in ~5 h; the three ground-checked were one sheep and two deer. ForestPersons (2026, 96k images) shows 0–40 AP transferring from prior SAR datasets to real flights vs 61 AP in-domain. CRASAR (Robin Murphy): no datasets of mud-covered, debris-entangled people in abnormal postures; oblique shots produce GPS errors that waste ground teams. RGB at 120 m ≈ 3–4 cm GSD → a person is 15–25 px; thermal 640×512 at 60–80 m → 5–10 px and needs ΔT that monsoon-wet rock rarely gives in daytime; under canopy thermal detection <25%. Still worth doing because the pilots are flying anyway and anomaly triage (jackets, tarps, smoke) beats eyeballing. TEXSAR's ADIAT (GPL-3, v2.0: anomaly/motion/thermal/AI detector, offline, GPS output) already does most of this.

## 5. Building & bridge status from 35–58 cm pre/post imagery
**data staged · 48 h · SKAI or fine-tuned xBD, ~300 local labels**

Intact / damaged / gone per building across the corridor, plus hand-verified status of all 62 bridges and the trail crossings up the Langtang and Tamang Heritage routes. Feeds #1's survivability and reachability terms. Vantor pre/post pairs with OSM/fAIr footprints; xBD models lose ~20% (minor) to ~50% (major) on unseen events and xBD's flood classes are 92% no-damage, so label a few hundred local examples (Google/WFP SKAI is built for that — 500k buildings Myanmar 2025, "13× faster"; Microsoft's toolkit was used in Turkey 2023). At a few hundred settlements, human QA of the output is feasible and should be done.

**Don't spend time on** Sentinel-1 flood-*water* segmentation here: layover and shadow in a steep gorge mimic water, slopes get masked by HAND/slope filters, revisit is 6–12 days, and a debris flow that has passed leaves mud, not open water. The debris polygon already exists (UNOSAT/NESRA/HOT); where optical is clouded out, use the 28 Aug Sentinel-1 pass against 16 Aug for coherence change and the Sentinel Asia damage-proxy map rather than training anything.

## Skip this week

- Sentinel-1 flood-extent ML (Sen1Floods11, Prithvi) — wrong terrain, wrong hazard, too slow.
- Landslide deep learning (Landslide4Sense F1 ~0.9 on benchmark, transfers poorly) — hand-mapping on VHR is faster at this scale.
- Drone RF/IMSI detection, acoustic drones (Fraunhofer LUCY), UWB through-rubble radar (NASA FINDER — 4 saved in Chautara 2015) — real tools, hardware you don't have; tunnels are the one place they'd matter and China/India teams may bring them.
- Generic tweet classifiers (CrisisMMD/HumAID) — warm starts for #2's status extractor only.
- Anything that needs internet at the forward base, or Starlink.
- Lost-person-behaviour (ISRID) rings — these people are stranded at known place-types, not lost; use ISRID only for trekkers caught between teahouses on trail.
- A full 2nd-flood hydrodynamic simulation — the answer ("anyone in the channel bottom below the two lakes") is already acted on; a height-above-nearest-drainage flag on the Copernicus DEM gives the same term in an afternoon.

## Failure modes to design against

False positives burning sorties; cloud-only tools with no uplink at Dhunche; oblique-image geolocation error that sends ground teams to the wrong slope; models trained on Croatian meadows meeting Himalayan mud; four unreconciled lists; data that arrives after the morning flying window closes (S1 revisit, Flowminder day 9). And the 2015 lesson: outsiders who extracted imagery and shared nothing back were resented, and the government responded by restricting drones.

## What has actually changed outcomes in past disasters

Helicopters exploiting weather windows; local knowledge of where people shelter; phones re-attaching as towers return; satellite messengers (inReach SOS routed to Nepal authorities in 2015; ~12% self-rescue); simple pre/post imagery used to list cut-off communities and run welfare checks (Helene); crowd-consolidated address lists handed to rescue teams (afetharita, QuakeMap). **Mostly hype for this scenario:** CV person detection as a primary finder, Sentinel-1 flood ML in gorges, drone IMSI catchers you don't have, acoustic drones, generic tweet classifiers.
