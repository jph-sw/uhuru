import { treaty } from "@elysiajs/eden";
import type { App } from "@uhuru/api";

export const api = treaty<App>("http://localhost:3001", {
  fetch: { credentials: "include" },
});
