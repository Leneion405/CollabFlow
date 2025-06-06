import { Models } from "node-appwrite";

export type Project = Models.Document & {
  name: string;
  imageUrl: string;
  workspaceId: string;
  createdBy?: string;    // Make optional for existing projects
  createdAt?: string;    // Make optional for existing projects
};
