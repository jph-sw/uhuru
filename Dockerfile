FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---

FROM oven/bun:1
WORKDIR /app

# Copy deps (includes drizzle-kit for migrations at startup)
COPY --from=builder /app/node_modules ./node_modules

# Copy build output
COPY --from=builder /app/dist ./dist

# Copy migration files and source (needed by server.ts at runtime)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY package.json tsconfig.json server.ts drizzle.config.ts ./

# Persistent volume for SQLite
RUN mkdir -p /app/data
VOLUME /app/data

EXPOSE 3000

# Run migrations then start server
CMD bun db:migrate && bun server.ts
