# 21 · The places map — `/places`

Owner's brief (30 Aug, via Nalin): *"a map of the region with pins for the specific sites that you currently have a
list for — I was trying to locate the immigration centre but wasn't sure which one the rows were."* The corridor
simulation shows what the flood **did**; the list shows the **numbers**; neither shows **where**. This does.

```
  gazetteer/places.csv ── db seed ──▶ places (lat, lon, in_channel, …)
                                        │  getPlaces() + getPlaceStatuses()
                                        ▼
  app/[lang]/places/page.tsx ─▶ blocks/PlacesMap.tsx  (client island)
        │
        ├── public/corridor-map.webp        pre-rendered basemap (scripts/make-map.mjs, © OpenStreetMap)
        ├── lib/map-view.ts                 the tile window that image covers  (generated — do not hand-edit)
        └── lib/map-projection.ts           lat/lon → fraction of the image · cover/fit/zoom transforms (pure, tested)
```

## Why a pre-rendered image and not a tile service

The site exists to be forwarded at scale. Every public tile service either forbids that traffic (OSM's own tile
policy), or bills for it and rate-limits a spike (MapTiler, Mapbox) — the map would break exactly when the site is
working, and a key would have to live in the client. One static image has no key, no quota, no third party in the
request path, is ~110 KB on a phone (`corridor-map-sm.webp`) and works on a 2G connection. The cost is that the
map does not re-render at deeper zooms: pins stay sharp, the basemap softens. That is the right trade here.

## Regenerating the basemap

1. Edit `BBOX` / `ZOOM` at the top of `scripts/make-map.mjs` (defaults: 27.55–28.45 N, 84.3–85.65 E, z11 → 2304 × 1536).
2. `npm run map` — fetches the tiles once from OpenStreetMap with an identifying User-Agent, 120 ms apart,
   desaturates them so the amber/green pins read on top, writes `public/corridor-map.webp` (+ `-sm`) and
   **rewrites `lib/map-view.ts`**.
3. `npx vitest run tests/map-projection.test.ts` — the gazetteer's places must still land inside the image.
4. Keep "© OpenStreetMap contributors" visible wherever the image is shown (`map.attribution`).

## Behaviour

- One pin per gazetteer place with coordinates that falls inside the image (86 of 90 today); the four that do not
  — Pokhara, the two Nawalparasi districts, Sindhupalchok's Bhotekoshi RM — are named in a line under the map and
  are all still in the list below it.
- Colour is the corridor legend: amber "mostly unknown", green "mostly reached", grey nothing reported
  (`statusTone`). Size grows with how many people are reported there (5–12 px), so the Rasuwa cluster reads as a
  cluster.
- The tap area is a constant 36 px at every zoom (`HIT`), with the dot drawn inside it — a 5 px dot is not a
  finger target. Pins carry `data-tap-ok="marker"` so the mobile audit skips them: they can overlap, and every
  place is also a 44 px row in the list.
- Opens framed on the flood's channel (`in_channel` places), not the whole image. Drag to pan, wheel or pinch to
  zoom toward the pointer, `⌂` to re-frame. The image always covers the box (`coverSize` + `clampTransform`), so
  the map is never distorted and never leaves blank edges — the box can be tall on phones and wide on desktop.
- Tapping a pin opens a card: name, district, reported · confirmed · unknown, and a link to the place page.

## Tests

- `tests/map-projection.test.ts` — Mercator identities, monotonicity, the corridor's places land inside the image,
  the four far-away ones do not, and the cover/fit/zoom transforms hold their invariants.
- `tests/e2e/smoke.spec.ts` — ≥ 80 pins in all three languages, the basemap actually loads, a pin opens its card
  with the right place link, `⌂` closes it.
