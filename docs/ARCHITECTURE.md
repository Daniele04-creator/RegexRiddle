# Architecture

## Repository layout

- `apps/web`: React, Vite, and TypeScript SPA.
- `apps/api`: Fastify and TypeScript API.
- `apps/e2e`: Playwright smoke tests.
- `packages/shared`: minimal shared constants and TypeScript contracts.
- `docs`: project documentation and exam support notes.

## Runtime shape

```text
browser -> apps/web -> apps/api -> PostgreSQL
```

GOAL 00 only exposes `GET /health`. PostgreSQL is present in Docker Compose so later milestones can add Prisma and deterministic seed data without changing the infrastructure shape.

## Build shape

- The shared package builds first.
- The API compiles TypeScript to `apps/api/dist`.
- The web app builds static assets to `apps/web/dist`.
- E2E starts the API and web development servers through Playwright `webServer`.
- The Docker web container serves `apps/web/dist` with a small Node static server, avoiding runtime dependency on Vite or pnpm.

## Future architecture notes

- Domain validation belongs on the server.
- Secret regexes and secret checks must never be sent to the browser.
- The future database layer should stay behind API services, not inside route handlers.
