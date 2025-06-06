import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, INVITES_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { getMember } from "@/features/members/utils";
import { createTaskSchema } from "../schemas";
import { Task, TaskStatus, TaskPriority } from "../types";

// Helper function to create task assignment notification
const createTaskNotification = async (databases: any, assigneeUserId: string, taskName: string, projectName: string, assignerName: string, taskId: string, workspaceId: string) => {
  try {
    console.log('Creating task notification for user:', assigneeUserId);
    console.log('Task details:', { taskName, projectName, assignerName, taskId, workspaceId });
    
    const notification = await databases.createDocument(DATABASE_ID, INVITES_ID, ID.unique(), {
      recipientId: assigneeUserId,
      senderId: assignerName,
      workspaceId: workspaceId,
      workspaceName: taskName, // Task name will show in notification
      type: "task_assignment", // NEW: Add this field to distinguish from invites
      task_assignment: "task_assignment", // Your existing field
      taskId: taskId, // Match your database field name
      projectName: projectName, // Push projectName to show which project
      createdAt: new Date().toISOString(),
    });
    
    console.log('Task notification created successfully:', notification.$id);
    return notification;
  } catch (error) {
    console.error('Failed to create task notification:', error);
    throw error;
  }
};

const app = new Hono()
  // CREATE new task
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        description,
        dependencyIds,
        priority = TaskPriority.LOW,
      } = c.req.valid("json");

      console.log('Creating task with assigneeId:', assigneeId);

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

      const task = await databases.createDocument(DATABASE_ID, TASKS_ID, ID.unique(), {
        name,
        status,
        workspaceId,
        projectId,
        startDate: startDate || new Date().toISOString(),
        dueDate,
        assigneeId,
        description,
        position: newPosition,
        dependencyIds,
        priority,
      });

      console.log('Task created successfully:', task.$id);

      // Send notification if task is assigned to someone
      if (assigneeId) {
        try {
          console.log('Processing notification for assigneeId:', assigneeId);
          
          // Get project details
          const project = await databases.getDocument(DATABASE_ID, PROJECTS_ID, projectId);
          console.log('Project found:', project.name);
          
          // Get assignee member details to get userId
          const assigneeMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, assigneeId);
          console.log('Assignee member found - userId:', assigneeMember.userId);
          
          // Don't send notification to yourself
          if (assigneeMember.userId !== user.$id) {
            console.log('Sending notification to different user');
            
            // Create notification
            await createTaskNotification(
              databases,
              assigneeMember.userId,
              name,
              project.name,
              user.name || user.email,
              task.$id,
              workspaceId
            );
            
            console.log('Task notification sent successfully');
          } else {
            console.log('Skipping notification - user assigned task to themselves');
          }
        } catch (notificationError) {
          console.error('Notification failed:', notificationError);
          // Don't fail the task creation if notification fails
        }
      } else {
        console.log('No assignee specified, skipping notification');
      }

      return c.json({ data: task });
    }
  )

  // PATCH (update) task
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        description,
        dependencyIds,
        priority,
      } = c.req.valid("json");
      const { taskId } = c.req.param();

      console.log('Updating task:', taskId, 'with assigneeId:', assigneeId);

      const existingTask = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);
      console.log('Existing task assigneeId:', existingTask.assigneeId);

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if assignee changed
      const assigneeChanged = assigneeId && assigneeId !== existingTask.assigneeId;
      console.log('Assignee changed:', assigneeChanged);

      const task = await databases.updateDocument(DATABASE_ID, TASKS_ID, taskId, {
        name,
        status,
        projectId,
        startDate,
        dueDate,
        assigneeId,
        description,
        dependencyIds,
        priority,
      });

      // Send notification if assignee changed
      if (assigneeChanged) {
        try {
          console.log('Processing notification for assignee change');
          
          const project = await databases.getDocument(DATABASE_ID, PROJECTS_ID, projectId || existingTask.projectId);
          const assigneeMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, assigneeId);
          
          // Don't send notification to yourself
          if (assigneeMember.userId !== user.$id) {
            await createTaskNotification(
              databases,
              assigneeMember.userId,
              name || existingTask.name,
              project.name,
              user.name || user.email,
              taskId,
              existingTask.workspaceId
            );
            
            console.log('Assignment change notification sent successfully');
          }
        } catch (notificationError) {
          console.error('Assignment change notification failed:', notificationError);
        }
      }

      return c.json({ data: task });
    }
  )

  // DELETE task
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);

    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: task.$id } });
  })

  // GET list of tasks
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        startDate: z.string().nullish(),
        dueDate: z.string().nullish(),
        priority: z.nativeEnum(TaskPriority).nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const {
        workspaceId,
        projectId,
        assigneeId,
        status,
        search,
        startDate,
        dueDate,
        priority,
      } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (projectId) query.push(Query.equal("projectId", projectId));
      if (status) query.push(Query.equal("status", status));
      if (assigneeId) query.push(Query.equal("assigneeId", assigneeId));
      if (startDate && dueDate) {
        query.push(Query.between("dueDate", startDate, dueDate));
      } else if (startDate) {
        query.push(Query.greaterThanEqual("startDate", startDate));
      } else if (dueDate) {
        query.push(Query.lessThanEqual("dueDate", dueDate));
      }
      if (priority) query.push(Query.equal("priority", priority));

      if (search && search.trim()) {
        query.push(Query.search("name", search.trim()));
      }

      const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, query);

      const projectIds = tasks.documents
        .map((task) => task.projectId)
        .filter((id): id is string => !!id);

      const assigneeIds = tasks.documents
        .map((task) => task.assigneeId)
        .filter((id): id is string => !!id);

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

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = task.projectId
          ? projects.documents.find((project) => project.$id === task.projectId)
          : null;

        const assignee = task.assigneeId
          ? assignees.find((assignee) => assignee.$id === task.assigneeId)
          : null;

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({ data: { ...tasks, documents: populatedTasks } });
    }
  )

  // GET single task by ID
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = task.projectId
      ? await databases.getDocument(DATABASE_ID, PROJECTS_ID, task.projectId)
      : null;

    const member = task.assigneeId
      ? await databases.getDocument(DATABASE_ID, MEMBERS_ID, task.assigneeId)
      : null;

    const user = member ? await users.get(member.userId) : null;

    const assignee =
      member && user
        ? {
            ...member,
            name: user.name || user.email,
            email: user.email,
          }
        : null;

    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })

  // BULK UPDATE tasks
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
      const user = c.get("user");
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [Query.contains("$id", tasks.map((task) => task.$id))]
      );

      const workspaceIds = new Set(
        tasksToUpdate.documents.map((task) => task.workspaceId)
      );

      if (workspaceIds.size !== 1) {
        return c.json(
          { error: "All tasks must belong to the same workspace." },
          400
        );
      }

      const workspaceId = workspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json({ error: "Workspace ID is required." }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId: workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
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
    }
  );

export default app;
