import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, MessageSquareText, SendHorizonal, ExternalLink, CheckCircle2, X } from "lucide-react";

type Draft = {
  id: string;
  student: string;
  cadence: string;
  status: string;
  draft: string;
  batchType: string;
  createdAt: string;
};

type SendAllLink = { student: string; waLink: string | null };

export default function WhatsAppPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [sentLinks, setSentLinks] = useState<SendAllLink[] | null>(null);

  const BASE = import.meta.env.BASE_URL;

  const fetchDrafts = () => {
    setLoading(true);
    fetch(`${BASE}api/teacher/whatsapp`)
      .then(r => r.json()).then(setDrafts).catch(() => setDrafts([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleTextChange = (id: string, value: string) => {
    setDrafts(d => d.map(item => item.id === id ? { ...item, draft: value } : item));
  };

  const handleSend = async (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;
    setSending(id);
    setMessage(null);
    try {
      const res = await fetch(`${BASE}api/teacher/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, body: draft.draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to send");
      if (data.waLink) window.open(data.waLink, "_blank", "noopener");
      setDrafts(d => d.filter(item => item.id !== id));
      setMessage({ text: `✓ Sent to ${draft.student}`, ok: true });
    } catch {
      setMessage({ text: "Failed to send. Please try again.", ok: false });
    } finally {
      setSending(null);
    }
  };

  const handleSendAll = async () => {
    if (!drafts.length) return;
    setSendingAll(true);
    setMessage(null);
    setSentLinks(null);
    try {
      const res = await fetch(`${BASE}api/teacher/whatsapp/send-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed");
      setDrafts([]);
      setSentLinks(data.links);
      setMessage({ text: `✓ ${data.sent} messages marked sent. Open each link below to send via WhatsApp.`, ok: true });
    } catch {
      setMessage({ text: "Failed to send all. Please try again.", ok: false });
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <AppShell active="/teacher/whatsapp" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="WhatsApp Queue">
        <Badge tone="gold">{drafts.length} Pending</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-4">
        {message && (
          <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
            message.ok
              ? "bg-emerald-900/30 border-emerald-700/40 text-emerald-300"
              : "bg-red-900/30 border-red-700/40 text-red-300"
          }`}>
            {message.ok ? <CheckCircle2 className="size-4 shrink-0 mt-0.5" /> : <X className="size-4 shrink-0 mt-0.5" />}
            {message.text}
          </div>
        )}

        {/* Sent links panel */}
        {sentLinks && sentLinks.length > 0 && (
          <Card className="border-emerald-700/30">
            <CardHeader className="border-b border-emerald-700/20 pb-3">
              <CardTitle className="text-emerald-300 text-base flex items-center gap-2">
                <CheckCircle2 className="size-4" /> All messages sent — open each link to deliver
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid gap-2 sm:grid-cols-2">
              {sentLinks.map((l, i) => (
                l.waLink ? (
                  <a
                    key={i}
                    href={l.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-700/30 bg-emerald-900/10 text-emerald-300 hover:bg-emerald-900/30 transition text-sm font-semibold"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {l.student}
                  </a>
                ) : (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold-500/20 text-ivory-100/40 text-sm">
                    <MessageSquareText className="size-3.5 shrink-0" />
                    {l.student} — no phone
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-ivory-100/50">
            <Loader2 className="size-6 animate-spin mx-auto mb-2" />
            Loading drafts…
          </div>
        ) : drafts.length === 0 ? (
          <Card className="border-gold-500/20">
            <CardContent className="py-16 text-center text-ivory-100/50">
              <MessageSquareText className="size-10 mx-auto mb-3 text-gold-400/30" />
              <p className="font-semibold">No pending WhatsApp messages</p>
              <p className="text-xs mt-1">Messages are generated automatically after test results are uploaded.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Send All bar */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gold-500/25 bg-navy-900/70">
              <div>
                <p className="text-sm font-semibold text-white">{drafts.length} messages ready to send</p>
                <p className="text-xs text-ivory-100/50 mt-0.5">Mark all sent and get WhatsApp links in one click</p>
              </div>
              <button
                onClick={handleSendAll}
                disabled={sendingAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors text-sm shrink-0"
              >
                {sendingAll
                  ? <><Loader2 className="size-4 animate-spin" /> Sending…</>
                  : <><SendHorizonal className="size-4" /> Send All</>
                }
              </button>
            </div>

            {/* Individual drafts */}
            {drafts.map((draft) => (
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
                    className="w-full h-36 p-3 rounded-lg border border-gold-500/20 bg-navy-900 text-white text-sm resize-none focus:ring-2 focus:ring-gold-400 focus:outline-none font-mono"
                  />
                  <button
                    onClick={() => handleSend(draft.id)}
                    disabled={sending === draft.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 transition-colors text-sm"
                  >
                    {sending === draft.id
                      ? <><Loader2 className="size-4 animate-spin" /> Sending…</>
                      : <><Send className="size-4" /> Send &amp; Open WhatsApp</>
                    }
                  </button>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}
