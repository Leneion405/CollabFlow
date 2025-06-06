import { z } from "zod";
import { TaskStatus, TaskPriority } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().trim().min(1, "Required").optional(),
  description: z.string().optional(),
  dependencyIds: z.array(z.string()).optional(),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.LOW),
});

// Add the missing updateTaskSchema
export const updateTaskSchema = z.object({
  name: z.string().trim().min(1, "Required").optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  projectId: z.string().trim().min(1, "Required").optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  description: z.string().optional(),
  dependencyIds: z.array(z.string()).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
});
