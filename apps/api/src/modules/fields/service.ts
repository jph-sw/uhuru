import { db } from "../../db";
import { field as fieldTable } from "../../db/schema";
import { ulid } from "ulidx";

export abstract class Fields {
  static getFields() {
    const sites = db.select().from(fieldTable).all();

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
