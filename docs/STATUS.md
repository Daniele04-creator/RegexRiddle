# Status

## Current milestone

GOAL 06: protected challenge creation with ownership.

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
- Protected `POST /api/challenges`.
- CSRF guard v1 for protected JSON mutations through `X-RegexRiddle-CSRF: 1`.
- Challenge creation ownership from the authenticated `rr_session` user.
- Challenge creation validation for unknown keys, mass assignment, public examples, secret controls, and RE2-compatible full-match regex semantics.
- Transactional challenge and control persistence.
- Public challenge detail DTO response for creation without secret regexes or control values.
- Attempt persistence with aggregate public DTO response.
- Solution creation for correct attempts.
- Author self-attempt block.
- Already-solved attempt block.
- Invalid or unsupported submitted regex rejection without attempt persistence.
- Local Docker image tags `regexriddle-api:dev` and `regexriddle-web:dev`.

## Not implemented

- Frontend authentication UI.
- Frontend attempt UI.
- Frontend challenge creation UI.
- Challenge update or deletion.
- Leaderboard.

## Verification status

Verified on 2026-06-27:

- `git switch main`: PASS, already on `main`.
- `git pull --ff-only`: PASS, already up to date.
- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, frontend 1 test, backend 67 tests.
- `pnpm build`: PASS.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` built from `backend/Dockerfile` and `frontend/Dockerfile`; db, API, and web containers started.
- `pnpm e2e`: PASS, 17 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 17 E2E tests.
- `docker compose ps`: PASS, db healthy and API/web running on the existing ports.
- `rg -n "new RegExp|RegExp\(" backend frontend packages e2e`: PASS, no matches.
- Sensitive-field audit: PASS, `secretPattern`, `ChallengeControl`, `proposedPattern`, `sessionTokenHash`, and `passwordHash` appear only in docs, tests, shared request contracts, or internal backend auth/service code.
- Ownership/raw-field audit: PASS, `authorId`, `createdAt`, `updatedAt`, and `_count` appear in explicit selects, validation/tests, or the protected create service; public responses still use DTO serializers.
- Old path audit: PASS, no obsolete `apps/api`, `apps/web`, or `apps/e2e` references remain outside ignored/generated paths.

Smoke challenge creation response summary:

- `POST /api/challenges` returned `201 Created`.
- Response included `Location: /api/challenges/:id`.
- The persisted `Challenge.authorId` matched the authenticated `rr_session` user.
- The response used the public challenge detail DTO with `stats.attemptsTotal=0` and `stats.solutionsTotal=0`.

The challenge creation response and public detail response did not include `secretPattern`, `ChallengeControl.value`, `controls`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, token values, or cookie values.
