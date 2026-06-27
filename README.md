# RegexRiddle

RegexRiddle is a Web Technologies exam project scaffold. The repository currently includes the GOAL 08.5 final UX milestone: PostgreSQL, Prisma schema, deterministic demo seed data, public challenge DTOs, read-only challenge endpoints, public leaderboard, backend auth, protected current-user account settings, an internal server-side RE2-compatible evaluator, `POST /api/challenges`, `POST /api/challenges/:id/attempts`, React/Vite pages connected to the public catalog, challenge detail, leaderboard APIs, real login/register/logout UI, a public `/how-it-works` walkthrough page, a protected `/account` settings page, a protected attempt panel on `/challenges/:id`, and a protected authoring form on `/create`. It still has no profile/statistics, password/email change, uploads, or edit/delete workflows.

## Stack

- Monorepo: pnpm workspace
- Frontend app: React, Vite, TypeScript in `frontend/`
- Frontend UI: Tailwind CSS v4, shadcn/ui, React Router, TanStack Query, Motion for React
- Backend API: Fastify, TypeScript in `backend/`
- ORM: Prisma with PostgreSQL
- Shared package: minimal shared constants and types
- E2E: Playwright in `e2e/`
- Local infrastructure: Docker Compose with PostgreSQL, API, and web services

## Repository layout

```text
backend/          Fastify API, Prisma, auth, regex engine, seed, db verification
frontend/         React/Vite SPA
e2e/              Playwright E2E tests
packages/shared/  shared DTOs and TypeScript contracts
docs/             project documentation and oral-defense notes
```

The repository remains one pnpm workspace monorepo. The top-level `backend/` and `frontend/` directories make the delivery structure explicit for review while `packages/shared/` keeps shared contracts in one place.

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
pnpm dev:backend
```

```powershell
pnpm dev:frontend
```

Useful local URLs:

- Web: http://127.0.0.1:5173
- API health: http://127.0.0.1:4000/health
- Auth API: http://127.0.0.1:4000/api/auth/me
- Public challenges API: http://127.0.0.1:4000/api/challenges
- Public leaderboard API: http://127.0.0.1:4000/api/leaderboard
- Same-origin frontend health proxy: http://127.0.0.1:5173/health
- Frontend public catalog: http://127.0.0.1:5173/challenges
- Frontend how-it-works page: http://127.0.0.1:5173/how-it-works
- Frontend public leaderboard: http://127.0.0.1:5173/leaderboard
- Frontend login: http://127.0.0.1:5173/login
- Frontend register: http://127.0.0.1:5173/register
- Frontend protected challenge creation: http://127.0.0.1:5173/create
- Frontend protected account settings: http://127.0.0.1:5173/account
- Protected current-user account API: http://127.0.0.1:4000/api/auth/me
- Protected challenge creation API: http://127.0.0.1:4000/api/challenges
- Protected attempt API: http://127.0.0.1:4000/api/challenges/{id}/attempts
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
- Public leaderboard API: http://127.0.0.1:4000/api/leaderboard
- Same-origin frontend health proxy: http://127.0.0.1:5173/health
- Frontend public catalog: http://127.0.0.1:5173/challenges
- Frontend how-it-works page: http://127.0.0.1:5173/how-it-works
- Frontend public leaderboard: http://127.0.0.1:5173/leaderboard
- Frontend login: http://127.0.0.1:5173/login
- Frontend register: http://127.0.0.1:5173/register
- Frontend protected challenge creation: http://127.0.0.1:5173/create
- Frontend protected account settings: http://127.0.0.1:5173/account
- Protected current-user account API: http://127.0.0.1:4000/api/auth/me
- Protected challenge creation API: http://127.0.0.1:4000/api/challenges
- Protected attempt API: http://127.0.0.1:4000/api/challenges/{id}/attempts
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

## Frontend foundation

GOAL 08.0 replaces the smoke screen with the Regex Lab SPA foundation:

- Tailwind CSS v4 is wired through `@tailwindcss/vite`.
- shadcn/ui is initialized in `frontend/` with a small component set.
- `DESIGN.md` is the visual source of truth.
- React Router provides routes for `/`, `/how-it-works`, `/challenges`, `/challenges/:id`, `/leaderboard`, `/login`, `/register`, `/create`, `/account`, and fallback `404`.
- TanStack Query is configured for server state.
- React Hook Form, Zod, and `@hookform/resolvers` support the auth, attempt, and authoring forms.
- Motion for React uses the current `motion` package for subtle UI motion.
- The frontend API client uses same-origin relative paths and always sends `credentials: "include"`.
- Vite dev server proxies `/api/*` and `/health` to the backend.
- The production Docker web server proxies `/api/*` and `/health` to `API_ORIGIN`, set to `http://api:4000` in Compose.

GOAL 08.1 connects the public read-only pages:

- `/challenges` reads `GET /api/challenges?page=1&limit=9`.
- `/challenges/:id` reads `GET /api/challenges/:id`.
- `/leaderboard` reads `GET /api/leaderboard?page=1&limit=10`.

TanStack Query owns this server state. Browser calls use same-origin relative API paths through the existing API client, and every request keeps `credentials: "include"` for cookie-compatible auth.

The public UI shows only public examples, public author identity, public solver identity, and aggregate stats. It does not show secret regexes, hidden controls, submitted patterns, emails, user ids, password/session hashes, raw tokens, or cookie values.

GOAL 08.2 connects the frontend authentication experience:

- `/login` posts to `POST /api/auth/login`.
- `/register` posts to `POST /api/auth/register`.
- The header and mobile nav restore the current session through `GET /api/auth/me`.
- Logout posts to `POST /api/auth/logout` and clears the TanStack Query current-user state.
- `/create` is auth-aware: guests see a login-required card, authenticated users see the protected challenge authoring form.

Auth uses the existing opaque server-side session model. The backend sets `rr_session` as an `HttpOnly`/`SameSite=Lax` cookie. The frontend never reads `document.cookie`, never stores auth tokens in `localStorage` or `sessionStorage`, and treats `/api/auth/me` as the source of truth for the current user.

GOAL 08.3 connects the frontend attempt/gameplay experience on `/challenges/:id`:

- guests see login/register CTAs instead of the form;
- challenge authors see a blocked-author message;
- authenticated non-author users can submit a candidate regex and optional `i`/`m` flags;
- the attempt mutation calls `POST /api/challenges/:id/attempts` through the same-origin API client with `credentials: "include"` and `X-RegexRiddle-CSRF: 1`;
- the frontend sends only `pattern` and `flags`;
- feedback shows only aggregate counts for positive and negative controls;
- challenge detail, catalog, and leaderboard queries are invalidated after successful attempts where relevant;
- the frontend still does not evaluate user regex with JavaScript `RegExp`.

GOAL 08.4 connects the frontend challenge creation experience on `/create`:

- guests see login/register CTAs instead of the form;
- authenticated users can create a challenge through `POST /api/challenges`;
- the creation mutation uses the same-origin API client with `credentials: "include"` and `X-RegexRiddle-CSRF: 1`;
- client validation mirrors public metadata lengths, supported `i`/`m` flags, public examples, 3-10 secret controls per kind, duplicate controls, and contradictory controls;
- the browser does not evaluate the secret regex and does not provide a match preview;
- successful creation resets the form and renders only the public challenge detail DTO.

GOAL 08.5 adds final demo and account polish:

- `/how-it-works` explains creators, solvers, full-match semantics, RE2-compatible regexes, flags `i`/`m`, public examples, secret controls, aggregate feedback, leaderboard ranking, and what stays server-only;
- `/account` shows a login/register gate for guests and, for authenticated users, a current-user summary plus scoped settings form;
- authenticated users can update only `displayName`, `bio`, and `avatarUrl`;
- account updates call `PATCH /api/auth/me` with `credentials: "include"` and `X-RegexRiddle-CSRF: 1`;
- username, email, password, profile statistics, uploads, and challenge edit/delete are not implemented in this milestone;
- no Prisma migration or schema change was added.

## Public leaderboard

The backend exposes the public solver leaderboard and the frontend renders it at `/leaderboard`.

```powershell
curl "http://127.0.0.1:4000/api/leaderboard?limit=20&page=1"
```

Leaderboard entries are based on `Solution` rows:

- `solvedCount`: number of solved challenges for the user.
- `averageAttempts`: arithmetic average of `Solution.attemptsUsed`, rounded to 2 decimals.
- `totalAttemptsUsed`: sum of `Solution.attemptsUsed`.

Ranking order:

1. Higher `solvedCount`.
2. Lower `averageAttempts`.
3. `username` ascending.

The endpoint and frontend page are public read-only and do not require auth or CSRF. Responses and UI expose only `username`, `displayName`, and aggregate stats. They must not include user emails, user ids, secret regexes, control values, submitted patterns, password hashes, session hashes, token values, or cookie values.

## Auth UI and API smoke

The backend exposes auth endpoints and the frontend now provides login, registration, logout, and session restoration UI.

Demo credentials:

- Username: `demo_player`
- Email: `demo_player@example.test`
- Password: `Password123!`

Use a cookie jar for local smoke tests:

```powershell
curl.exe -i -c .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -d '{"usernameOrEmail":"demo_player","password":"Password123!"}' http://127.0.0.1:4000/api/auth/login
curl.exe -i -b .\.tmp-auth-cookies.txt http://127.0.0.1:4000/api/auth/me
curl.exe -i -b .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -H "X-RegexRiddle-CSRF: 1" -X PATCH -d '{"displayName":"Daniele Demo","bio":"Preparazione orale di Tecnologie Web.","avatarUrl":"https://example.com/avatar.png"}' http://127.0.0.1:4000/api/auth/me
curl.exe -i -b .\.tmp-auth-cookies.txt -c .\.tmp-auth-cookies.txt -X POST http://127.0.0.1:4000/api/auth/logout
```

Auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

The session token is returned only as the `rr_session` cookie. API responses must not include `passwordHash`, `sessionTokenHash`, token values, or cookie values. Public challenge author and leaderboard DTOs still do not expose email or avatar URL.

Frontend auth requests use same-origin relative paths and `credentials: "include"` through the shared API client. The UI never logs passwords, never puts credentials in URLs, and never persists token material outside the browser-managed HttpOnly cookie.

## Challenge creation API and UI smoke

The backend exposes protected challenge creation, and the frontend consumes it from `/create` for authenticated users.

Challenge creation requires:

- a valid `rr_session` cookie;
- `Content-Type: application/json`;
- `X-RegexRiddle-CSRF: 1`.

Use a cookie jar and create a challenge:

```powershell
curl.exe -i -c .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -d '{"usernameOrEmail":"demo_player","password":"Password123!"}' http://127.0.0.1:4000/api/auth/login
curl.exe -i -b .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -H "X-RegexRiddle-CSRF: 1" -d '{"title":"Italian postal codes","description":"Create a regex that matches valid five-digit Italian postal codes.","difficulty":"EASY","secretPattern":"\\d{5}","flags":"","publicPositiveExample":"80125","publicNegativeExample":"8012A","controls":[{"kind":"POSITIVE","value":"00100"},{"kind":"POSITIVE","value":"20121"},{"kind":"POSITIVE","value":"99999"},{"kind":"NEGATIVE","value":"1234"},{"kind":"NEGATIVE","value":"ABCDE"},{"kind":"NEGATIVE","value":"123456"}]}' http://127.0.0.1:4000/api/challenges
```

The authenticated user from `rr_session` becomes the author. The backend validates the secret regex, public examples, and secret controls server-side with RE2 full-match semantics before saving. Successful responses use the public challenge detail DTO and must not include `secretPattern`, control lists, `ChallengeControl.value`, password hashes, session hashes, token values, or cookie values. The frontend authoring form maps safe UI state to this DTO, resets secret inputs after success, and does not store regexes or controls in browser storage.

## Attempt API and UI smoke

The backend exposes protected attempt submission and the frontend consumes it from the attempt panel on `/challenges/:id`.

Attempt submissions require:

- a valid `rr_session` cookie;
- `Content-Type: application/json`;
- `X-RegexRiddle-CSRF: 1`.

Use a cookie jar and submit an attempt:

```powershell
curl.exe -i -c .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -d '{"usernameOrEmail":"demo_player","password":"Password123!"}' http://127.0.0.1:4000/api/auth/login
curl.exe -i -b .\.tmp-auth-cookies.txt -H "Content-Type: application/json" -H "X-RegexRiddle-CSRF: 1" -d '{"pattern":".*","flags":""}' http://127.0.0.1:4000/api/challenges/aaaaaaaa-0006-4000-8000-000000000006/attempts
```

Attempt responses return aggregate counts only:

- `positiveMatched`: positive secret controls matched by the submitted regex.
- `negativeMatched`: negative secret controls matched by the submitted regex.
- `isCorrect`: `positiveMatched === positiveTotal && negativeMatched === 0`.

Attempt responses must not include `secretPattern`, `ChallengeControl.value`, control lists, `proposedPattern`, password hashes, session hashes, token values, or cookie values.

In the UI, `demo_player` can solve seeded non-author challenges after login. Authors such as `daniele_demo` are blocked from solving their own challenges in the UI, and the backend remains authoritative with a `403` response.

This public review repository must never contain real secrets. `.env.example` values and demo credentials are development-only placeholders.

The frontend must not store auth tokens in `localStorage` or `sessionStorage`, must not read `document.cookie` for auth, must not use JWT, must not use `dangerouslySetInnerHTML`, and must not evaluate user regex with JavaScript `RegExp`.

## Safe regex engine

GOAL 04 added an internal backend regex engine based on `re2-wasm`; GOAL 05 uses it from the protected attempt endpoint and GOAL 06 uses it from protected challenge creation. GOAL 07, GOAL 08.0, GOAL 08.1, GOAL 08.2, GOAL 08.3, GOAL 08.4, and GOAL 08.5 do not change regex evaluation.

- Evaluation happens server-side only.
- User candidate patterns are compiled with RE2-compatible semantics, not JavaScript `RegExp`.
- Full match uses RE2 absolute text anchors: `\A(?:pattern)\z`.
- Supported user flags are `i` and `m`; `u` is added internally because `re2-wasm` requires Unicode mode.
- Attempt submission returns only aggregate counts, never control values, secret patterns, or candidate patterns.

## Scope guard

This repository must not evaluate user-provided regex with JavaScript `RegExp`. Regex evaluation must stay server-side with full-match semantics and a RE2-compatible engine.
