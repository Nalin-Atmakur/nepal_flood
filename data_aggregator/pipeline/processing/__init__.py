"""
processing — one module per process_data step. See processing/README.md and docs/process_data/.

    ⓪ anonymise.py        archive-only family intake (default) + OPMCM projection
    ① resolve_places.py   articles.places; dormant family projection when explicitly enabled
    ② dedup.py            keys → entities / entity_events / dedup_queue
    ③ ledger.py           place_status + place_timeline
    ④ figures_latest.py   latest per publisher × metric × scope
    ⑤ stats.py            public-source striking numbers + live counters
    ⑥ findings.py         data-quality findings for list-holders

Every module exposes `run(ctx: ProcCtx) -> dict` (a small summary) and never raises for data
problems — a failing step logs and returns {"error": …} so the next step still runs.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class ProcCtx:
    db: Any                    # lib.db.Db
    gaz: Any                   # lib.places.Gazetteer
    llm: Any                   # lib.llm.LLM
    state: Any                 # lib.state.State
    family_report_processing_enabled: bool = False
    dry_run: bool = False
    now: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    cache: dict[str, Any] = field(default_factory=dict)   # cross-step memo (e.g. latest OPMCM projection)
