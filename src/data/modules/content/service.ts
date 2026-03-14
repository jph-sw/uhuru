import { eq } from "drizzle-orm";
import { db } from "#/db";
import { field as fieldTable, site as siteTable } from "#/db/schema";

export abstract class Content {
	static async getContent({
		siteId,
		language,
	}: {
		siteId: string;
		language?: string;
	}) {
		const site = db
			.select({ languages: siteTable.languages })
			.from(siteTable)
			.where(eq(siteTable.id, siteId))
			.get();

		const defaultLang = site?.languages?.[0] || "en";
		const targetLang = language || defaultLang;

		const fields = db
			.select({
				key: fieldTable.key,
				content: fieldTable.content,
				language: fieldTable.language,
			})
			.from(fieldTable)
			.where(eq(fieldTable.siteId, siteId))
			.all();

		const fieldsByKey = new Map<string, Record<string, string>>();

		for (const f of fields) {
			let byLang = fieldsByKey.get(f.key);
			if (!byLang) {
				byLang = {};
				fieldsByKey.set(f.key, byLang);
			}
			byLang[f.language] = f.content;
		}

		const result: Record<string, unknown> = {};

		for (const [key, byLang] of fieldsByKey.entries()) {
			let content = byLang[targetLang];

			if (!content && targetLang !== defaultLang) {
				content = byLang[defaultLang];
			}

			if (!content) {
				content = Object.values(byLang)[0];
			}

			if (content !== undefined) {
				const parts = key.split(".");
				let current = result;

				for (let i = 0; i < parts.length - 1; i++) {
					if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
						current[parts[i]] = {};
					}
					current = current[parts[i]] as Record<string, unknown>;
				}

				current[parts[parts.length - 1]] = content;
			}
		}

		return result;
	}
}
