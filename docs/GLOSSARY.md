# Glossary

Terms a collaborator will hit in this repo and in the response. Nepali-administrative and humanitarian-system jargon mixed deliberately — rescuers use both.

## Disaster / hydrology

- **GLOF** — Glacial Lake Outburst Flood. Sudden release of water from a glacier-dammed or moraine-dammed lake. The 2026-08-26 event is being described as a glacier/rock collapse triggering a debris flow; the *secondary* risk is closer to a classic outburst from landslide-dammed ("barrier") lakes.
- **LLOF** — Landslide Lake Outburst Flood. Outburst from a lake impounded by landslide debris. The live secondary threat upstream of Rasuwagadhi is this type.
- **Barrier lake / dammed lake** — Lake formed when landslide/debris blocks a river channel. Unstable; can burst with little warning.
- **Debris flow** — Fast-moving mixture of water, mud, rock, ice. Distinct from clear-water flooding; buries rather than inundates, which changes both damage patterns and survivor search methods.
- **DEM / DSM** — Digital Elevation Model / Digital Surface Model. Terrain height rasters used for flow-path modelling and elevation differencing.
- **SAR** — Synthetic Aperture Radar. Satellite radar imaging that penetrates cloud and works at night (e.g. Sentinel-1). The workhorse for monsoon-season flood mapping.
- **HKH** — Hindu Kush Himalaya region (ICIMOD's operating area).

## Nepali administration & institutions

- **NDRRMA** — National Disaster Risk Reduction and Management Authority. Nepal's federal disaster agency.
- **BIPAD** — Building Information Platform Against Disaster (`bipadportal.gov.np`). Nepal's national disaster information management system, owned by NDRRMA. Nepal Police are the authorised incident-data reporters.
- **DHM** — Department of Hydrology and Meteorology. River levels, rainfall, flood bulletins.
- **DoR** — Department of Roads (road-status dashboard "Navigate").
- **APF** — Armed Police Force. One of Nepal's three security services doing ground SAR (with Nepali Army and Nepal Police).
- **DEOC / NEOC** — District / National Emergency Operations Centre.
- **LEMA** — Local Emergency Management Authority (INSARAG term for the national/local authority in charge).
- **VDC / ward / palika** — Nepali administrative units. VDCs were replaced (2017) by rural municipalities (gaunpalika) and municipalities (nagarpalika), subdivided into wards. Old datasets still use VDC boundaries — a real join hazard.
- **Bikram Sambat (BS)** — Official Nepali calendar, ~56.7 years ahead of Gregorian (AD/CE). Official bulletins mix BS and AD dates. 2026-08-26 AD ≈ 2083-05-10 BS.

## International response machinery

- **INSARAG** — International Search and Rescue Advisory Group (UN OCHA network). Sets USAR standards.
- **ICMS** — INSARAG Coordination and Management System. Esri/ArcGIS + Survey123-based system for USAR coordination: worksites, sectors, team tasking.
- **ASR levels 1–5** — Assessment, Search and Rescue levels: 1 wide-area assessment → 2 sector triage → 3 rapid search → 4 full search → 5 total coverage.
- **OSOCC / Virtual OSOCC** — On-Site Operations Coordination Centre; the Virtual OSOCC is the online coordination platform (GDACS) for international responders.
- **GDACS** — Global Disaster Alert and Coordination System.
- **UCC** — USAR Coordination Cell.
- **RDC** — Reception and Departure Centre (for arriving international teams).
- **EMS / CEMS** — Copernicus Emergency Management Service. EU rapid-mapping service; this event is activation **EMSR927**.
- **International Charter** — "Space and Major Disasters" charter: satellite operators provide free imagery to registered users for a disaster activation.
- **UNOSAT** — UN Satellite Centre (UNITAR). Rapid mapping + the FloodAI Sentinel-1 pipeline.
- **ICIMOD** — International Centre for Integrated Mountain Development (Kathmandu). Regional authority on glacial hazards; runs SERVIR-HKH.
- **RFL** — Restoring Family Links, the ICRC/Red Cross family-tracing network. The authoritative channel for tracing missing persons.
- **DVI** — Disaster Victim Identification (Interpol protocol).
- **PFIF** — People Finder Interchange Format. Open XML standard for exchanging missing-person records between registries with provenance intact.
- **CODs** — Common Operational Datasets (OCHA-curated boundaries, population, P-codes).
- **P-code** — Place code: stable unique IDs for admin units, used to join humanitarian datasets.

## Mapping / data ecosystem

- **HOT** — Humanitarian OpenStreetMap Team. Activates volunteer mappers after disasters.
- **Tasking Manager** — HOT's tool that splits mapping work into gridded tasks for volunteers.
- **fAIr** — HOT's AI-assisted mapping platform (building-footprint prediction from imagery).
- **OAM** — OpenAerialMap: openly licensed post-event aerial/drone imagery.
- **STAC** — SpatioTemporal Asset Catalog: JSON standard for indexing satellite imagery (used by Vantor/Maxar open data).
- **COG** — Cloud-Optimized GeoTIFF.
- **HDX** — Humanitarian Data Exchange (`data.humdata.org`), OCHA's open data portal.
- **KoboToolbox / ODK** — Offline-capable mobile form/data-collection tools widely used in humanitarian field work; NDRRMA already uses KoboCollect.
