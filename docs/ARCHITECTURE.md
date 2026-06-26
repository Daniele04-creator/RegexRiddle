# Architecture

## Repository layout

- `apps/web`: React, Vite, and TypeScript SPA.
- `apps/api`: Fastify, TypeScript API, and Prisma data layer.
- `apps/e2e`: Playwright smoke tests.
- `packages/shared`: minimal shared constants and TypeScript contracts.
- `docs`: project documentation and exam support notes.

## Runtime shape

```text
browser -> apps/web -> apps/api -> PostgreSQL
```

GOAL 03 exposes `GET /health`, public challenge read endpoints, and backend auth endpoints. PostgreSQL is present in Docker Compose and Prisma manages the versioned schema under `apps/api/prisma`.

## Build shape

- The shared package builds first.
- The API compiles TypeScript to `apps/api/dist`.
- Prisma Client is generated into `apps/api/src/generated/prisma` and is ignored by Git.
- The web app builds static assets to `apps/web/dist`.
- E2E starts the API and web development servers through Playwright `webServer`.
- The Docker web container serves `apps/web/dist` with a small Node static server, avoiding runtime dependency on Vite or pnpm.

## Data layer

- Prisma schema: `apps/api/prisma/schema.prisma`.
- Migration directory: `apps/api/prisma/migrations`.
- Seed script: `apps/api/prisma/seed.ts`.
- Verification script: `apps/api/prisma/verify.ts`.
- Host database URL uses port `55432`.
- Compose services use internal host `db` and port `5432`.

## API layering

- Route handlers live under `apps/api/src/routes`.
- Domain read logic lives under `apps/api/src/services`.
- Public serializers live under `apps/api/src/dto`.
- Session helpers live under `apps/api/src/auth`.
- Request parsing and validation live under `apps/api/src/validation`.
- Shared response contracts live in `packages/shared`.

Challenge routes must return public DTOs only. They must not return raw Prisma challenge records.

Auth routes must return public user DTOs only. They use opaque session cookies and store only hashed session tokens in PostgreSQL.

## Future architecture notes

- Domain validation belongs on the server.
- Secret regexes and secret checks must never be sent to the browser.
- The database layer should stay behind API services, not inside route handlers.
