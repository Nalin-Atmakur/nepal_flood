# Responder gap analysis — 2026-08-29

*Decision-quality desk brief for a small remote technical team. Live response: facts can become stale within hours.*

> **Evidence boundary:** no member of this project has yet interviewed a responder or joined an operations cell. `EVIDENCED` below means the operational pain is directly reported. It does **not** mean the proposed software is wanted. Every build candidate remains conditional on a named operational owner, a sample of non-sensitive input data, and a person who will use the output during a shift.

## Bottom line

**Do not build the collaborative heatmap.** The live HOT activation already combines dated imagery, task grids, updated OSM, flood extent and AI-assisted damage data, while HOT/NAXA already have drone- and field-tasking products (→ ../sources/2026-08-29--hot-osm--activation-wiki.md, ../sources/2024-06-11--hot--drone-tasking-manager.md, ../sources/2026-08-29--hot--field-tasking-manager.md). A new destination map would add a stale surface and another inbox.

The strongest project shape is a **small, private operations sidecar**: transform material an authorised cell already owns into a verified, offline handoff packet or import bundle. The clearest high-impact discovery target is a **versioned tunnel-rescue worksite pack**. The easiest technical target with an open adoption channel is a **drone-intake QA/packaging adapter**. Neither should be built past a paper prototype until its owner confirms the manual bottleneck.

## Current operational picture that changes the product choice

- Search teams are working through 1.2–1.5 m of mud at a hydropower tunnel site, with few helicopter landing places; poor weather interrupted flights and a secondary-flood warning forced teams to relocate. Nepal explicitly requested tunnel-rescue, survivor-detection, forensic/DNA and refrigeration support (→ ../sources/2026-08-29--ap--day-four-rescue.md). These are specialist, physical bottlenecks; an AI heatmap does not remove them.
- About 40 km of road and 41 bridges were reported damaged or destroyed, leaving some same-municipality journeys dependent on helicopters (→ ../sources/2026-08-29--kathmandu-post--bridges-choppers.md). Yet an alternative road into Rasuwa and 145 of 198 affected telecom sites were reported restored later on 29 August (→ ../sources/2026-08-29--radio-nepal--response-restoration.md). **The operational need is a trusted delta with timestamps, not another static basemap.**
- Government opened a central drone-photo/video intake specifically to verify and reuse existing collection instead of flying again (→ ../sources/2026-08-29--khabarhub--drone-imagery-form.md). The unverified part is what happens after upload: rights checks, deduplication, metadata extraction, georeferencing, cataloguing and routing.
- Family and identification information is physically and institutionally fragmented. At one temporary body centre, photos/records had been prepared for 82 of 233 recoveries; facilities and specialists were overloaded and remains were moving between districts (→ ../sources/2026-08-29--kathmandu-post--morgue-dvi-backlog.md). Families have also been moving between barracks, police stations and hospitals (→ ../sources/2026-08-29--multiple--missing-lists-fragmentation.md). This is a real information backlog, but it is also the highest-risk lane for outsiders.

## Ranked opportunities

### 0 — Contribute now: HOT validation and data QA

**Status:** `EVIDENCED / ALREADY ADOPTED`  
**Build required:** none

Join the existing HOT/NAXA activation where it has open tasks. This does not satisfy the wish to make a product, but it is the only immediately available path where work is already requested, delivered through an established Nepal partner and unlikely to distract a responder.

**Verdict:** do this in parallel with product discovery. Do not wrap it in a new UI.

### 1 — Tunnel Rescue Worksite Pack

**Status:** operational pain `EVIDENCED`; information gap `HYPOTHESIS`  
**Users:** Army/Police rescue cell, plant operator and invited tunnel-rescue specialists  
**Time to first useful output:** hours after receiving current plans and an owner

**Specific problem:** reports distinguish several active hydropower tunnel worksites, but public coverage frequently conflates Upper Trishuli-1, 3A and 3B. At least one site has mud-obscured access and limited landing options. Incoming specialists need one current, unambiguous handoff artifact per worksite. Public UT-1 material already contains layouts for adits, tunnels, shafts, bridges and access roads — and also shows that designs moved or cancelled features, making version control essential (→ ../sources/2026-08-29--government-nepal--ut1-seia-layout.md).

**Lean deliverable:** a private, versioned pack per worksite, generated from operator-approved material:

- unique project/worksite ID — never rely on the name alone;
- operator-approved as-built plan and portal/adit/shaft table;
- latest verified access and landing observations, with source and time;
- pre/post imagery contact sheet and offline GeoPDF/MBTiles;
- hazards and exclusion zones copied only from the authorised safety owner;
- one-page change log and a checksum/version label so teams know they have the same pack.

This is mostly data concierge work plus a repeatable packager, not a web app and not an algorithm that declares a route or landing zone safe.

**Two-hour validation question:** *Does each tunnel-rescue lead already have the operator's current georeferenced as-built plan, portal/adit coordinates and a dated access sheet in an offline format? If not, who can approve source material?*

**Kill condition:** the rescue cell already has a current plan pack, or no operator/command-cell owner will verify it. Never send public-plan guesses into operations.

### 2 — Drone Intake QA and Packaging Adapter

**Status:** intake need `EVIDENCED`; processing backlog `HYPOTHESIS`  
**Users:** NDRRMA's imagery intake owner, NAXA/YIL or HOT  
**Time to prototype:** one day with a redacted Form export and sample imagery

**Specific problem:** a Google Form can centralise uploads but does not itself make heterogeneous photos and videos analysis-ready. A bounded adapter could turn each submission into a review bundle:

- SHA-256 hashes and duplicate/near-duplicate flags;
- EXIF capture time, GPS, altitude, orientation and device, preserving originals;
- flight grouping, footprint/track GeoJSON where metadata permits;
- rights/licence, uploader-attestation and missing-metadata flags;
- thumbnails/contact sheet plus STAC-compatible manifest;
- a failure queue for human review — no automated rescue or damage claims.

The output should feed the government's existing intake and HOT/NAXA tooling, not become a new imagery portal. DroneTM already covers collection tasking, and the HOT activation already has an imagery viewer (→ ../sources/2024-06-11--hot--drone-tasking-manager.md, ../sources/2026-08-29--hot-osm--activation-wiki.md).

**Two-hour validation question:** *After a Form submission arrives, which exact step consumes the most analyst time, and is that step already handled by NAXA/YIL, DroneTM, OpenAerialMap or an internal pipeline?*

**Kill condition:** the official intake already generates equivalent manifests/QA, or the team cannot test against representative non-sensitive data. In that case, offer the missing adapter or tests to the existing codebase.

### 3 — Offline Access Delta Pack

**Status:** access volatility `EVIDENCED`; demand for this format `HYPOTHESIS`  
**Users:** district EOC, helicopter/relief coordination, health referral desks  
**Time to prototype:** one day after an authoritative status owner is named

**Specific problem:** access status is changing faster than broad maps can be reviewed. The deliverable would be a dated change sheet — *opened, closed, restricted, unverified, last observation, source* — plus CSV/GeoJSON and a small printable/offline map. It would ingest BIPAD/Department of Roads data and authorised field observations rather than scrape rumours. No routing recommendation and no “safe” label.

**Two-hour validation question:** *Who currently maintains the shift-to-shift road/bridge/landing-status ledger, in what format, and which downstream team fails to receive it?*

**Kill condition:** there is no shift owner who will refresh/correct it. A stale access product is more dangerous than none. If collection is the issue, configure Kobo/ODK or HOT Field-TM rather than writing another field app.

### 4 — Official-only Reconciliation or DVI Sidecar

**Status:** backlog `EVIDENCED`; volunteer role `BLOCKED WITHOUT INVITATION`  
**Users:** Nepal Police/NDRRMA/NRCS or an authorised forensic/DVI lead

There are two potentially valuable narrow tools: (a) local-only, human-reviewed candidate matching across authorised rescued/missing/admitted lists, including Devanagari↔Latin variants; and (b) offline batch capture/label/transfer-manifest support for DVI facilities. Both address observed backlogs. Both process extremely sensitive data, already have official protocols, and can cause irreversible harm if identifiers or matches are wrong.

**Verdict:** do not prototype with real data, solicit records or publish a registry. Proceed only after a named data controller invites the work, defines retention/access rules and confirms the tool fills a gap in the existing Police/ICRC/Interpol workflow. Synthetic-data code is not useful enough to justify distracting those teams during rescue.

## Explicit no-build list

| Idea | Why not now |
|---|---|
| Collaborative damage/priority heatmap | HOT/NAXA, CEMS/UNOSAT and the activation viewer already occupy the surface; reachability changes too fast; no operational owner. |
| New missing-person or survivor registry | Creates another silo, attracts PII and competes with official channels; observed public clones have low adoption. |
| New drone- or field-tasking app | HOT/NAXA already built DroneTM and Field-TM. Configure or extend them. |
| “AI survivor detector” from satellite/drone imagery | The government is asking for specialist detection hardware/expertise; remote imagery cannot reliably see survivors below mud or inside tunnels. |
| Public barrier-lake alert feed | Authoritative monitoring and warning chains are state-run; an unofficial alert can move rescuers or the public into danger. |
| Autonomous landing-zone or route recommender | Aviation and ground safety require current, accountable field verification; only package verified observations. |

## 72-hour validation sprint

1. Through HOT/NAXA or the team's existing IT contact, ask the three bold validation questions above. Send a one-page capability offer, not an app link.
2. Select the first candidate that receives all three: **named owner, representative non-sensitive sample, and a daily user who accepts the output format**.
3. Produce one manual example before code. Measure whether it saves a real shift task (minutes per submission, fewer ambiguous worksite names, or faster handoff).
4. Automate only the repeated transformation. Keep the source of truth in the owner's existing system.
5. If no candidate gets an owner within 72 hours, stop product work and contribute to HOT validation/data QA. Lack of adoption is a kill signal, not a prompt for a public launch.

## Recommendation

**First discovery target:** Tunnel Rescue Worksite Pack, because the physical bottleneck is urgent and the deliverable can be useful within a shift if the rescue cell lacks a verified pack.  
**First plausible code target:** Drone Intake QA and Packaging Adapter, because it works on non-personal data and can plug into a public, official intake.  
**Default action while validating:** HOT/NAXA mapping validation and data QA.

The project succeeds if it removes one manual handoff bottleneck inside an existing response channel. It fails if it creates another destination rescuers must remember to check.
