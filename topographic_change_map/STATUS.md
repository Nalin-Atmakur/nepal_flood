# Project status

Last updated: 2026-08-29 19:48 BST

## Goal

Active: complete the Nepal flood topographic change map end to end. Do not mark complete after signup, catalogue creation, or a visually plausible DSM.

## Current milestone

**M0 — Durable foundation**

In progress:

- Persist canonical project plan and recovery documents.
- Add Git exclusions for secrets, browser profiles, caches, and bulk products.
- Prepare the first path-scoped commit and direct push to `origin/main`.

## Verified environment

| Item | Status |
|---|---|
| Repository branch | `main` |
| Git remote | `origin` configured |
| Breeze Chrome profile | `Profile 12` found |
| Secondary built-in display | index 1, origin `(2560, 0)`, logical `1440 x 932` |
| Chrome | installed |
| Peekaboo permissions | Screen Recording and Accessibility granted |
| Sandbox SSH | `zoral@100.99.74.22` reachable with key authentication |
| Sandbox free space | 87 GiB at milestone start |
| SMS helper | not installed yet |
| NASA ASP | not yet verified/installed |

## Existing research

The `research/` directory contains the goal, source inventory, acquisition plan, stereo feasibility gates, ASP workflow, change-map method, validation rules, automation architecture, roadmap, and open questions.

## Immediate next actions

1. Commit and push the durable foundation.
2. Scaffold the TypeScript automation/catalogue application.
3. Implement configuration validation, secret redaction, persistent state, and account register.
4. Build and verify the headed Breeze-profile clone launcher on the secondary display.

## Active blockers

- None for milestone M0.
- Gmail may require a one-time reauthentication in the cloned profile.
- CAPTCHA remains an explicit user handoff.
- Institutional or paid camera-bearing imagery may remain inaccessible; free alternatives must be exhausted first.

## Worktree safety

Unrelated modified and untracked files exist under `aryaa_research_general/`. They belong to the user and must never be staged or changed by this project.
