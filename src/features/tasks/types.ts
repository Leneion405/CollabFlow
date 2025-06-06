// src/features/tasks/types.ts
import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// Base Task interface
export interface Task extends Models.Document {
  // Required
  name: string;
  status: TaskStatus;
  projectId: string;
  workspaceId: string;
  position: number;
  description?: string;
  assigneeId?: string;
  startDate?: string; // ISO date string format
  dueDate?: string; // ISO date string format
  dependencyIds?: string[];
  priority?: TaskPriority;
}

// Task with populated project and assignee
export interface PopulatedTask extends Task {
  project?: {
    $id: string;
    name: string;
    imageUrl?: string;
    workspaceId: string;
    [key: string]: any;
  } | null;
  assignee?: {
    $id: string;
    name: string;
    email: string;
    userId: string;
    workspaceId: string;
    role: string;
    [key: string]: any;
  } | null;
}

// Flexible type for API responses
export interface ApiTask {
  [key: string]: any;
  $id: string;
  name: string;
  status: TaskStatus;
  projectId: string;
  workspaceId: string;
  position: number;
  description?: string;
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
  dependencyIds?: string[];
  priority?: TaskPriority;
  project?: any;
  assignee?: any;
}

// Legacy interface for backwards compatibility
export interface TaskWithProject extends Task {
  project: {
    name: string;
    // Add other project fields if needed
  };
}
