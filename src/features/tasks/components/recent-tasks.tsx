"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusIcon, CheckSquareIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { differenceInDays, format } from "date-fns";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskPriority, PopulatedTask } from "@/features/tasks/types";
import { cn } from "@/lib/utils";
import { snakeCaseToTitleCase } from "@/lib/utils";

// Define proper type for task with assignee
type TaskWithAssignee = PopulatedTask & {
  assignee?: {
    name: string;
    email?: string;
  };
};

interface RecentTasksProps {
  data: Task[];
  total: number;
}

export const RecentTasks = ({ data, total }: RecentTasksProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  // Use the exact same logic as TaskDate component
  const getDueDateColor = (dueDate: string | undefined) => {
    if (!dueDate) return "text-muted-foreground";
    
    const today = new Date();
    const date = new Date(dueDate);
    const diffInDays = differenceInDays(date, today);

    let textColor = "text-muted-foreground"; // Default color

    // Apply the exact same logic as TaskDate component
    if (diffInDays <= 3) {
      textColor = "text-red-500";  // Red if due in 3 days or less
    } else if (diffInDays <= 7) {
      textColor = "text-orange-500";  // Orange if due in 7 days or less
    } else if (diffInDays <= 14) {
      textColor = "text-yellow-500";  // Yellow if due in 14 days or less
    }
    // For future dates (>14 days), keep default text-muted-foreground

    return textColor;
  };

  // Get priority badge with colored background and white text
  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs">
            HIGH
          </Badge>
        );
      case TaskPriority.MEDIUM:
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 text-xs">
            MEDIUM
          </Badge>
        );
      case TaskPriority.LOW:
      default:
        return (
          <Badge className="bg-gray-500 text-white hover:bg-gray-600 text-xs">
            LOW
          </Badge>
        );
    }
  };

  // Get status badge with updated colors
  const getStatusBadge = (status: string) => {
    const statusColors = {
      BACKLOG: "bg-purple-500",
      TODO: "bg-red-500",
      IN_PROGRESS: "bg-yellow-500",
      IN_REVIEW: "bg-blue-500",
      DONE: "bg-green-500",
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-500";

    return (
      <Badge className={`${colorClass} text-white text-xs hover:opacity-80`}>
        {snakeCaseToTitleCase(status)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-3 sm:p-4">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-x-2">
            <CheckSquareIcon className="size-5 text-muted-foreground sm:hidden" />
            <p className="text-base sm:text-lg font-semibold">
              Tasks ({total})
            </p>
          </div>
          <Button 
            variant="muted" 
            size="sm"
            onClick={createTask}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        
        <DottedSeparator className="my-4" />
        
        {/* Tasks List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquareIcon className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No recent tasks found
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={createTask}
                className="mt-3"
              >
                <PlusIcon className="size-4 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="space-y-3">
                  {data.map((task) => {
                    const taskWithAssignee = task as TaskWithAssignee;
                    return (
                      <Link 
                        key={task.$id}
                        href={`/workspaces/${workspaceId}/tasks/${task.$id}`}
                      >
                        <Card className="shadow-none rounded-lg hover:shadow-md hover:bg-accent/50 transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              {/* Left side - Task info */}
                              <div className="flex flex-col gap-y-1 flex-1 min-w-0">
                                {/* Task ID */}
                                <p className="text-sm text-muted-foreground font-mono">
                                  Task-{task.$id.slice(-3)}
                                </p>
                                
                                {/* Task Name */}
                                <p className="text-lg font-medium truncate">{task.name}</p>
                                
                                {/* Due Date with exact TaskDate styling */}
                                <div className="flex items-center gap-x-2">
                                  <CalendarIcon className={cn("size-3", getDueDateColor(task.dueDate))} />
                                  <div className={cn(getDueDateColor(task.dueDate))}>
                                    <span className="text-sm font-medium">
                                      Due: {task.dueDate 
                                        ? format(new Date(task.dueDate), "PPP")
                                        : "No due date"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right side - Priority, Status Badge, then Avatar */}
                              <div className="flex items-center gap-x-2 flex-shrink-0">
                                {/* Priority Badge */}
                                {getPriorityBadge(task.priority)}
                                
                                {/* Status Badge */}
                                {getStatusBadge(task.status)}
                                
                                {/* Member Avatar */}
                                {task.assigneeId && taskWithAssignee.assignee ? (
                                  <MemberAvatar
                                    name={taskWithAssignee.assignee.name}
                                    className="size-8"
                                    fallbackClassName="text-sm"
                                  />
                                ) : (
                                  <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">?</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="space-y-3">
                  {data.map((task) => {
                    const taskWithAssignee = task as TaskWithAssignee;
                    return (
                      <Link 
                        key={task.$id}
                        href={`/workspaces/${workspaceId}/tasks/${task.$id}`}
                      >
                        <Card className="shadow-none rounded-lg hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                          <CardContent className="p-3">
                            {/* Mobile Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-mono mb-1">
                                  Task-{task.$id.slice(-3)}
                                </p>
                                <p className="font-medium text-base leading-tight line-clamp-2">
                                  {task.name}
                                </p>
                              </div>
                              
                              {/* Assignee Avatar */}
                              {task.assigneeId && taskWithAssignee.assignee ? (
                                <MemberAvatar
                                  name={taskWithAssignee.assignee.name}
                                  className="size-8 ml-2 flex-shrink-0"
                                  fallbackClassName="text-sm"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-muted flex items-center justify-center ml-2 flex-shrink-0">
                                  <UserIcon className="size-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Mobile Details */}
                            <div className="space-y-2">
                              {/* Due Date */}
                              <div className="flex items-center gap-x-2">
                                <CalendarIcon className={cn("size-3 flex-shrink-0", getDueDateColor(task.dueDate))} />
                                <span className={cn("text-sm", getDueDateColor(task.dueDate))}>
                                  {task.dueDate 
                                    ? format(new Date(task.dueDate), "MMM do, yyyy")
                                    : "No due date"}
                                </span>
                              </div>
                              
                              {/* Priority and Status Badges */}
                              <div className="flex items-center gap-x-2">
                                {getPriorityBadge(task.priority)}
                                {getStatusBadge(task.status)}
                              </div>
                              
                              {/* Assignee Info */}
                              {task.assigneeId && taskWithAssignee.assignee && (
                                <div className="flex items-center gap-x-2">
                                  <UserIcon className="size-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {taskWithAssignee.assignee.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Show All Button - Only if there are tasks */}
        {data.length > 0 && (
          <Button 
            variant="muted" 
            className="mt-4 w-full h-10 sm:h-9" 
            asChild
          >
            <Link href={`/workspaces/${workspaceId}/tasks`}>
              View All Tasks
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
