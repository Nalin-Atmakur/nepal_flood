# ⑦ Digest — `processing/digest.py`

The daily "what changed" block on the home page: one headline and 5–10 bullets per language
(`digest` table, primary key `day × lang`). Bullets are ordered by what a carrier shares first
(the biggest change), then what a rescuer needs, then what to watch. Dated milestones go to
`event_timeline` through ⑧ timeline, not here.

```
figures_latest (national) ─┐  (a) figure   one bullet per publisher (NDRRMA · Nepal Police (via press) · MoFA · Dept of Tourism /
figures (as_of < today)   ─┤               NTB (via press) · OPMCM portal), ≤ 3 metrics each with "(+N since yesterday)" against
                           │               the last value before 00:00 NPT — sorted by the largest change first
v_place_status_latest     ─┤  (b) rescuers "For rescuers: 63 of 64 tracked places still have people unaccounted for (−2 vs yesterday);
place_status (< today)    ─┤               newly reached: Betrawati; largest gaps: Timure (968), Mailung (66), …"
                           │  (c) place    confirmed_reached rose · phones turned "yes (…)" · unknown fell to 0 (top 2, needs a baseline)
v_gauges_latest + gauges  ─┤  (d) gauge    corridor gauges back / silent since 00:00 NPT (no change → "N of 11 reporting (…)")
figures flying_window_*   ─┤  (d') watch   "What to watch: next good morning flying window 30 Aug 06–11 NPT · Dhunche;
articles (48 h, lake)     ─┤               barrier lake — Kathmandu Post: <headline>"        (only when there is something to say)
articles (published today)─┘  (e) news     ≤ 3 headlines whose TITLE passes normalisers/_rss.is_relevant (flood / rescue / missing
                                           vocabulary or a gazetteer place) — place-tagged first, then newest; fills to ≥ 5 bullets
            │
            ▼  build_bullets()  — pure, deterministic, unit-tested (tests/test_digest.py)
   headline_en + bullets [{text, kind: figure|rescuers|place|gauge|watch|news, source_url}]   (5 ≤ n ≤ 10)
            │
            ▼  translate()  — ONE gpt-4o-mini call (strict JSON: headline_{en,ne,hi}, bullets_{en,ne,hi})
   polished EN + NE + HI, same bullet count and order — or, when the budget guard refuses / the
   call fails / the shape is wrong, the template EN copied into ne and hi (model = 'fallback')
            │
            ▼
   digest (day, 'en'|'ne'|'hi')  upsert
```

## Inputs → tables → outputs

| reads | writes |
|---|---|
| `figures_latest` (scope national), `figures` (previous-day values, flying window), `v_place_status_latest`, `place_status`, `v_gauges_latest`, `gauges`, `articles` | `digest` (3 rows per day) |

The headline is `Day N after the flood — NDRRMA: <dead> dead · <missing> out of contact · <rescued> rescued`
(N counted from 26 Aug 2026; Nepal Police, then MoFA, if NDRRMA has no dead figure). The OPMCM portal's
dead/missing/rescued counters are skipped because they are report counts.

## Baselines

(b)'s "vs yesterday" / "newly reached", (c) and the gauge change claims need yesterday's state: place bullets
only when a `place_status` row from before 00:00 NPT exists, gauge back-online/silent only when `gauges` holds
observations from before today; otherwise the gauge line is the plain count and the rescuers line states the
current gaps without a delta. Numbers are forced back to Latin digits in NE/HI after translation.

## Why the news gate

The feed gate keeps whole feeds; the digest picks single titles. "Nepal Rastra Bank Sets Today's Exchange
Rates" arrived through a relevant outlet feed and reached the digest — `relevant_news()` now requires the
title itself to pass `is_relevant` (keywords or a gazetteer place; district names alone no longer count).

## Failure behaviour

- Nothing to say (no figures, places, gauges or articles) → no row, `{"skipped": "nothing to say"}`.
- LLM refused (budget / per-run cap) or wrong shape → `model = 'fallback'`, EN text in all three languages;
  the next run re-translates (upsert on `day, lang`).
- Any DB error → logged as `digest.failed`, step returns `{"error"}`; the rest of the run is unaffected.
- Re-runs within a day overwrite the day's rows; the deltas are always against the last value *before* the
  day, so they do not drift between runs.
