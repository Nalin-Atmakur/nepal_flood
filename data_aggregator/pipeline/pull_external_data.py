#!/usr/bin/env python3
"""
pull_external_data.py — external sources → ARCHIVE (raw_pulls) + RAW (figures, gauges, articles).
Docs: docs/pull_external_data/01-overview.md … 07-failure-modes.md (one file per stage below).

    sources.yaml ──▶ (02) due by cadence × 2^failures? ──▶ (03) expand urls · fetch (ETag/If-Modified-Since, sha256)
                                                  │            ↑ PULL_WORKERS threads fetch in parallel; everything
                            prestore() strips photos/names ◀─┘   after the fetch runs on the main thread, in completion order
                                                  ▼
                       (03) raw_pulls (unchanged=true, no body when hash == last) + pulls log
                                                  ▼
                       (04) normalisers/<id>.normalise() ─▶ relevance gate on articles ─▶ upsert figures / gauges / articles
                                                  ▼
                       _state.json: last_fetch_at, etag, last_modified, body_hash per source

Flags: --only <id> (repeatable, comma lists accepted) · --force (ignore cadence, backoff and hashes) ·
--dry-run (fetch + normalise, write nothing) · --workers N (default PULL_WORKERS=6; 1 = sequential) · --verbose. Local-only mode when SUPABASE_URL is unset: raw bodies go
to pipeline/snapshots/<id>/<ts>.<ext>, normalised rows to <ts>.normalised.json.
Fails soft per source; the process exits 0 unless the script itself crashes.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import config, log  # noqa: E402
from lib.db import Db, DbError  # noqa: E402
from lib.http import Fetched, body_hash, get, post  # noqa: E402
from lib.places import Gazetteer  # noqa: E402
from lib.state import State, iso, utcnow  # noqa: E402
import normalisers  # noqa: E402
from normalisers import Context, NormalisedRows, Part, make_envelope  # noqa: E402
from normalisers._rss import is_relevant  # noqa: E402

INLINE_BODY_MAX = 2 * 1024 * 1024        # bigger raw bodies go to Storage raw/<id>/<ts>.<ext>
BIPAD_MAX_PAGES = 10
HTML_MAX_PAGES = 3                        # tag pages never come back "empty"; 3 pages is plenty per hour
POST_BODIES = {                            # sources.yaml keeps these in comments; the parser drops them
    "https://api.thepaper.cn/search/web/news": {"word": "吉隆口岸", "pageNum": 1, "pageSize": 20},
    "http://search.people.cn/search-platform/front/search": {"key": "吉隆口岸", "page": 1, "limit": 20},
}


# ─── (02) scheduling ──────────────────────────────────────────────────────────

def load_sources(path: Path = config.SOURCES_YAML) -> list[dict[str, Any]]:
    doc = yaml.safe_load(path.read_text(encoding="utf-8"))
    return [s for s in doc.get("sources", []) if isinstance(s, dict) and s.get("id")]


def backoff_minutes(cadence_minutes: int, failures: int, cap: int = config.BACKOFF_CAP_MINUTES) -> int:
    """
    Minutes to wait after the last fetch before trying a source again.
    0 failures → its cadence; n failures → cadence × 2^n (2×, 4×, 8× …), never more than `cap` (24 h);
    a static source that has failed waits like an hourly one would. A success resets `failures` to 0.
    """
    base = min(int(cadence_minutes), cap) if cadence_minutes < config.STATIC_MINUTES else 60
    if failures <= 0:
        return base
    return int(min(base * (2 ** min(int(failures), 20)), cap))


def is_due(state: State, src: dict[str, Any], now: datetime) -> bool:
    minutes = config.cadence_minutes(str(src.get("cadence") or ""))
    sid = src["id"]
    s = state.source(sid)
    failures = state.failures(sid)
    last = state.last_fetch(sid)
    if minutes >= config.STATIC_MINUTES and s.get("last_ok_at"):
        return False                                    # fetched once, fine forever
    if last is None:
        return True
    return now - last >= timedelta(minutes=backoff_minutes(minutes, failures))


def select_due(sources: list[dict[str, Any]], state: State, now: datetime, *, only: list[str], force: bool) -> list[dict[str, Any]]:
    """The sources this run will fetch: --only wins; else --force takes all; else cadence × backoff. Sources without a URL, or with `verified: false`, never run unless named in --only."""
    due: list[dict[str, Any]] = []
    for src in sources:
        sid = src["id"]
        if only and sid not in only:
            continue
        if not only and not force and not is_due(state, src, now):
            log.debug("pull.not_due", source=sid, failures=state.failures(sid))
            continue
        if not src.get("url") or (isinstance(src.get("url"), str) and not src["url"].startswith("http")):
            log.info("pull.skip_no_url", source=sid)
            continue
        if src.get("verified") is False and not only:
            # registered candidate without a working parser yet (sources.yaml `verified: false`) — only on --only
            log.debug("pull.skip_unverified", source=sid)
            continue
        due.append(src)
    return due


# ─── (03) url expansion ───────────────────────────────────────────────────────

def expand_alternatives(url: str) -> list[str]:
    """'a/{x|y/{n}}/z' → ['a/x/z', 'a/y/{n}/z'] — the outermost {…|…} group is expanded; {n} survives."""
    depth = 0
    start = -1
    for i, ch in enumerate(url):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}" and depth:
            depth -= 1
            if depth == 0:
                inner = url[start + 1:i]
                # split on top-level '|' only
                alts, d, cur = [], 0, ""
                for c in inner:
                    if c == "{":
                        d += 1
                    elif c == "}":
                        d -= 1
                    if c == "|" and d == 0:
                        alts.append(cur); cur = ""
                    else:
                        cur += c
                alts.append(cur)
                if len(alts) > 1:
                    out: list[str] = []
                    for a in alts:
                        out.extend(expand_alternatives(url[:start] + a.strip() + url[i + 1:]))
                    return out
    return [url]


INNER_POOL_WORKERS = 4      # threads for one source's own URL list (see docs/pull_external_data/03-fetching.md §6)
INNER_POOL_MIN_URLS = 4


def requests_for(src: dict[str, Any]) -> list[dict[str, Any]]:
    """[{url, method, json, paged, verify}] for one source, before pagination."""
    sid = src["id"]
    raw_urls = src.get("url")
    urls = raw_urls if isinstance(raw_urls, list) else [raw_urls] if isinstance(raw_urls, str) else []
    urls = [u.strip() for u in urls if isinstance(u, str) and u.strip().startswith(("http://", "https://"))]
    if sid == "openmeteo_corridor":
        urls = [("https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&hourly=precipitation,cloud_cover_low"
                 "&models=ecmwf_ifs025&timezone=Asia%2FKathmandu&forecast_days=4").format(lat, lon)
                for lat, lon in config.OPENMETEO_SITES.values()]
    verify = "self-signed" not in str(src.get("auth") or "")
    reqs: list[dict[str, Any]] = []
    for u in urls:
        for eu in expand_alternatives(u):
            if "{" in eu.replace("{n}", ""):
                continue   # unresolved template such as {sitrep-slug}: needs a discovery step (wave 2)
            method = "POST" if src.get("family") == "post_api" else "GET"
            reqs.append({"url": eu, "method": method, "json": POST_BODIES.get(eu) if method == "POST" else None,
                         "paged": "{n}" in eu, "verify": verify})
    return reqs


def _page_empty(body: str) -> bool:
    try:
        doc = json.loads(body)
    except json.JSONDecodeError:
        return not body.strip()
    if isinstance(doc, list):
        return len(doc) == 0
    if isinstance(doc, dict):
        d = doc.get("data")
        for cont in (doc, d if isinstance(d, dict) else {}):
            for k in ("results", "items", "features", "data"):
                v = cont.get(k)
                if isinstance(v, list):
                    return len(v) == 0
        if isinstance(d, list):
            return len(d) == 0
    return False


def _to_part(f: Fetched) -> Part:
    return Part(url=f.url, status=f.status, body=f.text if f.body else "", last_modified=f.last_modified, error=f.error)


def fetch_source(src: dict[str, Any], state: State, force: bool) -> tuple[list[Part], Fetched | None]:
    """Fetch every URL of a source (with pagination). Returns parts and the single Fetched (for etag bookkeeping)."""
    sid = src["id"]
    reqs = requests_for(src)
    parts: list[Part] = []
    single: Fetched | None = None
    s = state.source(sid)
    conditional = len(reqs) == 1 and not reqs[0]["paged"] and not force
    # A source with many plain GET pages (police_udb's 16 district lists, bipad_river_series' 11 stations) fetches
    # them with a small inner pool; results are consumed below in the original order. Paged / POST / cursor
    # requests keep the sequential path.
    simple = [r["url"] for r in reqs if r["method"] == "GET" and not r["paged"] and sid != "bipad_river_stations"]
    pre: dict[str, Fetched] = {}
    if len(simple) >= INNER_POOL_MIN_URLS and not conditional:
        verify = reqs[0]["verify"]
        with ThreadPoolExecutor(max_workers=INNER_POOL_WORKERS) as ipool:
            for url, f in zip(simple, ipool.map(lambda u: get(u, verify=verify), simple)):
                pre[url] = f
    for r in reqs:
        if r["method"] == "POST":
            f = post(r["url"], json=r["json"], verify=r["verify"])
            parts.append(_to_part(f))
            single = f if len(reqs) == 1 else None
            continue
        if not r["paged"]:
            f = pre.get(r["url"]) or get(r["url"], etag=s.get("etag") if conditional else None,
                                         last_modified=s.get("last_modified") if conditional else None, verify=r["verify"])
            single = f if len(reqs) == 1 else None
            parts.append(_to_part(f))
            if sid == "bipad_river_stations" and f.ok:
                nxt = None
                try:
                    nxt = json.loads(f.text).get("next")
                except (json.JSONDecodeError, AttributeError):
                    pass
                pages = 1
                while nxt and pages < BIPAD_MAX_PAGES:
                    g = get(nxt, verify=r["verify"])
                    parts.append(_to_part(g))
                    pages += 1
                    if not g.ok or _page_empty(g.text):
                        break
                    try:
                        nxt = json.loads(g.text).get("next")
                    except (json.JSONDecodeError, AttributeError):
                        nxt = None
            continue
        # {n} pagination: page=1.. or offset=0,limit,2·limit..
        by_offset = "offset={n}" in r["url"]
        m = re.search(r"limit=(\d+)", r["url"])
        step = int(m.group(1)) if m else 100
        max_pages = HTML_MAX_PAGES if src.get("family") == "html" else config.MAX_PAGES
        for i in range(max_pages):
            n = i * step if by_offset else i + 1
            url = r["url"].replace("{n}", str(n))
            f = get(url, verify=r["verify"])
            parts.append(_to_part(f))
            if not f.ok or _page_empty(f.text):
                break
            try:
                doc = json.loads(f.text)
                if isinstance(doc, dict) and "next" in doc and not doc.get("next"):
                    break
            except json.JSONDecodeError:
                pass
    return parts, single


def ext_for(src: dict[str, Any], parts: list[Part]) -> str:
    fmt = str(src.get("format") or "").lower()
    if len(parts) > 1:
        return "json"
    for k in ("json", "xml", "rss", "html", "geojson", "csv", "text"):
        if fmt.startswith(k):
            return {"rss": "xml", "geojson": "json", "text": "txt"}.get(k, k)
    return "txt"


# ─── (03) the fetch phase runs in a thread pool ──────────────────────────────

class Prefetched:
    """What a worker thread hands back: the parts (or the exception) plus timing, nothing touched the DB yet."""

    def __init__(self, source_id: str, fetched_at: datetime, parts: list[Part] | None = None, single: Fetched | None = None,
                 error: BaseException | None = None, seconds: float = 0.0):
        self.source_id, self.fetched_at, self.parts, self.single, self.error, self.seconds = source_id, fetched_at, parts or [], single, error, seconds


def prefetch(src: dict[str, Any], state: State, force: bool) -> Prefetched:
    """Runs on a worker thread: only network I/O and reads of _state.json's etag/last_modified (never a write)."""
    t0 = time.monotonic()
    fetched_at = utcnow()
    try:
        parts, single = fetch_source(src, state, force)
        return Prefetched(src["id"], fetched_at, parts, single, seconds=round(time.monotonic() - t0, 1))
    except Exception as e:  # noqa: BLE001 — surfaced on the main thread by run_source
        return Prefetched(src["id"], fetched_at, error=e, seconds=round(time.monotonic() - t0, 1))


# ─── the per-source run ──────────────────────────────────────────────────────

class Runner:
    def __init__(self, *, db: Db | None, state: State, gaz: Gazetteer, dry_run: bool, force: bool):
        self.db, self.state, self.gaz, self.dry_run, self.force = db, state, gaz, dry_run, force
        self.summary: list[dict[str, Any]] = []

    def ctx(self, sid: str) -> Context:
        upload = None
        if self.db is not None:
            upload = lambda path, body, ct: self.db.storage_upload(path, body, ct)  # noqa: E731
        return Context(source_id=sid, fetch=get, upload=upload, state=self.state, gazetteer=self.gaz, dry_run=self.dry_run)

    def run_source(self, src: dict[str, Any], prefetched: "Prefetched | None" = None) -> dict[str, Any]:
        """Everything for one source. `prefetched` comes from the thread pool (main() below); without it we fetch here."""
        sid = src["id"]
        started = time.monotonic()
        fetched_at = prefetched.fetched_at if prefetched else utcnow()
        rec: dict[str, Any] = {"source": sid, "ok": False, "unchanged": False, "parts": 0, "error": None}
        try:
            if prefetched is None:
                parts, single = fetch_source(src, self.state, self.force)
            elif prefetched.error is not None:
                raise prefetched.error
            else:
                parts, single = prefetched.parts, prefetched.single
                rec["fetch_seconds"] = prefetched.seconds
            rec["parts"] = len(parts)
            if not parts:
                rec["error"] = "no url"
                self._log_pull(sid, fetched_at, ok=False, error="no url")
                return rec
            if single is not None and single.not_modified:
                rec.update(ok=True, unchanged=True)
                self._log_pull(sid, fetched_at, ok=True, unchanged=True, http_status=304)
                self.state.record_fetch(sid, ok=True, etag=None, last_modified=None, body_hash=None, at=fetched_at)
                return rec
            ok_parts = [p for p in parts if p.ok]
            status = max((p.status for p in parts), default=0)
            if not ok_parts:
                err = "; ".join(f"{p.error or p.status}" for p in parts[:3])
                rec["error"] = err
                self._log_pull(sid, fetched_at, ok=False, http_status=status, error=err)
                self.state.record_fetch(sid, ok=False, etag=None, last_modified=None, body_hash=None, at=fetched_at)
                return rec
            mod = normalisers.get(sid)
            ctx = self.ctx(sid)
            if mod is not None and hasattr(mod, "prestore"):
                parts = mod.prestore(parts, ctx)
            raw = parts[0].body.encode("utf-8") if len(parts) == 1 else make_envelope(parts)
            h = body_hash(raw)
            unchanged = (h == self.state.source(sid).get("body_hash")) and not self.force
            rec["unchanged"] = unchanged
            rec["bytes"] = len(raw)
            raw_pull_id = self._store_raw(src, raw, fetched_at, status, unchanged, h, ext_for(src, parts))
            self._log_pull(sid, fetched_at, ok=True, unchanged=unchanged, http_status=status, bytes_=len(raw), raw_pull_id=raw_pull_id)
            self.state.record_fetch(sid, ok=True, etag=single.etag if single else None,
                                    last_modified=single.last_modified if single else None, body_hash=h, at=fetched_at)
            rec["ok"] = True
            if mod is None:
                rec["normaliser"] = "none"
                return rec
            if unchanged:
                rec["normaliser"] = "skipped (unchanged)"
                return rec
            rows = mod.normalise(raw, fetched_at, src, ctx)
            kept = [a for a in rows.articles if is_relevant(a.get("title"), a.get("body"), self.gaz)]
            if len(kept) != len(rows.articles):
                rows.notes.append(f"relevance gate dropped {len(rows.articles) - len(kept)} article(s)")
                rows.articles = kept
            for r in rows.figures + rows.articles + rows.gauges:
                r.setdefault("source_id", sid)
                r.setdefault("fetched_at", fetched_at)
            rec["rows"] = rows.counts()
            rec["notes"] = rows.notes[:5]
            self._write_rows(src, rows, fetched_at)
            self._record_hints(sid, rows)
            return rec
        except Exception as e:  # noqa: BLE001 — fail soft per source
            rec["error"] = f"{type(e).__name__}: {str(e)[:200]}"
            log.error("pull.source_crashed", source=sid, error=rec["error"])
            try:
                self._log_pull(sid, fetched_at, ok=False, error=rec["error"])
                self.state.record_fetch(sid, ok=False, etag=None, last_modified=None, body_hash=None, at=fetched_at)
            except Exception:  # noqa: BLE001
                pass
            return rec
        finally:
            rec["seconds"] = round(time.monotonic() - started, 1)
            self.summary.append(rec)
            log.info("pull.source", **{k: v for k, v in rec.items() if k != "notes"})
            for n in rec.get("notes") or []:
                log.info("pull.note", source=sid, note=n)
            if not self.dry_run:
                self.state.save()

    # ---- writers -----------------------------------------------------------
    def _store_raw(self, src: dict[str, Any], raw: bytes, fetched_at: datetime, status: int, unchanged: bool,
                   h: str, ext: str) -> int | None:
        sid = src["id"]
        if self.dry_run:
            return None
        ts = fetched_at.strftime("%Y%m%dT%H%M%SZ")
        if self.db is None:
            d = config.SNAPSHOT_DIR / sid
            d.mkdir(parents=True, exist_ok=True)
            if not unchanged:
                (d / f"{ts}.{ext}").write_bytes(raw)
            return None
        row: dict[str, Any] = {"source_id": sid, "fetched_at": fetched_at, "http_status": status, "bytes": len(raw),
                               "unchanged": unchanged, "body_hash": h, "body": None, "storage_path": None}
        if not unchanged:
            if len(raw) <= INLINE_BODY_MAX:
                row["body"] = raw.decode("utf-8", errors="replace")
            else:
                path = f"{sid}/{fetched_at.strftime('%Y-%m-%d')}/{ts}.{ext}"
                ct = {"json": "application/json", "xml": "application/xml", "html": "text/html"}.get(ext, "text/plain")
                row["storage_path"] = self.db.storage_upload(path, raw, ct)
        res = self.db.insert("raw_pulls", [row], returning=True)
        return res[0]["id"] if res else None

    def _log_pull(self, sid: str, fetched_at: datetime, *, ok: bool, unchanged: bool = False, http_status: int | None = None,
                  bytes_: int | None = None, raw_pull_id: int | None = None, error: str | None = None) -> None:
        if self.dry_run or self.db is None:
            return
        try:
            self.db.insert("pulls", [{"source_id": sid, "fetched_at": fetched_at, "ok": ok, "unchanged": unchanged,
                                      "http_status": http_status, "bytes": bytes_, "raw_pull_id": raw_pull_id,
                                      "error": (error or None) and str(error)[:500]}])
        except DbError as e:
            log.error("pull.log_failed", source=sid, error=str(e)[:200])

    def _write_rows(self, src: dict[str, Any], rows: NormalisedRows, fetched_at: datetime) -> None:
        sid = src["id"]
        if self.dry_run:
            return
        if self.db is None:
            d = config.SNAPSHOT_DIR / sid
            d.mkdir(parents=True, exist_ok=True)
            (d / f"{fetched_at.strftime('%Y%m%dT%H%M%SZ')}.normalised.json").write_text(
                json.dumps({"figures": rows.figures, "gauges": rows.gauges, "articles": rows.articles,
                            "place_hints": rows.place_hints}, ensure_ascii=False, default=str, indent=1), encoding="utf-8")
            return
        n_f = self.db.upsert_figures(rows.figures) if rows.figures else 0
        n_g = self.db.upsert_gauges(rows.gauges) if rows.gauges else 0
        n_a = self.db.upsert_articles(rows.articles) if rows.articles else 0
        # sources that fetch the full page behind URLs another feed already stored as summaries (docs 05d §5)
        n_e = self.db.enrich_article_bodies(rows.articles) if (rows.articles and src.get("enrich_bodies")) else 0
        log.info("pull.written", source=sid, figures=n_f, gauges=n_g, articles=n_a, enriched=n_e)

    def _record_hints(self, sid: str, rows: NormalisedRows) -> None:
        """Unresolved place texts (no names — normalisers only pass location strings) → snapshots/place_hints.jsonl."""
        if self.dry_run:
            return
        unresolved = [h for h in rows.place_hints if not h.get("place_id") and h.get("text")]
        if not unresolved:
            return
        config.SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
        with (config.SNAPSHOT_DIR / "place_hints.jsonl").open("a", encoding="utf-8") as fh:
            for h in unresolved[:200]:
                fh.write(json.dumps({"source": sid, "at": iso(utcnow()), **h}, ensure_ascii=False) + "\n")
        log.info("pull.unresolved_places", source=sid, n=len(unresolved))


# ─── main ────────────────────────────────────────────────────────────────────

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--only", action="append", default=[], help="source id (repeatable; 'a,b' lists accepted)")
    ap.add_argument("--force", action="store_true", help="ignore cadence, backoff and body hashes")
    ap.add_argument("--workers", type=int, default=config.PULL_WORKERS, help="parallel fetchers (1 = sequential)")
    ap.add_argument("--dry-run", action="store_true", help="fetch and normalise, write nothing")
    ap.add_argument("--local", action="store_true", help="local-only mode even if SUPABASE_URL is set")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args(argv)

    config.load_env()
    log.configure("debug" if args.verbose else "info", file=config.RUN_LOG)
    state = State()
    db = None if args.local else Db.from_env()
    if db is not None and not db.ping():
        log.error("pull.db_unreachable")
        db = None
    mode = "dry-run" if args.dry_run else ("db" if db else "local")
    sources = load_sources()
    gaz = Gazetteer.load(db)
    now = utcnow()
    only = [x.strip() for o in args.only for x in o.split(",") if x.strip()]
    log.info("pull.start", mode=mode, sources=len(sources), only=only or None, force=args.force, workers=args.workers,
             interval_minutes=config.PULL_INTERVAL_MINUTES)
    runner = Runner(db=db, state=state, gaz=gaz, dry_run=args.dry_run, force=args.force)
    due = select_due(sources, state, now, only=only, force=args.force)
    workers = max(1, args.workers)
    if workers == 1 or len(due) <= 1:
        for src in due:
            runner.run_source(src)
    else:
        # fetch phase in a pool; normalise + DB writes on this thread as each fetch completes (order = completion order)
        with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="fetch") as pool:
            futures = {pool.submit(prefetch, src, state, args.force): src for src in due}
            for fut in as_completed(futures):
                runner.run_source(futures[fut], fut.result())
    ok = sum(1 for r in runner.summary if r["ok"])
    bad = [r["source"] for r in runner.summary if not r["ok"]]
    if not args.dry_run:
        state.mark_run("pull", ok=ok, failed=bad)
        state.save()
    log.info("pull.done", ran=len(runner.summary), ok=ok, failed=bad or None, seconds=round(time.monotonic() - _T0, 1))
    print(json.dumps({"mode": mode, "ran": len(runner.summary), "ok": ok, "failed": bad,
                      "sources": [{k: v for k, v in r.items() if k in ("source", "ok", "unchanged", "rows", "error", "seconds")}
                                  for r in runner.summary]}, ensure_ascii=False, indent=1, default=str))
    return 0


_T0 = time.monotonic()

if __name__ == "__main__":
    sys.exit(main())
