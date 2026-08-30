"""The loop's wait is measured on the wall clock, so sleeping the machine cannot push the next tick back."""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("scheduler", Path(__file__).resolve().parents[1] / "scheduler.py")
scheduler = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(scheduler)


def test_due_in_counts_down_on_the_wall_clock():
    deadline = 1_000_000.0
    assert scheduler.due_in(deadline, 1_000_000.0 - 600) == 600
    assert scheduler.due_in(deadline, deadline) == 0.0


def test_a_late_wake_up_fires_immediately_rather_than_waiting_again():
    # the machine slept for three hours past the deadline: the next tick is due now, not in three hours
    deadline = 1_000_000.0
    assert scheduler.due_in(deadline, deadline + 3 * 3600) == 0.0


def test_the_deadline_is_the_tick_start_plus_the_interval():
    started, interval = 1_700_000_000.0, 4 * 3600
    deadline = started + interval
    # a tick that itself took ten minutes still leaves the cadence on its mark
    assert scheduler.due_in(deadline, started + 600) == interval - 600
