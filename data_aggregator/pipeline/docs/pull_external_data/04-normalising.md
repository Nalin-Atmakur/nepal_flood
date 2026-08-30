# 04 — normalising: contract, dispatch, upsert keys, PII stripping

```
   raw bytes ─▶ normalisers.get(source_id) ─▶ module.normalise(raw, fetched_at, source, ctx)
                       │                            │
                       │ None → raw_pulls only      ▼
                       │                    NormalisedRows
                       │                      .figures      [{publisher, metric, scope, value, as_of, url, note, source_id, fetched_at}]
                       │                      .gauges       [{station_id, station_name, river, lat, lon, level, warning, danger, observed_at, fetched_at, alive}]
                       │                      .articles     [{url, title, publisher, lang, published_at, body, places, source_id, fetched_at}]
                       │                      .place_hints  [{text, place_id|None, count, kind}]
                       │                      .notes        ["…"]  (no PII, logged as pull.note)
                       ▼                            │
   Runner._write_rows ◀─────────────────────────────┘
        db.upsert_figures   on_conflict publisher,metric,scope,as_of,value   ignore-duplicates · as_of never null
        db.upsert_gauges    on_conflict station_id,observed_at               merge (fetched_at/alive refresh)
        db.upsert_articles  on_conflict url                                  ignore-duplicates (① owns places/extracted)
        unresolved place_hints → snapshots/place_hints.jsonl
```

## The contract (`normalisers/__init__.py`)

```python
SOURCE_ID = "<id from sources.yaml>"
def normalise(raw: bytes, fetched_at: datetime, source: dict, ctx: Context | None = None) -> NormalisedRows
def prestore(parts: list[Part], ctx: Context | None) -> list[Part]      # optional
```

- `raw` is the single body **or** the envelope `{"__parts__": [{url, status, body, last_modified, error}]}`;
  `parts(raw)` returns `[Part]` either way, so a normaliser never cares how many URLs were fetched.
- `Context` carries `fetch` (lib.http.get), `upload(path, bytes, content_type)` (Storage bucket
  `raw`), `state` (per-source memory such as seen publication ids), `gazetteer`
  (`ctx.resolve(text) → place_id | None`) and `dry_run`. Tests inject fakes.
- `NormalisedRows.figure()/article()/gauge()/hint()` build rows; `extend()` merges.
- The puller fills in `source_id` and `fetched_at` if a row lacks them.

## Dedupe keys (from `db/migrations/002_raw.sql`)

| table | key | behaviour on conflict |
|---|---|---|
| `figures` | `unique (publisher, metric, scope, as_of, value)` | ignore — a re-pull of the same number is a no-op; `as_of` defaults to `fetched_at` because NULL would defeat the unique key |
| `gauges` | `primary key (station_id, observed_at)` | merge — `fetched_at` and `alive` refresh |
| `articles` | `unique (url)` | ignore — process_data ① writes `places`/`extracted` back and must not be clobbered |

`db.upsert_figures` also de-duplicates inside the batch and coerces `value` to float; rows with
a null `value`, `publisher` or `metric` are dropped.

## Scopes

`national` (default) · `district:<slug>` · `nationality:<slug>` · `place:<gazetteer id | slug>` ·
`status:<slug>` · `gender:<slug>` · `source:<dao|public>` · `problem:<slug>` · `day:<YYYY-MM-DD>` ·
`station:<slug>` · `category:<slug>` · `place:<id>|status:<s>` (⓪ projection). Slugs come from
`lib.text.slugify` (Devanagari transliterated). A `place:` scope uses the gazetteer id when
`ctx.resolve()` matched, else the slug of the source's own name (so the scope is still stable).

## PII stripping — where it happens

| source | mechanism |
|---|---|
| `opmcm_person_reports` | `prestore()`: drop `images`, `imageUrl`, `thumbnail`, `fullName`, `description`, `phone`, `contact`, `reporterName`, `reporterPhone`, `email`; add `person_key` (sha256 of passport found in the description, else name + age band + nationality), `key_strength`, `nationality`, `has_photo`, `age_band` |
| `ndrrma_rescues` | `prestore()` on `rescued-persons` parts: drop `name`, `name_ne`, `remarks`, `phone`, `contact`; add `person_key`, `age_band`, `remarks_place` (address part removed, regex-redacted, ≤ 80 chars) |
| `ndrrma_publications` | PII list PDFs (ids 373, 377, 380, 381, 383, 384 or title ~ `/list\|विवरण\|नामावली/i`) are uploaded to Storage and never text-extracted |
| everything else | endpoints hold no personal data; `notes` and `place_hints` carry location strings only |

`raw_pulls` therefore holds the **keyed projection** of the two person registries, not a mirror
of the names — the portals themselves remain the archive of record (see the catalogue's ethics
note on OPMCM). Verified by `tests/test_normalisers.py::test_no_pii_in_output` and
`test_opmcm_prestore_strips_identifiers`.

## Failure behaviour

A normaliser exception is caught by `Runner.run_source` → `pull.source_crashed`, the raw pull is
already stored, `pulls.error` set; nothing partial is written because the upserts happen after
`normalise()` returns. A part that failed is reported through `NormalisedRows.notes` and the
rest of the parts are still normalised.

## Relevance gate (articles only)

```
normalise() → NormalisedRows.articles ──▶ is_relevant(title, body, gazetteer)? ──▶ upsert articles
                                                     │ no
                                                     └─▶ dropped (pull.note "relevance gate dropped N article(s)")
```

`normalisers/_rss.is_relevant(title, summary, gaz)` keeps an item when **either**

1. `title + summary` matches `lib/config.ARTICLE_RELEVANCE_KEYWORDS` — the event vocabulary in four
   scripts (EN: flood, flash flood, glacier/GLOF, landslide, rescue, missing, Rasuwa, Rasuwagadhi,
   Timure, Syabru, Langtang, Dhunche, Bhote Koshi, Trishuli, Betrawati, Nuwakot, Gyirong/Kerung,
   Kailash/pilgrim, hydropower/tunnel, NDRRMA, barrier lake, heavy rain, unreached, foreign nationals,
   MoFA/NEOC · NE: बाढी, रसुवा, भोटेकोशी, त्रिशूली, बेपत्ता, सम्पर्कविहीन, उद्धार, लाङटाङ, धुन्चे, टिमुरे, स्याफ्रु,
   हिमताल, पहिरो, केरुङ, भारी वर्षा, शव · HI: बाढ़, लापता, बचाव, हिमस्खलन · ZH: 吉隆, 洪水, 泥石流, 尼泊尔, 失联, 救援), **or**
2. it resolves to a gazetteer place through `lib/places` (so "Villages in Betrawati without power" passes
   without any keyword).

The RSS normalisers apply it per feed item (`feed_to_articles`), and `pull_external_data.py` applies it
again to every normaliser's `articles` before the upsert, so DHM bulletins, NDRRMA publications, MoFA
pages and any future article source are gated the same way. Empty titles are never relevant.
Tests: `tests/test_relevance.py` (positive/negative headlines, including the off-topic
"China's record robotic strides…" that leaked through before the gate existed).

Rows stored before the gate existed are removed once with
`.venv/bin/python process_data.py --purge-irrelevant` (see docs/process_data/09-failure-modes.md).
