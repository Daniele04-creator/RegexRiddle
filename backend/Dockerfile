FROM node:24.17.0-bookworm-slim AS build

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

COPY . .

RUN pnpm --filter @regexriddle/api... install --frozen-lockfile

RUN pnpm --filter @regexriddle/api build

FROM node:24.17.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=4000
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json

RUN pnpm install --prod --frozen-lockfile --filter @regexriddle/api...

COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
