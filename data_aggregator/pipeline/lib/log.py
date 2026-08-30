"""
lib/log.py — structured logging without PII.
See docs/pull_external_data/07-failure-modes.md ("how to see it") and docs/process_data/09-failure-modes.md.

Every line is `ts level event key=value …`. Values pass through `redact()`, which removes
anything that looks like a phone number, an e-mail address or a passport number, so a
careless caller cannot leak PII into run.log. Names are never passed to the logger by design
(no normaliser or processing step logs free text from a report).
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_PHONE_RE = re.compile(r"(?<!\d)(?:\+?\d(?:[\s-]?\d){8,13})(?!\d)")   # 9–14 digits, optional separators
_DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")                                # ISO dates/timestamps are not phones
_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PASSPORT_RE = re.compile(r"\b[A-Z]{1,2}\d{6,8}\b")
_SECRET_RE = re.compile(r"(eyJ[\w-]{20,}|sk-[\w-]{20,}|sbp_[\w]{20,})")

_LEVELS = {"debug": 10, "info": 20, "warn": 30, "error": 40}
_level = 20
_file: Path | None = None


def redact(value: Any) -> Any:
    if isinstance(value, str):
        v = _SECRET_RE.sub("[secret]", value)
        v = _EMAIL_RE.sub("[email]", v)
        v = _PHONE_RE.sub(lambda m: m.group(0) if _DATE_RE.search(m.group(0)) else "[phone]", v)
        v = _PASSPORT_RE.sub("[id]", v)
        return v if len(v) <= 300 else v[:297] + "..."
    if isinstance(value, dict):
        return {k: redact(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [redact(v) for v in value]
    return value


def configure(level: str = "info", file: Path | None = None) -> None:
    global _level, _file
    _level = _LEVELS.get(level, 20)
    _file = file


def _emit(level: str, event: str, **fields: Any) -> None:
    if _LEVELS[level] < _level:
        return
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    safe = redact(fields)
    parts = [ts, level.upper(), event]
    for k, v in safe.items():
        if isinstance(v, (dict, list)):
            v = json.dumps(v, ensure_ascii=False, default=str)
        parts.append(f"{k}={v}")
    line = " ".join(parts)
    print(line, file=sys.stderr, flush=True)
    if _file:
        try:
            with _file.open("a", encoding="utf-8") as fh:
                fh.write(line + "\n")
        except OSError:
            pass


def debug(event: str, **f: Any) -> None:
    _emit("debug", event, **f)


def info(event: str, **f: Any) -> None:
    _emit("info", event, **f)


def warn(event: str, **f: Any) -> None:
    _emit("warn", event, **f)


def error(event: str, **f: Any) -> None:
    _emit("error", event, **f)
