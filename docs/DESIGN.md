# Design

The visual source of truth for GOAL 08.7 is the root `DESIGN.md`.

## GOAL 08.7 landing direction

GOAL 08.7 sharpens only the landing page. The public UI no longer uses the label "Regex Lab Arcade"; that remains a design note, not a user-facing promise.

Landing hierarchy:

- hero title: "Trova la regex nascosta";
- primary CTA: "Gioca una sfida";
- secondary CTA: "Come funziona";
- no third hero CTA;
- desktop header hides the extra "Gioca ora" action on Home to avoid CTA duplication;
- first viewport centers on a scripted "Sfida lampo" preview with examples, visual regex input, hidden-test locks, and a real `/challenges` link.

Below the hero, the landing uses at most three focused blocks:

- "Sfida consigliata": a concrete seeded challenge preview with accepted/rejected examples and "Gioca questa";
- "Come si gioca": three steps only, observe examples, write the regex, use clues;
- "Classifica": a light reminder that fewer attempts matter, with "Vedi classifica".

Design constraints:

- keep the first viewport compact enough that the next section is hinted on desktop;
- keep mobile hero readable without forcing a long first-screen scroll;
- use a darker, higher-contrast preview panel for memorability;
- keep regex chips controlled and sparse;
- avoid decorative pills that do not add product meaning;
- do not introduce frontend regex evaluation, new UI libraries, or backend/API changes.

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
