# RegexRiddle

RegexRiddle is a Web Technologies exam project scaffold. The repository currently includes the GOAL 04 safe regex engine: PostgreSQL, Prisma schema, deterministic demo seed data, public challenge DTOs, read-only challenge endpoints, backend auth, and an internal server-side RE2-compatible evaluator. It still has no frontend auth UI, challenge mutation API, leaderboard, or attempt submission endpoint.

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
- Auth API: http://127.0.0.1:4000/api/auth/me
- Public challenges API: http://127.0.0.1:4000/api/challenges
- PostgreSQL from host tools: 127.0.0.1:55432

## Docker quickstart

Use `.env.example` as the list of local variables. The example values are development-only placeholders and must not be reused as production secrets.

```powershell
docker compose up --build
```

Docker URLs:

- Web: http://127.0.0.1:5173
- API health: http://127.0.0.1:4000/health
- Auth API: http://127.0.0.1:4000/api/auth/me
- Public challenges API: http://127.0.0.1:4000/api/challenges
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

## Public API smoke

After starting the API, these read-only endpoints expose only public challenge data:

```powershell
curl http://127.0.0.1:4000/health
curl "http://127.0.0.1:4000/api/challenges?limit=20&page=1"
curl http://127.0.0.1:4000/api/challenges/aaaaaaaa-0001-4000-8000-000000000001
```

Public challenge responses must not include `secretPattern`, `ChallengeControl.value`, or `Attempt.proposedPattern`.

## Auth API smoke

The backend exposes auth endpoints only; no frontend auth UI exists yet.

Demo credentials:

- Username: `demo_player`
- Email: `demo_player@example.test`
- Password: `Password123!`

Use a cookie jar for local smoke tests:

```powershell
curl.exe -i -c .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -d '{"usernameOrEmail":"demo_player","password":"Password123!"}' http://127.0.0.1:4000/api/auth/login
curl.exe -i -b .\.tmp-auth-cookies.txt http://127.0.0.1:4000/api/auth/me
curl.exe -i -b .\.tmp-auth-cookies.txt -c .\.tmp-auth-cookies.txt -X POST http://127.0.0.1:4000/api/auth/logout
```

Auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

The session token is returned only as the `rr_session` cookie. API responses must not include `passwordHash`, `sessionTokenHash`, token values, or cookie values.

This public review repository must never contain real secrets. `.env.example` values and demo credentials are development-only placeholders.

## Safe regex engine

GOAL 04 adds an internal backend regex engine based on `re2-wasm`. It is not exposed through a public attempt endpoint yet.

- Evaluation happens server-side only.
- User candidate patterns are compiled with RE2-compatible semantics, not JavaScript `RegExp`.
- Full match uses RE2 absolute text anchors: `\A(?:pattern)\z`.
- Supported user flags are `i` and `m`; `u` is added internally because `re2-wasm` requires Unicode mode.
- Attempt-style evaluation returns only aggregate counts, never control values, secret patterns, or candidate patterns.

## Scope guard

This repository must not evaluate user-provided regex with JavaScript `RegExp`. Regex evaluation must stay server-side with full-match semantics and a RE2-compatible engine.
