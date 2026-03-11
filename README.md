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

| Layer    | Tech                                                  |
| -------- | ----------------------------------------------------- |
| Frontend | React, Vite, TanStack Router/Query/Form, Tailwind CSS |
| Backend  | Elysia, Better Auth, Drizzle ORM, SQLite              |
| Runtime  | Bun                                                   |

## Structure

```
uhuru/
├── apps/
│   ├── api/        # Elysia backend (port 3001)
│   └── web/        # React frontend (port 3000)
└── packages/
    └── types/      # Shared TypeScript types
```

## Getting started

```bash
# Install dependencies
bun install

# Run everything
bun run --parallel --workspaces dev
```

Requires a `.env` file at the root — see `.env.example`.

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
      - "3001:3001"
    env_file:
      - .env
    volumes:
      - db_data:/app/apps/api/data
    restart: unless-stopped

volumes:
  db_data:
```

### 2. Create a `.env`

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://your-server-ip:3001

ADMIN_NAME=Your Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
```

### 3. Start

```bash
docker compose up -d
```

Uhuru is now running at `http://your-server-ip:3001`.

The database is stored in the `db_data` volume and persists across updates.

### Updating

```bash
docker compose pull
docker compose up -d
```

## License

MIT
