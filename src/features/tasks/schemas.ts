import { z } from "zod";
import { TaskStatus, TaskPriority } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  startDate: z.string().optional(), // Change to string
  dueDate: z.string().optional(),   // Change to string
  assigneeId: z.string().trim().min(1, "Required").optional(),
  description: z.string().optional(),
  dependencyIds: z.array(z.string()).optional(),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.LOW),
});

