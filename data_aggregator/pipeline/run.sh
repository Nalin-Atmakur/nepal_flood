#!/usr/bin/env bash
# run.sh — one pipeline tick: pull external data, then process. See README.md step 4 (schedule).
# Exit code: non-zero only when a script itself crashes (per-source / per-step failures are logged, exit 0).
# A tick that finds another tick still running (lock dir younger than 3 h) exits 0 without doing anything —
# overlapping runs are harmless (upserts) but waste OpenAI calls and triple the log.
set -u
cd "$(dirname "$0")"
PY=".venv/bin/python"
[ -x "$PY" ] || PY="python3"
LOCK=".run.lock"
if [ -d "$LOCK" ]; then
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin -180 2>/dev/null)" ]; then
    echo "== $(date -u +%FT%TZ) skipped: another tick is running (rm -r pipeline/$LOCK to force)"; exit 0
  fi
  rm -rf "$LOCK"   # stale lock (> 3 h): a crashed tick
fi
mkdir "$LOCK" || exit 0
trap 'rm -rf "$LOCK"' EXIT
echo "== $(date -u +%FT%TZ) pull_external_data $*"
"$PY" pull_external_data.py "$@"
rc1=$?
echo "== $(date -u +%FT%TZ) process_data"
"$PY" process_data.py
rc2=$?
echo "== $(date -u +%FT%TZ) done pull=$rc1 process=$rc2"
[ "$rc1" -eq 0 ] && [ "$rc2" -eq 0 ]
