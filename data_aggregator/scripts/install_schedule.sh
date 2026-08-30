#!/usr/bin/env bash
# NOT USED since 30 Aug 08:50 BST (owner: "run it explicitly") — the schedule is pipeline/scheduler.py, a plain serial
# loop started in a terminal. Kept for reference only; `--remove` still cleans up anything this installed.
# Install the pipeline schedule on this Mac (docs/runbook.md → "Schedule").
#
#   scripts/install_schedule.sh [minutes]        # default 240 (tonight's cadence); 15 for the live phase
#   scripts/install_schedule.sh --remove         # uninstall everything
#   scripts/install_schedule.sh --status         # show what is running
#
# Two mechanisms, because macOS TCC blocks a launchd-spawned /bin/bash from reading a repo under
# ~/Desktop until Full Disk Access is granted (launchd then reports "last exit code = 78: EX_CONFIG"):
#   1. a detached loop process started from a terminal (inherits the terminal's Desktop access) — works now;
#   2. a launchd agent — takes over automatically once /bin/bash has Full Disk Access
#      (System Settings → Privacy & Security → Full Disk Access → add /bin/bash), surviving logout.
# Both call pipeline/run.sh; pull_external_data is idempotent so an overlap is harmless.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.nepalfloodtracker.pipeline"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
PIDFILE="$HERE/pipeline/.scheduler.pid"
MINUTES="${1:-240}"

status() {
  echo "loop:    $( [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null && echo "running pid $(cat "$PIDFILE")" || echo "not running")"
  echo "launchd: $(launchctl print "gui/$(id -u)/$LABEL" 2>/dev/null | grep -E 'last exit code|state' | tr -s '\t ' ' ' | tr '\n' ';' || echo 'not loaded')"
  echo "last runs:"; { grep -E '^== .*pull_external_data' "$HERE/pipeline/run.log" 2>/dev/null || true; } | tail -3 | sed 's/^/  /'
}

if [[ "$MINUTES" == "--status" ]]; then status; exit 0; fi
if [[ "$MINUTES" == "--remove" ]]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true; rm -f "$PLIST"
  [ -f "$PIDFILE" ] && kill "$(cat "$PIDFILE")" 2>/dev/null; rm -f "$PIDFILE"
  pkill -f "caffeinate -s -i" 2>/dev/null || true
  echo "removed $LABEL and the loop"; exit 0
fi

# 1. detached loop (works without Full Disk Access)
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then kill "$(cat "$PIDFILE")"; fi
( nohup bash -c "cd '$HERE/pipeline' && while :; do bash run.sh >> run.log 2>&1; sleep $((MINUTES * 60)); done" >/dev/null 2>&1 & echo $! > "$PIDFILE" )   # macOS has no setsid; a subshell-detached nohup survives the caller
echo "loop started (pid $(cat "$PIDFILE")): every $MINUTES min → pipeline/run.sh (log: pipeline/run.log)"

# 2. launchd agent (takes over once /bin/bash has Full Disk Access)
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$HERE/pipeline/run.sh</string></array>
  <key>WorkingDirectory</key><string>$HERE/pipeline</string>
  <key>StartInterval</key><integer>$((MINUTES * 60))</integer>
  <key>StandardOutPath</key><string>$HERE/pipeline/run.log</string>
  <key>StandardErrorPath</key><string>$HERE/pipeline/run.log</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string></dict>
</dict></plist>
PL
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || true
pgrep -x caffeinate >/dev/null || (nohup caffeinate -s -i >/dev/null 2>&1 &)   # skip if any caffeinate is already running
status
