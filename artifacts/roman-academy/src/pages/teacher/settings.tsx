import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, KeyRound, MessageSquareText, ShieldCheck, Loader2, GraduationCap, AlertTriangle } from "lucide-react";

type ProviderStatus = { name: string; label: string; configured: boolean; maskedKey: string; model: string };
type SettingsState = {
  primaryProvider: string;
  fallbackProvider: string;
  whatsappNumber: string;
  notificationPreferences: { resultUploaded: boolean; chapterCompleted: boolean; quarterlyReminder: boolean; walkthrough: boolean };
};

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState<{ promoted: number; archived: number; newBatch: string } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/teacher/settings`)
      .then(r => r.json()).then(data => {
        setProviders(data.providers ?? []);
        setSettings(data.settings ?? null);
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
      setMessage("Settings saved successfully.");
    } catch (err: any) {
      setMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromoteBatch = async () => {
    setIsPromoting(true);
    setShowPromoteConfirm(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/promote-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to promote batch");
      setPromoteResult(data);
    } catch (err: any) {
      setMessage(`Promotion failed: ${err.message}`);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <AppShell active="/teacher/settings" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Settings">
        <Badge tone="gold">AI Configuration</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-6">
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
                  <Badge tone={p.configured ? "green" : "neutral"}>{p.configured ? "Configured" : "Not Set"}</Badge>
                </div>
              ))
            )}
            <div className="text-xs text-ivory-100/40 bg-navy-900 border border-gold-500/10 p-3 rounded-lg">
              API keys are managed through server environment variables for security. Contact technical support to configure AI providers.
            </div>
          </CardContent>
        </Card>

        {settings && (
          <>
            <Card className="border-gold-500/20">
              <CardHeader className="border-b border-gold-500/10">
                <CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="size-4 text-gold-400" /> Primary AI Provider</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Primary Provider</span>
                  <select value={settings.primaryProvider} onChange={e => setSettings(s => s ? { ...s, primaryProvider: e.target.value } : s)} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                    <option value="openai">OpenAI GPT-4o</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Fallback Provider</span>
                  <select value={settings.fallbackProvider} onChange={e => setSettings(s => s ? { ...s, fallbackProvider: e.target.value } : s)} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
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
                  { key: "resultUploaded", label: "Notify when test results are uploaded" },
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

            {message && <div className="p-3 rounded-lg bg-navy-900/50 border border-gold-500/20 text-sm text-ivory-100/70">{message}</div>}

            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center gap-2 transition-colors">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Save Settings
            </button>
          </>
        )}

        <Card className="border-red-800/40">
          <CardHeader className="border-b border-red-800/30">
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="size-4 text-red-400" /> Batch Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-ivory-100/70">
              Promote all 11th Science students to 12th, and archive the current 12th batch (marks them as graduated).
              Rank history is reset for all affected students.
            </p>

            {promoteResult && (
              <div className="p-3 rounded-lg border border-emerald-700/40 bg-emerald-900/20 text-sm text-emerald-300 space-y-1">
                <p className="font-semibold">Promotion complete!</p>
                <p>• {promoteResult.promoted} student(s) moved to <strong>{promoteResult.newBatch}</strong></p>
                <p>• {promoteResult.archived} student(s) archived (graduated)</p>
              </div>
            )}

            {!showPromoteConfirm ? (
              <button
                onClick={() => setShowPromoteConfirm(true)}
                disabled={isPromoting}
                className="px-5 py-2.5 border border-red-700/50 text-red-400 font-semibold rounded-lg hover:bg-red-900/20 disabled:opacity-50 flex items-center gap-2 transition-colors text-sm"
              >
                <GraduationCap className="size-4" /> Promote Batch
              </button>
            ) : (
              <div className="space-y-3 p-4 rounded-lg border border-red-700/40 bg-red-900/10">
                <div className="flex items-start gap-2 text-red-300 text-sm">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>This will archive all current 12th students and promote 11th students to 12th. This action cannot be undone.</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePromoteBatch}
                    disabled={isPromoting}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 disabled:opacity-50 flex items-center gap-2 text-sm transition-colors"
                  >
                    {isPromoting ? <Loader2 className="size-4 animate-spin" /> : <GraduationCap className="size-4" />}
                    Yes, Promote Batch
                  </button>
                  <button
                    onClick={() => setShowPromoteConfirm(false)}
                    className="px-4 py-2 border border-gold-500/30 text-ivory-100/70 rounded-lg hover:bg-white/5 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
