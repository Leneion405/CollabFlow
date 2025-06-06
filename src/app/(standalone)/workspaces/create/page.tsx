import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { NoWorkspaceLanding } from "@/components/no-workspace-landing";

const WorkspaceCreatePage = async () => {
  const user = await getCurrent();
  
  if (!user) {
    redirect("/sign-in");
  }

  const workspaces = await getWorkspaces();
  
  // If user has workspaces, redirect to the first one
  if (workspaces.total > 0) {
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }

  // If no workspaces, show the landing page
  return <NoWorkspaceLanding />;
};

export default WorkspaceCreatePage;
