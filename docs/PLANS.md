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

DONE_TECH:

- Add regex engine without unsafe JavaScript regex evaluation.
- Use full-match semantics and a RE2-compatible engine.
- Add aggregate attempt-style evaluator for future attempt submission.
- Add challenge control verification for future challenge creation.

## GOAL 05

DONE_TECH:

- Add protected attempt submission.
- Correct `negativeMatched` semantics.
- Require auth and CSRF guard v1 for attempt mutations.
- Store attempts and create solutions without exposing secret controls or submitted patterns.

## GOAL 05.5

DONE_TECH:

- Restructure delivery directories to `backend`, `frontend`, and `e2e`.
- Keep one pnpm workspace monorepo.
- Keep `packages/shared` in place for shared contracts.
- Preserve existing API, auth, database, regex, Docker, and test behavior.

## GOAL 06

DONE_TECH:

- Add protected challenge creation with author ownership from `rr_session`.
- Validate secret regexes, public examples, and secret controls with RE2 full-match semantics before persistence.
- Create `Challenge` and `ChallengeControl` rows transactionally.
- Keep public responses free of secret regexes and control values.
- Keep frontend challenge creation UI out of scope.

## GOAL 07

DONE_TECH:

- Add public solver leaderboard API.
- Rank solvers by solved challenge count, average attempts, then username.
- Keep leaderboard responses aggregate-only and public-identity-only.
- Keep frontend leaderboard UI out of scope.

## GOAL 08.0

DONE_TECH:

- Add Regex Lab design system and frontend foundation.
- Configure Tailwind CSS v4, shadcn/ui, React Router, TanStack Query, Motion for React, and same-origin API proxy.
- Add responsive app shell, accessible navigation, landing foundation, and safe placeholder routes.
- Keep real auth UI, attempt UI, challenge creation UI, challenge catalog data UI, and leaderboard data UI out of scope.

## GOAL 08.1

DONE_TECH:

- Connect public challenge catalog and leaderboard UI to existing read APIs.
- Keep secret regexes and hidden controls server-only.
- Connect public challenge detail UI to `GET /api/challenges/:id`.
- Keep auth UI, attempt UI, and challenge creation UI out of scope.

## GOAL 08.2

DONE_TECH:

- Connect frontend login/register/logout UI to existing auth APIs.
- Restore current session through `GET /api/auth/me`.
- Keep auth state in TanStack Query memory only.
- Keep `rr_session` as an HttpOnly/SameSite backend cookie; do not read it in the frontend.
- Keep attempt UI and challenge creation UI out of scope.

## GOAL 08.3

DONE_TECH:

- Add frontend attempt/gameplay UI for solving existing public challenges.
- Guest, author, authenticated solver, aggregate feedback, invalid regex, and already-solved states are implemented on `/challenges/:id`.
- Candidate regex evaluation remains server-side only through the existing protected attempt API.
- Keep authoring UI, profile/statistics, and edit/delete out of scope unless explicitly requested.

## GOAL 08.4

DONE_TECH:

- Add frontend challenge creation UI using the existing protected creation API.
- Implement guest/authenticated `/create` states, client shape validation, secret-control editing, public success feedback, and safe error mapping.
- Preserve server-side secret handling, regex evaluation, and CSRF/mutation guards.
- Keep profile/statistics and edit/delete out of scope unless explicitly requested.

## GOAL 09

- Expand gameplay-oriented E2E coverage.

## GOAL 10

- Harden production configuration and documentation.

## GOAL 11

- Final exam packaging, README review, and oral defense rehearsal.
