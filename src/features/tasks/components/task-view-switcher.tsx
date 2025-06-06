"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataFilters } from "./data-filters";
import { DataTable } from "./data-table";
import { DataKanban } from "./data-kanban";
import { DataCalendar } from "./data-calendar";
import { TaskGantt } from "./data-gantt";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { TaskStatus } from "../types";
import { columns } from "./columns";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

type ViewType = "table" | "kanban" | "calendar" | "gantt";

const viewOptions = [
  { value: "table", label: "📊 Card View" },
  { value: "kanban", label: "📋 Kanban Board" },
  { value: "calendar", label: "📅 Calendar View" },
  { value: "gantt", label: "📈 Gantt Chart" },
];

export const TaskViewSwitcher = ({ hideProjectFilter }: TaskViewSwitcherProps) => {
  const [{ status, assigneeId, projectId, priority, startDate, dueDate, search }] = useTaskFilters();
  const [activeView, setActiveView] = useState<ViewType>("table");
  
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  
  const { open } = useCreateTaskModal();
  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const { data: tasks, isLoading } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    status,
    assigneeId,
    priority,
    startDate,
    dueDate,
    search,
  });

  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({ json: { tasks } });
    },
    [bulkUpdate]
  );

  const handleViewChange = (value: string) => {
    setActiveView(value as ViewType);
  };

  return (
    <Tabs value={activeView} onValueChange={handleViewChange} className="flex-1 w-full border rounded-lg">
      <div className="h-full flex flex-col overflow-auto p-4">
        {/* Mobile and Desktop Header */}
        <div className="flex flex-col gap-y-3 sm:flex-row sm:justify-between sm:items-center">
          {/* Desktop Tabs - Hidden on mobile */}
          <TabsList className="hidden sm:flex w-auto">
            <TabsTrigger className="h-8" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8" value="calendar">
              Calendar
            </TabsTrigger>
            <TabsTrigger className="h-8" value="gantt">
              Gantt
            </TabsTrigger>
          </TabsList>

          {/* Mobile Select Dropdown - Hidden on desktop */}
          <div className="sm:hidden w-full">
            <Select value={activeView} onValueChange={handleViewChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue>
                  {viewOptions.find(option => option.value === activeView)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {viewOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Task Button */}
          <Button 
            onClick={open} 
            size="sm" 
            className="w-full sm:w-auto h-10"
          >
            <Plus className="size-4 mr-2" />
            New Task
          </Button>
        </div>

        <DottedSeparator className="my-4" />
        
        {/* Filters - Made more mobile friendly */}
        <div className="w-full">
          <DataFilters hideProjectFilter={hideProjectFilter} />
        </div>
        
        <DottedSeparator className="my-4" />
        
        {/* Content Area */}
        {isLoading ? (
          <div className="w-full border rounded-lg h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <TabsContent value="table" className="mt-0 h-full">
              <div className="overflow-auto">
                <DataTable columns={columns} data={tasks?.documents ?? []} />
              </div>
            </TabsContent>
            
            <TabsContent value="kanban" className="mt-0 h-full">
              <div className="overflow-auto">
                <DataKanban data={tasks?.documents ?? []} onChange={onKanbanChange} />
              </div>
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0 h-full">
              <div className="overflow-auto">
                <DataCalendar data={tasks?.documents ?? []} />
              </div>
            </TabsContent>
            
            <TabsContent value="gantt" className="mt-0 h-full">
              <div className="overflow-auto">
                <TaskGantt data={tasks?.documents ?? []} />
              </div>
            </TabsContent>
          </div>
        )}
      </div>
    </Tabs>
  );
};
