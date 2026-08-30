"""
lib/http.py — one careful fetcher for every source.
See docs/pull_external_data/03-fetching.md.

    get(url, *, etag, last_modified)  ─▶  Fetched(url, status, body, headers, etag,
    post(url, json=…)                      last_modified, sha256, fetched_at, elapsed_s,
                                           not_modified, error)

* browser User-Agent (some hosts serve placeholders to non-browsers)
* 20 s timeout, 2 retries with backoff on connection errors / 5xx / 429
* conditional requests: sends If-None-Match / If-Modified-Since when the caller passes the
  values remembered in _state.json; a 304 comes back as `not_modified=True` with empty body
* sha256 of the body so the puller can mark `unchanged` even when the server ignores ETags
* never raises: errors land in `Fetched.error`; callers fail soft per source
"""
from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import requests

from . import config, log
from .net import force_ipv4

force_ipv4()


@dataclass
class Fetched:
    url: str
    status: int = 0
    body: bytes = b""
    headers: dict[str, str] = field(default_factory=dict)
    etag: str | None = None
    last_modified: str | None = None
    sha256: str = ""
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    elapsed_s: float = 0.0
    not_modified: bool = False
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None and 200 <= self.status < 300

    @property
    def text(self) -> str:
        return self.body.decode("utf-8", errors="replace")

    def content_type(self) -> str:
        return self.headers.get("content-type", "").split(";")[0].strip().lower()


def body_hash(body: bytes) -> str:
    return hashlib.sha256(body).hexdigest()


_session: requests.Session | None = None


def session() -> requests.Session:
    global _session
    if _session is None:
        s = requests.Session()
        s.headers.update({"User-Agent": config.USER_AGENT, "Accept": "*/*", "Accept-Language": "en,ne;q=0.8"})
        _session = s
    return _session


def _request(method: str, url: str, *, etag: str | None = None, last_modified: str | None = None,
             json: Any = None, data: Any = None, headers: dict[str, str] | None = None,
             timeout: float | None = None, retries: int | None = None, verify: bool = True) -> Fetched:
    hdrs: dict[str, str] = dict(headers or {})
    if etag:
        hdrs["If-None-Match"] = etag
    if last_modified:
        hdrs["If-Modified-Since"] = last_modified
    timeout = timeout or config.HTTP_TIMEOUT_S
    retries = config.HTTP_RETRIES if retries is None else retries
    started = time.monotonic()
    last_err: str | None = None
    for attempt in range(retries + 1):
        try:
            r = session().request(method, url, headers=hdrs, json=json, data=data, timeout=timeout,
                                  allow_redirects=True, verify=verify, stream=True)
            length = r.headers.get("content-length")
            if length and int(length) > config.MAX_BODY_BYTES:
                r.close()
                return Fetched(url=url, status=r.status_code, error=f"body too large ({length} bytes)")
            body = r.content if r.status_code != 304 else b""
            if len(body) > config.MAX_BODY_BYTES:
                return Fetched(url=url, status=r.status_code, error=f"body too large ({len(body)} bytes)")
            f = Fetched(
                url=url, status=r.status_code, body=body,
                headers={k.lower(): v for k, v in r.headers.items()},
                etag=r.headers.get("ETag"), last_modified=r.headers.get("Last-Modified"),
                sha256=body_hash(body) if body else "", elapsed_s=round(time.monotonic() - started, 3),
                not_modified=(r.status_code == 304),
            )
            if r.status_code in (429, 500, 502, 503, 504) and attempt < retries:
                last_err = f"http {r.status_code}"
                time.sleep(config.HTTP_BACKOFF_S * (attempt + 1))
                continue
            if r.status_code >= 400 and r.status_code != 304:
                f.error = f"http {r.status_code}"
            return f
        except requests.RequestException as e:  # connection errors, timeouts
            last_err = type(e).__name__
            if attempt < retries:
                time.sleep(config.HTTP_BACKOFF_S * (attempt + 1))
                continue
    log.warn("http.failed", url=url, error=last_err)
    return Fetched(url=url, status=0, error=last_err or "unknown", elapsed_s=round(time.monotonic() - started, 3))


def get(url: str, **kw: Any) -> Fetched:
    return _request("GET", url, **kw)


def post(url: str, *, json: Any = None, data: Any = None, **kw: Any) -> Fetched:
    return _request("POST", url, json=json, data=data, **kw)
