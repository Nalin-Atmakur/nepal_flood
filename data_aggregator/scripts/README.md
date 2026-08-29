# scripts/ — operator conveniences

| Script | What |
|---|---|
| `health.py` | 60-second health check of the live system (live counters, headline figures, gauges, stale/failing sources, row counts). Exit 1 if the last pull is older than 2 × `PULL_INTERVAL_MINUTES`. |
| `install_schedule.sh [minutes|--remove]` | Installs/removes the launchd agent that runs `pipeline/run.sh` every N minutes (default 240) and keeps the Mac awake with `caffeinate`. |

Numbered steps and the reasoning live in [`../docs/runbook.md`](../docs/runbook.md). The `Makefile` at the folder root wraps everything (`make help`).
