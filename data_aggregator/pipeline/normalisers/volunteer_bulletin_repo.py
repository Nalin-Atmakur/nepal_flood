"""
normalisers/volunteer_bulletin_repo.py — nirajbhusal/rasuwa-flood-bulletin raw files → figures (counts only).
docs/pull_external_data/05a-sources-wave2-official.md §volunteer_bulletin_repo.

Parts: the GitHub contents listing + ndrrma-rescue.csv · army-heli-rescue.csv · rasuwa-foreign-rescued.csv ·
rasuwa-hospital-dhunche.csv · dhm-rivers.json (raw.githubusercontent.com, no key).
    prestore()  ─▶ every CSV becomes {file, rows, columns, counts:{<safe column>: {value: n}}} — the lists
                    (names, addresses, ages, contacts) never reach raw_pulls; JSON parts are kept as is
    normalise() ─▶ publisher 'Volunteer bulletin (nirajbhusal)' (reliability C — it compiles official lists):
                    rescued_named_listed (ndrrma-rescue rows; scoped status:/nationality:) · rescued scope place:<…>
                    heli_rescued_listed · foreigners_rescued_listed (scoped nationality:) · hospital_dhunche_listed
                    (scoped status:) · water_level_m scope station:<slug> from dhm-rivers.json (as_of observed_at)
                    · repo_files from the listing
Row counts are data rows (header excluded). as_of = fetched_at except the gauge readings.
"""
from __future__ import annotations

import csv
import io
import json
import re
from collections import Counter
from datetime import datetime
from typing import Any

from lib.text import nfc, slugify

from . import Context, NormalisedRows, Part, parts
from ._common import parse_dt

SOURCE_ID = "volunteer_bulletin_repo"
PUBLISHER = "Volunteer bulletin (nirajbhusal)"
REPO_URL = "https://github.com/nirajbhusal/rasuwa-flood-bulletin"
SAFE_COLUMNS = re.compile(r"^(status|nationality|country|location|rescued_date|gender|rescue date.*|लिंग|लिङ्ग|उद्धार मिति|अवस्था)$", re.I)
MAX_DISTINCT = 100
FILE_METRICS = {
    "ndrrma-rescue.csv": "rescued_named_listed", "army-heli-rescue.csv": "heli_rescued_listed",
    "rasuwa-foreign-rescued.csv": "foreigners_rescued_listed", "rasuwa-hospital-dhunche.csv": "hospital_dhunche_listed",
}


def file_of(url: str) -> str:
    return (url or "").rstrip("/").rsplit("/", 1)[-1]


def project_csv(url: str, text: str) -> dict[str, Any]:
    rows = list(csv.reader(io.StringIO(text.lstrip("﻿"))))
    header = [nfc(h).strip().lstrip("﻿") for h in (rows[0] if rows else [])]
    data = [r for r in rows[1:] if any(c.strip() for c in r)]
    counts: dict[str, dict[str, int]] = {}
    for i, h in enumerate(header):
        if not SAFE_COLUMNS.match(h):
            continue
        c: Counter[str] = Counter(nfc(r[i]).strip() for r in data if i < len(r) and r[i].strip())
        counts[h] = dict(c.most_common(MAX_DISTINCT))
    return {"file": file_of(url), "rows": len(data), "columns": header, "counts": counts}


def prestore(ps: list[Part], ctx: Context | None = None) -> list[Part]:
    out: list[Part] = []
    for p in ps:
        if p.ok and file_of(p.url).endswith(".csv"):
            out.append(Part(url=p.url, status=p.status, body=json.dumps(project_csv(p.url, p.body), ensure_ascii=False),
                            last_modified=p.last_modified, error=p.error))
        else:
            out.append(p)
    return out


def _column(doc: dict[str, Any], *names: str) -> dict[str, int]:
    cols = doc.get("counts") or {}
    for n in names:
        for k, v in cols.items():
            if k.lower() == n.lower():
                return v
    return {}


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = NormalisedRows()

    def fig(metric: str, value: Any, scope: str = "national", note: str | None = None, url: str | None = None,
            as_of: datetime | None = None) -> None:
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            out.figure(publisher=PUBLISHER, metric=metric, value=value, scope=scope, as_of=as_of or fetched_at,
                       url=url or REPO_URL, note=note, source_id=SOURCE_ID, fetched_at=fetched_at)

    for p in parts(raw):
        name = file_of(p.url)
        if not p.ok:
            out.notes.append(f"{name or p.url}: {p.error or p.status}")
            continue
        doc = p.json()
        if "api.github.com" in (p.url or "") and isinstance(doc, list):
            files = [f.get("name") for f in doc if isinstance(f, dict) and f.get("type") == "file"]
            fig("repo_files", len(files), note="GitHub contents listing", url=REPO_URL)
            missing = [f for f in FILE_METRICS if f not in files]
            if missing:
                out.notes.append("listing lacks: " + ", ".join(missing))
            continue
        if name.endswith(".csv"):
            if not isinstance(doc, dict):
                doc = project_csv(p.url, p.body)          # a raw CSV reached us (local-only / tests)
            metric = FILE_METRICS.get(name)
            if metric is None:
                continue
            fig(metric, doc.get("rows"), note=f"{name} data rows", url=p.url)
            for val, n in _column(doc, "status").items():
                fig(metric, n, scope=f"status:{slugify(val)}", note=val, url=p.url)
            for val, n in _column(doc, "nationality", "country").items():
                fig(metric, n, scope=f"nationality:{slugify(val)}", note=val, url=p.url)
            for val, n in _column(doc, "अवस्था").items():
                fig(metric, n, scope=f"status:{slugify(val)}", note=val, url=p.url)
            if name == "ndrrma-rescue.csv":
                for loc, n in _column(doc, "location").items():
                    pid = ctx.resolve(loc) if ctx else None
                    out.hint(loc, pid, n, kind="bulletin_location")
                    fig("rescued", n, scope=f"place:{pid or slugify(loc)}", note=f"bulletin: {loc}", url=p.url)
            continue
        if name == "dhm-rivers.json" and isinstance(doc, dict):
            updated = parse_dt(doc.get("updated_at"))
            for st in doc.get("stations") or []:
                if not isinstance(st, dict) or not st.get("name"):
                    continue
                observed = parse_dt(st.get("observed_at")) or updated
                fig("water_level_m", st.get("level_m"), scope=f"station:{slugify(st['name'])}", as_of=observed,
                    note=f"DHM station {st.get('station_id')} via the bulletin; status={st.get('status')}", url=p.url)
            continue
    return out
