"""Ledger arithmetic: confirmed can exceed expected (hospital lists); the ledger raises expected and never goes negative (Q1 audit)."""
from __future__ import annotations

from processing.ledger import reconcile_counts, unknown_count


def test_reconcile_raises_expected_to_confirmed():
    assert reconcile_counts(5, 8) == (8, 0)
    assert reconcile_counts(10, 3) == (10, 7)
    assert reconcile_counts(0, 0) == (0, 0)
    assert unknown_count(3, 9) == 0
