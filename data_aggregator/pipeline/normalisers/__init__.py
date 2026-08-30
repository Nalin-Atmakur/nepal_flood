"""
normalisers — one module per source_id turning a raw pull into RAW-zone rows.
See docs/pull_external_data/04-normalising.md (contract) and 05-sources.md (per-source notes);
normalisers/README.md has the template and the "adding a source" steps.

Contract (every module):

    SOURCE_ID = "<id from sources.yaml>"
    def normalise(raw: bytes, fetched_at: datetime, source: dict, ctx: Context | None = None) -> NormalisedRows

Optional:
    def prestore(parts: list[Part], ctx: Context | None) -> list[Part]
        runs in the puller *before* hashing/storing raw_pulls — the place to strip photos and
        replace names with hashed keys (opmcm_person_reports, ndrrma_rescues).

`raw` is either the single response body, or — when the puller fetched several URLs for one
source (url lists, templated urls, pagination) — an *envelope*:
    {"__parts__": [{"url": …, "status": …, "body": "<text>", "last_modified": …}, …]}
`parts(raw)` returns a uniform list either way. `NormalisedRows` carries figures / gauges /
articles / place_hints; the puller upserts them with the schema's dedupe keys. Nothing in a
NormalisedRows may contain a name, phone, passport number or photo.
"""
from __future__ import annotations

import importlib
import json
import pkgutil
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from lib import config

ENVELOPE_PREFIX = b'{"__parts__"'


@dataclass
class Part:
    url: str
    status: int = 200
    body: str = ""
    last_modified: str | None = None
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None and 200 <= self.status < 300

    def json(self) -> Any:
        try:
            return json.loads(self.body) if self.body else None
        except json.JSONDecodeError:
            return None


def parts(raw: bytes | str) -> list[Part]:
    if isinstance(raw, str):
        raw = raw.encode("utf-8")
    if raw.startswith(ENVELOPE_PREFIX):
        try:
            env = json.loads(raw.decode("utf-8"))
            return [Part(url=p.get("url", ""), status=int(p.get("status", 200)), body=p.get("body") or "",
                         last_modified=p.get("last_modified"), error=p.get("error")) for p in env["__parts__"]]
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
            pass
    return [Part(url="", status=200, body=raw.decode("utf-8", errors="replace"))]


def make_envelope(ps: list[Part]) -> bytes:
    return json.dumps({"__parts__": [{"url": p.url, "status": p.status, "body": p.body,
                                      "last_modified": p.last_modified, "error": p.error} for p in ps]},
                      ensure_ascii=False).encode("utf-8")


@dataclass
class Context:
    """Runtime helpers a normaliser may use (all optional; tests inject fakes)."""
    source_id: str = ""
    fetch: Callable[[str], Any] | None = None           # lib.http.get-like: url → Fetched
    upload: Callable[[str, bytes, str], str] | None = None   # (path, body, content_type) → storage path
    state: Any = None                                   # lib.state.State
    gazetteer: Any = None                               # lib.places.Gazetteer
    dry_run: bool = False

    def resolve(self, text: str | None) -> str | None:
        return self.gazetteer.resolve(text) if (self.gazetteer is not None and text) else None


@dataclass
class NormalisedRows:
    figures: list[dict[str, Any]] = field(default_factory=list)
    gauges: list[dict[str, Any]] = field(default_factory=list)
    articles: list[dict[str, Any]] = field(default_factory=list)
    place_hints: list[dict[str, Any]] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def figure(self, *, publisher: str, metric: str, value: float | int | None, scope: str = "national",
               as_of: datetime | None = None, url: str | None = None, note: str | None = None,
               source_id: str | None = None, fetched_at: datetime | None = None) -> None:
        if value is None:
            return
        self.figures.append({
            "publisher": publisher, "metric": metric, "scope": scope or "national", "value": value,
            "as_of": as_of, "url": url, "note": note, "source_id": source_id, "fetched_at": fetched_at,
        })

    def article(self, *, url: str, title: str | None, publisher: str | None, lang: str | None,
                published_at: datetime | None, body: str | None = None, places: list[str] | None = None,
                source_id: str | None = None, fetched_at: datetime | None = None) -> None:
        if not url:
            return
        self.articles.append({
            "url": url, "title": title, "publisher": publisher, "lang": lang, "published_at": published_at,
            "body": body, "places": places or [], "source_id": source_id, "fetched_at": fetched_at,
        })

    def gauge(self, **g: Any) -> None:
        self.gauges.append(g)

    def hint(self, text: str, place_id: str | None, count: int = 1, kind: str = "") -> None:
        self.place_hints.append({"text": text, "place_id": place_id, "count": count, "kind": kind})

    def extend(self, other: "NormalisedRows") -> None:
        self.figures += other.figures
        self.gauges += other.gauges
        self.articles += other.articles
        self.place_hints += other.place_hints
        self.notes += other.notes

    def counts(self) -> dict[str, int]:
        return {"figures": len(self.figures), "gauges": len(self.gauges), "articles": len(self.articles),
                "place_hints": len(self.place_hints)}


def registry() -> dict[str, str]:
    """source_id → module name for every normaliser module in this package."""
    out: dict[str, str] = {}
    for m in pkgutil.iter_modules([str(Path(__file__).parent)]):
        if m.name.startswith("_"):
            continue
        out[m.name] = f"normalisers.{m.name}"
    return out


def get(source_id: str) -> Any | None:
    if source_id not in registry():
        return None
    return importlib.import_module(f"normalisers.{source_id}")


def load_fixture(name: str) -> bytes:
    return (config.FIXTURE_DIR / name).read_bytes()


def utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
