#!/usr/bin/env python3
"""
scheduler.py — the pipeline on a plain serial loop, run explicitly in a terminal.

    cd data_aggregator/pipeline
    .venv/bin/python scheduler.py                 # every 4 hours, forever (Ctrl-C to stop)
    .venv/bin/python scheduler.py --hours 0.5     # every 30 minutes
    .venv/bin/python scheduler.py --once          # one tick, then exit
    .venv/bin/python scheduler.py --skip-first    # wait first, run later

One tick = `pull_external_data.py` then `process_data.py` (the same two steps as run.sh), each as a subprocess with
this interpreter, output streamed to the terminal and appended to run.log. A tick that fails (non-zero exit) is
logged and the loop carries on.

**The wait is measured on the wall clock, not `time.monotonic()`.** macOS stops the monotonic clock while the
machine is asleep, so a lid closed for two hours pushed the next tick two hours later than the time the log had
promised — the loop looked stuck (owner, 30 Aug). The deadline is now an absolute timestamp: if the machine wakes
up past it, the next tick starts immediately, and the log says the wait overran.

Nothing is installed anywhere: no launchd, no cron, no background process. Keep the terminal open (or run it
inside `tmux`/`screen`). `make schedule` wraps this in `caffeinate -i` on macOS so an idle machine does not sleep
underneath it; on a closed lid nothing runs at all until the machine wakes.
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


def due_in(deadline: float, now_wall: float) -> float:
    """Seconds still to wait, on the wall clock; never negative, so a late wake-up fires at once."""
    return max(0.0, deadline - now_wall)


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
        started = time.time()
        ok = tick(args.pull_args)
        log(f"tick {'ok' if ok else 'FAILED (see above)'}")
        if args.once:
            return 0 if ok else 1
        # the interval is measured from the start of the tick, so a 4-hour cadence keeps its marks even when a
        # tick takes ten minutes; the deadline is absolute so sleeping the machine cannot push it back
        deadline = started + interval
        wait = due_in(deadline, time.time())
        nxt = dt.datetime.fromtimestamp(deadline, dt.timezone.utc)
        log(f"sleeping {wait / 60:.0f} min — next tick {nxt:%H:%M} UTC / {nxt.astimezone():%H:%M} local (Ctrl-C to stop)")
        while not stop["now"]:
            left = due_in(deadline, time.time())
            if left <= 0:
                break
            time.sleep(min(30.0, left))
        late = time.time() - deadline
        if late > 120:
            log(f"wait overran by {late / 60:.0f} min (the machine was probably asleep) — ticking now")
    log("scheduler stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
