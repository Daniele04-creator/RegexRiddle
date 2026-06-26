FROM node:24.17.0-bookworm-slim AS build

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @regexriddle/api build

FROM node:24.17.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=4000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]
