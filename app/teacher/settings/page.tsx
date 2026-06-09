"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, MessageSquareText, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProviderStatus = {
  name: string;
  label: string;
  configured: boolean;
  maskedKey: string;
  model: string;
};

type SettingsState = {
  primaryProvider: string;
  fallbackProvider: string;
  whatsappNumber: string;
  notificationPreferences: {
    resultUploaded: boolean;
    chapterCompleted: boolean;
    quarterlyReminder: boolean;
    walkthrough: boolean;
  };
};

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/teacher/settings");
      if (!res.ok) return;
      const data = await res.json();
      setProviders(data.providers ?? []);
      setSettings(data.settings ?? null);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setMessage(null);

    const res = await fetch("/api/teacher/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    if (!res.ok) {
      const payload = await res.json();
      setMessage(payload.error || "Unable to save settings.");
      setIsSaving(false);
      return;
    }

    const payload = await res.json();
    setSettings(payload.settings);
    setMessage("Settings saved successfully.");
    setIsSaving(false);
  };

  const handleTestConnection = async () => {
    setMessage(null);
    const res = await fetch("/api/teacher/settings/test");
    if (!res.ok) {
      setMessage("Unable to verify provider status.");
      return;
    }
    const data = await res.json();
    setProviders(data.providers);
    setMessage("Connection status refreshed.");
  };

  const handleReset = () => {
    setSettings({
      primaryProvider: "openai",
      fallbackProvider: "grok",
      whatsappNumber: "9172765002",
      notificationPreferences: {
        resultUploaded: true,
        chapterCompleted: true,
        quarterlyReminder: true,
        walkthrough: true
      }
    });
    setMessage("Form reset to defaults. Save to persist.");
  };

  return (
    <AppShell active="/teacher/settings" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Settings">
        <Badge tone="gold">Provider keys masked</Badge>
      </PageHeader>

      <div className="space-y-4">
        {message ? (
          <div className="rounded-xl border border-green-500/20 bg-green-400/10 p-3 text-sm text-green-950">{message}</div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-gold-600" />
                AI provider settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {providers.map((provider) => (
                  <div key={provider.name} className="rounded-xl border border-gold-500/20 bg-ivory-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-navy-950">{provider.label}</p>
                      <Badge tone={provider.configured ? "green" : "red"}>
                        {provider.configured ? "Loaded" : "Missing"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-navy-800/65">{provider.maskedKey}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-navy-800/45">{provider.model}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-navy-800">
                  <span>Primary Provider</span>
                  <select
                    className="h-10 w-full rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40"
                    value={settings?.primaryProvider ?? "openai"}
                    onChange={(event) => setSettings((current) => current ? { ...current, primaryProvider: event.target.value } : current)}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="grok">Grok/Groq</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-navy-800">
                  <span>Fallback Provider</span>
                  <select
                    className="h-10 w-full rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40"
                    value={settings?.fallbackProvider ?? "grok"}
                    onChange={(event) => setSettings((current) => current ? { ...current, fallbackProvider: event.target.value } : current)}
                  >
                    <option value="grok">Grok/Groq</option>
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-gold-500/20 bg-gold-400/10 p-4 text-sm leading-6 text-navy-800">
                API keys remain server-side in `.env`. This page only exposes masked provider status.
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleTestConnection}>Test Connection</Button>
                <Button variant="secondary" onClick={handleSave} disabled={isSaving || !settings}>
                  Save Provider Order
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                  Reset Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText className="size-4 text-gold-600" />
                  WhatsApp settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="space-y-2 text-sm text-navy-800">
                  <span>Teacher Number</span>
                  <input
                    className="h-10 w-full rounded-lg border border-gold-500/25 bg-ivory-50 px-3 text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40"
                    value={settings?.whatsappNumber ?? "9172765002"}
                    onChange={(event) => setSettings((current) => current ? { ...current, whatsappNumber: event.target.value } : current)}
                  />
                </label>
                <p className="text-sm leading-6 text-navy-800/70">
                  Draft generation remains limited to result declared messages and quarterly reminders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-gold-600" />
                  Role permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Teacher routes are separated from student routes",
                  "Upload Marks, Students and WhatsApp stay teacher-only",
                  "Student mobile nav shows Dashboard, Tests, Leaderboard and Profile"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-gold-500/20 bg-ivory-50 p-3 text-sm text-navy-800">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
