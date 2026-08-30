# gazetteer/ — the corridor place list

**Purpose.** One reference table of every place the site, the pipeline and the form need to agree on:
settlements, hydropower camps and portals, checkposts, helipads, hospitals, shelters, the two barrier
lakes and the affected districts along the Bhote Koshi → Trishuli → Narayani corridor of the 26 Aug 2026
flood. It seeds the `places` table (`db/migrations/002_raw.sql`), feeds the form's place picker, the 3D
corridor (`km` chainage), `/places/{id}` pages and `process_data` ① `resolve_places` (aliases in four
scripts). No personal data lives here — it is the one CSV the repo-wide `*.csv` firewall re-includes.

```
  SEED (build_gazetteer.py, hand-curated)  ─┐
  NDRRMA rescued-locations API (names)     ─┼─▶ build_gazetteer.py ─▶ places.csv ─▶ to_sql.py ─▶ db/seed/places.sql
  NDRRMA stationed-locations API (points)  ─┤          │                                              │
  Nominatim / OSM (coordinates, ele)       ─┘      .cache/ (gitignored)                  db/apply.py → Supabase `places`
```

## The corridor, with `km` chainage

`km` is the nominal chainage the 3D and the place pages use (`design/…/corridor-3d.js`): Rasuwagadhi = 0,
negative upstream into Tibet, positive downstream. It is a display axis, not a surveyed distance.

```
 km   -25   Gyirong town (吉隆镇) — not hit                                   TIBET / CN
 km   -18   ◉ Lhende Khola barrier lake (upper, ~0.11 km²)
 km    -8   ◉ barrier lake — Chhochen Khola–Purepu Tsangpo confluence
 km    -3   ▣ Gyirong (Kerung) Port — destroyed
 km    -1   Resuo village · Friendship Bridge
 ───────────────────────────────────────────── border ─────────────────────── NEPAL / NP
 km     0   ▣ Rasuwagadhi (immigration, HEP 111 MW at km 1)
 km     4   Timure ●━━━━━━━━ Thuman · Nagthali (Tamang Heritage Trail, off-corridor)
 km     8   Ghattekhola          Briddim (ridge, off-corridor, km 10)
 km    15   Chilime HEP ━━━━━━━━ Chilime · Goljung · Gatlang · Tatopani (Chilime side valley)
 km    16   Syabrubesi ●━━━━━━━━ Langtang Khola ▶ Bamboo · Lama Hotel · Langtang · Kyanjin (km 20, off)
 km    17   Langtang Khola HEP   Thulo Syabru ▶ Gosaikunda (off-corridor)
 km    21   Hakubesi (UT-1 headworks) · Haku (hillside)
 km    22   ┃  Dhunche (HQ, helipad, hospital, army camp — above the flood)
 km    26   Mailung — UT-1 camp/powerhouse · Mailung Khola HEP
 km    28   UT-3A                Kalikasthan PHC (km 30, ridge) · Ramche (km 30, hillside)
 km    32   Simle
 km    33   UT-3                 Dhaibung relief centre (km 34, ridge) · Sole · Khalti Basti (ward 7)
 km    36   Pairebesi            Salletar (km 37)
 km    37   UT-3B
 km    39   Shanti Bazar
 km    40   Betrawati ● — bridge gone; school shelter; Manedhunga             ─ Rasuwa │ Nuwakot ─
 km    44   Trishuli Bazar · Trishuli Hospital · Colony
 km    45   Battar · Battar shelter · Maithali barracks (No.1 Military Training Centre)
 km    46   Bidur ● (Nuwakot HQ) · Bidur army camp
 km    50   Devighat ●                                                        ─ Nuwakot │ Dhading ─
 km    60   Galchhi ● (live gauge) · Galchhi transit relief camp
 km    64   Gajuri
 km    68   Malekhu ● (gauge washed away)
 km    74   Benighat (Budhi Gandaki joins)
 km    85   Mugling (Marsyangdi joins)                                        ─ Dhading │ Chitwan ─
 km   100   Devghat ● (live gauge; Kali Gandaki joins → Narayani)            ─ Tanahun ─
 km   110   Bharatpur · Bharatpur Hospital (body identification)             ─ Chitwan ─
            ▼ Nawalparasi East / West · Gandak → India

 ● = point used by corridor-3d.js   ◉ = barrier lake   ▣ = border   ┃ = above the channel
 Off-corridor: TUTH + Trauma Center (Kathmandu), PAHS (Pokhara), Sanjen HEP; districts (kind = district).
```

## Columns (`places.csv` header = `places` table, in order)

| column | type | meaning |
|---|---|---|
| `id` | text, PK | slug `[a-z][a-z0-9_]*` — used in URLs (`/places/{id}`) and as `reports_archive.place_id` |
| `name_en` | text | display name |
| `name_ne` | text | Nepali (Devanagari) — filled for every row |
| `name_hi` | text | Hindi — filled for every row (equals Nepali where identical) |
| `name_zh` | text | Chinese — CN-side rows and Kathmandu |
| `aliases` | `a\|b\|c` → `text[]` | every spelling the resolver should match: NDRRMA/OPMCM spellings, Latin variants, Devanagari, Chinese. Unique across rows. |
| `kind` | text | `settlement · camp · tunnel_portal · checkpost · helipad · lodge_cluster · hospital · shelter · border · district · hazard` |
| `district`, `municipality`, `ward` | text, text, int | admin; blank when not known with confidence |
| `lat`, `lon` | double | WGS-84; provenance is the **last clause of `notes`** (`coord: OSM/Nominatim …`, `coord: NDRRMA centroid …`, or `coord estimated`) |
| `elev_m` | int | OSM `ele` when present, else repo/seed value (marked "elev from repo" / "elev approx"), else blank |
| `km` | double | chainage above; blank = off-corridor with no useful junction |
| `side` | `NP` / `CN` | which side of the border |
| `in_channel` | bool | valley-floor place hit by the 26 Aug flood |
| `below_barrier_lakes` | bool | true for every in-channel NP place (all of Nepal is downstream of both lakes) |
| `notes` | text | status summary, source hints, judgment calls, then the coordinate provenance |

Provenance today: 90 rows — 51 coordinates from OSM/Nominatim, 11 from NDRRMA stationed-locations
centroids, 28 estimated (mostly checkposts/helipads/portals inside a known bazaar, and Uttargaya hamlets
OSM does not carry). `build_gazetteer.py` prints these counts on every run.

## Steps

### 1. Rebuild `places.csv`

```
cd data_aggregator/gazetteer
../pipeline/.venv/bin/python build_gazetteer.py            # uses .cache/, fetches only what is missing
../pipeline/.venv/bin/python build_gazetteer.py --offline  # never touches the network
../pipeline/.venv/bin/python build_gazetteer.py --refresh  # re-fetch NDRRMA + Nominatim (≈ 1 req/s, ~2 min)
```

The build is deterministic from the cache: `tests/test_gazetteer_places.py::test_build_offline_is_deterministic`
asserts an offline rebuild reproduces the committed CSV byte for byte. Unmapped NDRRMA locations are
printed as `[ndrrma] unmapped …` warnings and never dropped silently — the test suite then fails until
you map them (step 2).

### 2. Add or change a place

1. Open `build_gazetteer.py` and append a `P(...)` entry to `SEED` (or to `NDRRMA_RESCUED_EXTRA` if the
   only reason it exists is an NDRRMA name). Give it: `id` (slug), `name_en/ne/hi`, `kind`, `guess`
   (lat, lon), `km` (blank if off-corridor), `in_channel` / `below`, `aliases` (Devanagari + every Latin
   spelling you have seen), `notes` (status + source), and either
   - `queries=[...]` + `radius_km` — Nominatim is asked in order; the first *place*-class hit within the
     radius of `guess` wins (for districts use `prefer="boundary"` so only boundary relations count), or
   - `fixed=True` — the guess is used as-is; end `notes` with `; coord estimated`.
2. If NDRRMA names it: add the exact `title` to `NDRRMA_RESCUED_MAP`, or the API `id` to
   `NDRRMA_STATIONED_ROWS` (those rows take the API centroid as their coordinate).
3. Keep `km` consistent with `design/…/corridor-3d.js` (`tests/test_gazetteer_places.py::CHAINAGE_3D`) and
   monotonic for in-channel rows.
4. Run step 1, then step 3, then step 4.

### 3. Regenerate `db/seed/places.sql`

```
../pipeline/.venv/bin/python to_sql.py        # → ../db/seed/places.sql
```

One statement: `insert into places (…) values (…), (…) on conflict (id) do update set …` — idempotent,
safe to re-apply via `python db/apply.py --only seed`. Text is `$p$…$p$`-quoted; `aliases` is
`array[…]::text[]`; blanks are `null`. The test suite fails if `places.sql` is older than `places.csv`.

### 4. Run the tests

```
../pipeline/.venv/bin/python -m pytest tests -q
```

Checks: 70–90 rows; unique slug ids; required coverage list; lat/lon inside 26.3–29.0 N / 83.5–86.5 E;
Devanagari `name_ne` and `name_hi` on every row (+ `name_zh` on CN rows); kinds in the allowed set;
`in_channel ⇒ km`, `below_barrier_lakes ⇒ in_channel`, NP in-channel ⇒ below the lakes; in-channel `km`
monotonic downstream; chainage equals the 3D's; aliases non-empty for settlements/borders/districts and
unique across rows; every NDRRMA location mapped and its spelling searchable; coordinate provenance in
`notes`; CSV round-trips through `csv` and through the builder's writer; `to_sql` value rules;
`places.sql` in sync; offline rebuild deterministic.

## Contract

- **Inputs:** `SEED` in `build_gazetteer.py`; `https://ndrrma.gov.np/api/v1/rescues/rescued-locations/`
  (21 names, no centroids as of 29 Aug) and `…/stationed-locations/` (11 points);
  `https://nominatim.openstreetmap.org/search` (User-Agent `nepalfloodtracker-gazetteer`, ≤ 1 req/s).
- **Outputs:** `places.csv` (UTF-8, `\n`, header exactly as the table), `../db/seed/places.sql`.
- **Consumers:** `db/apply.py` (seed), `pipeline/lib/places.py` + `processing/resolve_places.py`
  (aliases), `web/components/form/PlacePicker.tsx`, `web/components/three/` (`km`, `in_channel`),
  `web/app/[lang]/places/[id]` (names, district, km, elev).

## Judgment calls recorded in `notes`

- NDRRMA `हाफुबेसी` is read as **Hakubesi** (हाकुबेसी, OSM hamlet opposite Dhunche); `कोलनी` as the NEA
  **Trishuli hydropower colony** at Trishuli Bazar; `चिलिमे` as Chilime village (the powerhouse is
  `chilime_hep`); `मानेढुङ्गा` has no OSM/NDRRMA point and is placed near Betrawati (estimated).
- `ut3` (37 MW) and `ut3b` are kept as separate rows per the plan, with a note that outlets may mean the
  same NEA scheme.
- Betrawati straddles Rasuwa/Nuwakot; filed under Rasuwa (Uttargaya RM) as NDRRMA does; its OSM node is on
  the Nuwakot (Bidur-10) side.
- Ward numbers follow OSM `addr` tags (Timure 2, Syabrubesi 3, Dhunche 6); some reporting says
  Syabrubesi is ward 5 — noted on the row.
- `bhotekoshi_rm_sindhupalchok` exists only to catch the DAO/Setu name collision; it is **not** on the
  corridor.
- Side valleys (Langtang, Gosaikunda, Tamang Heritage Trail) are `in_channel=false` with the junction km
  (Langtang = 20 as in the 3D) or blank.
