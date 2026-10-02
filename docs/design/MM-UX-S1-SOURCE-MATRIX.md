# MM-UX-S1 — Design Intelligence Source Matrix

**Purpose:** record exactly how external design sources may influence Melody Motion without becoming product authority.

## Sources and pinned evidence

| Source | Pin observed | Role | Decision |
| --- | --- | --- | --- |
| UI/UX Pro Max | `09170eec67eefd46a7ae85de61b40c194020f997` | accessibility, responsive, touch, semantic tokens, UX checks | ADOPT as review source |
| Emil Kowalski Skills | `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` | motion craft, mobile-native details, prototyping, stress testing | ADOPT/ADAPT |
| Impeccable | `508d7e8955de3b3caf2d8676e85206723d41a887` | anti-pattern detection, audit, critique, polish | ADOPT as auditor; installer hooks require separate authorization |
| Taste Skill | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` | divergent visual references and redesign alternatives | ADAPT for ideation only |
| Playwright MCP | `f183dad4a52965583e3cc1d59b88cdc279e2e57d` | browser verification, not design authority | USE as verification layer; CLI/skills preferred for routine coding-agent checks |
| Figma | service/tool, not vendored | canonical visual specification and component exploration | USE after design rules are synthesized |

## ADOPT

### UI/UX Pro Max
- 44×44px touch targets.
- minimum separation between adjacent touch controls.
- mobile-first responsive review.
- no horizontal overflow.
- visible focus.
- semantic color tokens.
- reduced-motion support.
- contrast verification.
- progressive disclosure.

### Emil Kowalski
- purposeful motion only.
- spatial continuity for component state changes.
- ease-out for entrances and immediate response.
- transform/opacity over layout-property animation when practical.
- active/press feedback.
- real hardware is source of truth for mobile.
- safe areas, dynamic viewport units, and capability media queries.
- do not disable zoom.

### Impeccable
- detect nested-card excess.
- detect weak gray-on-colored contrast.
- critique hierarchy before adding decoration.
- use product truth separately from transient visual direction.
- audit before polish.

## ADAPT

### Multiple semantic accents
Some general design sources prefer a single accent color. Melody Motion intentionally retains multiple accents because pitch, rhythm, target, interaction, success, pause, and error carry distinct pedagogical meaning.

### Motion
Use Emil's craft rules, but lower the overall motion budget because the user is performing a timed embodied task. Motion should explain state, not entertain.

### Typography
Taste/Impeccable recommendations to replace generic fonts may be explored later, but accessibility, loading cost, musical notation, language coverage, and institutional appropriateness come first.

### Asymmetry
Taste encourages asymmetry to avoid generic layouts. Melody Motion may use mild editorial asymmetry in preparation/review screens, but active exercises favor spatial predictability.

## NO APLICA

- AIDA landing-page structure.
- cinematic hero sections.
- testimonials/pricing patterns.
- marketing carousels.
- media-streaming dark visual language.
- conversion-focused CTA hierarchy.
- dense analytics-dashboard patterns as the default learning surface.

## CONFLICTA

### Taste Skill / gpt-taste: mandatory GSAP and motion-rich UI
Rejected as a baseline. Melody Motion cannot make static interfaces "forbidden"; frequent learning interactions must remain fast, interruptible, and compatible with reduced motion.

### Taste Skill / gpt-taste: massive section spacing
Rejected for active mobile exercises where objective, staff, timer, hold, and tracking need to coexist in one viewport.

### Taste Skill / gpt-taste: forced randomization
Rejected. Product consistency and reproducible pedagogy are more important than forcing visual variance.

### Impeccable installer hooks
Do not authorize automatic modification of `.codex/hooks.json` or provider-native project hooks inside Melody Motion without a dedicated governance gate.

### Any source that treats "music" as "music streaming"
Rejected categorization. Melody Motion is education + embodied interaction + musical learning.

## Operating rule

No external skill may directly authorize:

- dependency changes;
- hooks;
- tracking changes;
- musical mapping changes;
- merge to main;
- production deploy.

A source can propose. Melody Motion governance decides.

## Figma role

Figma should receive the already-adjudicated design language, not invent product rules.

Recommended first component set:

- AdaptiveCameraDock;
- ExerciseShell;
- TargetCard;
- TrackingStatus;
- HoldProgress;
- ResponseProgress;
- PentagramQuiz active state;
- feedback state;
- result state.

Recommended first comparison board:

1. Pentagram Quiz / 390px / expanded camera;
2. Pentagram Quiz / 390px / floating camera;
3. Pentagram Quiz / 390px / minimized camera;
4. tracking lost / recovery;
5. session result.

Each frame must use real Melody Motion copy and states rather than placeholder marketing content.

## Playwright role

Use Playwright after implementation to verify observable behavior:

- no horizontal overflow;
- controls remain reachable;
- focus is not obscured;
- active exercise elements coexist;
- expanded/floating/minimized state controls work;
- responsive breakpoints remain stable.

Browser automation does not replace physical-camera validation.
