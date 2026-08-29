# Virtual OSOCC / GDACS

- **What:** Virtual OSOCC — online coordination platform for international disaster response (discussion boards, team registration, sitreps). GDACS — automated global disaster alerting + impact estimation, publishes event pages and feeds.
- **Operator:** UN OCHA / EC JRC.
- **Active in this response:** GDACS auto-publishes for major events `[UNVERIFIED: whether a GDACS event page + Virtual OSOCC discussion exists for this flood — likely, check gdacs.org]`.
- **Data model / API:** GDACS has open RSS/API feeds (event alerts, impact estimates). Virtual OSOCC requires responder registration.
- **Integration potential:** GDACS feeds are a legitimate open input (event metadata, alert levels). Virtual OSOCC is where the *real* coordination information lives but is gated; a team member with a legitimate affiliation could register.

VERDICT: **INTEGRATE** (GDACS feeds) / **AVOID** replicating Virtual OSOCC — coordination fora only work when there is exactly one.
