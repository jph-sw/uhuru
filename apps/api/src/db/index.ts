import { drizzle } from "drizzle-orm/bun-sqlite";

import { databasePath } from "./path";
import * as schema from "./schema";

export const db = drizzle(databasePath, { schema });
