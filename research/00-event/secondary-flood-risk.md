# Secondary flood risk — barrier lakes

*The live hazard. Last updated 2026-08-29. Anyone updating this repo: refresh this file first.*

## Situation as of 2026-08-29

- **Two impoundments** have been described: an upper lake inside China where meltwater pooled, and a lower barrier lake at the Chhochen Khola–Purepu Tsangpo confluence at/just north of the border. (→ sources/2026-08-28--al-jazeera--two-lakes-explainer.md)
- The lower lake: as of 2026-08-27, China's Ministry of Water Resources put it at ~2,000,000 m³, already overflowing, with ~3,000,000 m³ additional inflow projected in three days. (→ sources/2026-08-27--kathmandu-post--barrier-lake-warning.md)
- **It breached on 2026-08-28.** Rescue was suspended ~3 hours; observed downstream rise ~0.6 m; Chinese state media then reported the level down ~10 m and risk "gradually decreasing". (→ sources/2026-08-28--kathmandu-post--barrier-lake-breach.md)
- ⚠️ **UNVERIFIED single-source claim (2026-08-29):** aerial footage shows a *second* blockage further upstream, larger by surface area than the first and still filling, with more rain forecast. Partially consistent with the two-lake description and continued Chinese warnings, but not corroborated by an A/B-grade source at time of writing. **Re-verify first in every update.**
- More monsoon rain is forecast; weather is already hampering air operations.

## Monitoring in place

| Who | What | Ref |
|---|---|---|
| China (MWR + engineering teams) | Drone aerial survey, portable satellite stations, 3D laser scanning of the barrier; flood simulation | sources/2026-08-28--scmp--china-response.md |
| Nepal (Army/NDRRMA/DHM) | Helicopter recce over Bhote Koshi from Dhunche; river-level monitoring; DHM analysis using Chinese satellite data | sources/2026-08-28--kathmandu-post--barrier-lake-breach.md |
| ICIMOD | Hydrological/seismic/remote-sensing analysis; notes cloud cover limits optical satellite observation; calling for cross-border early warning | sources/2026-08-26--icimod--preliminary-assessment.md |
| Sentinel Asia / Charter | SAR tasking (ALOS-2, EOS-04) — cloud-independent | sources/2026-08-26--sentinel-asia--emergency-observation.md |

## Evacuations tied to this risk

- Tibet: Gyirong port evacuation orders (26 Aug); 499 villagers evacuated, 555 stranded tourists relocated.
- Nepal: riverside settlements of Uttargaya RM under evacuation orders as levels rose 28 Aug (Betrawati, Mailung, Salletar, Shantibazar, Pairebesi, Khalti Basti, Sole, Trishuli, Battar — settlement names from an aggregator, partially `[UNVERIFIED]`).

## Why this matters for anything we build

1. **Rescuer safety is the binding constraint** — any prioritisation product that ignores flood-path exposure could send people into the path of a burst. This is the strongest technical argument for the "spot risk" layer in the team's concept (see `research/30-user-needs/priority-map-concept.md`).
2. **Cloud cover means SAR or nothing** for satellite monitoring of the lakes right now.
3. **The authoritative monitoring is cross-border and state-run** — China holds the instruments on the lake itself. A volunteer team cannot out-monitor them; it *can* track and relay what's published, faster and in one place.
