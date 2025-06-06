// src/features/tasks/hooks/use-task-filters.ts
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { TaskStatus, TaskPriority } from "../types";

export const useTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatus)),
    assigneeId: parseAsString,
    priority: parseAsStringEnum(Object.values(TaskPriority)), // Priority filter
    search: parseAsString,
    startDate: parseAsString,
    dueDate: parseAsString,
  });
};
