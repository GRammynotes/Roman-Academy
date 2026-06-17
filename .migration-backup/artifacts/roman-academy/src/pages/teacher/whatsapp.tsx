import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, MessageSquareText } from "lucide-react";

type Draft = {
  id: string;
  student: string;
  cadence: string;
  status: string;
  draft: string;
  batchType: string;
  createdAt: string;
};

export default function WhatsAppPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/teacher/whatsapp`)
      .then(r => r.json()).then(setDrafts).catch(() => setDrafts([])).finally(() => setLoading(false));
  }, []);

  const handleTextChange = (id: string, value: string) => {
    setDrafts(d => d.map(item => item.id === id ? { ...item, draft: value } : item));
  };

  const handleSend = async (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;
    setSending(id);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, body: draft.draft }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setDrafts(d => d.filter(item => item.id !== id));
      setMessage(`Message sent to ${draft.student}`);
    } catch (err: any) {
      setMessage("Failed to send. Please try again.");
    } finally {
      setSending(null);
    }
  };

  return (
    <AppShell active="/teacher/whatsapp" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="WhatsApp Queue">
        <Badge tone="gold">{drafts.length} Pending</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-4">
        {message && (
          <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-ivory-100/50">Loading drafts...</div>
        ) : drafts.length === 0 ? (
          <Card className="border-gold-500/20">
            <CardContent className="py-16 text-center text-ivory-100/50">
              <MessageSquareText className="size-10 mx-auto mb-3 text-gold-400/30" />
              <p className="font-semibold">No pending WhatsApp messages</p>
              <p className="text-xs mt-1">Messages are generated automatically after test results are uploaded.</p>
            </CardContent>
          </Card>
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} className="border-gold-500/20">
              <CardHeader className="border-b border-gold-500/10 flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white text-base">{draft.student}</CardTitle>
                  <p className="text-xs text-ivory-100/50 mt-0.5">{draft.cadence} · {draft.batchType}</p>
                </div>
                <Badge tone={draft.status === "DRAFT" ? "gold" : "blue"}>{draft.status}</Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <textarea
                  value={draft.draft}
                  onChange={e => handleTextChange(draft.id, e.target.value)}
                  className="w-full h-32 p-3 rounded-lg border border-gold-500/20 bg-navy-900 text-white text-sm resize-none focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
                <button
                  onClick={() => handleSend(draft.id)}
                  disabled={sending === draft.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 transition-colors text-sm"
                >
                  {sending === draft.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Send Message
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
