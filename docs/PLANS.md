# Plans

## GOAL 01

DONE_TECH:

- Added Prisma.
- Created the first database model.
- Added deterministic seed data.
- Kept domain APIs private until authorization rules are clear.

## GOAL 02

DONE_TECH:

- Define challenge read APIs.
- Add validation for public request parameters.
- Keep secret regexes and checks server-only.
- Add backend and E2E anti-leak tests for public challenge responses.

## GOAL 03

DONE_TECH:

- Add backend auth APIs.
- Use Argon2id password verification.
- Use opaque server-side sessions with `HttpOnly` and `SameSite=Lax` cookies.
- Store only hashed session tokens in the database.

## GOAL 04

- Add regex engine without unsafe JavaScript regex evaluation.
- Use full-match semantics and a RE2-compatible engine.

## GOAL 05

- Add protected attempt submission.

## GOAL 06

- Add authorization, ownership checks, and IDOR tests.

## GOAL 07

- Add leaderboard behavior.

## GOAL 08

- Improve responsive UI and accessibility.

## GOAL 09

- Expand E2E coverage toward the final 10-test requirement.

## GOAL 10

- Harden production configuration and documentation.

## GOAL 11

- Final exam packaging, README review, and oral defense rehearsal.
