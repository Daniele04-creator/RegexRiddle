# Design

The visual source of truth for GOAL 08.6 is the root `DESIGN.md`.

## GOAL 08.6 summary

RegexRiddle now uses the "Regex Lab Arcade" direction: a public puzzle-game interface over the existing safe lab architecture.

The implemented design system defines:

- a player-facing product personality for riddles, clues, hidden tests, attempts, and leaderboard progress;
- a brighter arcade-lab palette with teal primary actions, amber highlights, violet support surfaces, magenta regex chips, and readable ink text;
- a home hero with a puzzle preview instead of implementation health/status copy;
- public copy rules that remove API, backend, auth-cookie, DTO, framework, database, Docker, and GOAL labels from user-facing screens;
- challenge catalog cards with difficulty chips, public examples, author identity, aggregate stats, and "Gioca" CTAs;
- challenge detail attempt states for guests, authors, authenticated solvers, incorrect feedback, and solved feedback;
- leaderboard rules with a top-three podium and simple ranking explanation;
- auth and create copy that stays human and avoids implementation details;
- Motion for React rules for restrained entrance, hover, and feedback animation;
- responsive and accessibility rules for heading hierarchy, focus states, readable tap targets, and no horizontal overflow;
- security-aware UI rules that prohibit secret rendering, browser token storage, client regex evaluation, and `dangerouslySetInnerHTML`.

GOAL 08.6 does not introduce backend/API changes, database changes, auth/session changes, regex semantic changes, new large UI dependencies, or frontend regex evaluation.
