import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "./index";
import { user as userSchema } from "./schema";

export async function seed() {
  const existingUser = db
    .select()
    .from(userSchema)
    .where(eq(userSchema.role, "admin"))
    .get();

  if (existingUser) {
    console.log("-> Admin user already exists. Skipping seeding.");
    return;
  }

  const user = {
    name: Bun.env.ADMIN_NAME,
    email: Bun.env.ADMIN_EMAIL,
    password: Bun.env.ADMIN_PASSWORD,
  };

  if (!user.name || !user.email || !user.password) {
    console.error(
      "-> Admin user details are not fully provided in environment variables.",
    );
    return;
  }

  await auth.api.createUser({
    body: {
      name: user.name,
      email: user.email,
      password: user.password,
      role: "admin",
    },
  });

  console.log("-> Admin user seeded successfully.");
}
