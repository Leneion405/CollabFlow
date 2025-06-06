import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required."),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string(),
  createdBy: z.string().optional(), // Will be set automatically
  createdAt: z.string().optional(), // Will be set automatically
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Minimum 1 character required.").optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
