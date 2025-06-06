import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { getMember } from "@/features/members/utils";
import { createTaskSchema, updateTaskSchema } from "../schemas";
import { TaskStatus } from "../types";

import {
  DATABASE_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
} from "@/config";

// Proper error handling function with TypeScript types
const handleAppwriteError = (error: unknown): { message: string; status: number } => {
  console.error("Appwrite error:", error);
  
  if (
    error && 
    typeof error === 'object' && 
    'code' in error && 
    'message' in error
  ) {
    const appwriteError = error as { 
      code: number; 
      message: string; 
      type?: string 
    };
    
    switch (appwriteError.code) {
      case 401:
        return { message: "Authentication failed", status: 401 };
      case 404:
        return { message: "Task not found", status: 404 };
      case 409:
        return { message: "Task conflict", status: 409 };
      default:
        return { message: appwriteError.message || "An unexpected error occurred", status: 500 };
    }
  }
  
  return { message: "An unexpected error occurred", status: 500 };
};

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
        assigneeId: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        search: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId, projectId, status, assigneeId, search, dueDate, priority } =
          c.req.valid("query");

        if (!workspaceId) {
          return c.json({ error: "Missing workspaceId" }, 400);
        }

        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const queries = [Query.equal("workspaceId", workspaceId)];

        if (projectId) {
          queries.push(Query.equal("projectId", projectId));
        }

        if (status) {
          queries.push(Query.equal("status", status));
        }

        if (assigneeId) {
          queries.push(Query.equal("assigneeId", assigneeId));
        }

        if (dueDate) {
          queries.push(Query.equal("dueDate", dueDate));
        }

        if (priority) {
          queries.push(Query.equal("priority", priority));
        }

        if (search) {
          queries.push(Query.search("name", search));
        }

        const tasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          queries
        );

        const projectIds = tasks.documents.map((task) => task.projectId);
        const assigneeIds = tasks.documents.map((task) => task.assigneeId);

        const projects = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_ID,
          projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
        );

        const members = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );

        // Fixed: Use proper Users API from Appwrite
        const assignees = await Promise.all(
          members.documents.map(async (member) => {
            try {
              // Get user info from member's userId
              const userResponse = await databases.getDocument(
                DATABASE_ID,
                "users", // Assuming you have a users collection
                member.userId
              );

              return {
                ...member,
                name: userResponse.name || member.name || "Unknown",
                email: userResponse.email || member.email || "",
              };
            } catch {
              // Fallback if user document not found
              return {
                ...member,
                name: member.name || "Unknown",
                email: member.email || "",
              };
            }
          })
        );

        const populatedTasks = tasks.documents.map((task) => {
          const project = projects.documents.find(
            (project) => project.$id === task.projectId
          );

          const assignee = assignees.find(
            (assignee) => assignee.$id === task.assigneeId
          );

          return {
            ...task,
            project,
            assignee,
          };
        });

        return c.json({
          data: {
            ...tasks,
            documents: populatedTasks,
          },
        });
      } catch (error) {
        const { message, status } = handleAppwriteError(error);
        return c.json({ error: message }, status as 400 | 401 | 404 | 500);
      }
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");

        const { name, status, workspaceId, projectId, dueDate, assigneeId, description, priority, startDate } =
          c.req.valid("json");

        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const highestPositionTask = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("status", status),
            Query.equal("workspaceId", workspaceId),
            Query.orderAsc("position"),
            Query.limit(1),
          ]
        );

        const newPosition =
          highestPositionTask.documents.length > 0
            ? highestPositionTask.documents[0].position + 1000
            : 1000;

        const task = await databases.createDocument(
          DATABASE_ID,
          TASKS_ID,
          ID.unique(),
          {
            name,
            status,
            workspaceId,
            projectId,
            dueDate,
            assigneeId,
            description,
            priority,
            startDate,
            position: newPosition,
          }
        );

        return c.json({ data: task });
      } catch (error) {
        const { message, status } = handleAppwriteError(error);
        return c.json({ error: message }, status as 400 | 401 | 404 | 500);
      }
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", updateTaskSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");

        const { name, status, description, projectId, dueDate, assigneeId, priority, startDate } =
          c.req.valid("json");

        const { taskId } = c.req.param();

        const existingTask = await databases.getDocument(
          DATABASE_ID,
          TASKS_ID,
          taskId
        );

        const member = await getMember({
          databases,
          workspaceId: existingTask.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const task = await databases.updateDocument(
          DATABASE_ID,
          TASKS_ID,
          taskId,
          {
            name,
            status,
            description,
            projectId,
            dueDate,
            assigneeId,
            priority,
            startDate,
          }
        );

        return c.json({ data: task });
      } catch (error) {
        const { message, status } = handleAppwriteError(error);
        return c.json({ error: message }, status as 400 | 401 | 404 | 500);
      }
    }
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

      return c.json({ data: { $id: taskId } });
    } catch (error) {
      const { message, status } = handleAppwriteError(error);
      return c.json({ error: message }, status as 400 | 401 | 404 | 500);
    }
  })
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");

        const { tasks } = c.req.valid("json");

        const tasksToUpdate = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.contains(
              "$id",
              tasks.map((task) => task.$id)
            ),
          ]
        );

        const workspaceIds = new Set(
          tasksToUpdate.documents.map((task) => task.workspaceId)
        );

        for (const workspaceId of workspaceIds) {
          const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
          });

          if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
          }
        }

        const updatedTasks = await Promise.all(
          tasks.map(async (task) => {
            const { $id, status, position } = task;
            return databases.updateDocument(DATABASE_ID, TASKS_ID, $id, {
              status,
              position,
            });
          })
        );

        return c.json({ data: updatedTasks });
      } catch (error) {
        const { message, status } = handleAppwriteError(error);
        return c.json({ error: message }, status as 400 | 401 | 404 | 500);
      }
    }
  );

export default app;
