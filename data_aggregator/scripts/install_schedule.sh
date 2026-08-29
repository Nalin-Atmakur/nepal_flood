#!/usr/bin/env bash
# Install the pipeline schedule on this Mac (docs/runbook.md → "Schedule").
#
#   scripts/install_schedule.sh            # every 4 hours (tonight's cadence)
#   scripts/install_schedule.sh 15         # every 15 minutes (live phase)
#   scripts/install_schedule.sh --remove   # uninstall
#
# Uses launchd (survives logout, runs missed jobs on wake) rather than cron, and keeps the
# machine from sleeping with a detached `caffeinate -s` (effective while on mains power).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.nepalfloodtracker.pipeline"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
MINUTES="${1:-240}"

if [[ "$MINUTES" == "--remove" ]]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  pkill -f "caffeinate -s -i" 2>/dev/null || true
  echo "removed $LABEL"; exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$HERE/pipeline/run.sh</string></array>
  <key>WorkingDirectory</key><string>$HERE/pipeline</string>
  <key>StartInterval</key><integer>$((MINUTES * 60))</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$HERE/pipeline/run.log</string>
  <key>StandardErrorPath</key><string>$HERE/pipeline/run.log</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string></dict>
</dict></plist>
PL
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
pgrep -x caffeinate >/dev/null || (nohup caffeinate -s -i >/dev/null 2>&1 &)   # skip if any caffeinate is already running
echo "installed $LABEL: every $MINUTES min → $HERE/pipeline/run.sh (log: pipeline/run.log); caffeinate running"
launchctl print "gui/$(id -u)/$LABEL" | grep -E 'state|interval' | head -3
