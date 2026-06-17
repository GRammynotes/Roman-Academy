import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Save, KeyRound } from "lucide-react";

type Student = {
  id: string;
  fullName: string;
  classLevel: string;
  stream: string;
  batchType: string;
  whatsappContact: string | null;
  username: string | null;
  joinedDate: string;
};

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    fullName: "", studentPhone: "", parentPhone: "", classLevel: "TWELVE", stream: "SCIENCE_PCM", notes: "",
  });

  const batchType = form.classLevel === "ELEVEN"
    ? (form.stream === "COMMERCE_ADDON" ? "11th Commerce 2026" : "11th Science 2026")
    : (form.stream === "COMMERCE_ADDON" ? "12th Commerce 2026" : "12th Science 2026");

  const loadStudents = () => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/teacher/students`)
      .then(r => r.json()).then(setStudents).catch(() => setStudents([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage({ type: "success", text: `Student created! Username: ${data.username}, Password: ${data.password}` });
      setForm({ fullName: "", studentPhone: "", parentPhone: "", classLevel: "TWELVE", stream: "SCIENCE_PCM", notes: "" });
      loadStudents();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell active="/teacher/students" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Manage Students">
        <Badge tone="gold">{students.length} Students</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="flex items-center gap-2 text-white"><Plus className="size-4 text-gold-400" /> Add Student</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: "Full Name", key: "fullName", type: "text" },
                { label: "Student Phone", key: "studentPhone", type: "tel" },
                { label: "Parent Phone", key: "parentPhone", type: "tel" },
              ].map(({ label, key, type }) => (
                <label key={key} className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">{label}</span>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40"
                    placeholder={label}
                  />
                </label>
              ))}
              <label className="space-y-1 text-sm text-ivory-100/80">
                <span className="font-semibold">Stream</span>
                <select value={form.stream} onChange={e => setForm(f => ({ ...f, stream: e.target.value }))} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                  <option value="SCIENCE_PCM">Science (PCM)</option>
                  <option value="COMMERCE_ADDON">Commerce</option>
                  <option value="NEET_ADDON">NEET</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-ivory-100/80">
                <span className="font-semibold">Class</span>
                <select value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                  <option value="TWELVE">12th Standard</option>
                  <option value="ELEVEN">11th Standard</option>
                </select>
              </label>
            </div>
            <div className="rounded-lg border border-gold-500/20 bg-gold-400/10 p-3 text-sm text-gold-300">
              Auto batch: <strong>{batchType}</strong>
            </div>
            <label className="space-y-1 text-sm text-ivory-100/80">
              <span className="font-semibold">Notes</span>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="min-h-20 w-full resize-none rounded-lg border border-gold-500/25 bg-navy-900 px-3 py-2 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40" placeholder="Optional notes" />
            </label>
            {message && (
              <div className={`p-3 rounded-lg text-sm border ${message.type === "success" ? "bg-emerald-900/30 border-emerald-700/40 text-emerald-300" : "bg-red-900/30 border-red-700/40 text-red-300"}`}>
                {message.text}
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Save Student</>}
            </button>
          </CardContent>
        </Card>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Current Students</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">No students yet. Add your first student!</div>
            ) : (
              students.map((student) => (
                <div key={student.id} className="flex flex-col gap-2 rounded-xl border border-gold-500/15 bg-navy-900/50 p-3 md:flex-row md:items-center md:justify-between hover:border-gold-500/30 transition">
                  <div>
                    <p className="font-semibold text-white">{student.fullName}</p>
                    <p className="text-xs text-ivory-100/50">@{student.username} · {student.whatsappContact || "No phone"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">{student.classLevel === "TWELVE" ? "12th" : "11th"}</Badge>
                    <Badge tone="gold">{student.batchType}</Badge>
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
