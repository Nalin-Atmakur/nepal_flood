"""
lib/net.py — force IPv4 for every socket in this process.
See docs/pull_external_data/03-fetching.md (step 0) and 07-failure-modes.md ("hangs on connect").

On this laptop `*.supabase.co` (and some other hosts) resolve AAAA records to DNS64 addresses
(64:ff9b::…) that never connect. Python prefers IPv6, so requests/httpx/supabase-py hang in
socket.connect until the timeout. Wrapping `socket.getaddrinfo` to return only AF_INET results
(falling back to the original list when there are none) fixes every HTTP library at once.
Called once at import by lib/http.py and lib/db.py; idempotent.
"""
from __future__ import annotations

import socket

_orig_getaddrinfo = socket.getaddrinfo
_patched = False


def _ipv4_only(*args, **kwargs):
    res = _orig_getaddrinfo(*args, **kwargs)
    return [r for r in res if r[0] == socket.AF_INET] or res


def force_ipv4() -> None:
    global _patched
    if _patched:
        return
    socket.getaddrinfo = _ipv4_only  # type: ignore[assignment]
    _patched = True


def is_forced() -> bool:
    return _patched
