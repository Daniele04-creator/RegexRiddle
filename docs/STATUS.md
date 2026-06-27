# Status

## Current milestone

GOAL 05.5: delivery directory restructure.

## Implemented

- pnpm workspace root.
- `frontend` React/Vite/TypeScript smoke app.
- `backend` Fastify/TypeScript health API, Prisma, auth, and regex engine.
- `e2e` Playwright smoke, public API, auth API, and attempt API tests.
- `packages/shared` shared constants and public API DTO types.
- Delivery-facing directories are now `backend`, `frontend`, and `e2e` while the repository remains one pnpm workspace.
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
- Official aggregate attempt semantics:
  - `positiveMatched` counts POSITIVE controls matched by the submitted regex.
  - `negativeMatched` counts NEGATIVE controls matched by the submitted regex.
  - `isCorrect` requires all positives and zero negatives.
- Protected `POST /api/challenges/:id/attempts`.
- CSRF guard v1 for protected JSON mutations through `X-RegexRiddle-CSRF: 1`.
- Attempt persistence with aggregate public DTO response.
- Solution creation for correct attempts.
- Author self-attempt block.
- Already-solved attempt block.
- Invalid or unsupported submitted regex rejection without attempt persistence.
- Local Docker image tags `regexriddle-api:dev` and `regexriddle-web:dev`.

## Not implemented

- Frontend authentication UI.
- Frontend attempt UI.
- Challenge creation, update, or deletion.
- Leaderboard.

## Verification status

Verified on 2026-06-27:

- `git switch main`: PASS, already on `main`.
- `git pull --ff-only`: PASS, already up to date.
- `pnpm install`: PASS, lockfile updated to importer paths `backend`, `frontend`, and `e2e`; no dependency upgrades.
- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, frontend 1 test, backend 46 tests.
- `pnpm build`: PASS.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` built from `backend/Dockerfile` and `frontend/Dockerfile`; db, API, and web containers started.
- `pnpm e2e`: PASS, 12 Playwright tests.
- `pnpm check`: PASS.
- `docker compose ps`: PASS, db healthy and API/web running on the existing ports.
- Old path audit: PASS, no obsolete nested app-directory references remain outside ignored/generated paths.
- Lockfile audit: PASS, no obsolete nested app-directory importer paths remain.
- `git ls-files apps`: PASS, no tracked files remain under `apps/`.
- `git grep -n "new RegExp\|RegExp(" -- . ':!node_modules' ':!dist'`: PASS before the restructure; no source code constructs JavaScript `RegExp` for user patterns.

Smoke attempt response summary:

- `challengeId=aaaaaaaa-0006-4000-8000-000000000006`
- `attemptNumber=1`
- `positiveMatched=3`
- `positiveTotal=3`
- `negativeMatched=3`
- `negativeTotal=3`
- `isCorrect=false`
- `solved=false`

The smoke response did not include `secretPattern`, `ChallengeControl.value`, `controls`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, token values, or cookie values.
