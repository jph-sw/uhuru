<p align="center">
  <img src="./logo.svg" width="96" height="96" alt="Uhuru logo" />
</p>

<h1 align="center">Uhuru</h1>

<p align="center">
  A CMS built for developers who build content-driven websites for clients.
</p>

---

> **Work in progress.** Uhuru is not yet production-ready.

## What it is

Uhuru is a headless CMS designed around a specific workflow: a developer builds a website, a client needs to edit the text on it. That's it. No bloated page builders, no drag-and-drop editors — just a clean interface where clients can update content, and a simple API developers can query.

Clients are invited by the developer and get access only to the site they belong to. It includes built-in multi-language (i18n) support with automatic fallbacks.

## Stack

| Layer    | Tech                                                                      |
| -------- | ------------------------------------------------------------------------- |
| Frontend | TanStack Start (React, Vite, TanStack Router/Query/Form), Tailwind, Base UI |
| API      | Elysia, Better Auth                                                       |
| Database | SQLite via Drizzle ORM (`bun:sqlite`)                                     |
| Runtime  | Bun                                                                       |

The frontend and the API are separate apps. The frontend talks to the API only
over HTTP, through a documented contract (an OpenAPI spec plus an auth
contract), so another backend can implement the same API. An ASP.NET Core
backend is planned.

## Structure

```
uhuru/
├── apps/
│   ├── web/            # TanStack Start frontend (SSR); no database or auth server code
│   ├── api/            # Elysia API server: database, Better Auth, all /api routes
│   └── api-dotnet/     # Placeholder for the planned ASP.NET Core backend
├── packages/
│   └── openapi/        # OpenAPI spec of the API (generated) + TypeScript types for the frontend
├── tests/
│   └── contract/       # HTTP contract tests, run against any backend
├── docs/
│   └── auth-contract.md  # Auth endpoints, cookies, sessions, roles, invites
├── data/               # Development SQLite database (git-ignored)
├── Dockerfile          # Targets: api, web
└── docker-compose.yml
```

### How the apps talk

```
browser ──▶ web :3000 ──/api/*──▶ api :3001 ──▶ SQLite
              │  (proxy: Vite in dev, server.ts in production)
              └─ SSR requests go straight to API_URL, forwarding the user's cookie
```

The browser only ever talks to the web app's origin. Everything under `/api/*`,
including Better Auth under `/api/auth/*`, is proxied to the API, so the
session cookie is a normal first-party cookie. During server-side rendering,
the web app calls the API directly and forwards the incoming `cookie` header.

## Getting started

Requires [Bun](https://bun.sh) 1.3.10 (see `packageManager` in
`package.json`). The API uses `bun:sqlite`, so it has to run on Bun.

```bash
# Install dependencies for all workspaces
bun install

# Create your .env (see "Environment variables" below)
cp .env.example .env

# Create the database tables (data/database.sqlite)
bun run db:migrate

# Start the API on :3001 and the web app on :3000
bun run dev
```

Open http://localhost:3000. The API creates the admin user from `ADMIN_*` when
it starts, if no admin exists yet.

### Scripts

| Command                 | What it does                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| `bun run dev`           | API and web in watch mode                                            |
| `bun run build`         | Production build of the web app                                      |
| `bun run db:migrate`    | Apply migrations (also `db:generate`, `db:push`, `db:studio`)        |
| `bun run openapi`       | Regenerate `packages/openapi` after changing API routes; commit the result |
| `bun run test:contract` | Contract tests against `apps/api` with a temporary database          |
| `bun run check`         | Biome lint and format check                                          |

### Environment variables

All of these live in the root `.env`, which both apps read in development.

| Variable             | App | Description                                                                         |
| -------------------- | --- | ----------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | api | Random secret, at least 32 characters (`openssl rand -base64 32`)                   |
| `BETTER_AUTH_URL`    | api | The URL users open, i.e. the **web** app, e.g. `http://localhost:3000`              |
| `TRUSTED_ORIGINS`    | api | Optional, comma-separated list of additional allowed origins                        |
| `ADMIN_NAME`         | api | Name of the initial admin user                                                      |
| `ADMIN_EMAIL`        | api | Email of the initial admin user                                                     |
| `ADMIN_PASSWORD`     | api | Password of the initial admin user                                                  |
| `API_PORT`           | api | API port (default `3001`)                                                           |
| `DATABASE_PATH`      | api | SQLite file (default `<repo>/data/database.sqlite`; `/app/data/database.sqlite` in Docker) |
| `API_URL`            | web | Where the web app reaches the API (default `http://localhost:3001`)                 |
| `PORT`               | web | Port of the production web server (default `3000`)                                  |

If you get an **"Invalid origin"** error when signing in, `BETTER_AUTH_URL` (or
`TRUSTED_ORIGINS`) doesn't match the URL you opened the app at.

### The API contract

- [`packages/openapi/uhuru.yaml`](packages/openapi/uhuru.yaml): every `/api/*`
  route. It's generated from `apps/api`, and the frontend's API client is
  typed from it. CI fails if it's out of date.
- [`docs/auth-contract.md`](docs/auth-contract.md): `/api/auth/*`, cookies,
  sessions, roles, and invites.
- [`tests/contract`](tests/contract): tests that every backend must pass.

## How it works

1. A developer registers as an **admin** and creates a site (with configurable supported languages)
2. The admin defines **fields** — named pieces of content (e.g. `hero.title`, `about.body`)
3. The admin invites a **client** via an invite link
4. The client creates an account and can edit the content of their site, translating it into the configured languages
5. The developer fetches content from the API (optionally specifying a language) and renders it on the website

## Self-hosting

**Requirements:** a server with Docker installed.

Uhuru runs as two containers: `api` (owns the database) and `web` (serves the
app on port 3000 and forwards `/api/*` to `api`). Only `web` is exposed.

### 1. Create a `docker-compose.yml`

```yaml
services:
  api:
    image: ghcr.io/jph-sw/uhuru-api:latest
    env_file:
      - .env
    volumes:
      - db_data:/app/data
    restart: unless-stopped

  web:
    image: ghcr.io/jph-sw/uhuru-web:latest
    ports:
      - "3000:3000"
    environment:
      API_URL: http://api:3001
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped

volumes:
  db_data:
```

### 2. Create a `.env`

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://your-server-ip:3000

ADMIN_NAME=Your Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
```

### 3. Start

```bash
docker compose up -d
```

Uhuru is now running at `http://your-server-ip:3000`. On startup, the `api`
container applies database migrations and creates the admin user from `ADMIN_*`
if none exists.

If you put Uhuru behind a reverse proxy or domain, point the proxy at the
`web` container and set `BETTER_AUTH_URL` to the public URL (e.g.
`https://cms.example.com`).

The database is stored in the `db_data` volume and persists across updates.

> **Upgrading from the single-container image** (`ghcr.io/jph-sw/uhuru`):
> mount your existing database volume on `api` at `/app/data`. The path is
> unchanged.

To build from source instead, use the `docker-compose.yml` in this repository
(`docker compose up -d --build`).

### Updating

```bash
docker compose pull
docker compose up -d
```

## License

MIT
