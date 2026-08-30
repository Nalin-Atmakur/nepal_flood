# normalisers — one module per source id

A normaliser turns one raw pull into RAW-zone rows and nothing else. It is pure by default
(bytes in, rows out), may use `ctx` for sub-fetches, Storage and the gazetteer, and never lets
a name, phone, passport number or photo through. Docs:
`docs/pull_external_data/04-normalising.md` (contract) and `05-sources.md` (per source).

## Contract

```python
SOURCE_ID = "my_source"                      # == sources.yaml id == module name
PUBLISHER = "Who publishes the number"       # what the site prints next to every figure

def normalise(raw: bytes, fetched_at: datetime, source: dict, ctx: Context | None = None) -> NormalisedRows: ...
def prestore(parts: list[Part], ctx: Context | None = None) -> list[Part]: ...   # optional, PII sources only
```

- `raw` — the single response body, or the envelope `{"__parts__": [{url, status, body, last_modified, error}]}`
  the puller builds when a source has several URLs / pages. Always go through `parts(raw) → [Part]`;
  `Part.ok`, `Part.json()`, `Part.body`, `Part.url` tell you what you got.
- `NormalisedRows` — `.figures`, `.gauges`, `.articles`, `.place_hints`, `.notes`, with builders
  `figure(publisher=, metric=, value=, scope="national", as_of=, url=, note=)`,
  `article(url=, title=, publisher=, lang=, published_at=, body=)`, `gauge(**cols)`,
  `hint(text, place_id, count, kind)`, and `extend(other)`. Figures need `publisher`, `metric`,
  numeric `value`; give `as_of` whenever the publisher states a time (else it becomes `fetched_at`).
- `Context` — `fetch(url) → Fetched` (lib.http.get), `upload(path, bytes, content_type) → storage path`
  (bucket `raw`), `state` (lib.state.State: `seen()/add_seen()` per source), `gazetteer`
  (`ctx.resolve(text) → place_id | None`), `dry_run`. Any of them may be `None`; tests inject fakes.
- `prestore(parts, ctx)` runs in the puller **before hashing and storing**: drop identifiers, add
  `person_key` (`lib.text.person_key`) — so `raw_pulls` holds a keyed projection, not names.
- The puller upserts with the schema keys: figures `(publisher, metric, scope, as_of, value)`,
  gauges `(station_id, observed_at)`, articles `(url)`; unresolved `place_hints` are appended to
  `snapshots/place_hints.jsonl`; `notes` are logged as `pull.note`.
- Modules starting with `_` (`_common.py`: `parse_dt`, `strip_tags`, `parse_bs_datetime`;
  `_rss.py`: feed → articles + the relevance gate; `_geo.py`: haversine, centroid, nearest gazetteer
  place; `_stac.py`: bounded STAC link walking) are helpers, not sources. `registry()` lists the rest.

## Template

```python
"""
normalisers/my_source.py — <what it is> → <figures|articles|gauges>.
docs/pull_external_data/05-sources.md §my_source.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from lib.text import slugify

from . import Context, NormalisedRows, parts
from ._common import parse_dt

SOURCE_ID = "my_source"
PUBLISHER = "My Publisher"


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()
    for p in parts(raw):
        doc = p.json()
        if not p.ok or not isinstance(doc, dict):
            out.notes.append(f"{p.url}: {p.error or p.status}")
            continue
        as_of = parse_dt(doc.get("updated_at")) or fetched_at
        for row in doc.get("items") or []:
            place = ctx.resolve(row.get("location")) if ctx else None
            out.hint(str(row.get("location")), place, 1)
            out.figure(publisher=PUBLISHER, metric="things_counted", value=row.get("count"),
                       scope=f"place:{place or slugify(row.get('location'))}", as_of=as_of,
                       url=p.url, note=None, source_id=SOURCE_ID, fetched_at=fetched_at)
    return out
```

For a PII source add:

```python
DROP = ("name", "phone", "photo")

def prestore(ps, ctx=None):
    import json
    from lib.text import person_key
    from . import Part
    out = []
    for p in ps:
        doc = p.json()
        if isinstance(doc, dict) and isinstance(doc.get("items"), list):
            for it in doc["items"]:
                it["person_key"] = person_key(phone=it.get("phone"), name=it.get("name"), age=it.get("age"), nationality=it.get("nationality"))
                for k in DROP:
                    it.pop(k, None)
            p = Part(url=p.url, status=p.status, body=json.dumps(doc, ensure_ascii=False), last_modified=p.last_modified, error=p.error)
        out.append(p)
    return out
```

## Adding a source (short form — full steps in `docs/pull_external_data/06-adding-a-source.md`)

1. Entry in `../sources.yaml` (`id`, `family`, `url`, `cadence`, `pii`).
2. `normalisers/<id>.py` from the template above; `prestore()` if `pii: true`.
3. Capture a live response, add it to `tests/build_fixtures.py`, run it (names →
   `EXAMPLE-PERSON-n`, phones → `98XXXXXXXX`, PII sources through `prestore()`).
4. Register the fixture in `tests/test_normalisers.py::FIXTURES` and add `test_<id>`; run pytest.
5. Seed the `sources` table (`../db/seed`) so the `pulls` foreign key accepts the id.
6. `pull_external_data.py --only <id> --dry-run --verbose`, then for real.
7. A section in `docs/pull_external_data/05-sources.md`.
