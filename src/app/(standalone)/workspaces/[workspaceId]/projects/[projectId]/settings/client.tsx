"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { Project } from "@/features/projects/types";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();
  const { data: projectData, isLoading } = useGetProject({ projectId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!projectData) {
    return <PageError message="Project not found." />;
  }

  // Ensure the data has all required Project properties
  const initialValues: Project = {
    ...projectData,
    name: projectData.name || "",
    imageUrl: projectData.imageUrl || "",
    workspaceId: projectData.workspaceId || "",
    createdBy: projectData.createdBy,
    createdAt: projectData.createdAt || projectData.$createdAt,
  };

  // Validate that required fields exist
  if (!initialValues.name || !initialValues.workspaceId) {
    return <PageError message="Invalid project data." />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};
