# KoboToolbox / ODK

- **What:** Offline-capable mobile data collection (forms on low-end Android, sync when connectivity returns). The humanitarian standard for structured field data; ODK is the underlying open-source lineage.
- **Operator:** KoboToolbox (non-profit); free tier for humanitarian use.
- **Active in this response:** NDRRMA already uses KoboCollect institutionally (→ docs/BOOTSTRAP_PROMPT.md §4, `[UNVERIFIED for this specific event]`).
- **Data model / API:** XLSForm form definitions; REST API for submissions; exports CSV/JSON/GeoJSON.
- **Integration potential:** high — if any structured field collection is ever needed (e.g. settlement-status surveys: reached/not-reached, needs), the answer is a Kobo form deployed under an accountable org's account, not a custom app. Zero custom software, offline-first, responders may already know it.

VERDICT: **INTEGRATE** — the default answer to "we need to collect structured data in the field" is a Kobo form, not code.
