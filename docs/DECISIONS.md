# Decisions

## GOAL 00 decisions

- Use `pnpm@11.7.0` for workspace management because it is the stable pnpm shim available in the Windows/Codex PATH for this repository.
- Use Node.js `>=24.14.0` locally and Docker image `node:24.17.0-bookworm-slim` for container builds.
- Use React `19.2.7`, React DOM `19.2.7`, Vite `8.1.0`, and TypeScript `6.0.3` for the frontend app.
- Use Fastify `5.8.5` and TypeScript `6.0.3` for the backend API.
- Use Playwright `1.61.1` and Vitest `4.1.9` for tests.
- Use ESLint `10.6.0` with `typescript-eslint` `8.62.0`.
- Use PostgreSQL Docker image `postgres:18.1-bookworm`.
- Mount the PostgreSQL Docker volume at `/var/lib/postgresql`, which is the required layout for PostgreSQL 18+ Docker images.
- Tag local Compose build images explicitly instead of relying on Compose's default `latest` tag.
- Serve the production web container with a minimal Node static server in `frontend/server.mjs`; Vite remains a build-time and dev-time tool only.
- Allow only the `esbuild` dependency build script in `pnpm-workspace.yaml`, because Vite requires it and pnpm blocks dependency build scripts by default.
- Keep `packages/shared` minimal: only scaffold constants and the `HealthResponse` type.
- Keep database migration and seed commands as explicit placeholders until GOAL 01.

## GOAL 01 decisions

- Use Prisma `7.8.0` and `@prisma/client` `7.8.0`.
- Use `@prisma/adapter-pg` with `pg` because Prisma 7 uses driver adapters for PostgreSQL runtime access.
- Keep Prisma files under `backend/prisma`.
- Generate Prisma Client into `backend/src/generated/prisma` and keep generated output out of Git.
- Use UUID primary keys for non-enumerable identifiers.
- Use a versioned migration at `backend/prisma/migrations/20260626222148_init/migration.sql`.
- Use Argon2id for demo password hashes through `argon2` `0.44.0`.
- Use deterministic demo salts only for local seed repeatability; production password hashing must use normal per-password random salts.
- Keep `/health` independent from database tables.
- Map PostgreSQL to host port `55432` to avoid collision with local PostgreSQL on `5432`.
- Keep Docker internal database address as `db:5432`.
- Install OpenSSL in Docker build/runtime stages that install the workspace, because Prisma engines need reliable OpenSSL detection on `node:bookworm-slim`.

## Security decisions

- Secret regex patterns and control values are stored only in the database layer and seed source, not exposed by API endpoints or logs.
- `pnpm db:verify` and seed logs report counts only and do not print `secretPattern` or challenge control values.
- `.env.example` contains development-only placeholder values.

## GOAL 02 decisions

- Expose only read-only challenge endpoints: `GET /api/challenges` and `GET /api/challenges/:id`.
- Keep challenge route handlers thin and move database reads into `challenge-service`.
- Use explicit public DTO serializers instead of returning raw Prisma records.
- Validate `page`, `limit`, and challenge `id` server-side.
- Reject unknown public list query parameters instead of forwarding query input to Prisma.
- Include aggregate public counts for attempts and solutions through Prisma `_count`.
- Keep auth, challenge mutations, attempt submission, and regex evaluation out of scope.

## GOAL 03 decisions

- Work directly on `main` for the exam workflow and create one checkpoint commit at the end of the goal.
- Keep the public review repository free of real secrets; demo credentials and `.env.example` values are placeholders only.
- Use existing `User` and `Session` tables; no schema migration is needed for GOAL 03.
- Use Argon2id for password hashing and verification.
- Use opaque server-side sessions instead of JWT.
- Store only SHA-256 hashes of session tokens in `Session.sessionTokenHash`.
- Send the raw session token only in the `rr_session` cookie.
- Use `HttpOnly`, `SameSite=Lax`, `Path=/`, and 7-day expiry for auth cookies.
- Enable cookie `Secure` by default in production, with `AUTH_COOKIE_SECURE=false` documented for local HTTP Docker smoke tests.
- Keep `GET /health`, `GET /api/challenges`, and `GET /api/challenges/:id` public.
- Tag local Compose images as `regexriddle-api:dev` and `regexriddle-web:dev`.

## GOAL 04 decisions

- Use `re2-wasm` `1.0.2` as the server-side RE2-compatible regex engine.
- Keep the regex engine internal; GOAL 04 adds no attempt endpoint and no frontend evaluation.
- Implement full match with RE2 absolute text anchors: `\A(?:pattern)\z`.
- Avoid `^...$` for full matching because multiline mode can match individual lines.
- Support only user flags `i` and `m`; add `u` internally for `re2-wasm`.
- Reject duplicate, unknown, and RE2-unsupported flags/patterns with controlled errors.
- Return only aggregate attempt counts from engine evaluation.
- Do not return or log `secretPattern`, `ChallengeControl.value`, candidate patterns, or per-control details.
- Treat `git grep -n "new RegExp\|RegExp(" -- . ':!node_modules' ':!dist'` as the manual security check for accidental JavaScript regex construction.

## GOAL 05 decisions

- Correct the official attempt feedback semantics: `negativeMatched` counts NEGATIVE controls matched by the candidate, not negative controls correctly rejected.
- Mark an attempt correct only when `positiveMatched === positiveTotal && negativeMatched === 0`.
- Add `POST /api/challenges/:id/attempts` as a protected cookie-authenticated mutation.
- Keep the frontend attempt UI out of scope.
- Reuse the existing opaque `rr_session` cookie; do not introduce JWT.
- Add CSRF guard v1 for protected JSON mutations: require `Content-Type: application/json` and `X-RegexRiddle-CSRF: 1`.
- Return `403 Forbidden` when the CSRF header is missing or wrong.
- Return `422 Unprocessable Entity` for invalid or RE2-incompatible submitted regexes.
- Do not create an `Attempt` for invalid or unsupported regexes.
- Store `Attempt.proposedPattern` internally but never return it in the attempt submission response.
- Use explicit Prisma `select` and DTO serialization for attempt responses.
- Block authors from attempting their own challenges.
- Return `409 Conflict` when the authenticated user already solved the challenge.
- Use the current authenticated user id only; reject unknown body keys to prevent mass assignment.

## GOAL 05.5 decisions

- Move delivery-facing directories from the previous nested app layout to `backend`, `frontend`, and `e2e`.
- Keep one pnpm workspace monorepo and keep `packages/shared` in place.
- Keep npm package names stable: `@regexriddle/api`, `@regexriddle/web`, and `@regexriddle/e2e`.
- Keep Docker service names and ports stable.
- Do not change API routes, DTOs, database schema, auth/session behavior, or regex semantics.
- Use `git mv` for the tracked directory moves to preserve Git history.

## GOAL 06 decisions

- Add `POST /api/challenges` as a protected cookie-authenticated mutation.
- Keep the frontend challenge creation UI out of scope.
- Reuse the existing opaque `rr_session` cookie; do not introduce JWT.
- Reuse CSRF guard v1 for protected JSON mutations: require `Content-Type: application/json` and `X-RegexRiddle-CSRF: 1`.
- Use the current authenticated user id as `Challenge.authorId`; reject client-provided `authorId` and other unknown fields.
- Validate the secret regex, public examples, and secret controls with the existing server-side RE2-compatible full-match engine before persistence.
- Return `422 Unprocessable Entity` for invalid/unsupported secret regexes, invalid flags, or examples/controls that are incoherent with the secret regex.
- Create `Challenge` and `ChallengeControl` rows transactionally without creating `Attempt` or `Solution` rows.
- Return the existing public challenge detail DTO and set `Location: /api/challenges/:id`.
- Do not return `Challenge.secretPattern`, control lists, `ChallengeControl.value`, `Attempt.proposedPattern`, password hashes, session hashes, token values, or cookie values.
- Do not add a Prisma migration because the existing schema already supports challenge creation.

## GOAL 07 decisions

- Add `GET /api/leaderboard` as a public read-only endpoint.
- Keep the frontend leaderboard UI out of scope.
- Do not require auth or CSRF because the endpoint performs no mutation and returns public aggregates only.
- Base leaderboard rows on `Solution` aggregates rather than raw attempts.
- Exclude users with zero solved challenges.
- Rank by solved challenge count descending, average attempts ascending, then username ascending.
- Use 1-based global rank after sorting and apply pagination after ranking.
- Round `averageAttempts` to 2 decimals in the API response while sorting by the raw aggregate average.
- Return only `username`, `displayName`, `solvedCount`, `averageAttempts`, `totalAttemptsUsed`, and `rank`.
- Do not return user ids, emails, avatar URLs, secret regexes, control values, submitted patterns, password hashes, session hashes, token values, or cookie values.
- Do not add a Prisma migration because the existing `Solution` table already supports leaderboard aggregates.

## GOAL 08.0 decisions

- Add the Regex Lab frontend foundation without changing backend API behavior, database schema, auth/session/cookie semantics, or regex semantics.
- Use Tailwind CSS v4 through the official `@tailwindcss/vite` plugin.
- Initialize shadcn/ui inside the existing `frontend/` Vite app, not a nested app path.
- Use a small shadcn component set: button, card, badge, separator, input, label, textarea, sheet, and skeleton.
- Use React Router for public SPA routing.
- Use TanStack Query for server state and a conservative default query policy.
- Install React Hook Form, Zod, and `@hookform/resolvers` for later form goals, but do not implement real forms in GOAL 08.0.
- Use the current Motion for React package name `motion`; this is the current Framer Motion successor/name for React imports such as `motion/react`.
- Keep animation subtle and respect reduced-motion preferences.
- Use same-origin frontend API calls with relative paths only.
- In development, Vite proxies `/api/*` and `/health` to `http://127.0.0.1:4000`.
- In Docker, the frontend Node server proxies `/api/*` and `/health` to `API_ORIGIN`; Compose sets `API_ORIGIN=http://api:4000`.
- Always send `credentials: "include"` from the frontend API client because auth is cookie-based.
- Provide a CSRF header helper for future protected mutations without building mutation UI yet.
- Do not store auth tokens in `localStorage` or `sessionStorage`, do not read `document.cookie`, and do not introduce JWT.
- Do not evaluate regex in the frontend and do not use `dangerouslySetInnerHTML`.
- In GOAL 08.0, keep `/challenges`, `/leaderboard`, `/login`, `/register`, `/create`, and `/challenges/:id` as useful placeholders until later GOAL 08.x work.

## GOAL 08.1 decisions

- Connect only public read pages to existing APIs; do not change backend behavior, database schema, auth/session/cookie semantics, regex semantics, or regex engine.
- Use TanStack Query hooks for catalog, challenge detail, and leaderboard server state.
- Use the existing same-origin API client and keep `credentials: "include"` on public reads.
- Use URL query state for catalog and leaderboard pagination with fixed limits: 9 challenges and 10 leaderboard rows.
- Use shadcn cards and badges for challenge data; use an accessible shadcn table on desktop/tablet and stacked cards on mobile for leaderboard data.
- Render only public examples, public author identity, public solver identity, and aggregate stats.
- Do not render emails, user ids, secret regexes, hidden controls, submitted patterns, password/session hashes, raw tokens, or cookie values.
- Keep login/register forms, logout UI, attempt submission UI, challenge creation UI, profile/statistics, and edit/delete out of scope.

## GOAL 08.2 decisions

- Connect only frontend auth UI to existing backend auth APIs; do not change backend behavior, database schema, auth/session/cookie semantics, CSRF rules, challenge APIs, attempt APIs, regex semantics, or regex engine.
- Use the existing same-origin API client for `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me`.
- Treat `GET /api/auth/me` as the current-user source of truth; `401 Unauthorized` maps to guest state in the frontend.
- Use TanStack Query for the current public user DTO and auth mutations; keep auth state in memory only.
- Do not introduce JWT, local token storage, session token storage, `document.cookie` auth reads, or custom browser token stores.
- Use React Hook Form and Zod for login/register validation; client validation improves UX but the backend remains authoritative.
- Keep `confirmPassword` frontend-only and never send it to `POST /api/auth/register`.
- Show generic credential errors and duplicate-account errors without revealing which credential field failed.
- Header and mobile navigation show login/register for guests and display name, username, create link, and logout for authenticated users.
- `/create` is auth-aware but remains a protected placeholder; no challenge creation form, secret pattern field, or control fields are introduced.
- Keep attempt submission UI, profile/statistics, challenge edit/delete, and frontend regex evaluation out of scope.

## GOAL 08.3 decisions

- Connect only frontend attempt/gameplay UI to the existing protected attempt API; do not change backend behavior, database schema, auth/session/cookie semantics, CSRF rules, challenge APIs, regex semantics, or regex engine.
- Keep gameplay on `/challenges/:id` instead of adding a separate route.
- Use the existing `GET /api/auth/me` current-user query to choose guest, author-blocked, and solver form states.
- Use React Hook Form and Zod for attempt form shape validation only; do not validate regex syntax in the browser.
- Preserve the candidate pattern text exactly in the submitted body except for rejecting empty or whitespace-only input client-side.
- Support only `i` and `m` flag controls in the UI and map them to the backend flag string.
- Use the same-origin API client for `POST /api/challenges/:id/attempts` with `protectedMutation: true`, so credentials and CSRF stay centralized.
- Send only `pattern` and `flags`; do not send user ids, challenge ids, counts, `isCorrect`, or attempt metadata from the client.
- Show aggregate feedback only and never render secret regexes, hidden controls, or `Attempt.proposedPattern`.
- Invalidate challenge detail/list queries after successful attempts and leaderboard queries when `solved` is true.
- Keep challenge creation UI, profile/statistics, challenge edit/delete, backend API changes, database changes, and frontend regex evaluation out of scope.

## GOAL 08.4 decisions

- Connect only frontend challenge creation UI to the existing protected creation API; do not change backend behavior, database schema, auth/session/cookie semantics, CSRF rules, attempt APIs, regex semantics, or regex engine.
- Keep authoring on `/create` and reuse the existing current-user query for guest/authenticated states.
- Use React Hook Form and Zod for authoring form shape validation only; do not validate regex syntax or coherence in the browser.
- Support only `i` and `m` flag controls in the UI and map them to a deterministic backend flag string.
- Limit the UI to 3-10 positive controls and 3-10 negative controls, while leaving the backend 30-control total limit authoritative.
- Detect duplicate same-kind controls and contradictory positive/negative controls client-side for fast feedback.
- Use the same-origin API client for `POST /api/challenges` with `protectedMutation: true`, so credentials and CSRF stay centralized.
- Send only documented creation DTO fields; do not send author ids, challenge ids, counts, dates, or mass-assignment fields from the client.
- Show only the public creation response after success, reset secret inputs, and prime the created challenge detail query.
- Keep profile/statistics, challenge edit/delete, backend API changes, database changes, and frontend regex evaluation out of scope.

## GOAL 08.5 decisions

- Add `/how-it-works` as a public demo/oral walkthrough page instead of burying rules only in README copy.
- Explain full-match semantics, RE2-compatible limitations, supported `i`/`m` flags, public examples, server-only secret controls, aggregate feedback, leaderboard ranking, and the demo flow in UI copy.
- Add `/account` as a current-user settings page, not as a public profile or statistics page.
- Add `PATCH /api/auth/me` because `GET /api/auth/me` already represents the current authenticated user and the route avoids user-id parameters.
- Use the existing `User.displayName`, `User.bio`, and `User.avatarUrl` fields; do not add a Prisma migration or schema change.
- Require `rr_session`, `Content-Type: application/json`, and `X-RegexRiddle-CSRF: 1` for account updates.
- Derive the updated user only from the server-side session; do not accept user ids from the route or body.
- Reject unknown keys and mass-assignment fields before Prisma writes.
- Allow only `displayName`, `bio`, and `avatarUrl`; do not allow email, username, password, ids, dates, relations, or `_count` changes.
- Store avatar URLs as strings only; do not fetch external URLs and do not add avatar upload storage.
- Return the current-user DTO with `bio` and `avatarUrl`; keep public challenge author and leaderboard DTOs limited to `username` and `displayName`.
- Update the current-user TanStack Query cache after account updates and keep auth/account state in memory only.
- Keep password change, email change, profile statistics, challenge edit/delete, auth/session changes, regex changes, upload storage, and frontend regex evaluation out of scope.

## Rejected for GOAL 00

- Prisma schema.
- Tailwind CSS and component libraries.
- Auth/session implementation.
- Regex engine integration.
- Full UI template.
