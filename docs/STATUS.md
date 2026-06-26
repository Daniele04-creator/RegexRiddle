# Status

## Current milestone

GOAL 03: backend session authentication.

## Implemented

- pnpm workspace root.
- `apps/web` React/Vite/TypeScript smoke app.
- `apps/api` Fastify/TypeScript health API.
- `apps/e2e` Playwright smoke, public API, and auth API tests.
- `packages/shared` shared constants and public API DTO types.
- Docker Compose with web, API, and PostgreSQL services.
- Prisma schema with `User`, `Session`, `Challenge`, `ChallengeControl`, `Attempt`, and `Solution`.
- Versioned initial migration.
- Deterministic demo seed.
- Database verification script.
- Public read-only `GET /api/challenges`.
- Public read-only `GET /api/challenges/:id`.
- Backend auth `POST /api/auth/register`.
- Backend auth `POST /api/auth/login`.
- Backend auth `POST /api/auth/logout`.
- Backend auth `GET /api/auth/me`.
- Argon2id password hashing and verification.
- Opaque server-side sessions with `rr_session` cookie.
- SHA-256 hashing for stored session tokens.
- `HttpOnly`, `SameSite=Lax`, `Path=/`, 7-day session cookies.
- Explicit public DTO serializers for challenge and auth responses.
- Server-side validation for challenge and auth inputs.
- Local Docker image tags `regexriddle-api:dev` and `regexriddle-web:dev`.

## Not implemented

- Frontend authentication UI.
- Challenge creation, update, or deletion.
- Attempt submission.
- Attempt engine.
- Leaderboard.
- Regex evaluation.

## Verification status

Verified on 2026-06-27:

- `git status`: PASS, branch `main`, GOAL 03 changes present before commit.
- `pnpm install`: PASS, already up to date.
- `docker compose up -d db`: PASS.
- `pnpm db:generate`: PASS, Prisma Client generated.
- `pnpm db:migrate`: PASS, database already in sync.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, web 1 test, API 17 tests.
- `pnpm build`: PASS.
- `pnpm e2e`: PASS, 8 Playwright tests.
- `pnpm check`: PASS.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev`.
- `curl.exe` auth smoke with cookie jar: PASS, health `200`, challenges `200`, login `200`, me `200`, invalid login `401`, logout `200`, me after logout `401`, malformed JSON `400`.
- Runtime auth anti-leak audit: PASS, no `passwordHash`, `sessionTokenHash`, `token`, `sessionToken`, `secretPattern`, `controls`, or `proposedPattern` response keys; cookie value not present in JSON.
