export const useAcceptInvite = () => {
  return async (inviteId: string) => {
    const res = await fetch(`/api/invitations/${inviteId}/accept`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Accept failed");
    return res.json();
  };
};
