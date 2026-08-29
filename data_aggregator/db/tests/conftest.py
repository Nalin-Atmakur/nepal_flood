"""Shared fixtures for live database tests (see docs/05-rls.md).

Two clients against the real project:
  anon    – what the website holds (NEXT_PUBLIC_SUPABASE_ANON_KEY from web/.env.local)
  service – what the pipeline holds (SUPABASE_SERVICE_ROLE_KEY from pipeline/.env)
Tests are skipped when either key is missing.
"""
from __future__ import annotations
import os
import socket
from pathlib import Path
import pytest

# This network resolves AAAA records for *.supabase.co to DNS64 addresses that never connect;
# Python prefers IPv6 and hangs. Force IPv4 for the test session (docs/07-applying-migrations.md, note).
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_only(*args, **kwargs):
    return [r for r in _orig_getaddrinfo(*args, **kwargs) if r[0] == socket.AF_INET] or _orig_getaddrinfo(*args, **kwargs)
socket.getaddrinfo = _ipv4_only

ROOT = Path(__file__).resolve().parents[2]


def _env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if path.exists():
        for line in path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip()
    return out


@pytest.fixture(scope="session")
def keys():
    pipe, web = _env(ROOT / "pipeline" / ".env"), _env(ROOT / "web" / ".env.local")
    url = pipe.get("SUPABASE_URL") or web.get("NEXT_PUBLIC_SUPABASE_URL")
    anon = web.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    service = pipe.get("SUPABASE_SERVICE_ROLE_KEY")
    if not (url and anon and service):
        pytest.skip("Supabase keys not configured")
    return {"url": url, "anon": anon, "service": service}


@pytest.fixture(scope="session")
def anon(keys):
    from supabase import create_client
    return create_client(keys["url"], keys["anon"])


@pytest.fixture(scope="session")
def service(keys):
    from supabase import create_client
    return create_client(keys["url"], keys["service"])
