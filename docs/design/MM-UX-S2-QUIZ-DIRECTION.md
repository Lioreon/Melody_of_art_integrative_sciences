# MM-UX-S2 — Pentagram Quiz Visual Direction

**Status:** DIRECTION LOCKED / C VISUAL REVIEW PENDING  
**Product baseline:** `main@bb62474d4e89cb37a34c3e8c8c0f6737f72965d3`  
**Figma file:** https://www.figma.com/design/3UMerFZyASMNbEaqC7o6fU  
**Exploration page:** `01 · Quiz Mobile Exploration`

## Evidence

Three 390×844 frames were constructed as editable Figma structures:

- `3:6` — A · Quiet editorial
- `3:41` — B · Musical instrument
- `3:79` — C · Compact pedagogical lab

Visual screenshots were successfully reviewed for A and B. C was structurally created but could not be captured because the authenticated Figma Starter plan reached its MCP call limit. Therefore C is not treated as visually signed off.

## Adjudication

No single variant is adopted wholesale.

### Canonical composition anchor: B · Musical instrument

Adopt:

- explicit target band;
- staff as the dominant visual object;
- stronger semantic link between blue/cyan and the learner's current note;
- subtle halo around TÚ;
- immediate feedback located directly after the staff;
- clearer sense that the interface is a musical instrument rather than a generic education dashboard.

### Borrow from A · Quiet editorial

Adopt:

- ivory negative space;
- restrained chrome;
- lower card density;
- calm typographic rhythm;
- absence of decorative competition around the staff.

### Borrow from C · Compact pedagogical lab

Adopt only structurally until visual review:

- compact lower-area behavior;
- minimized camera as a valid active-learning state;
- stronger prioritization of learning content over persistent camera surface.

Do not import unreviewed C styling.

## Canonical active-question hierarchy

```text
PENTAGRAMA · QUIZ                    4 / 10
Encuentra La4

[ Suba ambas manos hasta La4 ]       META

┌──────────────────────────────────┐
│                                  │
│           PENTAGRAMA             │
│          target      TÚ          │
│                    (halo)        │
│                                  │
└──────────────────────────────────┘

Estás cerca · sube un poco más

Tiempo          6,2 s
████████████░░░░

Mantén          0,9 / 1,5 s
███████████░░░░░

● Seguimiento activo          [camera]
```

## Visual grammar

### Background
Warm ivory remains the dominant field.

### Surfaces
Use white-cream or muted ivory only when grouping improves comprehension. Do not wrap every region in a bordered card.

### Gold
Target/meta.

### Blue / note cyan
Current learner position and pitch-domain interaction.

### Jade
Hold/tracking/progress.

### Red
True error only.

## Interaction rules

- active session configuration is hidden;
- camera remains secondary;
- floating/minimized dock must not obscure staff, timers, feedback, or focus;
- touch targets remain 44px minimum;
- focus remains visible after dock actions;
- no layout animation may delay the exercise;
- tracking loss pauses/recovery semantics, never pedagogical failure.

## Motion

The TÚ halo may use a static low-opacity field or a subtle reduced-motion-safe transition. No pulsing loop is required.

Camera transitions preserve spatial continuity and remain short/interruptible.

## Accessibility

Before visual refinements ship:

- audit muted text contrast on ivory and cream;
- preserve target meaning in text, not only gold;
- preserve current-note meaning in text/geometry, not only blue;
- maintain 16px body controls where iOS focus zoom matters;
- verify keyboard focus is never hidden by the camera dock.

## Gate sequence

### MM-UX1C — Contrast + Touch + Focus
First, harden the current production UI:

- small-text contrast;
- adjacent touch spacing;
- focus visibility/preservation;
- no redesign;
- no new dependencies;
- no tracking changes.

### MM-UX1D — Quiz Visual Direction
Then implement this S2 composition:

- B as structural anchor;
- A's calm spacing;
- C's compact dock behavior only;
- no quiz logic changes;
- no mapping/scoring/audio changes.

## Acceptance for MM-UX1D

At 390×844 during an active question, simultaneously show:

- question count;
- target;
- staff;
- TÚ;
- feedback;
- response timer;
- hold progress;
- tracking state.

The camera may be floating or minimized but may not dominate the learning viewport.

## Deferred

- final independent visual review of C after Figma MCP quota resets;
- typography family replacement;
- full component library in Figma;
- Code Connect;
- broader redesign of Instrument, Rhythm, or Compás.

These are not prerequisites for MM-UX1C.
