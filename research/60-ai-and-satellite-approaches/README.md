# 60-ai-and-satellite-approaches

*(Extension track beyond the original bootstrap structure — added because the team's founding question is specifically "how can AI/ML + live satellite data help rescue operations".)*

**Question:** Which AI/satellite capabilities are real, accessible to a small volunteer team **in days**, and additive to what official pipelines (Copernicus EMS, UNOSAT, HOT) already produce for this event — and which are hype for this use case?

**Convention:** every approach gets an honest feasibility verdict:

```
FEASIBILITY: USE-OUTPUTS | REQUEST-ACTIVATION | BUILD-ON | RESEARCH-ONLY | HYPE
```

- **USE-OUTPUTS** — consume existing published products (fastest path, usually right)
- **REQUEST-ACTIVATION** — the capability exists but an eligible authority must ask for it
- **BUILD-ON** — a volunteer team can realistically assemble it from open pieces in days
- **RESEARCH-ONLY** — real science, wrong timescale for a live response
- **HYPE** — does not survive contact with the details

**Contents**

- `approaches.md` — the four workflow families (SAR flood mapping, change detection/damage, hydrodynamic prediction, drone CV) assessed honestly
- `live-data-sources.md` — the working catalogue of live/near-live data feeds for this event
- `elevation-differencing-plan.md` — the team's concrete pre/post DEM differencing plan for the Rasuwagadhi border post
- `stereo-availability-findings.md` — 2026-08-29 findings on blocker 1 (is any open scene actually a stereo pair?), per-source verdicts, elevation baseline cross-check
- `gyirong-imagery-inventory.json` — per-scene metadata backing the findings above (dates, view angles, cloud cover, links)

**Ground truth to keep repeating:** satellite imagery can prioritise likely-affected populated places; it **cannot detect living survivors under debris**. Claims otherwise are hype.
