// components/send-invite-email.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, APP_URL } from "@/config";

interface SendInviteEmailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  inviteCode: string;
  workspaceId: string;
}

export const SendInviteEmail = ({
  open,
  onOpenChange,
  workspaceName,
  inviteCode,
  workspaceId,
}: SendInviteEmailProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);

    try {
      // Initialize EmailJS
      emailjs.init(EMAILJS_PUBLIC_KEY);

      const inviteLink = `${APP_URL}workspaces/${workspaceId}/join/${inviteCode}`;

      const templateParams = {
        to_email: email,
        workspace_name: workspaceName,
        invite_code: inviteCode,
        invite_link: inviteLink,
        sender_name: "CollabFlow Team",
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      toast.success("Invitation sent successfully!");
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Workspace Invitation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Workspace:</strong> {workspaceName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Invite Code:</strong> {inviteCode}
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
