# Status

## Current milestone

GOAL 02: public read-only challenge APIs.

## Implemented

- pnpm workspace root.
- `apps/web` React/Vite/TypeScript smoke app.
- `apps/api` Fastify/TypeScript health API.
- `apps/e2e` Playwright smoke and public API tests.
- `packages/shared` shared constants and public API DTO types.
- Docker Compose with web, API, and PostgreSQL services.
- Initial documentation for architecture, security, tests, API, database planning, design, decisions, plans, and oral defense.
- Prisma schema with `User`, `Session`, `Challenge`, `ChallengeControl`, `Attempt`, and `Solution`.
- Versioned initial migration.
- Deterministic demo seed.
- Database verification script.
- Public read-only `GET /api/challenges`.
- Public read-only `GET /api/challenges/:id`.
- Server-side validation for public challenge query and route parameters.
- Explicit public DTO serializers for challenge list and detail responses.
- Aggregate public stats for attempts and solutions.

## Not implemented

- Authentication.
- Challenge creation, update, or deletion.
- Attempt submission.
- Attempt engine.
- Leaderboard.
- Regex evaluation.

## Verification status

Verified on 2026-06-27:

- `git status`: PASS, branch `main`, GOAL 02 changes uncommitted.
- `pnpm install`: PASS, already up to date.
- `docker compose up -d db`: PASS.
- `pnpm db:generate`: PASS, Prisma Client generated.
- `pnpm db:migrate`: PASS, database already in sync.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, web 1 test, API 7 tests.
- `pnpm build`: PASS.
- `pnpm e2e`: PASS, 4 Playwright tests.
- `pnpm check`: PASS.
- `docker compose up --build -d`: PASS.
- `GET http://127.0.0.1:4000/health`: PASS, returns `200`.
- `GET http://127.0.0.1:4000/api/challenges`: PASS, returns `200`.
- `GET http://127.0.0.1:4000/api/challenges/aaaaaaaa-0001-4000-8000-000000000001`: PASS, returns `200`.
- Runtime anti-leak audit for `GET /api/challenges` and `GET /api/challenges/:id`: PASS, no `secretPattern`, `controls`, `value`, `proposedPattern`, `passwordHash`, or `sessionTokenHash` response keys.

Docker services verified:

- `db`: `postgres:18.1-bookworm`, host port `55432`, healthy.
- `api`: `regexriddle-api:goal-01`, running on port 4000.
- `web`: `regexriddle-web:goal-01`, running on port 5173.
