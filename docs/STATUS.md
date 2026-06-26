# Status

## Current milestone

GOAL 01: PostgreSQL/Prisma data layer.

## Implemented

- pnpm workspace root.
- `apps/web` React/Vite/TypeScript smoke app.
- `apps/api` Fastify/TypeScript health API.
- `apps/e2e` Playwright smoke tests.
- `packages/shared` minimal shared constants and types.
- Docker Compose with web, API, and PostgreSQL services.
- Initial documentation for architecture, security, tests, API, database planning, design, decisions, plans, and oral defense.
- Prisma schema with `User`, `Session`, `Challenge`, `ChallengeControl`, `Attempt`, and `Solution`.
- Versioned initial migration.
- Deterministic demo seed.
- Database verification script.

## Not implemented

- Authentication.
- Challenge model.
- Attempt engine.
- Leaderboard.
- Regex evaluation.
- Authentication endpoints.
- Challenge API endpoints.

## Verification status

Verified on 2026-06-27:

- `pnpm install`: PASS.
- `docker compose up -d db`: PASS.
- `pnpm db:generate`: PASS.
- `pnpm db:migrate`: PASS, migration `20260626222148_init`.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.
- `pnpm build`: PASS.
- `pnpm e2e`: PASS, 2 smoke tests.
- `pnpm check`: PASS.
- `docker compose up --build -d`: PASS.
- `GET http://127.0.0.1:4000/health`: PASS.
- `GET http://127.0.0.1:5173`: PASS, response contains `RegexRiddle`.

Docker services verified:

- `db`: `postgres:18.1-bookworm`, host port `55432`, healthy.
- `api`: `regexriddle-api:goal-01`, running on port 4000.
- `web`: `regexriddle-web:goal-01`, running on port 5173.
