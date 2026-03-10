import { eq } from "drizzle-orm";
import { db } from "../../db";
import { field as fieldTable } from "../../db/schema";
import { ulid } from "ulidx";

export abstract class Fields {
  static getFields({ siteId }: { siteId: string }) {
    const sites = db
      .select()
      .from(fieldTable)
      .where(eq(fieldTable.siteId, siteId));

    return sites;
  }

  static async createField({
    key,
    content,
    siteId,
  }: {
    key: string;
    content: string;
    siteId: string;
  }) {
    const id = ulid();

    await db
      .insert(fieldTable)
      .values({ id, key, content, createdAt: new Date(), siteId });
  }
}
