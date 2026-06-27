# Architecture

## Repository layout

- `frontend`: React, Vite, and TypeScript SPA.
- `backend`: Fastify, TypeScript API, Prisma data layer, auth, and regex engine.
- `e2e`: Playwright smoke and API workflow tests.
- `packages/shared`: minimal shared constants and TypeScript contracts.
- `docs`: project documentation and exam support notes.

## Runtime shape

```text
browser -> frontend -> backend -> PostgreSQL
```

GOAL 07 keeps the GOAL 05.5 delivery directory layout and adds the public solver leaderboard. PostgreSQL is present in Docker Compose and Prisma manages the versioned schema under `backend/prisma`. The regex evaluation engine remains backend-only and is reachable only through authorized service logic.

## Build shape

- The shared package builds first.
- The API compiles TypeScript to `backend/dist`.
- Prisma Client is generated into `backend/src/generated/prisma` and is ignored by Git.
- The web app builds static assets to `frontend/dist`.
- E2E starts the API and web development servers through Playwright `webServer`.
- The Docker web container serves `frontend/dist` with a small Node static server, avoiding runtime dependency on Vite or pnpm.

## Data layer

- Prisma schema: `backend/prisma/schema.prisma`.
- Migration directory: `backend/prisma/migrations`.
- Seed script: `backend/prisma/seed.ts`.
- Verification script: `backend/prisma/verify.ts`.
- Host database URL uses port `55432`.
- Compose services use internal host `db` and port `5432`.

## API layering

- Route handlers live under `backend/src/routes`.
- Domain read logic lives under `backend/src/services`.
- Public serializers live under `backend/src/dto`.
- Session helpers live under `backend/src/auth`.
- Regex engine helpers live under `backend/src/regex`.
- Mutation guards live under `backend/src/security`.
- Request parsing and validation live under `backend/src/validation`.
- Shared response contracts live in `packages/shared`.

Challenge routes must return public DTOs only. They must not return raw Prisma challenge records.

Auth routes must return public user DTOs only. They use opaque session cookies and store only hashed session tokens in PostgreSQL.

Regex helpers must return aggregate result DTOs only. They must not return secret patterns, candidate patterns, or per-control values.

Attempt submission uses a route/service/DTO split. The route handles auth, CSRF v1, route/body validation, and status mapping. The service loads secret controls with explicit Prisma `select`, evaluates the candidate through `re2-wasm`, stores `Attempt`, creates `Solution` only on success, and returns an aggregate DTO that excludes `Attempt.proposedPattern`.

Challenge creation uses the same route/service/DTO split. `POST /api/challenges` requires a valid `rr_session`, `Content-Type: application/json`, and `X-RegexRiddle-CSRF: 1`. The route rejects unknown body keys and mass-assignment attempts before calling the service. The service derives `authorId` only from the authenticated session user, validates the secret regex, public examples, and secret controls with the server-side RE2 full-match engine, then creates `Challenge` and `ChallengeControl` rows transactionally. The response uses the existing public challenge detail DTO and never includes `Challenge.secretPattern` or control values.

Leaderboard routes are public read-only. `GET /api/leaderboard` validates only `page` and `limit`, aggregates `Solution` rows by `userId`, fetches only `User.username` and `User.displayName`, sorts by solved count descending, average attempts ascending, and username ascending, then returns a paginated public DTO. The leaderboard service does not read challenge secrets, control values, submitted patterns, password hashes, session hashes, or user emails.

## Future architecture notes

- Domain validation belongs on the server.
- Secret regexes and secret checks must never be sent to the browser.
- The database layer should stay behind API services, not inside route handlers.
