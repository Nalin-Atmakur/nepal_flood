# 08 · Places — /places and /places/[id]

```
  /[lang]/places            app/[lang]/places/page.tsx
     getPlaceStatuses() v_place_status_latest ─┐
     getPlaces()         places (aliases, km)  ─┼─▶ <PlacesTable emptyRow search>   (client filter, docs/05 §04)
     getLiveCounts()     "updated {t}"         ─┘

  /[lang]/places/[id]       app/[lang]/places/[id]/page.tsx   generateStaticParams = LANGS × places.id
     getPlace(id)            places            → name_en/ne/hi, district, elev_m, km        (404 when null)
     getPlaceStatus(id)      v_place_status_latest → expected · confirmed_reached · unknown · last_contact_at · phones · access · nearest_gauge · shelter · status_label
     getPlaceTimeline(id)    place_timeline    → "Status, day by day" (what_{lang}, dot, source_url)
     getArticlesForPlace(id) v_articles_recent where places ⊇ {id} → "Headlines mentioning …"
     getPlaces()             places            → neighbours by km for "ON THE CORRIDOR"
```

## 1. /places

Same table as Home §04 on its own page: head with "updated {last_processed_at}", search box with the
"syafru / स्याफ्रु / Shyaprubesi" placeholder, and the dashed row "No reports for a place you know about? Add the first
one" under the table. Rows link to the place page.

## 2. /places/[id] — layout (Places.dc.html)

1. Sub-bar: `←` · "All places" · LIVE chip (desktop).
2. Name (36px/30px) + the other two scripts in muted 22px/17px + `StatusPill` + "Rasuwa · km 4 of the corridor · 1,725 m".
3. Four big cards: reported there (`expected`) · confirmed reached (`confirmed_reached`, green) · unknown (amber card) ·
   last contact out (`last_contact_at`). Sub-captions carry `as_of`. No ledger row → dashed
   "No ledger row for this place yet… Add the first report."
4. Left: "Status, day by day" (timeline dots: `live` red · `unknown` amber · `confirmed` green · `neutral` grey) and
   "Headlines mentioning {place}". Right: facts card (Phones · Access · Nearest gauge · Shelter), the CTA
   "Add what you know about {place}" → `/report?place=<id>`, and the dark "ON THE CORRIDOR" card.
   On mobile the facts card sits above the timeline and the CTA above the dark card, as in the mobile artboard.

## 3. Status pill (`lib/corridor.ts` → `statusTone`)

| `status_label` | pill |
|---|---|
| `mostly_unknown` | amber "mostly unknown" |
| `mostly_reached` | green "mostly reached" |
| `no_data` / no row | dashed "no data yet" |
| null | derived: `unknown / expected > 0.4` → unknown, else reached |

## 4. Neighbours

"ON THE CORRIDOR": km of this place, the nearest gazetteer place strictly upstream and strictly downstream
(many places share a chainage), or the first/last variants at the ends; places without `km` get the off-corridor line.

## 5. Static generation

`generateStaticParams` returns every `(lang, id)` from `places` at build time (~95 places × 3 languages);
`dynamicParams = true` so a place added later renders on demand and is then cached for 300 s. Unknown ids → `notFound()`.

## 6. Search (`lib/places-search.ts`)

`buildPlaceIndex` normalises `name_en/ne/hi/zh`, `aliases` and the id with `normaliseKey` (NFD, diacritics and
Devanagari nukta/accents stripped, lower-case, punctuation → space). `searchPlaces` ranks prefix matches
(on any key or any word) before substring matches; `placeMatches` filters the table. The same index feeds the
report box's PlacePicker (docs/06).
