# Contract tests

HTTP tests that every Uhuru backend must pass. They only talk to the API
over HTTP, so the same suite verifies `apps/api` (Bun) and, later,
`apps/api-dotnet`.

They cover sign-in/out and sessions, sites, fields, invites and joining,
users, and the public content endpoint including language fallback. The
expected behaviour is specified in
[`packages/openapi/uhuru.yaml`](../../packages/openapi/uhuru.yaml) and
[`docs/auth-contract.md`](../../docs/auth-contract.md).

## Running

Against `apps/api` with a throwaway database (recommended):

```bash
bun run test:contract            # from the repo root
```

This migrates a temporary SQLite database, starts the API on a random port,
runs the suite and cleans up. Your development database is not touched.

Against any running backend:

```bash
cd tests/contract
BASE_URL=http://localhost:3001 ORIGIN=http://localhost:3000 \
  ADMIN_EMAIL=… ADMIN_PASSWORD=… bun test
```

| Variable         | Meaning                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `BASE_URL`       | Backend to test (default `http://localhost:3001`)                          |
| `ORIGIN`         | `Origin` header to send; must be trusted by the backend. Defaults to `BETTER_AUTH_URL`, then `BASE_URL`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account the backend seeded at startup                 |

`bun test` here loads the repository's `.env`, so a backend started with
`bun run dev` works without extra variables. Note that the tests create
sites, users and invites; against a development backend, those end up in
its database.

The backend must:

- run the migrations and seed the admin user from `ADMIN_*` at startup
- trust `ORIGIN` (via `BETTER_AUTH_URL` or `TRUSTED_ORIGINS`)
- start with no special data; every test file creates what it needs
