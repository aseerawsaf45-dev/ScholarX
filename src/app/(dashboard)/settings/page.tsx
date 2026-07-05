"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { signOut } from "@/app/auth/actions";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setFirstName(user.user_metadata.first_name || "");
        setLastName(user.user_metadata.last_name || "");
      }
    }
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      });
      if (error) throw error;

      // Sync name with DB
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName })
      });
      if (!res.ok) throw new Error("Failed to sync name with database");

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile details updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile details");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setIsLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;

      toast.success("Password updated successfully!");
      setNewPassword("");
      setCurrentPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and security.</p>
        </div>
        <Button variant="outline" asChild className="shrink-0">
          <Link href="/dashboard">
            <Icon name="ArrowLeft" className="mr-2" size={16} /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                placeholder="First Name" 
                className="bg-background" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                placeholder="Last Name" 
                className="bg-background" 
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isLoadingProfile} variant="outline">
            {isLoadingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password and secure your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <Input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              placeholder="••••••••" 
              className="bg-background" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="••••••••" 
              className="bg-background" 
            />
          </div>
          <Button onClick={handleUpdatePassword} disabled={isLoadingPassword} variant="outline">
            {isLoadingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <Card variant="interactive" className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Manage sessions and account deletion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-border p-4 rounded-lg">
            <div>
              <h4 className="font-semibold text-sm">Sign Out</h4>
              <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                signOut();
              }}
            >
              <Icon name="LogOut" size={16} /> Sign Out
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-destructive/20 bg-destructive/5 p-4 rounded-lg mt-4">
            <div>
              <h4 className="font-semibold text-sm text-destructive">Delete Account</h4>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive" className="gap-2">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
