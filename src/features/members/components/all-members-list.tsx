// src/features/members/components/all-members-list.tsx
"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useGetAllMembers } from "@/features/members/api/use-get-all-members";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { InviteButton } from "@/features/invitations/components/invite-button";
import { useGetInvites } from "@/features/invitations/api/useGetInvites"; // make sure this exists

export const AllMembersCard = () => {
  const { data: allMembersData, isLoading, isError } = useGetAllMembers();
  const workspaceId = useWorkspaceId();
  const { data: wsInfo } = useGetWorkspaceInfo({ workspaceId });
  const { data: workspaceMembersData } = useGetMembers({ workspaceId });
  const { data: invitesData } = useGetInvites();

  const workspaceMemberIds =
    workspaceMembersData?.documents.map((m: any) => m.userId) || [];
  const invitedMemberIds =
    invitesData?.map((invite: any) => invite.recipientId) || [];

  const filteredMembers =
    allMembersData?.documents.filter(
      (member: any) =>
        !workspaceMemberIds.includes(member.$id) &&
        !invitedMemberIds.includes(member.$id)
    ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite new members to workspace</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading members...</div>}
        {isError && <div>Failed to load members.</div>}
        <div
          className="max-h-72 sm:max-h-96 overflow-y-auto w-full space-y-2"
          style={{ minHeight: 0 }}
        >
          {filteredMembers.map((member: any) => (
            <div key={member.$id} className="flex items-center gap-2 py-2">
              <MemberAvatar name={member.name} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{member.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {member.email}
                </div>
              </div>
              <InviteButton
                recipientId={member.$id}
                workspaceId={workspaceId}
                workspaceName={wsInfo?.name}
              />
            </div>
          ))}
          {!filteredMembers.length && !isLoading && (
            <div className="text-sm text-muted-foreground">
              No available members to invite.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
