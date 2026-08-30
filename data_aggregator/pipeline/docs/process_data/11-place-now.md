# ⑩ place_now — the per-place "what is happening now" line

Archive-only mode never queries `reports_anon`; form-report counts are always zero. The generated
line and any model polish use public figures, public headlines and the public-source ledger only.

`processing/place_now.py` · `process_data.py --step 10` · writes `place_status.now_en / now_ne / now_hi / now_sources / now_as_of`
(migration `db/migrations/008_place_now.sql`; the columns ride along in `v_place_status_latest`).

The ledger (③) says how many people are believed at a place; this step says what is *happening* there, in one or
two sentences a rescuer or a family can read on the place page, with every publisher named.

## Flow

```
  figures      scope place:<id>, fetched in the last 36 h ─┐
  articles     places ∋ id, fetched in the last 36 h      ─┤   per place with any signal
  reports_anon place_id = id, created in the last 36 h    ─┼─▶ facts_for()  { figures[{publisher, metric, value}],
  v_place_status_latest (expected / confirmed / unknown)  ─┘                  bridges_lost, headlines[{title, publisher, day}],
                                                                              reports (count), ledger }
                                                                    │
                                                                    ▼
                                                             template()  ─▶ EN / NE / HI sentence from FRAGMENTS
                                                                    │        "As of 30 Aug 08:45: 33 open help requests (OPMCM portal);
                                                                    │         2 bridge(s) to inspect (NESRA FloodWatch); 1,104 people
                                                                    │         believed here, 12 confirmed reached, 1,092 unknown (ledger);
                                                                    │         latest headline 29 Aug: “…” (Kathmandu Post)."
                                                                    ▼
                                             polish()  batches of 12 → llm.complete_json("place_now")
                                                       gpt-4o-mini, structured output {items:[{id,en,ne,hi}]}
                                                       stops when this step has spent PLACE_NOW_STEP_CAP_USD (1.0)
                                                       or the global guard refuses → the template is used instead
                                                                    │
                                                                    ▼
                                place_status  (latest row per place, matched on place_id + as_of)
                                now_en · now_ne · now_hi · now_sources ('NESRA FloodWatch · OPMCM portal · Kathmandu Post')
                                now_as_of = run time
```

## Steps

1. **Collect** the four inputs above in one query each (`fetched_at ≥ now − 36 h`; articles need `places ≠ {}`;
   reports need a `place_id`). Group by place: `place_of()` strips the `|bridge:<n>` suffix so per-bridge rows
   count for their place.
2. **Facts** (`facts_for`): the latest value per publisher × metric (by `as_of`), minus `SKIP_METRICS`
   (per-bridge rows, `bridge_status`, forecasts); `bridge_status` rows whose note starts "washed out"/"damaged" become
   `bridges_lost`; the two newest headline titles; the count of reports (never their text); the ledger triple.
   **Only counts, publisher names and headline titles exist past this point** — no names, phones or report text.
3. **Template** (`template`): fragments per metric in three languages (`FRAGMENTS`, `BRIDGE_STATUS`, `LEDGER`,
   `REPORTS`, `HEADLINE`), joined with "; ", prefixed "As of <NPT time>: ". Unknown metrics render as
   "<metric> <n> (<publisher>)". Latin digits everywhere. A place with no fragments gets nothing.
4. **Polish** (`polish`): drafts go to the model 12 per call (`PLACE_NOW_BATCH`) as `- id=<place>: <EN draft>`;
   the model returns polished EN + NE + HI per id. Ids the model did not return, or calls the guard refused, fall
   back to the template. The step tracks `llm.spent_usd` from its start and stops calling at
   `PLACE_NOW_STEP_CAP_USD` (1 USD) — the global `OPENAI_BUDGET_USD` guard still applies on top.
5. **Write**: `db.update("place_status", {place_id, as_of = latest row}, {now_*})` — one PATCH per place. Running the
   whole pipeline, ③ has just written today's rows, so the line lands on today's row; run alone, it updates the
   latest row that exists. `--dry-run` computes everything and writes nothing (and calls no model).

## Cost

One call ≈ 12 places × ~120 input tokens + ~150 output tokens per place → ≈ $0.001 per call with gpt-4o-mini;
a full run (~70 places, 6 calls) ≈ $0.006. The per-step cap of $1 is 150× that.

## Where it shows

`v_place_status_latest.now_<lang>` → the place page's status line and the corridor place card (web lane). Empty
= no signal in 36 h; the web shows the ledger only.

## Failure behaviour

| Failure | Effect |
|---|---|
| Model refused / API down | template lines written; `polished` = 0 in the step result |
| Step cap hit mid-run | remaining batches use templates; `place_now.step_cap` warning with the spend |
| A place with signal but no `place_status` row yet | skipped this run (the ledger writes the row next run) |
| Query error | step returns `{"error"}`; the rest of the pipeline continues |

## Tests

`tests/test_place_now.py`: facts keep the latest value per publisher × metric and drop per-bridge rows; the
template is trilingual, names every publisher and uses Latin digits; batching maps ids and ignores strangers;
the step cap stops calls; a refused model yields no polish; the write path (fake db) writes the polished line or
the template with `now_sources` and `now_as_of`; dry-run writes nothing.
