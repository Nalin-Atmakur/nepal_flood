# Runbook

## Recovery after context compaction or interruption

1. Read `PLAN.md` completely.
2. Read `STATUS.md` and resume its first unfinished immediate action.
3. Read `DECISIONS.md` before changing scope or scientific thresholds.
4. Check the active Codex goal; do not replace or complete it prematurely.
5. Inspect `git status --short` and preserve unrelated changes.
6. Check sandbox reachability and free space before bulk work.
7. Update `STATUS.md` before beginning the next milestone.

## Local prerequisites

```text
Google Chrome
Node.js 22+
Peekaboo (read-only diagnostics)
Playwright
GDAL/PROJ
imsg for scoped SMS OTP reading
```

NASA ASP and bulk geospatial processing may run on the sandbox Mac after installation verification.

## Secret file

Expected local file:

```text
topographic_change_map/.env.topographic.local
```

Before loading it:

```bash
git check-ignore -q topographic_change_map/.env.topographic.local
stat -f '%Lp' topographic_change_map/.env.topographic.local
```

The runner must refuse to load a tracked file or permissions broader than `0600`. Never print the file.

## Headed Chrome invariant

The automation launcher must assert:

- browser is not headless;
- executable is installed Google Chrome;
- user data directory is the project clone, not the original Chrome directory;
- window is within secondary display bounds;
- original system mouse position is unchanged after a synthetic form test.

Use CoreGraphics display bounds for placement. On the current display arrangement, the built-in display origin is `(2560, 508)`; some UI inventory tools normalize this to `(2560, 0)` and must not be used for the placement assertion.

## Sandbox checks

```bash
ssh zoral@100.99.74.22 'df -h /System/Volumes/Data'
ssh zoral@100.99.74.22 'test -d /Users/zoral && printf ready'
```

All remote commands must resolve their write target beneath `/Users/zoral/topographic-change-map`. Do not use broad deletion commands. Downloads use temporary `.part` names and atomic rename after checksum verification.

## Git checkpoint

```bash
git fetch origin
git status --short
git add -- topographic_change_map .gitignore
git diff --cached --check
git diff --cached --stat
git diff --cached
git commit -m '<milestone message>'
git push origin main
```

Before commit, scan staged content for known secret-variable values without printing the values. Never use `git add -A` or `git add .` in this dirty worktree.

## Failure policy

- Retry transient network/provider failures with bounded exponential backoff.
- Save sanitized diagnostics and resume state.
- After three identical external blockers across goal continuations, record the blocker and pursue the next provider/alternative rather than stopping the project.
- Do not fill missing elevation with invented data.
