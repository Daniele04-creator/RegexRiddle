FROM node:24.17.0-bookworm-slim AS build

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

COPY . .

RUN pnpm --filter @regexriddle/web... install --frozen-lockfile

RUN pnpm --filter @regexriddle/web build

FROM node:24.17.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=4173
ENV API_ORIGIN=http://backend:4000

COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/frontend/server.mjs ./frontend/server.mjs
COPY --from=build /app/frontend/security-headers.mjs ./frontend/security-headers.mjs

EXPOSE 4173

CMD ["node", "frontend/server.mjs"]
