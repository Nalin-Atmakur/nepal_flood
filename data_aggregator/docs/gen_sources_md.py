#!/usr/bin/env python3
"""
Render ../sources.yaml into docs/sources.md — one table per source family.

Run (see CONTRIBUTING.md, "Add a source", step 6):

    pipeline/.venv/bin/python docs/gen_sources_md.py

Group and reliability come from db/seed/gen_sources.py so this page matches
what is seeded into the `sources` table.  Do not edit sources.md by hand.
"""
from __future__ import annotations

import sys
from collections import OrderedDict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "sources.yaml"
OUT = Path(__file__).resolve().parent / "sources.md"

sys.path.insert(0, str(ROOT / "db" / "seed"))
from gen_sources import group_for, reliability_for  # noqa: E402

FAMILY_ORDER = ["json_api", "post_api", "rss", "html", "pdf", "s3", "gcs", "stac", "fdsn", "mediawiki"]
FAMILY_LABEL = {
    "json_api": "JSON APIs",
    "post_api": "POST APIs",
    "rss": "RSS feeds",
    "html": "HTML pages",
    "pdf": "PDF / spreadsheet documents",
    "s3": "S3 buckets and raw file hosts",
    "gcs": "Google Cloud Storage buckets",
    "stac": "STAC catalogues",
    "fdsn": "FDSN seismic services",
    "mediawiki": "MediaWiki APIs",
}


def cell(v) -> str:
    """Escape a value for a GFM table cell."""
    if v is None:
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    s = str(v).replace("\n", " ").strip()
    return s.replace("|", "\\|")


def url_cell(u) -> str:
    if u is None:
        return ""
    urls = u if isinstance(u, list) else [u]
    return "<br>".join(f"`{cell(x)}`" for x in urls)


def main() -> int:
    try:
        import yaml  # type: ignore
    except ImportError:
        sys.exit("pyyaml missing: pipeline/.venv/bin/pip install pyyaml")
    doc = yaml.safe_load(SRC.read_text())
    sources = doc["sources"]

    by_family: "OrderedDict[str, list]" = OrderedDict((f, []) for f in FAMILY_ORDER)
    for s in sources:
        by_family.setdefault(s["family"], []).append(s)

    n_pii = sum(1 for s in sources if s.get("pii") in (True, "mixed", "true"))
    groups: dict[str, int] = {}
    for s in sources:
        g = group_for(s["id"])
        groups[g] = groups.get(g, 0) + 1

    lines: list[str] = []
    w = lines.append
    w("# Sources")
    w("")
    w(f"*Generated from `sources.yaml` (registry version {doc.get('version')}) by `docs/gen_sources_md.py` "
      f"on {date.today().isoformat()}. Do not edit by hand — edit `sources.yaml` and re-run.*")
    w("")
    w(f"{len(sources)} sources. {n_pii} carry personal data (`pii` true or mixed) and are processed "
      "in memory to counts and place distributions; their rows are never written to RAW or DERIVED tables. "
      "This site is volunteer-run and not an official source; every figure on it links back to the row below it came from.")
    w("")
    w("## By group")
    w("")
    w("| Group | Count | Default reliability |")
    w("|---|---|---|")
    for g in ["government", "humanitarian", "geospatial", "signals", "news", "community"]:
        if g in groups:
            w(f"| {g} | {groups[g]} | {reliability_for('', g)} |")
    w("")
    w("Reliability grades: A official / machine-readable · B official or wire, hand-checked · "
      "C credible, unverified · D raw or duplicated. Per-source overrides live in `db/seed/gen_sources.py`.")
    w("")
    w("## Columns")
    w("")
    w("| Column | Meaning |")
    w("|---|---|")
    w("| id | stable slug; also the normaliser filename `pipeline/normalisers/<id>.py` and the `sources.id` row |")
    w("| group / grade | as seeded into `sources.grp` / `sources.reliability` |")
    w("| url | endpoint or page; `{…}` marks a templated part; lists are polled in turn |")
    w("| cadence | poll interval the scheduler honours (`pipeline/docs/pull_external_data/02-scheduling.md`) |")
    w("| pii | registry value verbatim: `true`, `false`, `mixed`, or a note |")
    w("| holds | what the source contains, one line |")
    w("| catalogue | row in `../aryaa_research_general/11-data-catalogue-2026-08-29.md` |")
    w("| verified | 2026-08-29 fetch status: C confirmed · R reported · U unconfirmed |")
    w("")

    for fam, items in by_family.items():
        if not items:
            continue
        w(f"## {FAMILY_LABEL.get(fam, fam)} (`{fam}`) — {len(items)}")
        w("")
        w("| id | group / grade | url | cadence | pii | holds | catalogue | verified |")
        w("|---|---|---|---|---|---|---|---|")
        for s in items:
            g = group_for(s["id"])
            grade = s.get("reliability") or reliability_for(s["id"], g)
            w("| " + " | ".join([
                f"`{cell(s['id'])}`",
                f"{g} / {grade}",
                url_cell(s.get("url")),
                cell(s.get("cadence")),
                cell(s.get("pii")),
                cell(s.get("holds")),
                cell(s.get("catalogue")),
                cell(s.get("verified")),
            ]) + " |")
        w("")

    w("## Held data (not pollable)")
    w("")
    w("Listed in `sources.yaml` as a trailing comment and in the catalogue §I: DHM observation API key; "
      "NDRRMA/NTA consolidated tower-restoration table; Army daily sortie log; helicopter operators' GPS logs; "
      "NEA feeder restoration log; ICIMOD/MWR lake level series; NTB/TAAN agency manifests; Garmin/Zoleo aggregate "
      "device counts; NTC/Ncell last-attach aggregates per tower. Request through the government channel; "
      "when one arrives, add it to `sources.yaml` and re-run this script.")
    w("")

    OUT.write_text("\n".join(lines))
    print(f"wrote {OUT} ({len(sources)} sources, {sum(1 for v in by_family.values() if v)} families)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
