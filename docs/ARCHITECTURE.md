# Architecture

## Repository layout

- `frontend`: React, Vite, and TypeScript SPA.
- `backend`: Fastify, TypeScript API, Prisma data layer, auth, and regex engine.
- `e2e`: Playwright smoke and API workflow tests.
- `packages/shared`: minimal shared constants and TypeScript contracts.
- `docs`: project documentation and exam support notes.

## Runtime shape

```text
browser -> frontend SPA -> same-origin proxy -> backend -> PostgreSQL
```

GOAL 08.0 keeps the GOAL 05.5 delivery directory layout and adds the Regex Lab frontend foundation. PostgreSQL is present in Docker Compose and Prisma manages the versioned schema under `backend/prisma`. The regex evaluation engine remains backend-only and is reachable only through authorized service logic.

## Build shape

- The shared package builds first.
- The API compiles TypeScript to `backend/dist`.
- Prisma Client is generated into `backend/src/generated/prisma` and is ignored by Git.
- The web app builds static assets to `frontend/dist`.
- E2E starts the API and web development servers through Playwright `webServer`.
- The Docker web container serves `frontend/dist` with a small Node static server, avoiding runtime dependency on Vite or pnpm.
- The Vite dev server proxies `/api/*` and `/health` to `http://127.0.0.1:4000`.
- The Docker web server proxies `/api/*` and `/health` to `API_ORIGIN`, which Compose sets to `http://api:4000`.

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

## Frontend layering

- `frontend/src/app`: provider and router composition.
- `frontend/src/components/layout`: app shell, header, mobile nav, footer, skip link, and page container.
- `frontend/src/components/marketing`: landing-page foundation components.
- `frontend/src/components/ui`: shadcn/ui source components.
- `frontend/src/features/health`: optional health query using TanStack Query.
- `frontend/src/features/challenges`: public challenge catalog/detail API functions, query hooks, cards, examples, stats, difficulty badges, and pagination controls.
- `frontend/src/features/leaderboard`: public leaderboard API function, query hook, desktop table, and mobile stacked list.
- `frontend/src/lib`: API client, CSRF helper, route metadata, and class merge utility.
- `frontend/src/routes`: public SPA routes, public read-only data pages, and safe placeholders for future write/auth workflows.
- `frontend/src/styles/globals.css`: Tailwind v4 import, shadcn theme variables, Regex Lab tokens, focus, reduced-motion, and touch defaults.

The frontend API client accepts same-origin paths only, sends `credentials: "include"`, supports JSON responses, and has a small CSRF header helper for future protected mutations. It does not read cookies and does not use browser storage for auth.

GOAL 08.1 routes connect public read-only data only. `/challenges` fetches `GET /api/challenges`, `/challenges/:id` fetches `GET /api/challenges/:id`, and `/leaderboard` fetches `GET /api/leaderboard` through TanStack Query and the same-origin API client.

The frontend still does not fetch or render attempt data, auth forms, challenge creation workflows, user emails, user ids, hidden challenge controls, secret regexes, or submitted candidate patterns.

## Future architecture notes

- Domain validation belongs on the server.
- Secret regexes and secret checks must never be sent to the browser.
- The database layer should stay behind API services, not inside route handlers.
