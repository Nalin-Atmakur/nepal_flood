# 07 — the LLM and the $20 guard (`lib/llm.py`)

```
   caller ─▶ LLM.complete_json(purpose, system, user, response_format, max_tokens)
                 │
                 ├─ can_call()?  spent_usd ≥ OPENAI_BUDGET_USD → refuse (llm.refused)
                 │               calls_this_run ≥ LLM_MAX_CALLS_PER_RUN (40) → refuse
                 ├─ user text truncated to LLM_MAX_INPUT_CHARS (6000)
                 ├─ openai.OpenAI(api_key=OPENAI_API_KEY).chat.completions.create(
                 │      model="gpt-4o-mini", messages=[system, user],
                 │      response_format={"type": "json_schema", "json_schema": {"strict": true, …}},
                 │      max_tokens, temperature=0)
                 ├─ usage.prompt_tokens × $0.15/M + usage.completion_tokens × $0.60/M → _state.json["llm"]
                 │      {calls, prompt_tokens, completion_tokens, usd, history[≤ 500]}  (saved immediately)
                 └─ json.loads(content) → dict | None
```

| item | value |
|---|---|
| model | `gpt-4o-mini` (`config.LLM_MODEL`) |
| prices | `LLM_PRICE_PER_M_INPUT_USD = 0.15`, `LLM_PRICE_PER_M_OUTPUT_USD = 0.60` |
| budget | `OPENAI_BUDGET_USD` from `.env` (default 20) — cumulative across runs, read from `_state.json` |
| per-run cap | `LLM_MAX_CALLS_PER_RUN = 40` (shared by ⓪ and ①) |
| structured outputs | `lib.llm.schema(name, properties)` builds a strict schema: every property required, `additionalProperties: false`; `nullable(type)` for optional fields |
| no usage reported | conservative estimate: `(len(system)+len(user)) // 3` prompt tokens, `max_tokens // 2` completion |

## Where calls happen

Family reports are deliberately absent. `FAMILY_REPORT_PROCESSING_ENABLED=false` prevents the
anonymisation caller from selecting a row or constructing a prompt. OpenAI is used only for
public articles and public-source translation/polish in the current deployment.

| step | purpose | per | max_tokens | typical cost |
|---|---|---|---|---|
| ① resolve_places | `resolve_place` | one per article with no alias hit that mentions corridor keywords | 120 | ≈ $0.0003 |
| ② dedup | none in v1 (grey-zone pairs go to `dedup_queue` for a human) | | | |

The guard exists for runaway public-source loops, not as a privacy control.

## Refusal semantics

`complete_json` returns `None` (never raises) when refused, when the API errors, or when the
content is not valid JSON; a failed API call still counts toward `calls_this_run`. Callers
decide: ⓪ falls back to a PII-free row without free text when the budget is gone and skips
(retries later) on a transient error; ① records `method = "none"`. `llm.refused` is logged
at most three times per run; `llm.call` logs tokens and cumulative USD per call;
`llm.unavailable` means `OPENAI_API_KEY` is unset.

## Reading the ledger

`_state.json` → `"llm": {"calls": …, "usd": …, "history": [{"at", "purpose", "usd"}]}`;
`process_data.py` prints `"llm": {calls_this_run, refused, spent_usd}` in its JSON summary and
logs `process.start … llm_spent_usd=… llm_budget_usd=…`. Tests use `lib.llm.FakeClient`
(`tests/test_llm_budget.py`, `tests/test_anonymise.py`) — no key, no network.

## Step ⑦ digest

One call per run (`purpose = "digest"`, ~1.5k prompt tokens, ~600 completion tokens ≈ $0.0006): polish
the deterministic EN bullets and translate them to NE/HI in one strict-JSON response. Guarded like every
other call; on refusal the EN template text is stored for all three languages (`model = 'fallback'`).
