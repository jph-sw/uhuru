import { db } from "../../db";
import { site as siteTable } from "../../db/schema";

export abstract class Sites {
  static getSites() {
    const sites = db.select().from(siteTable).all();

    return sites;
  }

  static async createSite({ name, domain }: { name: string; domain: string }) {
    const id = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await db
      .insert(siteTable)
      .values({ id, name, domain, createdAt: new Date() });
  }
}
