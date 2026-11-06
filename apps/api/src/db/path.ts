import { resolve } from "node:path";

/**
 * Location of the SQLite database.
 *
 * Defaults to `<repo root>/data/database.sqlite`, which is where the database
 * lived before the API was split out, and is what `/app/data` maps to in the
 * Docker image. Override with DATABASE_PATH.
 */
export const databasePath =
	process.env.DATABASE_PATH ??
	resolve(import.meta.dir, "../../../../data/database.sqlite");
