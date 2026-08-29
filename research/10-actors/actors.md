# Actors — who is responding, who owns what data

*Compiled 2026-08-29. Tags: EVIDENCED (source ref) / HYPOTHESIS.*

## Nepal — government & security

| Actor | Role in this response | Data they own | Status |
|---|---|---|---|
| **NDRRMA** | National coordination; daily 10:00 bulletin; Rescue Coordination Centre strengthened under cabinet-minister oversight | BIPAD portal + API (incidents, losses, alerts) | EVIDENCED (→ sources/2026-08-29--ndrrma-ani--daily-bulletin.md) |
| **Nepali Army** | Lead SAR force (~4,200 troops; 13,295 total security personnel per one report); helicopter ops from Dhunche; tunnel rescues; **nerve centre at Trishuli barracks, Nuwakot** where families gather | Operational tasking (closed) | EVIDENCED |
| **Nepal Police / APF** | Ground SAR, body recovery downstream; Police are the authorised BIPAD incident reporters; 28 police + 13 APF personnel themselves missing (as of ~28 Aug) | Incident reports, missing-person reports | EVIDENCED |
| **DHM** | River monitoring, flood bulletins; requested the Sentinel Asia activation; analysing trigger with Chinese satellite data | River/rain gauge data (dhm.gov.np river watch) | EVIDENCED |
| **Dept. of Roads** | Road status | Navigate dashboard (navigate.dor.gov.np) | EVIDENCED as standing system |
| **District EOCs (Rasuwa CDO, Nuwakot, downstream districts)** | District-level coordination; received the barrier-lake breach warning chain | District sitreps | EVIDENCED |
| **Nepal Tourism Board / Dept. of Immigration** | Compiling missing-tourist lists (667–668 from 34 countries as of 27 Aug) | Tourist/trekker manifests (closed, PII) | EVIDENCED |

## Nepal — non-government

- **Nepal Red Cross Society** — relief, family links (RFL lane), DREF launched 26 Aug. EVIDENCED (→ sources/2026-08-29--reliefweb--disaster-page.md)
- **Civilian helicopter operators** — Kailash Helicopter Services, Simrik Air, Annapurna Helicopters flying rescue sorties alongside military. EVIDENCED
- **Trekking/travel agencies** — posting route status, tracing their own clients; the tourism industry is acting as a de-facto tracing channel for foreign trekkers. EVIDENCED (grade C/D sources)
- **NAXA** (Kathmandu geo-IT firm) — co-running the OSM activation with HOT and NDRRMA. EVIDENCED (→ sources/2026-08-29--hot-osm--activation-wiki.md)

## China (Tibet side)

- National Fire and Rescue Administration: 681 firefighters, 47 drones, 13 dogs (as of 27 Aug evening); PLA + Sichuan teams; "all-out" search ordered at top level; barrier-lake engineering assessment (3D laser scan, drone survey, flood simulation). EVIDENCED (→ sources/2026-08-28--scmp--china-response.md)
- Information environment: Tibet-side information flows only through state media; foreign journalists denied access; local videos scrubbed. Plan around official Chinese releases being the *only* Tibet-side source.

## International

- **UN**: CERF $2M; OCHA flash updates; IOM sitreps. **India**: 10 t supplies (+177–320 nationals unaccounted across reports). **Australia**: $3.6M. Foreign USAR/technical teams: acceptance of limited foreign assistance reported — composition `[UNVERIFIED]`.
- **Space/mapping pipeline**: Copernicus EMS (EMSR927), UNOSAT, Sentinel Asia + International Charter (activation 1052), Vantor open data, Planet (source.coop), HOT + Open Mapping Hub Asia-Pacific + Mapbuds (drone imagery, fAIr). All EVIDENCED — see `research/60-ai-and-satellite-approaches/live-data-sources.md`.

## Reading of the landscape (HYPOTHESIS)

The geospatial/mapping lane is **well-organised and open to volunteers** (HOT/NAXA/NDRRMA activation with published contact). The *family-information* lane looks fragmented across Police, Tourism Board, embassies, agencies, and Chinese authorities — multiple unreconciled missing lists are visible in the counts themselves. That fragmentation is a fact about the hardest problem, not an invitation to add another list (see `research/50-ethics-and-legal/DO_NO_HARM.md`).
