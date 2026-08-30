# docs/reports — the morning trends report

One Markdown file per day, `YYYY-MM-DD-morning.md`, written by `scripts/morning_report.py` from the live DERIVED
tables (never from ARCHIVE or RAW). It is what the owner and the volunteer team read first each morning: where every
publisher stands and how it moved, where the unknowns are, the rescuers' help-request hotspot list, rescue throughput
by day, infrastructure, data quality, and what changed since the previous report.

```
  figures_latest ─┐                                   ┌─ 1. headline numbers (24 h / 48 h per publisher)
  figure_series  ─┤                                   ├─ 2. where the unknowns are (+ now-lines)
  v_place_status_latest · place_status ─┤  morning_report.py  ├─ 3. help requests by place
  v_sources_status · findings · entities ─┤    (pure render,    ├─ 4. rescue throughput by day
  articles · v_gauges_latest · v_live_counts ─┘  tested helpers)  ├─ 5. infrastructure
                                                                  ├─ 6. data quality
                                                                  └─ 7. diff vs the previous file
```

## Run

1. After the day's first pipeline tick (so the ledger and series carry today's values): `make report`
   (= `pipeline/.venv/bin/python scripts/morning_report.py`; `--stdout` prints, `--date YYYY-MM-DD` backdates).
2. Read it in a terminal or on GitHub; commit it — the file is derived, PII-free content (counts, publisher names,
   headline titles; phone-like digit runs are masked), so it belongs in the repo as the day's record.
3. The next morning's file diffs itself against the previous one using the `<!-- report-data … -->` block at the end
   of each file; do not delete that block.

Cadence: once per morning; extra runs during the day are fine (same filename is overwritten).
Tests for the formatting helpers: `pipeline/.venv/bin/python -m pytest pipeline/tests/test_morning_report.py`.
