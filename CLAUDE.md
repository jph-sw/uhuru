# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Uhuru is a headless CMS for developers — developers build sites, clients edit content. It's a full-stack monorepo with a TypeScript/Bun backend (Elysia) and a React frontend (Vite). Status: work in progress, not production-ready.

## Commands

### Development
```bash
bun install                          # Install all workspace dependencies
bun run dev                          # Run both apps in parallel (api + web)
```

### API (apps/api/)
```bash
bun run --env-file=../../.env --watch src/index.ts  # Dev with watch
```

### Web (apps/web/)
```bash
bun run dev       # Vite dev server (port 3000)
bun run build     # Production build
bun run test      # Vitest
bun run check     # Biome format + lint
bun run format    # Biome format only
bun run lint      # Biome lint only
```

### Database
```bash
# Drizzle migrations generated from schema.ts
# Config: drizzle.config.ts → migrations in ./migrations/
# SQLite file: apps/api/data/database.sqlite
```

## Architecture

```
uhuru/
├── apps/
│   ├── api/     # Elysia backend (port 3001)
│   └── web/     # React + Vite frontend (port 3000)
└── packages/
    └── types/   # Shared TypeScript types (AuthConfig)
```

### Backend (apps/api/)

- **Framework:** Elysia (Bun) with Better Auth + Drizzle ORM (SQLite)
- **Entry:** `src/index.ts` — mounts CORS, auth, and 6 feature modules
- **Auth guards:** `src/macros.ts` — `@auth` (session required) and `@admin` (admin role required) macros used inline on routes
- **Modules in `src/modules/`:** `sites`, `fields`, `invite`, `join`, `users`, `content`
  - Each module has a route file, a service class (static methods), and a model class (TypeBox validation schemas)
- **Database schema:** `src/db/schema.ts` — tables: `user`, `session`, `account`, `verification`, `site`, `field`, `invite`, `invite_use`
- **Content model:** Fields use dotted keys (e.g., `hero.title`) which the `content` module assembles into nested JSON objects for the public API
- **Seeding:** On startup, creates admin user from `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars if no admin exists

### Frontend (apps/web/)

- **Routing:** TanStack Router (file-based, auto-generates `src/routeTree.gen.ts` — do not edit)
- **Route layout:**
  - `_authenticated.tsx` wraps all routes requiring login
  - `_admin.tsx` wraps all admin routes with sidebar
  - `dashboard.s.$site.index.tsx` is the client content editor
  - `auth/sign-in.tsx` and `auth/join.$code.index.tsx` are public
- **API client:** `src/lib/api.ts` uses `@elysiajs/eden` treaty for end-to-end type safety; falls back to `window.location.origin` if `VITE_API_URL` is not set
- **Auth client:** `src/lib/auth-client.ts` using `better-auth/react` with admin plugin
- **Data fetching:** React Query with query options pattern in `src/data/query-options-*.ts`
- **UI components:** shadcn-style in `src/components/ui/`; path alias `#/*` → `./src/*`

### Production Build

In Docker, the frontend is built to `apps/web/dist/` and copied to `apps/api/public/`. The API serves the SPA and falls back to `index.html` for non-API routes. Single container on port 3001.

## Environment

Copy `.env.example` to `.env`. Required vars:
- `BETTER_AUTH_SECRET` — min 32 chars
- `BETTER_AUTH_URL` — e.g. `http://localhost:3001`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — seeded on first run
- `TRUSTED_ORIGINS` — comma-separated allowed origins (optional)

## Code Style

- **Formatter/Linter:** Biome 2.x — tabs, double quotes
- **Do not edit:** `src/routeTree.gen.ts`, `src/styles.css` (auto-generated)
- **Pattern:** New API features follow module structure — route + service + model files
