import { beforeAll, describe, expect, test } from "bun:test";
import {
	Client,
	createSite,
	ISO_DATE,
	joinedClient,
	RUN,
	type Site,
	signedInAdmin,
} from "./client";

describe("sites", () => {
	let admin: Client;
	let site: Site;
	let client: Client;

	beforeAll(async () => {
		admin = await signedInAdmin();
		site = await createSite(admin, "sites");
		client = (await joinedClient(admin, site.id)).client;
	});

	test("POST /api/sites creates a site with a slug id and default language", () => {
		expect(site).toMatchObject({
			id: `contract-sites-${RUN}`,
			name: `Contract sites ${RUN}`,
			domain: `sites-${RUN}.contract.test`,
			languages: ["en"],
		});
		expect(site.createdAt).toMatch(ISO_DATE);
		expect(site.updatedAt).toMatch(ISO_DATE);
	});

	test("GET /api/sites lists all sites for admins", async () => {
		const res = await admin.get("/api/sites");
		expect(res.status).toBe(200);
		expect(res.json).toContainEqual(site);
	});

	test("GET /api/sites/:id returns the site", async () => {
		const res = await admin.get(`/api/sites/${site.id}`);
		expect(res.status).toBe(200);
		expect(res.json).toEqual(site);
	});

	test("GET /api/sites/:id is 404 for an unknown site", async () => {
		const res = await admin.get(`/api/sites/does-not-exist-${RUN}`);
		expect(res.status).toBe(404);
		expect(res.text).toBe("Not Found");
	});

	test("PATCH /api/sites/:id updates fields and returns the site", async () => {
		const own = await createSite(admin, "sites-patch");
		const res = await admin.patch(`/api/sites/${own.id}`, {
			name: `Renamed ${RUN}`,
			languages: ["de", "en"],
		});
		expect(res.status).toBe(200);
		expect(res.json).toMatchObject({
			id: own.id,
			name: `Renamed ${RUN}`,
			domain: own.domain,
			languages: ["de", "en"],
		});

		const after = await admin.get(`/api/sites/${own.id}`);
		expect((after.json as Site).languages).toEqual(["de", "en"]);
	});

	test("POST /api/sites validates the body (422)", async () => {
		const res = await admin.post("/api/sites", { name: "missing domain" });
		expect(res.status).toBe(422);
	});

	describe("access", () => {
		test("anonymous requests are 401", async () => {
			const anon = new Client();
			for (const res of [
				await anon.get("/api/sites"),
				await anon.post("/api/sites", { name: "x", domain: "x" }),
				await anon.get(`/api/sites/${site.id}`),
				await anon.patch(`/api/sites/${site.id}`, { name: "x" }),
			]) {
				expect(res.status).toBe(401);
				expect(res.text).toBe("Unauthorized");
			}
		});

		test("clients get 403 on admin routes", async () => {
			for (const res of [
				await client.get("/api/sites"),
				await client.post("/api/sites", { name: "x", domain: "x" }),
				await client.patch(`/api/sites/${site.id}`, { name: "x" }),
			]) {
				expect(res.status).toBe(403);
				expect(res.text).toBe("Forbidden");
			}
		});

		test("clients can read a site", async () => {
			const res = await client.get(`/api/sites/${site.id}`);
			expect(res.status).toBe(200);
			expect((res.json as Site).id).toBe(site.id);
		});
	});
});
