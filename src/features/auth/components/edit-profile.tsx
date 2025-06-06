"use client";

import React, { useState, useEffect } from "react";
import { Save, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DottedSeparator } from "@/components/dotted-separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BackButton } from "@/components/back-button";
import { useCurrent } from "../api/use-current";
import { useUpdateProfile } from "../api/use-update-profile";
import { formatPhoneNumber, validatePhoneNumber } from "@/lib/phone-utils" ;

export const EditProfile = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [description, setDescription] = useState(user?.prefs?.description || "");
  const [phoneError, setPhoneError] = useState("");

  // Update state when user data loads
 // In your edit-profile.tsx, update the useEffect:
    useEffect(() => {
    if (user) {
        setName(user.name || "");
        setPhone(user.prefs?.phone || ""); // Get phone from preferences
        setDescription(user.prefs?.description || "");
    }
    }, [user]);


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || "Invalid phone number");
      return;
    }

    // Format phone number if provided
    const formattedPhone = phone.trim() ? formatPhoneNumber(phone) : "";
    
    updateProfile({
      name: name.trim(),
      phone: formattedPhone,
      description: description.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const avatarFallback = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase() ?? "U";

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <BackButton>
          Back
        </BackButton>
        <CardTitle className="text-xl font-bold">Edit Profile</CardTitle>
      </CardHeader>
      
      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="size-20 border border-neutral-300">
              <AvatarFallback className="bg-neutral-200 text-2xl font-medium text-neutral-500">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <h2 className="text-xl font-semibold">{user.name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <DottedSeparator />

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="size-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed from this page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+1234567890"
                  disabled={isPending}
                  className={phoneError ? "border-red-500" : ""}
                />
                {phoneError && (
                  <p className="text-xs text-red-600">{phoneError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: +[country code][number] (e.g., +1234567890)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="size-5 mr-2" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending} className="min-w-32">
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
