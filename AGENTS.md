# RegexRiddle Agent Instructions

## Operating rules

- Work in this repository root. Do not create a nested `RegexRiddle/` directory.
- Keep each goal tightly scoped.
- GOAL 01 may add Prisma schema, migrations, seed, and database verification because it explicitly requests the data layer.
- GOAL 06 may add protected challenge creation because it explicitly requests that API.
- GOAL 07 may add the public solver leaderboard because it explicitly requests that API.
- Do not implement additional authentication endpoints, challenge edit/delete APIs, profile/statistics pages, or frontend authoring UI until a later goal explicitly requests them.
- Do not introduce large dependencies without a clear goal requirement and human confirmation.
- Do not commit, push, branch, checkout, stash, or reset unless the user explicitly asks.
- Do not edit real `.env` files or store secrets in code, logs, tests, documentation, or generated files.

## Stack

- Package manager: pnpm workspace
- Frontend: React, Vite, TypeScript in `frontend/`
- Backend API: Fastify, TypeScript in `backend/`
- Shared code: `packages/shared`
- E2E: Playwright in `e2e/`
- Database service: PostgreSQL in Docker Compose

## Layout

- `backend/`: Fastify API, Prisma, auth, regex engine, seed, and database verification.
- `frontend/`: React/Vite SPA.
- `e2e/`: Playwright E2E tests.
- `packages/shared/`: shared DTOs and TypeScript contracts.

## Security invariants

- Never use JavaScript `RegExp` to evaluate regex supplied by users.
- Future regex matching must use full-match semantics and a RE2-compatible engine on the server side.
- Never expose original challenge regexes or secret checks to solver clients.
- Never log secret regexes, secret checks, credentials, tokens, or session identifiers.
- Validate inputs server-side and authorize every protected endpoint.
- Prevent IDOR and mass assignment when domain APIs are introduced.
- Future auth must use opaque server-side sessions with `HttpOnly` and `SameSite` cookies.
- Future password hashing must use Argon2id.

## Required checks

Run relevant checks before reporting implementation completion:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm check
```

If Docker is in scope, also run:

```powershell
docker compose up --build
```

If a check cannot run, report the exact technical reason.

## Human gates

Ask before changing the stack, monorepo shape, Docker Compose architecture, security invariants, or before adding auth, regex evaluation, external services, or large UI/template dependencies.
