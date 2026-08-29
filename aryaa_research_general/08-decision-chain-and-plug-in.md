# 08 — Who decides, and how to plug in

*The consumer of any output is the Army operations cell. Nothing reaches it cold. As of 2026-08-29.*

## Helicopter and SAR tasking chain (NDRF 2013 structure, confirmed)

Ministry of Home Affairs → **National Emergency Operation Centre (NEOC)** → **NDRRMA** (Executive Chief) → **Nepal Army command post inside NEOC** (Directorate of Military Operations) → Army camps at **Dhunche** (Rasuwa) and **Bidur** (Nuwakot); **District Emergency Operation Centres** under the Rasuwa and Nuwakot Chief District Officers. Tunnel rescue is a separate Army-led cell with NEA/IPPAN. Private helicopters fly under the NDRRMA–Airline Operators Association MoU (14 Jul 2026); drones under the NDRRMA–Drone Association Nepal MoU. The Army's Directorate of Disaster Management has a public office contact on disaster.nepalarmy.mil.np — do not expect to reach it cold.

## Entry points, in order

1. **Nepal Hackathon** (nepalhackathon.org; hello@nepalhackathon.org) — kickoff Sun 30 Aug 09:00 NPT; ask to be matched to a NAXA/NDRRMA-scoped problem. Its stated principles (Nepal-led, remote, handed over, no identifying data) are precisely the posture the government will accept. **Provenance unverified** — no organisation named on the site (see 10).
2. **NAXA** (Kathmandu GIS firm running the HOT activation with NDRRMA) — the government-adjacent node for geodata and for getting a product in front of NDRRMA.
3. **HOT Open Mapping Hub Asia-Pacific** — tasking manager, fAIr footprints, HDX pipeline; coordination contact on the activation wiki.
4. **NESRA / Youth Innovation Lab** — drone orthomosaics, EO dashboard; YIL also built BIPAD.
5. **Kathmandu Living Labs** — no public 2026 activity found, but the 2015 QuakeMap → Army pipeline is theirs; worth a direct message.
6. **ICIMOD** (media@icimod.org; in direct contact with the PM's office; SERVIR-HKH) — the credible channel for barrier-lake hazard products, not for SAR.
7. **Drone Association Nepal / NagarikAlert** — consumers of the triage kit; supply models and processing, never fly.
8. **Nepal Red Cross / ICRC Restoring Family Links** — the canonical family-tracing actors; NRC runs an information desk in Rasuwa.

## Constraints that will bite

- **Do not fly.** CAAN permits (2–4 weeks normally), 120 m ceiling, border and national-park zones restricted, disaster TFRs active. Foreign drone teams were the 2015 backlash (government banned non-humanitarian drones after media abuse; communities resented teams that took footage and shared nothing).
- **Border sensitivity.** Timure/Rasuwagadhi is a customs/immigration/APF zone; Chinese-side data flows only via ICIMOD/DHM; Tibet footage is censored. Route high-resolution products of the border strip through official channels only.
- **Language.** Outputs in Nepali (Devanagari) with placenames as officials use them; Rasuwa is majority Tamang-speaking but officials read Nepali. BIPAD is bilingual.
- **Data protection.** Hackathon bars identifying data on affected persons; ICRC RFL rules apply to missing lists; this repo's D2 rule. Reconciliation must run on the Nepali side or on hashed identifiers.
- **Foreign presence.** Nepal refused SAR teams; the acceptable posture is remote, Nepal-led, handed over.

## Precedents: what actually reached rescuers in Nepal

| Event | Tech | Verdict |
|---|---|---|
| 2015 Gorkha quake | KLL QuakeMap (Ushahidi): 2,035 reports, 978 verified, 434 acted on, ~650 air-rescue requests; Army used it to task helicopters | **Worked** because KLL ran a physical situation room, phone-verified every report against local officials, and handed a filtered list to Army ops. |
| 2015 | HOT OSM: thousands of mappers, buildings/roads traced in 48 h | Worked for logistics, not for locating individuals. |
| 2015 | Flowminder + Ncell CDR: pre-signed Dec 2014 agreement; de-identified data in 6 days; displacement report in <2 weeks | Worked *only* because the MoU pre-existed. No 2026 CDR release reported. |
| 2015 | Google Person Finder (5,700 records), FB Safety Check (8.5 M) | Useful for families; useless where networks were down. |
| 2015 | UAViators coordinated 15 drone teams → government banned non-humanitarian drones | Cautionary. |
| 2015 | Foreign SAR influx | "Coordination and management issues" — the stated reason foreign teams are refused in 2026. |
| Melamchi 2021 | Drone rapid assessment (World Bank/GFDRR) | Good for damage; delayed by permits. |
| Thame GLOF 2024 | ICIMOD forensic study | Post-hoc science; no rescue role. |
| Sept 2024 Kathmandu floods | 246 dead; "absence of effective readiness"; BIPAD was the counting system | Institutional lesson, not tech. |
| Rasuwa/Lhende July 2025 | Same corridor; DHM had no gauge at Rasuwagadhi; China data-sharing never formalised | Directly relevant, 14 months later. |

Net lesson: the only tech that reached helicopter tasking in Nepal was a **verified, geolocated, prioritised list handed to Army ops by a trusted local org**. Raw dashboards did not.
