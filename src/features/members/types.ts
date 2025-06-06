import { Models } from "node-appwrite";

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export type Member = Models.Document & {
  workspaceId: string;
  userId: string;
  role: MemberRole;
};

export type MemberWithUserInfo = Member & {
  name: string;
  email: string;
  phone?: string;
  description?: string;
  taskCompleted?: number;
  role: MemberRole | "Owner"; // Allow both MemberRole and "Owner"
};
