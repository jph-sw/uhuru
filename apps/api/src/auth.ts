import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";
import { admin } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  baseURL: Bun.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000"],
  database: drizzleAdapter(db, { provider: "sqlite" }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
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
