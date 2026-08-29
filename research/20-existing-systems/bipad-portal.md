# BIPAD Portal

- **What:** Building Information Platform Against Disaster (`bipadportal.gov.np`) — Nepal's national disaster information management system. Modules: dashboard, incident, damage & loss, real-time (river/rain gauges, road status re-published from DoR).
- **Operator:** NDRRMA (owner); built by Youth Innovation Lab. Nepal Police are the authorised body for reporting incident data.
- **Active in this response:** EVIDENCED as the standing national system; incident/casualty records for this event flow through it. (→ sources/2026-08-29--field--data-sources-table.md)
- **Data model / API:** public API at `bipadportal.gov.np/api/` — incidents, alerts, losses, real-time feeds. JSON. No auth for read access on public endpoints. `[UNVERIFIED: rate limits, completeness during surge]`
- **Integration potential:** the natural *source* of official incident/loss data and the natural *destination* for anything we want officials to see. Building outside it in Nepal means building outside the government's own picture.

VERDICT: **INTEGRATE** — read its API for official incident/alert data; never duplicate its incident registry.
