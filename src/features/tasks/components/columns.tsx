"use client";

import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";
import { PopulatedTask, TaskPriority, TaskStatus } from "../types";

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "bg-purple-500", // Purple for Backlog
  [TaskStatus.TODO]: "bg-red-500", // Red for Todo
  [TaskStatus.IN_PROGRESS]: "bg-yellow-500", // Yellow for In Progress
  [TaskStatus.IN_REVIEW]: "bg-blue-500", // Blue for In Review
  [TaskStatus.DONE]: "bg-green-500", // Green for Done
};

const priorityColorMap: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "bg-green-500",
  [TaskPriority.MEDIUM]: "bg-yellow-500",
  [TaskPriority.HIGH]: "bg-red-500",
};

export const columns: ColumnDef<PopulatedTask>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Task Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Project
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const project = row.original.project;
      if (!project) {
        return <span className="text-muted-foreground">No project</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <ProjectAvatar name={project.name} image={project.imageUrl} className="size-6" />
          <span className="text-sm font-medium">{project.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Assignee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) {
        return <span className="text-muted-foreground">Unassigned</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <MemberAvatar name={assignee.name} className="size-6" />
          <span className="text-sm">{assignee.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Start Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      if (!startDate) {
        return <span className="text-muted-foreground">No start date</span>;
      }
      return <TaskDate value={startDate} isDueDate={false} />;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      if (!dueDate) {
        return <span className="text-muted-foreground">No due date</span>;
      }
      return <TaskDate value={dueDate} isDueDate={true} />;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const priority = row.original.priority as TaskPriority | undefined;
      switch (priority) {
        case TaskPriority.HIGH:
          return (
            <Badge variant="destructive" className={`${priorityColorMap[TaskPriority.HIGH]} text-white`}>
              HIGH
            </Badge>
          );
        case TaskPriority.MEDIUM:
          return (
            <Badge variant="secondary" className={`${priorityColorMap[TaskPriority.MEDIUM]} text-white`}>
              MEDIUM
            </Badge>
          );
        case TaskPriority.LOW:
          return (
            <Badge variant="outline" className={`${priorityColorMap[TaskPriority.LOW]} text-white border-0`}>
              LOW
            </Badge>
          );
        default:
          return (
            <Badge variant="outline">
              None
            </Badge>
          );
      }
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="secondary" className={`${statusColorMap[status]} text-white`}>
          {snakeCaseToTitleCase(status)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;
      
      return (
        <TaskActions id={id} projectId={projectId}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];

// Mobile Card Component for individual tasks
export const TaskCard = ({ task }: { task: PopulatedTask }) => {
  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <Badge className="bg-red-500 text-white text-xs">
            HIGH
          </Badge>
        );
      case TaskPriority.MEDIUM:
        return (
          <Badge className="bg-yellow-500 text-white text-xs">
            MEDIUM
          </Badge>
        );
      case TaskPriority.LOW:
        return (
          <Badge className="bg-green-500 text-white text-xs">
            LOW
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            None
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    return (
      <Badge className={`${statusColorMap[status]} text-white text-xs`}>
        {snakeCaseToTitleCase(status)}
      </Badge>
    );
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header with task name and actions */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-base leading-tight pr-2">{task.name}</h3>
          <TaskActions id={task.$id} projectId={task.projectId}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </TaskActions>
        </div>

        {/* Status and Priority badges */}
        <div className="flex items-center gap-2 mb-3">
          {getStatusBadge(task.status)}
          {getPriorityBadge(task.priority)}
        </div>

        {/* Project info */}
        {task.project && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-md">
            <ProjectAvatar name={task.project.name} image={task.project.imageUrl} className="size-5" />
            <span className="text-sm font-medium text-gray-700">{task.project.name}</span>
          </div>
        )}

        {/* Assignee info */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Assignee:</span>
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <MemberAvatar name={task.assignee.name} className="size-5" />
              <span className="text-sm">{task.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-2">
          {task.startDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Start:</span>
              <TaskDate value={task.startDate} isDueDate={false} />
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Due:</span>
              <TaskDate value={task.dueDate} isDueDate={true} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
