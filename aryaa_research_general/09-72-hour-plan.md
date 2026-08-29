# 09 — 72-hour plan for four people

*Two on data plumbing and the triage model, one on the drone kit, one on liaison and Nepali-language output. Swap the drone person onto imagery labelling once the kit ships. Written 2026-08-29; adjust against `docs/DECISIONS.md` D3 and the hackathon's actual asks.*

## Sat 29 Aug — today, T+72 h
- Register for Nepal Hackathon; message NAXA, HOT AP Hub, NESRA/YIL, KLL with a one-paragraph offer that names the five products in 06 and asks which one responders want first. Ask for a named person who will run what we hand over.
- Pull Vantor pre/post (STAC), Planet SkySat/Pelican, EMSR927 grading GeoPackages, the UNOSAT impact GDB, the Microsoft exposure GPKG, HOT's flood-extent/bridge-damage/helipad layers, NESRA exposure tables, DHM gauges. Build the **corridor gazetteer**: every settlement, lodge cluster, hydropower site, portal, checkpost, helipad — coordinates, elevation above the debris polygon, reachability, in-channel-below-lakes flag.
- Draft the missing-list schema (#2) and the request text for operator cell records (#3) so the asks can go in at kickoff.

## Sun 30 Aug — hackathon kickoff 09:00 NPT
- Take a responder-scoped problem. Ship island-triage v1 (#1): ranked settlement table with expected headcount, survivability, reachability, contact status — as a GeoPackage and a one-page Nepali PDF for the Dhunche cell.
- Geolocate every hydropower adit/portal/powerhouse from pre-event imagery; hand to the tunnel-rescue cell via NAXA/NDRRMA.
- Put the operator-data ask in through NDRRMA, citing 2015.

## Mon 31 Aug — T+5 d
- Missing-list reconciliation v1 (#2): code delivered to the Nepali list-holder; dedupe across MoFA/NTB/police/IPPAN/trackers; per-settlement expected-vs-confirmed; publish the delta to the same cell. PII stays on the Nepali side.
- Drone triage kit (#4) to Drone Association: ADIAT-based, offline, top-N with GPS correction; a 10-minute Nepali walkthrough.
- Start SKAI/xBD labelling (#5): ~300 buildings + all 62 bridges, hand-QA'd.

## Tue 1 Sep — heaviest rain forecast
- Fold building/bridge status into #1. Iterate the morning list from Monday's helicopter reports and any phone re-attaches. Weather will ground most flights — use the day to close the Tamang Heritage Trail and Uttargaya information gaps by phone through local officials.
- Measure the only metric that matters: did any sortie go somewhere it otherwise wouldn't have, and did it bring someone back?

## Kill conditions (from D3, endorsed)
- If NESRA or NAXA publish a fused per-settlement priority layer, fold into their effort the same day.
- If no responder channel materialises by Mon, #1 and #2 become portfolio pieces — stop, and redirect effort to Wedge 1 (HOT validation/mapping) and Wedge 3 (private barrier-lake watch), which remain useful without a channel.
