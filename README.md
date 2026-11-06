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

| Layer     | Tech                                                          |
| --------- | ------------------------------------------------------------- |
| Framework | TanStack Start (React, Vite, TanStack Router/Query/Form)      |
| UI        | Tailwind CSS, Base UI                                         |
| API       | Elysia (mounted under `/api`), Better Auth                    |
| Database  | SQLite via Drizzle ORM (`bun:sqlite`)                         |
| Runtime   | Bun                                                           |

Frontend and API run as a single app on one port (3000 by default).

## Structure

```
uhuru/
├── src/
│   ├── routes/       # TanStack Start file routes (pages + /api handlers)
│   ├── data/         # Elysia API modules (sites, fields, content, invites, …)
│   ├── db/           # Drizzle schema, client and admin seed
│   ├── components/   # UI components
│   └── lib/          # Better Auth setup and helpers
├── drizzle/          # SQL migrations
├── data/             # SQLite database file (git-ignored)
└── server.ts         # Production server (Bun)
```

## Getting started

Requires [Bun](https://bun.sh). The app uses `bun:sqlite`, so it must run on Bun — the scripts already pass `--bun` to Vite, so always start it via `bun run`.

```bash
# Install dependencies
bun install

# Create your .env (see "Environment variables" below)
cp .env.example .env

# Create the database tables
bun db:migrate

# Create the admin user from ADMIN_* (only needed once; the production server does this automatically)
bun -e 'import { seed } from "./src/db/seed"; await seed()'

# Start the dev server on http://localhost:3000
bun run dev
```

### Environment variables

| Variable             | Description                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Random secret, at least 32 characters (`openssl rand -base64 32`)                             |
| `BETTER_AUTH_URL`    | The URL the app is reached at, e.g. `http://localhost:3000`. Must match the browser's origin. |
| `TRUSTED_ORIGINS`    | Optional, comma-separated list of additional allowed origins                                  |
| `ADMIN_NAME`         | Name of the initial admin user                                                                |
| `ADMIN_EMAIL`        | Email of the initial admin user                                                               |
| `ADMIN_PASSWORD`     | Password of the initial admin user                                                            |
| `PORT`               | Port for the production server (default `3000`)                                               |

If you get an **"Invalid origin"** error when signing in, `BETTER_AUTH_URL` (or `TRUSTED_ORIGINS`) doesn't match the URL you opened the app at.

## How it works

1. A developer registers as an **admin** and creates a site (with configurable supported languages)
2. The admin defines **fields** — named pieces of content (e.g. `hero.title`, `about.body`)
3. The admin invites a **client** via an invite link
4. The client creates an account and can edit the content of their site, translating it into the configured languages
5. The developer fetches content from the API (optionally specifying a language) and renders it on the website

## Self-hosting

**Requirements:** a server with Docker installed.

### 1. Create a `docker-compose.yml`

```yaml
services:
  app:
    image: ghcr.io/jph-sw/uhuru:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - db_data:/app/data
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

Uhuru is now running at `http://your-server-ip:3000`. On startup the container applies database migrations and creates the admin user from `ADMIN_*` if none exists.

If you put Uhuru behind a reverse proxy or domain, set `BETTER_AUTH_URL` to the public URL (e.g. `https://cms.example.com`).

The database is stored in the `db_data` volume and persists across updates.

### Updating

```bash
docker compose pull
docker compose up -d
```

## License

MIT
