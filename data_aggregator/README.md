# data_aggregator

Central data collection for the 26 Aug 2026 Bhote Koshi / Trishuli flood. Continuously updated; distributed as widely as possible; run with Nepali government permission.

## Purpose

1. **Collect data from all public-facing stores** — every feed, API, bucket, page and document stream about the event, pulled on a schedule into one place. The full inventory of what exists and how to reach it is [`../aryaa_research_general/11-data-catalogue-2026-08-29.md`](../aryaa_research_general/11-data-catalogue-2026-08-29.md); the pollable subset is encoded in [`sources.yaml`](sources.yaml).
2. **Collect NEW data from people via the questionnaire** — a lightweight form, distributed hard over social media, capturing what families, survivors, agencies and companies know that no public store holds.
3. **Process the data to find trends** — may become its own project; decided once the collection vehicle (1 + 2) is running and there is data to look at.

## Part 1 — public stores

`sources.yaml` lists each source with: id, family (json_api / rss / html / s3 / stac / gcs / pdf / post_api), URL or endpoint, auth, cadence, format, what it holds, `pii` flag, parser notes, and the catalogue row it came from. Groups:

| Group | Examples | Count |
|---|---|---|
| Person/status registries | OPMCM `/api/*`, NDRRMA `/api/v1/rescues/*`, Setu Rapid, Police UDB, volunteer bulletin repo | 7 |
| Official bulletins & documents | NDRRMA publications/newsinfo APIs, MoFA daily page, HEOC sitreps, DAO pages, UN RCO/ReliefWeb RSS, IFRC GO, GDACS, China MWR/MFA | 12 |
| Place-status signals | BIPAD river-stations (DHM mirror), DHM weather API, HOT bridge damage, NESRA bridges, DoR RIMES bridges, NTC restoration articles | 7 |
| Geospatial & imagery | HOT S3, HDX, EMSR927 API + zip, NESRA GCS bucket, UNOSAT, Microsoft exposure, Vantor STAC, Planet STAC, OAM, CDSE, Hugging Face fAIr | 12 |
| Text corpus | 13 outlet RSS feeds, Google News `site:` set, ekantipur live page, KP/THT tag pages, live blogs, People's Daily + The Paper search APIs, Wikipedia revisions | 8 families |
| Seismic/hazard | USGS FDSN, GEOFON | 2 |

Dead ends are listed in the catalogue §G so nobody re-polls them (Facebook, ADS-B, Meta mobility, ReliefWeb v1, Starlink…).

## Part 2 — the questionnaire

Open design decisions, to settle before distribution:

- **Unit of report:** person-centric (name, last seen) vs place-centric (which place, how many, last contact, status). Place-centric avoids duplicating the government's registries and keeps the form PII-free; person-centric is what most people instinctively want to fill in. Can be both, with the identity fields optional and routed straight to official channels.
- **Tool:** Google Form / Tally / Kobo (offline-capable, humanitarian standard) vs own site. Own site gives control over distribution and analytics.
- **Languages:** Nepali, English, Hindi, Chinese minimum (the missing span 34 nationalities).
- **Signposting:** every page links Police 1155 / MoFA ECR / Red Cross RFL / Tourist Police 1144 so the form is additive, not a substitute.

## Part 3 — processing

Deferred. Candidate first analyses once data lands: reconcile the five divergent "missing" counts (NEOC 977 · NDRRMA 2,498 · MoFA 511 · DoT 753 · OPMCM 10,792 — different definitions, same day); resolve free-text locations to a ~60-place corridor gazetteer; per-place expected-vs-reached; duplicate and name-collision detection (e.g. the Sindhupalchok "Bhotekoshi RM" block in OPMCM).

## Data handling

- Person-level rows from the registries and the questionnaire are processed under the government's data authority; names, phones, passport numbers, photos are **not** written into this repo (D2; `.gitignore` blocks json/csv/xlsx under `data/` and all tif/kml). Raw pulls go to `snapshots/` (gitignored) or object storage.
- Every number carries its source label and timestamp; the site never shows a bare figure.

## Layout

```
data_aggregator/
├── README.md
├── sources.yaml      ← registry driving the pollers
├── pollers/          ← one module per family
├── normalisers/      ← per-source parsers → common rows
├── questionnaire/    ← form definition, copy in 4 languages, distribution plan
├── gazetteer/        ← corridor places
├── site/             ← public surface
└── snapshots/        ← gitignored raw pulls
```

## Status

2026-08-29: folder created; `sources.yaml` written from the catalogue. No code yet.
