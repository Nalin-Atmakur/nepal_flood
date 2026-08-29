#!/usr/bin/env python3
"""
60-second health check for the live system (docs/runbook.md → "Is it healthy?").

Prints, using the Management API (no DB password):
  1. live counters            v_live_counts
  2. headline figures         figures_latest for the five publishers
  3. corridor gauges          v_gauges_latest alive/dead
  4. source freshness         v_sources_status: stale / failing sources
  5. pipeline state           last pull, last process, rows per table
Exit code 1 if the last successful pull is older than 2 × PULL_INTERVAL_MINUTES.
"""
from __future__ import annotations
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "db"))
import mgmt  # noqa: E402

PULL_INTERVAL_MINUTES = 240  # keep in sync with pipeline/lib/config.py and web/lib/config.ts


def age_min(ts: str | None) -> float | None:
    if not ts:
        return None
    t = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - t).total_seconds() / 60


def main() -> int:
    live = mgmt.query("select * from v_live_counts")[0]
    print("1. live counters  ", {k: live[k] for k in ("submissions_10m", "submissions_today", "submissions_total")},
          "| last pull", live["last_pull_at"], "| last processed", live["last_processed_at"])

    figs = mgmt.query("select publisher, metric, value, as_of from figures_latest where scope='national' "
                      "and metric in ('dead','missing','out_of_contact','rescued','lost_open') order by publisher, metric")
    print("2. headline figures")
    for f in figs:
        print(f"     {f['publisher']:<18} {f['metric']:<16} {f['value']:>10}   as of {f['as_of']}")

    gauges = mgmt.query("select station_name, level, alive, observed_at from v_gauges_latest "
                        "where station_name ~* 'rasuwagad|syaphru|shyaprubesi|betrawati|dhunche|galchi|kali khola|devghat' order by station_name")
    print("3. corridor gauges")
    for g in gauges:
        print(f"     {'ALIVE' if g['alive'] else 'dead ':<5} {g['station_name']:<40} {g['level']!s:>8}  {g['observed_at']}")

    srcs = mgmt.query("select id, last_fetched_at, last_ok, last_error from v_sources_status order by id")
    stale = [s for s in srcs if s["last_fetched_at"] is None or (age_min(s["last_fetched_at"]) or 0) > 2 * PULL_INTERVAL_MINUTES]
    failing = [s for s in srcs if s["last_ok"] is False]
    print(f"4. sources: {len(srcs)} registered · {len(stale)} never/stale · {len(failing)} failing on last pull")
    for s in failing[:10]:
        print(f"     ! {s['id']}: {str(s['last_error'])[:80]}")

    counts = mgmt.query("select 'raw_pulls' t, count(*) n from raw_pulls union all select 'figures', count(*) from figures "
                        "union all select 'gauges', count(*) from gauges union all select 'articles', count(*) from articles "
                        "union all select 'reports_archive', count(*) from reports_archive union all select 'reports_anon', count(*) from reports_anon "
                        "union all select 'place_status', count(*) from place_status union all select 'stats', count(*) from stats "
                        "union all select 'entities', count(*) from entities union all select 'findings', count(*) from findings")
    print("5. rows:", ", ".join(f"{c['t']}={c['n']}" for c in counts))

    a = age_min(live["last_pull_at"])
    if a is None or a > 2 * PULL_INTERVAL_MINUTES:
        print(f"\nUNHEALTHY: last successful pull {a and round(a)} min ago (threshold {2 * PULL_INTERVAL_MINUTES})")
        return 1
    print("\nOK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
