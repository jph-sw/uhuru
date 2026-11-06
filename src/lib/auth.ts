import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "#/db";

export const auth = betterAuth({
	trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),
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
				fieldName: "siteId",
				required: false,
				input: true,
			},
		},
	},
	plugins: [tanstackStartCookies(), admin()],
});
