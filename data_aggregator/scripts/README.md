# scripts/ — operator conveniences

| Script | What |
|---|---|
| `health.py` | 60-second health check: archive-only flag/projection tripwire plus public counters, figures, gauges, source freshness and row counts. Exit 1 on boundary drift or a pull older than 2 × `PULL_INTERVAL_MINUTES`. |
| `install_schedule.sh [minutes|--status|--remove]` | Installs (default 240 min; `15` for the live phase) two schedulers for `pipeline/run.sh`: a detached loop (`pipeline/.scheduler.pid`) that works immediately, and a launchd agent that takes over once `/bin/bash` has Full Disk Access (macOS TCC blocks it until then). Starts `caffeinate -s -i` unless one is running. `--status` shows both and the last run headers; `--remove` uninstalls both. |

Numbered steps and the reasoning live in [`../docs/runbook.md`](../docs/runbook.md). The `Makefile` at the folder root wraps everything (`make help`).
