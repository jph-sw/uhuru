import { eq } from "drizzle-orm";
import { db } from "#/db";
import { site as siteTable } from "#/db/schema";

export abstract class Sites {
	static getSites() {
		const sites = db.select().from(siteTable).all();

		return sites;
	}

	static getSite({ id }: { id: string }) {
		const site = db.select().from(siteTable).where(eq(siteTable.id, id)).get();

		return site;
	}

	static async createSite({ name, domain }: { name: string; domain: string }) {
		console.log("-> creating site", { name, domain });
		const id = name
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");

		const res = await db
			.insert(siteTable)
			.values({ id, name, domain, createdAt: new Date() })
			.returning();

		return res[0];
	}

	static async updateSite({
		id,
		name,
		domain,
		languages,
	}: {
		id: string;
		name?: string;
		domain?: string;
		languages?: string[];
	}) {
		const res = await db
			.update(siteTable)
			.set({ name, domain, languages })
			.where(eq(siteTable.id, id))
			.returning();

		return res[0];
	}
}
