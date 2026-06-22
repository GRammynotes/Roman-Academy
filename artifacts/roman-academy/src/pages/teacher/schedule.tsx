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

const TEST_TYPES = [
  { value: "WEEKLY_CHAPTER",  label: "Weekly Chapter Test  (≈ 1–2× / week)" },
  { value: "MONTHLY",         label: "Monthly Test  (1× / month)" },
  { value: "QUARTERLY",       label: "Quarterly Full-Length Test  (1× / quarter)" },
  { value: "FULL_LENGTH_MOCK", label: "Full-Length Mock Test" },
  { value: "REVISION_TEST",   label: "Revision Test" },
];

const CHAPTERS: Record<string, { no: number; name: string }[]> = {
  Physics: [
    { no: 1,  name: "Motion in a Plane" },
    { no: 2,  name: "Laws of Motion" },
    { no: 3,  name: "Gravitation" },
    { no: 4,  name: "Thermal Properties of Matter" },
    { no: 5,  name: "Sound" },
    { no: 6,  name: "Optics" },
    { no: 7,  name: "Electrostatics" },
    { no: 8,  name: "Semiconductors" },
  ],
  Chemistry: [
    { no: 1,  name: "Some Basic Concepts of Chemistry" },
    { no: 2,  name: "Structure of Atom" },
    { no: 3,  name: "Chemical Bonding" },
    { no: 4,  name: "Redox Reactions" },
    { no: 5,  name: "Elements of Group 1 and Group 2" },
    { no: 6,  name: "States of Matter: Gaseous and Liquid States" },
    { no: 7,  name: "Adsorption and Colloids" },
    { no: 8,  name: "Hydrocarbons" },
    { no: 9,  name: "Basic Principles of Organic Chemistry" },
    { no: 10, name: "Chemistry in Everyday Life" },
  ],
  Mathematics: [
    { no: 1,  name: "Trigonometry – II" },
    { no: 2,  name: "Straight Line" },
    { no: 3,  name: "Circle" },
    { no: 4,  name: "Measures of Dispersion" },
    { no: 5,  name: "Probability" },
    { no: 6,  name: "Complex Numbers" },
    { no: 7,  name: "Permutations and Combinations" },
    { no: 8,  name: "Functions" },
    { no: 9,  name: "Limits" },
    { no: 10, name: "Continuity" },
  ],
};

const SELECT_CLS = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40";

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("Physics");
  const [form, setForm] = useState({
    batchName: "12th Science 2026",
    testName: "",
    testType: "WEEKLY_CHAPTER",
    chapter: "Ch 1 – Motion in a Plane",
    scheduledDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/teacher/schedule`)
      .then(r => r.json()).then(data => setItems(Array.isArray(data) ? data : [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubjectChange = (s: string) => {
    setSubject(s);
    const first = CHAPTERS[s][0];
    setForm(f => ({ ...f, chapter: `Ch ${first.no} – ${first.name}` }));
  };

  const handleAdd = async () => {
    if (!form.testName || !form.scheduledDate) {
      setMessage("Please fill in Test Name and Date.");
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

  const testTypeBadge = (type: string) => {
    if (type === "WEEKLY_CHAPTER") return "gold";
    if (type === "MONTHLY") return "blue";
    if (type === "QUARTERLY") return "green";
    if (type === "FULL_LENGTH_MOCK") return "purple";
    if (type === "REVISION_TEST") return "red";
    return "neutral";
  };

  const testTypeLabel = (type: string) =>
    TEST_TYPES.find(t => t.value === type)?.label.split("  ")[0] ?? type;

  return (
    <AppShell active="/teacher/schedule" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Test Schedule" />

      <div className="p-4 md:p-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Card className="border-gold-500/20 h-fit">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="size-4 text-gold-400" /> Schedule Test
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <label className="space-y-1 text-sm text-ivory-100/80 block">
              <span className="font-semibold">Test Name</span>
              <input
                type="text"
                value={form.testName}
                onChange={e => setForm(f => ({ ...f, testName: e.target.value }))}
                placeholder="E.g. Physics Weekly Quiz"
                className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40"
              />
            </label>

            <label className="space-y-1 text-sm text-ivory-100/80 block">
              <span className="font-semibold">Date & Time</span>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40"
              />
            </label>

            <label className="space-y-1 text-sm text-ivory-100/80 block">
              <span className="font-semibold">Batch</span>
              <select value={form.batchName} onChange={e => setForm(f => ({ ...f, batchName: e.target.value }))} className={SELECT_CLS}>
                <option>12th Science 2026</option>
                <option>11th Science 2026</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-ivory-100/80 block">
              <span className="font-semibold">Test Type</span>
              <select value={form.testType} onChange={e => setForm(f => ({ ...f, testType: e.target.value }))} className={SELECT_CLS}>
                {TEST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-ivory-100/80">Chapter (Class 11)</p>
              <div className="flex gap-2">
                {Object.keys(CHAPTERS).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSubjectChange(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${subject === s ? "bg-gold-400 text-navy-950" : "bg-navy-900 border border-gold-500/20 text-ivory-100/60 hover:text-white"}`}
                  >
                    {s.slice(0, 4)}
                  </button>
                ))}
              </div>
              <select
                value={form.chapter}
                onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
                className={SELECT_CLS}
              >
                {CHAPTERS[subject].map(ch => (
                  <option key={ch.no} value={`Ch ${ch.no} – ${ch.name}`}>
                    Ch {ch.no} – {ch.name}
                  </option>
                ))}
              </select>
            </div>

            {message && (
              <div className="p-3 rounded-lg bg-navy-900/50 border border-gold-500/20 text-sm text-ivory-100/70">{message}</div>
            )}
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
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
                    <p className="text-xs text-ivory-100/50 mt-0.5">
                      {item.batchName} · {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={testTypeBadge(item.testType) as any}>{testTypeLabel(item.testType)}</Badge>
                    <Badge tone={item.status === "upcoming" ? "gold" : "neutral"}>{item.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
