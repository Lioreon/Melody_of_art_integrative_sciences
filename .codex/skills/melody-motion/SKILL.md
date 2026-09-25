---
name: melody-motion
description: "Use for implementation, debugging, refactoring, validation, UI/UX, tracking, audio, calibration, testing, or release work in the Melody Motion repository. Loads the project's operational bridge, queries Graphify first when available, and enforces the separation between tracking, musical interpretation, pedagogy, and UI."
---

# Melody Motion project workflow

Use this skill for repository work on Melody Motion.

## Start

1. Read `AGENTS.md`.
2. Read `docs/CODEX_BRIDGE.md`.
3. Run:
   ```bash
   git status --short
   git log -1 --oneline
   ```
4. If `graphify-out/graph.json` exists, query the task before broad file browsing:
   ```bash
   graphify query "<task in one precise sentence>" --budget 1500
   ```
5. Open only the directly relevant files plus the specific source-of-truth document routed by `docs/CODEX_BRIDGE.md`.

## Plan

Before editing, determine:
- affected layer(s): Tracking / Interpretation / Musical domain / Pedagogical evaluation / UI;
- smallest file set;
- behavioral invariant that must remain true;
- cheapest test that can falsify the proposed change.

If the requested change would collapse layers, redesign the boundary before editing.

## Implement

- Prefer existing project primitives and services.
- Preserve raw tracking data; derive interpretations separately.
- Keep technical diagnostics secondary to the learner-facing UI.
- Treat tracking loss as uncertainty, never learner failure.
- Do not add dependencies or infrastructure unless explicitly requested.
- Avoid opportunistic refactors outside the task.

## Validate efficiently

Use a funnel:

1. targeted unit/component test or existing focused command;
2. inspect the diff;
3. `pnpm test`;
4. `pnpm build`;
5. if Graphify is installed and code changed: `graphify update .`.

For visual changes, explicitly inspect the affected responsive classes/states. Do not claim cross-device validation unless actually performed.

For performance/tracking changes, do not claim improvement without before/after measurements.

## Handoff

Return a compact engineering handoff:

- **Changed:** files/behavior.
- **Preserved:** important invariants.
- **Validated:** exact tests/builds run.
- **Pending:** physical/device/pedagogical validation still needed.
- **Memory:** whether a decision/roadmap/issue/bridge update is warranted.

Do not rewrite historical docs unless the task changes historical interpretation.
