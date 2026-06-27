# Status

## Current milestone

GOAL 04: safe server-side regex engine.

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
- Argon2id password hashing and opaque server-side sessions.
- Safe internal regex engine based on `re2-wasm`.
- Full-match semantics through RE2 `\A...\z` absolute text anchors.
- Explicit user flag validation for `i` and `m`.
- Aggregate candidate evaluation for future attempt submission.
- Challenge control verification for future challenge creation.
- Local Docker image tags `regexriddle-api:dev` and `regexriddle-web:dev`.

## Not implemented

- Frontend authentication UI.
- Challenge creation, update, or deletion.
- Public attempt submission endpoint.
- Frontend attempt UI.
- Leaderboard.

## Verification status

Verified on 2026-06-27:

- `git status`: PASS, branch `main`, GOAL 04 changes present before commit.
- `pnpm install`: PASS, lockfile already up to date.
- `docker compose up -d db`: PASS.
- `pnpm db:generate`: PASS, Prisma Client generated.
- `pnpm db:migrate`: PASS, database already in sync.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, web 1 test, API 33 tests.
- `pnpm build`: PASS.
- `pnpm e2e`: PASS, 8 Playwright tests.
- `pnpm check`: PASS.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev`.
- `GET http://127.0.0.1:4000/health`: PASS, returns `200`.
- `GET http://127.0.0.1:4000/api/challenges`: PASS, returns `200`.
- `git grep -n "new RegExp\|RegExp(" -- . ':!node_modules' ':!dist'`: PASS, matches only documentation lines that record this manual check; no source code constructs JavaScript `RegExp` for user patterns.
