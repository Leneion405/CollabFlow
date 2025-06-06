"use client";

import { useMemo, useEffect, useState } from "react";
import { Gantt, Willow, GanttTask, GanttLink, GanttScale, GanttColumn } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

interface TaskGanttProps {
  data: Task[];
}

export const TaskGantt = ({ data }: TaskGanttProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add custom styles for horizontal scrolling on both desktop and mobile
  useEffect(() => {
    const addCustomStyles = () => {
      const style = document.createElement('style');
      style.id = 'gantt-responsive-styles';
      style.textContent = `
        /* Base Gantt styles */
        .wx-gantt {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        .wx-gantt .wx-timeline {
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        
        .wx-gantt .wx-timeline-body {
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        
        .wx-gantt .wx-grid {
          overflow: visible !important;
        }
        
        /* Enhanced horizontal scrollbar */
        .wx-gantt .wx-scrollbar-horizontal {
          position: relative !important;
          margin-top: 0 !important;
          background: #f8fafc !important;
          height: 20px !important;
          border-top: 1px solid #e5e7eb !important;
          border-radius: 4px !important;
        }
        
        /* Hide vertical scrollbar since we use pagination */
        .wx-gantt .wx-scrollbar-vertical {
          display: none !important;
        }
        
        /* Container styles */
        .gantt-container {
          height: auto !important;
          overflow: visible !important;
          position: relative !important;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .wx-gantt {
            min-width: 100% !important;
            width: 100% !important;
          }
          
          .wx-gantt .wx-timeline {
            min-width: 800px !important; /* Force minimum width for scrolling */
            overflow-x: scroll !important;
            -webkit-overflow-scrolling: touch !important; /* Smooth scrolling on iOS */
          }
          
          .wx-gantt .wx-timeline-body {
            min-width: 800px !important;
            overflow-x: scroll !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          /* Enhanced mobile scrollbar */
          .wx-gantt .wx-scrollbar-horizontal {
            height: 25px !important;
            background: #e5e7eb !important;
            border: 2px solid #d1d5db !important;
            border-radius: 6px !important;
          }
          
          /* Mobile touch scrolling improvements */
          .wx-gantt .wx-scrollbar-horizontal::-webkit-scrollbar {
            height: 20px !important;
          }
          
          .wx-gantt .wx-scrollbar-horizontal::-webkit-scrollbar-track {
            background: #f1f5f9 !important;
            border-radius: 6px !important;
          }
          
          .wx-gantt .wx-scrollbar-horizontal::-webkit-scrollbar-thumb {
            background: #64748b !important;
            border-radius: 6px !important;
            border: 2px solid #f1f5f9 !important;
          }
          
          .wx-gantt .wx-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
            background: #475569 !important;
          }
          
          /* Force horizontal scrolling container */
          .mobile-gantt-wrapper {
            width: 100% !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            -webkit-overflow-scrolling: touch !important;
            position: relative !important;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 769px) {
          .wx-gantt .wx-timeline {
            min-width: 1200px !important;
          }
          
          .wx-gantt .wx-timeline-body {
            min-width: 1200px !important;
          }
        }
      `;
      
      const existing = document.getElementById('gantt-responsive-styles');
      if (existing) existing.remove();
      
      document.head.appendChild(style);
    };

    addCustomStyles();
  }, [isMobile]);

  const {  totalPages, ganttTasks, ganttLinks, dateRange, validTasks } = useMemo(() => {
    const validTasks = data.filter(task => task.startDate && task.dueDate);
    
    if (validTasks.length === 0) {
      return { 
        paginatedTasks: [], 
        totalPages: 0, 
        ganttTasks: [], 
        ganttLinks: [], 
        dateRange: { start: new Date(), end: new Date() },
        validTasks: []
      };
    }

    // Calculate pagination
    const totalPages = Math.ceil(validTasks.length / tasksPerPage);
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = validTasks.slice(startIndex, endIndex);

    // Calculate dynamic date range based on paginated tasks
    const allDates = paginatedTasks.flatMap(task => [
      new Date(task.startDate!),
      new Date(task.dueDate!)
    ]);
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add some padding (7 days before and after)
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - 7);
    
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + 7);

    const ganttTasks: GanttTask[] = paginatedTasks.map((task) => {
      const taskStartDate = new Date(task.startDate!);
      const taskEndDate = new Date(task.dueDate!);
      const duration = Math.ceil((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: task.$id,
        text: task.name,
        start: taskStartDate,
        end: taskEndDate,
        duration: Math.max(1, duration),
        type: "task" as const,
        parent: 0,
        dueDate: taskEndDate.toLocaleDateString('en-GB'),
      };
    });

    const ganttLinks: GanttLink[] = [];
    let linkId = 1;

    paginatedTasks.forEach(task => {
      if (task.dependencyIds && task.dependencyIds.length > 0) {
        task.dependencyIds.forEach(depId => {
          if (paginatedTasks.find(t => t.$id === depId)) {
            ganttLinks.push({
              id: linkId++,
              source: depId,
              target: task.$id,
              type: "e2s" as const
            });
          }
        });
      }
    });

    return { 
      paginatedTasks,
      totalPages,
      ganttTasks, 
      ganttLinks, 
      dateRange: { start: startDate, end: endDate },
      validTasks
    };
  }, [data, currentPage, tasksPerPage]);

  // Define responsive columns
  const getColumns = (): GanttColumn[] => {
    if (isMobile) {
      return [
        { 
          id: "text", 
          header: "Task", 
          width: 200 // Fixed width for mobile
        }
      ];
    }
    
    return [
      { 
        id: "text", 
        header: "Task Name", 
        flexgrow: 2 
      },
      { 
        id: "start", 
        header: "Start Date", 
        width: 150,
        align: "center" 
      },
      { 
        id: "dueDate", 
        header: "Due Date", 
        width: 150,
        align: "center" 
      }
    ];
  };

  // Configure responsive scales
  const getScales = (): GanttScale[] => {
    if (isMobile) {
      return [
        { 
          unit: "month" as const, 
          step: 1, 
          format: "MMM"
        },
        { 
          unit: "day" as const, 
          step: 1, 
          format: "d"
        }
      ];
    }
    
    return [
      { 
        unit: "month" as const, 
        step: 1, 
        format: "MMM yyyy"
      },
      { 
        unit: "day" as const, 
        step: 1, 
        format: "d"
      }
    ];
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (validTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <BarChart3 className="size-16 mb-4 opacity-50" />
        <div className="text-lg font-medium mb-2">No tasks with valid dates</div>
        <div className="text-sm text-center">Tasks need both start and due dates to appear on the timeline</div>
        <div className="text-xs mt-2">Total tasks: {data.length}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile instruction */}
      {isMobile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <BarChart3 className="size-4" />
            <span className="font-medium">Swipe left/right to scroll the timeline</span>
          </div>
        </div>
      )}

      {/* Gantt Chart with responsive wrapper */}
      <div className={`flex-1 gantt-container ${isMobile ? 'mobile-gantt-wrapper' : ''}`}>
        <Willow>
          <Gantt 
            tasks={ganttTasks}
            links={ganttLinks}
            scales={getScales()}
            columns={getColumns()}
            cellWidth={isMobile ? 25 : 30}
            cellHeight={isMobile ? 35 : 40}
            scaleHeight={isMobile ? 35 : 40}
            lengthUnit="day"
            start={dateRange.start}
            end={dateRange.end}
          />
        </Willow>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t bg-white gap-4">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * tasksPerPage) + 1} to {Math.min(currentPage * tasksPerPage, validTasks.length)} of {validTasks.length} tasks
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <span className="text-sm text-gray-700 px-2">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
