import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, Eye, X } from "lucide-react";

type StudentResult = {
  id: string;
  fullName: string;
  classLevel: string;
  batchType: string;
  stream: string;
  whatsappContact: string | null;
  testResults: Array<{ percentage: number }>;
  ranks: Array<{ rank: number }>;
  user?: { username: string };
};

function StudentProfileDrawer({ student, onClose }: { student: StudentResult; onClose: () => void }) {
  const avgScore = student.testResults?.length
    ? Math.round(student.testResults.reduce((s, r) => s + r.percentage, 0) / student.testResults.length)
    : 0;
  const currentRank = student.ranks?.[0]?.rank || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-950 h-full shadow-2xl flex flex-col border-l border-gold-500/20">
        <div className="flex items-center justify-between p-4 border-b border-gold-500/10">
          <h2 className="text-lg font-semibold text-white">Student Profile</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-ivory-100/60 transition-colors">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-300 border border-gold-400/30">
              <span className="text-2xl font-bold">{student.fullName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{student.fullName}</h3>
              <p className="text-sm text-ivory-100/60">{student.batchType} · {student.stream}</p>
              <p className="text-xs text-ivory-100/40 mt-0.5">@{student.user?.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Average", value: `${avgScore}%` },
              { label: "Rank", value: `#${currentRank}` },
              { label: "Tests", value: String(student.testResults?.length || 0) },
              { label: "Class", value: student.classLevel === "TWELVE" ? "12th" : "11th" },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/50">
                <p className="text-xs text-ivory-100/50 uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          {student.whatsappContact && (
            <div className="p-3 rounded-xl border border-gold-500/15 bg-navy-900/50">
              <p className="text-xs text-ivory-100/50 uppercase font-semibold">WhatsApp</p>
              <p className="text-sm text-white mt-1">{student.whatsappContact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [stream, setStream] = useState("SCIENCE_PCM");
  const [classLevel, setClassLevel] = useState("TWELVE");
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StudentResult | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/admin/students?stream=${stream}&classLevel=${classLevel}`)
      .then(r => r.json()).then(setStudents).catch(() => setStudents([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [stream, classLevel]);

  const filtered = search.trim()
    ? students.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()))
    : students;

  return (
    <AppShell active="/admin/students" role="teacher">
      <PageHeader eyebrow="Admin Portal" title="Student Reports">
        <Badge tone="gold">{filtered.length} Students</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-4">
        <Card className="border-gold-500/20">
          <CardContent className="p-4 grid gap-4 sm:grid-cols-3 items-end">
            <label className="space-y-1 text-sm text-ivory-100/80">
              <span className="font-semibold">Stream</span>
              <select value={stream} onChange={e => setStream(e.target.value)} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                <option value="SCIENCE_PCM">Science (PCM)</option>
              </select>
            </label>
            <label className="space-y-1 text-sm text-ivory-100/80">
              <span className="font-semibold">Class</span>
              <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40">
                <option value="TWELVE">12th Standard</option>
                <option value="ELEVEN">11th Standard</option>
              </select>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ivory-100/40" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 pl-9 pr-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2"><Users className="size-4 text-gold-400" /> Students</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">
                <Users className="size-8 mx-auto mb-2 text-gold-400/30" />
                <p>No students found.</p>
              </div>
            ) : (
              filtered.map(student => {
                const avg = student.testResults?.length
                  ? Math.round(student.testResults.reduce((s, r) => s + r.percentage, 0) / student.testResults.length)
                  : null;
                return (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-gold-500/15 bg-navy-900/50 hover:border-gold-500/30 transition">
                    <div>
                      <p className="font-semibold text-white">{student.fullName}</p>
                      <p className="text-xs text-ivory-100/50 mt-0.5">{student.batchType} · {student.whatsappContact || "No phone"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {avg !== null && <Badge tone={avg >= 75 ? "green" : avg >= 60 ? "gold" : "red"}>{avg}%</Badge>}
                      <button onClick={() => setSelected(student)} className="p-1.5 rounded-lg hover:bg-white/10 text-ivory-100/60 transition-colors">
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {selected && <StudentProfileDrawer student={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}
