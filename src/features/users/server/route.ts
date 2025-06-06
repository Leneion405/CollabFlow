import { Hono } from "hono";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono().get("/", async (c) => {
  try {
    const { users } = await createAdminClient();
    const result = await users.list();

    const safeUsers = result.users.map((user) => ({
      $id: user.$id,
      name: user.name,
      email: user.email,
    }));

    return c.json({ users: safeUsers });
  } catch (err) {
    console.error("Failed to list users", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
