import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Plus, Loader2 } from "lucide-react";

type ScheduleItem = {
  id: string;
  testName: string;
  testType: string;
  date: string;
  batchName: string;
  status: string;
};

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ batchName: "12th Science 2026", testName: "", testType: "WEEKLY_CHAPTER", scheduledDate: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/teacher/schedule`)
      .then(r => r.json()).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.testName || !form.scheduledDate) {
      setMessage("Please fill in all fields.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Test scheduled successfully.");
      setForm(f => ({ ...f, testName: "", scheduledDate: "" }));
      load();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell active="/teacher/schedule" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Test Schedule" />

      <div className="p-4 md:p-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Card className="border-gold-500/20 h-fit">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2"><Plus className="size-4 text-gold-400" /> Schedule Test</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { label: "Test Name", key: "testName", type: "text", placeholder: "E.g. Physics Weekly Quiz" },
              { label: "Date", key: "scheduledDate", type: "datetime-local", placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <label key={key} className="space-y-1 text-sm text-ivory-100/80 block">
                <span className="font-semibold">{label}</span>
                <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                  className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40" />
              </label>
            ))}
            <label className="space-y-1 text-sm text-ivory-100/80 block">
              <span className="font-semibold">Batch</span>
              <select value={form.batchName} onChange={e => setForm(f => ({ ...f, batchName: e.target.value }))} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                <option>12th Science 2026</option>
                <option>11th Science 2026</option>
                <option>12th Commerce 2026</option>
              </select>
            </label>
            <label className="space-y-1 text-sm text-ivory-100/80 block">
              <span className="font-semibold">Test Type</span>
              <select value={form.testType} onChange={e => setForm(f => ({ ...f, testType: e.target.value }))} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                <option value="WEEKLY_CHAPTER">Weekly Chapter</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="FULL_LENGTH_MOCK">Full Length Mock</option>
              </select>
            </label>
            {message && <div className="p-3 rounded-lg bg-navy-900/50 border border-gold-500/20 text-sm text-ivory-100/70">{message}</div>}
            <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <><CalendarDays className="size-4" /> Schedule Test</>}
            </button>
          </CardContent>
        </Card>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Scheduled Tests</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading schedule...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">
                <CalendarDays className="size-8 mx-auto mb-2 text-gold-400/30" />
                <p>No tests scheduled yet.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gold-500/15 bg-navy-900/50 hover:border-gold-500/30 transition">
                  <div>
                    <p className="font-semibold text-white">{item.testName}</p>
                    <p className="text-xs text-ivory-100/50 mt-0.5">{item.batchName} · {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <Badge tone={item.status === "upcoming" ? "gold" : "neutral"}>{item.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
