import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID, INVITES_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono();

app.use("*", sessionMiddleware);

// Create Invite
app.post(
  "/",
  zValidator("json", z.object({
    recipientId: z.string(),
    workspaceId: z.string(),
    workspaceName: z.string().optional(),
  })),
  async (c) => {
    const { recipientId, workspaceId, workspaceName } = c.req.valid("json");
    const { databases, account } = await createSessionClient();
    const me = await account.get();

    const existing = await databases.listDocuments(DATABASE_ID, INVITES_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("recipientId", recipientId),
    ]);

    if (existing.total > 0) return c.json({ error: "Already invited" }, 400);

    const invite = await databases.createDocument(DATABASE_ID, INVITES_ID, ID.unique(), {
      senderId: me.$id,
      recipientId,
      workspaceId,
      workspaceName,
      createdAt: new Date().toISOString(),
    });

    return c.json({ data: invite });
  }
);

// Get My Invites
app.get("/", async (c) => {
  const { databases, account } = await createSessionClient();
  const me = await account.get();

  const invites = await databases.listDocuments(DATABASE_ID, INVITES_ID, [
    Query.equal("recipientId", me.$id),
  ]);

  return c.json({ data: invites.documents });
});

// Accept
app.post("/:inviteId/accept", async (c) => {
  const { databases, account } = await createSessionClient();
  const inviteId = c.req.param("inviteId");
  const me = await account.get();

  const invite = await databases.getDocument(DATABASE_ID, INVITES_ID, inviteId);

  if (invite.recipientId !== me.$id) return c.json({ error: "Unauthorized" }, 401);

  const existing = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal("userId", me.$id),
    Query.equal("workspaceId", invite.workspaceId),
  ]);

  if (existing.total > 0) {
    await databases.deleteDocument(DATABASE_ID, INVITES_ID, inviteId);
    return c.json({ error: "Already a member" }, 400);
  }

  await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
    workspaceId: invite.workspaceId,
    userId: me.$id,
    role: "MEMBER",
  });

  await databases.deleteDocument(DATABASE_ID, INVITES_ID, inviteId);

  return c.json({ success: true });
});

// Decline
app.delete("/:inviteId", async (c) => {
  const { databases, account } = await createSessionClient();
  const inviteId = c.req.param("inviteId");
  const me = await account.get();

  const invite = await databases.getDocument(DATABASE_ID, INVITES_ID, inviteId);

  if (invite.recipientId !== me.$id) return c.json({ error: "Unauthorized" }, 401);

  await databases.deleteDocument(DATABASE_ID, INVITES_ID, inviteId);

  return c.json({ success: true });
});

// NEW ROUTE: Lookup workspace by invite code (using sessionMiddleware)
app.get("/lookup/:inviteCode", async (c) => {
  try {
    const { databases } = await createSessionClient();
    const inviteCode = c.req.param("inviteCode");

    if (!inviteCode) {
      return c.json({ error: "Invite code is required" }, 400);
    }

    // Look up workspace by invite code
    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.equal("inviteCode", inviteCode)]
    );

    if (workspaces.documents.length === 0) {
      return c.json({ error: "Invalid invite code" }, 404);
    }

    const workspace = workspaces.documents[0];

    return c.json({
      workspaceId: workspace.$id,
      workspaceName: workspace.name,
    });
  } catch (error) {
    console.error("Error looking up invite code:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
