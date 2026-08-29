# 10 — Discussion log (29 Aug 2026)

*Reasoning from the working session, kept because the decisions depend on it. Newest last.*

## The notebook sketch vs. "a social-media-like platform to manage the whole effort"

Aryaa's sketch ([sketch/](sketch/)): flood path → overlay road network → isolated areas → overlay population density → overlay 2nd-flood simulation → highest-priority zones.

**Assessment.** Steps 1–4 of the sketch already exist as downloadable files as of 28–29 Aug: UNOSAT's impact GDB is "flood path × buildings", HOT's bridge-damage GeoJSON is "road-network cuts", and Microsoft's HDX exposure layer is literally "isolated area × population" (4,977 buildings, ~10,204 people inside the 37 km² extent). Step 5 (the 2nd-flood simulation) is the one part nobody has published, and its value is low: the answer is "anyone in the channel bottom below the two barrier lakes", which the Army already acts on with 1 km pull-backs on every alert from China's monitoring post. Approximate it with height-above-nearest-drainage on the Copernicus DEM in an afternoon; HEC-RAS is not needed. What the sketch *lacks* is the contact-status term — who is expected in each pocket and who has been confirmed reached — and that is the data nobody has assembled.

**On the platform idea — strong caution:**
- *Adoption.* Day 4 of a military-led operation; NEOC/NDRRMA/Army/Police will not switch tools and will not open a platform built by four people outside Nepal. Every disaster spawns a dozen volunteer coordination apps; in 2015 the only one that reached helicopter tasking was QuakeMap — because KLL phone-verified every report and *handed the Army a filtered list*, not because of the platform.
- *Fragmentation.* There are already: the MoFA WhatsApp intake, the NTB list, police bulletins, IPPAN rosters, the Rasuwa DAO rescued list, hospital QR boards, three independent trackers, and the hackathon as the volunteer hub. One more app worsens the fragmentation that makes the missing count swing 977 → 2,426 overnight.
- *PII near the China border, hosted abroad.* The hackathon bars identifying data; a foreign-run platform holding missing-person records would be a hard no.

**The synthesis.** The *narrow* version of the platform idea and the *named-people* version of the sketch are the same product: **one reconciled "who is where" register** — every person reported missing/rescued/safe, deduplicated, resolved to one of ~60 corridor places, rolled up to per-pocket expected vs confirmed vs unknown, exported each morning as a Nepali table to the Dhunche cell via NAXA/NDRRMA. It doesn't need rescuers to adopt anything; it's the only thing that *shrinks* the search; "expected > confirmed" per pocket *is* the priority map, with real headcounts (IPPAN, TIMS, operator manifests) instead of population density; the sketch's isolation and 2nd-flood terms become two columns on that table.

**Fast test for tomorrow:** at the 09:00 NPT kickoff ask NAXA/NDRRMA one question — *"Is there one reconciled list of the missing, resolved to location?"* If no, build this. If yes, ask what it lacks. Build nothing before asking.

## What PII means here, and why it constrains the plan

Personally Identifiable Information — anything identifying a specific person alone or in combination: names, passport/citizenship numbers, dates of birth, phone numbers (MSISDNs), photos, addresses, emergency contacts, and "last seen at Hotel X with agency Y" when tied to a name. It matters because (a) the hackathon and this repo bar it; (b) authorities, MoFA, embassies and ICRC/NRCS (Restoring Family Links rules) will not hand names to an unknown foreign team, and the border zone makes them extra cautious; (c) a leaked missing list is a scammer's target list for grieving families, and hydropower rosters contain foreign contractors' passport details — the 655-row PII table already circulating via a travel-news site is the exhibit.

Two ways around it: **(1) run the join on the Nepali side** — we build the code, NAXA / hackathon organisers / NDRRMA run it on the real lists, only aggregates come back (the clean option); **(2) hashed identifiers** — list-holders normalise names (transliteration, lowercase, strip spaces) and hash name+DOB+nationality; we match hashes without seeing names. Weaker, because spelling variants break hashes — the very problem being solved — so a fallback, not the plan.

## "So what can we even do?"

The PII constraint blocks *holding the names*, not the work that makes the names useful. Without seeing a single record:

1. **Build the reconciliation pipeline and hand it over** — normalisation, transliteration-aware matching, place resolution; developed on synthetic/public data, run by a Nepali partner.
2. **Build the corridor gazetteer** — ~60 places with coordinates, elevation above debris, reachability, in-channel-below-lakes flag. Zero PII, needed by everyone, doesn't exist as one clean file. This is the sketch minus the simulation.
3. **Geolocate the hydropower adits and portals** from pre-event Vantor imagery and project documents — hours of work; could matter for the people with the least time.
4. **Ship an offline drone-image triage tool** to Drone Association Nepal — terrain imagery is not PII.
5. **Label buildings and bridges** on the Vantor pre/post pairs.

Only item 1's *execution* and the phone-records idea touch PII, and both resolve the same way: we write it, a Nepali partner runs it.

## Alignment with `docs/DECISIONS.md` D3 (teammate's independent analysis)

Read on 29 Aug after the above was written. D3 reaches the same verdict independently: Wedge 1 (HOT validation/mapping + hackathon — do now), Wedge 2 (fusion triage product delivered through HOT/NAXA/NESRA, with a daily kill condition — this is the sketch), Wedge 3 (barrier-lake watch script, private relay only), and the **rejected** standalone missing-persons platform, whose surviving variant (a) — an invite-only reconciliation service offered *to* an official list-holder through a Nepali intermediary — is exactly this research's #1. Two additions proposed: the portal-geolocation task (cheap, time-critical, not in D3), and roster-based headcounts (IPPAN, TIMS) instead of 2016-vintage HRSL as Wedge 2's population input — a weakness D3 itself flags.

## Answers to open questions

**#2 — Who is behind nepalhackathon.org?** (checked 29 Aug ~12:30 UK) The site names **no organisation at all**: no sponsors, partners, host, venue or Nepali institution — only individual contributors. Contacts: hello@nepalhackathon.org and corrections@nepalhackathon.org; LinkedIn `nepal-hackathon`, Instagram `@nepalhackathon`, Facebook `nepalhackathon.org`. Registration: "call link emailed once the platform is confirmed". No formal tracks; focus areas are damage mapping, hydrological analysis, drone-footage processing, recovery systems; work "scoped by Nepal-based responders". Five ground rules: agenda originates from Nepal; cite sources with confidence levels; no hazard ratings or evacuation guidance for named settlements; build for handover to Nepal-based teams; nothing that identifies a person. **Legitimacy therefore still unverified** — promising but unproven. Ask the convener's IT contact whether they can vouch for it; check who shares the LinkedIn page; email hello@ asking which responder organisations are scoping problems.

**#10 — Is the "second, larger upstream blockage" corroborated?** Yes, by separate sources: the larger Chinese-side lake at the Chhochen Khola–Purepu Tsangpo confluence (>2.5 M m³, 150 × 40–50 m barrier, overflowing since 28 Aug, +3 M m³ inflow expected to 30 Aug — Global Times; CNN) and the smaller Nepal-side Lhende lake (~0.11 km², ~18 km above Rasuwagadhi, identified by NDRRMA in Planet/Landsat on 27 Aug — Onlinekhabar). Sources disagree only on whether the second dam "collapsed" (JoongAng) or "overflowed with decreasing risk" (Xinhua/Euronews); NESRA: one draining, a second larger one "under assessment". See 01.

**#8 — KLL active?** No public 2026 activity found in any source consulted; site stale since 2022. Unanswered.

**#9 — NAXA/YIL own the drone-form → map plumbing?** YIL is NESRA's "Drone Field Assessment Contributor" and has flown orthomosaics (unreleased); NAXA runs the HOT tasking-manager with NDRRMA. Likely yes for the imagery side; the form plumbing is unconfirmed.

## Research method note

Four parallel research passes on 29 Aug (rescue operations; satellite/geospatial activations; ML-methods literature; Nepal data/organisation ecosystem — raw outputs in [agent-reports/](agent-reports/)) plus direct reading of primary event coverage. ~200 web queries. Web-search budget for the session was exhausted at the nepalhackathon.org check; further lookups need a fresh session.
