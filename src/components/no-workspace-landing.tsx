"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { 
  Users, 
  Plus, 
  ArrowRight, 
  Shield, 
  Target,
  Building2,
  UserPlus,
  Sparkles,
  AlertCircle
} from "lucide-react";

export const NoWorkspaceLanding = () => {
  const router = useRouter();
  const { open } = useCreateWorkspaceModal();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleJoinWorkspace = async () => {
    if (!inviteCode.trim()) return;
    
    setIsJoining(true);
    setError("");
    
    try {
      // Fixed API URL to match your route
      const response = await fetch(`/api/invitations/lookup/${inviteCode.trim()}`);
      const data = await response.json();
      
      if (response.ok && data.workspaceId) {
        // Navigate to the full URL with workspace ID
        router.push(`/workspaces/${data.workspaceId}/join/${inviteCode.trim()}`);
      } else {
        // Handle invalid invite code
        setError(data.error || "Invalid invite code. Please check and try again.");
        setIsJoining(false);
      }
    } catch (error) {
      console.error("Error looking up invite code:", error);
      setError("Unable to join workspace. Please try again later.");
      setIsJoining(false);
    }
  };

  const handleCreateWorkspace = () => {
    open();
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Welcome to Collab Flow
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {"You're not in a workspace yet"}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get started by creating your own workspace or join an existing team with an invite code. 
            Collaborate, manage projects, and achieve more together.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Project Management
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Team Collaboration
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Secure & Private
            </Badge>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Workspace Card */}
          <Card className="border-2 hover:border-blue-200 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Workspace
              </CardTitle>
              <CardDescription className="text-gray-600">
                Start fresh with your own workspace and invite team members
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Plus className="w-4 h-4 mr-3 text-green-500" />
                  Full administrative control
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Plus className="w-4 h-4 mr-3 text-green-500" />
                  Unlimited projects and tasks
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Plus className="w-4 h-4 mr-3 text-green-500" />
                  Invite team members instantly
                </div>
              </div>
              
              <Button 
                onClick={handleCreateWorkspace}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3"
                size="lg"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Create New Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Join Workspace Card */}
          <Card className="border-2 hover:border-purple-200 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Join Workspace
              </CardTitle>
              <CardDescription className="text-gray-600">
                Join an existing team using an invitation code
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Plus className="w-4 h-4 mr-3 text-green-500" />
                  Instant access to team projects
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Plus className="w-4 h-4 mr-3 text-green-500" />
                  Collaborate with existing members
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Plus className="w-4 h-4 mr-3 text-green-500" />
                  Start contributing immediately
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode" className="text-sm font-medium text-gray-700">
                    Invitation Code
                  </Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter invitation code (e.g., mpEG9p)"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setError(""); // Clear error when user types
                    }}
                    className="mt-1 text-center font-mono tracking-wider"
                    maxLength={10}
                  />
                  {error && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleJoinWorkspace}
                  disabled={!inviteCode.trim() || isJoining}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3"
                  size="lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {isJoining ? "Joining..." : "Join Workspace"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Separator */}
        <div className="flex items-center justify-center my-12">
          <Separator className="flex-1 max-w-xs" />
          <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
          <Separator className="flex-1 max-w-xs" />
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Why choose Collab Flow?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Project Management</h3>
              <p className="text-sm text-gray-600">
                Organize tasks, track progress, and meet deadlines efficiently
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">
                Work together seamlessly with real-time updates and notifications
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal />
    </div>
  );
};
