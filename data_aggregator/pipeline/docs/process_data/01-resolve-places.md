# 01 — ① resolve places (`processing/resolve_places.py`, `lib/places.py`)

Archive-only mode resolves **public articles only**. `resolve_reports()` returns
`skipped="archive_only"` before querying `reports_anon`; the report branch shown below is a
dormant legacy path guarded by `ProcCtx.family_report_processing_enabled`.

```
   articles where extracted is null                      reports_anon where place_id is null
     and fetched_at ≥ now − ARTICLE_LOOKBACK_DAYS (14)      (limit 500)
     order by fetched_at desc, limit 400                        │
        │                                                        ▼
        ▼                                            gazetteer.resolve(place_text)
   text = title + body[:1500]                          or resolve(text_redacted)
        │                                                        │
        ▼                                                        ▼
   gazetteer.resolve_ids(text)  ── hits ──▶ places = ids   reports_anon.place_id = id
        │ no hit
        ▼
   LLM_CORRIDOR_KEYWORDS.search(text) and llm.can_call() ?
        │ yes                                          │ no
        ▼                                              ▼
   llm_pick(): ids constrained to gazetteer     places = [] , method = "none"
        ▼
   articles.places = ids
   articles.extracted = {"resolved_at", "method": alias|llm|none, "matches": ids}
```

## Alias matching (`lib/places.Gazetteer`)

- Loaded from the `places` table (90 rows) → `gazetteer/places.csv` → built-in list (ids
  identical to the gazetteer builder), see `Gazetteer.load`.
- Every `name_en`, `name_ne`, `name_hi`, `name_zh` and alias is indexed by its **full key**
  (`lib.text.match_key(alias, skeleton=False)`: Devanagari → Latin, diacritics stripped,
  aspirates/sibilants collapsed, v/w → b) and its **consonant skeleton** (vowels dropped, p → b),
  so `Syabrubesi` = `Syaphrubesi` = `Shyaprubesi` = `स्याफ्रुबेसी`. Chinese aliases are
  matched by substring.
- Text is scanned as token n-grams (`MAX_NGRAM = 5`), longest alias first, non-overlapping. A
  skeleton hit must also have Jaro-Winkler ≥ 0.86 against the alias' full key and not be in
  `STOPWORDS` (shelter, bridge, camp, …); single tokens ≥ 5 chars get a fuzzy pass at
  Jaro-Winkler ≥ 0.93 (`Rasuwadhi` → `rasuwagadhi`).
- `resolve()` prefers a non-district match, then exact over fuzzy, then the longer alias, then
  the earlier position (`टिमुरे, रसुवा` → `timure`). `resolve_ids()` returns every distinct id
  in text order for articles.

## LLM fallback

Only for articles: no alias hit **and** the text matches `config.LLM_CORRIDOR_KEYWORDS`
(Rasuwa, Nuwakot, Trishuli, Bhote Koshi, Langtang, Gyirong/Kerung, Mailung, Galchhi, Malekhu,
Devighat … in Latin and Devanagari) **and** `llm.can_call()` (budget + `LLM_MAX_CALLS_PER_RUN`
= 40 shared with ⓪). Prompt = the gazetteer list + the text[:1500]; strict schema
`{place_ids: string[], confidence}`; ids not in the gazetteer are discarded; `max_tokens = 120`.
Reports never use the LLM here (⓪ already asked).

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| public `articles` (title, body), `places` | `articles.places`, `articles.extracted` | `resolve_places.articles` (scanned, matched, llm); report summary says archive-only |

## Failure behaviour

Each half is wrapped (`resolve_places.failed part=articles|reports`). An article is marked
(`extracted` set) even when nothing matched, so a broken title is not re-scanned every run;
delete `extracted` (`update articles set extracted = null …`) to re-run after a gazetteer
change. Unresolved strings from the puller live in `snapshots/place_hints.jsonl`.
