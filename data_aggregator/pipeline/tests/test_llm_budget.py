from lib import config
from lib.llm import LLM, FakeClient, estimate_cost_usd, schema


def test_cost_estimate():
    assert abs(estimate_cost_usd(1_000_000, 0) - config.LLM_PRICE_PER_M_INPUT_USD) < 1e-9
    assert abs(estimate_cost_usd(0, 1_000_000) - config.LLM_PRICE_PER_M_OUTPUT_USD) < 1e-9


def test_ledger_accumulates_and_persists(state):
    fake = FakeClient([{"ok": 1}], prompt_tokens=1000, completion_tokens=500)
    llm = LLM(state, client=fake, budget_usd=20)
    out = llm.complete_json("t", "sys", "user", schema("x", {"ok": {"type": "integer"}}))
    assert out == {"ok": 1} and llm.calls_this_run == 1
    assert state.llm_ledger()["calls"] == 1 and state.llm_ledger()["prompt_tokens"] == 1000
    assert abs(state.llm_ledger()["usd"] - estimate_cost_usd(1000, 500)) < 1e-9
    assert state.path.exists()


def test_budget_guard_refuses(state):
    fake = FakeClient([{"ok": 1}])
    llm = LLM(state, client=fake, budget_usd=0.001)
    state.llm_add(prompt_tokens=10, completion_tokens=10, usd=0.001, purpose="seed")
    assert llm.can_call() == (False, "budget exhausted (0.0010 ≥ 0.001)")
    assert llm.complete_json("t", "s", "u", schema("x", {"ok": {"type": "integer"}})) is None
    assert fake.calls == [] and llm.refused == 1


def test_per_run_cap(state):
    fake = FakeClient([{"ok": 1}])
    llm = LLM(state, client=fake, budget_usd=20, max_calls_per_run=2)
    fmt = schema("x", {"ok": {"type": "integer"}})
    assert llm.complete_json("t", "s", "u", fmt) and llm.complete_json("t", "s", "u", fmt)
    assert llm.complete_json("t", "s", "u", fmt) is None and len(fake.calls) == 2


def test_bad_json_is_none(state):
    llm = LLM(state, client=FakeClient(["not json"]), budget_usd=20)
    assert llm.complete_json("t", "s", "u", schema("x", {"ok": {"type": "integer"}})) is None
    assert state.llm_ledger()["calls"] == 1     # the call still cost money and is recorded


def test_strict_schema_shape():
    fmt = schema("r", {"a": {"type": "string"}, "b": {"type": ["integer", "null"]}})
    js = fmt["json_schema"]
    assert js["strict"] is True and js["schema"]["additionalProperties"] is False and js["schema"]["required"] == ["a", "b"]
