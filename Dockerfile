# Two images from one Dockerfile:
#   docker build --target api -t uhuru-api .   # Elysia API, owns the SQLite database
#   docker build --target web -t uhuru-web .   # TanStack Start frontend, proxies /api/* to the API
# docker-compose.yml runs both.

# Keep in sync with "packageManager" in package.json (bun.lock is version-specific)
ARG BUN_VERSION=1.3.10

# --- dependencies for the whole workspace --------------------------------------
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/openapi/package.json packages/openapi/
COPY tests/contract/package.json tests/contract/
RUN bun install --frozen-lockfile

# --- frontend build -------------------------------------------------------------
FROM deps AS web-build
# Tailwind skips .gitignored paths when scanning for classes. Without it, the
# SSR build would also scan the client build in dist/ and emit a stylesheet
# with a different hash than the one the client build wrote.
COPY .gitignore ./
COPY packages/openapi packages/openapi
COPY apps/web apps/web
RUN bun --filter @uhuru/web build

# --- API ------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS api
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json bun.lock ./
COPY apps/api ./apps/api

# Persistent volume for SQLite
RUN mkdir -p /app/data
VOLUME /app/data

ENV API_PORT=3001 \
    DATABASE_PATH=/app/data/database.sqlite

WORKDIR /app/apps/api
EXPOSE 3001

HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=10 \
  CMD bun -e "fetch('http://localhost:' + (process.env.API_PORT ?? 3001) + '/api').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

# Run migrations, then start the API (which seeds the admin user)
CMD ["sh", "-c", "bun --bun drizzle-kit migrate && exec bun src/index.ts"]

# --- web ------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS web
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=web-build /app/apps/web/dist ./apps/web/dist
COPY apps/web/package.json apps/web/server.ts ./apps/web/

ENV PORT=3000 \
    API_URL=http://api:3001

WORKDIR /app/apps/web
EXPOSE 3000

CMD ["bun", "server.ts"]
