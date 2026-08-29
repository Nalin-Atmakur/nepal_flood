#!/usr/bin/env python3
"""
Apply db/migrations/*.sql and db/seed/*.sql to the Supabase project, in filename order,
through the Management API query endpoint. Idempotent: applied files are recorded in
`_migrations` with a checksum; a changed file is refused unless --force.

Usage (see docs/07-applying-migrations.md):
  python db/apply.py                 # migrations then seeds
  python db/apply.py --only seed     # seeds only
  python db/apply.py --dry-run       # print what would run
  python db/apply.py --force         # re-run files whose checksum changed
"""
from __future__ import annotations

import argparse
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mgmt  # noqa: E402

HERE = Path(__file__).resolve().parent


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()[:16]


def applied() -> dict[str, str]:
    try:
        rows = mgmt.query("select filename, checksum from _migrations")
    except RuntimeError:
        return {}  # table does not exist yet: first run
    return {r["filename"]: r["checksum"] for r in rows}


def run_file(p: Path, dry: bool) -> None:
    sql = p.read_text()
    print(f"→ {p.relative_to(HERE)} ({len(sql):,} bytes)")
    if dry:
        return
    mgmt.query(sql)
    mgmt.query(
        "insert into _migrations (filename, checksum) values ($$%s$$, $$%s$$) "
        "on conflict (filename) do update set checksum = excluded.checksum, applied_at = now()"
        % (p.name, sha(p))
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["migrations", "seed"])
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()

    groups = []
    if a.only in (None, "migrations"):
        groups.append(sorted((HERE / "migrations").glob("*.sql")))
    if a.only in (None, "seed"):
        groups.append(sorted((HERE / "seed").glob("*.sql")))

    done = applied()
    for files in groups:
        for p in files:
            prev = done.get(p.name)
            if prev == sha(p):
                print(f"  = {p.name} already applied")
                continue
            if prev and not a.force and p.parent.name == "migrations":
                print(f"  ! {p.name} changed since it was applied; edit a new migration or pass --force")
                return 1
            run_file(p, a.dry_run)
    print("done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
