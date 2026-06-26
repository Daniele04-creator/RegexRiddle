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

## Final delivery target

The final project must include at least 10 meaningful E2E tests. Later milestones should add tests for:

- Login and logout.
- Authenticated challenge ownership/authorization.
- Valid attempt submission.
- Invalid attempt submission.
- Full-match behavior.
- Rejection of unsupported regex dialect features.
- Leaderboard visibility.
- IDOR prevention.
- Deterministic seed data.
