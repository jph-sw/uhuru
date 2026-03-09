import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./index";

export function runMigrations() {
  migrate(db, { migrationsFolder: "./migrations" });
}
