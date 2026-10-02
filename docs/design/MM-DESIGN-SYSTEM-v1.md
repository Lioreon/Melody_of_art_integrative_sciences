# Melody Motion Design System v1

**Gate:** MM-UX-S1 — Design Intelligence Synthesis  
**Status:** reconciled documentary baseline  
**Current product baseline:** `main@bb62474d4e89cb37a34c3e8c8c0f6737f72965d3`  
**UX1B subject integrated:** `fc2c01ff2509aebe3ca438a304bf2b8d1995b1b8`  
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

These colors are semantic, not decorative.

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

- primary body text: **16px minimum on mobile**;
- secondary/help text: **13–14px** when contrast is sufficient;
- labels/chips: **12px minimum** for meaningful interface text;
- 10–11px is permitted only for non-essential camera-stage annotations whose meaning exists elsewhere;
- timers and measurements use tabular figures or monospace numerals;
- headings use controlled line length and tighter tracking;
- prefer sentence case over pervasive all-caps.

Do not shrink critical text to make a crowded layout fit. Remove or fold secondary information instead.

## 5. Spacing and density

### Preparation
Moderate density.

### Active exercise
Low visual density. One primary task per viewport.

### Review
Moderate density.

Spacing should communicate grouping before borders do:

`space → background tint → separator → border → elevation`.

A border and shadow are not default requirements for every container.

## 6. Component grammar

- **ExerciseShell** — Prepare / Act / Review frame.
- **AdaptiveCameraDock** — expanded / floating / minimized.
- **WorkspaceHeader** — compact objective context.
- **TargetCard** — one musical target.
- **TrackingStatus** — state + text.
- **HoldProgress** — retention progress.
- **ResponseProgress** — response time.
- **FeedbackPanel** — immediate/final feedback.
- **LevelSelector** — learning level choice.
- **MasteryIndicator** — future pedagogical progress.
- **ResultSummary** — session reflection.
- **ConfigurationPanel** — visible before activity, progressively hidden during activity.

Every component must answer at least one of:

- What should I do?
- Where am I?
- Is the system tracking me?
- How long should I hold?
- Did I reach the target?
- What happens next?

## 7. Adaptive Camera Dock

The camera is a pedagogical instrument, not a decorative video card.

### Expanded
Setup, calibration, orientation, recovery.

### Floating
Active learning when body reference remains useful.

### Minimized
Tracking stable; maximize exercise space.

Invariant:

> `CameraView`, video, canvas, MediaStream, and tracking session remain mounted across presentation modes.

Tracking loss is never learner error.

## 8. Touch and mobile-native behavior

Required:

- targets **44×44px minimum**;
- ~8px separation between adjacent high-frequency touch targets where practical;
- `touch-action: manipulation`;
- no hover-only meaning;
- visible active feedback;
- safe-area insets;
- dynamic viewport units for app shells;
- browser zoom remains enabled;
- iOS form controls remain at least 16px;
- no horizontal overflow;
- real hardware remains final authority.

## 9. Focus and keyboard

- visible `:focus-visible`;
- logical focus order;
- focus preserved when expand/minimize actions remain meaningful;
- fixed UI must not obscure focus;
- icon-only actions require accessible names.

## 10. Motion

Motion is allowed for spatial continuity, state explanation, interaction feedback, and avoiding jarring changes.

Default guidance:

- button press: 100–160ms;
- small control feedback: 125–200ms;
- camera-dock transition: about 180–260ms;
- prefer transform/opacity;
- avoid `transition: all`;
- transitions interruptible;
- respect `prefers-reduced-motion`;
- no mandatory GSAP dependency.

The learner should never wait for animation.

## 11. Pedagogical state vs game state

### Pedagogical state
concept acquisition, stability, retention, transfer, assistance.

### Game state
points, streaks, rewards, ranking.

Game state may motivate but may not imply mastery.

## 12. Pentagram Quiz active viewport

During a question prioritize simultaneous visibility of:

1. question progress;
2. target note;
3. staff;
4. dynamic **TÚ** note;
5. response timer;
6. hold progress;
7. tracking state.

Configuration leaves the active viewport after the session begins. Camera remains secondary.

## 13. Accessibility acceptance

- meaningful normal text aims for WCAG AA contrast;
- state is never color-only;
- controls have accessible names;
- progress has semantic roles/values;
- touch targets meet minimum size;
- reduced motion respected;
- zoom enabled;
- text reflows without clipping;
- tracking loss produces pause/recovery, not punishment.

## 14. Anti-patterns

Do not introduce:

- nested card stacks as default layout;
- weak gray text on colored surfaces;
- raw hex colors when a semantic token exists;
- high-frequency layout-property animations when transform/opacity works;
- permanent configuration panels during active exercises;
- decorative badges/icons without purpose;
- generic AI-purple gradients;
- marketing hero structures inside learning surfaces;
- motion-rich GSAP sequences as baseline interaction language.

## 15. Source hierarchy

1. Melody Motion pedagogy.
2. Accessibility and physical-device evidence.
3. Existing product architecture/state model.
4. UI/UX Pro Max.
5. Emil Kowalski design-engineering/mobile guidance.
6. Impeccable audit findings.
7. Taste Skill as exploratory divergence only.
8. aesthetic preference.

External skills are evidence and critique tools, never product authority.

## 16. Validation surfaces

- 390×844;
- 430×932;
- 768×1024;
- 1280×800.

Camera-related changes additionally require physical-device validation.

## 17. Current implementation sequence

1. **MM-UX1C — Contrast + Touch + Focus**
2. **MM-UX1D — Pentagram Quiz Visual Direction**
3. responsive/browser verification
4. Pages preview
5. physical validation
