import { Models } from "node-appwrite";

export type Invite = Models.Document & {
  senderId: string;
  recipientId: string;
  workspaceId: string;
  workspaceName?: string;
  createdAt: string; // You can also use `Date` if you parse it
};

export type InvitePayload = {
  recipientId: string;
  workspaceId: string;
  workspaceName?: string;
};
