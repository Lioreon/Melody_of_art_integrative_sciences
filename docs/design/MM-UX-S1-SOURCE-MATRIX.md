# MM-UX-S1 — Design Intelligence Source Matrix

**Current product baseline:** `main@bb62474d4e89cb37a34c3e8c8c0f6737f72965d3`

## Sources

| Source | Pin observed | Role | Decision |
| --- | --- | --- | --- |
| UI/UX Pro Max | `09170eec67eefd46a7ae85de61b40c194020f997` | accessibility, responsive, touch, semantic tokens | ADOPT as review source |
| Emil Kowalski Skills | `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` | motion craft, mobile-native details, prototyping | ADOPT/ADAPT |
| Impeccable | `508d7e8955de3b3caf2d8676e85206723d41a887` | anti-pattern detection, audit, critique | ADOPT as auditor; hooks need explicit governance |
| Taste Skill | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` | visual divergence | ADAPT for ideation only |
| Playwright MCP | `f183dad4a52965583e3cc1d59b88cdc279e2e57d` | browser verification | verification layer |
| Figma | file `3UMerFZyASMNbEaqC7o6fU` | visual specification | canonical exploration surface |

## Repository reconciliation

The current `main` already contains a repo-local copy of UI/UX Pro Max as part of the integration published by PR #34. This document does not authorize removal or replacement of that capability. Its recommendations remain subordinate to Melody Motion product rules and repository governance.

## ADOPT

### UI/UX Pro Max
- 44×44px touch targets.
- minimum touch separation.
- mobile-first responsive review.
- no horizontal overflow.
- visible focus.
- semantic color tokens.
- reduced motion.
- contrast verification.
- progressive disclosure.

### Emil Kowalski
- purposeful motion.
- spatial continuity.
- ease-out for entrances.
- transform/opacity where practical.
- active/press feedback.
- physical hardware as source of truth.
- safe areas and dynamic viewport units.
- zoom remains enabled.

### Impeccable
- nested-card detection.
- weak-contrast detection.
- hierarchy critique before decoration.
- audit before polish.

## ADAPT

### Multiple semantic accents
Melody Motion intentionally preserves different semantic colors for pitch, rhythm, target, progress, success, pause, and error.

### Motion
Use design-engineering craft but with a lower motion budget because the learner performs a timed embodied task.

### Typography
A future custom family may be explored, but accessibility, load cost, notation compatibility, language support, and institutional appropriateness come first.

### Asymmetry
Mild editorial asymmetry may appear in preparation/review; active exercises favor predictable spatial hierarchy.

## NO APLICA

- AIDA landing structure.
- cinematic hero sections.
- pricing/testimonial patterns.
- music-streaming visual language.
- conversion CTA hierarchy.
- dense dashboard patterns as the default learning surface.

## CONFLICTA

- mandatory GSAP/motion-rich UI;
- massive cinematic section spacing during active exercises;
- forced visual randomization;
- automatic hook changes by external installers;
- classifying Melody Motion as music streaming.

## Operating rule

No external skill may directly authorize dependency changes, hooks, tracking changes, musical mappings, merges, or production deployment.
