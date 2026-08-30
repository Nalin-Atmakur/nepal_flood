"""pytest wiring: import the pipeline package from the repo, isolate _state.json, provide fakes."""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from lib import places as _places  # noqa: E402
from lib.state import State  # noqa: E402
from normalisers import Context, load_fixture  # noqa: E402

NOW = datetime(2026, 8, 29, 23, 30, tzinfo=timezone.utc)


class FakeFetched:
    def __init__(self, body: bytes = b"", ok: bool = True, status: int = 200):
        self.body, self.ok, self.status = body, ok, status
        self.error = None if ok else "http 404"
        self.last_modified = None

    @property
    def text(self) -> str:
        return self.body.decode("utf-8", errors="replace")


def fake_fetch(url: str) -> FakeFetched:
    if "1864" in url:
        return FakeFetched(load_fixture("mofa_flashflood_1864.html"))
    if "1866" in url:
        return FakeFetched(load_fixture("mofa_flashflood_1866.html"))
    return FakeFetched(b"", ok=False, status=404)


@pytest.fixture
def gaz() -> _places.Gazetteer:
    return _places.Gazetteer.builtin()


@pytest.fixture
def state(tmp_path: Path) -> State:
    return State(tmp_path / "_state.json")


@pytest.fixture
def ctx(gaz, state) -> Context:
    uploads: dict[str, bytes] = {}

    def upload(path: str, body: bytes, ct: str) -> str:
        uploads[path] = body
        return "raw/" + path
    c = Context(source_id="test", fetch=fake_fetch, upload=upload, state=state, gazetteer=gaz, dry_run=False)
    c.uploads = uploads  # type: ignore[attr-defined]
    return c


@pytest.fixture
def now() -> datetime:
    return NOW
