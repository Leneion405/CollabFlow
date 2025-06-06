import { FolderIcon, ListChecksIcon, UserIcon, AlertTriangleIcon, Search, X, Filter } from "lucide-react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskFilters } from "../hooks/use-task-filters";
import { TaskStatus, TaskPriority } from "../types";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
  hideAssigneeFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter, hideAssigneeFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });

  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  const [
    { status, assigneeId, projectId, priority, startDate, dueDate, search },
    setFilters,
  ] = useTaskFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatus) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : value });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : value });
  };

  const onPriorityChange = (value: string) => {
    setFilters({ priority: value === "all" ? null : (value as TaskPriority) });
  };

  // Updated search function to filter by whole words
  const onSearchChange = (value: string) => {
    setFilters({ search: value || null });
  };

  // Helper functions to convert between Date and string
  const stringToDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    try {
      return new Date(dateString);
    } catch {
      return undefined;
    }
  };

  const dateToString = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString();
  };

  const onStartDateChange = (date: Date | null) => {
    setFilters({ startDate: dateToString(date) });
  };

  const onDueDateChange = (date: Date | null) => {
    setFilters({ dueDate: dateToString(date) });
  };

  const clearAllFilters = () => {
    setFilters({
      status: null,
      assigneeId: null,
      projectId: null,
      priority: null,
      startDate: null,
      dueDate: null,
      search: null,
    });
    setIsFilterDrawerOpen(false);
  };

  // Count active filters
  const activeFiltersCount = [
    status,
    assigneeId,
    projectId,
    priority,
    startDate,
    dueDate,
    search,
  ].filter(Boolean).length;

  // Get display values for active filters
  const getStatusDisplay = () => {
    switch (status) {
      case TaskStatus.BACKLOG:
        return "Backlog";
      case TaskStatus.TODO:
        return "To Do";
      case TaskStatus.IN_PROGRESS:
        return "In Progress";
      case TaskStatus.IN_REVIEW:
        return "In Review";
      case TaskStatus.DONE:
        return "Done";
      default:
        return "All Statuses";
    }
  };

  const getPriorityDisplay = () => {
    switch (priority) {
      case TaskPriority.LOW:
        return "Low Priority";
      case TaskPriority.MEDIUM:
        return "Medium Priority";
      case TaskPriority.HIGH:
        return "High Priority";
      default:
        return "All Priorities";
    }
  };

  const getAssigneeDisplay = () => {
    if (!assigneeId) return "All Assignees";
    return memberOptions?.find(m => m.value === assigneeId)?.label || "Unknown";
  };

  const getProjectDisplay = () => {
    if (!projectId) return "All Projects";
    return projectOptions?.find(p => p.value === projectId)?.label || "Unknown";
  };

  // Apply filters and close drawer (for mobile)
  const applyFilters = () => {
    setIsFilterDrawerOpen(false);
  };

  // Get active filter chips
  const getActiveFilterChips = () => {
    const chips = [];
    
    if (status) {
      chips.push({
        label: getStatusDisplay(),
        onRemove: () => setFilters({ status: null }),
        color: "bg-purple-100 text-purple-800"
      });
    }
    
    if (priority) {
      chips.push({
        label: getPriorityDisplay(),
        onRemove: () => setFilters({ priority: null }),
        color: "bg-orange-100 text-orange-800"
      });
    }
    
    if (projectId && !hideProjectFilter) {
      chips.push({
        label: getProjectDisplay(),
        onRemove: () => setFilters({ projectId: null }),
        color: "bg-blue-100 text-blue-800"
      });
    }
    
    if (assigneeId && !hideAssigneeFilter) {
      chips.push({
        label: getAssigneeDisplay(),
        onRemove: () => setFilters({ assigneeId: null }),
        color: "bg-green-100 text-green-800"
      });
    }
    
    if (startDate) {
      chips.push({
        label: `Start: ${new Date(startDate).toLocaleDateString()}`,
        onRemove: () => setFilters({ startDate: null }),
        color: "bg-gray-100 text-gray-800"
      });
    }
    
    if (dueDate) {
      chips.push({
        label: `Due: ${new Date(dueDate).toLocaleDateString()}`,
        onRemove: () => setFilters({ dueDate: null }),
        color: "bg-gray-100 text-gray-800"
      });
    }

    return chips;
  };

  if (isLoading) return null;

  const activeFilterChips = getActiveFilterChips();

  // Desktop Filter Component
  const DesktopFilters = () => (
    <div className="hidden md:flex flex-col gap-4">
      {/* Search Input */}
      <div className="w-full sm:w-auto sm:min-w-[300px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => onSearchChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select value={status || "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10 w-[140px]">
            <div className="flex items-center gap-2">
              <ListChecksIcon className="size-4" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectSeparator />
            <SelectItem value={TaskStatus.BACKLOG}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                Backlog
              </div>
            </SelectItem>
            <SelectItem value={TaskStatus.TODO}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                To Do
              </div>
            </SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                In Progress
              </div>
            </SelectItem>
            <SelectItem value={TaskStatus.IN_REVIEW}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                In Review
              </div>
            </SelectItem>
            <SelectItem value={TaskStatus.DONE}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Done
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priority || "all"} onValueChange={onPriorityChange}>
          <SelectTrigger className="h-10 w-[140px]">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4" />
              <SelectValue placeholder="Priority" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectSeparator />
            <SelectItem value={TaskPriority.HIGH}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                High
              </div>
            </SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                Medium
              </div>
            </SelectItem>
            <SelectItem value={TaskPriority.LOW}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Low
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Project Filter */}
        {!hideProjectFilter && (
          <Select value={projectId || "all"} onValueChange={onProjectChange}>
            <SelectTrigger className="h-10 w-[140px]">
              <div className="flex items-center gap-2">
                <FolderIcon className="size-4" />
                <SelectValue placeholder="Project" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projectOptions && projectOptions.length > 0 && (
                <>
                  <SelectSeparator />
                  {projectOptions.map((project) => (
                    <SelectItem key={project.value} value={project.value}>
                      {project.label}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        )}

        {/* Assignee Filter */}
        {!hideAssigneeFilter && (
          <Select value={assigneeId || "all"} onValueChange={onAssigneeChange}>
            <SelectTrigger className="h-10 w-[140px]">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4" />
                <SelectValue placeholder="Assignee" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {memberOptions && memberOptions.length > 0 && (
                <>
                  <SelectSeparator />
                  {memberOptions.map((member) => (
                    <SelectItem key={member.value} value={member.value}>
                      {member.label}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        )}

        {/* Date Filters */}
        <DatePicker
          value={stringToDate(startDate)}
          onChange={onStartDateChange}
          placeholder="Start date"
          className="h-10 w-[140px]"
        />
        <DatePicker
          value={stringToDate(dueDate)}
          onChange={onDueDateChange}
          placeholder="Due date"
          className="h-10 w-[140px]"
        />

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-10"
          >
            <X className="size-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile Filter Component
  const MobileFilters = () => (
    <div className="md:hidden">
      {/* Search Input - Always visible on mobile */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-12 text-base"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Button and Active Chips */}
      <div className="flex items-center gap-2 mb-4">
        <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="h-12 flex-shrink-0">
              <Filter className="size-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DrawerTrigger>
          
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>Filter Tasks</DrawerTitle>
            </DrawerHeader>
            
            <div className="px-4 pb-4 space-y-6 overflow-y-auto">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status || "all"} onValueChange={onStatusChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        Backlog
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskStatus.TODO}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        To Do
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        In Review
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskStatus.DONE}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Done
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority || "all"} onValueChange={onPriorityChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskPriority.HIGH}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value={TaskPriority.LOW}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              {!hideProjectFilter && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select value={projectId || "all"} onValueChange={onProjectChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projectOptions && projectOptions.length > 0 && (
                        <>
                          <SelectSeparator />
                          {projectOptions.map((project) => (
                            <SelectItem key={project.value} value={project.value}>
                              {project.label}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Assignee Filter */}
              {!hideAssigneeFilter && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  <Select value={assigneeId || "all"} onValueChange={onAssigneeChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {memberOptions && memberOptions.length > 0 && (
                        <>
                          <SelectSeparator />
                          {memberOptions.map((member) => (
                            <SelectItem key={member.value} value={member.value}>
                              {member.label}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <DatePicker
                    value={stringToDate(startDate)}
                    onChange={onStartDateChange}
                    placeholder="Start date"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <DatePicker
                    value={stringToDate(dueDate)}
                    onChange={onDueDateChange}
                    placeholder="Due date"
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <DrawerFooter className="flex flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="flex-1 h-12"
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
              <Button 
                onClick={applyFilters}
                className="flex-1 h-12"
              >
                Apply Filters
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Clear All Button (when filters are active) */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-12 text-sm"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Render appropriate component based on screen size */}
      <DesktopFilters />
      <MobileFilters />

      {/* Active Filter Chips - Show on both desktop and mobile */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`${chip.color} flex items-center gap-1 px-3 py-1 text-xs`}
            >
              {chip.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={chip.onRemove}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Export the helper function for use in other components
export const matchesSearch = (text: string, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  // Escape special regex characters in user input
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Split search term into words and create regex for each
  const words = escaped.trim().split(/\s+/);
  const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
  
  return regex.test(text);
};
