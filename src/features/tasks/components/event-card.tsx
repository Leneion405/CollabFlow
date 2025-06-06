import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { TaskStatus, AssigneeInfo, ProjectInfo } from "../types";

interface EventCardProps {
  title: string;
  assignee: AssigneeInfo | null; // Changed from Member
  project: ProjectInfo | null;   // Changed from Project
  status: TaskStatus;
  id: string;
  compact?: boolean;
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-purple-400",
  [TaskStatus.TODO]: "border-l-red-400",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-400",
  [TaskStatus.IN_REVIEW]: "border-l-blue-400",
  [TaskStatus.DONE]: "border-l-emerald-400",
};

// Mobile compact colors - just show status color
const statusCompactMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "bg-purple-500",
  [TaskStatus.TODO]: "bg-red-500",
  [TaskStatus.IN_PROGRESS]: "bg-yellow-500",
  [TaskStatus.IN_REVIEW]: "bg-blue-500",
  [TaskStatus.DONE]: "bg-emerald-500",
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
  compact = false,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  // Mobile compact view - Only show that there's a task
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "w-full h-1.5 rounded-sm cursor-pointer hover:opacity-80 transition-opacity active:scale-95 mb-0.5",
          statusCompactMap[status]
        )}
        title={title} // Show title on hover
      />
    );
  }

  // Desktop view - Handle null cases properly
  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[status]
        )}
      >
        <p className="truncate">{title}</p>
        <div className="flex items-center gap-x-1">
          {assignee && <MemberAvatar name={assignee.name} className="size-4" />}
          {assignee && project && (
            <div className="size-1 rounded-full bg-neutral-300" />
          )}
          {project && (
            <ProjectAvatar 
              name={project.name} 
              image={project.imageUrl} 
              className="size-4"
            />
          )}
        </div>
      </div>
    </div>
  );
};
