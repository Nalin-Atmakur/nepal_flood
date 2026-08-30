#!/usr/bin/env bash
# run.sh — one pipeline tick: pull external data, then process. See README.md step 4 (cron).
# Exit code: non-zero only when a script itself crashes (per-source / per-step failures are logged, exit 0).
set -u
cd "$(dirname "$0")"
PY=".venv/bin/python"
[ -x "$PY" ] || PY="python3"
echo "== $(date -u +%FT%TZ) pull_external_data $*"
"$PY" pull_external_data.py "$@"
rc1=$?
echo "== $(date -u +%FT%TZ) process_data"
"$PY" process_data.py
rc2=$?
echo "== $(date -u +%FT%TZ) done pull=$rc1 process=$rc2"
[ "$rc1" -eq 0 ] && [ "$rc2" -eq 0 ]
