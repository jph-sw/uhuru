import { eq } from "drizzle-orm";

import { auth } from "#/lib/auth";
import { db } from "./index";
import { user as userTable } from "./schema";

export async function seed() {
	const existing = db
		.select()
		.from(userTable)
		.where(eq(userTable.role, "admin"))
		.get();

	if (existing) {
		console.log("Admin user already exists. Skipping seeding.");
		return;
	}

	const name = process.env.ADMIN_NAME;
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;

	if (!name || !email || !password) {
		console.error("Admin user details missing from environment variables.");
		return;
	}

	await auth.api.createUser({ body: { name, email, password, role: "admin" } });
	console.log("Admin user seeded successfully.");
}
