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
- Tag local Compose build images as `regexriddle-api:goal-00` and `regexriddle-web:goal-00` instead of relying on Compose's default `latest` tag.
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

- No regex evaluation exists in GOAL 01.
- No auth endpoints exist in GOAL 01.
- Secret regex patterns and control values are stored only in the database layer and seed source, not exposed by API endpoints or logs.
- `pnpm db:verify` and seed logs report counts only and do not print `secretPattern` or challenge control values.
- `.env.example` contains development-only placeholder values.

## Rejected for GOAL 00

- Prisma schema.
- Tailwind CSS and component libraries.
- Auth/session implementation.
- Regex engine integration.
- Full UI template.
