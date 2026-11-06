import { beforeAll, describe, expect, test } from "bun:test";
import { Client, createSite, RUN, type Site, signedInAdmin } from "./client";

/**
 * GET /api/content/:siteId is the public endpoint websites read their texts
 * from. Keys are split on "." into nested objects. For each key the content is
 * taken from the requested language, else the site's default language (the
 * first in `languages`), else any language that has the key.
 */
describe("public content", () => {
	let admin: Client;
	let site: Site;
	const anon = new Client();

	const content = async (language?: string) => {
		const res = await anon.get(
			`/api/content/${site.id}${language ? `?language=${language}` : ""}`,
		);
		expect(res.status).toBe(200);
		return res.json;
	};

	beforeAll(async () => {
		admin = await signedInAdmin();
		site = await createSite(admin, "content");
		await admin.patch(`/api/sites/${site.id}`, { languages: ["de", "en"] });

		const add = (key: string, language: string, value: string) =>
			admin.post("/api/fields", {
				key,
				content: value,
				siteId: site.id,
				language,
			});

		await add("hero.title", "de", "Hallo");
		await add("hero.title", "en", "Hello");
		await add("hero.subtitle", "de", "Nur Deutsch");
		await add("about.body.text", "en", "Only English");
		await add("footer", "fr", "Seulement français");
	});

	test("without ?language the site's default language is used", async () => {
		expect(await content()).toEqual({
			hero: { title: "Hallo", subtitle: "Nur Deutsch" },
			about: { body: { text: "Only English" } },
			footer: "Seulement français",
		});
	});

	test("the requested language wins, falling back to the default language, then any language", async () => {
		expect(await content("en")).toEqual({
			hero: { title: "Hello", subtitle: "Nur Deutsch" },
			about: { body: { text: "Only English" } },
			footer: "Seulement français",
		});
	});

	test("an unknown language falls back like a missing translation", async () => {
		expect(await content("es")).toEqual(await content("de"));
	});

	test("an unknown site returns {}", async () => {
		const res = await anon.get(`/api/content/unknown-${RUN}`);
		expect(res.status).toBe(200);
		expect(res.json).toEqual({});
	});

	test("the endpoint is public", async () => {
		const res = await new Client().get(`/api/content/${site.id}`);
		expect(res.status).toBe(200);
	});
});
