# nepal_flood

Research and requirements repo for software that helps rescuers know the whereabouts of people after the **26 August 2026 Bhote Koshi / Trishuli flash flood** (Rasuwa & Nuwakot districts, Nepal; Gyirong County, Tibet AR, China).

**This repo is research, not an app (yet).** The goal of this phase is to establish what rescuers actually need, what systems already exist, and what gap — if any — a small volunteer team can responsibly fill in days. See [docs/BOOTSTRAP_PROMPT.md](docs/BOOTSTRAP_PROMPT.md) for the full brief.

## The one rule that overrides everything

> **No personal data of any real individual goes into this repo. Ever.**
> No names, phone numbers, photos, ID numbers, addresses, or coordinates tied to individuals — not in data, not in examples, not in commit messages. See [data/README.md](data/README.md) and [research/50-ethics-and-legal/](research/50-ethics-and-legal/).

## The core design constraint

The dominant historical failure mode in disaster people-tracking is **fragmentation** (25+ competing survivor registries after 9/11 → the PFIF standard). Therefore:

> Any new standalone missing-persons database we create is, by default, **net-negative** unless it (a) aggregates/syncs with existing registries via an open standard, or (b) serves a need no existing system covers.

Establishing which is true here is the point of this research phase. See [docs/DECISIONS.md](docs/DECISIONS.md).

## Layout

| Path | What it holds |
|---|---|
| `docs/` | Brief, glossary, decision log, open questions, source-ingestion conventions |
| `research/00-event/` | What happened: timeline, hydrology, geography — date-stamped |
| `research/10-actors/` | Who is responding, who owns which data |
| `research/20-existing-systems/` | Landscape scan of existing disaster-response systems, each with an INTEGRATE / EXTEND / AVOID / IRRELEVANT verdict |
| `research/30-user-needs/` | What rescuers actually need — every need tagged EVIDENCED or HYPOTHESIS |
| `research/40-constraints/` | Connectivity, power, devices, language, exhaustion |
| `research/50-ethics-and-legal/` | PII, data protection, do-no-harm |
| `research/60-ai-and-satellite-approaches/` | AI/ML + satellite data options: what's real, what's accessible, what's hype |
| `research/70-advocacy-and-media/` | Policy/media angle: making the response visible |
| `research/sources/` | One file per source, strict convention — see [docs/SOURCE_INGESTION.md](docs/SOURCE_INGESTION.md) |
| `data/schemas/` | Data model drafts, PFIF mappings. **Never raw personal data.** |

## Status

As of **2026-08-29**: response active and ongoing; secondary outburst-flood risk from upstream barrier lakes is live. Casualty figures in this repo are always written as `as of <date>, <source> reported ~N` — never trust a bare number, including ours.
