# Priority-map sketch (Aryaa, 29 Aug 2026)

`priority-map-sketch.jpg` — notebook sketch of the original idea.

**Goal written on the page:** "Find people in danger for 2nd flood."

**Pipeline as sketched:**
1. Map of Nepal → map out path of initial flood.
2. Overlay flood path with road networks to figure out the isolated areas.
3. Overlay isolated areas with population density map (high / low).
4. Overlay with simulation of 2nd flood to determine highest-priority zones.

**Where each step stands (29 Aug):**

| Step | Already exists? | Source |
|---|---|---|
| Flood path | Yes | UNOSAT mudflow extent GDB; HOT flood-extent GeoJSON (31.7 km²); NESRA path exposure |
| Road/bridge cuts → isolated areas | Yes | HOT bridge-damage GeoJSON; EMSR927 grading; UNOSAT impact (~120 km road) |
| × population | Yes | Microsoft AI for Good exposure (Overture + IHME: 4,977 buildings, ~10,204 people); UNOSAT WorldPop exposure |
| × 2nd-flood simulation | No, and low value | Replace with height-above-nearest-drainage on Copernicus GLO-30 below the two barrier lakes; ICIMOD/DHM/China own the lake hazard |
| **Missing from the sketch** | — | **Contact status**: who is expected in each pocket vs who has been confirmed reached. See `../10-discussion-log.md` and `../06-ml-approaches-ranked.md` #1–#2 |

The sketch survives as `docs/DECISIONS.md` Wedge 2 (fusion triage product, delivered through Nepali channels, with a daily kill condition) — with roster-based headcounts replacing population density, and the reconciled register supplying the contact-status column.
