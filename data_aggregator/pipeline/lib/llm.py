"""
lib/llm.py — the only door to OpenAI, with the $20 guard.
See docs/process_data/08-llm-budget.md.

    LLM(state, client=None)                       client = openai.OpenAI(...) or any fake with
    llm.complete_json(purpose, system, user,       .chat.completions.create(...) → .choices[0]
                      schema, max_tokens)          .message.content and .usage.{prompt,completion}_tokens
        → dict | None                              None = refused (budget / cap / error) — callers
                                                   must degrade gracefully, never crash

Cost ledger: every call adds (prompt_tokens × $0.15/M + completion_tokens × $0.60/M) to
_state.json["llm"]; the guard refuses to call once the cumulative estimate ≥ OPENAI_BUDGET_USD,
and also after LLM_MAX_CALLS_PER_RUN calls in one process. Structured outputs use
`response_format={"type": "json_schema", "json_schema": {"strict": true, …}}` so the model can
only answer with the schema; the JSON is parsed and returned as a dict.
"""
from __future__ import annotations

import json
import os
from typing import Any

from . import config, log
from .state import State


class BudgetExceeded(RuntimeError):
    pass


def estimate_cost_usd(prompt_tokens: int, completion_tokens: int) -> float:
    return (prompt_tokens * config.LLM_PRICE_PER_M_INPUT_USD + completion_tokens * config.LLM_PRICE_PER_M_OUTPUT_USD) / 1e6


def schema(name: str, properties: dict[str, Any], required: list[str] | None = None) -> dict[str, Any]:
    """Build a strict json_schema response_format (all properties required, no extras)."""
    return {
        "type": "json_schema",
        "json_schema": {
            "name": name,
            "strict": True,
            "schema": {
                "type": "object",
                "properties": properties,
                "required": required if required is not None else list(properties.keys()),
                "additionalProperties": False,
            },
        },
    }


def nullable(t: str, **extra: Any) -> dict[str, Any]:
    d: dict[str, Any] = {"type": [t, "null"]}
    d.update(extra)
    return d


class LLM:
    def __init__(self, state: State, client: Any = None, budget_usd: float | None = None,
                 max_calls_per_run: int | None = None, model: str = config.LLM_MODEL):
        self.state = state
        self._client = client
        self.budget_usd = config.openai_budget_usd() if budget_usd is None else budget_usd
        self.max_calls = config.LLM_MAX_CALLS_PER_RUN if max_calls_per_run is None else max_calls_per_run
        self.model = model
        self.calls_this_run = 0
        self.refused = 0

    # ---- ledger ------------------------------------------------------------
    @property
    def spent_usd(self) -> float:
        return float(self.state.llm_ledger().get("usd", 0.0))

    def remaining_usd(self) -> float:
        return max(0.0, self.budget_usd - self.spent_usd)

    def can_call(self) -> tuple[bool, str]:
        if self.spent_usd >= self.budget_usd:
            return False, f"budget exhausted ({self.spent_usd:.4f} ≥ {self.budget_usd})"
        if self.calls_this_run >= self.max_calls:
            return False, f"per-run cap reached ({self.max_calls})"
        return True, ""

    # ---- client ------------------------------------------------------------
    def client(self) -> Any:
        if self._client is None:
            key = os.environ.get("OPENAI_API_KEY", "").strip()
            if not key:
                raise RuntimeError("OPENAI_API_KEY not set")
            from openai import OpenAI  # imported lazily so tests never need it
            self._client = OpenAI(api_key=key)
        return self._client

    # ---- the call ----------------------------------------------------------
    def complete_json(self, purpose: str, system: str, user: str, response_format: dict[str, Any],
                      max_tokens: int = 900, temperature: float = 0.0) -> dict[str, Any] | None:
        ok, why = self.can_call()
        if not ok:
            self.refused += 1
            if self.refused <= 3:
                log.warn("llm.refused", purpose=purpose, why=why)
            return None
        user = user if len(user) <= config.LLM_MAX_INPUT_CHARS else user[:config.LLM_MAX_INPUT_CHARS] + " …"
        try:
            client = self.client()
        except RuntimeError as e:
            self.refused += 1
            log.warn("llm.unavailable", purpose=purpose, why=str(e))
            return None
        try:
            resp = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                response_format=response_format,
                max_tokens=max_tokens,
                temperature=temperature,
            )
        except Exception as e:  # noqa: BLE001 — API/network errors never crash a run
            self.calls_this_run += 1
            log.error("llm.call_failed", purpose=purpose, error=type(e).__name__)
            return None
        self.calls_this_run += 1
        usage = getattr(resp, "usage", None)
        pt = int(getattr(usage, "prompt_tokens", 0) or 0)
        ct = int(getattr(usage, "completion_tokens", 0) or 0)
        if pt == 0 and ct == 0:  # no usage reported → conservative estimate
            pt, ct = (len(system) + len(user)) // 3, max_tokens // 2
        usd = estimate_cost_usd(pt, ct)
        self.state.llm_add(prompt_tokens=pt, completion_tokens=ct, usd=usd, purpose=purpose)
        self.state.save()
        log.info("llm.call", purpose=purpose, prompt_tokens=pt, completion_tokens=ct,
                 usd=round(usd, 6), total_usd=round(self.spent_usd, 4))
        try:
            content = resp.choices[0].message.content
            if isinstance(content, str):
                return json.loads(content)
            if isinstance(content, dict):
                return content
        except (AttributeError, IndexError, json.JSONDecodeError, TypeError) as e:
            log.error("llm.bad_response", purpose=purpose, error=type(e).__name__)
        return None


class FakeClient:
    """Test double: returns canned JSON strings in order (or the last one forever)."""

    def __init__(self, answers: list[dict[str, Any] | str], prompt_tokens: int = 500, completion_tokens: int = 200):
        self.answers = list(answers)
        self.calls: list[dict[str, Any]] = []
        self.pt, self.ct = prompt_tokens, completion_tokens
        self.chat = self
        self.completions = self

    def create(self, **kw: Any) -> Any:
        self.calls.append(kw)
        ans = self.answers.pop(0) if len(self.answers) > 1 else self.answers[0]
        content = ans if isinstance(ans, str) else json.dumps(ans, ensure_ascii=False)

        class _Msg:  # minimal shape of an OpenAI response
            pass
        msg = _Msg(); msg.content = content
        choice = _Msg(); choice.message = msg
        usage = _Msg(); usage.prompt_tokens = self.pt; usage.completion_tokens = self.ct
        resp = _Msg(); resp.choices = [choice]; resp.usage = usage
        return resp
