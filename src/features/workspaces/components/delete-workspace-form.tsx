"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { Workspace } from "../types";

interface DeleteWorkspaceCardProps {
  workspace: Workspace;
}

export const DeleteWorkspaceCard = ({ workspace }: DeleteWorkspaceCardProps) => {
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone.",
    "destructive"
  );

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;

    deleteWorkspace(
      { param: { workspaceId: workspace.$id } },
      {
        onSuccess: () => {
          window.location.href = "/";
        },
      }
    );
  };

  return (
    <>
      <div className="max-w-10xl mx-auto">
      <DeleteDialog />
      <div className="mb-8">
        <h3 className="text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-4 text-red-600">
          Delete Workspace
        </h3>
        <Card >
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Deleting a workspace is a permanent action and cannot be undone. Once you delete a workspace, all its
              associated data, including projects, tasks, and member roles, will be permanently removed. Please
              proceed with caution and ensure this action is intentional.
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="destructive"
                type="button"
                disabled={isDeletingWorkspace}
                onClick={handleDelete}
              >
                {isDeletingWorkspace && <div className="animate-spin mr-2">⏳</div>}
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
};
