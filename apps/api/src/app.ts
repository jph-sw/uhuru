import { Elysia } from "elysia";
import { macros } from "#/data/macros";
import { content } from "#/data/modules/content";
import { fields } from "#/data/modules/fields";
import { invite } from "#/data/modules/invite";
import { join } from "#/data/modules/join";
import { sites } from "#/data/modules/sites";
import { users } from "#/data/modules/users";
import { auth } from "#/lib/auth";

/** All Uhuru endpoints under /api, without Better Auth. */
export const api = new Elysia({ prefix: "/api" })
	.use(macros)
	.get("/", "Hello Elysia!")
	.use(sites)
	.use(fields)
	.use(invite)
	.use(join)
	.use(users)
	.use(content);

/** The complete API server: Better Auth under /api/auth/*, everything else under /api/*. */
export const app = new Elysia()
	.get("/api/auth/*", ({ request }) => auth.handler(request), {
		parse: "none",
		detail: { hide: true },
	})
	.post("/api/auth/*", ({ request }) => auth.handler(request), {
		parse: "none",
		detail: { hide: true },
	})
	.use(api);

export type App = typeof app;
