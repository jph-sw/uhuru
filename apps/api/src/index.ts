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
  .use(macros)
  .use(sites, { admin: true })
  .use(fields)
  .use(invite)
  .use(join)
  .use(users)
  .listen(3001);

console.log(`-> API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
export type Auth = typeof auth;
