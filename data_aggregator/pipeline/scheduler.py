#!/usr/bin/env python3
"""
scheduler.py — the pipeline on a plain serial loop, run explicitly in a terminal.

    cd data_aggregator/pipeline
    .venv/bin/python scheduler.py                 # every 4 hours, forever (Ctrl-C to stop)
    .venv/bin/python scheduler.py --hours 0.5     # every 30 minutes
    .venv/bin/python scheduler.py --once          # one tick, then exit
    .venv/bin/python scheduler.py --skip-first    # wait first, run later

One tick = `pull_external_data.py` then `process_data.py` (the same two steps as run.sh), each as a subprocess with
this interpreter, output streamed to the terminal and appended to run.log. Between ticks the loop simply sleeps
(`time.sleep`) for the interval measured from the *start* of the tick, so a 4-hour cadence stays on the hour marks
even when a tick takes ten minutes. A tick that fails (non-zero exit) is logged and the loop carries on.

Nothing is installed anywhere: no launchd, no cron, no background process. Keep the terminal open (or run it
inside `tmux`/`screen`); the machine must stay awake (`caffeinate -i` in another terminal).
See docs/runbook.md §1.
"""
from __future__ import annotations

import argparse
import datetime as dt
import signal
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOG = HERE / "run.log"
STEPS = ["pull_external_data.py", "process_data.py"]


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(line: str) -> None:
    msg = f"== {now()} {line}"
    print(msg, flush=True)
    with LOG.open("a") as f:
        f.write(msg + "\n")


def run_step(script: str, extra: list[str]) -> int:
    """Run one script with this interpreter, streaming its output to the terminal and run.log."""
    cmd = [sys.executable, str(HERE / script), *extra]
    log(f"start {script} {' '.join(extra)}".rstrip())
    with LOG.open("a") as f:
        proc = subprocess.Popen(cmd, cwd=HERE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        assert proc.stdout is not None
        for line in proc.stdout:
            sys.stdout.write(line)
            f.write(line)
        rc = proc.wait()
    log(f"done {script} exit={rc}")
    return rc


def tick(pull_args: list[str]) -> bool:
    ok = True
    for script in STEPS:
        rc = run_step(script, pull_args if script == STEPS[0] else [])
        ok = ok and rc == 0
    return ok


def main() -> int:
    ap = argparse.ArgumentParser(description="Run the pipeline every N hours in a serial loop (Ctrl-C to stop).")
    ap.add_argument("--hours", type=float, default=4.0, help="interval between tick starts (default 4)")
    ap.add_argument("--once", action="store_true", help="run one tick and exit")
    ap.add_argument("--skip-first", action="store_true", help="sleep one interval before the first tick")
    ap.add_argument("pull_args", nargs="*", help="extra arguments passed to pull_external_data.py (e.g. --force)")
    args = ap.parse_args()
    interval = max(60.0, args.hours * 3600.0)

    stop = {"now": False}

    def on_signal(_sig, _frame):  # noqa: ANN001
        stop["now"] = True
        log("stop requested — finishing the current step, then exiting")

    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGTERM, on_signal)

    log(f"scheduler start interval={args.hours}h once={args.once} python={sys.executable}")
    if args.skip_first and not args.once:
        time.sleep(interval)
    while not stop["now"]:
        started = time.monotonic()
        ok = tick(args.pull_args)
        log(f"tick {'ok' if ok else 'FAILED (see above)'}")
        if args.once:
            return 0 if ok else 1
        wait = max(0.0, interval - (time.monotonic() - started))
        nxt = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=wait)).strftime("%H:%M UTC")
        log(f"sleeping {wait / 60:.0f} min — next tick ≈ {nxt} (Ctrl-C to stop)")
        # sleep in small slices so Ctrl-C is honoured promptly
        end = time.monotonic() + wait
        while not stop["now"] and time.monotonic() < end:
            time.sleep(min(30.0, end - time.monotonic()))
    log("scheduler stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
