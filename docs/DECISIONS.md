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

## Security decisions

- No regex evaluation exists in GOAL 00.
- No auth exists in GOAL 00.
- No secrets are stored in repository files.
- `.env.example` contains development-only placeholder values.

## Rejected for GOAL 00

- Prisma schema.
- Tailwind CSS and component libraries.
- Auth/session implementation.
- Regex engine integration.
- Full UI template.
