# Melody Motion — Figma → Code → Verification Workflow

## Purpose

Create a repeatable design loop where visual decisions are explicit before implementation and validated after implementation.

## Pipeline

```text
Pedagogical requirement
        ↓
MM-DESIGN-SYSTEM-v1
        ↓
Figma variants
        ↓
human adjudication
        ↓
Codex / GitHub implementation branch
        ↓
GitHub Actions
        ↓
Playwright responsive verification
        ↓
Cloudflare Pages preview
        ↓
physical mobile/camera validation
        ↓
merge decision
```

## Figma entry contract

A Figma task must state:

- target learning state;
- target viewport;
- required visible information;
- camera-dock state;
- semantic colors;
- accessibility constraints;
- components allowed to change;
- product behaviors that must remain invariant.

Figma is a visual specification surface, not a new source of application logic.

## First Figma experiment

### Subject
Pentagram Quiz active question.

### Viewport
390×844.

### Invariants
- target note visible;
- pentagram visible;
- dynamic TÚ visible;
- response timer visible;
- hold progress visible;
- tracking status visible;
- no configuration panel during active question;
- ivory light mode;
- no horizontal scroll;
- CameraView remains logically secondary.

### Variants
A. Quiet editorial.
B. Musical instrument.
C. Compact pedagogical lab.

The variants may differ in composition and hierarchy but not in pedagogical information or semantics.

## Selection criteria

Select the direction that best satisfies:

1. immediate comprehension;
2. low visual competition;
3. touch comfort;
4. readable musical staff;
5. camera coexistence;
6. calm identity;
7. implementation simplicity.

Do not select by visual novelty alone.

## Implementation handoff

The chosen Figma frame must be translated into:

- token changes;
- component-level changes;
- responsive rules;
- interaction rules;
- motion rules;
- accessibility requirements.

Do not ask Codex to "match the screenshot" without this structured handoff.

## Verification

Playwright should verify structure and interaction. Physical testing remains required for:

- camera permissions;
- real MediaStream continuity;
- MediaPipe behavior;
- safe areas under actual browser chrome;
- sticky hover/tap behavior;
- mobile keyboard effects;
- perceived touch comfort.
