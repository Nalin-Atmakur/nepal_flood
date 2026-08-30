"""
normalisers/nesra_bridges.py — NESRA `bridges_to_inspect.geojson` on its own cadence → same rows as nesra_bucket.
docs/pull_external_data/05c-sources-wave3.md §nesra_bridges.
The file is also part 2 of nesra_bucket's envelope; this id exists so the bridge layer can be refreshed
independently. The parsing lives in nesra_bucket (`_bridges`): this module only delegates and stamps its own
source_id, so there is one implementation of the bridge → place resolution.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from . import Context, NormalisedRows
from . import nesra_bucket as _nb

SOURCE_ID = "nesra_bridges"
PUBLISHER = _nb.PUBLISHER


def normalise(raw: bytes, fetched_at: datetime, source: dict[str, Any], ctx: Context | None = None) -> NormalisedRows:
    out = _nb.normalise(raw, fetched_at, source, ctx)
    for f in out.figures:
        f["source_id"] = SOURCE_ID
    return out
