import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { type AuthConfig } from "@uhuru/types";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [adminClient(), inferAdditionalFields<AuthConfig>()],
});
