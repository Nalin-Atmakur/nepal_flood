# 05 — Already running (don't duplicate it)

*A surprising amount of the geospatial stack is already activated. The gap is not imagery; it is turning imagery and lists into a sortie plan. As of 2026-08-29. Full detail with product IDs in [agent-reports/geospatial-data-2026-08-29.md](agent-reports/geospatial-data-2026-08-29.md).*

## Satellite & aerial

- **Copernicus EMS EMSR927** (activated 26 Aug, four AOIs). Grading products AOI01–03 released 28–29 Aug as GeoPackages on HDX (CC-BY). Syabrubesi AOI (WorldView-3, 27 Aug 05:05 UTC): 240+ buildings destroyed, 32 damaged. AOI04 pending.
- **International Charter activation 1052** — requested by DHM via ADRC on 26 Aug; UNOSAT project-managing; ISRO/NRSC, BGS, SERTIT, K-water among value-adders. Eight products so far. Products are PDFs; tasked imagery is restricted — DHM/NDRRMA can request it. (Activation 895 in search results is the 2024 Kanchanpur flood — not this event.)
- **UNOSAT FL20260826NPL** — three HDX datasets (GDB + XLSX, CC-BY-SA): Rasuwa mudflow extent (~20 km² affected of 230 analysed; ~2,000 exposed: Gosaikunda RM 1,162, Uttargaya RM 665); Nuwakot extent; combined impact assessment (37 km², ~120 km road, ~5,000 buildings exposed, ~2,600 in Bidur). ArcGIS webmap.
- **Sentinel Asia** — ISRO EOS-04 C-band SAR at 11:39 UTC on 26 Aug (earliest post-event radar), ALOS-2, and an EOS-RS Sentinel-1 damage-proxy map (28 Aug). Web-GIS requester-only (DHM).
- **Sentinel-1** — first post-event pass S1D ascending orbit 85, 28 Aug 12:21 UTC (GRD + SLC on Copernicus Data Space; RTC on Planetary Computer); pair with 16 Aug. Next descending passes 31 Aug and 5 Sep. Ascending vs descending geometry matters in the gorge.
- **Vantor (Maxar) open data** (CC-BY-NC, STAC + COG): 13 items — WorldView-3 27 Aug ×4 at 0.35–0.39 m over Timure–Syabrubesi and Bidur, WorldView-2 28 Aug ×4, Legion 28 Aug — 71–81% cloud, usable in gaps. Pre-event includes a 0%-cloud Legion scene from Feb 2026 (Betrawati–Bidur). HOT mirrors a 0.37 m "Upper Flood Extent" composite on OpenAerialMap.
- **Planet crisis data** (CC-BY-NC, STAC on source.coop): 24 scenes — PlanetScope 26/28 Aug (62–93% cloud), **SkySat 27 Aug 02:00 UTC, 0.8 m over Rasuwagadhi and Syabrubesi (~50% cloud)**, three Pelican 0.55 m frames 27 Aug (the README calls them the most usable view of the channel). Don't trust `clear_percent`; don't difference SR against TOA.
- **Landsat-9** 04:47 UTC 26 Aug (~2 h after collapse, 47–68% cloud); **Sentinel-2** 27 Aug (54–78% cloud); nothing later ingested yet. Chinese CNSA/PowerChina-1 SAR and MNR 3D products are not open, but HOT serves a Chinese ZY-3 orthoimage as a tasking base layer.
- **NESRA FloodWatch** (Nepalese Space Research Association, with Infinity Innovation Center and Youth Innovation Lab): 101.6 km of river assessed, 4.1 km under cloud ("must not be interpreted as unaffected"); 3,216 buildings / 11.5 km road / 62 bridges intersect the path; "exposure, not damage"; machine-readable data on request. YIL has flown drone orthomosaics, not yet released — and there are **no drone orthomosaics on OpenAerialMap** as of 29 Aug.
- **HOT Open Mapping Hub AP + NAXA + NDRRMA** activation (hashtag `#nepal-flood-2026-trisuli-bhotekoshi`): tasking-manager campaign "2026 Nepal Floods" (upper-corridor buildings 100% mapped / 25% validated; upper roads 100/8; lower corridor 3–4%); daily OSM + Overture extracts on HDX; a 27 Aug flood-extent polygon (31.7 km²); bridge-damage GeoJSON; helipads/health/education points; fAIr AI damage score per footprint over ~18 km² of Vantor coverage — explicitly unvalidated ("cross-sensor can inflate destroyed calls").
- **Microsoft AI for Good** on HDX: Overture footprints + IHME population clipped to the UNOSAT extent — 4,977 buildings, ~10,204 people. The ready-made exposure prior.
- Combined viewers already exist: a disaster-imagery viewer stitching OAM/TM/S1/S2/UNOSAT layers, and a PMTiles corridor map.
- ICIMOD: media advisory and cause analysis; in direct contact with the PM's office; no downloadable rapid layers yet. NDRRMA used Planet/Landsat to spot the Nepal-side lake.

## Drones on the ground

- **Drone Association Nepal**: 20+ companies, 50+ pilots, thermal + LiDAR + loudspeaker drones, MoU with NDRRMA (15 Jul 2026), in Rasuwa/Nuwakot/Dhading.
- **NagarikAlert**: 5 thermal/cargo drones (2×100 kg, 1×50 kg, 2×15 kg lift), pilots flown in by helicopter.
- APF 6 drones + sniffer dogs; Nepal Police 4 drones; China 47 drones + 2 Wing Loong on its side.

## Volunteer tech

- **Nepal Hackathon** — Nepal-led, kickoff Sun 30 Aug 09:00 NPT, problems scoped by Nepal-based responders; asks for compute, satellite→damage maps, gauge/weather/melt fusion, drone-footage triage. Five ground rules incl. "nothing that identifies a person" and "no hazard ratings for named settlements". **No organisation, sponsor or institution is named on the site** — see 10.
- Independent trackers: flood-nepal (JSON API), a community missing registry (~5 cases), NxtImagine live dashboard; Rasuwa DAO published a list of rescued persons; hospital QR-code noticeboards.
- 2015 actors: Kathmandu Living Labs — no public 2026 activity found (site stale since 2022).
