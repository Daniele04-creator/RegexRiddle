# Design

The visual source of truth for GOAL 08.0 is the root `DESIGN.md`.

## GOAL 08.4 summary

Regex Lab is now documented as a technical, playful, precise, exam-ready frontend foundation.

The implemented design system defines:

- product personality and lab-console metaphor;
- semantic color tokens for background, foreground, surface, border, muted, primary, accent, success, warning, and danger;
- typography scale and pattern-chip rules;
- spacing, radius, and shadow rules;
- app shell, buttons, cards, badges, forms, feedback panel, and pattern display rules;
- subtle Motion for React rules with reduced-motion support;
- accessibility baseline for landmarks, heading hierarchy, keyboard navigation, focus states, and contrast;
- security-aware UI rules that prohibit secret rendering, browser token storage, client regex evaluation, and `dangerouslySetInnerHTML`.
- auth form rules for labels, autocomplete, field-level errors, form alerts, pending states, and safe generic credential errors.
- attempt gameplay rules for guest/auth/author states, native flag controls, aggregate feedback panels, `aria-live` status, and no client-side regex preview.
- challenge authoring rules for guest/auth states, controlled field groups, native flag controls, secret-control add/remove guards, public success feedback, and no client-side regex preview.

GOAL 08.4 adds the protected challenge creation form on `/create` while keeping regex evaluation server-side.

GOAL 08.4 does not introduce React Bits or Magic UI. Those remain possible later polish choices only after the base is maintainable and explainable.
