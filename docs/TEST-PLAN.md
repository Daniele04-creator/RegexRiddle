# Test Plan

## GOAL 00 checks

- Unit test shared constants.
- Unit test web smoke copy.
- Unit test API app factory with Fastify injection.
- E2E smoke test for the web page.
- E2E smoke test for `GET /health`.

## Required commands

```powershell
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:verify
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm check
```

## GOAL 01 database checks

- `pnpm db:generate` validates Prisma Client generation.
- `pnpm db:migrate` applies the versioned PostgreSQL migration.
- `pnpm db:seed` creates deterministic demo data.
- `pnpm db:verify` checks demo users, challenge count, controls, attempts, and solutions without printing secret patterns or control values.

`pnpm test` now includes public challenge API tests and expects PostgreSQL to be running with deterministic seed data. Run the database setup and verification commands before the full test gate.

## GOAL 02 public API checks

- Backend tests cover `GET /api/challenges` success, seeded challenge presence, aggregate stats, invalid query rejection, detail success, invalid ID rejection, and missing challenge `404`.
- Backend tests assert public responses do not contain `secretPattern`, `controls`, `value`, `proposedPattern`, `passwordHash`, or `sessionTokenHash`.
- E2E tests cover public challenge catalog and public challenge detail through HTTP.
- Current E2E count: 4 tests.

## GOAL 03 auth checks

- Backend tests cover register, duplicate register, login, invalid login, `me`, logout, post-logout `me`, session hash storage, auth anti-leak assertions, and public challenge access without auth.
- E2E tests cover demo login plus `me`, logout, invalid login, and auth response anti-leak behavior.
- Auth response tests assert public JSON does not contain `passwordHash`, `sessionTokenHash`, `token`, `sessionToken`, or cookie values.
- Current E2E count: 8 tests.

## GOAL 04 regex engine checks

- Backend tests cover full-match behavior, no partial prefix/suffix matches, multiline full-string safety, supported flags, invalid flags, duplicate flags, invalid syntax, RE2-incompatible lookahead and backreference rejection, ReDoS-shaped pattern evaluation, aggregate candidate evaluation, and challenge control verification.
- The regex engine had no public endpoint in GOAL 04, so no E2E tests were added in that milestone.

## GOAL 05 protected attempt checks

- Backend tests cover unauthenticated attempt rejection, missing CSRF rejection, wrong and correct submissions, solution row creation, already solved `409`, author `403`, invalid ID `400`, missing challenge `404`, invalid regex `422`, RE2-incompatible regex `422`, no-attempt persistence on rejected regexes, anti-leak response checks, attempt number increments, unknown body key rejection, and public challenge access without auth.
- Semantic tests confirm `negativeMatched` means NEGATIVE controls matched by the candidate, correct candidates have `negativeMatched === 0`, too-broad candidates have `negativeMatched > 0`, and `isCorrect` uses `positiveMatched === positiveTotal && negativeMatched === 0`.
- E2E API tests cover unauthenticated attempt rejection, demo user wrong attempt with aggregate counts only, demo user correct attempt with `solved: true`, and author self-attempt rejection.
- Current E2E count: 12 tests.

## GOAL 05.5 directory restructure checks

- The delivery directories are `backend`, `frontend`, and `e2e`.
- `packages/shared` remains unchanged in location.
- The restructure must not change API contracts, auth/session behavior, database schema, regex semantics, or test coverage.
- Full gates after the move must pass: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm e2e`, `pnpm check`, `pnpm db:verify`, and `docker compose up --build -d`.

## GOAL 06 protected challenge creation checks

- Backend tests cover unauthenticated challenge creation rejection, missing and wrong CSRF rejection, valid creation, `Location` header, current-session ownership, mass-assignment rejection, unknown-key rejection, invalid difficulty, invalid and duplicate flags, invalid and RE2-incompatible secret regexes, incoherent public examples, incoherent controls, duplicate controls, contradictory controls, too few controls, internal control persistence, no-write-on-invalid cases, and anti-leak assertions on creation/detail/list responses.
- E2E API tests cover demo-user challenge creation, public detail anti-leak behavior for a created challenge, unauthenticated rejection, missing CSRF rejection, and incoherent control rejection without persistence or secret leakage.
- Challenge creation tests assert public JSON does not contain `secretPattern`, control lists, `ChallengeControl.value`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, token values, or cookie values.
- Current backend test count after GOAL 06: 67 tests.
- Current E2E count after GOAL 06: 17 tests.

## GOAL 07 public solver leaderboard checks

- Backend tests cover public `GET /api/leaderboard`, unauthenticated access, no CSRF requirement, default pagination, explicit pagination after global ranking, invalid `page`, invalid `limit`, unknown query parameter rejection, exclusion of zero-solution users, solved-count ranking, average-attempt tie-breaker, username tie-breaker, 2-decimal average rounding, and anti-leak assertions.
- E2E API tests cover public leaderboard success, pagination, invalid query rejection, and leaderboard anti-leak behavior.
- Leaderboard response tests assert public JSON does not contain user ids, emails, avatar URLs, `secretPattern`, `controls`, `value`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, token values, or cookie values.
- Current backend test count after GOAL 07: 79 tests.
- Current E2E count after GOAL 07: 20 tests.

## GOAL 08.0 frontend foundation checks

- Frontend unit tests cover landing render, public navigation link targets, not-found route, API client same-origin credentials, protected-mutation CSRF helper, source security baseline, and reduced-motion CSS.
- E2E UI tests cover the landing foundation, desktop SPA navigation, mobile sheet navigation, same-origin `/health` proxy, rendered sensitive-string anti-leak checks, and browser storage auth-token checks.
- GOAL 08.0 must keep backend API, database schema, auth/session/cookie behavior, and regex semantics unchanged.
- Required audits:
  - no frontend `dangerouslySetInnerHTML`;
  - no frontend JavaScript `RegExp` construction for user regex;
  - no frontend `localStorage`, `sessionStorage`, or `document.cookie` auth usage;
  - no rendered sensitive field names in the UI;
  - no obsolete nested app-directory references.

Current frontend test count after GOAL 08.0: 11 tests.
Current E2E count after GOAL 08.0: 24 tests.

## GOAL 08.1 public read UI checks

- Frontend tests cover public API functions for catalog, detail, and leaderboard using the same-origin API client with `credentials: "include"`.
- Frontend route tests cover catalog loading, success, empty, and error states.
- Frontend route tests cover challenge card anti-leak behavior when mock data contains extra private keys.
- Frontend route tests cover challenge detail public examples and stats.
- Frontend route tests cover leaderboard aggregate metrics and anti-leak behavior for private identity fields.
- Frontend route tests cover catalog pagination URL state.
- Source security tests assert no `dangerouslySetInnerHTML`, no browser-readable auth token APIs, no frontend `RegExp` construction, reduced-motion CSS, and no raw `fetch` outside the API client boundary.
- E2E tests cover landing CTA navigation, public catalog data, challenge detail navigation, public leaderboard data, keyboard/click pagination, mobile catalog/leaderboard overflow, rendered anti-leak checks, and browser storage auth-token checks.
- GOAL 08.1 must keep backend API, database schema, auth/session/cookie behavior, and regex semantics unchanged.

Current frontend test count after GOAL 08.1: 20 tests.
Current E2E count after GOAL 08.1: 30 tests.

## GOAL 08.2 frontend auth UI checks

- Frontend tests cover auth API functions, `GET /api/auth/me` guest handling on `401`, login/register/logout payloads, and `credentials: "include"` through the API client.
- Frontend tests cover login required-field validation, successful login payloads, generic invalid-credential errors, and no password storage/logging behavior at the component boundary.
- Frontend tests cover register validation for username, email, display name, password rules, mismatched confirmation, duplicate-account errors, and omission of `confirmPassword` from backend payloads.
- Frontend route tests cover guest/authenticated header states, logout updating current-user query state, auth pages for already-authenticated users, and `/create` guest/authenticated placeholder states.
- Source security tests assert no `dangerouslySetInnerHTML`, no production frontend `document.cookie`, no browser auth-token storage APIs, no frontend `RegExp` construction, and no raw `fetch` outside the API client boundary.
- E2E tests cover real login form rendering, seeded demo login, session restoration through UI state, logout UI clearing, register form rendering, mismatched password validation, deterministic successful registration, duplicate account conflict, invalid login, auth-aware `/create`, public catalog/leaderboard access while logged out, rendered anti-leak checks, and storage anti-token checks after login/logout.
- GOAL 08.2 must keep backend API, database schema, auth/session/cookie behavior, CSRF behavior, and regex semantics unchanged.

Current frontend test count after GOAL 08.2: 31 tests.
Current E2E count after GOAL 08.2: 36 tests.

## Final delivery target

The final project must include at least 10 meaningful E2E tests. Later milestones should add tests for:

- IDOR prevention.
- Deterministic seed data.
