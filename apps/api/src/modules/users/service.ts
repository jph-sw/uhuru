import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user as usersTable } from "../../db/schema";

export abstract class Users {
	static getUsers({ siteId }: { siteId?: string }) {
		const users = db
			.select()
			.from(usersTable)
			.where(eq(usersTable.site_id, siteId!));

		return users;
	}
}
