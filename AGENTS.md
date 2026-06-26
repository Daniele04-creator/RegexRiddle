# RegexRiddle Agent Instructions

## Operating rules

- Work in this repository root. Do not create a nested `RegexRiddle/` directory.
- Keep GOAL 00 as scaffold-only infrastructure.
- Do not implement authentication, Prisma schema, challenge creation, attempt engine, leaderboard, or regex evaluation until a later goal explicitly requests it.
- Do not introduce large dependencies without a clear goal requirement and human confirmation.
- Do not commit, push, branch, checkout, stash, or reset unless the user explicitly asks.
- Do not edit real `.env` files or store secrets in code, logs, tests, documentation, or generated files.

## Stack

- Package manager: pnpm workspace
- Web: React, Vite, TypeScript
- API: Fastify, TypeScript
- Shared code: `packages/shared`
- E2E: Playwright
- Database service: PostgreSQL in Docker Compose

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

Ask before changing the stack, monorepo shape, Docker Compose architecture, security invariants, or before adding auth, Prisma schema, regex evaluation, external services, or large UI/template dependencies.
