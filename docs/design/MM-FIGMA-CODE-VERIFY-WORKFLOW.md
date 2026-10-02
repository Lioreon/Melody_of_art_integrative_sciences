# Melody Motion — Figma → Code → Verification Workflow

## Pipeline

```text
Pedagogical requirement
        ↓
MM-DESIGN-SYSTEM-v1
        ↓
Figma variants
        ↓
design adjudication
        ↓
implementation branch
        ↓
GitHub Actions
        ↓
Playwright / responsive verification
        ↓
Cloudflare Pages preview
        ↓
physical mobile/camera validation
        ↓
merge decision
```

## Figma file

`Melody Motion — Design System & Mobile Learning`

https://www.figma.com/design/3UMerFZyASMNbEaqC7o6fU

## Figma entry contract

Every design task states:

- learning state;
- viewport;
- information that must remain visible;
- camera-dock state;
- semantic colors;
- accessibility constraints;
- components allowed to change;
- behavioral invariants.

Figma specifies visual behavior; it does not invent application logic.

## First experiment

Subject: Pentagram Quiz active question.  
Viewport: 390×844.

Required:

- target note;
- staff;
- dynamic TÚ;
- response timer;
- hold progress;
- tracking;
- ivory mode;
- no configuration panel during active question;
- no horizontal scroll;
- camera logically secondary.

Variants:

- A · Quiet editorial
- B · Musical instrument
- C · Compact pedagogical lab

## Selection criteria

1. immediate comprehension;
2. low visual competition;
3. touch comfort;
4. readable staff;
5. camera coexistence;
6. calm identity;
7. implementation simplicity.

Visual novelty alone is not a criterion.

## Handoff

A chosen direction translates into token, component, responsive, interaction, motion, and accessibility changes. Do not ask Codex to merely "match a screenshot".

## Verification

Playwright validates structure and interaction. Physical testing remains required for camera permission, MediaStream continuity, MediaPipe, real safe areas/browser chrome, touch feel, and mobile keyboard behavior.
