import { PencilIcon } from "lucide-react";
import { differenceInDays } from "date-fns";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { snakeCaseToTitleCase, cn } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { OverviewProperty } from "./overview-property";
import { TaskDate } from "./task-date";
import { TaskDescription } from "./task-description";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TaskPriority, PopulatedTask, Task } from "../types";

interface TaskOverviewProps {
  task: PopulatedTask; // Use your existing PopulatedTask type
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();
  const workspaceId = useWorkspaceId();

  // Get all tasks to resolve dependency names
  const { data: tasks } = useGetTasks({ workspaceId });

  // Get due date urgency border
  const getDueDateBorder = (dueDate?: string) => {
    if (!dueDate) return "";

    const today = new Date();
    const due = new Date(dueDate);
    const diffInDays = differenceInDays(due, today);

    if (diffInDays <= 3) {
      return "border-l-4 border-l-red-500";
    } else if (diffInDays <= 7) {
      return "border-l-4 border-l-orange-500";
    } else if (diffInDays <= 14) {
      return "border-l-4 border-l-yellow-500";
    }

    return "";
  };

  // Get priority badge with colored background and white text
  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return (
          <Badge className="bg-red-500 text-white">
            HIGH
          </Badge>
        );
      case TaskPriority.MEDIUM:
        return (
          <Badge className="bg-yellow-500 text-white">
            MEDIUM
          </Badge>
        );
      case TaskPriority.LOW:
        return (
          <Badge className="bg-green-500 text-white">
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
  };

  // Get status badge with colored background
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
      <Badge className={`${colorClass} text-white`}>
        {snakeCaseToTitleCase(status)}
      </Badge>
    );
  };

  // Get dependency names
  const getDependencyNames = () => {
    if (!task.dependencyIds || !tasks?.documents) return [];
    
    return task.dependencyIds
      .map((depId: string) => {
        const depTask = tasks.documents.find((t: Task) => t.$id === depId);
        return depTask ? depTask.name : `Task ${depId}`;
      })
      .filter(Boolean);
  };

  const dependencyNames = getDependencyNames();

  return (
    <div className={cn("flex flex-col gap-y-4", getDueDateBorder(task.dueDate))}>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button onClick={() => open(task.$id)} size="sm" variant="secondary">
          <PencilIcon className="size-4 mr-2" />
          Edit
        </Button>
      </div>
      <DottedSeparator />
      <div className="flex flex-col gap-y-4">
        <OverviewProperty label="Assignee">
          {task.assignee ? (
            <div className="flex items-center gap-x-2">
              <MemberAvatar className="size-6" name={task.assignee.name} />
              <p className="text-sm font-medium">{task.assignee.name}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unassigned</p>
          )}
        </OverviewProperty>

        <OverviewProperty label="Start Date">
          {task.startDate ? (
            <TaskDate value={task.startDate} isDueDate={false} />
          ) : (
            <p className="text-sm text-muted-foreground">No start date</p>
          )}
        </OverviewProperty>

        <OverviewProperty label="Due Date">
          {task.dueDate ? (
            <TaskDate value={task.dueDate} isDueDate={true} />
          ) : (
            <p className="text-sm text-muted-foreground">No due date</p>
          )}
        </OverviewProperty>

        <OverviewProperty label="Status">
          {getStatusBadge(task.status)}
        </OverviewProperty>

        <OverviewProperty label="Priority">
          {getPriorityBadge(task.priority)}
        </OverviewProperty>

        {dependencyNames.length > 0 && (
          <OverviewProperty label="Dependencies">
            <div className="flex flex-wrap gap-1">
              {dependencyNames.map((name: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </OverviewProperty>
        )}
      </div>
      <DottedSeparator />
      <TaskDescription task={task} />
    </div>
  );
};
