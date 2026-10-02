# Melody Motion Design System v1

**Gate:** MM-UX-S1 — Design Intelligence Synthesis  
**Status:** documentary candidate  
**Product baseline:** `main@aa624a53337fa2fc4323f13daa59918fdcc482f8`  
**Latest UX subject:** `ux/mm-ux1b-adaptive-camera-dock@fc2c01ff2509aebe3ca438a304bf2b8d1995b1b8`  
**Scope:** visual language, interaction, responsive behavior, accessibility, motion, and pedagogical UI.  
**Out of scope:** tracking algorithms, MediaPipe, musical mappings, scoring semantics, replay logic, audio engine.

## 1. Product truth

Melody Motion is a **mobile-first pedagogical musical instrument**, not a SaaS dashboard, music-streaming product, marketing site, or visual demo.

Its interface must help a learner understand a musical objective, act with the body, receive immediate feedback, retain a position, and continue without constant teacher intervention.

The design system therefore prioritizes, in this order:

1. pedagogical clarity;
2. accessibility and touch;
3. continuity of camera/tracking;
4. spatial stability during an exercise;
5. readable musical feedback;
6. calm delight;
7. decorative novelty.

Aesthetic quality is important, but it may never obscure the current objective, tracking state, timer, hold state, staff, or the learner's own position.

## 2. Core experience principle

> The interface should progressively disappear as learning begins.

### Prepare
Show explanation, camera setup, calibration, configuration, and learning context.

### Act
Reduce chrome. Keep the objective, musical surface, tracking state, timer/hold when relevant, and the smallest useful camera representation.

### Review
Show results, progress, reflection, and next action.

This three-density model is the default shell for all modules.

## 3. Visual direction

The intended character is:

**warm · musical · precise · pedagogical · contemporary · calm-playful**

Avoid:

- generic SaaS dashboards;
- neon gaming language;
- dark "music streaming" aesthetics as the default;
- card-inside-card nesting;
- excessive gradients;
- decorative motion with no instructional purpose;
- one-accent-only minimalism when semantic musical states require distinction.

### Light mode foundation

Current canonical light tokens remain the starting point:

| Token | Value | Role |
| --- | --- | --- |
| `--ui-background` | `#FBF7EC` | warm ivory page |
| `--ui-surface` | `#FFFDFA` | primary surface |
| `--ui-surface-muted` | `#F4EFE2` | quiet grouping |
| `--ui-border` | `#E1D8C3` | warm separator |
| `--ui-text` | `#233128` | primary text |
| `--ui-text-muted` | `#6F766F` | secondary text, subject to contrast review |
| `--ui-forest` | `#4F6F55` | structural action/navigation |
| `--ui-blue` | `#3D6F9D` | current note / active exploration |
| `--ui-gold` | `#D29A32` | target / achievement / institutional warmth |
| `--ui-jade` | `#2F9F78` | interaction / progress / tracking success |
| `--music-note-accent` | `#1797B7` | pitch/note semantics |
| `--music-rhythm-accent` | `#7169C8` | rhythm/duration semantics |
| `--feedback-success` | `#2B9D72` | consolidated success |

These colors are **semantic**, not decorative. Do not proliferate additional accent colors without a new semantic role.

### State semantics

| State | Visual semantic |
| --- | --- |
| searching / current | blue |
| target | gold |
| interaction / hold progress | jade |
| consolidated success | green |
| tracking paused/lost | neutral gray |
| true error | red |
| rhythm domain | restrained violet |

Never use red merely because the learner has not yet reached the target.

## 4. Typography

Typography must support musical attention rather than compete with it.

### Default scale

- primary body text: **16px minimum on mobile**;
- secondary/help text: **13–14px** when contrast is sufficient;
- labels/chips: **12px minimum** for meaningful interface text;
- 10–11px is permitted only for **non-essential camera-stage annotations** where the same meaning exists elsewhere;
- numeric timers and measurements should use tabular figures or monospace numerals;
- headings should use tighter tracking and controlled line length;
- prefer sentence case over pervasive all-caps.

Do not shrink critical text to make a crowded layout fit. Remove or fold secondary information instead.

## 5. Spacing and density

The interface uses three density levels:

### Preparation
Moderate density. Configuration may occupy vertical space.

### Active exercise
Low visual density. One primary task per viewport.

### Review
Moderate density. Results may use tables, summaries, or progression cards.

Spacing should communicate grouping before borders do. Prefer:

`space → background tint → separator → border → elevation`

in that order.

A border and shadow are not default requirements for every container.

## 6. Component grammar

Canonical component families:

- **ExerciseShell** — Prepare / Act / Review frame.
- **AdaptiveCameraDock** — expanded / floating / minimized without unmounting camera internals.
- **WorkspaceHeader** — compact objective context.
- **TargetCard** — one clear musical target.
- **TrackingStatus** — state + text; never color alone.
- **HoldProgress** — retention progress.
- **ResponseProgress** — question response time.
- **FeedbackPanel** — immediate/final feedback.
- **LevelSelector** — learning level choice.
- **MasteryIndicator** — future pedagogical progress, not game score.
- **ResultSummary** — session reflection.
- **ConfigurationPanel** — visible before activity, progressively hidden during activity.

### Component rule

Every component must answer at least one of:

- What should I do?
- Where am I?
- Is the system tracking me?
- How long should I hold?
- Did I reach the target?
- What happens next?

If it answers none of these, its presence requires justification.

## 7. Adaptive Camera Dock

The camera is a pedagogical instrument, not a decorative video card.

### Expanded
Used for setup, calibration, orientation, and recovery.

### Floating
Used during active learning when visual body reference is still useful.

### Minimized
Used when tracking is stable and the learner needs maximum exercise space.

Invariant:

> `CameraView`, video, canvas, MediaStream, and tracking session remain mounted across presentation modes.

Tracking loss must never be interpreted as learner error.

When tracking is lost, the UI may enlarge the camera to help recovery, but mode changes must be debounced to avoid visual oscillation.

## 8. Touch and mobile-native behavior

Required:

- interactive targets **44×44px minimum**;
- at least ~8px separation between adjacent high-frequency touch targets where practical;
- `touch-action: manipulation` for ordinary controls;
- no hover-only meaning;
- hover effects gated by pointer capability;
- visible `:active` feedback;
- safe-area insets respected;
- use `dvh`/appropriate dynamic viewport units for app shells;
- do not disable browser zoom;
- form controls on iOS remain at least 16px;
- no horizontal overflow in active exercises;
- real hardware is the final authority for mobile behavior.

## 9. Focus and keyboard

Every interactive control requires:

- visible `:focus-visible`;
- logical focus order;
- focus preservation after expand/minimize actions when the triggering control remains meaningful;
- no focus hidden under sticky/fixed UI;
- no icon-only action without an accessible name.

Camera dock state changes must not unexpectedly move focus into the video surface.

## 10. Motion

Motion exists for:

- spatial continuity;
- state explanation;
- interaction feedback;
- preventing jarring layout changes.

Motion does **not** exist to make the product look cinematic.

Default rules:

- button press: 100–160ms;
- small popover/control feedback: 125–200ms;
- camera-dock transition: approximately 180–260ms when used;
- use `transform` and `opacity` where possible;
- entering elements generally use ease-out;
- movement/morphing may use ease-in-out;
- avoid `transition: all`;
- transitions must remain interruptible;
- respect `prefers-reduced-motion`;
- no mandatory GSAP dependency for ordinary product motion.

The learner should never wait for an animation before continuing an exercise.

## 11. Pedagogical state vs game state

Visual language must keep these independent:

### Pedagogical state
concept acquisition, stability, retention, transfer, assistance.

### Game state
points, streaks, rewards, ranking.

Game state may motivate, but it may not visually dominate or imply mastery.

Future mastery states may use:

`unseen → explored → developing → consolidated → transferable`.

## 12. Pentagram Quiz active viewport

During a question, prioritize simultaneous visibility of:

1. question progress;
2. target note;
3. staff;
4. dynamic **TÚ** note;
5. response timer;
6. hold progress;
7. tracking state.

Configuration controls should leave the active viewport after the session begins.

The camera is secondary to the musical task.

## 13. Accessibility acceptance rules

Before shipping a UI gate:

- meaningful normal text aims for WCAG AA contrast (4.5:1);
- state meaning is never color-only;
- controls have accessible names;
- progress has semantic roles/values;
- touch targets meet minimum size;
- reduced motion is respected;
- zoom remains enabled;
- text reflows without clipping at narrow widths;
- tracking loss produces pause/recovery semantics, not punishment.

## 14. Anti-patterns

Do not introduce:

- nested card stacks as default layout;
- gray text with insufficient contrast on colored surfaces;
- raw hex colors inside ordinary React components when a semantic token exists;
- animation of width/height/top/left for high-frequency interactions when transform/opacity can express the same effect;
- permanent configuration panels during active exercises;
- badges for information that belongs in normal text;
- decorative icons without semantic purpose;
- generic "AI purple gradient" visual language;
- large marketing-style hero structures inside the learning application;
- motion-rich GSAP sequences as a baseline interaction language.

## 15. Source hierarchy

When external design sources disagree, resolve in this order:

1. Melody Motion pedagogical requirements.
2. Accessibility and physical-device evidence.
3. Existing product architecture and semantic state model.
4. UI/UX Pro Max verified UX guidance.
5. Emil Kowalski design-engineering/mobile guidance.
6. Impeccable audit findings.
7. Taste Skill as exploratory divergence only.
8. aesthetic preference.

External skills are evidence and critique tools, never product authority.

## 16. Required validation surfaces

Every meaningful UI change should be checked at minimum at:

- 390×844;
- 430×932;
- 768×1024;
- 1280×800.

For camera-related changes, add physical-device validation before final adjudication.

## 17. Next implementation gate

The first implementation gate derived from this document is intentionally narrow:

**MM-UX1C — Contrast + Touch + Focus**

Scope:

- repair small-text contrast;
- improve spacing of adjacent touch controls where needed;
- verify focus visibility/preservation;
- no redesign;
- no tracking changes;
- no new dependencies.

