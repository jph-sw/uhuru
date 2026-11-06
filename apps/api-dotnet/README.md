# apps/api-dotnet

**Placeholder. There's no code here yet.**

This will be a second Uhuru backend written in ASP.NET Core. The frontend
(`apps/web`) will work with it unchanged, because the frontend only talks to
its backend over HTTP through a documented contract:

| Contract                    | Where                                                                 |
| --------------------------- | --------------------------------------------------------------------- |
| `/api/*` (sites, fields, invites, join, users, content) | [`packages/openapi/uhuru.yaml`](../../packages/openapi/uhuru.yaml), generated from `apps/api` |
| `/api/auth/*`, cookies, sessions, roles, invites | [`docs/auth-contract.md`](../../docs/auth-contract.md) |
| Behaviour, checked end to end | [`tests/contract`](../../tests/contract), a `bun test` suite that runs against any `BASE_URL` |

## Plan

1. Implement every operation in `uhuru.yaml` with the same paths, status
   codes and response shapes. Error bodies matter too: `text/plain`
   `Unauthorized`/`Forbidden`/`Not Found`, and `422` for invalid bodies.
2. Implement the auth endpoints from `docs/auth-contract.md`: sign-in,
   get-session, sign-out, the `better-auth.session_token` cookie
   (`token.base64(HMAC-SHA256(secret, token))`), the 7-day sliding session,
   the origin check, roles, admin seeding from `ADMIN_*`, and join.
3. Use the same SQLite schema (`apps/api/drizzle/*.sql`) and the same
   password hashing (scrypt, see the auth contract), so both backends can
   run on the same database.
4. Read the same environment variables: `API_PORT`, `DATABASE_PATH`,
   `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TRUSTED_ORIGINS`, `ADMIN_*`.
5. Verify with the contract tests:

   ```bash
   cd tests/contract
   BASE_URL=http://localhost:3001 ORIGIN=http://localhost:3000 \
     ADMIN_EMAIL=… ADMIN_PASSWORD=… bun test
   ```

6. Add a `dotnet` entry to the `contract` job matrix in
   `.github/workflows/ci.yml`, with an `actions/setup-dotnet` step, its
   migrate command (or none, if it migrates on startup) and its start
   command.
7. Add a Dockerfile target (or a separate Dockerfile) whose image can
   replace the `api` service in `docker-compose.yml`. The `web` image stays
   as it is; only `API_URL` has to point at the new service.
