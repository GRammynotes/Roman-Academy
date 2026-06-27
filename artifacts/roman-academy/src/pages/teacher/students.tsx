import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Save, Search, User, TrendingUp, BookOpen, Phone, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

type Student = {
  id: string;
  fullName: string;
  classLevel: string;
  stream: string;
  batchType: string;
  whatsappContact: string | null;
  parentContact: string | null;
  username: string | null;
  joinedDate: string;
  isDemo: boolean | null;
};

type Analytics = {
  student: Student;
  rank: number | null;
  average: number;
  lastTestPct: number | null;
  completedChapters: number;
  totalChapters: number;
  syllabusProgress: number;
  results: Array<{
    id: string;
    testName: string;
    testType: string;
    date: string;
    percentage: number;
    rank: number | null;
    totalScored: number;
    totalMarks: number;
  }>;
  chapters: Array<{ chapterName: string; status: string }>;
};

const INPUT_CLS = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40";
const SELECT_CLS = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40";

function whatsappLink(phone: string | null, message: string) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, Analytics>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "", studentPhone: "", parentPhone: "", classLevel: "TWELVE", stream: "SCIENCE_PCM", notes: "",
  });

  const batchType = form.classLevel === "ELEVEN"
    ? (form.stream === "COMMERCE_ADDON" ? "11th Commerce 2026" : "11th Science 2026")
    : (form.stream === "COMMERCE_ADDON" ? "12th Commerce 2026" : "12th Science 2026");

  const loadStudents = (q = "", batch = "all") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (batch !== "all") params.set("batch", batch);
    fetch(`${import.meta.env.BASE_URL}api/teacher/students?${params}`)
      .then(r => r.json()).then(setStudents).catch(() => setStudents([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  useEffect(() => {
    const t = setTimeout(() => loadStudents(searchQ, batchFilter), 300);
    return () => clearTimeout(t);
  }, [searchQ, batchFilter]);

  const loadAnalytics = async (id: string) => {
    if (analytics[id]) { setExpanded(expanded === id ? null : id); return; }
    setLoadingAnalytics(id);
    setExpanded(id);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/students/${id}/analytics`);
      const data = await res.json();
      setAnalytics(prev => ({ ...prev, [id]: data }));
    } catch {
    } finally {
      setLoadingAnalytics(null);
    }
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setMessage({ type: "error", text: "Full name is required" }); return; }
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
      setMessage({ type: "success", text: `Created! Username: ${data.username} · Password: ${data.password}` });
      setForm({ fullName: "", studentPhone: "", parentPhone: "", classLevel: "TWELVE", stream: "SCIENCE_PCM", notes: "" });
      loadStudents(searchQ, batchFilter);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const filtered = students;
  const batches = ["all", "12th Science 2026", "11th Science 2026"];

  return (
    <AppShell active="/teacher/students" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Manage Students">
        <Badge tone="gold">{filtered.length} Students</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Add student form */}
        <div className="space-y-4">
          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="flex items-center gap-2 text-white"><Plus className="size-4 text-gold-400" /> Add Student</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Full Name *", key: "fullName", type: "text" },
                { label: "Student WhatsApp", key: "studentPhone", type: "tel" },
                { label: "Parent WhatsApp", key: "parentPhone", type: "tel" },
              ].map(({ label, key, type }) => (
                <label key={key} className="block space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">{label}</span>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={INPUT_CLS}
                    placeholder={label.replace(" *", "")}
                  />
                </label>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Class</span>
                  <select value={form.classLevel} onChange={e => setForm(f => ({ ...f, classLevel: e.target.value }))} className={SELECT_CLS}>
                    <option value="TWELVE">12th Standard</option>
                    <option value="ELEVEN">11th Standard</option>
                  </select>
                </label>
                <label className="block space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Stream</span>
                  <select value={form.stream} onChange={e => setForm(f => ({ ...f, stream: e.target.value }))} className={SELECT_CLS}>
                    <option value="SCIENCE_PCM">Science PCM</option>
                    <option value="NEET_ADDON">NEET</option>
                    <option value="COMMERCE_ADDON">Commerce</option>
                  </select>
                </label>
              </div>
              <div className="rounded-lg border border-gold-500/20 bg-gold-400/10 p-2.5 text-xs text-gold-300">
                Auto batch: <strong>{batchType}</strong>
              </div>
              <label className="block space-y-1 text-sm text-ivory-100/80">
                <span className="font-semibold">Notes</span>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="min-h-16 w-full resize-none rounded-lg border border-gold-500/25 bg-navy-900 px-3 py-2 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40" placeholder="Optional notes" />
              </label>
              {message && (
                <div className={`p-3 rounded-lg text-sm border ${message.type === "success" ? "bg-emerald-900/30 border-emerald-700/40 text-emerald-300" : "bg-red-900/30 border-red-700/40 text-red-300"}`}>
                  {message.text}
                </div>
              )}
              <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Add Student</>}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Student list with analytics */}
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory-100/40" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by name..."
                className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 pl-9 pr-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40"
              />
            </div>
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="h-10 rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
              {batches.map(b => <option key={b} value={b}>{b === "all" ? "All Batches" : b}</option>)}
            </select>
          </div>

          {/* Student Cards */}
          {loading ? (
            <div className="text-center py-12 text-ivory-100/50">
              <Loader2 className="size-6 mx-auto animate-spin mb-2" />
              Loading students...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-ivory-100/40">
              <User className="size-8 mx-auto mb-2 opacity-30" />
              No students found.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((student) => {
                const isOpen = expanded === student.id;
                const an = analytics[student.id];
                const waLink = whatsappLink(student.whatsappContact, `Hi ${student.fullName.split(" ")[0]}, this is a message from Roman Academy.`);

                return (
                  <Card key={student.id} className={`border-gold-500/20 transition-all ${isOpen ? "ring-1 ring-gold-400/30" : ""}`}>
                    <CardContent className="p-0">
                      {/* Header row */}
                      <button
                        onClick={() => loadAnalytics(student.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors rounded-t-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gold-400/20 flex items-center justify-center font-bold text-gold-400 text-sm shrink-0">
                            {student.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                              {student.fullName}
                              {student.isDemo && <span className="text-xs bg-purple-700/40 text-purple-300 border border-purple-500/30 rounded px-1.5 py-0.5">Demo</span>}
                            </p>
                            <p className="text-xs text-ivory-100/50">@{student.username} · {student.whatsappContact || "No phone"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex gap-2">
                            <Badge tone="blue">{student.classLevel === "TWELVE" ? "12th" : "11th"}</Badge>
                            <Badge tone="gold">{student.batchType}</Badge>
                          </div>
                          {isOpen ? <ChevronUp className="size-4 text-ivory-100/40" /> : <ChevronDown className="size-4 text-ivory-100/40" />}
                        </div>
                      </button>

                      {/* Expanded Analytics */}
                      {isOpen && (
                        <div className="border-t border-gold-500/10 p-4 space-y-4">
                          {loadingAnalytics === student.id ? (
                            <div className="text-center py-6 text-ivory-100/50">
                              <Loader2 className="size-5 mx-auto animate-spin mb-2" />
                              Loading analytics...
                            </div>
                          ) : an ? (
                            <>
                              {/* KPI row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { label: "Rank", value: an.rank ? `#${an.rank}` : "—", icon: TrendingUp },
                                  { label: "Average", value: `${an.average}%`, icon: TrendingUp },
                                  { label: "Last Test", value: an.lastTestPct !== null ? `${an.lastTestPct}%` : "—", icon: BookOpen },
                                  { label: "Syllabus", value: `${an.syllabusProgress}%`, icon: BookOpen },
                                ].map(({ label, value, icon: Icon }) => (
                                  <div key={label} className="rounded-lg border border-gold-500/15 bg-navy-900/60 p-3 text-center">
                                    <p className="text-xs text-ivory-100/50 mb-1">{label}</p>
                                    <p className="text-lg font-bold text-gold-300">{value}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Test history */}
                              {an.results.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">Test History</p>
                                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {an.results.slice().reverse().map(r => (
                                      <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-navy-900/50 text-xs">
                                        <div>
                                          <span className="font-medium text-white">{r.testName}</span>
                                          <span className="text-ivory-100/40 ml-2">{r.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {r.rank && <span className="text-ivory-100/50">Rank #{r.rank}</span>}
                                          <span className={`font-bold ${r.percentage >= 75 ? "text-emerald-400" : r.percentage >= 60 ? "text-amber-400" : "text-red-400"}`}>
                                            {Math.round(r.percentage)}%
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Chapter progress */}
                              {an.chapters.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                                    Chapters — {an.completedChapters}/{an.totalChapters} completed
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {an.chapters.map((ch, i) => (
                                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${
                                        ch.status === "COMPLETED" ? "bg-emerald-900/30 border-emerald-700/40 text-emerald-300"
                                        : ch.status === "ONGOING" ? "bg-amber-900/30 border-amber-700/40 text-amber-300"
                                        : "border-gold-500/20 text-ivory-100/40"
                                      }`}>
                                        {ch.chapterName}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* WhatsApp quick action */}
                              <div className="flex gap-2">
                                {waLink ? (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-green-600/40 bg-green-900/20 text-green-400 hover:bg-green-900/40 transition-colors"
                                  >
                                    <Phone className="size-3" /> WhatsApp Student
                                  </a>
                                ) : (
                                  <span className="text-xs text-ivory-100/30 flex items-center gap-1"><AlertCircle className="size-3" /> No phone on file</span>
                                )}
                                {student.parentContact && (
                                  <a
                                    href={`https://wa.me/${student.parentContact.replace(/\D/g, "")}?text=${encodeURIComponent(`Dear Parent, greetings from Roman Academy regarding ${student.fullName}.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-green-600/40 bg-green-900/20 text-green-400 hover:bg-green-900/40 transition-colors"
                                  >
                                    <Phone className="size-3" /> WhatsApp Parent
                                  </a>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-xs text-ivory-100/40 py-4">Failed to load analytics</div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
