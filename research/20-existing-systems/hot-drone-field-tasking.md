# HOT/NAXA DroneTM and Field-TM

- **What:** two existing open digital public goods. DroneTM coordinates drone collection and imagery coverage. Field-TM coordinates offline Android/ODK field surveys, assignment and validation. (→ sources/2024-06-11--hot--drone-tasking-manager.md, sources/2026-08-29--hot--field-tasking-manager.md)
- **Operator:** Humanitarian OpenStreetMap Team with NAXA as a core Nepal-based development partner. (→ sources/2024-06-11--hot--drone-tasking-manager.md, sources/2026-08-29--hot--field-tasking-manager.md)
- **Active in this response:** `[UNVERIFIED]`. The government publicly exposed a Google Form for drone imagery rather than a DroneTM link; HOT's Nepal activation is active, but public material does not say Field-TM is deployed for this event. (→ sources/2024-06-11--hot--drone-tasking-manager.md, sources/2026-08-29--hot--field-tasking-manager.md)
- **Data model / API:** Field-TM uses ODK Collect/Central and exports structured geodata. DroneTM is designed around flight tasks and open aerial-imagery workflows. Exact 2026 interfaces and deployment status need confirmation with HOT/NAXA. (→ sources/2024-06-11--hot--drone-tasking-manager.md, sources/2026-08-29--hot--field-tasking-manager.md)
- **Integration potential:** high. They already cover the generic products a volunteer team might otherwise propose: drone coverage coordination, reached/not-reached field assignments, duplicate-visit prevention and offline collection. (→ sources/2024-06-11--hot--drone-tasking-manager.md, sources/2026-08-29--hot--field-tasking-manager.md)

VERDICT: **INTEGRATE / EXTEND** — do not build a new drone or field tasking product; if the event's Google Form has a processing gap, contribute a narrow ingestion/QA adapter to the official/HOT pipeline.
