import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, KeyRound, MessageSquareText, ShieldCheck, Loader2, Lock, GraduationCap, AlertCircle, Users } from "lucide-react";

type ProviderStatus = { name: string; label: string; configured: boolean; maskedKey: string; model: string };
type SettingsState = {
  primaryProvider: string;
  fallbackProvider: string;
  whatsappNumber: string;
  notificationPreferences: { resultUploaded: boolean; chapterCompleted: boolean; quarterlyReminder: boolean; walkthrough: boolean };
};
type Batch = { id: string; name: string; classLevel: string };

const INPUT_CLS = "mt-1 h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40";
const SELECT_CLS = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40";

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [promoteBatch, setPromoteBatch] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [promoteConfirm, setPromoteConfirm] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/teacher/settings`)
      .then(r => r.json()).then(data => {
        setProviders(data.providers ?? []);
        setSettings(data.settings ?? null);
      }).catch(() => {});

    fetch(`${import.meta.env.BASE_URL}api/teacher/batches`)
      .then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setBatches(data);
          setPromoteBatch(data[0]?.name ?? "");
        }
      }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Settings saved successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { setPwError("All fields are required"); return; }
    if (newPassword.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPwError("New passwords do not match"); return; }
    setPwSaving(true);
    setPwError("");
    setPwSuccess("");
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to change password");
      setPwSuccess("Password changed successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const handlePromote = async () => {
    if (!promoteBatch) return;
    setPromoting(true);
    setPromoteResult(null);
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/teacher/promote-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchType: promoteBatch }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to promote batch");
      setPromoteResult({ type: "success", text: `✓ ${data.promoted} students in "${promoteBatch}" marked as promoted/graduated.` });
      setPromoteConfirm(false);
    } catch (err: any) {
      setPromoteResult({ type: "error", text: err.message });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <AppShell active="/teacher/settings" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Settings">
        <Badge tone="gold">Configuration</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-6 max-w-3xl">

        {/* AI Provider Status */}
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2"><KeyRound className="size-4 text-gold-400" /> AI Provider Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {providers.length === 0 ? (
              <div className="text-ivory-100/50 text-sm">Loading providers...</div>
            ) : (
              providers.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl border border-gold-500/15 bg-navy-900/50">
                  <div>
                    <p className="font-semibold text-white">{p.label}</p>
                    <p className="text-xs text-ivory-100/50 mt-0.5">Model: {p.model} · {p.maskedKey}</p>
                  </div>
                  <Badge tone={p.configured ? "success" : "navy"}>{p.configured ? "Configured" : "Not Set"}</Badge>
                </div>
              ))
            )}
            <div className="text-xs text-ivory-100/40 bg-navy-900 border border-gold-500/10 p-3 rounded-lg">
              API keys are managed through server environment variables for security.
            </div>
          </CardContent>
        </Card>

        {/* Primary Provider & Notifications */}
        {settings && (
          <>
            <Card className="border-gold-500/20">
              <CardHeader className="border-b border-gold-500/10">
                <CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="size-4 text-gold-400" /> AI Provider</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Primary Provider</span>
                  <select value={settings.primaryProvider} onChange={e => setSettings(s => s ? { ...s, primaryProvider: e.target.value } : s)} className={SELECT_CLS}>
                    <option value="openai">OpenAI GPT-4o</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Fallback Provider</span>
                  <select value={settings.fallbackProvider} onChange={e => setSettings(s => s ? { ...s, fallbackProvider: e.target.value } : s)} className={SELECT_CLS}>
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI GPT-4o</option>
                  </select>
                </label>
              </CardContent>
            </Card>

            <Card className="border-gold-500/20">
              <CardHeader className="border-b border-gold-500/10">
                <CardTitle className="text-white flex items-center gap-2"><MessageSquareText className="size-4 text-gold-400" /> Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { key: "resultUploaded", label: "Notify students when test results are uploaded" },
                  { key: "chapterCompleted", label: "Notify when a chapter is completed" },
                  { key: "quarterlyReminder", label: "Send quarterly performance reminders" },
                  { key: "walkthrough", label: "Send onboarding walkthroughs to new students" },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-gold-500/15 bg-navy-900/50 cursor-pointer hover:border-gold-500/30 transition">
                    <input
                      type="checkbox"
                      checked={(settings.notificationPreferences as any)[item.key]}
                      onChange={e => setSettings(s => s ? { ...s, notificationPreferences: { ...s.notificationPreferences, [item.key]: e.target.checked } } : s)}
                      className="w-4 h-4 accent-gold-400"
                    />
                    <span className="text-sm font-medium text-ivory-100/80">{item.label}</span>
                    {(settings.notificationPreferences as any)[item.key] && <CheckCircle2 className="size-4 text-emerald-400 ml-auto" />}
                  </label>
                ))}
              </CardContent>
            </Card>

            {message && (
              <div className={`p-3 rounded-lg border text-sm ${message.type === "success" ? "bg-emerald-900/20 border-emerald-700/40 text-emerald-300" : "bg-red-900/20 border-red-700/40 text-red-300"}`}>
                {message.text}
              </div>
            )}

            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center gap-2 transition-colors">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Save Settings
            </button>
          </>
        )}

        {/* Change Password */}
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2"><Lock className="size-4 text-gold-400" /> Change Password</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { label: "Current Password", value: currentPassword, set: setCurrentPassword },
              { label: "New Password", value: newPassword, set: setNewPassword },
              { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
            ].map(({ label, value, set }) => (
              <label key={label} className="block text-sm text-ivory-100/80">
                <span className="font-semibold">{label}</span>
                <input type="password" value={value} onChange={e => set(e.target.value)} className={INPUT_CLS} placeholder="••••••••" />
              </label>
            ))}
            {pwError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                <AlertCircle className="size-4 shrink-0" /> {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm">
                <CheckCircle2 className="size-4 shrink-0" /> {pwSuccess}
              </div>
            )}
            <button onClick={handleChangePassword} disabled={pwSaving} className="flex items-center gap-2 px-5 py-2 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 transition-colors text-sm">
              {pwSaving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Update Password
            </button>
          </CardContent>
        </Card>

        {/* Promote / Graduate Batch */}
        <Card className="border-red-900/40">
          <CardHeader className="border-b border-red-900/30">
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="size-4 text-red-400" /> Promote / Graduate Batch
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-ivory-100/60">
              Mark all students in a batch as <strong className="text-white">promoted</strong> (11th → 12th) or <strong className="text-white">graduated</strong> (12th → alumni). This sets their <code className="text-gold-300 text-xs">promoted = true</code> and records the graduation year. This action cannot be undone.
            </p>

            <div className="flex gap-3 items-end">
              <label className="flex-1 text-sm text-ivory-100/80">
                <span className="font-semibold">Select Batch</span>
                <select value={promoteBatch} onChange={e => { setPromoteBatch(e.target.value); setPromoteConfirm(false); setPromoteResult(null); }} className={`${SELECT_CLS} mt-1`}>
                  {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </label>
              {!promoteConfirm ? (
                <button onClick={() => setPromoteConfirm(true)} className="h-10 px-4 rounded-lg border border-red-700/50 bg-red-900/20 text-red-300 text-sm font-semibold hover:bg-red-900/40 transition-colors flex items-center gap-2 shrink-0">
                  <Users className="size-4" /> Promote Batch
                </button>
              ) : (
                <button onClick={handlePromote} disabled={promoting} className="h-10 px-4 rounded-lg bg-red-700 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2 shrink-0">
                  {promoting ? <Loader2 className="size-4 animate-spin" /> : <GraduationCap className="size-4" />}
                  Confirm Promote
                </button>
              )}
            </div>

            {promoteConfirm && !promoting && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-300 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                <span>Are you sure? All students in <strong>"{promoteBatch}"</strong> will be marked as promoted. Click "Confirm Promote" to proceed or select a different batch to cancel.</span>
              </div>
            )}

            {promoteResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${promoteResult.type === "success" ? "bg-emerald-900/20 border-emerald-700/40 text-emerald-300" : "bg-red-900/30 border-red-700/40 text-red-300"}`}>
                {promoteResult.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                {promoteResult.text}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
