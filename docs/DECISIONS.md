# Decisions

## GOAL 00 decisions

- Use `pnpm@11.7.0` for workspace management because it is the stable pnpm shim available in the Windows/Codex PATH for this repository.
- Use Node.js `>=24.14.0` locally and Docker image `node:24.17.0-bookworm-slim` for container builds.
- Use React `19.2.7`, React DOM `19.2.7`, Vite `8.1.0`, and TypeScript `6.0.3` for `apps/web`.
- Use Fastify `5.8.5` and TypeScript `6.0.3` for `apps/api`.
- Use Playwright `1.61.1` and Vitest `4.1.9` for tests.
- Use ESLint `10.6.0` with `typescript-eslint` `8.62.0`.
- Use PostgreSQL Docker image `postgres:18.1-bookworm`.
- Mount the PostgreSQL Docker volume at `/var/lib/postgresql`, which is the required layout for PostgreSQL 18+ Docker images.
- Tag local Compose build images explicitly instead of relying on Compose's default `latest` tag.
- Serve the production web container with a minimal Node static server in `apps/web/server.mjs`; Vite remains a build-time and dev-time tool only.
- Allow only the `esbuild` dependency build script in `pnpm-workspace.yaml`, because Vite requires it and pnpm blocks dependency build scripts by default.
- Keep `packages/shared` minimal: only scaffold constants and the `HealthResponse` type.
- Keep database migration and seed commands as explicit placeholders until GOAL 01.

## GOAL 01 decisions

- Use Prisma `7.8.0` and `@prisma/client` `7.8.0`.
- Use `@prisma/adapter-pg` with `pg` because Prisma 7 uses driver adapters for PostgreSQL runtime access.
- Keep Prisma files under `apps/api/prisma`.
- Generate Prisma Client into `apps/api/src/generated/prisma` and keep generated output out of Git.
- Use UUID primary keys for non-enumerable identifiers.
- Use a versioned migration at `apps/api/prisma/migrations/20260626222148_init/migration.sql`.
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

## Rejected for GOAL 00

- Prisma schema.
- Tailwind CSS and component libraries.
- Auth/session implementation.
- Regex engine integration.
- Full UI template.
