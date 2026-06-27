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

## Final delivery target

The final project must include at least 10 meaningful E2E tests. Later milestones should add tests for:

- Leaderboard visibility.
- IDOR prevention.
- Deterministic seed data.
