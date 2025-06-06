"use client";

import { Fragment, useState } from "react";
import { 
  ArrowLeft, 
  MoreVertical, 
  UserPlus, 
  Crown, 
  User, 
  Shield, 
  Mail, 
  Copy,
  Plus,
  Search,
  Filter,
  Users,
  Menu
} from "lucide-react";
import Link from "next/link";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AllMembersCard } from "@/features/members/components/all-members-list";
import { toast } from "sonner";
import { useCurrent } from "@/features/auth/api/use-current";
import { SendInviteEmail } from "@/features/invitations/components/send-invite-email";

// Mobile Member Card Component
const MobileMemberCard = ({ 
  member, 
  workspace, 
  currentUser, 
  workspaceId,
  onUpdateMember,
  onDeleteMember,
  isUpdatingMember,
  isDeletingMember 
}: any) => {
  const isWorkspaceOwner = (member: any) => workspace?.userId === member.userId;
  const isCurrentUserOwner = () => workspace?.userId === currentUser?.$id;
  
  const canManageMembers = () => {
    if (!currentUser) return false;
    if (isCurrentUserOwner()) return true;
    return member.role === MemberRole.ADMIN;
  };

  const canEditMember = (member: any) => {
    if (!canManageMembers()) return false;
    if (isWorkspaceOwner(member)) return false;
    if (isCurrentUserOwner()) return true;
    if (member.role === MemberRole.ADMIN) return false;
    return true;
  };

  const getMemberRole = (member: any) => {
    if (isWorkspaceOwner(member)) return "Owner";
    return member.role;
  };

  const getMemberRoleDisplay = (member: any) => {
    if (isWorkspaceOwner(member)) return "Owner";
    switch (member.role) {
      case MemberRole.ADMIN:
        return "Admin";
      case MemberRole.MEMBER:
        return "Member";
      default:
        return "Unknown";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Owner":
        return "default";
      case MemberRole.ADMIN:
        return "destructive";
      case MemberRole.MEMBER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="w-3 h-3" />;
      case MemberRole.ADMIN:
        return <Shield className="w-3 h-3" />;
      case MemberRole.MEMBER:
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <MemberAvatar className="w-12 h-12 flex-shrink-0" name={member.name} />
          <div className="flex-1 min-w-0">
            <Link 
              href={`/workspaces/${workspaceId}/members/${member.$id}`}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
            >
              {member.name}
            </Link>
            <p className="text-sm text-gray-500 truncate">{member.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Joined {new Date(member.$createdAt).toLocaleDateString()}
            </p>
          </div>
          {canEditMember(member) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onUpdateMember(member.$id, MemberRole.ADMIN)}
                  disabled={isUpdatingMember}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Promote to Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateMember(member.$id, MemberRole.MEMBER)}
                  disabled={isUpdatingMember}
                >
                  <User className="w-4 h-4 mr-2" />
                  Set as Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDeleteMember(member.$id)}
                  disabled={isDeletingMember}
                >
                  Remove from workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Role Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={getRoleBadgeVariant(getMemberRole(member))}
            className={`flex items-center gap-1.5 px-3 py-1 ${
              getMemberRole(member) === "Owner" ? "bg-blue-600 text-white" : ""
            }`}
          >
            {getRoleIcon(getMemberRole(member))}
            {getMemberRoleDisplay(member)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace and will lose access to all projects and data.",
    "destructive"
  );

  const [open, setOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: currentUser } = useCurrent();
  const { data } = useGetMembers({ workspaceId });
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({ json: { role }, param: { memberId } });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      { onSuccess: () => window.location.reload() }
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Owner":
        return "default";
      case MemberRole.ADMIN:
        return "destructive";
      case MemberRole.MEMBER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="w-3 h-3" />;
      case MemberRole.ADMIN:
        return <Shield className="w-3 h-3" />;
      case MemberRole.MEMBER:
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  // Check if member is the workspace creator (owner)
  const isWorkspaceOwner = (member: any) => {
    return workspace?.userId === member.userId;
  };

  // Check if current user is workspace owner
  const isCurrentUserOwner = () => {
    return workspace?.userId === currentUser?.$id;
  };

  // Check if current user is admin or owner
  const canManageMembers = () => {
    if (!currentUser || !data) return false;

    if (isCurrentUserOwner()) return true;

    const currentUserMember = data.documents.find(
      member => member.userId === currentUser.$id
    );

    return currentUserMember?.role === MemberRole.ADMIN;
  };

  const getMemberRole = (member: any) => {
    if (isWorkspaceOwner(member)) {
      return "Owner";
    }
    return member.role;
  };

  const getMemberRoleDisplay = (member: any) => {
    if (isWorkspaceOwner(member)) {
      return "Owner";
    }
    switch (member.role) {
      case MemberRole.ADMIN:
        return "Admin";
      case MemberRole.MEMBER:
        return "Member";
      default:
        return "Unknown";
    }
  };

  // Check if current user can edit a specific member
  const canEditMember = (member: any) => {
    if (!canManageMembers()) return false;
    if (isWorkspaceOwner(member)) return false;
    if (isCurrentUserOwner()) return true;
    if (member.role === MemberRole.ADMIN) return false;
    return true;
  };

  // Filter members based on search term
  const filteredMembers = data?.documents.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Create invite link
  const fullInviteLink = workspace
    ? `${window.location.origin}/workspaces/${workspaceId}/join/${workspace.inviteCode}`
    : "";

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  // Sidebar content component
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Workspace Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workspace Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Members</span>
            <span className="font-semibold">{data?.documents.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Admins</span>
            <span className="font-semibold">
              {data?.documents.filter(m => m.role === MemberRole.ADMIN || isWorkspaceOwner(m)).length || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Members</span>
            <span className="font-semibold">
              {data?.documents.filter(m => m.role === MemberRole.MEMBER && !isWorkspaceOwner(m)).length || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Invite Members Card */}
      {canManageMembers() && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invite Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Invite Code */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Invite Code</label>
              <div className="flex gap-1">
                <Input 
                  value={workspace?.inviteCode || ""} 
                  readOnly 
                  className="text-center font-mono text-sm font-bold bg-blue-50 h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(workspace?.inviteCode || "")
                      .then(() => toast.success("Code copied"));
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Invite Link */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Invite Link</label>
              <div className="flex gap-1">
                <Input 
                  value={fullInviteLink} 
                  readOnly 
                  className="text-xs bg-gray-50 font-mono h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyInviteLink}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Invite via email</label>
              <Button
                onClick={() => setEmailDialogOpen(true)}
                variant="outline"
                size="sm"
                className="w-full h-8 mt-1"
              >
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8 p-4 sm:p-0">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="h-9 px-3">
            <Link href={`/workspaces/${workspaceId}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Toggle */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Workspace Info</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>

          {canManageMembers() && (
            <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Members</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Members List - Takes 2/3 width on desktop, full width on mobile */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold">
                  Members ({filteredMembers.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Desktop View */}
              <div className="hidden sm:block divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <div key={member.$id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MemberAvatar
                          className="w-12 h-12"
                          name={member.name}
                        />
                        <div className="flex flex-col">
                          <Link 
                            href={`/workspaces/${workspaceId}/members/${member.$id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {member.name}
                          </Link>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Joined {new Date(member.$createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={getRoleBadgeVariant(getMemberRole(member))}
                          className={`flex items-center gap-1.5 px-3 py-1 ${
                            getMemberRole(member) === "Owner" ? "bg-blue-600 text-white" : ""
                          }`}
                        >
                          {getRoleIcon(getMemberRole(member))}
                          {getMemberRoleDisplay(member)}
                        </Badge>
                        {canEditMember(member) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                disabled={isUpdatingMember}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
                                disabled={isUpdatingMember}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Set as Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteMember(member.$id)}
                                disabled={isDeletingMember}
                              >
                                Remove from workspace
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View */}
              <div className="sm:hidden p-4">
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <MobileMemberCard
                      key={member.$id}
                      member={member}
                      workspace={workspace}
                      currentUser={currentUser}
                      workspaceId={workspaceId}
                      onUpdateMember={handleUpdateMember}
                      onDeleteMember={handleDeleteMember}
                      isUpdatingMember={isUpdatingMember}
                      isDeletingMember={isDeletingMember}
                    />
                  ))}
                </div>
              </div>
              
              {filteredMembers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "No members in this workspace yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <SidebarContent />
        </div>
      </div>

      {/* Dialogs */}
      {canManageMembers() && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Members</DialogTitle>
            </DialogHeader>
            <AllMembersCard />
          </DialogContent>
        </Dialog>
      )}

      <SendInviteEmail
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        workspaceName={workspace?.name || ""}
        inviteCode={workspace?.inviteCode || ""}
        workspaceId={workspaceId}
      />

      <ConfirmDialog />
    </div>
  );
};
