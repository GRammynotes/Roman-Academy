"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Send } from "lucide-react";

type WhatsAppDraft = {
  id: string;
  student: string;
  cadence: string;
  status: string;
  draft: string;
  batchType: string;
  createdAt: string;
};

export default function WhatsAppPage() {
  const [drafts, setDrafts] = useState<WhatsAppDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDrafts() {
      const res = await fetch("/api/teacher/whatsapp");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    }
    loadDrafts();
  }, []);

  const handleTextChange = (id: string, value: string) => {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, draft: value } : draft)));
  };

  const handleSend = async (id: string) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/teacher/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, body: draft.draft })
    });

    const payload = await res.json();
    if (!res.ok) {
      setMessage(payload?.error || "Failed to send draft.");
    } else {
      setDrafts((current) => current.filter((item) => item.id !== id));
      setMessage(`Draft for ${draft.student} marked sent.`);
    }
    setLoading(false);
  };

  return (
    <AppShell active="/teacher/whatsapp" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="WhatsApp draft queue">
        <Badge tone="gold">Result declared + quarterly reminders only</Badge>
      </PageHeader>
      <div className="space-y-4 p-4 md:p-6">
        <div className="rounded-xl border border-gold-500/20 bg-ivory-50 p-4 text-sm text-navy-800">
          <p className="font-semibold text-navy-950">Teacher sender number</p>
          <p>9172765002</p>
          <p className="mt-2 text-navy-800/70">Edits are allowed before manual send. Only approved drafts will be marked sent in the system.</p>
        </div>

        {message ? (
          <div className="rounded-xl border border-green-500/20 bg-green-400/10 p-3 text-sm text-green-950">{message}</div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {drafts.length ? drafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>{draft.student}</CardTitle>
                    <p className="text-sm text-navy-800/65">{draft.cadence}</p>
                  </div>
                  <Badge tone={draft.status === "TEACHER_REVIEW" ? "gold" : "blue"}>{draft.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="text-sm font-medium text-navy-950">Draft message</label>
                <textarea
                  className="min-h-40 w-full resize-none rounded-xl border border-gold-500/25 bg-ivory-50 p-3 text-sm leading-6 text-navy-950 outline-none focus:ring-2 focus:ring-gold-400/40"
                  value={draft.draft}
                  onChange={(event) => handleTextChange(draft.id, event.target.value)}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-navy-800/65">Created at {new Date(draft.createdAt).toLocaleString()}</p>
                  <Button onClick={() => handleSend(draft.id)} disabled={loading}>
                    <Send className="size-4" />
                    Send manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="rounded-xl border border-gold-500/20 bg-ivory-50 p-6 text-center text-sm text-navy-800/75">No drafts are queued for this batch.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
