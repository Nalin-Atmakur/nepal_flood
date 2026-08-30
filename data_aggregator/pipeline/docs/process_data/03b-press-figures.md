# 03b — ③b press_figures (`processing/press_figures.py`, `--step 3.5`)

Nepal Police and the Department of Tourism / Nepal Tourism Board publish no machine-readable totals; their
numbers reach the record only as quotes in press reports. This step turns those quotes into `figures` rows so
the side-by-side table gets its "Nepal Police" and "Dept of Tourism" columns. It runs after ③ and before ④ so
`figures_latest` picks the rows up in the same run.

```
   articles (fetched in the last 48 h; published_at within 48 h when present; title + body)
        │
        ▼  split into sentences (. ! ? ।)  ·  Devanagari digits → Latin (lib.text.nepali_digits)
   keep a sentence only if it (or the article title) mentions the flood context
        (flood · Rasuwa · Trishuli · Bhote Koshi · glacier · GLOF · barrier lake · बाढी · रसुवा · त्रिशूली · हिमताल · बाढ़ …)
        │
        ▼  agency mentions in the sentence:  police|प्रहरी|पुलिस → Nepal Police (via press)
                                            tourism department|department of tourism|पर्यटन विभाग → Dept of Tourism (via press)
                                            tourism board|NTB|पर्यटन बोर्ड → NTB (via press)
   every count is attributed to the agency named nearest BEFORE it (else the first one named)
        │
        ▼  metric regexes (EN + NE + HI)
   police   dead      "626 (people) (have) died|dead|killed|bodies|मृत्यु|मृतक|शव|मौत"  ·  "death toll … 626"
            missing   "2,426 (people) (remain|still|अझै) missing|out of contact|unaccounted|बेपत्ता|सम्पर्कविहीन|लापता"
            rescued   "4,451 (people) (have been) rescued|evacuated|airlifted|उद्धार|बचाए"
   tourism  tourists_missing   "668 (foreign) tourists|trekkers|pilgrims … missing|out of contact|बेपत्ता"
            tourists_rescued   "261 tourists … rescued|evacuated|safe|उद्धार|सुरक्षित"
        │
        ▼  guards: value ≥ 100 (police) / ≥ 10 (tourism) and ≤ 1,000,000; a 'dead' sentence that says
           "in Chitwan / Nawalparasi / Gorkha …" is a district count and is dropped; (publisher, metric, value)
           deduped per article
        │
        ▼
   figures  publisher 'X (via press)' · scope national · value · as_of = published_at (fetched_at when null) ·
            url = article · note = the sentence · source_id = the article's source
            (upsert on the unique key publisher, metric, scope, as_of, value → re-runs add nothing)
```

## The LLM fallback

At most one `gpt-4o-mini` call per run, only when `LLM.can_call()` allows it **and** the regexes found nothing
for an agency in the window. Up to 10 articles that mention the missing agencies (title + first 1,200 chars)
go in; a strict JSON schema (`publisher` ∈ the three names, `metric` ∈ the five metrics, `article` index,
`phrase`) comes out. Rows are validated the same way as regex rows and stored with `note = "llm: <phrase>"`.

## Inputs → tables → outputs

| reads | writes | log |
|---|---|---|
| `articles` (48 h) | `figures` | `press_figures.done` (articles, figures, written, llm, per-agency counts) |

## Why sentence-level, and the known limits

Attribution is only as good as the sentence. A sentence that names two agencies gives each number to the agency
named just before it; a sentence quoting last year's figure in the same breath as this flood is not detectable
by a regex — the flood-context test and the ≥ 100 floor remove most of that. Wrong rows are visible: every
figure carries the sentence in `note` and the article in `url`, and `figures_latest` shows the newest `as_of`
first, so a stale re-quote loses to a fresher article.

## Failure behaviour

One try/except (`press_figures.failed`); ④ then runs on whatever is already in `figures`. `--dry-run` extracts
and reports counts without writing.
