"use client";

import { z } from "zod";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, ImageIcon, RefreshCwIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useResetInviteCode } from "../api/use-reset-invite-code";
import { DottedSeparator } from "@/components/dotted-separator";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } =
    useResetInviteCode();

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current invite link and generate a new one. All existing invite links will no longer work.",
    "destructive"
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
      description: initialValues.description ?? "",
    },
  });

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) return;

    resetInviteCode({ param: { workspaceId: initialValues.$id } });
  };

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };

    mutate({ form: finalValues, param: { workspaceId: initialValues.$id } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  return (
    <div className="max-w-10xl mx-auto space-y-8">
      <ResetDialog />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Settings</CardTitle>
              <CardDescription>
                Update your workspace name, description, and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Workspace Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter workspace name"
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription>
                          This is the display name for your workspace
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                 {/* Workspace Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe the purpose and goals of this workspace..."
                            rows={8}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a comprehensive description. Use line breaks to separate paragraphs for better readability.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  {/* Workspace Icon */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace Icon</FormLabel>
                        <div className="flex items-start gap-6">
                          {/* Image Preview */}
                          <div className="flex-shrink-0">
                            {field.value ? (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                                <Image
                                  alt="Workspace icon"
                                  fill
                                  className="object-cover"
                                  src={
                                    field.value instanceof File
                                      ? URL.createObjectURL(field.value)
                                      : field.value
                                  }
                                />
                              </div>
                            ) : (
                              <Avatar className="w-20 h-20 rounded-xl">
                                <AvatarFallback className="rounded-xl bg-gray-100">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          {/* Upload Controls */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Upload a custom icon for your workspace
                              </p>
                              <p className="text-xs text-gray-500">
                                Recommended: Square image, at least 200x200px. Max file size: 1MB
                              </p>
                            </div>
                            
                            <input
                              className="hidden"
                              type="file"
                              accept=".jpg,.png,.jpeg,.svg"
                              ref={inputRef}
                              onChange={handleImageChange}
                              disabled={isPending}
                            />
                            
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                                disabled={isPending}
                              >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                {field.value ? "Change" : "Upload"} Icon
                              </Button>
                              
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange(null);
                                    if (inputRef.current) {
                                      inputRef.current.value = "";
                                    }
                                  }}
                                  disabled={isPending}
                                >
                                  <TrashIcon className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="min-w-[120px]"
                    >
                      {isPending ? (
                        <>
                          <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Takes 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Workspace Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workspace Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Workspace ID</p>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded mt-1">
                  {initialValues.$id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-sm text-gray-500">
                  {new Date(initialValues.$createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Owner</p>
                <p className="text-sm text-gray-500">{initialValues.createdBy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Team Invitation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Invitation</CardTitle>
              <CardDescription>
                Share this link to invite new members to your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invite Code Display */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Invite Code</p>
                  <Badge variant="secondary" className="text-xs">
                    {initialValues.inviteCode}
                  </Badge>
                </div>
              </div>

              {/* Invite Link */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Invite Link</p>
                <div className="flex gap-2">
                  <Input 
                    value={fullInviteLink} 
                    readOnly 
                    className="text-xs bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyInviteLink}
                    className="flex-shrink-0"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Reset Invite Link */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Security</p>
                <p className="text-xs text-gray-500">
                  Reset the invite link if it has been compromised
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetInviteCode}
                  disabled={isResettingInviteCode}
                  className="w-full"
                >
                  {isResettingInviteCode ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                      Reset Invite Link
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};