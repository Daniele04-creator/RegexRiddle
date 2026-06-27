# Regex Lab Design System

## Product Personality

Regex Lab is a precise puzzle laboratory: technical, playful, restrained, and exam-ready. The interface should feel like a safe lab console for regex riddles, not a generic SaaS template.

Visual thesis: pale lab surfaces, ink-blue technical text, teal signal accents, amber attention states, compact pattern chips, and quiet motion.

## Visual Metaphor

- Lab console: the shell frames the app as a controlled workspace.
- Pattern cards: regex examples are shown as text chips, never as executable client logic.
- Match and mismatch signals: success, warning, and danger states include text labels, not color alone.
- Safe sandbox: hidden checks and secret regexes stay server-only.

## Color Tokens

- `background`: calm lab canvas, near-white with a faint cool tint.
- `foreground`: deep ink blue for readable technical content.
- `surface/card`: clean elevated panels for repeated items and placeholders.
- `border`: cool neutral separator for scan-friendly layout.
- `muted`: subdued supporting surfaces and copy.
- `primary`: teal signal for primary action and API-online state.
- `accent`: amber lab marker for secondary emphasis.
- `success`: green match state.
- `warning`: amber caution state.
- `danger`: red destructive or offline state.

Colors are implemented as CSS variables in `frontend/src/styles/globals.css` and exposed through Tailwind v4 theme tokens.

## Typography

- Primary UI font: Geist variable through shadcn's current Vite setup.
- Code/pattern font: system monospace stack.
- Page H1: 40-72 px equivalent, reserved for page identity.
- Section H2: 28-36 px equivalent.
- Card headings: compact, 16-18 px equivalent.
- Body text: 14-18 px based on context.
- Captions and badges: 12-14 px.

Headings use balanced wrapping. Body copy should stay short, active, and product-facing.

## Spacing, Radius, Shadow

- Base spacing follows Tailwind's 4 px scale.
- Cards and framed tools use `8px` radius or less.
- Avoid nested cards and decorative card stacks.
- Shadows are subtle and only used for the hero preview or overlays.
- Dense operational pages should prefer dividers and full-width bands over floating panels.

## Layout And Breakpoints

- Mobile-first layout.
- Required review sizes: `390x844`, `768x1024`, `1440x900`.
- Header remains compact and sticky.
- Main content uses `PageContainer` with `max-w-6xl`.
- Hero uses a two-column desktop layout and collapses to one column on mobile.
- Placeholder routes keep one H1 and a single framed foundation panel.

## Component Rules

### App Shell

- Semantic `header`, `nav`, `main`, and `footer`.
- Skip link targets `#main-content`.
- Public navigation includes home, challenges, and leaderboard. Auth actions live in the session area as login/register links for guests and display name, username, create link, and logout for authenticated users.
- Mobile navigation uses shadcn `Sheet` and must not trap keyboard users after close.

### Buttons

- Use shadcn `Button`.
- Navigation actions use `Link` inside `Button asChild`.
- Icon-only buttons require an accessible name.
- Icons paired with text are decorative and use `aria-hidden`.
- Mobile buttons and inputs should use larger tap targets, then compact back to the dense desktop rhythm at tablet/desktop breakpoints.

### Cards

- Use cards only for repeated items, placeholder panels, public data summaries, and the hero preview.
- Do not put cards inside cards.
- Use `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent` composition.

### Public Data Views

- Challenge catalog cards show title, difficulty, public examples, public author identity, aggregate attempts, aggregate solutions, and created date.
- Challenge detail pages show the same public examples and aggregate stats, plus created/updated dates.
- Leaderboard desktop views use accessible table headers.
- Leaderboard mobile views use stacked list cards to avoid horizontal overflow.
- Pagination controls use real buttons and URL query state.

### Badges

- Use badges for status, milestone, and metric labels.
- Badge text must carry meaning without relying on color.

### Forms

- Auth forms use React Hook Form, Zod, shadcn field composition, explicit labels, autocomplete, field-level errors, and form-level alerts.
- Password fields use `type="password"` and must not render password values outside the input.
- Submit buttons show pending states and remain keyboard-submittable.
- Server errors are generic and user-facing; they must not expose backend internals or credential details.

### Pattern Chips

- Render regex-like text as text, not HTML.
- Do not evaluate regex in the browser.
- Keep user-supplied pattern display escaped by React.

### Feedback Panels

- Health status is non-blocking and uses `aria-live="polite"`.
- Offline status should not crash the shell.

## Motion Rules

- Motion is subtle: hero entrance, preview entrance, and section reveal only.
- Animate transform and opacity, not layout-heavy properties.
- Respect `prefers-reduced-motion` through CSS and Motion's `reducedMotion="user"`.
- Avoid distracting ambient animations.

## Accessibility Rules

- One H1 per page.
- Landmarks: `header`, `nav`, `main`, `footer`.
- Visible focus states through `:focus-visible`.
- Keyboard-operable navigation and sheet controls.
- Adequate contrast through semantic tokens.
- No information conveyed by color alone.
- Text containers must avoid overflow and clipping on mobile.

## Security-Aware UI Rules

- Never render secret regexes or hidden control values.
- Never expose submitted candidate patterns in public UI.
- Never store auth tokens in `localStorage` or `sessionStorage`.
- Never read `document.cookie` for auth.
- Never introduce JWT in the frontend.
- Never use `dangerouslySetInnerHTML`.
- User regex text is rendered as text only.
- Regex evaluation happens server-side with the RE2-compatible backend engine.

## GOAL 08.0 Scope

GOAL 08.0 ships the frontend foundation only: Tailwind, shadcn/ui, routing, shell, Query provider, same-origin API client, proxy, accessible placeholders, and visual documentation.

It does not ship real login/register forms, attempt UI, challenge creation UI, challenge catalog data rendering, or leaderboard data rendering.

## GOAL 08.1 Scope

GOAL 08.1 connects public read-only data views for `/challenges`, `/challenges/:id`, and `/leaderboard`.

It still does not ship real login/register forms, logout UI, attempt submission UI, challenge creation UI, profile/statistics, edit/delete, or frontend regex evaluation.

## GOAL 08.2 Scope

GOAL 08.2 connects login, registration, logout, current-session restoration, authenticated header/mobile nav states, and the auth-aware `/create` placeholder.

It still does not ship attempt submission UI, challenge creation form UI, profile/statistics, edit/delete, or frontend regex evaluation.
