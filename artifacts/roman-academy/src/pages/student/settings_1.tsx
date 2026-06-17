import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, AlertCircle, CheckCircle2, Loader2, Lock, KeyRound } from "lucide-react";

type StudentProfile = {
  id: string;
  fullName: string;
  whatsappContact: string;
  classLevel: string;
  stream: string;
  batchType: string;
  joinedDate: string;
  isDemo?: boolean;
};

export default function StudentSettings() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsappContact, setWhatsappContact] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${import.meta.env.BASE_URL}api/student/profile`);
      if (!r.ok) throw new Error("Failed to load");
      const data = await r.json();
      setProfile(data);
      setFullName(data.fullName);
      setWhatsappContact(data.whatsappContact || "");
    } catch {
      setError("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const isDemo = profile?.isDemo ?? false;

  const handleSave = async () => {
    if (!fullName.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/student/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsappContact }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to save");
      setSuccess("Profile updated successfully.");
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { setPasswordError("Both fields are required"); return; }
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to change password");
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppShell active="/student/settings" role="student">
      <PageHeader eyebrow="Student Portal" title="Account Settings">
        <div className="flex items-center gap-2">
          {isDemo && <Badge tone="gold" className="flex items-center gap-1"><Lock className="size-3" /> Demo Account</Badge>}
          <Badge tone="gold">Profile</Badge>
        </div>
      </PageHeader>

      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        {isDemo && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/30 bg-gold-400/10 text-gold-300 text-sm">
            <Lock className="size-4 shrink-0" />
            <span>You're viewing a <strong>demo account</strong>. Profile edits and password changes are disabled.</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-ivory-100/50">Loading...</div>
        ) : (
          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10 flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="size-4 text-gold-400" /> Profile Information
              </CardTitle>
              {!editing && !isDemo && (
                <button onClick={() => setEditing(true)} className="text-xs text-gold-400 hover:text-gold-300 border border-gold-400/30 px-3 py-1.5 rounded-lg transition-colors">
                  Edit
                </button>
              )}
              {!editing && isDemo && (
                <span title="Demo account — changes not allowed" className="text-xs text-ivory-100/30 border border-ivory-100/10 px-3 py-1.5 rounded-lg cursor-not-allowed flex items-center gap-1">
                  <Lock className="size-3" /> Edit
                </span>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Class", value: profile?.classLevel === "TWELVE" ? "12th Standard" : "11th Standard" },
                  { label: "Stream", value: profile?.stream || "N/A" },
                  { label: "Batch", value: profile?.batchType || "N/A" },
                  { label: "Joined", value: profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString("en-IN") : "N/A" },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl border border-gold-500/15 bg-navy-900/50">
                    <p className="text-xs text-ivory-100/50 uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className="text-sm font-medium text-white mt-1">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold-500/10 pt-4 space-y-3">
                <label className="block text-sm text-ivory-100/80">
                  <span className="font-semibold">Full Name</span>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={!editing || isDemo}
                    title={isDemo ? "Demo account — changes not allowed" : undefined}
                    className="mt-1 h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </label>
                <label className="block text-sm text-ivory-100/80">
                  <span className="font-semibold">WhatsApp Number</span>
                  <input
                    value={whatsappContact}
                    onChange={e => setWhatsappContact(e.target.value)}
                    disabled={!editing || isDemo}
                    title={isDemo ? "Demo account — changes not allowed" : undefined}
                    placeholder="+91 xxxxxxxxxx"
                    className="mt-1 h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                  <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm">
                  <CheckCircle2 className="size-4 shrink-0" /> {success}
                </div>
              )}

              {editing && !isDemo && (
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 transition-colors text-sm">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Save Changes
                  </button>
                  <button onClick={() => { setEditing(false); setError(""); }} className="px-5 py-2 border border-gold-500/30 text-ivory-100/70 rounded-lg hover:bg-white/5 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2">
              <KeyRound className="size-4 text-gold-400" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {isDemo ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 bg-navy-900/50 text-ivory-100/50 text-sm">
                <Lock className="size-4 shrink-0 text-gold-400/50" />
                <span title="Demo account — changes not allowed">Password changes are disabled for demo accounts.</span>
              </div>
            ) : (
              <>
                <label className="block text-sm text-ivory-100/80">
                  <span className="font-semibold">Current Password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40"
                    placeholder="Enter current password"
                  />
                </label>
                <label className="block text-sm text-ivory-100/80">
                  <span className="font-semibold">New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40"
                    placeholder="Min. 6 characters"
                  />
                </label>
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                    <AlertCircle className="size-4 shrink-0" /> {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm">
                    <CheckCircle2 className="size-4 shrink-0" /> {passwordSuccess}
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex items-center gap-2 px-5 py-2 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 transition-colors text-sm"
                >
                  {changingPassword ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                  Update Password
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
