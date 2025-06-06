import { ChevronRightIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useDeleteTask } from "../api/use-delete-task";
import { PopulatedTask } from "../types";

// Define Project type based on your PopulatedTask structure
type Project = {
  $id: string;
  name: string;
  imageUrl?: string;
  workspaceId: string;
};

interface TaskBreadcrumbsProps {
  project: Project | null; // Allow null for cases where project might not be loaded
  task: PopulatedTask; // Use your existing PopulatedTask type
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
        <Link href={`/workspaces/${workspaceId}`}>
          <p className="text-lg font-semibold">Unknown Project</p>
        </Link>
        <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{task.name}</p>
        <Button
          className="ml-auto"
          variant="destructive"
          size="sm"
          onClick={handleDeleteTask}
          disabled={isPending}
        >
          <TrashIcon className="size-4 lg:mr-2" />
          <span className="hidden lg:block">Delete Task</span>
        </Button>
        <ConfirmDialog />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <ProjectAvatar
        name={project.name}
        image={project.imageUrl}
        className="size-6 lg:size-8"
      />
      <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
        <p className="text-lg font-semibold">{project.name}</p>
      </Link>
      <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{task.name}</p>
      <Button
        className="ml-auto"
        variant="destructive"
        size="sm"
        onClick={handleDeleteTask}
        disabled={isPending}
      >
        <TrashIcon className="size-4 lg:mr-2" />
        <span className="hidden lg:block">Delete Task</span>
      </Button>
      <ConfirmDialog />
    </div>
  );
};
