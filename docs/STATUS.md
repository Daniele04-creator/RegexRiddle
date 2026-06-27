# Status

## Current milestone

GOAL 08.5: how-it-works page, account settings, and final UI polish.

## Implemented

- pnpm workspace root.
- `frontend` React/Vite/TypeScript SPA foundation.
- `backend` Fastify/TypeScript health API, Prisma, auth, and regex engine.
- `e2e` Playwright smoke, public API, auth API, and attempt API tests.
- `packages/shared` shared constants and public API DTO types.
- Delivery-facing directories are now `backend`, `frontend`, and `e2e` while the repository remains one pnpm workspace.
- Docker Compose with web, API, and PostgreSQL services.
- Prisma schema with `User`, `Session`, `Challenge`, `ChallengeControl`, `Attempt`, and `Solution`.
- Versioned initial migration.
- Deterministic demo seed.
- Database verification script.
- Public read-only `GET /api/challenges`.
- Public read-only `GET /api/challenges/:id`.
- Public read-only `GET /api/leaderboard`.
- Backend auth `POST /api/auth/register`.
- Backend auth `POST /api/auth/login`.
- Backend auth `POST /api/auth/logout`.
- Backend auth `GET /api/auth/me`.
- Backend auth `PATCH /api/auth/me` for scoped current-user account settings.
- Argon2id password hashing and opaque server-side sessions.
- Safe internal regex engine based on `re2-wasm`.
- Full-match semantics through RE2 `\A...\z` absolute text anchors.
- Explicit user flag validation for `i` and `m`.
- Official aggregate attempt semantics:
  - `positiveMatched` counts POSITIVE controls matched by the submitted regex.
  - `negativeMatched` counts NEGATIVE controls matched by the submitted regex.
  - `isCorrect` requires all positives and zero negatives.
- Protected `POST /api/challenges/:id/attempts`.
- Protected `POST /api/challenges`.
- CSRF guard v1 for protected JSON mutations through `X-RegexRiddle-CSRF: 1`.
- Challenge creation ownership from the authenticated `rr_session` user.
- Challenge creation validation for unknown keys, mass assignment, public examples, secret controls, and RE2-compatible full-match regex semantics.
- Transactional challenge and control persistence.
- Public challenge detail DTO response for creation without secret regexes or control values.
- Public solver leaderboard based on `Solution` aggregates.
- Leaderboard ranking by solved count descending, average attempts ascending, and username ascending.
- Leaderboard public DTO response with only username, display name, rank, and aggregate solve metrics.
- Attempt persistence with aggregate public DTO response.
- Solution creation for correct attempts.
- Author self-attempt block.
- Already-solved attempt block.
- Invalid or unsupported submitted regex rejection without attempt persistence.
- Local Docker image tags `regexriddle-api:dev` and `regexriddle-web:dev`.
- Regex Lab visual system documented in root `DESIGN.md`.
- Tailwind CSS v4 configured through `@tailwindcss/vite`.
- shadcn/ui initialized in `frontend/` with a small component set.
- React Router SPA shell with public routes for home, challenges, challenge detail, leaderboard, login, register, create, and not found.
- React Router route for public `/how-it-works`.
- React Router route for protected `/account`.
- Semantic app shell with header, nav, main, footer, skip link, and responsive mobile sheet navigation.
- TanStack Query provider configured for server state.
- Typed same-origin API client with `credentials: "include"`.
- CSRF helper for future protected mutations.
- Optional frontend health badge backed by `/health`.
- Vite dev proxy for `/api/*` and `/health`.
- Docker frontend server proxy for `/api/*` and `/health` through `API_ORIGIN`.
- Compose web service sets `API_ORIGIN=http://api:4000`.
- Real frontend login and registration pages using existing auth APIs.
- Header and mobile nav guest/authenticated states.
- Frontend logout action.
- Current-session restoration through `GET /api/auth/me`.
- Auth-aware `/create` gate for guests and protected challenge creation form for authenticated users.
- Auth-aware `/account` gate for guests and protected account settings form for authenticated users.
- Current-user account updates limited to `displayName`, `bio`, and `avatarUrl`.
- Frontend tests for routing, API client credentials, CSRF helper, source security baseline, and reduced-motion CSS.
- Public `/challenges` frontend page connected to `GET /api/challenges?page=1&limit=9`.
- Public `/challenges/:id` frontend page connected to `GET /api/challenges/:id`.
- Public `/leaderboard` frontend page connected to `GET /api/leaderboard?page=1&limit=10`.
- TanStack Query hooks for challenge catalog, challenge detail, and leaderboard data.
- Public challenge cards showing difficulty, title, description, public examples, public author identity, aggregate attempts, aggregate solutions, and created date.
- Public challenge detail showing title, description, public examples, public author identity, aggregate stats, created date, and updated date.
- Public leaderboard UI showing rank, display name, username, solved count, average attempts, and total attempts used.
- Leaderboard desktop/tablet table and mobile stacked layout.
- Catalog and leaderboard URL pagination.
- Auth feature folder with typed API functions, TanStack Query hooks, Zod schemas, form components, and session menu.
- Challenge authoring feature folder with typed protected API function, TanStack Query mutation, Zod schema, authoring form, secret-control editor, guest gate, and public success card.
- Attempt feature folder with typed protected API function, TanStack Query mutation, Zod schema, candidate form, flag selector, aggregate feedback, and guest/author gates.
- Challenge detail attempt panel for guests, authenticated non-authors, and authors.
- Attempt mutation using `POST /api/challenges/:id/attempts` through the same-origin API client with `credentials: "include"` and `X-RegexRiddle-CSRF: 1`.
- Attempt feedback for correct, incorrect, invalid regex, already solved, and forbidden author states without rendering secret controls or proposed patterns.
- Public how-it-works walkthrough explaining creators, solvers, full-match semantics, RE2-compatible regexes, flags, public examples, secret controls, aggregate feedback, leaderboard ranking, and demo flow.
- Header and mobile navigation with Home, Come funziona, Sfide, Classifica, Crea, plus Account/Logout for authenticated users.

## Not implemented

- Challenge update or deletion.
- Profile/statistics UI.
- Password change.
- Email change.
- Avatar file upload or upload storage.

## Verification status

Verified on 2026-06-27 before GOAL 08.0 implementation:

- `git switch main`: PASS, already on `main`.
- `git pull --ff-only`: PASS, already up to date.
- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, frontend 1 test, backend 79 tests.
- `pnpm build`: PASS.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` built from `backend/Dockerfile` and `frontend/Dockerfile`; db, API, and web containers started.
- `pnpm e2e`: PASS, 20 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 20 E2E tests.
- `docker compose ps`: PASS, db healthy and API/web running on the existing ports.
- `rg -n "new RegExp|RegExp\(" backend frontend packages e2e`: PASS, no matches.
- Sensitive-field audit: PASS, `secretPattern`, `ChallengeControl`, `proposedPattern`, `sessionTokenHash`, and `passwordHash` appear only in docs, tests, shared request contracts, or internal backend auth/service code.
- Leaderboard forbidden-field audit: PASS, `email`, password/session hashes, secret fields, control fields, and submitted pattern fields do not appear in leaderboard DTO construction.
- Query abuse audit: PASS, public routes validate accepted query parameters before service calls; leaderboard accepts only `page` and `limit`.
- Old path audit: PASS, no obsolete nested app-directory references remain outside ignored/generated paths.

Smoke leaderboard response summary:

- `GET /api/leaderboard?limit=50&page=1` returned `200 OK`.
- The response included `page`, `limit`, `total`, and ranked items.
- Leaderboard items included `rank`, `user.username`, `user.displayName`, `solvedCount`, `averageAttempts`, and `totalAttemptsUsed`.
- Deterministic test data confirmed ranking by solved count descending, average attempts ascending, then username ascending.

The leaderboard response did not include user ids, emails, avatar URLs, `secretPattern`, `ChallengeControl.value`, `controls`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, token values, or cookie values.

Verified on 2026-06-27 after GOAL 08.0 implementation:

- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS with two non-blocking Fast Refresh warnings in generated shadcn `button` and `badge` files.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, frontend 11 tests, backend 79 tests.
- `pnpm build`: PASS, with a non-blocking Vite chunk-size warning after adding React Router, Motion, TanStack Query, and shadcn/ui.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` rebuilt; db, API, and web containers started.
- `pnpm e2e`: PASS, 24 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 24 E2E tests.
- Visual viewport verification: PASS for desktop `1440x900`, tablet `768x1024`, mobile `390x844`, and mobile nav; no horizontal overflow detected.

Verified on 2026-06-27 after GOAL 08.1 implementation:

- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS with two non-blocking Fast Refresh warnings in generated shadcn `button` and `badge` files.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, backend 79 tests, frontend 20 tests.
- `pnpm build`: PASS, with the existing non-blocking Vite chunk-size warning.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` rebuilt; db, API, and web containers started.
- `pnpm e2e`: PASS, 30 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 30 E2E tests.
- `pnpm audit --audit-level=high`: PASS; one moderate transitive tooling advisory remains in `@hono/node-server` through Prisma/shadcn tooling.
- `git diff --check`: PASS.
- `docker compose ps`: PASS, db healthy and API/web running on the existing ports.
- Visual viewport verification: PASS for desktop `1440x900`, tablet `768x1024`, mobile `390x844`, and mobile nav; no horizontal overflow detected.
- Source security audit: PASS, no production frontend `dangerouslySetInnerHTML`, browser-readable auth-token storage APIs, JavaScript `RegExp` construction, or raw `fetch` outside the API client boundary.

Verified on 2026-06-27 after GOAL 08.2 implementation:

- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS with two non-blocking Fast Refresh warnings in generated shadcn `button` and `badge` files.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, backend 79 tests, frontend 31 tests.
- `pnpm build`: PASS, with the existing non-blocking Vite chunk-size warning.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` rebuilt; db, API, and web containers started.
- `pnpm e2e`: PASS, 36 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 36 E2E tests.
- `pnpm audit --audit-level=high`: PASS at the high threshold; one moderate advisory remains in tooling dependencies.
- `git diff --check`: PASS.
- `docker compose ps`: PASS, db healthy and API/web running on the expected ports.
- Visual viewport verification: PASS for desktop `1440x900`, tablet `768x1024`, mobile `390x844`, logged-out nav, logged-in nav, login, register, and create placeholder; no horizontal overflow or sensitive text detected.
- Web Interface Guidelines audit: PASS after adjusting auth form placeholders/loading ellipses and mobile tap target sizing.
- Source security audit: PASS, no production frontend `dangerouslySetInnerHTML`, `document.cookie`, browser auth-token storage APIs, JavaScript `RegExp` construction, sensitive auth/challenge fields, `console.*`, or obsolete `apps/*` path references.

Verified on 2026-06-27 after GOAL 08.3 implementation:

- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS with two pre-existing non-blocking Fast Refresh warnings in generated shadcn `button` and `badge` files.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, backend 79 tests, frontend 42 tests.
- `pnpm build`: PASS, with the existing non-blocking Vite chunk-size warning.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` rebuilt; db, API, and web containers started.
- `pnpm e2e`: PASS, 44 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 44 E2E tests.
- `pnpm audit --audit-level=high`: PASS at the high threshold; one moderate advisory remains in tooling dependencies.
- `git diff --check`: PASS.
- `docker compose ps`: PASS, db healthy and API/web running on the expected ports.
- Visual viewport verification: PASS for desktop `1440x900`, tablet `768x1024`, and mobile `390x844` attempt states; no horizontal overflow detected.
- Web Interface Guidelines audit: PASS for the attempt UI after checking labels, focus states, ellipses, `aria-live`, long-content handling, and responsive overflow.
- Source security audit: PASS, no production frontend `dangerouslySetInnerHTML`, `document.cookie`, browser auth-token storage APIs, JavaScript `RegExp` construction, `console.*`, or obsolete `apps/*` path references.
- Sensitive-field audit: PASS, sensitive names appear only in docs, tests, shared challenge-creation contracts, or backend internals; production attempt UI does not render secret regexes, hidden controls, `Attempt.proposedPattern`, password hashes, session hashes, raw tokens, or cookie values.

Verified on 2026-06-27 after GOAL 08.4 implementation:

- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS with two pre-existing non-blocking Fast Refresh warnings in generated shadcn `button` and `badge` files.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, backend 79 tests, frontend 51 tests.
- `pnpm build`: PASS, with the existing non-blocking Vite chunk-size warning.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` rebuilt; db, API, and web containers started.
- `pnpm db:verify` after Compose rebuild: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm e2e`: PASS, 49 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 49 E2E tests.
- `pnpm audit --audit-level=high`: PASS at the high threshold; one moderate advisory remains in tooling dependencies (`@hono/node-server` through Prisma/shadcn tooling).
- `git diff --check`: PASS.
- `docker compose ps`: PASS, db healthy and API/web running on the expected ports.
- Visual viewport verification: PASS for mobile `390x844` challenge creation form; no horizontal overflow detected.
- Web Interface Guidelines audit: PASS for the authoring UI after checking labels, focus states, ellipses, control add/remove states, mobile tap behavior, and responsive overflow.
- Source security audit: PASS through frontend source-security tests; no production frontend `dangerouslySetInnerHTML`, `document.cookie`, browser auth-token storage APIs, JavaScript `RegExp` construction, or raw `fetch` outside the API client boundary.
- Sensitive-field audit: PASS through frontend, backend, and E2E anti-leak tests; created challenge public detail/catalog responses do not render secret regexes, hidden controls, raw tokens, cookie values, password hashes, or session hashes.

Verified on 2026-06-27 after GOAL 08.5 implementation:

- `docker compose up -d db`: PASS.
- `pnpm db:seed`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions.
- `pnpm db:verify`: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm lint`: PASS with two pre-existing non-blocking Fast Refresh warnings in generated shadcn `button` and `badge` files.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, shared 1 test, backend 88 tests, frontend 59 tests.
- `pnpm build`: PASS, with the existing non-blocking Vite chunk-size warning.
- `docker compose up --build -d`: PASS, images `regexriddle-api:dev` and `regexriddle-web:dev` rebuilt; db, API, and web containers started.
- `pnpm db:verify` after Compose rebuild: PASS, 3 users, 10 challenges, 60 controls, 4 attempts, 2 solutions; no secret values printed.
- `pnpm e2e`: PASS, 56 Playwright tests.
- `pnpm check`: PASS, includes lint, typecheck, test, build, and 56 E2E tests.
- `pnpm audit --audit-level=high`: PASS at the high threshold; one moderate advisory remains in transitive tooling dependencies (`@hono/node-server <1.19.13`, GHSA-92pp-h63x-v22m, through Prisma/shadcn tooling).
- `git diff --check`: PASS.
- `docker compose ps`: PASS, db healthy and API/web running on the expected ports.
- Responsive viewport verification: PASS for public how-it-works, guest account, authenticated account, desktop navigation, and mobile `390x844` account flow; no horizontal overflow detected.
- Web Interface Guidelines audit: PASS for page hierarchy, labels, focusable controls, mobile tap targets, no nested cards, and text wrapping in the new how-it-works and account views.
- Source security audit: PASS, no production frontend `dangerouslySetInnerHTML`, `document.cookie`, browser auth-token storage APIs, JavaScript `RegExp` construction, `console.*`, or obsolete `apps/*` path references.
- Sensitive-field and mass-assignment audit: PASS, account updates accept only `displayName`, `bio`, and `avatarUrl`; forbidden sensitive names appear only in docs, tests, shared challenge-creation request contracts, or backend internals.
