---
url: https://docs.google.com/document/d/1D0FDTE1g6UapY7Y3R9tC42aq-dHjoPa4l5D-Mayfq5s/
publisher: team field document (Google Doc)
author: team / collaborator
published: unknown
accessed: 2026-08-29
type: primary-field-note
reliability: B
topics: [tooling, elevation-differencing, build-vs-buy]
status: extracted
---

# Field doc: available data, tooling choices, elevation-differencing instructions

## Summary

Two-part working doc. Part 1 — build-vs-buy stance: don't build from scratch; consider Microsoft HASTE as damage-assessment backbone (imagery ingestion, Planet/Vantor access, pre/post comparison, footprints, labelling, damage models, exports, Docker); add NASA SALaD or Delft/Deltares landslide detection; WorldPop + Overture/OSM for population/routing; cites similar prior implementations (Alivio, MASAI, UNOSAT Kenya landslide assessment); notes eligible authorities should request Copernicus EMS / International Charter before anyone writes software. Contains the honest line the whole project should keep: *satellite imagery can prioritise likely affected populated locations but cannot detect living survivors beneath debris.* Part 2 — a concrete, step-by-step plan for pre/post stereo DEM differencing at the Rasuwagadhi border post (28.279672°N 85.377744°E) using Vantor/Planet stereo candidates + NASA Ames Stereo Pipeline + OpenTopography baselines, with cross-validation and known-challenges list (stereo availability unconfirmed; CC-BY-NC licence; cloud; datum alignment; estimate-not-survey).

Extracted into `research/60-ai-and-satellite-approaches/elevation-differencing-plan.md`.

## Extracted claims

- `[UNVERIFIED]` items to check before relying on them: Microsoft "HASTE" platform capabilities/availability; "Alivio"/"MASAI" platforms; whether any open Vantor/Planet scenes for this event are true stereo pairs.

## Relevance

- 60 (tooling stance + the one genuinely novel technical task the team has specced).
