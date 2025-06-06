import { ChevronRightIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { useDeleteTask } from "../api/use-delete-task";
import { PopulatedTask, ProjectInfo } from "../types";

interface TaskBreadcrumbsProps {
  project: ProjectInfo | null; // Allow null for better type compatibility
  task: PopulatedTask; // Use PopulatedTask for consistency
}

export const TaskBreadcrumbs = ({ project, task }: TaskBreadcrumbsProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const { mutate, isPending } = useDeleteTask();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task?",
    "This action cannot be undone.",
    "destructive"
  );

  const handleDeleteTask = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutate(
      { param: { taskId: task.$id } },
      {
        onSuccess: () => {
          router.push(`/workspaces/${workspaceId}/tasks`);
        },
      }
    );
  };

  // Handle null project case
  if (!project) {
    return (
      <div className="flex items-center gap-x-2">
        <ConfirmDialog />
        <Link href={`/workspaces/${workspaceId}`}>
          <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
            Unknown Project
          </p>
        </Link>
        <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
        <p className="text-sm lg:text-lg font-semibold">{task.name}</p>
        <Button
          onClick={handleDeleteTask}
          disabled={isPending}
          className="ml-auto"
          variant="destructive"
          size="sm"
        >
          <TrashIcon className="size-4 lg:mr-2" />
          <span className="hidden lg:block">Delete Task</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmDialog />
      <ProjectAvatar
        name={project.name}
        image={project.imageUrl}
        className="size-6 lg:size-8"
      />
      <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
        <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
          {project.name}
        </p>
      </Link>
      <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
      <p className="text-sm lg:text-lg font-semibold">{task.name}</p>
      <Button
        onClick={handleDeleteTask}
        disabled={isPending}
        className="ml-auto"
        variant="destructive"
        size="sm"
      >
        <TrashIcon className="size-4 lg:mr-2" />
        <span className="hidden lg:block">Delete Task</span>
      </Button>
    </div>
  );
};
