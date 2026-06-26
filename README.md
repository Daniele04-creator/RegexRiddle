# RegexRiddle

RegexRiddle is a Web Technologies exam project scaffold. The repository currently includes the GOAL 01 data layer: PostgreSQL, Prisma schema, a versioned initial migration, deterministic demo seed data, and a database verification script. It still has no challenge API, authentication endpoints, leaderboard, or regex evaluation engine.

## Stack

- Monorepo: pnpm workspace
- Web app: React, Vite, TypeScript
- API: Fastify, TypeScript
- ORM: Prisma with PostgreSQL
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
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:verify
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
- PostgreSQL from host tools: 127.0.0.1:55432

## Docker quickstart

Use `.env.example` as the list of local variables. The example values are development-only placeholders and must not be reused as production secrets.

```powershell
docker compose up --build
```

Docker URLs:

- Web: http://127.0.0.1:5173
- API health: http://127.0.0.1:4000/health
- PostgreSQL from host tools: 127.0.0.1:55432
- PostgreSQL from Compose services: `db:5432`

## Root commands

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:verify
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm check
```

## Database workflow

`DATABASE_URL` is documented in `.env.example`. The default local scripts also use:

```text
postgresql://regexriddle:regexriddle_dev_password_change_me@127.0.0.1:55432/regexriddle_dev
```

Port `55432` is used on the host to avoid collisions with local PostgreSQL installations on `5432`. Docker Compose services still reach PostgreSQL through `db:5432`.

The seed creates three demo users:

- `demo_creator`
- `demo_player`
- `daniele_demo`

All demo users use `Password123!`. This is demo-only data and must not be reused as a production credential.

`pnpm db:verify` checks seeded counts and control coverage without printing secret regex patterns or secret control values.

## Scope guard

This repository must not evaluate user-provided regex with JavaScript `RegExp`. Future regex evaluation must happen server-side with full-match semantics and a RE2-compatible engine.
