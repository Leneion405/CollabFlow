// src/features/members/components/invite-button.tsx
import { RiAddCircleFill } from "react-icons/ri";
import { toast } from "sonner";

export const InviteButton = ({
  recipientId,
  workspaceId,
  workspaceName,
}: {
  recipientId: string;
  workspaceId: string;
  workspaceName?: string;
}) => {
  const sendInvite = async () => {
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId, workspaceId, workspaceName }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Already invited") {
          toast.warning("This member has already been invited.");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast.success("Invite sent!");
    } catch (err: unknown) {
      // Type guard to safely access error properties
      if (err instanceof Error) {
        toast.error(err.message || "Failed to send invite");
      } else if (typeof err === 'string') {
        toast.error(err);
      } else {
        toast.error("Failed to send invite");
      }
    }
  };

  return (
    <RiAddCircleFill
      onClick={sendInvite}
      className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
      title="Invite"
    />
  );
};
