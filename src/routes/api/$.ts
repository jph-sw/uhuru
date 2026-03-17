import { treaty } from "@elysiajs/eden";
import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";

type AppType = Awaited<ReturnType<typeof getApp>>;

const getApp = createIsomorphicFn()
	.server(async () => {
		const { Elysia } = await import("elysia");
		const { content } = await import("#/data/modules/content");
		const { fields } = await import("#/data/modules/fields");
		const { invite } = await import("#/data/modules/invite");
		const { join } = await import("#/data/modules/join");
		const { sites } = await import("#/data/modules/sites");
		const { users } = await import("#/data/modules/users");
		const { seed } = await import("#/db/seed");

		seed();

		return new Elysia({ prefix: "/api" })
			.get("/", "Hello Elysia!")
			.use(sites)
			.use(fields)
			.use(invite)
			.use(join)
			.use(users)
			.use(content);
	})
	.client(() => null as never);

export const Route = createFileRoute("/api/$")({
	server: {
		handlers: {
			GET: async ({ request }) => (await getApp()).fetch(request),
			POST: async ({ request }) => (await getApp()).fetch(request),
			PATCH: async ({ request }) => (await getApp()).fetch(request),
			DELETE: async ({ request }) => (await getApp()).fetch(request),
		},
	},
});

export const getTreaty = createIsomorphicFn()
	.server(async () => ({ api: treaty<AppType>(await getApp()).api }))
	.client(() => ({ api: treaty<AppType>("http://localhost:3000").api }));
