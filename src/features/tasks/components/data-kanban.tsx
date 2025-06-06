import React, { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";

import { Task, TaskStatus } from "../types";

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TasksState = {
  [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
  data: Task[];
  onChange: (
    tasks: { $id: string; status: TaskStatus; position: number }[]
  ) => void;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
  // Mobile view state
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  // Your existing state management - UNCHANGED
  const [tasks, setTasks] = useState<TasksState>(() => {
    const initialTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });

    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort(
        (a, b) => a.position - b.position
      );
    });

    return initialTasks;
  });

  // Your existing useEffect - UNCHANGED
  useEffect(() => {
    const newTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      newTasks[task.status].push(task);
    });

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
    });

    setTasks(newTasks);
  }, [data]);

  // Your existing drag and drop logic - COMPLETELY UNCHANGED
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[] = [];

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        // Safely remove the task from the source column
        const sourceColumn = [...newTasks[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        // If there's no moved task (shouldn't happen, but just in case), return the previous state
        if (!movedTask) {
          console.error("No task found at the source index");
          return prevTasks;
        }

        // Create a new task object with potentially updated status
        const updatedMovedTask =
          sourceStatus !== destStatus
            ? { ...movedTask, status: destStatus }
            : movedTask;

        // Update the source column
        newTasks[sourceStatus] = sourceColumn;

        // Add the task to the destination column
        const destColumn = [...newTasks[destStatus]];
        destColumn.splice(destination.index, 0, updatedMovedTask);
        newTasks[destStatus] = destColumn;

        // Prepare minimal update payloads
        updatesPayload = [];

        // Always update the moved task
        updatesPayload.push({
          $id: updatedMovedTask.$id,
          status: destStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        // Update positions for affected tasks in the destination column
        newTasks[destStatus].forEach((task, index) => {
          if (task && task.$id !== updatedMovedTask.$id) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: destStatus,
                position: newPosition,
              });
            }
          }
        });

        // If the task moved between columns, update positions in the source column
        if (sourceStatus !== destStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);
              if (task.position !== newPosition) {
                updatesPayload.push({
                  $id: task.$id,
                  status: sourceStatus,
                  position: newPosition,
                });
              }
            }
          });
        }

        return newTasks;
      });

      onChange(updatesPayload);
    },
    [onChange]
  );

  // Mobile navigation functions
  const currentBoard = boards[currentColumnIndex];

  const goToPrevColumn = () => {
    setCurrentColumnIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextColumn = () => {
    setCurrentColumnIndex((prev) => Math.min(boards.length - 1, prev + 1));
  };

  const handleColumnSelect = (boardIndex: string) => {
    setCurrentColumnIndex(parseInt(boardIndex));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Desktop View - Your Original Layout Enhanced */}
      <div className="hidden md:block">
        <div className="flex overflow-x-auto pb-4">
          {boards.map((board) => {
            return (
              <div
                key={board}
                className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[280px] max-w-[320px]"
              >
                <KanbanColumnHeader
                  board={board}
                  taskCount={tasks[board].length}
                />
                <Droppable droppableId={board}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[400px] py-1.5 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
                      }`}
                    >
                      {tasks[board].map((task, index) => (
                        <Draggable
                          key={task.$id}
                          draggableId={task.$id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className={`${
                                snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''
                              } transition-transform`}
                            >
                              <KanbanCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - New Addition */}
      <div className="md:hidden">
        {/* Mobile Navigation */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevColumn}
                disabled={currentColumnIndex === 0}
                className="h-10 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Previous</span>
              </Button>

              <div className="flex-1 mx-3">
                <Select 
                  value={currentColumnIndex.toString()} 
                  onValueChange={handleColumnSelect}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board, index) => (
                      <SelectItem key={board} value={index.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{board.replace('_', ' ')}</span>
                          <span className="text-xs text-muted-foreground">
                            ({tasks[board].length})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextColumn}
                disabled={currentColumnIndex === boards.length - 1}
                className="h-10 px-3"
              >
                <span className="mr-1 hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-1">
              {boards.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded transition-colors ${
                    index === currentColumnIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Column - Uses Same Drag & Drop Logic */}
        <div className="bg-muted p-3 rounded-md">
          <KanbanColumnHeader
            board={currentBoard}
            taskCount={tasks[currentBoard].length}
          />
          
          <Droppable droppableId={currentBoard}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`min-h-[300px] py-3 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
                }`}
              >
                {tasks[currentBoard].length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">No tasks in this column</p>
                  </div>
                ) : (
                  tasks[currentBoard].map((task, index) => (
                    <Draggable
                      key={task.$id}
                      draggableId={task.$id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className={`mb-3 ${
                            snapshot.isDragging ? 'scale-105 rotate-1 shadow-lg' : ''
                          } transition-transform`}
                        >
                          <KanbanCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

       {/* Mobile Quick Navigation */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {boards.map((board, index) => (
            <Button
              key={board}
              variant={index === currentColumnIndex ? "primary" : "outline"} // Changed from "default" to "primary"
              size="sm"
              onClick={() => setCurrentColumnIndex(index)}
              className="flex-shrink-0 text-xs"
            >
              {board.replace('_', ' ')} ({tasks[board].length})
            </Button>
          ))}
        </div>

      </div>
    </DragDropContext>
  );
};
