# Agent reports

Raw outputs of four parallel research passes run on 29 Aug 2026 (each ~100–130 web fetches/searches), lightly edited only to remove personal data per this repo's D2 rule (individuals → roles; personal mobile numbers and private emails removed). They are denser and more heavily sourced than the synthesis sections and should be preferred when a specific number or product ID is needed.

| File | Question it answered |
|---|---|
| [rescue-operations-2026-08-29.md](rescue-operations-2026-08-29.md) | Where are people known alive and stranded; how are they being located; what is blocking rescue; who coordinates; weather outlook |
| [geospatial-data-2026-08-29.md](geospatial-data-2026-08-29.md) | Every satellite/aerial/crowdsourced activation and dataset, with product IDs, dates, cloud cover, access paths |
| [ml-methods-2026-08-29.md](ml-methods-2026-08-29.md) | State of the art (2023–26) for locating survivors: aerial person detection, satellite damage mapping, search prioritisation, non-imagery signals; honest assessment; top-5 |
| [nepal-ecosystem-2026-08-29.md](nepal-ecosystem-2026-08-29.md) | Nepal precedents (2015, 2021, 2024, 2025), decision chain, organisations, data assets, legal constraints, plug-in path |

*Note: of the four afternoon reports, only `rescue-operations-2026-08-29.md` is currently in the repo; the other three are referenced by the synthesis but were not committed.*

## Evening data-sweep pass (29 Aug, ~17:00–19:00 UTC)

Five parallel sweeps (each ~60–200 searches + ~90–110 direct fetches/API calls) answering one question: *what data about this event is publicly available, and how do you get it programmatically?* Synthesised into [../11-data-catalogue-2026-08-29.md](../11-data-catalogue-2026-08-29.md). Same PII rule applied: institutional hotlines kept; personal numbers, and names of affected/rescued individuals, removed.

| File | Domain |
|---|---|
| [deepdive-official-2026-08-29.md](deepdive-official-2026-08-29.md) | Nepal federal/district/provincial institutions, China, India, consular, UN/humanitarian — incl. the undocumented NDRRMA REST API, every NDRRMA event PDF, Police UDB structure, DHM POST feed, DoR RIMES backend, official figure chain |
| [deepdive-crowd-2026-08-29.md](deepdive-crowd-2026-08-29.md) | Bottom-up / social / community sources — OPMCM portal API, Setu Rapid, volunteer bulletin repo, trackers, ~30 GitHub repos, operator/pilgrim-group counts, embassies, Reddit/X/Telegram/Facebook access matrix, fact-check desks |
| [deepdive-geospatial-2026-08-29.md](deepdive-geospatial-2026-08-29.md) | HDX, EMSR927 internals, Charter 1052, UNOSAT, Vantor, Planet, HOT S3/TM/OSM live counts, OAM, Sentinel/Landsat acquisitions, NESRA public bucket, Hugging Face/Zenodo/GitHub datasets, seismic IDs, GDACS, hydropower GIS, DEMs/footprints/population |
| [deepdive-signals-2026-08-29.md](deepdive-signals-2026-08-29.md) | Telecom restorations, devices, **ADS-B helicopter test (negative, with method)**, DHM/BIPAD hydrology endpoints and corridor gauge status, weather APIs and flying windows, seismic, barrier-lake statements, mobility/displacement (not activated), power, TIMS |
| [deepdive-text-2026-08-29.md](deepdive-text-2026-08-29.md) | Text corpora — ~60 Nepali (EN + Devanagari), Chinese, Indian and international outlets with entry points/RSS/access; official document streams; aggregator/API tests with real counts (GDELT, Google News RSS, ReliefWeb, Wikipedia revision stats, People's Daily/The Paper APIs, CC-NEWS); ~40 survivor/per-place articles indexed by cluster; expert blogs; fact-check desks; pipeline cheat-sheet |

Confidence legend used throughout: **[C]** confirmed from a primary page/API fetched; **[R]** reported by a secondary source; **[U]** unconfirmed/likely.
