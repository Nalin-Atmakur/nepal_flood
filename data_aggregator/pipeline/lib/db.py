"""
lib/db.py — the database client (Supabase PostgREST + Storage + Auth admin) over plain HTTPS.
See docs/pull_external_data/04-normalising.md (upsert keys) and docs/process_data/09-failure-modes.md.

    Db.from_env()  →  Db | None            (None = local-only mode: SUPABASE_URL unset)
    db.select(table, params) / select_all(table, params)   PostgREST query-string filters
    db.insert / upsert / update / delete                    batched, `Prefer: return=minimal`
    db.upsert_figures(rows) · upsert_gauges(rows) · upsert_articles(rows)   the three RAW writers
    db.storage_upload(path, bytes, content_type)            bucket `raw`, upsert
    db.auth_admin_create_user(email)                        service-role admin endpoint

Why not supabase-py: it is installed, but every call went through httpx and hung on the
DNS64 IPv6 addresses this laptop resolves for *.supabase.co (lib/net.py); a 200-line
requests wrapper is faster, forces IPv4 once, and gives explicit control of `on_conflict`
and `resolution=ignore-duplicates` (articles must never be clobbered by a re-pull, because
process_data ① writes `places`/`extracted` back into them).

Dedupe keys (from db/migrations/002_raw.sql):
  figures   unique (publisher, metric, scope, as_of, value)  → `as_of` is never left null
  gauges    primary key (station_id, observed_at)
  articles  unique (url)
The service-role key is read from the environment and never logged.
"""
from __future__ import annotations

import json
import os
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any, Iterable

import requests

from . import config, log
from .net import force_ipv4

force_ipv4()

BATCH = 500


class DbError(RuntimeError):
    pass


def _jsonable(v: Any) -> Any:
    if isinstance(v, date) and not isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, datetime):
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v.isoformat()
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, set):
        return sorted(v)
    return v


def _clean(row: dict[str, Any]) -> dict[str, Any]:
    return {k: _jsonable(v) for k, v in row.items()}


class Db:
    def __init__(self, url: str, service_key: str, timeout: float = 30.0):
        self.url = url.rstrip("/")
        self._key = service_key
        self.timeout = timeout
        self.s = requests.Session()
        self.s.headers.update({
            "apikey": self._key,
            "Authorization": f"Bearer {self._key}",
            "User-Agent": "nepalfloodtracker-pipeline/1.0",
        })

    @classmethod
    def from_env(cls) -> "Db | None":
        config.load_env()
        url = os.environ.get("SUPABASE_URL", "").strip()
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        if not url:
            return None
        if not key:
            raise DbError("SUPABASE_URL is set but SUPABASE_SERVICE_ROLE_KEY is empty")
        return cls(url, key)

    # ---- low level ---------------------------------------------------------
    def _req(self, method: str, path: str, *, params: dict[str, Any] | None = None, json_body: Any = None,
             headers: dict[str, str] | None = None, data: bytes | None = None) -> requests.Response:
        h = dict(headers or {})
        try:
            r = self.s.request(method, self.url + path, params=params, json=json_body, data=data,
                               headers=h, timeout=self.timeout)
        except requests.RequestException as e:
            raise DbError(f"{method} {path}: {type(e).__name__}") from e
        if r.status_code >= 400:
            raise DbError(f"{method} {path} → {r.status_code}: {r.text[:300]}")
        return r

    def select(self, table: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        p = {"select": "*"}
        p.update(params or {})
        r = self._req("GET", f"/rest/v1/{table}", params=p)
        return r.json() if r.content else []

    def select_all(self, table: str, params: dict[str, Any] | None = None, page: int = 1000) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        offset = 0
        base = dict(params or {})
        base.setdefault("select", "*")
        while True:
            p = dict(base)
            p["limit"] = page
            p["offset"] = offset
            rows = self.select(table, p)
            out.extend(rows)
            if len(rows) < page:
                return out
            offset += page

    def count(self, table: str, params: dict[str, Any] | None = None) -> int:
        p = {"select": "*", "limit": 1}
        p.update(params or {})
        r = self._req("GET", f"/rest/v1/{table}", params=p, headers={"Prefer": "count=exact"})
        cr = r.headers.get("content-range", "*/0")
        try:
            return int(cr.split("/")[-1])
        except ValueError:
            return 0

    def insert(self, table: str, rows: Iterable[dict[str, Any]], returning: bool = False) -> list[dict[str, Any]]:
        rows = [_clean(r) for r in rows]
        out: list[dict[str, Any]] = []
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i + BATCH]
            r = self._req("POST", f"/rest/v1/{table}", json_body=chunk,
                          headers={"Prefer": "return=representation" if returning else "return=minimal"})
            if returning and r.content:
                out.extend(r.json())
        return out

    def upsert(self, table: str, rows: Iterable[dict[str, Any]], on_conflict: str,
               ignore_duplicates: bool = False, returning: bool = False) -> list[dict[str, Any]]:
        rows = [_clean(r) for r in rows]
        if not rows:
            return []
        # PostgREST requires every row in a batch to have the same keys
        keys: list[str] = []
        for r in rows:
            for k in r:
                if k not in keys:
                    keys.append(k)
        rows = [{k: r.get(k) for k in keys} for r in rows]
        res = "ignore-duplicates" if ignore_duplicates else "merge-duplicates"
        prefer = f"resolution={res},return={'representation' if returning else 'minimal'}"
        out: list[dict[str, Any]] = []
        for i in range(0, len(rows), BATCH):
            chunk = rows[i:i + BATCH]
            r = self._req("POST", f"/rest/v1/{table}", params={"on_conflict": on_conflict},
                          json_body=chunk, headers={"Prefer": prefer})
            if returning and r.content:
                out.extend(r.json())
        return out

    def update(self, table: str, match: dict[str, Any], values: dict[str, Any]) -> None:
        if not match:
            raise DbError("refusing to update without a filter")
        self._req("PATCH", f"/rest/v1/{table}", params=match, json_body=_clean(values),
                  headers={"Prefer": "return=minimal"})

    def delete(self, table: str, match: dict[str, Any]) -> None:
        if not match:
            raise DbError("refusing to delete without a filter")
        self._req("DELETE", f"/rest/v1/{table}", params=match, headers={"Prefer": "return=minimal"})

    # ---- the three RAW writers ---------------------------------------------
    def upsert_figures(self, rows: list[dict[str, Any]]) -> int:
        clean: list[dict[str, Any]] = []
        seen: set[tuple] = set()
        for f in rows:
            if f.get("value") is None or f.get("publisher") is None or f.get("metric") is None:
                continue
            row = {
                "source_id": f.get("source_id"), "publisher": f["publisher"], "metric": f["metric"],
                "scope": f.get("scope") or "national", "value": float(f["value"]),
                "as_of": f.get("as_of") or f.get("fetched_at") or datetime.now(timezone.utc),
                "fetched_at": f.get("fetched_at") or datetime.now(timezone.utc),
                "url": f.get("url"), "note": (f.get("note") or None),
            }
            key = (row["publisher"], row["metric"], row["scope"], str(_jsonable(row["as_of"])), row["value"])
            if key in seen:
                continue
            seen.add(key)
            clean.append(row)
        self.upsert("figures", clean, on_conflict="publisher,metric,scope,as_of,value", ignore_duplicates=True)
        return len(clean)

    def upsert_gauges(self, rows: list[dict[str, Any]]) -> int:
        clean = []
        seen: set[tuple] = set()
        for g in rows:
            if not g.get("station_id") or not g.get("observed_at"):
                continue
            key = (str(g["station_id"]), str(_jsonable(g["observed_at"])))
            if key in seen:
                continue
            seen.add(key)
            clean.append({
                "station_id": str(g["station_id"]), "station_name": g.get("station_name"), "river": g.get("river"),
                "lat": g.get("lat"), "lon": g.get("lon"), "level": g.get("level"), "warning": g.get("warning"),
                "danger": g.get("danger"), "observed_at": g["observed_at"],
                "fetched_at": g.get("fetched_at") or datetime.now(timezone.utc), "alive": g.get("alive"),
            })
        self.upsert("gauges", clean, on_conflict="station_id,observed_at")
        return len(clean)

    def upsert_articles(self, rows: list[dict[str, Any]]) -> int:
        clean = []
        seen: set[str] = set()
        for a in rows:
            url = (a.get("url") or "").strip()
            if not url or url in seen:
                continue
            seen.add(url)
            clean.append({
                "source_id": a.get("source_id"), "url": url, "title": (a.get("title") or "")[:1000] or None,
                "publisher": a.get("publisher"), "lang": a.get("lang"), "published_at": a.get("published_at"),
                "fetched_at": a.get("fetched_at") or datetime.now(timezone.utc),
                "body": (a.get("body") or None), "places": list(a.get("places") or []),
                "extracted": a.get("extracted"),
            })
        self.upsert("articles", clean, on_conflict="url", ignore_duplicates=True)
        return len(clean)

    # ---- storage / auth ----------------------------------------------------
    def storage_upload(self, path: str, body: bytes, content_type: str = "application/octet-stream",
                       bucket: str = config.STORAGE_BUCKET) -> str:
        self._req("POST", f"/storage/v1/object/{bucket}/{path.lstrip('/')}", data=body,
                  headers={"Content-Type": content_type, "x-upsert": "true"})
        return f"{bucket}/{path.lstrip('/')}"

    def storage_exists(self, path: str, bucket: str = config.STORAGE_BUCKET) -> bool:
        prefix, _, name = path.lstrip("/").rpartition("/")
        try:
            r = self._req("POST", f"/storage/v1/object/list/{bucket}",
                          json_body={"prefix": prefix, "limit": 1000, "search": name})
            return any(o.get("name") == name for o in r.json())
        except DbError:
            return False

    def auth_admin_create_user(self, email: str, password: str | None = None) -> dict[str, Any]:
        body: dict[str, Any] = {"email": email, "email_confirm": True}
        if password:
            body["password"] = password
        r = self._req("POST", "/auth/v1/admin/users", json_body=body)
        return r.json()

    def auth_admin_find_user(self, email: str) -> dict[str, Any] | None:
        r = self._req("GET", "/auth/v1/admin/users", params={"page": 1, "per_page": 200})
        for u in (r.json().get("users") or []):
            if (u.get("email") or "").lower() == email.lower():
                return u
        return None

    def ping(self) -> bool:
        try:
            self.select("sources", {"select": "id", "limit": 1})
            return True
        except DbError as e:
            log.error("db.ping_failed", error=str(e)[:120])
            return False


def dumps(o: Any) -> str:
    return json.dumps(o, ensure_ascii=False, default=_jsonable)


def _storage_download(self: "Db", path: str, bucket: str = config.STORAGE_BUCKET) -> bytes:
    r = self._req("GET", f"/storage/v1/object/{bucket}/{path.lstrip('/')}")
    return r.content


Db.storage_download = _storage_download  # type: ignore[attr-defined]
