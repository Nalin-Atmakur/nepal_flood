# ⑦ Digest — `processing/digest.py`

The daily "what changed" block on the home page: one headline and 5–8 bullets per language
(`digest` table, primary key `day × lang`), plus one `event_timeline` response row per day.

```
figures_latest (national) ─┐  (a) NDRRMA / Nepal Police / MoFA / OPMCM portal: dead · missing · rescued ·
figures (as_of < today)   ─┤      lost_open · without_contact · foreigners_missing, each with
                           │      "(+N since yesterday)" against the last value before 00:00 NPT
v_place_status_latest     ─┤  (b) places whose confirmed_reached rose, whose phones turned "yes (…)",
place_status (< today)    ─┤      or whose unknown fell to 0 (top 2 by size of change)
v_gauges_latest + gauges  ─┤  (c) corridor gauges that came back / went silent since 00:00 NPT
                           │      (no change → one "N of 11 reporting (…)" line)
articles (published today)─┘  (d) the newest relevance-gated headlines, place-tagged first
            │
            ▼  build_bullets()  — pure, deterministic, unit-tested (tests/test_digest.py)
   headline_en + bullets [{text, kind: figure|place|gauge|news, source_url}]   (5 ≤ n ≤ 8)
            │
            ▼  translate()  — ONE gpt-4o-mini call (strict JSON: headline_{en,ne,hi}, bullets_{en,ne,hi})
   polished EN + NE + HI, same bullet count and order — or, when the budget guard refuses / the
   call fails / the shape is wrong, the template EN copied into ne and hi (model = 'fallback')
            │
            ▼
   digest (day, 'en'|'ne'|'hi')  upsert     +     event_timeline r<YYYYMMDD>_ndrrma (kind=response)
                                                  when NDRRMA's latest dead/missing/rescued is dated today
```

## Inputs → tables → outputs

| reads | writes |
|---|---|
| `figures_latest` (scope national), `figures` (previous-day values), `v_place_status_latest`, `place_status`, `v_gauges_latest`, `gauges`, `articles` | `digest` (3 rows per day), `event_timeline` (≤ 1 row per day) |

Bullet order: figures (one per publisher, ≤ 3 metrics each; the OPMCM portal's dead/missing/rescued
counters are skipped because they are report counts) → places (≤ 2) → gauges (1) → news
(fills to at least 5, never beyond 8). The headline is
`Day N after the flood — NDRRMA: <dead> dead · <missing> out of contact · <rescued> rescued`
(N counted from 26 Aug 2026; MoFA if NDRRMA has no dead figure).

## Baselines

(b) and (c) need yesterday's state: place bullets are only produced when a `place_status` row from before
00:00 NPT exists, and gauge back-online/silent claims only when the `gauges` table holds observations from
before today; otherwise the gauge line is the plain count. On the first day of operation the digest is
therefore figures + gauge count + news. Numbers are forced back to Latin digits in NE/HI after translation.

## Failure behaviour

- Nothing to say (no figures, places, gauges or articles) → no row, `{"skipped": "nothing to say"}`.
- LLM refused (budget / per-run cap) or wrong shape → `model = 'fallback'`, EN text in all three languages;
  the next run re-translates (upsert on `day, lang`).
- Any DB error → logged as `digest.failed`, step returns `{"error"}`; the rest of the run is unaffected.
- Re-runs within a day overwrite the day's rows; the deltas are always against the last value *before* the
  day, so they do not drift between runs.
