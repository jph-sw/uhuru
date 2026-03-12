import { and, eq } from "drizzle-orm";
import { ulid } from "ulidx";
import { db } from "../../db";
import { field as fieldTable } from "../../db/schema";

export abstract class Fields {
	static getFields({
		siteId,
		language,
	}: {
		siteId: string;
		language?: string;
	}) {
		if (language) {
			return db
				.select()
				.from(fieldTable)
				.where(
					and(eq(fieldTable.siteId, siteId), eq(fieldTable.language, language)),
				);
		}

		return db.select().from(fieldTable).where(eq(fieldTable.siteId, siteId));
	}

	static async updateField({ id, content }: { id: string; content: string }) {
		await db.update(fieldTable).set({ content }).where(eq(fieldTable.id, id));
	}

	static async deleteField({ id }: { id: string }) {
		await db.delete(fieldTable).where(eq(fieldTable.id, id));
	}

	static async createField({
		key,
		content,
		siteId,
		language = "en",
	}: {
		key: string;
		content: string;
		siteId: string;
		language?: string;
	}) {
		const id = ulid();

		await db
			.insert(fieldTable)
			.values({ id, key, content, createdAt: new Date(), siteId, language })
			.onConflictDoUpdate({
				target: [fieldTable.siteId, fieldTable.key, fieldTable.language],
				set: { content },
			});
	}
}
