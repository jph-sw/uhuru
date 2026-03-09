import { db } from "../../db";
import { site as siteTable } from "../../db/schema";
import { ulid } from "ulidx";

export abstract class Sites {
  static getSites() {
    const sites = db.select().from(siteTable).all();

    return sites;
  }

  static async createSite({ name, domain }: { name: string; domain: string }) {
    console.log("Creating Site");
    await db
      .insert(siteTable)
      .values({ id: ulid(), name, domain, createdAt: new Date() });
  }
}
