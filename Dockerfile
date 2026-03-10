# ---- Build stage ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy manifests first to leverage layer caching
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

RUN bun install

# Copy source files
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
COPY apps/api/ ./apps/api/

# Build the frontend
RUN cd apps/web && bun run build

# Move Vite output into the API's public directory
RUN cp -r apps/web/dist apps/api/public

# ---- Runtime stage ----
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copy the minimum needed to run the API with workspace deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3001

CMD ["bun", "src/index.ts"]
