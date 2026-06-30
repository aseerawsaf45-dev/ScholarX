"use client";


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

import { signOut } from "@/app/auth/actions";

export default function SettingsPage() {
  const isLoading = false;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and security.</p>
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
              <Input placeholder="First Name" className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input placeholder="Last Name" className="bg-background" />
            </div>
          </div>
          <Button disabled={isLoading} variant="outline">Save Changes</Button>
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
            <Input type="password" placeholder="••••••••" className="bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input type="password" placeholder="••••••••" className="bg-background" />
          </div>
          <Button disabled={isLoading} variant="outline">Update Password</Button>
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
