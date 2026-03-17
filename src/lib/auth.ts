import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "#/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "sqlite" }),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	experimental: { joins: true },
	user: {
		additionalFields: {
			site_id: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},
	plugins: [tanstackStartCookies(), admin()],
});
