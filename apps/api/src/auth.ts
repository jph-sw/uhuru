import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";

export const auth = betterAuth({
	baseURL: Bun.env.BETTER_AUTH_URL,
	trustedOrigins: Bun.env.TRUSTED_ORIGINS
		? Bun.env.TRUSTED_ORIGINS.split(",")
		: ["http://localhost:3000"],
	database: drizzleAdapter(db, { provider: "sqlite" }),
	experimental: { joins: true },
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	user: {
		additionalFields: {
			site_id: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},

	plugins: [admin()],
});
