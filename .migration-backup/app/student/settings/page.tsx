"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface StudentProfile {
  id: string;
  fullName: string;
  whatsappContact: string;
  classLevel: string;
  stream: string;
  batchType: string;
  batch: string;
  joinedDate: string;
}

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [whatsappContact, setWhatsappContact] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/profile");
      if (!response.ok) throw new Error("Failed to load profile");
      const data = await response.json();
      setProfile(data);
      setFullName(data.fullName);
      setWhatsappContact(data.whatsappContact || "");
      setError("");
    } catch (err) {
      setError("Could not load profile. Please refresh the page.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (!whatsappContact.trim()) {
      setError("Phone number is required");
      return;
    }

    const phoneDigits = whatsappContact.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setError("Phone number must be 10 digits");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          whatsappContact: phoneDigits
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save");

      setSuccess("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.fullName);
      setWhatsappContact(profile.whatsappContact || "");
    }
    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <AppShell active="/student/settings" role="student">
        <div className="space-y-4 p-4 md:p-6">
          <PageHeader eyebrow="Student Portal" title="Settings" />
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-gold-400" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/student/settings" role="student">
      <div className="space-y-4 p-4 md:p-6">
        <PageHeader eyebrow="Student Portal" title="Settings" />

        {/* Profile Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Settings</CardTitle>
            {!editing && (
              <Button
                variant="secondary"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
                <AlertCircle className="size-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                <CheckCircle2 className="size-4" />
                {success}
              </div>
            )}

            {/* Editable Fields */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!editing}
                className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950 disabled:bg-ivory-100 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter your full name"
              />
              <p className="text-xs text-navy-800/60">You can edit your name anytime</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">
                WhatsApp Phone Number
              </label>
              <input
                type="tel"
                value={whatsappContact}
                onChange={(e) =>
                  setWhatsappContact(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                disabled={!editing}
                className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-sm text-navy-950 disabled:bg-ivory-100 disabled:cursor-not-allowed transition-colors"
                placeholder="10 digit phone number"
              />
              <p className="text-xs text-navy-800/60">Used for class updates and announcements</p>
            </div>

            {/* Read-only Fields */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-950">Batch</label>
              <input
                type="text"
                value={profile?.batch || ""}
                disabled
                className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-100 px-3 text-sm text-navy-800/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-950">Class</label>
                <input
                  type="text"
                  value={profile?.classLevel === "TWELVE" ? "12th" : "11th"}
                  disabled
                  className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-100 px-3 text-sm text-navy-800/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-950">Stream</label>
                <input
                  type="text"
                  value={
                    profile?.stream === "SCIENCE_PCM"
                      ? "Science PCM"
                      : profile?.stream === "NEET_ADDON"
                      ? "NEET"
                      : "Commerce"
                  }
                  disabled
                  className="w-full h-10 rounded-lg border border-gold-500/25 bg-ivory-100 px-3 text-sm text-navy-800/60"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
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

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Change Password</Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="secondary" className="w-full" type="submit">
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
