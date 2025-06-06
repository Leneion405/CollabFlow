"use client";

import { useRouter } from "next/navigation";
import { useGetInvites } from "../api/useGetInvites";
import { useAcceptInvite } from "../api/useAcceptInvite";
import { toast } from "sonner";
import { useState } from "react";
import { Invite } from "../types";
import { Bell, User, CheckSquare, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Extended type for notifications that includes task assignments
interface ExtendedInvite extends Omit<Invite, 'createdAt'> {
  type?: "invite" | "task_assignment";
  task_assignment?: string; // Your existing field
  taskId?: string;
  projectName?: string;
  createdAt: string;
}

export const NotificationBell = () => {
  const { data: notifications = [], refetch } = useGetInvites();
  const acceptInvite = useAcceptInvite();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  console.log('All notifications:', notifications); // Debug log

  // Filter notifications by type with proper typing
  const invites = notifications.filter((n: ExtendedInvite) => 
    (!n.type || n.type === 'invite') && !n.task_assignment
  );
  
  const taskNotifications = notifications.filter((n: ExtendedInvite) => 
    n.type === 'task_assignment' || n.task_assignment === 'task_assignment'
  );
  
  console.log('Filtered invites:', invites); // Debug log
  console.log('Filtered task notifications:', taskNotifications); // Debug log
  
  const totalUnread = notifications.length;

  const handleAcceptInvite = async (inviteId: string, workspaceId: string) => {
    try {
      await acceptInvite(inviteId);
      toast.success("You joined the workspace!");
      await refetch();
      setIsOpen(false);
      router.push(`/workspaces/${workspaceId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invite");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/invitations/${inviteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast.success("Invite declined.");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline invite");
    }
  };

  const handleViewTask = async (taskId: string, workspaceId: string, notificationId: string) => {
    try {
      // Mark notification as read by deleting it
      await fetch(`/api/invitations/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      await refetch();
      setIsOpen(false);
      
      // Navigate to the specific task page
      router.push(`/workspaces/${workspaceId}/tasks/${taskId}`);
      toast.success("Opening task...");
    } catch (err: any) {
      toast.error("Failed to open task");
    }
  };

  const handleDismissTaskNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/invitations/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast.success("Notification dismissed.");
      await refetch();
    } catch (err: any) {
      toast.error("Failed to dismiss notification");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold">Notifications ({totalUnread})</h3>
        </div>
        
        {/* Workspace Invites */}
        {invites.length > 0 && (
          <>
            <div className="px-2 py-1">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Workspace Invites ({invites.length})
              </h4>
            </div>
            {invites.map((invite: ExtendedInvite) => (
              <DropdownMenuItem key={invite.$id} className="p-3 cursor-pointer">
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Workspace Invitation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You've been invited to join "{invite.workspaceName}"
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvite(invite.$id, invite.workspaceId);
                        }}
                        className="h-6 text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineInvite(invite.$id);
                        }}
                        className="h-6 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {taskNotifications.length > 0 && <DropdownMenuSeparator />}
          </>
        )}
        
        {/* Task Assignments */}
        {taskNotifications.length > 0 && (
          <>
            <div className="px-2 py-1">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Task Assignments ({taskNotifications.length})
              </h4>
            </div>
            {taskNotifications.map((notification: ExtendedInvite) => (
              <DropdownMenuItem key={notification.$id} className="p-3 cursor-pointer">
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <p className="font-medium text-sm">🎯 New Task Assignment</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Task:</strong> "{notification.workspaceName}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Project:</strong> "{notification.projectName}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Assigned:</strong> {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notification.taskId) {
                            handleViewTask(notification.taskId, notification.workspaceId, notification.$id);
                          }
                        }}
                        className="h-6 text-xs"
                      >
                        View Task
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissTaskNotification(notification.$id);
                        }}
                        className="h-6 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {totalUnread === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No new notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
