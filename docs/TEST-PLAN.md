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

`pnpm test` remains independent from a running database. Database checks are explicit commands because they require PostgreSQL.

## Final delivery target

The final project must include at least 10 meaningful E2E tests. Later milestones should add tests for:

- Login and logout.
- Challenge listing.
- Challenge detail authorization.
- Valid attempt submission.
- Invalid attempt submission.
- Full-match behavior.
- Rejection of unsupported regex dialect features.
- Leaderboard visibility.
- IDOR prevention.
- Deterministic seed data.
