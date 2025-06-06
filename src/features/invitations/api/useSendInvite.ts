import { InvitePayload } from "../types";

export function useSendInvite() {
  return async ({ recipientId, workspaceId, workspaceName }: InvitePayload) => {
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId, workspaceId, workspaceName }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to send invite");
    return result.data;
  };
}
