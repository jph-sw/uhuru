import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth";
import { runMigrations } from "./db/migrate";
import { seed } from "./db/seed";
import { sites } from "./modules/sites";
import { fields } from "./modules/fields";
import { invite } from "./modules/invite";
import { join } from "./modules/join";

runMigrations();
await seed();

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
    admin: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        if (session.user.role !== "admin") return status(403);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .use(sites)
  .use(fields)
  .use(invite)
  .use(join)
  .listen(3001);

console.log(`-> API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
