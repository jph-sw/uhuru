# Auth contract

This is the specification for authentication and authorization in Uhuru, as
the frontend (`apps/web`) uses it. `apps/api` implements it with
[Better Auth](https://better-auth.com) 1.5 and its `admin` plugin. A second
backend (`apps/api-dotnet`) must behave exactly as described here; the auth
tests in `tests/contract` verify that.

Everything outside `/api/auth/*` is specified in
[`packages/openapi/uhuru.yaml`](../packages/openapi/uhuru.yaml). This
document covers only the parts that the OpenAPI spec doesn't: the
`/api/auth/*` endpoints, cookies, sessions, roles, and the invite/join flow.

Everything below was checked against the running Bun API. Where the current
behaviour is odd, it's listed under [Known quirks](#known-quirks). A
reimplementation should copy those quirks unless the project decides
otherwise.

## Conventions

- All endpoints live under `/api/auth`. The browser always calls them on the
  frontend's origin; the frontend proxies `/api/*` to the backend, so the API
  must not rely on CORS.
- Request and response bodies are JSON (`Content-Type: application/json`)
  unless stated otherwise.
- Timestamps in responses are ISO 8601 strings in UTC with milliseconds, e.g.
  `"2026-11-06T09:45:20.405Z"`.
- Error bodies of `/api/auth/*` endpoints have the shape
  `{ "message": string, "code": string }`.

## Configuration

| Variable             | Meaning                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Secret used to sign the session cookie (HMAC key, see [Cookies](#cookies)).                               |
| `BETTER_AUTH_URL`    | Public URL of the app, e.g. `http://localhost:3000`. Its origin is trusted, and `https://` enables secure cookies. |
| `TRUSTED_ORIGINS`    | Optional comma-separated list of additional trusted origins.                                              |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial admin account, created at startup (see [Admin seeding](#admin-seeding)).   |

## Cookies

### `better-auth.session_token`

Holds the session. Set by sign-in, read by every authenticated request, and
cleared by sign-out.

- **Value:** `<token>.<signature>`, URL-encoded with `encodeURIComponent`.
  - `token`: the session token, 32 random alphanumeric characters, stored in
    `session.token`.
  - `signature`: `base64(HMAC-SHA256(key = BETTER_AUTH_SECRET, message = token))`.
    This is standard base64 with `=` padding, so `+`, `/` and `=` appear
    URL-encoded (`%2B`, `%2F`, `%3D`) in the header.
  - Example: `better-auth.session_token=J0PXERk9CXd8xjrKedSWaLWbEXC3tDSu.8LZAaqEljgZpe1enoLroxKgb1IKny4BueX1RhurETeQ%3D`
- **Attributes:** `Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`
  - With `rememberMe: false` on sign-in, there is no `Max-Age`, which makes
    it a browser-session cookie.
  - When `BETTER_AUTH_URL` starts with `https://`, the cookie is named
    `__Secure-better-auth.session_token` and also gets `Secure`. This applies
    to all cookies in this section.
- **Validation:** A cookie whose signature doesn't verify, or whose token
  doesn't match an unexpired session row, counts as "no session". Requests
  carrying it behave like anonymous requests and get no error. A bare token
  without a signature is also invalid.

### `better-auth.dont_remember`

Set to `true.<signature>` (signed the same way) only when signing in with
`rememberMe: false`. It has the same attributes and no `Max-Age`. The
frontend never sends `rememberMe`, so this cookie doesn't normally appear.

### `better-auth.session_data`

Not used, because cookie caching is disabled. It only appears in the
clearing headers of sign-out.

## Sessions

- **Lifetime:** 7 days (`expiresIn = 604800 s`). A sign-in creates a row in
  `session` with `expiresAt = now + 7 days`, `token`, `userId`, `ipAddress`
  (from `X-Forwarded-For`, or empty) and `userAgent`.
- **Sliding refresh:** When an authenticated request reads a session that is
  more than 1 day old (`updateAge = 86400 s`, i.e.
  `expiresAt - 7 days + 1 day <= now`), the backend sets
  `expiresAt = now + 7 days` and sends a fresh `Set-Cookie` with the same
  token and `Max-Age=604800`. This applies to `GET /api/auth/get-session` and
  to the protected `/api/*` routes. The frontend forwards such cookies to the
  browser during SSR.
- **Expiry:** Once `expiresAt` has passed, the session is invalid.
- **Multiple sessions:** Each sign-in creates a new session. Older sessions
  stay valid until they expire or are signed out.

## CSRF / origin check

`POST` requests to `/api/auth/*` that **carry a cookie header** must come
from a trusted origin. Trusted origins are the origin of `BETTER_AUTH_URL`
plus everything in `TRUSTED_ORIGINS`.

| Request                                             | Result                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| No `Cookie` header                                  | No origin check                                                         |
| Cookie and trusted `Origin`                         | Allowed                                                                 |
| Cookie and untrusted `Origin`                       | `403 {"message":"Invalid origin","code":"INVALID_ORIGIN"}`              |
| Cookie, no `Origin` (and no `Referer`)              | `403 {"message":"Missing or null Origin","code":"MISSING_OR_NULL_ORIGIN"}` |

`GET` requests are not origin-checked. The other `/api/*` routes don't do
an origin check at all.

## User object

`user` objects in auth responses have exactly these fields:

| Field           | Type                 | Notes                                                                        |
| --------------- | -------------------- | ---------------------------------------------------------------------------- |
| `id`            | string               | 32 random alphanumeric characters                                            |
| `name`          | string               |                                                                              |
| `email`         | string               | Unique, stored lowercased                                                    |
| `emailVerified` | boolean              | Always `false` in Uhuru                                                      |
| `image`         | string \| null       | Always `null` in Uhuru                                                       |
| `createdAt`     | string (date-time)   |                                                                              |
| `updatedAt`     | string (date-time)   |                                                                              |
| `role`          | string \| null       | `"admin"` or `"user"` (see [Roles](#roles))                                  |
| `banned`        | boolean \| null      | `false` unless the user was banned                                           |
| `banReason`     | string \| null       |                                                                              |
| `banExpires`    | string \| null       | date-time                                                                    |
| `site_id`       | string \| null       | Site a client belongs to; `null` for admins. **snake_case** in auth responses; it's stored in `user.site_id`. |

`/api/users/site/{siteId}` returns the same users in the shape of the
OpenAPI spec, which spells this field `siteId`.

Field order in JSON doesn't matter.

## Session object

| Field            | Type               | Notes                                      |
| ---------------- | ------------------ | ------------------------------------------ |
| `id`             | string             | 32 random alphanumeric characters          |
| `token`          | string             | Same token as in the cookie (unsigned)     |
| `userId`         | string             |                                            |
| `expiresAt`      | string (date-time) |                                            |
| `createdAt`      | string (date-time) |                                            |
| `updatedAt`      | string (date-time) |                                            |
| `ipAddress`      | string \| null     | May be `""`                                |
| `userAgent`      | string \| null     |                                            |
| `impersonatedBy` | string \| null     | Always `null` in Uhuru                     |

## Endpoints the frontend calls

| Caller in `apps/web`                                       | Endpoint                         |
| ---------------------------------------------------------- | -------------------------------- |
| `authClient.signIn.email` (sign-in page, after joining)    | `POST /api/auth/sign-in/email`   |
| `authClient.signOut` (admin sidebar, client dashboard)     | `POST /api/auth/sign-out`        |
| `getSession` in `src/lib/session.ts` (route guards, SSR and browser) | `GET /api/auth/get-session` |
| `authClient` itself, after sign-in and sign-out (response unused) | `GET /api/auth/get-session` |

No other `/api/auth/*` endpoint is used. A reimplementation should answer
any other path or method under `/api/auth/` with `404`. The Bun API returns
404 with an empty body for both.

### `POST /api/auth/sign-in/email`

Signs in with email and password.

Request body (the frontend sends only `email` and `password`):

```json
{ "email": "admin@example.com", "password": "secret", "rememberMe": true, "callbackURL": "/" }
```

| Field         | Type    | Required | Notes                                                       |
| ------------- | ------- | -------- | ----------------------------------------------------------- |
| `email`       | string  | yes      | Must be a valid email address; matched case-insensitively   |
| `password`    | string  | yes      |                                                             |
| `rememberMe`  | boolean | no       | Default `true`. `false` gives a browser-session cookie.     |
| `callbackURL` | string  | no       | Unused by Uhuru; it only switches `redirect` to `true`      |

Responses:

| Status | Body                                                                                                 | When                                   |
| ------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 200    | `{ "redirect": false, "token": "<session token>", "user": <User> }` and `Set-Cookie: better-auth.session_token=…` | Credentials are valid       |
| 400    | `{"message":"[body.password] Invalid input: expected string, received undefined","code":"VALIDATION_ERROR"}` | Missing or non-string field (message names the field) |
| 400    | `{"message":"Invalid email","code":"INVALID_EMAIL"}`                                                  | Malformed email                        |
| 401    | `{"message":"Invalid email or password","code":"INVALID_EMAIL_OR_PASSWORD"}`                          | Unknown email or wrong password        |
| 403    | `{"message":"You have been banned from this application. Please contact support if you believe this is an error.","code":"BANNED_USER"}` | `user.banned` is true |
| 403    | `INVALID_ORIGIN` / `MISSING_OR_NULL_ORIGIN`                                                           | See [origin check](#csrf--origin-check) |

The frontend shows `error.message` on failure.

### `GET /api/auth/get-session`

Returns the current session. The session cookie is read; no body.

| Status | Body                                       | When                                       |
| ------ | ------------------------------------------ | ------------------------------------------ |
| 200    | `{ "session": <Session>, "user": <User> }` | Valid session                              |
| 200    | `null`                                     | No cookie, invalid signature, unknown or expired session |

The response may include a refreshed `Set-Cookie` (see
[Sessions](#sessions)). The frontend calls this endpoint during SSR with the
browser's cookie header forwarded, and the frontend server forwards any
`Set-Cookie` from it to the browser.

### `POST /api/auth/sign-out`

Ends the current session. The frontend sends the body `{}`.

| Status | Body                  | Headers |
| ------ | --------------------- | ------- |
| 200    | `{"success": true}`   | Clears all three cookies: `better-auth.session_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`, the same for `better-auth.session_data` and `better-auth.dont_remember` |

- If the cookie names a valid session, that session row is deleted.
- Without a session it still answers `200 {"success": true}` and clears the
  cookies.
- With a cookie, the [origin check](#csrf--origin-check) applies.

## Roles

`user.role` is a free-form string. Uhuru uses two values:

| Role      | Who                                                     | `site_id`   |
| --------- | ------------------------------------------------------- | ----------- |
| `"admin"` | The developer. Created by [admin seeding](#admin-seeding). | `null`  |
| `"user"`  | A client, created by [joining](#invites-and-joining).   | Site ID     |

The `/api/*` routes have three access levels. The OpenAPI spec marks the
first two with the `session` security scheme.

| Level         | Check                                                     | Failure                          |
| ------------- | --------------------------------------------------------- | -------------------------------- |
| **admin**     | Valid session and `role === "admin"`                      | `401 Unauthorized` without a session, `403 Forbidden` for other roles. Both bodies are `text/plain`. |
| **auth**      | Valid session (any role)                                  | `401 Unauthorized` (`text/plain`) |
| **public**    | None                                                      |                                  |

| Route                                    | Level  |
| ---------------------------------------- | ------ |
| `GET /api/sites`                         | admin  |
| `POST /api/sites`                        | admin  |
| `GET /api/sites/{id}`                    | auth   |
| `PATCH /api/sites/{id}`                  | admin  |
| `POST /api/fields`                       | admin  |
| `GET /api/fields/site/{siteId}`          | auth   |
| `PATCH /api/fields/{id}`                 | auth   |
| `DELETE /api/fields/{id}`                | auth   |
| `GET /api/users/site/{siteId}`           | admin  |
| `GET /api/invite/site/{siteId}`          | public |
| `GET /api/invite/{code}`                 | public |
| `GET /api/invite/check/{code}`           | public |
| `POST /api/invite`                       | public |
| `POST /api/join`                         | public |
| `GET /api/content/{siteId}`              | public |
| `GET /api/`                              | public |

The **auth** level doesn't check that a client belongs to the site it
reads or edits. The check is purely "signed in".

### Frontend route guards

These run in `beforeLoad`/`loader`, both during SSR and in the browser, and
use `GET /api/auth/get-session`:

| Route                     | No session                  | Admin               | Client (`role: "user"`)                 |
| ------------------------- | --------------------------- | ------------------- | --------------------------------------- |
| `/`                       | → `/auth/sign-in`           | → `/admin`          | → `/dashboard/s/{site_id}` (→ `/admin` if `site_id` is empty) |
| `/admin/**`               | → `/auth/sign-in`           | allowed             | → `/dashboard/s/{site_id}`              |
| `/auth/sign-in`           | allowed                     | → `/`               | → `/`                                   |
| `/dashboard/s/{site}`     | page renders, API calls 401 | allowed             | allowed                                 |

## Admin seeding

At startup, before accepting requests, the API makes sure an admin exists:

1. If any user with `role = "admin"` exists, do nothing.
2. Otherwise, if `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` are all set,
   create that user with `role = "admin"` and an email/password account.
3. Otherwise log an error and continue without an admin.

The contract tests sign in with `ADMIN_EMAIL`/`ADMIN_PASSWORD`, so they rely
on this.

## Invites and joining

Clients get accounts only through invites. There is no public sign-up:
`POST /api/auth/sign-up/email` answers
`400 {"message":"Email and password sign up is not enabled","code":"EMAIL_PASSWORD_SIGN_UP_DISABLED"}`.

1. **Create:** An admin opens *Invites* for a site, and the frontend calls
   `POST /api/invite` with `{ "maxUses": "1", "siteId": "<site>" }`. The
   response is an array with the new invite. `code` is a ULID, and
   `maxUses` is a **string** (default `"1"`).
2. **Share:** The admin copies the link `<origin>/auth/join/{code}`.
3. **Check:** The join page's loader calls `GET /api/invite/check/{code}`:
   - `{"valid": true, "invite": <Invite>}` if the invite exists and has
     fewer rows in `invite_use` than `Number(maxUses)`.
   - `{"valid": false}` otherwise, and the frontend redirects to `/`.
4. **Join:** The form calls `POST /api/join` with
   `{ code, name, email, password, siteId }`. The frontend sends
   `siteId = invite.siteId`.
   - The invite is checked again (step 3).
   - If it's valid, a user is created with `role = "user"` and
     `site_id = body.siteId`. They get an email/password account, which
     bypasses Better Auth's sign-up rules (see quirks). A row
     `{ id: ULID, userId, inviteCode: code }` is added to `invite_use`.
     Response: `200 {"success": true}`.
   - If it's invalid: `200` with an **empty body**.
5. **Sign in:** On success, the frontend immediately calls
   `POST /api/auth/sign-in/email` with the same email and password, then
   navigates to `/`. That redirects a client to `/dashboard/s/{site_id}`.

## Password storage

Shared with the database, so a second backend can verify existing users.

- Table `account`, one row per user with `providerId = "credential"`,
  `accountId = userId`, and `password = "<salt>:<key>"`.
- `salt`: 16 random bytes, hex-encoded (32 characters). The **hex string
  itself** (its UTF-8 bytes) is the scrypt salt.
- `key`: `scrypt(password.normalize("NFKC"), salt, N = 16384, r = 16, p = 1, dkLen = 64)`,
  hex-encoded (128 characters).
- Verification compares in constant time.

## Known quirks

The current Bun API behaves like this. A reimplementation should match it so
the same contract tests pass, unless the project decides to change it in
both backends.

1. **Duplicate email on join:** `POST /api/join` with an email that already
   exists answers `200` with `text/plain` body
   `User already exists. Use another email.`. A malformed email answers `200`
   with `text/plain` body `Invalid email`. Both happen because Better Auth's
   error isn't mapped to a status. The frontend then tries to sign in, and
   that sign-in fails.
2. **No password policy on join:** Users created through join skip Better
   Auth's minimum password length (8). Any non-empty string works.
3. **Invite routes are public:** Anyone can create or list invites, and
   `POST /api/invite` doesn't check that the site exists. SQLite foreign keys
   are not enforced.
4. **`siteId` from the request:** `POST /api/join` uses `siteId` from the
   body, not the invite's site.
5. **Sign-out with an empty body:** `POST /api/auth/sign-out` with
   `Content-Type: application/json` and an empty body answers `500`. The
   frontend always sends `{}`.
6. **Clients can't add translations:** `POST /api/fields` is admin-only, so
   a client saving a field that has no row in the selected language yet gets
   `403`. Editing existing rows (`PATCH`) works.
7. **Error formats differ:** `/api/auth/*` errors are JSON
   `{message, code}`. Other `/api/*` errors are `text/plain` (`Unauthorized`,
   `Forbidden`, `Not Found`) or Elysia validation objects (`422`).
