import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { WorkspaceIdClient } from "./client"; // Changed from "./home-client" to "./client"

const WorkspaceHomePage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdClient />;
};

export default WorkspaceHomePage;
