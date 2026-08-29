# PFIF / Google Person Finder

- **What:** PFIF (People Finder Interchange Format) — the open XML standard for person + note records with preserved provenance, created after the 9/11 registry fragmentation. Google Person Finder was its best-known implementation (Haiti 2010, Nepal 2015, many others).
- **Operator:** PFIF is a standard (no operator). Person Finder was Google Crisis Response.
- **Active in this response:** `[UNVERIFIED — Google Person Finder's operational status in 2026 needs confirmation; Google wound down several crisis products in the 2020s. Do not assume it can be activated.]`
- **Data model:** PFIF 1.4 — `person` records (identity attributes) + `note` records (sightings/status updates) with source tracking and expiry. Designed precisely so independent registries can exchange and aggregate.
- **Integration potential:** if any person-record work is ever justified, PFIF is the schema we map to (see `data/schemas/README.md`). The standard matters even if Person Finder itself is gone.

VERDICT: **INTEGRATE** (the standard, as schema discipline) — and treat the possible absence of a live PFIF aggregator in 2026 as a finding in itself for the gap analysis.
