import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { type AuthConfig } from "@uhuru/types";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3001",
  plugins: [adminClient(), inferAdditionalFields<AuthConfig>()],
});
