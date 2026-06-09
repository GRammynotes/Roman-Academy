"use client";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

export default function StudentSettingsPage() {
  return (
    <AppShell active="/student/settings" role="student">
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader eyebrow="Student Portal" title="Settings" />

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Name</label>
              <input
                type="text"
                defaultValue="Prachi Kamble"
                disabled
                className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Batch</label>
              <input
                type="text"
                defaultValue="12th Batch 2026"
                disabled
                className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Stream</label>
              <input
                type="text"
                defaultValue="Science PCM"
                disabled
                className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-4 text-gold-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gold-500/20 bg-ivory-50 p-3">
              <span className="text-sm font-medium text-navy-950">Test Reminders</span>
              <Badge tone="green">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gold-500/20 bg-ivory-50 p-3">
              <span className="text-sm font-medium text-navy-950">Performance Updates</span>
              <Badge tone="green">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gold-500/20 bg-ivory-50 p-3">
              <span className="text-sm font-medium text-navy-950">Parent Communications</span>
              <Badge tone="green">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Change Password</Button>
            <Button variant="secondary" className="w-full">Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
