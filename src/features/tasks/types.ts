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

// Enhanced ProjectInfo to match Project type requirements
export interface ProjectInfo extends Models.Document {
  name: string;
  imageUrl?: string;
  workspaceId: string;
  userId: string;
}

export interface AssigneeInfo {
  $id: string;
  name: string;
  email: string;
  userId: string;
  workspaceId: string;
  role: string;
  phone?: string;
  description?: string;
  taskCompleted?: number;
  $createdAt?: string;
  $updatedAt?: string;
}

// Task with populated project and assignee
export interface PopulatedTask extends Task {
  project?: ProjectInfo | null;
  assignee?: AssigneeInfo | null;
}

// Flexible type for API responses with proper typing
export interface ApiTask extends Task {
  project?: ProjectInfo | null;
  assignee?: AssigneeInfo | null;
}

// Legacy interface for backwards compatibility
export interface TaskWithProject extends Task {
  project: {
    name: string;
    imageUrl?: string;
    $id?: string;
  };
}

// Calendar Event type for data-calendar component
export interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  project: ProjectInfo | null;
  assignee: AssigneeInfo | null;
  status: TaskStatus;
  id: string;
}

// Type alias for compatibility with existing Project imports
export type Project = ProjectInfo;
