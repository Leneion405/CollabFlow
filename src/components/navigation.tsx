"use client";

import { cn } from "@/lib/utils";
import { SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill, } from "react-icons/go";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { MemberRole } from "@/features/members/types";

const routes = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
    type: "link",
    permission: "all" // Everyone can see home
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
    type: "link",
    permission: "all" // Everyone can see tasks
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
    type: "button",
    permission: "all" // Everyone can see members list
  },
  {
    label: "Settings",
    href: "/setting",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    type: "button",
    permission: "admin" // Only admins and owners
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: currentUser, isLoading: isLoadingUser } = useCurrent();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({ workspaceId });
  
  const currentSection = searchParams.get('section');

  // Check if current user is workspace owner
  const isCurrentUserOwner = () => {
    return workspace?.userId === currentUser?.$id;
  };

  // Check if current user is admin or owner
  const canAccessAdminFeatures = () => {
    if (!currentUser || !members) return false;
    
    // If user is workspace owner, they can access admin features
    if (isCurrentUserOwner()) return true;
    
    // Find current user's member record
    const currentUserMember = members.documents.find(
      member => member.userId === currentUser.$id
    );
    
    // If user is admin, they can access admin features
    return currentUserMember?.role === MemberRole.ADMIN;
  };

  // Filter routes based on user permissions
  const getVisibleRoutes = () => {
    return routes.filter(route => {
      if (route.permission === "all") return true;
      if (route.permission === "admin") return canAccessAdminFeatures();
      return false;
    });
  };

  const handleSettingsClick = () => {
    router.push(`/workspaces/${workspaceId}?section=settings`);
  };

  const handleMembersClick = () => {
    router.push(`/workspaces/${workspaceId}?section=members`);
  };

  // Show loading state while data is being fetched
  if (isLoadingUser || isLoadingMembers || isLoadingWorkspace) {
    return (
      <ul className="flex flex-col">
        {[1, 2, 3].map((i) => (
          <li key={i} className="p-2.5">
            <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
          </li>
        ))}
      </ul>
    );
  }

  const visibleRoutes = getVisibleRoutes();

  return (
    <ul className="flex flex-col">
      {visibleRoutes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        
        // Determine if this item is active
        let isActive = false;
        if (item.type === "button" && item.label === "Settings") {
          isActive = currentSection === "settings";
        } else if (item.type === "button" && item.label === "Members") {
          isActive = currentSection === "members";
        } else if (item.label === "Home") {
          isActive = !currentSection && pathname === `/workspaces/${workspaceId}`;
        } else {
          isActive = pathname === fullHref;
        }
        
        const Icon = isActive ? item.activeIcon : item.icon;

        if (item.type === "button") {
          const handleClick = item.label === "Settings" ? handleSettingsClick : handleMembersClick;
          
          return (
            <li key={item.href}>
              <button
                onClick={handleClick}
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500 w-full text-left",
                  isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                )}
              >
                <Icon className="size-5 text-neutral-500" />
                {item.label}
              </button>
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link href={fullHref}>
              <div
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                  isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                )}
              >
                <Icon className="size-5 text-neutral-500" />
                {item.label}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
