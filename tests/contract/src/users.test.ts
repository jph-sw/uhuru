import { beforeAll, describe, expect, test } from "bun:test";
import {
	Client,
	createSite,
	joinedClient,
	type Site,
	signedInAdmin,
} from "./client";

describe("users", () => {
	let admin: Client;
	let site: Site;
	let client: Client;
	let email: string;

	beforeAll(async () => {
		admin = await signedInAdmin();
		site = await createSite(admin, "users");
		({ client, email } = await joinedClient(admin, site.id));
	});

	test("GET /api/users/site/:siteId lists the site's users", async () => {
		const res = await admin.get(`/api/users/site/${site.id}`);
		expect(res.status).toBe(200);

		const users = res.json as Record<string, unknown>[];
		expect(users).toHaveLength(1);
		expect(users[0]).toMatchObject({
			email,
			role: "user",
			siteId: site.id,
			emailVerified: false,
			banned: false,
		});
		expect(Object.keys(users[0]).sort()).toEqual(
			[
				"id",
				"name",
				"email",
				"emailVerified",
				"image",
				"createdAt",
				"updatedAt",
				"role",
				"banned",
				"banReason",
				"banExpires",
				"siteId",
			].sort(),
		);
	});

	test("a site without users returns []", async () => {
		const empty = await createSite(admin, "users-empty");
		const res = await admin.get(`/api/users/site/${empty.id}`);
		expect(res.status).toBe(200);
		expect(res.json).toEqual([]);
	});

	test("anonymous requests are 401, clients 403", async () => {
		const anon = await new Client().get(`/api/users/site/${site.id}`);
		expect(anon.status).toBe(401);
		expect(anon.text).toBe("Unauthorized");

		const asClient = await client.get(`/api/users/site/${site.id}`);
		expect(asClient.status).toBe(403);
		expect(asClient.text).toBe("Forbidden");
	});
});
