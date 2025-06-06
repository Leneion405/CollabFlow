"use client";

import Link from "next/link";
import { CalendarIcon, Crown, Shield, User, Users, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Member, MemberRole } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

interface RecentMembersProps {
  data: Member[];
  total: number;
}

export const RecentMembers = ({ data, total }: RecentMembersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ workspaceId });

  const isWorkspaceOwner = (member: Member) => workspace?.userId === member.userId;
  const getMemberRole = (member: Member) => (isWorkspaceOwner(member) ? "Owner" : member.role);

  // Sorting: Members first, Admins second, Owner last
  const sortedMembers = [...data].sort((a, b) => {
    // 1. Owner goes to the bottom
    if (isWorkspaceOwner(a) && !isWorkspaceOwner(b)) return 1;  // Owner goes after non-owners
    if (!isWorkspaceOwner(a) && isWorkspaceOwner(b)) return -1; // Non-owners go before owner

    // 2. For non-owners, sort by role hierarchy (Member first, Admin second)
    if (!isWorkspaceOwner(a) && !isWorkspaceOwner(b)) {
      const roleOrder = { [MemberRole.MEMBER]: 1, [MemberRole.ADMIN]: 2 }; // Member=1, Admin=2
      const roleA = roleOrder[a.role] || 0;
      const roleB = roleOrder[b.role] || 0;
      
      if (roleA !== roleB) {
        return roleA - roleB; // Lower number first (Member before Admin)
      }
    }

    // 3. Sort by creation time (most recent first)
    const timeA = new Date(a.$createdAt || 0).getTime();
    const timeB = new Date(b.$createdAt || 0).getTime();
    
    if (timeA !== timeB) {
      return timeB - timeA; // Most recent first
    }

    // 4. If all else is equal, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  const getRoleBadge = (member: Member) => {
    const role = getMemberRole(member);
    if (role === "Owner") {
      return (
        <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
          <Crown className="size-3" />
          Owner
        </Badge>
      );
    } else if (role === MemberRole.ADMIN) {
      return (
        <Badge className="bg-red-500 text-white text-xs flex items-center gap-1">
          <Shield className="size-3" />
          Admin
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-500 text-white text-xs flex items-center gap-1">
          <User className="size-3" />
          Member
        </Badge>
      );
    }
  };

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-3 sm:p-4">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-x-2">
            <Users className="size-5 text-muted-foreground sm:hidden" />
            <p className="text-base sm:text-lg font-semibold">
              Members ({total})
            </p>
          </div>
          <Button 
            variant="muted" 
            size="sm"
            asChild
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <Link href={`/workspaces/${workspaceId}?section=members`}>
              <User className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        
        <DottedSeparator className="my-4" />
        
        {/* Members List */}
        <div className="space-y-3">
          {sortedMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No members found
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="mt-3"
              >
                <Link href={`/workspaces/${workspaceId}?section=members`}>
                  <UserPlus className="size-4 mr-2" />
                  Manage Members
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="space-y-3">
                  {sortedMembers.map((member) => (
                    <Link 
                      key={member.$id}
                      href={`/workspaces/${workspaceId}/members/${member.$id}`}
                    >
                      <Card className="shadow-none rounded-lg hover:shadow-md hover:bg-accent/50 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-3 flex-1 min-w-0">
                              <MemberAvatar name={member.name} className="size-10" />
                              <div className="flex flex-col gap-y-1 flex-1 min-w-0">
                                <p className="text-lg font-medium truncate">
                                  {member.name}
                                </p>
                                <div className="flex items-center gap-x-2">
                                  <p className="text-sm text-muted-foreground truncate">
                                    {member.email}
                                  </p>
                                  {member.$createdAt && (
                                    <>
                                      <div className="size-1 bg-neutral-300 rounded-full flex-shrink-0" />
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <CalendarIcon className="size-3 mr-1" />
                                        <span>
                                          Joined {format(new Date(member.$createdAt), "MMM dd")}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {getRoleBadge(member)}
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
                  {sortedMembers.map((member) => (
                    <Link 
                      key={member.$id}
                      href={`/workspaces/${workspaceId}/members/${member.$id}`}
                    >
                      <Card className="shadow-none rounded-lg hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                        <CardContent className="p-3">
                          {/* Mobile Header */}
                          <div className="flex items-start gap-x-3 mb-3">
                            <MemberAvatar name={member.name} className="size-10 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base leading-tight line-clamp-1">
                                {member.name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {member.email}
                              </p>
                            </div>
                            {getRoleBadge(member)}
                          </div>
                          
                          {/* Mobile Details */}
                          {member.$createdAt && (
                            <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                              <CalendarIcon className="size-3 flex-shrink-0" />
                              <span>
                                Joined {format(new Date(member.$createdAt), "MMM do, yyyy")}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Show All Button - Only if there are members */}
        {sortedMembers.length > 0 && (
          <Button 
            variant="muted" 
            className="mt-4 w-full h-10 sm:h-9" 
            asChild
          >
            <Link href={`/workspaces/${workspaceId}?section=members`}>
              View All Members
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
