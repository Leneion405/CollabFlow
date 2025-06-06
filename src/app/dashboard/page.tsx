import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams?: { oauth?: string } }) {
  // Optional: Wait briefly after OAuth redirect to ensure cookie is set
  if (searchParams?.oauth === "success") {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  const workspaces = await getWorkspaces();

  if (workspaces.total === 0) {
    redirect("/workspaces/create");
    return null;
  } else {
    // Redirect to the most recently created workspace
    const newestWorkspace = workspaces.documents.sort(
      (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    )[0];

    // If coming from OAuth, clean up the URL
    if (searchParams?.oauth === "success") {
      redirect(`/workspaces/${newestWorkspace.$id}`);
      return null;
    }

    redirect(`/workspaces/${newestWorkspace.$id}`);
    return null;
  }
}
