# Status

## Current milestone

GOAL 00: initial repository skeleton.

## Implemented

- pnpm workspace root.
- `apps/web` React/Vite/TypeScript smoke app.
- `apps/api` Fastify/TypeScript health API.
- `apps/e2e` Playwright smoke tests.
- `packages/shared` minimal shared constants and types.
- Docker Compose with web, API, and PostgreSQL services.
- Initial documentation for architecture, security, tests, API, database planning, design, decisions, plans, and oral defense.

## Not implemented

- Authentication.
- Prisma schema.
- Database migrations.
- Seed data.
- Challenge model.
- Attempt engine.
- Leaderboard.
- Regex evaluation.

## Verification status

Verified on 2026-06-26:

- `pnpm install`: PASS.
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

- `db`: `postgres:18.1-bookworm`, healthy.
- `api`: `regexriddle-api:goal-00`, running on port 4000.
- `web`: `regexriddle-web:goal-00`, running on port 5173.
