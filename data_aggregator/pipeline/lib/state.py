"""
lib/state.py — the pipeline's small persistent memory: pipeline/_state.json.
See docs/pull_external_data/02-scheduling.md and docs/process_data/08-llm-budget.md.

Layout:
{
  "sources": {"<source_id>": {"last_fetch_at": iso, "last_ok_at": iso, "etag": str|null,
                               "last_modified": str|null, "body_hash": str|null,
                               "seen": [..]            # per-source memory (e.g. publication ids)
                               }},
  "llm":     {"calls": n, "prompt_tokens": n, "completion_tokens": n, "usd": float,
              "history": [{"at": iso, "purpose": str, "usd": float}, …]},
  "runs":    {"pull": {"last_at": iso}, "process": {"last_at": iso}}
}
Writes are atomic (temp file + rename). Tests point `STATE_PATH` elsewhere via `State(path)`.
"""
from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from . import config


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime | None) -> str | None:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds") if dt else None


def parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


class State:
    def __init__(self, path: Path | None = None):
        self.path = path or config.STATE_PATH
        self.data: dict[str, Any] = {"sources": {}, "llm": {}, "runs": {}}
        self.load()

    # ---- persistence -------------------------------------------------------
    def load(self) -> None:
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                self.data = {"sources": {}, "llm": {}, "runs": {}}
        for k in ("sources", "llm", "runs"):
            self.data.setdefault(k, {})

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=self.path.parent, prefix="._state", suffix=".json")
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(self.data, fh, ensure_ascii=False, indent=1, default=str)
        os.replace(tmp, self.path)

    # ---- per-source --------------------------------------------------------
    def source(self, source_id: str) -> dict[str, Any]:
        return self.data["sources"].setdefault(source_id, {})

    def last_fetch(self, source_id: str) -> datetime | None:
        return parse_iso(self.source(source_id).get("last_fetch_at"))

    def record_fetch(self, source_id: str, *, ok: bool, etag: str | None, last_modified: str | None,
                     body_hash: str | None, at: datetime | None = None) -> None:
        s = self.source(source_id)
        now = iso(at or utcnow())
        s["last_fetch_at"] = now
        if ok:
            s["last_ok_at"] = now
            if etag is not None:
                s["etag"] = etag
            if last_modified is not None:
                s["last_modified"] = last_modified
            if body_hash is not None:
                s["body_hash"] = body_hash
        else:
            s["last_error_at"] = now

    def seen(self, source_id: str, key: str = "seen") -> set[str]:
        return set(self.source(source_id).get(key, []))

    def add_seen(self, source_id: str, items: list[str], key: str = "seen", cap: int = 5000) -> None:
        s = self.source(source_id)
        cur = list(dict.fromkeys(list(s.get(key, [])) + [str(i) for i in items]))
        s[key] = cur[-cap:]

    # ---- llm ledger --------------------------------------------------------
    def llm_ledger(self) -> dict[str, Any]:
        l = self.data["llm"]
        l.setdefault("calls", 0)
        l.setdefault("prompt_tokens", 0)
        l.setdefault("completion_tokens", 0)
        l.setdefault("usd", 0.0)
        l.setdefault("history", [])
        return l

    def llm_add(self, *, prompt_tokens: int, completion_tokens: int, usd: float, purpose: str) -> None:
        l = self.llm_ledger()
        l["calls"] += 1
        l["prompt_tokens"] += prompt_tokens
        l["completion_tokens"] += completion_tokens
        l["usd"] = round(l["usd"] + usd, 6)
        l["history"].append({"at": iso(utcnow()), "purpose": purpose, "usd": round(usd, 6)})
        l["history"] = l["history"][-500:]

    # ---- runs --------------------------------------------------------------
    def mark_run(self, which: str, **extra: Any) -> None:
        self.data["runs"][which] = {"last_at": iso(utcnow()), **extra}
