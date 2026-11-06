import { beforeAll, describe, expect, test } from "bun:test";
import {
	Client,
	createSite,
	ISO_DATE,
	joinedClient,
	type Site,
	signedInAdmin,
} from "./client";

type Field = {
	id: string;
	key: string;
	language: string;
	content: string;
	siteId: string;
	createdAt: string;
	updatedAt: string;
};

describe("fields", () => {
	let admin: Client;
	let client: Client;
	let site: Site;

	const list = async (as: Client, language?: string) => {
		const res = await as.get(
			`/api/fields/site/${site.id}${language ? `?language=${language}` : ""}`,
		);
		expect(res.status).toBe(200);
		return res.json as Field[];
	};

	beforeAll(async () => {
		admin = await signedInAdmin();
		site = await createSite(admin, "fields");
		client = (await joinedClient(admin, site.id)).client;
	});

	test("POST /api/fields answers 200 with an empty body", async () => {
		const res = await admin.post("/api/fields", {
			key: "hero.title",
			content: "Hello",
			siteId: site.id,
		});
		expect(res.status).toBe(200);
		expect(res.text).toBe("");
	});

	test("the language defaults to en", async () => {
		const fields = await list(admin);
		expect(fields).toHaveLength(1);
		expect(fields[0]).toMatchObject({
			key: "hero.title",
			language: "en",
			content: "Hello",
			siteId: site.id,
		});
		expect(fields[0].id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/); // ULID
		expect(fields[0].createdAt).toMatch(ISO_DATE);
	});

	test("POST with the same site, key and language updates the content", async () => {
		await admin.post("/api/fields", {
			key: "hero.title",
			content: "Hello again",
			siteId: site.id,
			language: "en",
		});
		const fields = await list(admin, "en");
		expect(fields).toHaveLength(1);
		expect(fields[0].content).toBe("Hello again");
	});

	test("GET filters by ?language", async () => {
		await admin.post("/api/fields", {
			key: "hero.title",
			content: "Hallo",
			siteId: site.id,
			language: "de",
		});

		expect(await list(admin)).toHaveLength(2);
		const de = await list(admin, "de");
		expect(de).toHaveLength(1);
		expect(de[0]).toMatchObject({ language: "de", content: "Hallo" });
		expect(await list(admin, "fr")).toEqual([]);
	});

	test("PATCH /api/fields/:id updates the content (any signed-in user)", async () => {
		const [field] = await list(admin, "de");

		const res = await client.patch(`/api/fields/${field.id}`, {
			content: "Hallo Welt",
		});
		expect(res.status).toBe(200);
		expect(res.text).toBe("");

		const [after] = await list(admin, "de");
		expect(after).toMatchObject({ id: field.id, content: "Hallo Welt" });
	});

	test("DELETE /api/fields/:id removes the field", async () => {
		await admin.post("/api/fields", {
			key: "temp",
			content: "remove me",
			siteId: site.id,
		});
		const temp = (await list(admin)).find((f) => f.key === "temp") as Field;

		const res = await admin.delete(`/api/fields/${temp.id}`);
		expect(res.status).toBe(200);
		expect(res.text).toBe("");
		expect((await list(admin)).some((f) => f.key === "temp")).toBe(false);
	});

	test("POST validates the body (422)", async () => {
		const res = await admin.post("/api/fields", { key: "x", siteId: site.id });
		expect(res.status).toBe(422);
	});

	describe("access", () => {
		test("anonymous requests are 401", async () => {
			const anon = new Client();
			for (const res of [
				await anon.post("/api/fields", {
					key: "x",
					content: "x",
					siteId: site.id,
				}),
				await anon.get(`/api/fields/site/${site.id}`),
				await anon.patch("/api/fields/anything", { content: "x" }),
				await anon.delete("/api/fields/anything"),
			]) {
				expect(res.status).toBe(401);
				expect(res.text).toBe("Unauthorized");
			}
		});

		test("clients can list fields but not create them (403)", async () => {
			expect((await list(client)).length).toBeGreaterThan(0);

			const res = await client.post("/api/fields", {
				key: "client.key",
				content: "x",
				siteId: site.id,
			});
			expect(res.status).toBe(403);
			expect(res.text).toBe("Forbidden");
		});
	});
});
