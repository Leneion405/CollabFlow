import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

import { getMember } from "../utils";
import { Member, MemberRole } from "../types";
import { TaskStatus } from "@/features/tasks/types";
import { TASKS_ID } from "@/config";

const app = new Hono()
  // Get members for a specific workspace
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const members = await databases.listDocuments<Member>(DATABASE_ID, MEMBERS_ID, [
        Query.equal("workspaceId", workspaceId),
      ]);

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      return c.json({ data: { ...members, documents: populatedMembers } });
    }
  )

  // Get all members, no workspace filter
  .get(
    "/all",
    sessionMiddleware,
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");

      // Fetch all members in the database
      const members = await databases.listDocuments<Member>(DATABASE_ID, MEMBERS_ID);

      // Attach user info to each member
      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      return c.json({ data: { ...members, documents: populatedMembers } });
    }
  )

  // Delete member
  .delete("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");
    const databases = c.get("databases");

    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member." }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  })

  // Patch (update) member
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)]
      );

      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade the only member." }, 400);
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  )

  // Get member info
  // Get member info
.get(
  "/:memberId/info",
  sessionMiddleware,
  zValidator("query", z.object({ workspaceId: z.string() })),
  async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");
    const user = c.get("user");
    const { memberId } = c.req.param();
    const { workspaceId } = c.req.valid("query");

    // Check if current user has access to this workspace
    const currentMember = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get the member info
    const member = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);
    
    if (member.workspaceId !== workspaceId) {
      return c.json({ error: "Member not in this workspace" }, 403);
    }

    // Get user details from Appwrite Users
    const userDetails = await users.get(member.userId);

    // Get completed tasks count
    const completedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("assigneeId", memberId),
      Query.equal("status", TaskStatus.DONE),
    ]);

    // Check if this member is the workspace owner
    const workspace = await databases.getDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);
    const isOwner = workspace.userId === member.userId;

    // In your member info route
    const memberInfo = {
      ...member,
      name: userDetails.name || userDetails.email,
      email: userDetails.email,
      phone: userDetails.prefs?.phone || "", // Get from preferences
      description: userDetails.prefs?.description || "",
      taskCompleted: completedTasks.total,
      role: isOwner ? "Owner" : member.role,
      workspaceId: member.workspaceId,
      userId: member.userId,
    };


    return c.json({ data: memberInfo });
  }
);

export default app;
