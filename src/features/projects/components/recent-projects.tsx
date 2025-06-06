"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { CalendarIcon, PlusIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Project } from "@/features/projects/types";

interface RecentProjectsProps {
  data: Project[];
  total: number;
}

export const RecentProjects = ({ data, total }: RecentProjectsProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-3 sm:p-4">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-x-2">
            <FolderIcon className="size-5 text-muted-foreground sm:hidden" />
            <p className="text-base sm:text-lg font-semibold">
              Projects ({total})
            </p>
          </div>
          <Button 
            variant="muted" 
            size="sm"
            onClick={createProject}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        
        <DottedSeparator className="my-4" />
        
        {/* Projects List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <FolderIcon className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No recent projects found
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={createProject}
                className="mt-3"
              >
                <PlusIcon className="size-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="space-y-3">
                  {data.map((project) => (
                    <Link 
                      key={project.$id}
                      href={`/workspaces/${workspaceId}/projects/${project.$id}`}
                    >
                      <Card className="shadow-none rounded-lg hover:shadow-md hover:bg-accent/50 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-x-4">
                            {/* Project Avatar */}
                            <ProjectAvatar
                              image={project.imageUrl}
                              name={project.name}
                              className="size-12"
                              fallbackClassName="text-lg"
                            />
                            
                            {/* Project Info */}
                            <div className="flex flex-col gap-y-1 flex-1 min-w-0">
                              <p className="text-lg font-medium truncate">
                                {project.name}
                              </p>
                              
                              <div className="flex items-center gap-x-2">
                                <CalendarIcon className="size-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {project.createdAt 
                                    ? format(new Date(project.createdAt), "MMMM do, yyyy")
                                    : project.$createdAt 
                                    ? format(new Date(project.$createdAt), "MMMM do, yyyy")
                                    : "Unknown date"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Created By */}
                            <div className="flex items-center gap-x-2 flex-shrink-0">
                              <span className="text-sm text-muted-foreground">
                                Created by
                              </span>
                              {project.createdBy ? (
                                <MemberAvatar
                                  name={project.createdBy}
                                  className="size-8"
                                  fallbackClassName="text-sm"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">?</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="space-y-3">
                  {data.map((project) => (
                    <Link 
                      key={project.$id}
                      href={`/workspaces/${workspaceId}/projects/${project.$id}`}
                    >
                      <Card className="shadow-none rounded-lg hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                        <CardContent className="p-3">
                          {/* Mobile Header */}
                          <div className="flex items-start gap-x-3 mb-3">
                            <ProjectAvatar
                              image={project.imageUrl}
                              name={project.name}
                              className="size-10"
                              fallbackClassName="text-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base leading-tight line-clamp-2">
                                {project.name}
                              </p>
                            </div>
                          </div>
                          
                          {/* Mobile Details */}
                          <div className="space-y-2 text-sm">
                            {/* Date */}
                            <div className="flex items-center gap-x-2">
                              <CalendarIcon className="size-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {project.createdAt 
                                  ? format(new Date(project.createdAt), "MMM do, yyyy")
                                  : project.$createdAt 
                                  ? format(new Date(project.$createdAt), "MMM do, yyyy")
                                  : "Unknown date"}
                              </span>
                            </div>
                            
                            {/* Creator */}
                            <div className="flex items-center gap-x-2">
                              <span className="text-muted-foreground">Created by</span>
                              {project.createdBy ? (
                                <div className="flex items-center gap-x-1">
                                  <MemberAvatar
                                    name={project.createdBy}
                                    className="size-5"
                                    fallbackClassName="text-xs"
                                  />
                                  <span className="text-muted-foreground text-xs">
                                    {project.createdBy}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Unknown</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};
