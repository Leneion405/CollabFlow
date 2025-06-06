"use client";

import { Analytics } from "@/components/analytics";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { RecentTasks } from "@/features/tasks/components/recent-tasks";
import { RecentProjects } from "@/features/projects/components/recent-projects";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { DeleteWorkspaceCard } from "@/features/workspaces/components/delete-workspace-form";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useSearchParams, useRouter } from "next/navigation";
import { Project } from "@/features/projects/types";
import { RecentMembers } from "@/features/members/components/recent-members";
import { MembersList } from "@/features/workspaces/components/members-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Grid, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Rest of your component code remains exactly the same...


// Expandable text component for long descriptions
const ExpandableText = ({ text, maxLength = 150 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength) {
    return <p className="text-muted-foreground text-sm sm:text-base mt-1 leading-relaxed">{text}</p>;
  }
  
  const truncatedText = text.slice(0, maxLength);
  
  return (
    <div className="mt-1">
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
        {isExpanded ? text : `${truncatedText}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center gap-1 transition-colors touch-manipulation"
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>
    </div>
  );
};

// Mobile-responsive workspace avatar component
const WorkspaceAvatar = ({ name, className }: { name: string; className?: string }) => {
  return (
    <div className={cn(
      "flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-lg sm:text-xl",
      className
    )}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
};

// Mobile tab selector component
const MobileTabSelector = ({ 
  value, 
  onValueChange, 
  options 
}: { 
  value: string; 
  onValueChange: (value: string) => void;
  options: { value: string; label: string; count?: number }[];
}) => {
  return (
    <div className="sm:hidden mb-4">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-12">
          <SelectValue>
            {options.find(option => option.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-muted-foreground ml-2">({option.count})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("projects");
  
  const currentSection = searchParams.get('section');
  
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({ workspaceId });

  const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers || isLoadingWorkspace;

  // Tab options with counts
  const tabOptions = [
    { 
      value: "projects", 
      label: "Recent Projects", 
      count: projects?.total || 0,
      icon: <Grid className="w-4 h-4" />
    },
    { 
      value: "tasks", 
      label: "Recent Tasks", 
      count: tasks?.total || 0,
      icon: <List className="w-4 h-4" />
    },
    { 
      value: "members", 
      label: "Recent Members", 
      count: members?.total || 0,
      icon: <List className="w-4 h-4" />
    },
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  // Show settings if section=settings
  if (currentSection === "settings") {
    if (!workspace) {
      return <PageError message="Workspace not found" />;
    }
    
    return (
      <div className="w-full h-auto sm:px-6">
        <main>
          <div className="w-full max-w-10xl mx-auto py-3">
            <div className="flex flex-col pt-0.5">
              <div className="flex items-center gap-4 ">
                <Button variant="ghost" size="sm" asChild className="h-10 px-3">
                  <Link href={`/workspaces/${workspaceId}`} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Link>
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="p-4 sm:p-6">
                  <EditWorkspaceForm 
                    initialValues={workspace}
                    onCancel={() => {
                      router.push(`/workspaces/${workspaceId}`);
                    }}
                  />
                </div>
              </div>
              
                <div className="p-4 sm:p-6">
                  <DeleteWorkspaceCard workspace={workspace} />
                </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show members if section=members
  if (currentSection === "members") {
    return (
      <div className="w-full h-auto py-2 px-4 sm:px-6">
        <main>
          <div className="w-full max-w-15xl mx-auto">
            <div className="flex flex-col pt-0.5">
              <MembersList />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle undefined data with fallbacks
  if (!analytics || !tasks || !projects) {
    return <PageError message="Failed to load workspace data" />;
  }

  // Default dashboard view with mobile-friendly layout
  return (
    <div className="h-full flex flex-col space-y-4 p-4 sm:p-6">
      {/* Workspace Header - Mobile Optimized */}
      {workspace && (
        <Card className="mb-4">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-x-3 sm:gap-x-4">
              {/* Responsive avatar */}
              <WorkspaceAvatar name={workspace.name} />
              
              {/* Content area with proper text handling */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground break-words leading-tight">
                  {workspace.name}
                </h1>
                {workspace.description && (
                  <ExpandableText 
                    text={workspace.description} 
                    maxLength={150} 
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics - Mobile Optimized */}
      <Card className="mb-4">
        <CardContent className="p-4 sm:p-6">
          <Analytics data={analytics} />
        </CardContent>
      </Card>
      
      {/* Tabs Section - Mobile Responsive */}
      <Card className="flex-1">
        <CardContent className="p-4 sm:p-6">
          {/* Mobile Tab Selector */}
          <MobileTabSelector
            value={activeTab}
            onValueChange={setActiveTab}
            options={tabOptions}
          />

          {/* Desktop Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden sm:flex w-full justify-start border-0 bg-gray-50 px-1 h-12 mb-4">
              {tabOptions.map((option) => (
                <TabsTrigger 
                  key={option.value}
                  className="py-2 px-4 flex items-center gap-2" 
                  value={option.value}
                >
                  {option.icon}
                  <span className="hidden md:inline">{option.label}</span>
                  <span className="md:hidden">{option.label.split(' ')[1]}</span>
                  <span className="text-xs text-muted-foreground">({option.count})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content - Mobile Optimized */}
            <div className="mt-4">
              <TabsContent value="projects" className="mt-0">
                <div className="space-y-4">
                  <RecentProjects 
                    data={projects.documents as Project[]} 
                    total={projects.total} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0">
                <div className="space-y-4">
                  <RecentTasks 
                    data={tasks.documents} 
                    total={tasks.total} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="mt-0">
                <div className="space-y-4">
                  <RecentMembers 
                    data={members?.documents || []} 
                    total={members?.total || 0} 
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
