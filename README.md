# RegexRiddle

RegexRiddle is a Web Technologies exam project scaffold. This repository is intentionally at GOAL 00: infrastructure only, with no challenge engine, authentication, Prisma schema, leaderboard, or regex evaluation implemented yet.

## Stack

- Monorepo: pnpm workspace
- Web app: React, Vite, TypeScript
- API: Fastify, TypeScript
- Shared package: minimal shared constants and types
- E2E: Playwright
- Local infrastructure: Docker Compose with PostgreSQL, API, and web services

## Windows quickstart

Prerequisites:

- Node.js 24.14.0 or newer
- Corepack enabled
- Docker Desktop, only for the Docker workflow

```powershell
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm install
pnpm check
```

Run the local development servers in two terminals:

```powershell
pnpm dev:api
```

```powershell
pnpm dev:web
```

Useful local URLs:

- Web: http://127.0.0.1:5173
- API health: http://127.0.0.1:4000/health

## Docker quickstart

Use `.env.example` as the list of local variables. The example values are development-only placeholders and must not be reused as production secrets.

```powershell
docker compose up --build
```

Docker URLs:

- Web: http://127.0.0.1:5173
- API health: http://127.0.0.1:4000/health
- PostgreSQL: 127.0.0.1:5432

## Root commands

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm check
pnpm db:migrate
pnpm db:seed
```

`db:migrate` and `db:seed` are placeholders until GOAL 01 introduces the database model and deterministic seed data.

## Scope guard

This repository must not evaluate user-provided regex with JavaScript `RegExp`. Future regex evaluation must happen server-side with full-match semantics and a RE2-compatible engine.
