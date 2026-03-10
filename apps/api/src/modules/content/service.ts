import { eq } from "drizzle-orm";
import { db } from "../../db";
import { field as fieldTable } from "../../db/schema";

export abstract class Content {
  static async getContent({ siteId }: { siteId: string }) {
    const fields = db
      .select({ key: fieldTable.key, content: fieldTable.content })
      .from(fieldTable)
      .where(eq(fieldTable.siteId, siteId))
      .all();

    const result: Record<string, unknown> = {};

    for (const { key, content } of fields) {
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

    return result;
  }
}
