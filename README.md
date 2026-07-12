# RegexRiddle

RegexRiddle is a full-stack web application for regular-expression puzzles.
Authors create challenges with a secret regular expression, public examples,
and private control strings. Solvers submit their own expression and receive
only aggregate match counts.

## Technology

- Backend: Fastify, TypeScript, Prisma ORM, PostgreSQL, Argon2id, and RE2 via
  `re2-wasm`.
- Frontend: Angular, TypeScript, RxJS, and responsive CSS.
- End-to-end tests: Playwright.
- Tooling: pnpm workspace and Docker Compose for local PostgreSQL.

## Requirements

- Node.js `>=24.14.0`
- pnpm `>=11.7.0`
- Docker Desktop for the recommended local PostgreSQL setup

## Local setup

Install dependencies:

```powershell
pnpm install
```

Copy the example configuration and use local development values only:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example backend/.env
```

The root `.env` is used by Docker Compose and the E2E runner. The backend copy
is loaded when `pnpm dev:backend` runs with `backend/` as its working directory.
Both `.env` files are Git-ignored. Never commit passwords, tokens, cookies, or
other secrets.

Start PostgreSQL:

```powershell
docker compose up -d db
```

Generate the Prisma client and apply the migrations from the host:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

The seed creates the three Italian demo users and the deterministic challenges,
attempts, solutions, and leaderboard data used by the local demo and E2E tests.

## Run the application

Start the backend API:

```powershell
pnpm dev:backend
```

Start the frontend SPA in another terminal:

```powershell
pnpm dev:frontend
```

The default frontend URL is `http://127.0.0.1:5173`; the default backend URL is
`http://127.0.0.1:4000`.

For the complete Docker stack, run `docker compose up --build` and open
`http://127.0.0.1:5174`. The backend stays inside the Compose network and is
reached through the frontend's same-origin `/api` proxy.

## Validation

Run individual checks when needed:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm e2e
```

`pnpm test` is an alias for `pnpm e2e`. The maintained quality gate is:

```powershell
pnpm quality
```

Run the complete project verification before delivery:

```powershell
pnpm check
```

## Security

- Secret regular expressions and control strings are never returned to clients.
- Sessions are server-side and use opaque `HttpOnly` and `SameSite` cookies.
- Passwords are hashed with Argon2id.
- User expressions are evaluated server-side with RE2 to reduce ReDoS risk.
- Protected endpoints require authentication, and JSON mutations are validated
  server-side.

## Delivery

The final archive must include the backend and frontend source code, this
README, and the required one-page PDF with the student's name, surname,
matricola, selected project, and backend/frontend technologies.

Create the archive manually:

1. Run `pnpm check` and verify the complete demo locally.
2. Copy only the required delivery files into a clean temporary folder.
3. Remove dependencies, caches, generated output, test artifacts, screenshots,
   nested archives, temporary files, and real environment files.
4. Create a ZIP from that clean folder with File Explorer or
   `Compress-Archive`.
5. Name it `${matricola}-${nome}-${cognome}.zip`.

At minimum, exclude:

- `node_modules/`
- `.angular/`, `dist/`, `coverage/`, and `delivery/`
- `output/`, `e2e/output/`, `e2e/test-results/`, and
  `e2e/playwright-report/`
- `.env`, `.env.*` except `.env.example`, logs, and other secrets
- screenshots, nested archives, and temporary files

Submit the ZIP through the university Filesender service with subject
`[TECWEB] Consegna progetto 25/26 - ${matricola} ${nome} ${cognome}` and state
the selected project in the message body.
