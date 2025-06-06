import { MoreHorizontalIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";
import { Task } from "../types";

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  // Add safety check at the beginning
  if (!task) {
    console.warn('KanbanCard received undefined task');
    return null;
  }

  // Destructure with fallbacks
  const {
    $id = '',
    name = 'Untitled Task',
    project,
    dueDate,
    // other properties
  } = task;

  return (
    <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm cursor-pointer border border-transparent hover:border-neutral-200 transition">
      <div className="flex items-start justify-between gap-x-2">
        <p className="text-sm line-clamp-2">{name}</p>
        <TaskActions id={$id} projectId={task.projectId}>
          <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
        </TaskActions>
      </div>
      <DottedSeparator className="my-2.5" />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar 
          name={task.assignee?.name || "Unassigned"} 
          className="size-6" 
          fallbackClassName="text-[10px]" 
        />
        <div className="size-1 rounded-full bg-neutral-300" />
        <TaskDate value={dueDate || ""} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar 
          name={project?.name || "Unknown Project"} 
          image={project?.imageUrl} 
          className="size-6" 
          fallbackClassName="text-[10px]" 
        />
        <span className="text-xs font-medium">
          {project?.name || "Unknown Project"}
        </span>
      </div>
    </div>
  );
};
