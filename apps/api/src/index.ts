import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth";
import { macros } from "./macros";
import { runMigrations } from "./db/migrate";
import { seed } from "./db/seed";
import { sites } from "./modules/sites";
import { fields } from "./modules/fields";
import { invite } from "./modules/invite";
import { join } from "./modules/join";
import { users } from "./modules/users";
import { content } from "./modules/content";

runMigrations();
await seed();

const isProduction = process.env.NODE_ENV === "production";

const app = new Elysia()
  .use(
    cors({
      origin: isProduction
        ? (process.env.TRUSTED_ORIGINS?.split(",") ?? false)
        : "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .use(macros)
  .use(sites)
  .use(fields)
  .use(invite)
  .use(join)
  .use(users)
  .use(content);

if (isProduction) {
  // Serve static assets and SPA fallback from apps/api/public (populated during Docker build).
  // .mount(auth.handler) registers an ALL /* handler; our GET /* wins for GET requests,
  // so we must explicitly delegate unmatched /api/* paths back to the auth handler.
  app.get("/*", async ({ path, request }) => {
    if (path.startsWith("/api/")) return auth.handler(request);

    const filePath = path === "/" ? "/index.html" : path;
    const file = Bun.file(`public${filePath}`);
    if (await file.exists()) return file;
    return Bun.file("public/index.html");
  });
}

app.listen({ port: 3001 });

console.log(`-> API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
export type Auth = typeof auth;
