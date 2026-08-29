"""
Supabase Management API helper used by apply.py and tests.

Token resolution order (see docs/07-applying-migrations.md, step 2):
  1. SUPABASE_ACCESS_TOKEN env var (a personal access token, `sbp_…`)
  2. the Supabase CLI's keychain entry on macOS (service "Supabase CLI", account "supabase"),
     stored go-keyring style as "go-keyring-base64:<base64>"
Project ref comes from SUPABASE_PROJECT_REF or pipeline/.env.
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

API = "https://api.supabase.com/v1"
ROOT = Path(__file__).resolve().parent.parent


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


def project_ref() -> str:
    _load_env_file(ROOT / "pipeline" / ".env")
    ref = os.environ.get("SUPABASE_PROJECT_REF")
    if not ref:
        sys.exit("SUPABASE_PROJECT_REF not set (pipeline/.env)")
    return ref


def access_token() -> str:
    tok = os.environ.get("SUPABASE_ACCESS_TOKEN")
    if tok:
        return tok
    try:
        raw = subprocess.check_output(
            ["security", "find-generic-password", "-s", "Supabase CLI", "-a", "supabase", "-w"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        sys.exit("No SUPABASE_ACCESS_TOKEN and no Supabase CLI keychain token; run `supabase login`.")
    if raw.startswith("go-keyring-base64:"):
        payload = raw.split(":", 1)[1]
        payload += "=" * (-len(payload) % 4)
        raw = base64.b64decode(payload).decode()
    return raw


def request(method: str, path: str, body: dict | None = None) -> tuple[int, object]:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{API}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {access_token()}", "Content-Type": "application/json",
                 "User-Agent": "nepalfloodtracker-db/1.0 (+https://nepalfloodtracker.com)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            txt = r.read().decode()
            return r.status, (json.loads(txt) if txt else None)
    except urllib.error.HTTPError as e:
        txt = e.read().decode()
        try:
            return e.code, json.loads(txt)
        except Exception:
            return e.code, txt


def query(sql: str) -> object:
    """Run SQL against the project via the Management API (no DB password needed)."""
    status, body = request("POST", f"/projects/{project_ref()}/database/query", {"query": sql})
    if status >= 300:
        raise RuntimeError(f"query failed ({status}): {body}")
    return body


def set_anonymous_signins(enabled: bool = True) -> dict:
    status, body = request("PATCH", f"/projects/{project_ref()}/config/auth",
                           {"external_anonymous_users_enabled": enabled})
    if status >= 300:
        raise RuntimeError(f"auth config failed ({status}): {body}")
    return body
