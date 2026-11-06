import { app } from "./app";
import { seed } from "./db/seed";

const port = Number(process.env.API_PORT ?? 3001);

// Create the admin user from ADMIN_* (no-op if an admin already exists)
await seed();

app.listen(port);

console.log(`[SUCCESS] Uhuru API listening on http://localhost:${port}`);
