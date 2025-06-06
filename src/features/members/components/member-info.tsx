"use client";

import { Phone, Mail, User, FileText, CheckCircle, Shield, Crown, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DottedSeparator } from "@/components/dotted-separator";
import { MemberAvatar } from "./member-avatar";
import { useGetMemberInfo } from "../api/use-get-member-info";
import { MemberRole } from "../types";


interface MemberInfoProps {
  memberId: string;
  workspaceId: string;
}

export const MemberInfo = ({ memberId, workspaceId }: MemberInfoProps) => {
  const { data: memberInfo, isLoading } = useGetMemberInfo({ memberId, workspaceId });

  const getRoleBadgeVariant = (role: MemberRole | "Owner") => {
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

  const getRoleIcon = (role: MemberRole | "Owner") => {
    switch (role) {
      case "Owner":
        return <Crown className="size-4" />;
      case MemberRole.ADMIN:
        return <Shield className="size-4" />;
      case MemberRole.MEMBER:
        return <User className="size-4" />;
      default:
        return <User className="size-4" />;
    }
  };

  const getRoleDisplayName = (role: MemberRole | "Owner") => {
    switch (role) {
      case "Owner":
        return "Owner";
      case MemberRole.ADMIN:
        return "Admin";
      case MemberRole.MEMBER:
        return "Member";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Member not found</p>
      </div>
    );
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <div className="flex items-center gap-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workspaces/${workspaceId}`}>
              <ArrowLeft></ArrowLeft>
              Back
            </Link>
          </Button>
        </div>
        <CardTitle className="text-xl font-bold">Member Information</CardTitle>
      </CardHeader>
      
      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <div className="flex flex-col space-y-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <MemberAvatar
              className="size-20"
              fallbackClassName="text-2xl"
              name={memberInfo.name}
            />
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-bold">{memberInfo.name}</h2>
              <Badge 
                variant={getRoleBadgeVariant(memberInfo.role)}
                className="w-fit"
              >
                {getRoleIcon(memberInfo.role)}
                <span className="ml-1">{getRoleDisplayName(memberInfo.role)}</span>
              </Badge>
            </div>
          </div>

          <DottedSeparator />

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{memberInfo.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {memberInfo.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{memberInfo.$id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="size-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Tasks Completed</p>
                    <p className="text-2xl font-bold text-green-600">{memberInfo.taskCompleted || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description Section */}
          {memberInfo.description && (
            <>
              <DottedSeparator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="size-5 mr-2" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {memberInfo.description}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
