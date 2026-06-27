FROM node:24.17.0-bookworm-slim AS build

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @regexriddle/web build

FROM node:24.17.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/frontend/server.mjs ./frontend/server.mjs

EXPOSE 4173

CMD ["node", "frontend/server.mjs"]
